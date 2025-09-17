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
import time

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
    user_type: Optional[str] = "mezun"  # 'mezun' | 'admin'

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
        requested_type = (request.user_type or "mezun").lower()
        
        print(f"🔐 Giriş denemesi: {email}")
        
        # Authenticate user
        user = authenticate_user(email, password)
        
        if user:
            # Determine role
            role = requested_type if requested_type in ("mezun", "admin") else "mezun"
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
                    "user_type": role
                },
                "token": token,
                "redirect_url": "/dashboard" if role == "mezun" else "/dashboard"
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

@app.get("/api/me")
async def get_me(current_user: Dict = Depends(get_current_user)):
    """Login sonrası tüm profil bilgilerini döner"""
    try:
        return {
            "success": True,
            "user": current_user
        }
    except Exception as e:
        print(f"❌ /api/me hatası: {str(e)}")
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

# Events endpoints
@app.get("/api/events")
async def get_events(current_user: Dict = Depends(get_current_user)):
    """Etkinlikleri getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        events = [
            {
                "id": "1",
                "title": "Frontend Developer Network Meetup",
                "category": "networking",
                "date": "2025-02-15",
                "time": "19:00",
                "duration": "3 saat",
                "location": "TechHub İstanbul, Maslak",
                "type": "Yüz Yüze",
                "organizer": "UpSchool Alumni Network",
                "description": "Frontend teknolojileri ve kariyer fırsatları üzerine networking etkinliği. React, TypeScript ve modern web teknolojileri konuşulacak.",
                "maxParticipants": 50,
                "currentParticipants": 23,
                "tags": ["React", "TypeScript", "Networking", "Career"],
                "level": "Tüm Seviyeler",
                "featured": True,
                "agenda": [
                    {"time": "19:00", "title": "Karşılama ve Networking"},
                    {"time": "19:30", "title": "Frontend Trends 2025 - Panel"},
                    {"time": "20:30", "title": "Serbest Networking & Kahve"},
                    {"time": "21:30", "title": "Grup Fotoğrafı"}
                ],
                "speakers": [
                    {"name": "Ayşe Demir", "role": "Senior Frontend Dev @ Trendyol"},
                    {"name": "Mehmet Kaya", "role": "Tech Lead @ Getir"}
                ],
                "requirements": ["Laptop (isteğe bağlı)", "Networking Card"],
                "benefits": ["Sertifika", "Networking", "Goodies"]
            },
            {
                "id": "2",
                "title": "UI/UX Workshop: Figma'dan Prototype'a",
                "category": "workshop",
                "date": "2025-02-20",
                "time": "14:00",
                "duration": "4 saat",
                "location": "Online",
                "type": "Online",
                "organizer": "UpSchool Design Team",
                "description": "Figma kullanarak interaktif prototipler oluşturmayı öğrenin. Beginner-friendly workshop.",
                "maxParticipants": 100,
                "currentParticipants": 67,
                "tags": ["Figma", "UI/UX", "Design", "Prototype"],
                "level": "Başlangıç",
                "featured": False,
                "agenda": [
                    {"time": "14:00", "title": "Figma Temelleri"},
                    {"time": "15:00", "title": "Component & Design System"},
                    {"time": "16:00", "title": "Prototyping Workshop"},
                    {"time": "17:30", "title": "Q&A & Feedback"}
                ],
                "speakers": [
                    {"name": "Zeynep Öztürk", "role": "Lead UX Designer @ Trendyol"}
                ],
                "requirements": ["Figma hesabı", "Laptop"],
                "benefits": ["Sertifika", "Workshop Materyalleri"]
            }
        ]
        
        return {
            "success": True,
            "events": events
        }
    except Exception as e:
        print(f"❌ Etkinlikler getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Etkinlikler getirilirken hata: {str(e)}")

class EventRegistration(BaseModel):
    event_id: str
    user_name: str
    user_email: str
    
@app.post("/api/events/register")
async def register_event(
    registration: EventRegistration,
    current_user: Dict = Depends(get_current_user)
):
    """Etkinlik kaydı oluştur"""
    try:
        print(f"📅 Etkinlik Kaydı:")
        print(f"   Katılımcı: {registration.user_name} ({registration.user_email})")
        print(f"   Event ID: {registration.event_id}")
        
        return {
            "success": True,
            "message": "Etkinlik kaydınız başarıyla alındı",
            "registration_id": f"reg_{uuid.uuid4().hex[:8]}",
            "event_id": registration.event_id
        }
    except Exception as e:
        print(f"❌ Etkinlik kaydı hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Etkinlik kaydı oluşturulurken hata: {str(e)}")

# Notifications endpoints
@app.get("/api/notifications")
async def get_notifications(current_user: Dict = Depends(get_current_user)):
    """Kullanıcının bildirimlerini getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        notifications = [
            {
                "id": "1",
                "type": "match",
                "title": "Yeni Eşleşme! 🎯",
                "message": "TechCorp İstanbul'dan Frontend Developer pozisyonu ile %94 eşleşme! Bu fırsat tam senin profiline uygun.",
                "timestamp": datetime.datetime.now() - datetime.timedelta(hours=3),
                "read": False,
                "priority": "high",
                "actionUrl": "/jobs/1",
                "actionText": "Detayları Gör"
            },
            {
                "id": "2",
                "type": "application",
                "title": "Başvuru Durumu Güncellendi 📄",
                "message": "StartupX'e yaptığınız başvuru 'İnceleme' aşamasından 'Mülakat' aşamasına geçti.",
                "timestamp": datetime.datetime.now() - datetime.timedelta(hours=6),
                "read": False,
                "priority": "high",
                "actionUrl": "/dashboard",
                "actionText": "Başvuruları Gör"
            },
            {
                "id": "3",
                "type": "interview",
                "title": "Mülakat Daveti 🎉",
                "message": "DataFlow'dan Python Developer pozisyonu için mülakat daveti aldınız. Mülakat tarihi: 25 Ocak 2025, 14:00.",
                "timestamp": datetime.datetime.now() - datetime.timedelta(days=1),
                "read": True,
                "priority": "high",
                "actionUrl": "/interview-prep",
                "actionText": "Hazırlığa Başla"
            }
        ]
        
        return {
            "success": True,
            "notifications": notifications
        }
    except Exception as e:
        print(f"❌ Bildirimler getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bildirimler getirilirken hata: {str(e)}")

