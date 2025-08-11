"""
Optimized database layer with connection pooling and better error handling
"""

import sqlite3
import os
import hashlib
import uuid
import threading
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from contextlib import contextmanager
from queue import Queue, Empty
from dataclasses import dataclass

from .config import settings

logger = logging.getLogger(__name__)

@dataclass
class DatabaseConfig:
    """Database configuration"""
    db_path: str = "uphera.db"
    pool_size: int = 10
    timeout: float = 30.0
    check_same_thread: bool = False
    enable_wal: bool = True
    busy_timeout: int = 30000

class ConnectionPool:
    """SQLite connection pool implementation"""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.pool = Queue(maxsize=config.pool_size)
        self.lock = threading.Lock()
        self._initialize_pool()
    
    def _create_connection(self) -> sqlite3.Connection:
        """Create a new database connection"""
        conn = sqlite3.connect(
            self.config.db_path,
            timeout=self.config.timeout,
            check_same_thread=self.config.check_same_thread
        )
        
        # Optimize SQLite settings
        conn.execute('PRAGMA journal_mode=WAL' if self.config.enable_wal else 'PRAGMA journal_mode=DELETE')
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute(f'PRAGMA busy_timeout={self.config.busy_timeout}')
        conn.execute('PRAGMA cache_size=10000')
        conn.execute('PRAGMA temp_store=memory')
        conn.execute('PRAGMA mmap_size=268435456')  # 256MB
        
        # Row factory for dict-like access
        conn.row_factory = sqlite3.Row
        
        return conn
    
    def _initialize_pool(self):
        """Initialize the connection pool"""
        with self.lock:
            for _ in range(self.config.pool_size):
                try:
                    conn = self._create_connection()
                    self.pool.put(conn, block=False)
                except Exception as e:
                    logger.error(f"Failed to create connection: {e}")
    
    @contextmanager
    def get_connection(self):
        """Get a connection from the pool"""
        conn = None
        try:
            # Get connection from pool
            try:
                conn = self.pool.get(timeout=5.0)
            except Empty:
                # Pool is empty, create new connection
                logger.warning("Connection pool exhausted, creating new connection")
                conn = self._create_connection()
            
            # Verify connection is alive
            try:
                conn.execute('SELECT 1')
            except sqlite3.Error:
                # Connection is dead, create new one
                logger.warning("Dead connection detected, creating new one")
                conn.close()
                conn = self._create_connection()
            
            yield conn
            
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            if conn:
                try:
                    conn.rollback()
                except:
                    pass
            raise
        finally:
            if conn:
                try:
                    # Return to pool
                    self.pool.put(conn, block=False)
                except:
                    # Pool is full, close connection
                    conn.close()

# Global connection pool
db_config = DatabaseConfig(
    db_path=settings.DATABASE_URL.replace("sqlite:///", ""),
    pool_size=settings.DATABASE_POOL_SIZE,
    timeout=settings.DATABASE_POOL_TIMEOUT
)
connection_pool = ConnectionPool(db_config)

def init_optimized_db():
    """Initialize database with optimized schema"""
    with connection_pool.get_connection() as conn:
        cursor = conn.cursor()
        
        # Users table with indexes
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
                is_active BOOLEAN DEFAULT 1,
                email_verified BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create indexes for performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_location ON users(location)')
        
        # Jobs table with better structure
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                company TEXT NOT NULL,
                location TEXT,
                description TEXT,
                requirements TEXT, -- JSON string
                skills TEXT, -- JSON string
                salary_min INTEGER,
                salary_max INTEGER,
                job_type TEXT DEFAULT 'full-time',
                remote_friendly BOOLEAN DEFAULT 0,
                experience_level TEXT DEFAULT 'entry',
                is_active BOOLEAN DEFAULT 1,
                created_by TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users (id)
            )
        ''')
        
        # Job indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(job_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at)')
        
        # Applications table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                job_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                cover_letter TEXT,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (job_id) REFERENCES jobs (id),
                UNIQUE(user_id, job_id)
            )
        ''')
        
        # Application indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)')
        
        # Enhanced user sessions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token TEXT UNIQUE NOT NULL,
                refresh_token TEXT UNIQUE,
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Session indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_active ON user_sessions(is_active)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at)')
        
        # Audit log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                old_values TEXT, -- JSON
                new_values TEXT, -- JSON
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Audit log indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)')
        
        conn.commit()
        logger.info("✅ Optimized database initialized successfully!")

