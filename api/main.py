"""
Up Hera API - Production Ready
UpSchool Mezunu Teknoloji Kadınları İçin Tam Çalışan İş Platformu
"""

import asyncio
import uuid
import json
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile, Query, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from pydantic import BaseModel
import uvicorn

# Configuration
from config import settings

# Database imports
from database import (
    init_db, create_user, get_user_by_email, get_user_by_id, 
    update_user, authenticate_user, create_session, 
    validate_session, hash_password
)

# Services
from services.enhanced_ai_service import enhanced_ai_service
from services.job_service import job_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Up Hera API",
    description="UpSchool Mezunu Teknoloji Kadınları İçin AI Destekli İş Platformu",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic Models
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

class LoginRequest(BaseModel):
    email: str
    password: str
    user_type: Optional[str] = "mezun"

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

class ChatRequest(BaseModel):
    message: str
    context: str = "general"
    use_streaming: bool = True

class JobApplicationRequest(BaseModel):
    cover_letter: str = ""
    resume_content: str = ""

# Utility functions
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    user = validate_session(token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize database
        init_db()
        logger.info("✅ Database initialized")
        
        # Initialize AI service
        logger.info("✅ AI service initialized")
        
        # Initialize job service
        logger.info("✅ Job service initialized")
        
        # Create upload directory
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        logger.info("✅ Upload directory created")
        
        logger.info("🚀 Up Hera API started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise

# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Up Hera API v3.0 - UpSchool Mezunu Teknoloji Kadınları İçin AI Destekli İş Platformu",
        "status": "running",
        "features": [
            "AI Destekli Kariyer Koçu",
            "Akıllı İş Eşleştirme",
            "CV Upload & Analysis",
            "Gerçek Zamanlı Chat",
            "İş Başvuru Sistemi"
        ],
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        test_user = get_user_by_id("test")  # This will test DB connection
        
        # Test AI service
        ai_status = await enhanced_ai_service.check_ollama_status()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "database": "connected",
                "ai_service": "connected" if ai_status else "fallback_mode"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Authentication endpoints
@app.post("/api/auth/graduate/register")
async def register_graduate(graduate: GraduateRegistration):
    """Register new graduate"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(graduate.email)
        if existing_user:
            raise HTTPException(status_code=409, detail="Bu e-posta adresi zaten kayıtlı")
        
        # Create user
        user_data = {
            "email": graduate.email,
            "password": graduate.password,
            "firstName": graduate.firstName,
            "lastName": graduate.lastName,
            "upschoolProgram": graduate.upschoolProgram,
            "graduationDate": graduate.graduationDate,
            "experienceLevel": graduate.experienceLevel,
            "location": graduate.location,
            "skills": graduate.skills,
            "userType": "mezun"
        }
        
        user_id = create_user(user_data)
        
        logger.info(f"✅ New graduate registered: {graduate.firstName} {graduate.lastName}")
        
        return {
            "success": True,
            "message": f"Hoş geldin {graduate.firstName}! Hesabın başarıyla oluşturuldu.",
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
        logger.error(f"❌ Registration error: {e}")
        raise HTTPException(status_code=500, detail="Kayıt sırasında hata oluştu")

@app.post("/api/auth/login")
async def login(request: LoginRequest):
    """User login"""
    try:
        # Authenticate user
        user = authenticate_user(request.email, request.password)
        
        if not user:
            raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
        
        # Create session
        token = create_session(user["id"])
        
        logger.info(f"✅ Login successful: {user['firstName']} {user['lastName']}")
        
        return {
            "success": True,
            "message": f"Hoş geldin {user['firstName']}! 👋",
            "user": {
                "id": user["id"],
                "name": f"{user['firstName']} {user['lastName']}",
                "email": user["email"],
                "program": user.get("upschoolProgram", ""),
                "user_type": user.get("userType", "mezun")
            },
            "token": token,
            "redirect_url": "/dashboard"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail="Giriş sırasında hata oluştu")

@app.get("/api/auth/profile")
async def get_profile(current_user: Dict = Depends(get_current_user)):
    """Get user profile"""
    try:
        return {
            "success": True,
            "user": current_user
        }
    except Exception as e:
        logger.error(f"❌ Profile error: {e}")
        raise HTTPException(status_code=500, detail="Profil alınırken hata oluştu")

@app.put("/api/auth/profile")
async def update_profile(
    profile_data: ProfileUpdateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Update user profile"""
    try:
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
            updated_user = get_user_by_id(current_user["id"])
            return {
                "success": True,
                "message": "Profil başarıyla güncellendi!",
                "user": updated_user
            }
        else:
            raise HTTPException(status_code=500, detail="Profil güncellenirken hata oluştu")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Profile update error: {e}")
        raise HTTPException(status_code=500, detail="Profil güncelleme hatası")

# AI Chat endpoints
@app.post("/ai-coach/chat")
async def ai_chat(
    request: ChatRequest,
    current_user: Dict = Depends(get_current_user)
):
    """AI chat with non-streaming response"""
    try:
        response_text = ""
        async for chunk in enhanced_ai_service.enhanced_chat(
            user_id=current_user["id"],
            message=request.message,
            context=request.context,
            use_streaming=False
        ):
            response_text += chunk
        
        return {
            "success": True,
            "response": response_text,
            "suggestions": [
                "Kariyer hedeflerim neler olmalı?",
                "Teknik becerilerimi nasıl geliştirebilirim?",
                "Mülakat hazırlığı için ne yapmalıyım?"
            ]
        }
        
    except Exception as e:
        logger.error(f"❌ AI chat error: {e}")
        raise HTTPException(status_code=500, detail="AI sohbet hatası")

@app.post("/ai-coach/chat/stream")
async def ai_chat_stream(
    request: ChatRequest,
    current_user: Dict = Depends(get_current_user)
):
    """AI chat with streaming response"""
    try:
        async def generate():
            async for chunk in enhanced_ai_service.enhanced_chat(
                user_id=current_user["id"],
                message=request.message,
                context=request.context,
                use_streaming=True
            ):
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        return StreamingResponse(
            generate(), 
            media_type="text/plain",
            headers={"Cache-Control": "no-cache"}
        )
        
    except Exception as e:
        logger.error(f"❌ AI stream error: {e}")
        raise HTTPException(status_code=500, detail="AI stream hatası")

@app.post("/ai-coach/document/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: Dict = Depends(get_current_user)
):
    """Upload and analyze document (CV, etc.)"""
    try:
        # Validate file
        if file.size > settings.MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="Dosya boyutu çok büyük (max 10MB)")
        
        # Read file content
        content = await file.read()
        
        # Process based on file type
        if file.content_type == "application/pdf":
            # TODO: Implement PDF text extraction
            text_content = "PDF content extraction not implemented yet"
        else:
            text_content = content.decode('utf-8', errors='ignore')
        
        # Upload to AI service
        result = await enhanced_ai_service.upload_document(
            user_id=current_user["id"],
            filename=file.filename,
            content=text_content
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Document upload error: {e}")
        raise HTTPException(status_code=500, detail="Döküman yükleme hatası")

@app.get("/ai-coach/history")
async def get_chat_history(
    current_user: Dict = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    """Get user's chat history"""
    try:
        history = enhanced_ai_service.get_chat_history(current_user["id"], limit)
        return {
            "success": True,
            "history": history
        }
    except Exception as e:
        logger.error(f"❌ Chat history error: {e}")
        raise HTTPException(status_code=500, detail="Sohbet geçmişi alınamadı")

@app.get("/ai-coach/insights")
async def get_ai_insights(current_user: Dict = Depends(get_current_user)):
    """Get user's AI insights"""
    try:
        insights = enhanced_ai_service.get_user_insights(current_user["id"])
        return {
            "success": True,
            "insights": insights
        }
    except Exception as e:
        logger.error(f"❌ AI insights error: {e}")
        raise HTTPException(status_code=500, detail="AI içgörüleri alınamadı")

# Job endpoints
@app.get("/api/jobs")
async def get_jobs(
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    location: str = Query(""),
    job_type: str = Query(""),
    experience_level: str = Query(""),
    remote_only: bool = Query(False),
    search: str = Query(""),
    current_user: Dict = Depends(get_current_user)
):
    """Get job listings with filters"""
    try:
        jobs_data = job_service.get_jobs(
            limit=limit,
            offset=offset,
            location=location,
            job_type=job_type,
            experience_level=experience_level,
            remote_only=remote_only,
            search_query=search
        )
        
        return {
            "success": True,
            **jobs_data
        }
        
    except Exception as e:
        logger.error(f"❌ Jobs error: {e}")
        raise HTTPException(status_code=500, detail="İş ilanları alınamadı")

@app.get("/api/jobs/{job_id}")
async def get_job(
    job_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get single job by ID"""
    try:
        job = job_service.get_job_by_id(job_id)
        
        if not job:
            raise HTTPException(status_code=404, detail="İş ilanı bulunamadı")
        
        return {
            "success": True,
            "job": job
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Job detail error: {e}")
        raise HTTPException(status_code=500, detail="İş ilanı detayı alınamadı")

@app.post("/api/jobs/{job_id}/apply")
async def apply_to_job(
    job_id: str,
    application: JobApplicationRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Apply to a job"""
    try:
        result = job_service.apply_to_job(
            user_id=current_user["id"],
            job_id=job_id,
            cover_letter=application.cover_letter,
            resume_content=application.resume_content
        )
        
        return result
        
    except Exception as e:
        logger.error(f"❌ Job application error: {e}")
        raise HTTPException(status_code=500, detail="Başvuru gönderilirken hata oluştu")

@app.get("/api/jobs/my/applications")
async def get_my_applications(current_user: Dict = Depends(get_current_user)):
    """Get user's job applications"""
    try:
        applications = job_service.get_user_applications(current_user["id"])
        return {
            "success": True,
            "applications": applications
        }
    except Exception as e:
        logger.error(f"❌ Applications error: {e}")
        raise HTTPException(status_code=500, detail="Başvurular alınamadı")

@app.post("/api/jobs/{job_id}/bookmark")
async def bookmark_job(
    job_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Bookmark/unbookmark a job"""
    try:
        result = job_service.bookmark_job(current_user["id"], job_id)
        return result
    except Exception as e:
        logger.error(f"❌ Bookmark error: {e}")
        raise HTTPException(status_code=500, detail="Favori işlemi başarısız")

@app.get("/api/jobs/my/bookmarks")
async def get_my_bookmarks(current_user: Dict = Depends(get_current_user)):
    """Get user's bookmarked jobs"""
    try:
        bookmarks = job_service.get_user_bookmarks(current_user["id"])
        return {
            "success": True,
            "bookmarks": bookmarks
        }
    except Exception as e:
        logger.error(f"❌ Bookmarks error: {e}")
        raise HTTPException(status_code=500, detail="Favoriler alınamadı")

# Network/Community endpoints
@app.get("/api/network/success-stories")
async def get_success_stories():
    """Get success stories from community"""
    # Mock data for now - can be extended with real database
    stories = [
        {
            "id": "1",
            "name": "Ayşe Yılmaz",
            "title": "Frontend Developer at TechCorp",
            "program": "Full Stack Development",
            "graduation_date": "2024-06",
            "story": "UpSchool bootcamp'i sayesinde hayalimde olduğu gibi bir tech kariyer başlattım!",
            "linkedin": "https://linkedin.com/in/ayseyilmaz",
            "image": "https://via.placeholder.com/150x150?text=AY"
        },
        {
            "id": "2", 
            "name": "Zeynep Kara",
            "title": "Python Developer at DataTech",
            "program": "Data Science",
            "graduation_date": "2024-03",
            "story": "Ada AI mentorluğu ve topluluk desteği sayesinde ilk işimi 2 hafta içinde buldum!",
            "linkedin": "https://linkedin.com/in/zeynepkara",
            "image": "https://via.placeholder.com/150x150?text=ZK"
        }
    ]
    
    return {
        "success": True,
        "stories": stories
    }

# OPTIONS handlers for CORS
@app.options("/api/auth/graduate/register")
@app.options("/api/auth/login") 
@app.options("/api/auth/profile")
@app.options("/ai-coach/chat")
@app.options("/ai-coach/chat/stream")
@app.options("/api/jobs")
@app.options("/api/jobs/{job_id}")
@app.options("/api/jobs/{job_id}/apply")
@app.options("/api/jobs/{job_id}/bookmark")
async def options_handler():
    return Response(status_code=200)

# Run server
if __name__ == "__main__":
    uvicorn.run(
        "main_new:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_DEBUG,
        log_level="info"
    )
