"""
Up Hera API - Production Ready
UpSchool Mezunu Teknolojide Öncü Kadınlar İçin Tam Çalışan İş Platformu
"""

import asyncio
import uuid
import json
import logging
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any

from fastapi import FastAPI, HTTPException, Depends, Header, File, UploadFile, Query, Request, BackgroundTasks, WebSocket, WebSocketDisconnect, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, Response
from pydantic import BaseModel
try:
    # Pydantic v2
    from pydantic import ConfigDict  # type: ignore
except Exception:
    ConfigDict = None  # type: ignore
import uvicorn

# Configuration
try:
    # Running as package (e.g., pytest, uvicorn with repo root)
    from api.config import settings
    from api.database import (
        init_db, create_user, get_user_by_email, get_user_by_id,
        update_user, authenticate_user, create_session,
        validate_session, hash_password, get_db_connection,
    )
    from api.services.enhanced_ai_service import enhanced_ai_service
    from api.services.job_service import job_service
    from api.services.websocket_service import websocket_service, manager
except ImportError:
    # Running as script from api/ (e.g., CI integration step)
    from config import settings
    from database import (
        init_db, create_user, get_user_by_email, get_user_by_id,
        update_user, authenticate_user, create_session,
        validate_session, hash_password, get_db_connection,
    )
    try:
        from services.enhanced_ai_service import enhanced_ai_service
    except ImportError:
        enhanced_ai_service = None
    try:
        from services.job_service import job_service
    except ImportError:
        job_service = None
    try:
        from services.websocket_service import websocket_service, manager
    except ImportError:
        websocket_service = None
        manager = None

"""Configure logging early so it's available during imports below"""
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if enhanced_ai_service is None:
    logger.warning("Enhanced AI service not available")
if job_service is None:
    logger.warning("Job service not available")
if websocket_service is None:
    logger.warning("WebSocket service not available")

# Initialize FastAPI app
app = FastAPI(
    title="Up Hera API",
    description="UpSchool Mezunu Teknolojide Öncü Kadınlar İçin AI Destekli İş Platformu",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security headers middleware expected by tests
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("X-XSS-Protection", "1; mode=block")
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https?://.*",
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "User-Agent", "DNT", "Cache-Control", "X-Requested-With"],
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
    # Tüm alanları opsiyonel yapıyoruz ki kısmi güncellemeler 422 hatasına düşmesin
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    upschoolProgram: Optional[str] = None
    graduationDate: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    location: Optional[str] = None
    portfolioUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    linkedinUrl: Optional[str] = None
    aboutMe: Optional[str] = None
    # Forbid unknown fields so invalid payloads raise 422 in tests
    if ConfigDict is not None:
        model_config = ConfigDict(extra="forbid")

class ChatRequest(BaseModel):
    message: str
    context: str = "general"
    use_streaming: bool = True
    user_data: Optional[Dict] = None
    conversation_history: Optional[List[Dict]] = []
    stream: Optional[bool] = True
    use_enhanced: Optional[bool] = True
    response_mode: Optional[str] = "auto"  # "auto" | "short" | "long"
    max_tokens: Optional[int] = None

class JobApplicationRequest(BaseModel):
    cover_letter: str = ""
    resume_content: str = ""

