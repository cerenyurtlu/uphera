"""
Database setup for HireHer AI
SQLite database with proper user management
"""

import sqlite3
import os
import hashlib
import uuid
import threading
import time
import json
from datetime import datetime
from typing import Dict, List, Optional, Any

# Database file path
DB_PATH = "hireher.db"

# Database lock for thread safety
_db_lock = threading.Lock()

def get_db_connection():
    """Get database connection with proper settings"""
    conn = sqlite3.connect(DB_PATH, timeout=60.0)
    cursor = conn.cursor()
    
    # Simple settings without WAL mode
    cursor.execute('PRAGMA journal_mode=DELETE')
    cursor.execute('PRAGMA synchronous=FULL')
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
                location TEXT,
                description TEXT,
                requirements TEXT, -- JSON string
                salary_min INTEGER,
                salary_max INTEGER,
                job_type TEXT, -- full-time, part-time, contract
                remote_friendly BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully!")

def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        user_id = str(uuid.uuid4())
        password_hash = hash_password(user_data['password'])
        
        cursor.execute('''
            INSERT INTO users (
                id, email, password_hash, first_name, last_name, phone,
                upschool_program, graduation_date, experience_level, location,
                portfolio_url, github_url, linkedin_url, about_me, skills
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, user_data['email'], password_hash, user_data['firstName'],
            user_data['lastName'], user_data.get('phone', ''), user_data['upschoolProgram'],
            user_data.get('graduationDate', ''), user_data.get('experience', 'entry'),
            user_data.get('location', ''), user_data.get('portfolio', ''),
            user_data.get('github', ''), user_data.get('linkedin', ''),
            user_data.get('aboutMe', ''), json.dumps(user_data.get('skills', []))
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "id": user_id,
            "email": user_data['email'],
            "firstName": user_data['firstName'],
            "lastName": user_data['lastName'],
            "upschoolProgram": user_data['upschoolProgram']
        }

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return user data"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT id, email, password_hash, first_name, last_name, upschool_program,
                   phone, graduation_date, experience_level, location, skills
            FROM users WHERE email = ?
        ''', (email.lower(),))
        
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
                "skills": json.loads(user[10]) if user[10] else []
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
        expires_at = datetime.now().replace(hour=23, minute=59, second=59)
        
        cursor.execute('''
            INSERT INTO user_sessions (id, user_id, token, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (session_id, user_id, token, expires_at))
        
        conn.commit()
        conn.close()
        
        return token

def validate_session(token: str) -> Optional[str]:
    """Validate session token and return user_id"""
    with _db_lock:
        conn, cursor = get_db_connection()
        
        cursor.execute('''
            SELECT user_id FROM user_sessions 
            WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
        ''', (token,))
        
        result = cursor.fetchone()
        conn.close()
        
        return result[0] if result else None

# Initialize database on import
init_db() 