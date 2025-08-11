"""
Production-ready FastAPI application with all optimizations
"""
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ValidationError
from typing import Dict, List, Optional, Any

# Import optimized modules
from .config import settings, is_production
from .middleware import setup_middleware
from .database_optimized import init_optimized_db, cleanup_expired_sessions
from .auth import (
    authenticate_user, create_session, get_current_user, 
    hash_password, validate_password_strength, logout_session
)
from .health import router as health_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(settings.LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str
    user_type: Optional[str] = "mezun"

class GraduateRegistration(BaseModel):
    firstName: str
    lastName: str
    email: str
    password: str
    upschoolProgram: str
    graduationDate: Optional[str] = ""
    experienceLevel: str = "entry"
    location: Optional[str] = ""
    skills: List[str] = []

class ProfileUpdateRequest(BaseModel):
    firstName: str
    lastName: str
    phone: str = ""
    upschoolProgram: str
    graduationDate: str = ""
    skills: List[str] = []
    experience: str = "entry"
    location: str = ""
    portfolioUrl: str = ""
    githubUrl: str = ""
    linkedinUrl: str = ""
    aboutMe: str = ""

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Background tasks
async def cleanup_task():
    """Background cleanup task"""
    while True:
        try:
            cleanup_expired_sessions()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Cleanup task error: {e}")
            await asyncio.sleep(300)  # Retry in 5 minutes

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    logger.info("🚀 Starting Up Hera API...")
    
    # Initialize database
    init_optimized_db()
    
    # Start background tasks
    cleanup_task_handle = asyncio.create_task(cleanup_task())
    
    logger.info("✅ Up Hera API started successfully!")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down Up Hera API...")
    cleanup_task_handle.cancel()
    logger.info("✅ Up Hera API shutdown complete!")

# Create FastAPI app
app = FastAPI(
    title="Up Hera API",
    description="Production-ready UpSchool placement platform API",
    version="3.0",
    lifespan=lifespan,
    docs_url="/docs" if not is_production() else None,
    redoc_url="/redoc" if not is_production() else None
)

# Setup middleware
setup_middleware(app)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include health check router
app.include_router(health_router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Up Hera API v3.0",
        "status": "running",
        "database": "SQLite (Optimized)",
        "environment": "production" if is_production() else "development",
        "documentation": "/docs" if not is_production() else "disabled"
    }

# Enhanced error handler
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors"""
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation error",
            "message": "Please check your input data",
            "details": exc.errors()
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "Request failed",
            "message": exc.detail,
            "status_code": exc.status_code
        }
    )

# Authentication endpoints
@app.post("/api/auth/login")
async def login(request: LoginRequest, req: Request):
    """Enhanced login with session management"""
    try:
        email = request.email.lower().strip()
        password = request.password
        
        logger.info(f"🔐 Login attempt: {email}")
        
        # Authenticate user
        user = authenticate_user(email, password)
        
        if not user:
            logger.warning(f"❌ Login failed: {email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Create session
        client_ip = req.client.host if req.client else None
        user_agent = req.headers.get("user-agent")
        
        session_data = create_session(user["id"], client_ip, user_agent)
        
        logger.info(f"✅ Login successful: {user['firstName']} {user['lastName']} ({email})")
        
        return {
            "success": True,
            "message": f"Welcome back {user['firstName']} {user['lastName']}!",
            "user": {
                "id": user["id"],
                "name": f"{user['firstName']} {user['lastName']}",
                "email": user["email"],
                "program": user["upschoolProgram"],
                "user_type": user["userType"]
            },
            **session_data,
            "redirect_url": "/dashboard"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed due to server error")

@app.post("/api/auth/logout")
async def logout(current_user: Dict = Depends(get_current_user), req: Request = None):
    """Enhanced logout"""
    try:
        # Get token from header
        auth_header = req.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            logout_session(token)
        
        logger.info(f"👋 User logged out: {current_user['email']}")
        
        return {
            "success": True,
            "message": "Successfully logged out"
        }
        
    except Exception as e:
        logger.error(f"❌ Logout error: {str(e)}")
        raise HTTPException(status_code=500, detail="Logout failed")

@app.post("/api/auth/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """Refresh access token"""
    from .auth import refresh_access_token
    
    try:
        new_tokens = refresh_access_token(request.refresh_token)
        
        if not new_tokens:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        
        return {
            "success": True,
            **new_tokens
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Token refresh error: {str(e)}")
        raise HTTPException(status_code=500, detail="Token refresh failed")

@app.post("/api/auth/graduate/register")
async def register_graduate(graduate: GraduateRegistration):
    """Enhanced graduate registration"""
    try:
        # Validate password strength
        password_check = validate_password_strength(graduate.password)
        if not password_check["valid"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Weak password",
                    "message": "Password does not meet security requirements",
                    "requirements": password_check["errors"]
                }
            )
        
        # Check if user already exists
        from .database_optimized import get_user_by_email_optimized
        existing_user = get_user_by_email_optimized(graduate.email)
        
        if existing_user:
            raise HTTPException(
                status_code=409,
                detail="User with this email already exists"
            )
        
        # Create user
        from .database_optimized import create_user_optimized
        
        user_data = {
            "email": graduate.email,
            "password_hash": hash_password(graduate.password),
            "firstName": graduate.firstName,
            "lastName": graduate.lastName,
            "upschoolProgram": graduate.upschoolProgram,
            "graduationDate": graduate.graduationDate,
            "experienceLevel": graduate.experienceLevel,
            "location": graduate.location,
            "skills": graduate.skills,
            "userType": "mezun"
        }
        
        user_id = create_user_optimized(user_data)
        
        logger.info(f"✅ New graduate registered: {graduate.firstName} {graduate.lastName} ({graduate.email})")
        
        return {
            "success": True,
            "message": f"Welcome to Up Hera {graduate.firstName}! Your account has been created successfully.",
            "user": {
                "id": user_id,
                "name": f"{graduate.firstName} {graduate.lastName}",
                "email": graduate.email,
                "program": graduate.upschoolProgram
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed due to server error")

@app.get("/api/auth/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """Get enhanced user profile"""
    try:
        from .database_optimized import execute_query
        
        # Get full user data
        query = '''
            SELECT id, email, first_name, last_name, user_type, phone,
                   upschool_program, graduation_date, experience_level,
                   location, portfolio_url, github_url, linkedin_url,
                   about_me, skills, created_at, updated_at
            FROM users WHERE id = ? AND is_active = 1
        '''
        
        user_data = execute_query(query, (current_user["id"],), fetch_one=True)
        
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        import json
        
        return {
            "success": True,
            "user": {
                "id": user_data["id"],
                "email": user_data["email"],
                "firstName": user_data["first_name"],
                "lastName": user_data["last_name"],
                "userType": user_data["user_type"],
                "phone": user_data["phone"],
                "upschoolProgram": user_data["upschool_program"],
                "graduationDate": user_data["graduation_date"],
                "experienceLevel": user_data["experience_level"],
                "location": user_data["location"],
                "portfolioUrl": user_data["portfolio_url"],
                "githubUrl": user_data["github_url"],
                "linkedinUrl": user_data["linkedin_url"],
                "aboutMe": user_data["about_me"],
                "skills": json.loads(user_data["skills"]) if user_data["skills"] else [],
                "createdAt": user_data["created_at"],
                "updatedAt": user_data["updated_at"]
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")

@app.put("/api/auth/profile")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Enhanced profile update"""
    try:
        from .database_optimized import execute_query
        import json
        
        # Update user profile
        query = '''
            UPDATE users SET
                first_name = ?, last_name = ?, phone = ?, upschool_program = ?,
                graduation_date = ?, experience_level = ?, location = ?,
                portfolio_url = ?, github_url = ?, linkedin_url = ?, about_me = ?,
                skills = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = 1
        '''
        
        params = (
            profile_data.firstName, profile_data.lastName, profile_data.phone,
            profile_data.upschoolProgram, profile_data.graduationDate,
            profile_data.experience, profile_data.location,
            profile_data.portfolioUrl, profile_data.githubUrl,
            profile_data.linkedinUrl, profile_data.aboutMe,
            json.dumps(profile_data.skills), current_user["id"]
        )
        
        rows_affected = execute_query(query, params)
        
        if rows_affected == 0:
            raise HTTPException(status_code=404, detail="User not found or no changes made")
        
        # Get updated user data
        updated_user = execute_query(
            "SELECT * FROM users WHERE id = ?", 
            (current_user["id"],), 
            fetch_one=True
        )
        
        logger.info(f"✅ Profile updated: {current_user['email']}")
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": updated_user["id"],
                "firstName": updated_user["first_name"],
                "lastName": updated_user["last_name"],
                "email": updated_user["email"],
                "phone": updated_user["phone"],
                "upschoolProgram": updated_user["upschool_program"],
                "graduationDate": updated_user["graduation_date"],
                "experienceLevel": updated_user["experience_level"],
                "location": updated_user["location"],
                "portfolioUrl": updated_user["portfolio_url"],
                "githubUrl": updated_user["github_url"],
                "linkedinUrl": updated_user["linkedin_url"],
                "aboutMe": updated_user["about_me"],
                "skills": json.loads(updated_user["skills"]) if updated_user["skills"] else []
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile update error: {str(e)}")
        raise HTTPException(status_code=500, detail="Profile update failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main_optimized:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD and not is_production(),
        log_level=settings.LOG_LEVEL.lower()
    )