@app.put("/api/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Bildirimi okundu olarak işaretle"""
    try:
        print(f"✅ Bildirim okundu: {notification_id}")
        
        return {
            "success": True,
            "message": "Bildirim okundu olarak işaretlendi"
        }
    except Exception as e:
        print(f"❌ Bildirim işaretleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Bildirim işaretlenirken hata: {str(e)}")

# Network endpoints
@app.get("/api/network/members")
async def get_network_members(current_user: Dict = Depends(get_current_user)):
    """UpSchool network üyelerini getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        members = [
            {
                "id": "1",
                "name": "Ayşe Kaya",
                "bootcamp": "Frontend Development",
                "currentRole": "Frontend Developer",
                "company": "Trendyol",
                "location": "İstanbul",
                "skills": ["React", "TypeScript", "Node.js"],
                "experience": "2 yıl",
                "isOnline": True,
                "profileImage": "/api/placeholder/40/40",
                "bio": "Frontend Developer olarak kariyer yapmaktayım.",
                "commonSkills": 3,
                "connectionStatus": "connected"
            },
            {
                "id": "2", 
                "name": "Mehmet Öztürk",
                "bootcamp": "Backend Development",
                "currentRole": "Backend Developer", 
                "company": "Getir",
                "location": "İstanbul",
                "skills": ["Python", "Django", "PostgreSQL"],
                "experience": "1.5 yıl",
                "isOnline": False,
                "profileImage": "/api/placeholder/40/40",
                "bio": "Backend sistemlerde uzmanlaşıyorum.",
                "commonSkills": 2,
                "connectionStatus": "pending"
            }
        ]
        
        return {
            "success": True,
            "members": members
        }
    except Exception as e:
        print(f"❌ Network üyeleri getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network üyeleri getirilirken hata: {str(e)}")

# Settings endpoints
@app.get("/api/settings")
async def get_settings(current_user: Dict = Depends(get_current_user)):
    """Kullanıcı ayarlarını getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        settings = {
            "emailNotifications": True,
            "pushNotifications": True,
            "jobAlerts": True,
            "mentorshipUpdates": True,
            "communityNews": False,
            "profileVisibility": "public",
            "showEmail": False,
            "showPhone": False,
            "searchableProfile": True,
            "language": "tr",
            "theme": "light",
            "jobEmailFrequency": "daily",
            "remoteWork": True,
            "locationPreferences": ["İstanbul", "Ankara"]
        }
        
        return {
            "success": True,
            "settings": settings
        }
    except Exception as e:
        print(f"❌ Ayarlar getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ayarlar getirilirken hata: {str(e)}")

class SettingsUpdate(BaseModel):
    settings: Dict[str, Any]

@app.put("/api/settings")
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: Dict = Depends(get_current_user)
):
    """Kullanıcı ayarlarını güncelle"""
    try:
        print(f"⚙️ Ayarlar güncelleniyor: {current_user['firstName']} {current_user['lastName']}")
        
        # Gerçek uygulamada ayarlar veritabanına kaydedilir
        print(f"   Yeni ayarlar: {settings_data.settings}")
        
        return {
            "success": True,
            "message": "Ayarlar başarıyla güncellendi",
            "settings": settings_data.settings
        }
    except Exception as e:
        print(f"❌ Ayarlar güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ayarlar güncellenirken hata: {str(e)}")

