"""
Job management service with real functionality
"""
import sqlite3
import json
import uuid
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class JobService:
    """Real job management with database integration"""
    
    def __init__(self, db_path: str = "uphera.db"):
        self.db_path = db_path
        self.init_job_tables()
        self.seed_demo_jobs()
    
    def init_job_tables(self):
        """Initialize job-related database tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Jobs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    company TEXT NOT NULL,
                    company_logo TEXT,
                    location TEXT,
                    job_type TEXT DEFAULT 'full-time',
                    experience_level TEXT DEFAULT 'entry',
                    salary_min INTEGER,
                    salary_max INTEGER,
                    description TEXT,
                    requirements TEXT, -- JSON array
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
            
            # Job applications table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS job_applications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    cover_letter TEXT,
                    resume_content TEXT,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (job_id) REFERENCES jobs (id),
                    UNIQUE(user_id, job_id)
                )
            ''')
            
            # Job bookmarks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS job_bookmarks (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (job_id) REFERENCES jobs (id),
                    UNIQUE(user_id, job_id)
                )
            ''')
            
            # Job recommendations table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS job_recommendations (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    job_id TEXT NOT NULL,
                    match_score REAL,
                    reasons TEXT, -- JSON array
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (job_id) REFERENCES jobs (id),
                    UNIQUE(user_id, job_id)
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("✅ Job tables initialized")
            
        except Exception as e:
            logger.error(f"❌ Job tables initialization failed: {e}")
    
    def seed_demo_jobs(self):
        """Create demo job postings if none exist"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if jobs already exist
            cursor.execute("SELECT COUNT(*) FROM jobs")
            count = cursor.fetchone()[0]
            
            if count > 0:
                conn.close()
                return
            
            demo_jobs = [
                {
                    "title": "Frontend Developer",
                    "company": "TechStart İstanbul",
                    "company_logo": "https://via.placeholder.com/100x100?text=TS",
                    "location": "İstanbul, Türkiye",
                    "job_type": "full-time",
                    "experience_level": "junior",
                    "salary_min": 25000,
                    "salary_max": 35000,
                    "description": "React ve TypeScript ile modern web uygulamaları geliştiren Frontend Developer arıyoruz. UpSchool mezunları başvuru için teşvik edilir.",
                    "requirements": ["React", "TypeScript", "HTML/CSS", "Git", "REST API"],
                    "skills": ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
                    "benefits": ["Esnek çalışma saatleri", "Uzaktan çalışma imkanı", "Eğitim desteği", "Sağlık sigortası"],
                    "remote_friendly": True,
                    "application_deadline": (datetime.now() + timedelta(days=30)).isoformat()
                },
                {
                    "title": "Full Stack Developer",
                    "company": "Digital Agency Pro",
                    "company_logo": "https://via.placeholder.com/100x100?text=DAP",
                    "location": "Ankara, Türkiye",
                    "job_type": "full-time",
                    "experience_level": "mid",
                    "salary_min": 35000,
                    "salary_max": 45000,
                    "description": "Full stack web geliştirme deneyimi olan, React ve Node.js teknolojilerinde uzman developer arayışımız.",
                    "requirements": ["React", "Node.js", "MongoDB", "Express", "2+ yıl deneyim"],
                    "skills": ["React", "Node.js", "MongoDB", "Express", "JavaScript"],
                    "benefits": ["Rekabetçi maaş", "Proje bonusları", "Teknoloji eğitimleri", "Takım gezileri"],
                    "remote_friendly": False,
                    "application_deadline": (datetime.now() + timedelta(days=25)).isoformat()
                },
                {
                    "title": "React Native Developer",
                    "company": "MobilTech Solutions",
                    "company_logo": "https://via.placeholder.com/100x100?text=MTS",
                    "location": "İzmir, Türkiye",
                    "job_type": "contract",
                    "experience_level": "entry",
                    "salary_min": 20000,
                    "salary_max": 30000,
                    "description": "Mobil uygulama geliştirme alanında büyüyen ekibimize katılacak React Native Developer.",
                    "requirements": ["React Native", "JavaScript", "iOS/Android", "Git"],
                    "skills": ["React Native", "JavaScript", "Mobile Development", "React"],
                    "benefits": ["Flexible hours", "Remote work", "Learning budget", "Tech conferences"],
                    "remote_friendly": True,
                    "application_deadline": (datetime.now() + timedelta(days=20)).isoformat()
                },
                {
                    "title": "Python Backend Developer",
                    "company": "DataCorp Analytics",
                    "company_logo": "https://via.placeholder.com/100x100?text=DCA",
                    "location": "İstanbul, Türkiye",
                    "job_type": "full-time",
                    "experience_level": "junior",
                    "salary_min": 28000,
                    "salary_max": 38000,
                    "description": "Veri analizi ve web backend geliştirme projelerinde çalışacak Python Developer.",
                    "requirements": ["Python", "Django/FastAPI", "PostgreSQL", "REST API", "Git"],
                    "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "REST API"],
                    "benefits": ["Mentorship program", "Conference tickets", "Health insurance", "Remote options"],
                    "remote_friendly": True,
                    "application_deadline": (datetime.now() + timedelta(days=35)).isoformat()
                },
                {
                    "title": "UI/UX Designer & Frontend",
                    "company": "Creative Digital",
                    "company_logo": "https://via.placeholder.com/100x100?text=CD",
                    "location": "Bursa, Türkiye",
                    "job_type": "full-time",
                    "experience_level": "entry",
                    "salary_min": 22000,
                    "salary_max": 32000,
                    "description": "Tasarım ve frontend geliştirme becerilerini birleştiren hibrit pozisyon. Figma ve React deneyimi.",
                    "requirements": ["Figma", "Adobe XD", "HTML/CSS", "JavaScript", "React", "Design systems"],
                    "skills": ["UI/UX Design", "Figma", "React", "CSS", "JavaScript"],
                    "benefits": ["Creative environment", "Design tools budget", "Flexible schedule", "Training programs"],
                    "remote_friendly": False,
                    "application_deadline": (datetime.now() + timedelta(days=28)).isoformat()
                }
            ]
            
            for job_data in demo_jobs:
                job_id = str(uuid.uuid4())
                cursor.execute('''
                    INSERT INTO jobs (
                        id, title, company, company_logo, location, job_type, experience_level,
                        salary_min, salary_max, description, requirements, skills, benefits,
                        remote_friendly, application_deadline
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    job_id, job_data["title"], job_data["company"], job_data["company_logo"],
                    job_data["location"], job_data["job_type"], job_data["experience_level"],
                    job_data["salary_min"], job_data["salary_max"], job_data["description"],
                    json.dumps(job_data["requirements"]), json.dumps(job_data["skills"]),
                    json.dumps(job_data["benefits"]), job_data["remote_friendly"],
                    job_data["application_deadline"]
                ))
            
            conn.commit()
            conn.close()
            logger.info(f"✅ Seeded {len(demo_jobs)} demo jobs")
            
        except Exception as e:
            logger.error(f"❌ Failed to seed demo jobs: {e}")
    
    def get_jobs(
        self, 
        limit: int = 20, 
        offset: int = 0,
        location: str = "",
        job_type: str = "",
        experience_level: str = "",
        skills: List[str] = None,
        remote_only: bool = False,
        search_query: str = ""
    ) -> Dict[str, Any]:
        """Get jobs with filtering and pagination"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build query
            where_conditions = ["is_active = 1"]
            params = []
            
            if location:
                where_conditions.append("location LIKE ?")
                params.append(f"%{location}%")
            
            if job_type:
                where_conditions.append("job_type = ?")
                params.append(job_type)
            
            if experience_level:
                where_conditions.append("experience_level = ?")
                params.append(experience_level)
            
            if remote_only:
                where_conditions.append("remote_friendly = 1")
            
            if search_query:
                where_conditions.append("(title LIKE ? OR company LIKE ? OR description LIKE ?)")
                search_param = f"%{search_query}%"
                params.extend([search_param, search_param, search_param])
            
            where_clause = " AND ".join(where_conditions)
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM jobs WHERE {where_clause}"
            cursor.execute(count_query, params)
            total = cursor.fetchone()[0]
            
            # Get jobs
            jobs_query = f'''
                SELECT id, title, company, company_logo, location, job_type, experience_level,
                       salary_min, salary_max, description, requirements, skills, benefits,
                       remote_friendly, created_at, application_deadline, views, applications_count
                FROM jobs 
                WHERE {where_clause}
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            '''
            
            cursor.execute(jobs_query, params + [limit, offset])
            rows = cursor.fetchall()
            
            jobs = []
            for row in rows:
                job = {
                    "id": row[0],
                    "title": row[1],
                    "company": row[2],
                    "company_logo": row[3],
                    "location": row[4],
                    "job_type": row[5],
                    "experience_level": row[6],
                    "salary_min": row[7],
                    "salary_max": row[8],
                    "description": row[9],
                    "requirements": json.loads(row[10]) if row[10] else [],
                    "skills": json.loads(row[11]) if row[11] else [],
                    "benefits": json.loads(row[12]) if row[12] else [],
                    "remote_friendly": bool(row[13]),
                    "created_at": row[14],
                    "application_deadline": row[15],
                    "views": row[16],
                    "applications_count": row[17]
                }
                jobs.append(job)
            
            conn.close()
            
            return {
                "jobs": jobs,
                "total": total,
                "limit": limit,
                "offset": offset,
                "has_more": offset + limit < total
            }
            
        except Exception as e:
            logger.error(f"Failed to get jobs: {e}")
            return {"jobs": [], "total": 0, "limit": limit, "offset": offset, "has_more": False}
    
    def get_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get single job by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Increment view count
            cursor.execute("UPDATE jobs SET views = views + 1 WHERE id = ?", (job_id,))
            
            # Get job
            cursor.execute('''
                SELECT id, title, company, company_logo, location, job_type, experience_level,
                       salary_min, salary_max, description, requirements, skills, benefits,
                       remote_friendly, created_at, application_deadline, views, applications_count
                FROM jobs 
                WHERE id = ? AND is_active = 1
            ''', (job_id,))
            
            row = cursor.fetchone()
            conn.commit()
            conn.close()
            
            if row:
                return {
                    "id": row[0],
                    "title": row[1],
                    "company": row[2],
                    "company_logo": row[3],
                    "location": row[4],
                    "job_type": row[5],
                    "experience_level": row[6],
                    "salary_min": row[7],
                    "salary_max": row[8],
                    "description": row[9],
                    "requirements": json.loads(row[10]) if row[10] else [],
                    "skills": json.loads(row[11]) if row[11] else [],
                    "benefits": json.loads(row[12]) if row[12] else [],
                    "remote_friendly": bool(row[13]),
                    "created_at": row[14],
                    "application_deadline": row[15],
                    "views": row[16],
                    "applications_count": row[17]
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get job {job_id}: {e}")
            return None
    
    def apply_to_job(self, user_id: str, job_id: str, cover_letter: str = "", resume_content: str = "") -> Dict[str, Any]:
        """Apply to a job"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if already applied
            cursor.execute(
                "SELECT id FROM job_applications WHERE user_id = ? AND job_id = ?",
                (user_id, job_id)
            )
            
            if cursor.fetchone():
                conn.close()
                return {
                    "success": False,
                    "message": "Bu pozisyona zaten başvuru yaptınız"
                }
            
            # Create application
            application_id = str(uuid.uuid4())
            cursor.execute('''
                INSERT INTO job_applications (id, user_id, job_id, cover_letter, resume_content)
                VALUES (?, ?, ?, ?, ?)
            ''', (application_id, user_id, job_id, cover_letter, resume_content))
            
            # Update job application count
            cursor.execute(
                "UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?",
                (job_id,)
            )
            
            conn.commit()
            conn.close()
            
            return {
                "success": True,
                "application_id": application_id,
                "message": "Başvurunuz başarıyla gönderildi!"
            }
            
        except Exception as e:
            logger.error(f"Failed to apply to job {job_id}: {e}")
            return {
                "success": False,
                "message": "Başvuru sırasında hata oluştu"
            }
    
    def get_user_applications(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's job applications"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT ja.id, ja.status, ja.applied_at, ja.updated_at,
                       j.title, j.company, j.location, j.id as job_id
                FROM job_applications ja
                JOIN jobs j ON ja.job_id = j.id
                WHERE ja.user_id = ?
                ORDER BY ja.applied_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [{
                "id": row[0],
                "status": row[1],
                "applied_at": row[2],
                "updated_at": row[3],
                "job": {
                    "id": row[7],
                    "title": row[4],
                    "company": row[5],
                    "location": row[6]
                }
            } for row in rows]
            
        except Exception as e:
            logger.error(f"Failed to get applications for user {user_id}: {e}")
            return []
    
    def bookmark_job(self, user_id: str, job_id: str) -> Dict[str, Any]:
        """Bookmark a job"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if already bookmarked
            cursor.execute(
                "SELECT id FROM job_bookmarks WHERE user_id = ? AND job_id = ?",
                (user_id, job_id)
            )
            
            if cursor.fetchone():
                # Remove bookmark
                cursor.execute(
                    "DELETE FROM job_bookmarks WHERE user_id = ? AND job_id = ?",
                    (user_id, job_id)
                )
                message = "Favori listesinden çıkarıldı"
                bookmarked = False
            else:
                # Add bookmark
                bookmark_id = str(uuid.uuid4())
                cursor.execute(
                    "INSERT INTO job_bookmarks (id, user_id, job_id) VALUES (?, ?, ?)",
                    (bookmark_id, user_id, job_id)
                )
                message = "Favori listesine eklendi"
                bookmarked = True
            
            conn.commit()
            conn.close()
            
            return {
                "success": True,
                "bookmarked": bookmarked,
                "message": message
            }
            
        except Exception as e:
            logger.error(f"Failed to bookmark job {job_id}: {e}")
            return {
                "success": False,
                "message": "İşlem sırasında hata oluştu"
            }
    
    def get_user_bookmarks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's bookmarked jobs"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT j.id, j.title, j.company, j.location, j.salary_min, j.salary_max,
                       j.job_type, j.remote_friendly, jb.created_at
                FROM job_bookmarks jb
                JOIN jobs j ON jb.job_id = j.id
                WHERE jb.user_id = ? AND j.is_active = 1
                ORDER BY jb.created_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [{
                "id": row[0],
                "title": row[1],
                "company": row[2],
                "location": row[3],
                "salary_min": row[4],
                "salary_max": row[5],
                "job_type": row[6],
                "remote_friendly": bool(row[7]),
                "bookmarked_at": row[8]
            } for row in rows]
            
        except Exception as e:
            logger.error(f"Failed to get bookmarks for user {user_id}: {e}")
            return []

# Global instance
job_service = JobService()
