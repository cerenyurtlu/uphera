from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Header, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import uuid
import json
import datetime
import random
import re

# Import database functions
from database import (
    create_user, authenticate_user, get_user_by_id, update_user,
    create_session, validate_session
)
from services.ai_matching_service import ai_matcher
from services.enhanced_ai_coach import enhanced_ada_ai
import asyncio

app = FastAPI(title="Up Hera API", version="3.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit OPTIONS handlers
@app.options("/api/auth/graduate/register")
async def options_graduate_register():
    return Response(status_code=200)

@app.options("/api/auth/login")
async def options_login():
    return Response(status_code=200)

@app.options("/api/auth/profile")
async def options_profile():
    return Response(status_code=200)

# Pydantic models
class GraduateRegistration(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: str = ""
    upschoolProgram: str
    graduationDate: str = ""
    skills: List[str] = []
    experience: str = "entry"
    location: str = ""
    portfolio: str = ""
    github: str = ""
    linkedin: str = ""
    aboutMe: str = ""
    password: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

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

# Dependency to get current user
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    token = authorization.replace("Bearer ", "")
    user_id = validate_session(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# API endpoints
@app.get("/")
async def root():
    return {"message": "Up Hera API v3.0", "status": "running", "database": "SQLite"}

@app.post("/api/auth/graduate/register")
async def register_graduate(graduate: GraduateRegistration):
    """Mezun kaydı - Gerçek database ile"""
    try:
        print(f"🔍 Kayıt isteği alındı: {graduate.firstName} {graduate.lastName}")
        print(f"📧 Email: {graduate.email}")
        print(f"📚 Program: {graduate.upschoolProgram}")
        print(f"🎯 Beceriler: {graduate.skills}")
        
        # Create user in database
        user_data = {
            "firstName": graduate.firstName,
            "lastName": graduate.lastName,
            "email": graduate.email,
            "phone": graduate.phone,
            "upschoolProgram": graduate.upschoolProgram,
            "graduationDate": graduate.graduationDate,
            "skills": graduate.skills,
            "experience": graduate.experience,
            "location": graduate.location,
            "portfolio": graduate.portfolio,
            "github": graduate.github,
            "linkedin": graduate.linkedin,
            "aboutMe": graduate.aboutMe,
            "password": graduate.password
        }
        
        created_user = create_user(user_data)
        
        # Create session
        token = create_session(created_user["id"])
        
        print(f"✅ Yeni kullanıcı kaydedildi: {created_user['firstName']} {created_user['lastName']}")
        print(f"📊 Program: {created_user['upschoolProgram']}")
        print(f"�� User ID: {created_user['id']}")
        print(f"🔑 Token: {token}")
        
        return {
            "success": True,
            "message": f"Hoş geldin {created_user['firstName']} {created_user['lastName']}!",
            "user": {
                "id": created_user["id"],
                "name": f"{created_user['firstName']} {created_user['lastName']}",
                "email": created_user["email"],
                "program": created_user["upschoolProgram"],
                "user_type": "mezun"
            },
            "token": token,
            "redirect_url": "/jobs"
        }
        
    except Exception as e:
        print(f"❌ Kayıt hatası: {str(e)}")
        
        # Specific error handling
        if "UNIQUE constraint failed" in str(e):
            raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kayıtlı")
        elif "database is locked" in str(e):
            raise HTTPException(status_code=503, detail="Veritabanı meşgul, lütfen tekrar deneyin")
        else:
            raise HTTPException(status_code=500, detail=f"Kayıt sırasında hata oluştu: {str(e)}")

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """Normal email/şifre girişi - Gerçek database ile"""
    try:
        email = request.email.lower().strip()
        password = request.password
        
        print(f"🔐 Giriş denemesi: {email}")
        
        # Authenticate user
        user = authenticate_user(email, password)
        
        if user:
            # Create session
            token = create_session(user["id"])
            
            print(f"✅ Giriş başarılı: {user['firstName']} {user['lastName']} ({email})")
            print(f"🎯 Program: {user['upschoolProgram']}")
            print(f"🔑 Token: {token}")
            
            return {
                "success": True,
                "message": f"Hoş geldin {user['firstName']} {user['lastName']}!",
                "user": {
                    "id": user["id"],
                    "name": f"{user['firstName']} {user['lastName']}",
                    "email": user["email"],
                    "program": user["upschoolProgram"],
                    "user_type": "mezun"
                },
                "token": token,
                "redirect_url": "/jobs"
            }
        else:
            print(f"❌ Giriş başarısız: {email} - Geçersiz kullanıcı veya şifre")
            return {
                "success": False,
                "detail": "E-posta veya şifre hatalı"
            }
            
    except Exception as e:
        print(f"❌ Giriş hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Giriş sırasında hata oluştu: {str(e)}")

@app.get("/api/auth/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """Kullanıcı profilini getir"""
    try:
        return {
            "success": True,
            "user": current_user
        }
    except Exception as e:
        print(f"❌ Profil getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil getirme hatası: {str(e)}")

@app.put("/api/auth/profile")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Kullanıcı profilini güncelle"""
    try:
        print(f"🔄 Profil güncelleme: {current_user['firstName']} {current_user['lastName']}")
        
        update_data = {
            "firstName": profile_data.firstName,
            "lastName": profile_data.lastName,
            "phone": profile_data.phone,
            "upschoolProgram": profile_data.upschoolProgram,
            "graduationDate": profile_data.graduationDate,
            "skills": profile_data.skills,
            "experienceLevel": profile_data.experience,
            "location": profile_data.location,
            "portfolioUrl": profile_data.portfolioUrl,
            "githubUrl": profile_data.githubUrl,
            "linkedinUrl": profile_data.linkedinUrl,
            "aboutMe": profile_data.aboutMe
        }
        
        success = update_user(current_user["id"], update_data)
        
        if success:
            # Get updated user data
            updated_user = get_user_by_id(current_user["id"])
            print(f"✅ Profil güncellendi: {updated_user['firstName']} {updated_user['lastName']}")
            
            return {
                "success": True,
                "message": "Profil başarıyla güncellendi",
                "user": updated_user
            }
        else:
            raise HTTPException(status_code=500, detail="Profil güncellenirken hata oluştu")
            
    except Exception as e:
        print(f"❌ Profil güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profil güncelleme hatası: {str(e)}")

@app.get("/api/jobs")
async def get_jobs(
    limit: int = 20, 
    location: str = "", 
    skills: str = "",
    current_user: Dict = Depends(get_current_user)
):
    """İş ilanlarını AI matching ile getir"""
    
    # Enhanced jobs data with more realistic requirements
    jobs = [
        {
            "id": "job_1",
            "title": "Frontend Developer",
            "company": "TechCorp İstanbul",
            "location": "İstanbul",
            "description": "React ve TypeScript deneyimi olan frontend geliştirici arıyoruz. Modern web uygulamaları geliştirecek, kullanıcı deneyimini önemseyen bir takım arkadaşı arıyoruz.",
            "required_skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
            "experience_level": "junior",
            "salary_min": 15000,
            "salary_max": 25000,
            "job_type": "full-time",
            "remote_friendly": True
        },
        {
            "id": "job_2", 
            "title": "Python Backend Developer",
            "company": "InnovateSoft",
            "location": "Ankara",
            "description": "Python ve Django/FastAPI deneyimi olan backend geliştirici arıyoruz. Ölçeklenebilir API'ler geliştirecek, veritabanı tasarımı yapabilecek bir uzman arıyoruz.",
            "required_skills": ["Python", "Django", "FastAPI", "PostgreSQL", "REST API"],
            "experience_level": "mid",
            "salary_min": 18000,
            "salary_max": 30000,
            "job_type": "full-time",
            "remote_friendly": False
        },
        {
            "id": "job_3",
            "title": "React Native Developer", 
            "company": "MobileFirst",
            "location": "İzmir",
            "description": "React Native deneyimi olan mobil geliştirici arıyoruz. iOS ve Android platformları için çapraz platform uygulamalar geliştirecek bir uzman arıyoruz.",
            "required_skills": ["React Native", "JavaScript", "Redux", "Mobile Development"],
            "experience_level": "junior",
            "salary_min": 20000,
            "salary_max": 35000,
            "job_type": "full-time",
            "remote_friendly": True
        },
        {
            "id": "job_4",
            "title": "Data Scientist",
            "company": "AI Research Labs",
            "location": "İstanbul",
            "description": "Makine öğrenmesi ve veri analizi konularında deneyimli data scientist arıyoruz. Python, pandas, scikit-learn kullanarak modeller geliştirecek bir uzman arıyoruz.",
            "required_skills": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn"],
            "experience_level": "entry",
            "salary_min": 25000,
            "salary_max": 40000,
            "job_type": "full-time",
            "remote_friendly": True
        },
        {
            "id": "job_5",
            "title": "Full Stack Developer",
            "company": "DigitalFlow",
            "location": "İstanbul",
            "description": "MERN stack deneyimi olan full stack geliştirici arıyoruz. Frontend ve backend geliştirme yapabilecek, projeleri başından sonuna kadar yönetebilecek bir uzman arıyoruz.",
            "required_skills": ["MongoDB", "Express", "React", "Node.js", "JavaScript"],
            "experience_level": "senior",
            "salary_min": 30000,
            "salary_max": 50000,
            "job_type": "full-time",
            "remote_friendly": True
        },
        {
            "id": "job_6",
            "title": "DevOps Engineer",
            "company": "CloudMasters",
            "location": "Ankara",
            "description": "Docker, Kubernetes ve AWS deneyimi olan DevOps mühendisi arıyoruz. CI/CD pipeline'ları kuracak, cloud infrastructure yönetecek bir uzman arıyoruz.",
            "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
            "experience_level": "mid",
            "salary_min": 28000,
            "salary_max": 45000,
            "job_type": "full-time",
            "remote_friendly": True
        }
    ]
    
    # Filter by location if provided
    if location:
        jobs = [job for job in jobs if location.lower() in job["location"].lower()]
    
    # Filter by skills if provided
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        jobs = [job for job in jobs if any(skill in [req.lower() for req in job["required_skills"]] for skill in skill_list)]
    
    # Use AI matching to calculate match scores and rank jobs
    user_profile = {
        "skills": current_user.get("skills", []),
        "experienceLevel": current_user.get("experienceLevel", "entry"),
        "location": current_user.get("location", "Türkiye"),
        "upschoolProgram": current_user.get("upschoolProgram", "Data Science")
    }
    
    # Calculate match scores using AI
    ranked_jobs = ai_matcher.rank_jobs(user_profile, jobs)
    
    print(f"🤖 AI Matching Results for {current_user.get('firstName', 'User')}:")
    for job in ranked_jobs[:3]:
        print(f"   📊 {job['title']} @ {job['company']}: {job['match_score']}% match")
    
    return {
        "success": True,
        "jobs": ranked_jobs[:limit],
        "total": len(ranked_jobs),
        "matching_algorithm": "AI Matching Ranker: Cosine similarity + rule-based boosts"
    }

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: Dict = Depends(get_current_user)):
    """Dashboard istatistiklerini getir"""
    return {
        "success": True,
        "stats": {
            "candidates": 156,
            "active_jobs": 23,
            "matches": 89,
            "hires": 12,
            "avg_score": 84
        },
        "recent_matches": [
            {
                "name": "Zeynep Kaya",
                "job": "Frontend Developer at TechCorp",
                "date": "15 Oca 13:00",
                "status": "sent",
                "score": 92
            },
            {
                "name": "Ayşe Demir", 
                "job": "Backend Developer at InnovateSoft",
                "date": "14 Oca 17:30",
                "status": "viewed",
                "score": 87
            },
            {
                "name": "Fatma Özkan",
                "job": "Full Stack Developer at DigitalFlow", 
                "date": "13 Oca 12:15",
                "status": "interviewed",
                "score": 78
            }
        ],
        "top_skills": [
            {"name": "React", "jobs": 15, "trend": 25},
            {"name": "Python", "jobs": 12, "trend": 18},
            {"name": "TypeScript", "jobs": 10, "trend": 15},
            {"name": "Node.js", "jobs": 8, "trend": 12},
            {"name": "Docker", "jobs": 6, "trend": 8}
        ]
    }

# Demo data endpoint for testing
@app.post("/api/demo/setup")
async def setup_demo_data():
    """Demo verileri oluştur"""
    try:
        # Create demo user if not exists
        demo_user_data = {
            "firstName": "Ceren",
            "lastName": "Yurtlu", 
            "email": "cerennyurtlu@gmail.com",
            "phone": "+90 555 123 4567",
            "upschoolProgram": "Data Science",
            "graduationDate": "2024",
            "skills": ["Python", "Machine Learning", "Data Analysis"],
            "experience": "entry",
            "location": "İstanbul",
            "portfolio": "https://cerenyurtlu.dev",
            "github": "https://github.com/cerenyurtlu",
            "linkedin": "https://linkedin.com/in/cerenyurtlu",
            "aboutMe": "Data Science mezunu, makine öğrenmesi ve veri analizi konularında deneyimli.",
            "password": "123456"
        }
        
        # Try to create user (will fail if already exists)
        try:
            create_user(demo_user_data)
            print("✅ Demo kullanıcı oluşturuldu")
        except:
            print("ℹ️ Demo kullanıcı zaten mevcut")
        
        return {
            "success": True,
            "message": "Demo veriler hazırlandı",
            "demo_user": {
                "email": "cerennyurtlu@gmail.com",
                "password": "123456"
            }
        }
        
    except Exception as e:
        print(f"❌ Demo setup hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Demo setup hatası: {str(e)}")

# Mentorship endpoints
class MentorshipRequest(BaseModel):
    mentor_id: str
    message: str
    mentee_name: str
    mentee_email: str
    mentee_program: str

class MentorshipMessage(BaseModel):
    mentor_id: str
    message: str
    sender_name: str
    sender_email: str

@app.post("/api/mentorship/request")
async def create_mentorship_request(
    request: MentorshipRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Mentorluk isteği oluştur"""
    try:
        # Gerçek uygulamada bu verileri veritabanına kaydederiz
        print(f"🤝 Mentorluk İsteği:")
        print(f"   Mentee: {request.mentee_name} ({request.mentee_email})")
        print(f"   Program: {request.mentee_program}")
        print(f"   Mentor ID: {request.mentor_id}")
        print(f"   Mesaj: {request.message}")
        
        # Email gönderme simülasyonu
        print(f"📧 Mentorluk isteği email'i gönderildi")
        
        return {
            "success": True,
            "message": "Mentorluk isteği başarıyla gönderildi",
            "request_id": f"req_{uuid.uuid4().hex[:8]}",
            "mentor_id": request.mentor_id,
            "status": "pending"
        }
    except Exception as e:
        print(f"❌ Mentorluk isteği hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mentorluk isteği oluşturulurken hata: {str(e)}")

@app.post("/api/mentorship/message")
async def send_mentorship_message(
    message: MentorshipMessage,
    current_user: Dict = Depends(get_current_user)
):
    """Mentor'a mesaj gönder"""
    try:
        # Gerçek uygulamada bu mesajı veritabanına kaydederiz
        print(f"💬 Mentor Mesajı:")
        print(f"   Gönderen: {message.sender_name} ({message.sender_email})")
        print(f"   Mentor ID: {message.mentor_id}")
        print(f"   Mesaj: {message.message}")
        
        # Email gönderme simülasyonu
        print(f"📧 Mesaj email'i gönderildi")
        
        return {
            "success": True,
            "message": "Mesaj başarıyla gönderildi",
            "message_id": f"msg_{uuid.uuid4().hex[:8]}",
            "mentor_id": message.mentor_id,
            "timestamp": datetime.datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Mesaj gönderme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mesaj gönderilirken hata: {str(e)}")

@app.get("/api/mentorship/requests")
async def get_mentorship_requests(current_user: Dict = Depends(get_current_user)):
    """Kullanıcının mentorluk isteklerini getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        requests = [
            {
                "id": "req_1",
                "mentor_name": "Gizem Aktaş",
                "mentor_company": "Meta",
                "status": "accepted",
                "created_at": "2024-01-15T10:30:00",
                "message": "Frontend kariyerimde ilerlemek istiyorum..."
            },
            {
                "id": "req_2", 
                "mentor_name": "Selin Demirci",
                "mentor_company": "Spotify",
                "status": "pending",
                "created_at": "2024-01-14T15:45:00",
                "message": "React performance konusunda yardım almak istiyorum..."
            }
        ]
    def get_requests():
        try:
            # asıl kod
            return {
                "success": True,
                "requests": requests
            }
        except Exception as e:
            print(f"❌ Mentorluk istekleri getirme hatası: {str(e)}")
            return {
                "success": False,
                "detail": f"Mentorluk istekleri getirilirken hata oluştu: {str(e)}"
            }

@app.get("/api/mentorship/messages")
async def get_mentorship_messages(current_user: Dict = Depends(get_current_user)):
    """Kullanıcının mentor mesajlarını getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        messages = [
            {
                "id": "msg_1",
                "mentor_name": "Gizem Aktaş",
                "mentor_company": "Meta",
                "message": "Merhaba! Mentorluk isteğinizi aldım. Hangi konularda yardım almak istiyorsunuz?",
                "is_from_mentor": True,
                "created_at": "2024-01-15T11:00:00"
            },
            {
                "id": "msg_2",
                "mentor_name": "Gizem Aktaş", 
                "mentor_company": "Meta",
                "message": "Frontend kariyerimde ilerlemek istiyorum. Hangi teknolojilere odaklanmalıyım?",
                "is_from_mentor": False,
                "created_at": "2024-01-15T10:30:00"
            }
        ]
        
        return {
            "success": True,
            "messages": messages
        }
    except Exception as e:
        print(f"❌ Mentor mesajları getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mentor mesajları getirilirken hata: {str(e)}")

@app.websocket("/ws/coach")
async def websocket_coach(websocket: WebSocket):
    await websocket.accept()
    user_id = websocket.query_params.get("user_id")
    if not user_id:
        await websocket.send_text("Kullanıcı kimliği (user_id) gerekli.")
        await websocket.close()
        return
    try:
        while True:
            data = await websocket.receive_text()
            # AI'dan streaming yanıt al
            async for chunk in enhanced_ada_ai.get_enhanced_response(user_id, data):
                await websocket.send_text(chunk)
    except WebSocketDisconnect:
        await websocket.close()
    except Exception as e:
        await websocket.send_text(f"Hata: {str(e)}")
        await websocket.close()

@app.post("/upload/cv")
async def upload_cv(user_id: str, file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await enhanced_ada_ai.upload_cv(user_id, content, file.filename)
        return result
    except Exception as e:
        return {"success": False, "error": str(e), "message": "CV yüklenemedi."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 