def execute_query(query: str, params: tuple = (), fetch_one: bool = False, fetch_all: bool = False) -> Any:
    """Execute a database query with proper error handling"""
    try:
        with connection_pool.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                conn.commit()
                return cursor.rowcount
                
    except Exception as e:
        logger.error(f"Database query error: {e}")
        logger.error(f"Query: {query}")
        logger.error(f"Params: {params}")
        raise

def execute_transaction(queries: List[Tuple[str, tuple]]) -> bool:
    """Execute multiple queries in a transaction"""
    try:
        with connection_pool.get_connection() as conn:
            cursor = conn.cursor()
            
            for query, params in queries:
                cursor.execute(query, params)
            
            conn.commit()
            return True
            
    except Exception as e:
        logger.error(f"Transaction error: {e}")
        return False

# User management functions with optimization
def create_user_optimized(user_data: Dict[str, Any]) -> str:
    """Create user with optimized performance"""
    user_id = str(uuid.uuid4())
    
    query = '''
        INSERT INTO users (
            id, email, password_hash, first_name, last_name, user_type,
            phone, upschool_program, graduation_date, experience_level,
            location, portfolio_url, github_url, linkedin_url, about_me, skills
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''
    
    params = (
        user_id,
        user_data.get('email', '').lower(),
        user_data.get('password_hash', ''),
        user_data.get('firstName', ''),
        user_data.get('lastName', ''),
        user_data.get('userType', 'mezun'),
        user_data.get('phone', ''),
        user_data.get('upschoolProgram', ''),
        user_data.get('graduationDate', ''),
        user_data.get('experienceLevel', 'entry'),
        user_data.get('location', ''),
        user_data.get('portfolioUrl', ''),
        user_data.get('githubUrl', ''),
        user_data.get('linkedinUrl', ''),
        user_data.get('aboutMe', ''),
        json.dumps(user_data.get('skills', []))
    )
    
    execute_query(query, params)
    
    # Log user creation
    audit_log("user_created", "users", user_id, None, user_data, user_id)
    
    return user_id

def get_user_by_email_optimized(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email with optimized query"""
    query = '''
        SELECT id, email, password_hash, first_name, last_name, user_type,
               phone, upschool_program, graduation_date, experience_level,
               location, portfolio_url, github_url, linkedin_url, about_me,
               skills, is_active, created_at, updated_at
        FROM users 
        WHERE email = ? AND is_active = 1
    '''
    
    row = execute_query(query, (email.lower(),), fetch_one=True)
    
    if row:
        return {
            "id": row["id"],
            "email": row["email"],
            "password_hash": row["password_hash"],
            "firstName": row["first_name"],
            "lastName": row["last_name"],
            "userType": row["user_type"],
            "phone": row["phone"],
            "upschoolProgram": row["upschool_program"],
            "graduationDate": row["graduation_date"],
            "experienceLevel": row["experience_level"],
            "location": row["location"],
            "portfolioUrl": row["portfolio_url"],
            "githubUrl": row["github_url"],
            "linkedinUrl": row["linkedin_url"],
            "aboutMe": row["about_me"],
            "skills": json.loads(row["skills"]) if row["skills"] else [],
            "isActive": bool(row["is_active"]),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"]
        }
    
    return None

def audit_log(action: str, resource_type: str, resource_id: str, old_values: Any, new_values: Any, user_id: str = None, ip_address: str = None):
    """Create audit log entry"""
    try:
        query = '''
            INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        '''
        
        params = (
            str(uuid.uuid4()),
            user_id,
            action,
            resource_type,
            resource_id,
            json.dumps(old_values) if old_values else None,
            json.dumps(new_values) if new_values else None,
            ip_address
        )
        
        execute_query(query, params)
        
    except Exception as e:
        logger.error(f"Audit log error: {e}")

def cleanup_expired_sessions():
    """Cleanup expired sessions"""
    query = '''
        UPDATE user_sessions 
        SET is_active = 0 
        WHERE expires_at < CURRENT_TIMESTAMP AND is_active = 1
    '''
    
    deleted_count = execute_query(query)
    logger.info(f"🧹 Cleaned up {deleted_count} expired sessions")
    
    return deleted_count

# Initialize on module import
if __name__ == "__main__":
    init_optimized_db()