# Mentor endpoints
@app.get("/api/mentors")
async def get_available_mentors(current_user: Dict = Depends(get_current_user)):
    """Mevcut mentorları getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        # Gerçekte kullanıcılar mentor olmak istediğinde bu listede görünürler
        mentors = [
            {
                "id": "m1",
                "name": "Gizem Aktaş",
                "title": "Senior Engineering Manager",
                "company": "Meta",
                "experience": "8 yıl",
                "specialties": ["Career Growth", "Leadership", "System Design", "Team Management"],
                "location": "London (Remote)",
                "isAvailable": True,
                "profileImage": "/api/placeholder/50/50",
                "bio": "Meta'da Engineering Manager olarak çalışıyorum. Kariyer geçişi yapan kadınlara özel odaklanıyorum.",
                "menteeCount": 15,
                "rating": 4.9,
                "availability": "Hafta içi 20:00-22:00, Cumartesi 15:00-18:00"
            },
            {
                "id": "m2",
                "name": "Ayşe Demir",
                "title": "Senior Frontend Developer",
                "company": "Spotify",
                "experience": "6 yıl",
                "specialties": ["Frontend Development", "React", "TypeScript", "Teknik Mülakat Hazırlığı"],
                "location": "Stockholm (Remote)",
                "isAvailable": True,
                "profileImage": "/api/placeholder/50/50",
                "bio": "Spotify'da frontend geliştirici olarak çalışıyorum. React ve modern frontend teknolojileri konularında yardımcı olabilirim.",
                "menteeCount": 8,
                "rating": 4.8,
                "availability": "Hafta içi 19:00-21:00, Pazar 14:00-17:00"
            }
        ]
        
        return {
            "success": True,
            "mentors": mentors
        }
    except Exception as e:
        print(f"❌ Mentorlar getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mentorlar getirilirken hata: {str(e)}")

class MentorProfile(BaseModel):
    isAvailable: bool
    specialties: List[str]
    experience: str
    availability: str
    bio: str

@app.put("/api/profile/mentorship")
async def update_mentor_profile(
    mentor_data: MentorProfile,
    current_user: Dict = Depends(get_current_user)
):
    """Kullanıcının mentor profilini güncelle"""
    try:
        print(f"🎯 Mentor profili güncelleniyor: {current_user['firstName']} {current_user['lastName']}")
        print(f"   Mentor olmak istiyor: {mentor_data.isAvailable}")
        print(f"   Uzmanlık alanları: {mentor_data.specialties}")
        
        # Gerçek uygulamada mentor bilgileri kullanıcı profiline kaydedilir
        # Ve mentor_data.isAvailable=True ise kullanıcı mentor listesine eklenir
        
        return {
            "success": True,
            "message": "Mentor profili başarıyla güncellendi",
            "mentorship": mentor_data.dict()
        }
    except Exception as e:
        print(f"❌ Mentor profili güncelleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mentor profili güncellenirken hata: {str(e)}")

@app.get("/api/profile/mentorship")
async def get_mentor_profile(current_user: Dict = Depends(get_current_user)):
    """Kullanıcının mentor profilini getir"""
    try:
        # Mock data - gerçek uygulamada veritabanından gelir
        mentorship = {
            "isAvailable": False,
            "specialties": [],
            "experience": "",
            "menteeCount": 0,
            "availability": "",
            "bio": ""
        }
        
        return {
            "success": True,
            "mentorship": mentorship
        }
    except Exception as e:
        print(f"❌ Mentor profili getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mentor profili getirilirken hata: {str(e)}")

# Messaging endpoints
@app.get("/api/conversations/{mentor_id}")
async def get_conversation(mentor_id: str, current_user: Dict = Depends(get_current_user)):
    """Belirli bir mentor ile olan konuşmayı getir"""
    try:
        print(f"💬 Konuşma getiriliyor: {current_user['firstName']} - Mentor: {mentor_id}")
        
        # Mock messages - gerçek uygulamada veritabanından gelir
        messages = [
            {
                "id": "msg1",
                "senderId": mentor_id,
                "receiverId": current_user.get('id', 'current_user'),
                "content": f"Merhaba {current_user['firstName']}! Size nasıl yardımcı olabilirim?",
                "timestamp": "2024-01-15T10:00:00Z",
                "read": True,
                "type": "text"
            },
            {
                "id": "msg2", 
                "senderId": current_user.get('id', 'current_user'),
                "receiverId": mentor_id,
                "content": "Merhaba! Kariyer geçişi konusunda tavsiyelerinizi almak istiyorum.",
                "timestamp": "2024-01-15T10:05:00Z",
                "read": True,
                "type": "text"
            },
            {
                "id": "msg3",
                "senderId": mentor_id,
                "receiverId": current_user.get('id', 'current_user'),
                "content": "Tabii ki! Hangi alandan hangi alana geçiş yapmayı planlıyorsunuz? Mevcut deneyiminizi de paylaşabilir misiniz?",
                "timestamp": "2024-01-15T10:10:00Z",
                "read": True,
                "type": "text"
            }
        ]
        
        return {
            "success": True,
            "messages": messages
        }
    except Exception as e:
        print(f"❌ Konuşma getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Konuşma getirilirken hata: {str(e)}")

class MessageSend(BaseModel):
    receiverId: str
    content: str
    type: str = "text"

@app.post("/api/messages/send")
async def send_message(
    message_data: MessageSend,
    current_user: Dict = Depends(get_current_user)
):
    """Mentor'a mesaj gönder"""
    try:
        print(f"📤 Mesaj gönderiliyor: {current_user['firstName']} -> {message_data.receiverId}")
        print(f"   İçerik: {message_data.content[:50]}...")
        
        # Gerçek uygulamada mesaj veritabanına kaydedilir
        new_message = {
            "id": f"msg_{int(time.time() * 1000)}",
            "senderId": current_user.get('id', 'current_user'),
            "receiverId": message_data.receiverId,
            "content": message_data.content,
            "timestamp": datetime.now().isoformat() + "Z",
            "read": False,
            "type": message_data.type
        }
        
        return {
            "success": True,
            "message": new_message
        }
    except Exception as e:
        print(f"❌ Mesaj gönderme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Mesaj gönderilirken hata: {str(e)}")