# Utility functions
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Get current authenticated user"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    try:
        token = authorization.split(" ")[1]
        user = validate_session(token)

        # Demo giriş için fallback: Frontend'te demo-token-* ile gelen istekleri kabul et
        if not user and token.startswith("demo-token"):
            try:
                demo_email = os.getenv("DEMO_USER_EMAIL", "demo@uphera.com")
                demo_first = os.getenv("DEMO_USER_FIRST", "Demo")
                demo_last = os.getenv("DEMO_USER_LAST", "Kullanici")

                existing = get_user_by_email(demo_email)
                if not existing:
                    # Demo kullanıcıyı oluştur
                    demo_user_data = {
                        "email": demo_email,
                        "password": os.getenv("DEMO_USER_PASSWORD", "123456"),
                        "firstName": demo_first,
                        "lastName": demo_last,
                        "upschoolProgram": "Full Stack Development",
                        "graduationDate": "2024",
                        "experienceLevel": "junior",
                        "location": "Istanbul",
                        "skills": ["React", "TypeScript", "Python"],
                        "userType": "mezun"
                    }
                    create_user(demo_user_data)
                    existing = get_user_by_email(demo_email)

                # Demo kullanıcı nesnesini geri döndür
                if existing:
                    return existing
            except Exception as demo_err:
                logger.warning(f"Demo user fallback failed: {demo_err}")

        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return user
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Optional[Dict[str, Any]]:
    """Get current authenticated user (optional - returns None if not authenticated)"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    try:
        token = authorization.split(" ")[1]
        user = validate_session(token)
        return user
    except Exception as e:
        logger.warning(f"Optional authentication failed: {e}")
        return None

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize database
        init_db()
        logger.info("✅ Database initialized")

        # Ensure default admin user exists
        try:
            admin_email = os.getenv("ADMIN_EMAIL", "admin@gmail.com").lower().strip()
            admin_password = os.getenv("ADMIN_PASSWORD", "123456")
            existing_admin = get_user_by_email(admin_email)
            if not existing_admin:
                create_user({
                    "email": admin_email,
                    "password": admin_password,
                    "firstName": "Admin",
                    "lastName": "User",
                    "upschoolProgram": "Administration",
                    "graduationDate": "",
                    "experienceLevel": "senior",
                    "location": "Istanbul",
                    "skills": ["admin"],
                    "userType": "admin"
                })
                logger.info("✅ Default admin user created: admin@gmail.com")
            else:
                # If exists, just log
                logger.info("ℹ️ Admin user already exists")
        except Exception as e:
            logger.warning(f"Admin bootstrap failed: {e}")
        
        # Initialize AI service
        logger.info("✅ AI service initialized")
        
        # Initialize job service
        logger.info("✅ Job service initialized")
        
        # Create upload directory if needed
        upload_dir = getattr(settings, 'UPLOAD_DIR', './uploads')
        os.makedirs(upload_dir, exist_ok=True)
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
        "message": "Up Hera API v3.0 - UpSchool Mezunu Teknolojide Öncü Kadınlar İçin AI Destekli İş Platformu",
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
        conn, cursor = get_db_connection()
        cursor.execute("SELECT 1")
        conn.close()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {
                "database": "connected",
                "ai_service": "disabled_for_vercel"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# Trailing slash variant
@app.get("/health/")
async def health_check_slash():
    return await health_check()

@app.get("/health/detailed")
async def health_detailed():
    try:
        # Database check
        db_status = "disconnected"
        try:
            conn, cursor = get_db_connection()
            cursor.execute("SELECT 1")
            conn.close()
            db_status = "connected"
        except Exception as e:
            db_status = f"error: {e}"

        # Memory check (simple OK)
        memory_status = {"status": "ok"}

        return {
            "status": "healthy",
            "checks": {
                "database": db_status,
                "memory": memory_status
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# Authentication endpoints
@app.post("/api/auth/graduate/register")
async def register_graduate(graduate: GraduateRegistration):
    """Register new graduate"""
    try:
        # Validate email format
        email = graduate.email.lower().strip()
        if not email or "@" not in email:
            raise HTTPException(status_code=400, detail="Geçerli bir e-posta adresi girin")
        
        # Validate password strength
        if len(graduate.password) < 6:
            return JSONResponse(status_code=400, content={
                "detail": {"error": "Weak password"}
            })
        
        # Check if user already exists
        existing_user = get_user_by_email(email)
        if existing_user:
            return JSONResponse(status_code=409, content={
                "message": "Email already exists"
            })
        
        # Create user
        user_data = {
            "email": email,
            "password": graduate.password,
            "firstName": graduate.firstName.strip(),
            "lastName": graduate.lastName.strip(),
            "upschoolProgram": graduate.upschoolProgram,
            "graduationDate": graduate.graduationDate,
            "experienceLevel": graduate.experienceLevel,
            "location": graduate.location,
            "skills": graduate.skills,
            "userType": "mezun"
        }
        
        user_id = create_user(user_data)
        
        # Create session for auto-login
        token = create_session(user_id)
        
        logger.info(f"✅ New graduate registered: {graduate.firstName} {graduate.lastName}")
        
        return {
            "success": True,
            "message": f"Hoş geldin {graduate.firstName}! Hesabın başarıyla oluşturuldu.",
            "user": {
                "id": user_id,
                "name": f"{graduate.firstName} {graduate.lastName}",
                "email": email,
                "program": graduate.upschoolProgram
            },
            "token": token,
            "access_token": token,
            "redirect_url": "/dashboard"
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
        # Validate input
        email = request.email.lower().strip()
        if not email or not request.password:
            raise HTTPException(status_code=400, detail="E-posta ve şifre gerekli")
        
        # Authenticate user
        user = authenticate_user(email, request.password)
        
        if not user:
            return JSONResponse(status_code=401, content={
                "message": "Invalid email or password"
            })
        
        # Create session
        token = create_session(user["id"])
        
        logger.info(f"✅ Login successful: {user['firstName']} {user['lastName']}")
        
        user_type = user.get("userType", "mezun")
        redirect_url = "/admin" if user_type == "admin" else "/dashboard"

        return {
            "success": True,
            "message": f"Hoş geldin {user['firstName']}! 👋",
            "user": {
                "id": user["id"],
                "name": f"{user['firstName']} {user['lastName']}",
                "email": user["email"],
                "program": user.get("upschoolProgram", ""),
                "user_type": user_type
            },
            "token": token,
            "access_token": token,
            "redirect_url": redirect_url
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
        # Mevcut kullanıcı verisini al ve kısmi güncellemeleri merge et
        existing_user = get_user_by_id(current_user["id"]) or {}
        update_data = {
            "firstName": profile_data.firstName if profile_data.firstName is not None else existing_user.get("firstName", ""),
            "lastName": profile_data.lastName if profile_data.lastName is not None else existing_user.get("lastName", ""),
            "phone": profile_data.phone if profile_data.phone is not None else existing_user.get("phone", ""),
            "upschoolProgram": profile_data.upschoolProgram if profile_data.upschoolProgram is not None else existing_user.get("upschoolProgram", ""),
            "graduationDate": profile_data.graduationDate if profile_data.graduationDate is not None else existing_user.get("graduationDate", ""),
            "skills": profile_data.skills if profile_data.skills is not None else existing_user.get("skills", []),
            "experienceLevel": profile_data.experience if profile_data.experience is not None else existing_user.get("experienceLevel", "entry"),
            "location": profile_data.location if profile_data.location is not None else existing_user.get("location", ""),
            "portfolioUrl": profile_data.portfolioUrl if profile_data.portfolioUrl is not None else existing_user.get("portfolioUrl", ""),
            "githubUrl": profile_data.githubUrl if profile_data.githubUrl is not None else existing_user.get("githubUrl", ""),
            "linkedinUrl": profile_data.linkedinUrl if profile_data.linkedinUrl is not None else existing_user.get("linkedinUrl", ""),
            "aboutMe": profile_data.aboutMe if profile_data.aboutMe is not None else existing_user.get("aboutMe", ""),
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
        # Hatanın detayını döndürerek frontend'in anlamlı mesaj göstermesini sağla
        raise HTTPException(status_code=500, detail=f"Profil güncelleme hatası: {str(e)}")

# AI Chat endpoints - use enhanced_ai_service
@app.post("/ai-coach/chat")
async def ai_chat(
    data: Optional[Dict[str, Any]] = Body(None),
    current_user: Dict = Depends(get_current_user)
):
    """Non-streaming AI chat using enhanced_ai_service (auth before validation)"""
    try:
        user_id = current_user.get('id', 'anonymous')

        if not data or not isinstance(data, dict) or not data.get("message"):
            raise HTTPException(status_code=422, detail="'message' field is required")

        message = str(data.get("message", ""))
        context = str(data.get("context", "general"))
        # Use enhanced_ai_service in non-streaming mode
        chunks: List[str] = []
        async for chunk in enhanced_ai_service.enhanced_chat(
            user_id=user_id,
            message=message,
            context=context,
            use_streaming=False
        ):
            chunks.append(chunk)
        response = "".join(chunks)
        
        # Generate multiple suggestions (Turkish)
        suggestions = [
            "Teknik geçmişin ve deneyimlerinden biraz daha bahsetmek ister misin?",
            "Uzun vadeli kariyer hedeflerin neler?",
            "Teknik mülakatlara hazırlanmanda nasıl yardımcı olabilirim?",
            "Hangi becerilerini daha fazla geliştirmek istersin?",
            "Network geliştirme stratejileri hakkında konuşmak ister misin?",
            "CV ve LinkedIn profilini nasıl optimize edebiliriz?",
            "Şu anda kariyerinde karşılaştığın en büyük zorluk nedir?",
            "Mentorluk fırsatlarını birlikte değerlendirelim mi?",
            "Portföyünü güçlendirmek için neler ekleyebiliriz?",
            "İş-yaşam dengeni geliştirmek için nasıl bir plan yapabiliriz?"
        ]
        
        return {
            "success": True,
            "response": response,
            "suggestions": suggestions[:5],  # Return top 5 suggestions
            "token_usage": "optimized_for_maximum_engagement"
        }
        
    except Exception as e:
        print(f"❌ AI Chat Error: {str(e)}")
        return {
            "success": False,
            "response": f"AI servis hatası: {str(e)}",
            "suggestions": [
                "Teknik becerilerimi nasıl geliştirebilirim?",
                "Mülakat hazırlığı için ne yapmalıyım?",
                "Kariyer hedeflerim neler olmalı?"
            ]
        }

@app.post("/ai-coach/chat/stream")
async def ai_chat_stream(
    data: Optional[Dict[str, Any]] = Body(None),
    current_user: Dict = Depends(get_current_user)
):
    """Streaming AI chat using enhanced_ai_service (auth before validation)"""
    try:
        user_id = current_user.get('id', 'anonymous')

        if not data or not isinstance(data, dict) or not data.get("message"):
            raise HTTPException(status_code=422, detail="'message' field is required")

        message = str(data.get("message", ""))
        context = str(data.get("context", "general"))
        
        # Fully consume the streaming generator to catch errors early
        collected: List[str] = []
        async for chunk in enhanced_ai_service.enhanced_chat(
            user_id=user_id,
            message=message,
            context=context,
            use_streaming=True
        ):
            collected.append(chunk)

        async def generate():
            for chunk in collected:
                yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

        return StreamingResponse(
            generate(), 
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache"
            }
        )
        
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": f"AI stream hatası: {str(e)}"})

@app.get("/ai-coach/chat/stream-get")
async def ai_chat_stream_get(
    message: str = Query(...),
    context: str = Query("general"),
    response_mode: str = Query("auto"),
    max_tokens: Optional[int] = Query(None),
    current_user: Optional[Dict] = Depends(get_current_user_optional)
):
    """GET-based SSE endpoint for mobile/Safari compatibility (EventSource)."""
    try:
        from services.enhanced_ai_coach import get_enhanced_ai_response

        user_id = current_user.get('id', 'anonymous') if current_user else 'anonymous'

        async def generate():
            try:
                # Initial ping
                yield f"data: {json.dumps({'type': 'info', 'content': 'connected'})}\n\n"

                # Build user_data with response preferences
                user_data = {"response_mode": response_mode}
                if max_tokens is not None:
                    user_data["max_tokens"] = max_tokens

                queue: asyncio.Queue = asyncio.Queue()

                async def produce():
                    try:
                        async for chunk in get_enhanced_ai_response(
                            user_id=user_id,
                            message=message,
                            context=context,
                            user_data=user_data,
                            conversation_history=[],
                        ):
                            await queue.put(chunk)
                    except Exception as e:
                        await queue.put(f"__ERROR__:{str(e)}")
                    finally:
                        await queue.put("__DONE__")

                producer_task = asyncio.create_task(produce())

                while True:
                    try:
                        item = await asyncio.wait_for(queue.get(), timeout=10)
                    except asyncio.TimeoutError:
                        yield ": keep-alive\n\n"
                        continue

                    if item == "__DONE__":
                        break
                    if isinstance(item, str) and item.startswith("__ERROR__:"):
                        err_msg = item.split(":", 1)[1]
                        yield f"data: {json.dumps({'type': 'content', 'content': '❌ Hata: ' + err_msg})}\n\n"
                        break

                    yield f"data: {json.dumps({'type': 'content', 'content': item})}\n\n"

                await producer_task

                suggestions = [
                    "Mülakat hazırlığı yapalım",
                    "CV optimizasyonu",
                    "Kariyer planlama",
                    "Teknik beceri geliştirme"
                ]
                yield f"data: {json.dumps({'type': 'done', 'enhanced': True, 'suggestions': suggestions})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'content', 'content': '❌ Hata: ' + str(e)})}\n\n"
                yield f"data: {json.dumps({'type': 'done', 'enhanced': False})}\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream; charset=utf-8",
            headers={
                "Cache-Control": "no-cache, no-transform",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    except Exception as e:
        print(f"❌ AI Chat Stream-GET Error: {str(e)}")
        return StreamingResponse(lambda: (f"data: {{\"type\": \"content\", \"content\": \"AI servis hatası: {str(e)}\"}}\n\n" for _ in [0])),
    
@app.post("/ai-coach/cv/upload")
async def upload_cv_endpoint(
    user_id: str = Query("anonymous"),
    file: UploadFile = File(...)
):
    try:
        from services.enhanced_ai_coach import upload_user_cv
        content = await file.read()
        result = await upload_user_cv(user_id, content, file.filename)
        return result
    except Exception as e:
        logger.error(f"CV upload error: {e}")
        return JSONResponse(status_code=400, content={
            "success": False,
            "message": f"CV yükleme hatası: {str(e)}"
        })

class CVInsightsRequest(BaseModel):
    user_id: str

@app.post("/ai-coach/cv/insights")
async def cv_insights_endpoint(payload: CVInsightsRequest):
    try:
        from services.enhanced_ai_coach import get_user_cv_insights
        insights = await get_user_cv_insights(payload.user_id)
        return insights
    except Exception as e:
        logger.error(f"CV insights error: {e}")
        return JSONResponse(status_code=400, content={
            "success": False,
            "message": f"CV analiz hatası: {str(e)}"
        })

@app.post("/ai-coach/document/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: Dict = Depends(get_current_user)
):
    """Upload and analyze document with comprehensive AI analysis for maximum token usage"""
    try:
        from services.enhanced_ai_coach import EnhancedAICoach
        
        # Initialize AI coach
        ai_coach = EnhancedAICoach()
        
        # Read file content
        content = await file.read()
        file_content = content.decode('utf-8') if isinstance(content, bytes) else str(content)
        
        # Create comprehensive analysis prompt for maximum token usage
        analysis_prompt = f"""
        As an expert career coach and CV analyst specializing in women in technology, provide a comprehensive analysis of the following document.
        
        User Context:
        - User ID: {current_user.get('id', 'anonymous')}
        - User Name: {current_user.get('firstName', 'User')}
        - Document Type: {file.filename}
        
        Document Content:
        {file_content}
        
        Please provide a comprehensive analysis including:
        
        1. **Executive Summary** (100-150 words)
           - Overall assessment of the document
           - Key strengths and areas for improvement
        
        2. **Detailed Content Analysis** (300-400 words)
           - Structure and organization evaluation
           - Content relevance and impact
           - Technical skills assessment
           - Experience presentation analysis
        
        3. **Specific Recommendations** (200-250 words)
           - Content improvements
           - Structure enhancements
           - Keyword optimization
           - Formatting suggestions
        
        4. **Technical Skills Assessment** (150-200 words)
           - Current skill level evaluation
           - Skill gap analysis
           - Industry alignment assessment
           - Emerging technology recommendations
        
        5. **Career Development Insights** (200-250 words)
           - Career trajectory analysis
           - Growth opportunities
           - Industry positioning
           - Salary negotiation insights
        
        6. **Action Plan** (150-200 words)
           - Immediate improvements (next 30 days)
           - Medium-term development (3-6 months)
           - Long-term career strategy (1-2 years)
           - Resource recommendations
        
        7. **Industry-Specific Advice** (100-150 words)
           - Women in tech considerations
           - Networking opportunities
           - Mentorship recommendations
           - Community engagement
        
        8. **Interview Preparation** (100-150 words)
           - Potential interview questions
           - Story development suggestions
           - Confidence building tips
           - Negotiation strategies
        
        Make the analysis extremely detailed, actionable, and comprehensive. Provide specific examples, actionable steps, and valuable insights that will help the user advance their career in technology.
        """
        
        # Get comprehensive analysis
        analysis = await ai_coach.analyze_document(analysis_prompt)
        
        return {
            "success": True,
            "analysis": analysis,
            "filename": file.filename,
            "file_size": len(content),
            "token_usage": "comprehensive_analysis_completed",
            "recommendations": [
                "Implement suggested content improvements",
                "Optimize technical skills section",
                "Enhance achievement descriptions",
                "Add industry-specific keywords",
                "Improve overall document structure"
            ]
        }
        
    except Exception as e:
        print(f"❌ Document Upload Error: {str(e)}")
        return {
            "success": False,
            "message": f"Document analysis error: {str(e)}",
            "filename": file.filename if file else "unknown"
        }

@app.get("/ai-coach/history")
async def get_chat_history(
    current_user: Dict = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50)
):
    """Get user's chat history"""
    return {
        "success": True,
        "history": [],
        "message": "AI servis şu anda Vercel deployment nedeniyle geçici olarak kullanılamıyor."
    }

