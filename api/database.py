"""
Database setup for Up Hera
SQLite database with proper user management
"""

import sqlite3
import os
import hashlib
import uuid
import threading
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from sqlalchemy import create_engine
from api.config import settings

# Database file path
# Vercel Serverless ortamında sadece /tmp yazılabilir.
# Kalıcı DB kullanmıyorsanız en azından /tmp altında çalışalım (ephemeral).
DB_PATH = os.getenv("DB_PATH", "/tmp/uphera.db")

# Database lock for thread safety
_db_lock = threading.Lock()

# Database configuration - Vercel için basitleştirildi
DATABASE_URL = settings.DATABASE_URL

def get_db_connection():
    """Get database connection with proper settings"""
    # Ensure directory exists (especially for /tmp)
    try:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    except Exception:
        pass

    conn = sqlite3.connect(DB_PATH, timeout=60.0, check_same_thread=False)
    cursor = conn.cursor()
    
    # Performance optimizations
    cursor.execute('PRAGMA journal_mode=WAL')
    cursor.execute('PRAGMA synchronous=NORMAL')
    cursor.execute('PRAGMA cache_size=1000')
    cursor.execute('PRAGMA temp_store=memory')
    cursor.execute('PRAGMA busy_timeout=30000')
    
    return conn, cursor

def init_db():
    """Initialize database tables"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                user_type TEXT DEFAULT 'mezun',
                phone TEXT,
                upschool_program TEXT,
                graduation_date TEXT,
                experience_level TEXT DEFAULT 'entry',
                location TEXT,
                portfolio_url TEXT,
                github_url TEXT,
                linkedin_url TEXT,
                about_me TEXT,
                skills TEXT, -- JSON string
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Add user_type column if it doesn't exist
        try:
            cursor.execute('ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT "mezun"')
        except sqlite3.OperationalError:
            pass  # Column already exists
        

        
        # Jobs table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                company_logo TEXT,
                location TEXT,
                description TEXT,
                requirements TEXT, -- JSON string
                salary_min INTEGER,
                salary_max INTEGER,
                job_type TEXT, -- full-time, part-time, contract
                experience_level TEXT DEFAULT 'entry',
                skills TEXT, -- JSON array
                benefits TEXT, -- JSON array
                remote_friendly BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                application_deadline TIMESTAMP,
                views INTEGER DEFAULT 0,
                applications_count INTEGER DEFAULT 0
            )
        ''')
        
        # Applications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                job_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending', -- pending, reviewed, interviewed, hired, rejected
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (job_id) REFERENCES jobs (id)
            )
        ''')
        
        # User sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create indexes for better performance (after tables are created)
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id)')
        
        # Clean up expired sessions periodically
        cursor.execute('DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email address"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT id, email, first_name, last_name, upschool_program,
                   phone, graduation_date, experience_level, location,
                   portfolio_url, github_url, linkedin_url, about_me, skills, user_type
            FROM users WHERE email = ?
        ''', (email.lower().strip(),))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "id": user[0],
                "email": user[1],
                "firstName": user[2],
                "lastName": user[3],
                "upschoolProgram": user[4],
                "phone": user[5],
                "graduationDate": user[6],
                "experienceLevel": user[7],
                "location": user[8],
                "portfolioUrl": user[9],
                "githubUrl": user[10],
                "linkedinUrl": user[11],
                "aboutMe": user[12],
                "skills": json.loads(user[13]) if user[13] else [],
                "userType": user[14] if len(user) > 14 else "mezun"
            }
        
        return None

def create_user(user_data: Dict[str, Any]) -> str:
    """Create a new user"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        user_id = str(uuid.uuid4())
        password_hash = hash_password(user_data['password'])
        
        cursor.execute('''
                INSERT INTO users (
                    id, email, password_hash, first_name, last_name, phone,
                    upschool_program, graduation_date, experience_level, location,
                    portfolio_url, github_url, linkedin_url, about_me, skills, user_type
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id,
                user_data['email'].lower().strip(),
                password_hash,
                user_data['firstName'],
                user_data['lastName'],
                user_data.get('phone', ''),
                user_data['upschoolProgram'],
                user_data.get('graduationDate', ''),
                user_data.get('experienceLevel', 'entry'),
                user_data.get('location', ''),
                user_data.get('portfolioUrl', ''),
                user_data.get('githubUrl', ''),
                user_data.get('linkedinUrl', ''),
                user_data.get('aboutMe', ''),
                json.dumps(user_data.get('skills', [])),
                user_data.get('userType', 'mezun')
            ))
        
        conn.commit()
        conn.close()
        
        return user_id

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return user data"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT id, email, password_hash, first_name, last_name, upschool_program,
                   phone, graduation_date, experience_level, location, skills, user_type
            FROM users WHERE email = ?
        ''', (email.lower().strip(),))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and verify_password(password, user[2]):
            return {
                "id": user[0],
                "email": user[1],
                "firstName": user[3],
                "lastName": user[4],
                "upschoolProgram": user[5],
                "phone": user[6],
                "graduationDate": user[7],
                "experienceLevel": user[8],
                "location": user[9],
                "skills": json.loads(user[10]) if user[10] else [],
                "userType": user[11] if len(user) > 11 else "mezun"
            }
        
        return None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT id, email, first_name, last_name, upschool_program,
                   phone, graduation_date, experience_level, location,
                   portfolio_url, github_url, linkedin_url, about_me, skills
            FROM users WHERE id = ?
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "id": user[0],
                "email": user[1],
                "firstName": user[2],
                "lastName": user[3],
                "upschoolProgram": user[4],
                "phone": user[5],
                "graduationDate": user[6],
                "experienceLevel": user[7],
                "location": user[8],
                "portfolioUrl": user[9],
                "githubUrl": user[10],
                "linkedinUrl": user[11],
                "aboutMe": user[12],
                "skills": json.loads(user[13]) if user[13] else []
            }
        
        return None