@app.get("/api/conversations")
async def get_all_conversations(current_user: Dict = Depends(get_current_user)):
    """Kullanıcının tüm konuşmalarını getir"""
    try:
        print(f"💬 Tüm konuşmalar getiriliyor: {current_user['firstName']}")
        
        # Mock conversation list - gerçek uygulamada veritabanından gelir
        conversations = [
            {
                "id": "conv1",
                "mentorId": "m1",
                "mentorName": "Gizem Aktaş",
                "mentorTitle": "Senior Engineering Manager",
                "mentorCompany": "Meta",
                "lastMessage": "Tabii ki! Hangi alandan hangi alana geçiş yapmayı planlıyorsunuz?",
                "lastMessageTime": "2024-01-15T10:10:00Z",
                "unreadCount": 0,
                "mentorImage": "/api/placeholder/50/50"
            },
            {
                "id": "conv2",
                "mentorId": "m2", 
                "mentorName": "Ayşe Demir",
                "mentorTitle": "Senior Frontend Developer",
                "mentorCompany": "Spotify",
                "lastMessage": "React konusunda sorularınız olursa çekinmeyin",
                "lastMessageTime": "2024-01-14T16:30:00Z",
                "unreadCount": 2,
                "mentorImage": "/api/placeholder/50/50"
            }
        ]
        
        return {
            "success": True,
            "conversations": conversations
        }
    except Exception as e:
        print(f"❌ Konuşmalar getirme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Konuşmalar getirilirken hata: {str(e)}")

@app.put("/api/conversations/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Konuşmayı okundu olarak işaretle"""
    try:
        print(f"✅ Konuşma okundu işaretleniyor: {conversation_id}")
        
        # Gerçek uygulamada veritabanında güncellenir
        return {
            "success": True,
            "message": "Konuşma okundu olarak işaretlendi"
        }
    except Exception as e:
        print(f"❌ Konuşma okundu işaretleme hatası: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Konuşma işaretlenirken hata: {str(e)}")

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