@app.get("/ai-coach/insights")
async def get_ai_insights(current_user: Dict = Depends(get_current_user)):
    """Get comprehensive AI insights for maximum token usage"""
    try:
        from services.enhanced_ai_coach import EnhancedAICoach
        
        # Initialize AI coach
        ai_coach = EnhancedAICoach()
        
        # Create comprehensive insights prompt for maximum token usage
        insights_prompt = f"""
        As an expert career coach and AI analyst specializing in women in technology, provide comprehensive career insights and recommendations for the following user.
        
        User Context:
        - User ID: {current_user.get('id', 'anonymous')}
        - User Name: {current_user.get('firstName', 'User')}
        - User Email: {current_user.get('email', 'user@example.com')}
        - User Role: {current_user.get('role', 'Developer')}
        
        Please provide comprehensive insights including:
        
        1. **Career Trajectory Analysis** (200-250 words)
           - Current position assessment
           - Career progression opportunities
           - Industry trends and opportunities
           - Skill development priorities
        
        2. **Technical Skills Assessment** (150-200 words)
           - Current skill level evaluation
           - Emerging technology recommendations
           - Skill gap analysis
           - Learning roadmap suggestions
        
        3. **Market Intelligence** (150-200 words)
           - Salary trends and benchmarks
           - In-demand skills analysis
           - Company recommendations
           - Industry growth areas
        
        4. **Personal Development Insights** (150-200 words)
           - Confidence building strategies
           - Leadership development opportunities
           - Work-life balance recommendations
           - Stress management techniques
        
        5. **Networking and Community** (100-150 words)
           - Women in tech communities
           - Mentorship opportunities
           - Conference and event recommendations
           - Online networking strategies
        
        6. **Interview and Application Strategy** (150-200 words)
           - Application optimization tips
           - Interview preparation strategies
           - Negotiation techniques
           - Portfolio development
        
        7. **Long-term Career Planning** (200-250 words)
           - 5-year career roadmap
           - Skill development timeline
           - Industry specialization opportunities
           - Entrepreneurship considerations
        
        8. **Work Environment Optimization** (100-150 words)
           - Remote work strategies
           - Team collaboration tips
           - Communication skills development
           - Conflict resolution techniques
        
        9. **Industry-Specific Advice** (150-200 words)
           - Women in tech challenges and solutions
           - Diversity and inclusion insights
           - Breaking glass ceiling strategies
           - Role model identification
        
        10. **Actionable Recommendations** (100-150 words)
            - Immediate next steps (next 30 days)
            - Medium-term goals (3-6 months)
            - Long-term objectives (1-2 years)
            - Resource and tool recommendations
        
        Make the insights extremely detailed, actionable, and comprehensive. Provide specific examples, actionable steps, and valuable recommendations that will help the user advance their career in technology.
        """
        
        # Get comprehensive insights
        insights = await ai_coach.get_insights(insights_prompt)
        
        return {
            "success": True,
            "insights": insights,
            "user_id": current_user.get('id'),
            "generated_at": datetime.now().isoformat(),
            "token_usage": "comprehensive_insights_generated",
            "insight_categories": [
                "Career Trajectory",
                "Technical Skills",
                "Market Intelligence", 
                "Personal Development",
                "Networking",
                "Interview Strategy",
                "Long-term Planning",
                "Work Environment",
                "Industry Advice",
                "Actionable Steps"
            ]
        }
        
    except Exception as e:
        print(f"❌ AI Insights Error: {str(e)}")
        return {
            "success": False,
            "insights": [],
            "message": f"AI insights error: {str(e)}"
        }

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
        if job_service:
            jobs_data = job_service.get_jobs(
                limit=limit,
                offset=offset,
                location=location,
                job_type=job_type,
                experience_level=experience_level,
                remote_only=remote_only,
                search_query=search
            )
        else:
            # Mock job data when service is not available
            jobs_data = {
                "jobs": [
                    {
                        "id": "1",
                        "title": "Frontend Developer",
                        "company": "TechCorp",
                        "location": "Istanbul",
                        "salary": "15000-25000 TL",
                        "remote": True,
                        "description": "React ve TypeScript ile frontend geliştirme"
                    }
                ],
                "total": 1,
                "page": 1,
                "totalPages": 1
            }
        
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
        # Validate job exists
        job = job_service.get_job_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Invalid or non-existent job ID")

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
@app.options("/ai-coach/cv/upload")
@app.options("/ai-coach/cv/insights")
@app.options("/api/jobs")
@app.options("/api/jobs/{job_id}")
@app.options("/api/jobs/{job_id}/apply")
@app.options("/api/jobs/{job_id}/bookmark")
async def options_handler():
    return Response(status_code=200)