def update_user(user_id: str, user_data: Dict[str, Any]) -> bool:
    """Update user profile"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        try:
            cursor.execute('''
                UPDATE users SET
                    first_name = ?, last_name = ?, phone = ?, upschool_program = ?,
                    graduation_date = ?, experience_level = ?, location = ?,
                    portfolio_url = ?, github_url = ?, linkedin_url = ?, about_me = ?,
                    skills = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (
                user_data.get('firstName', ''), user_data.get('lastName', ''),
                user_data.get('phone', ''), user_data.get('upschoolProgram', ''),
                user_data.get('graduationDate', ''), user_data.get('experienceLevel', 'entry'),
                user_data.get('location', ''), user_data.get('portfolioUrl', ''),
                user_data.get('githubUrl', ''), user_data.get('linkedinUrl', ''),
                user_data.get('aboutMe', ''), json.dumps(user_data.get('skills', [])),
                user_id
            ))
            
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error updating user: {e}")
            conn.close()
            return False

def create_session(user_id: str) -> str:
    """Create user session and return token"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        session_id = str(uuid.uuid4())
        token = str(uuid.uuid4())
        expires_at = datetime.now() + timedelta(hours=24)
        
        cursor.execute('''
            INSERT INTO user_sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (session_id, user_id, token, expires_at))
        
        conn.commit()
        conn.close()
        
        return token

def validate_session(token: str) -> Optional[Dict[str, Any]]:
    """Validate session token and return user data"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT u.id, u.email, u.first_name, u.last_name, u.upschool_program,
                   u.phone, u.graduation_date, u.experience_level, u.location,
                   u.portfolio_url, u.github_url, u.linkedin_url, u.about_me, 
                   u.skills, u.user_type
            FROM user_sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
        ''', (token,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                "id": user[0],
                "email": user[1],
                "firstName": user[2],
                "lastName": user[3],
                "upschoolProgram": user[4],
                "phone": user[5],
                "graduationDate": user[6],
                "experienceLevel": user[7],
                "location": user[8],
                "portfolioUrl": user[9],
                "githubUrl": user[10],
                "linkedinUrl": user[11],
                "aboutMe": user[12],
                "skills": json.loads(user[13]) if user[13] else [],
                "userType": user[14] if len(user) > 14 else "mezun"
            }
        
        return None

def cleanup_expired_sessions():
    """Clean up expired sessions"""
    try:
        with _db_lock:
            conn, cursor = get_db_connection()
            cursor.execute('DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP')
            conn.commit()
            conn.close()
    except Exception as e:
        print(f"Error cleaning up sessions: {e}")

# Database will be initialized by main.py
