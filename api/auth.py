"""
Enhanced authentication and authorization system
"""
import jwt
import hashlib
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

from .config import settings
from .database_optimized import (
    get_user_by_email_optimized,
    execute_query,
    audit_log
)

logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Security
security = HTTPBearer(auto_error=False)

class AuthError(HTTPException):
    """Custom authentication error"""
    def __init__(self, message: str = "Authentication required"):
        super().__init__(status_code=401, detail=message)

class PermissionError(HTTPException):
    """Custom permission error"""
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(status_code=403, detail=message)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire, "type": "access"})
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)  # Refresh tokens last 30 days
    
    to_encode.update({"exp": expire, "type": "refresh"})
    
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        # Check token type
        if payload.get("type") != token_type:
            raise AuthError("Invalid token type")
        
        # Check expiration
        if datetime.utcnow() > datetime.fromtimestamp(payload.get("exp", 0)):
            raise AuthError("Token has expired")
        
        return payload
        
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise AuthError("Invalid token")

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user with email and password"""
    user = get_user_by_email_optimized(email)
    
    if not user:
        logger.warning(f"Authentication failed: User not found - {email}")
        return None
    
    if not user.get("isActive", True):
        logger.warning(f"Authentication failed: User inactive - {email}")
        return None
    
    if not verify_password(password, user["password_hash"]):
        logger.warning(f"Authentication failed: Invalid password - {email}")
        return None
    
    logger.info(f"✅ Authentication successful - {email}")
    return user

def create_session(user_id: str, ip_address: str = None, user_agent: str = None) -> Dict[str, str]:
    """Create user session with access and refresh tokens"""
    
    # Create session ID
    session_id = secrets.token_urlsafe(32)
    
    # Create tokens
    token_data = {
        "sub": user_id,
        "session_id": session_id,
        "iat": datetime.utcnow()
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Store session in database
    expires_at = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    query = '''
        INSERT INTO user_sessions (
            id, user_id, token, refresh_token, ip_address, user_agent, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    '''
    
    params = (
        session_id,
        user_id,
        access_token,
        refresh_token,
        ip_address,
        user_agent,
        expires_at
    )
    
    execute_query(query, params)
    
    # Log session creation
    audit_log("session_created", "sessions", session_id, None, {"user_id": user_id}, user_id, ip_address)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600
    }

def validate_session(token: str) -> Optional[Dict[str, Any]]:
    """Validate session token and return user data"""
    try:
        # Decode token
        payload = verify_token(token)
        user_id = payload.get("sub")
        session_id = payload.get("session_id")
        
        if not user_id or not session_id:
            return None
        
        # Check session in database
        query = '''
            SELECT s.*, u.id, u.email, u.first_name, u.last_name, u.user_type, u.is_active
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > CURRENT_TIMESTAMP
        '''
        
        session = execute_query(query, (token,), fetch_one=True)
        
        if not session:
            logger.warning(f"Session not found or expired: {session_id}")
            return None
        
        if not session["is_active"]:
            logger.warning(f"User inactive: {user_id}")
            return None
        
        # Update last used timestamp
        update_query = '''
            UPDATE user_sessions 
            SET last_used_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        '''
        execute_query(update_query, (session_id,))
        
        return {
            "id": session["id"],
            "email": session["email"],
            "firstName": session["first_name"],
            "lastName": session["last_name"],
            "userType": session["user_type"],
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"Session validation error: {e}")
        return None

async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    
    if not credentials:
        raise AuthError("Missing authorization header")
    
    token = credentials.credentials
    user = validate_session(token)
    
    if not user:
        raise AuthError("Invalid or expired token")
    
    # Add request info to user object
    user["ip_address"] = request.client.host if request.client else None
    
    return user

async def get_current_admin_user(current_user: Dict = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency to get current admin user"""
    
    if current_user.get("userType") != "admin":
        raise PermissionError("Admin access required")
    
    return current_user

def logout_session(token: str) -> bool:
    """Logout user session"""
    try:
        payload = verify_token(token)
        session_id = payload.get("session_id")
        user_id = payload.get("sub")
        
        if session_id:
            query = '''
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE id = ?
            '''
            execute_query(query, (session_id,))
            
            # Log logout
            audit_log("session_logout", "sessions", session_id, None, {"user_id": user_id}, user_id)
            
            return True
            
    except Exception as e:
        logger.error(f"Logout error: {e}")
    
    return False

def logout_all_sessions(user_id: str) -> int:
    """Logout all sessions for a user"""
    query = '''
        UPDATE user_sessions 
        SET is_active = 0 
        WHERE user_id = ? AND is_active = 1
    '''
    
    count = execute_query(query, (user_id,))
    
    # Log logout all
    audit_log("session_logout_all", "sessions", user_id, None, {"user_id": user_id}, user_id)
    
    return count

def refresh_access_token(refresh_token: str) -> Optional[Dict[str, str]]:
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token, "refresh")
        user_id = payload.get("sub")
        session_id = payload.get("session_id")
        
        if not user_id or not session_id:
            return None
        
        # Check if refresh token exists and is valid
        query = '''
            SELECT user_id FROM user_sessions 
            WHERE refresh_token = ? AND is_active = 1
        '''
        
        session = execute_query(query, (refresh_token,), fetch_one=True)
        
        if not session:
            return None
        
        # Create new access token
        token_data = {
            "sub": user_id,
            "session_id": session_id,
            "iat": datetime.utcnow()
        }
        
        new_access_token = create_access_token(token_data)
        
        # Update session with new token
        update_query = '''
            UPDATE user_sessions 
            SET token = ?, last_used_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        '''
        execute_query(update_query, (new_access_token, session_id))
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600
        }
        
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        return None

# Password policy validation
def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one digit")
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Password must contain at least one special character")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "strength": "weak" if len(errors) > 2 else "medium" if len(errors) > 0 else "strong"
    }