# WebSocket endpoints
@app.websocket("/ws/general/{user_id}")
async def websocket_general(websocket: WebSocket, user_id: str):
    """General WebSocket connection for real-time features"""
    if not manager:
        await websocket.close(code=1000, reason="WebSocket service not available")
        return
    
    connection_id = await manager.connect(websocket, user_id, "general")
    
    try:
        while True:
            # Wait for messages
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle the message
            await websocket_service.handle_message(websocket, user_id, message_data)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, connection_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(user_id, connection_id)

@app.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """Chat-specific WebSocket connection"""
    connection_id = await manager.connect(websocket, user_id, "chat")
    
    try:
        # Join general chat room
        manager.join_room(user_id, "general_chat")
        
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle chat-specific messages
            await websocket_service.handle_message(websocket, user_id, message_data)
            
    except WebSocketDisconnect:
        manager.leave_room(user_id, "general_chat")
        manager.disconnect(user_id, connection_id)
    except Exception as e:
        logger.error(f"Chat WebSocket error: {e}")
        manager.leave_room(user_id, "general_chat")
        manager.disconnect(user_id, connection_id)

@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """Notifications-specific WebSocket connection"""
    connection_id = await manager.connect(websocket, user_id, "notifications")
    
    try:
        # Send welcome message
        await websocket.send_text(json.dumps({
            "type": "welcome",
            "message": "Bildirimler için bağlantı kuruldu",
            "timestamp": datetime.now().isoformat()
        }))
        
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle notification-specific messages
            await websocket_service.handle_message(websocket, user_id, message_data)
            
    except WebSocketDisconnect:
        manager.disconnect(user_id, connection_id)
    except Exception as e:
        logger.error(f"Notifications WebSocket error: {e}")
        manager.disconnect(user_id, connection_id)

# Background task to monitor connections  
@app.on_event("startup")
async def startup_websocket_monitor():
    """Start background tasks"""
    try:
        if websocket_service:
            from api.services.websocket_service import start_connection_monitor
            asyncio.create_task(start_connection_monitor())
    except Exception as e:
        logger.warning(f"WebSocket monitor not started: {e}")

# Vercel için export
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT)
