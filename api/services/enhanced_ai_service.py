"""
Enhanced AI Service
- Gemini-first streaming (single provider)
"""
import asyncio
import json
import logging
import httpx
from typing import AsyncGenerator, Dict, Any, Optional, List
from pathlib import Path
import sqlite3
from datetime import datetime
import os
import threading

from api.config import settings

logger = logging.getLogger(__name__)

# Optional import: google-generativeai (Gemini)
try:
    import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover
    genai = None  # type: ignore

class EnhancedAIService:
    """Production-ready AI service using Gemini only"""
    
    def __init__(self):
        self.db_path = "uphera.db"
        
        # Gemini configuration (primary provider)
        self.gemini_api_key = settings.GEMINI_API_KEY
        self.gemini_model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
        self.gemini_model = None
        self._gemini_ready = False
        # Tunables for speed/quality balance (overridable via env)
        try:
            self.default_max_output_tokens = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "256"))
        except Exception:
            self.default_max_output_tokens = 256
        try:
            self.default_temperature = float(os.getenv("GEMINI_TEMPERATURE", "0.7"))
        except Exception:
            self.default_temperature = 0.7
        try:
            self.default_top_p = float(os.getenv("GEMINI_TOP_P", "0.95"))
        except Exception:
            self.default_top_p = 0.95
        try:
            self.default_top_k = int(os.getenv("GEMINI_TOP_K", "40"))
        except Exception:
            self.default_top_k = 40
        try:
            if genai and self.gemini_api_key:
                genai.configure(api_key=self.gemini_api_key)
                # Create model instance with generation defaults
                gen_config = {
                    "max_output_tokens": self.default_max_output_tokens,
                    "temperature": self.default_temperature,
                    "top_p": self.default_top_p,
                    "top_k": self.default_top_k,
                }
                self.gemini_model = genai.GenerativeModel(self.gemini_model_name, generation_config=gen_config)  # type: ignore[arg-type]
                self._gemini_ready = True
        except Exception as e:  # pragma: no cover
            logger.warning(f"Gemini initialization failed: {e}")

        self.init_ai_tables()
    
    def init_ai_tables(self):
        """Initialize AI-related database tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Chat history table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS chat_history (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    message TEXT NOT NULL,
                    response TEXT NOT NULL,
                    context TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # User documents table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_documents (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    filename TEXT NOT NULL,
                    content TEXT NOT NULL,
                    file_type TEXT,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # AI insights table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS ai_insights (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    insight_type TEXT NOT NULL,
                    insight_data TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            conn.commit()
            conn.close()
            logger.info("✅ AI tables initialized")
            
        except Exception as e:
            logger.error(f"❌ AI tables initialization failed: {e}")
    
    async def check_gemini_status(self) -> bool:
        """Returns True if Gemini is configured and initialized."""
        return bool(self._gemini_ready)
    
    def _build_generation_config(self, max_tokens: Optional[int] = None, response_mode: str = "auto") -> Dict[str, Any]:
        # Clamp and select sensible defaults per mode
        def clamp(val: int, lo: int, hi: int) -> int:
            return max(lo, min(hi, val))

        # Defaults
        max_out = self.default_max_output_tokens
        temp = self.default_temperature
        top_p = self.default_top_p
        top_k = self.default_top_k

        mode = (response_mode or "auto").lower()
        if max_tokens is not None:
            max_out = clamp(int(max_tokens or 0), 64, 1024)
        else:
            if mode == "short":
                max_out = 128
                temp = min(max(temp, 0.5), 0.7)
            elif mode == "long":
                max_out = 512
                temp = min(max(temp, 0.7), 0.9)

        return {
            "max_output_tokens": max_out,
            "temperature": float(temp),
            "top_p": float(top_p),
            "top_k": int(top_k),
        }

    def _augment_prompt_by_mode(self, base_prompt: str, response_mode: str) -> str:
        mode = (response_mode or "auto").lower()
        if mode == "short":
            return base_prompt + "\n\nLütfen yanıtı kısa ve net tut (en fazla 5-7 cümle). Gerekirse madde işaretleri kullan. Gereksiz tekrar ve uzun cümlelerden kaçın."
        if mode == "long":
            return base_prompt + "\n\nLütfen yanıtı kapsamlı ve ayrıntılı ver (yaklaşık 200-300 kelime). Somut örnekler ve maddeler ekle; uygulanabilir öneriler sun."
        return base_prompt

    async def chat_with_gemini_stream(self, message: str, context: str = "general", *, response_mode: str = "auto", max_tokens: Optional[int] = None) -> AsyncGenerator[str, None]:
        """Streaming chat via Gemini."""
        if not self._gemini_ready or not self.gemini_model:
            yield "❌ Gemini API yapılandırılmadı"
            return

        # Build prompt
        system_prompt = self._augment_prompt_by_mode(self.get_system_prompt(context), response_mode)
        full_prompt = f"{system_prompt}\n\nKullanıcı: {message}\n\nAda AI:"
        gen_config = self._build_generation_config(max_tokens=max_tokens, response_mode=response_mode)

        queue: asyncio.Queue = asyncio.Queue()
        loop = asyncio.get_event_loop()

        def _producer():
            try:
                # google-generativeai is synchronous; stream in a background thread
                response = self.gemini_model.generate_content(full_prompt, stream=True, generation_config=gen_config)
                for chunk in response:
                    text = self._extract_gemini_text(chunk)
                    if text:
                        asyncio.run_coroutine_threadsafe(queue.put(text), loop).result()
            except Exception as e:  # pragma: no cover
                asyncio.run_coroutine_threadsafe(queue.put(f"__ERROR__:{e}"), loop).result()
            finally:
                asyncio.run_coroutine_threadsafe(queue.put("__DONE__"), loop).result()

        threading.Thread(target=_producer, daemon=True).start()

        while True:
            item = await queue.get()
            if item == "__DONE__":
                break
            if isinstance(item, str) and item.startswith("__ERROR__:"):
                yield f"❌ AI servis hatası: {item.split(':',1)[1]}"
                break
            yield item
    
    async def chat_nonstream(self, message: str, context: str = "general", *, response_mode: str = "auto", max_tokens: Optional[int] = None) -> str:
        """Non-stream response via Gemini (sync API wrapped in thread)."""
        try:
            if self._gemini_ready and self.gemini_model:
                system_prompt = self._augment_prompt_by_mode(self.get_system_prompt(context), response_mode)
                full_prompt = f"{system_prompt}\n\nKullanıcı: {message}\n\nAda AI:"
                gen_config = self._build_generation_config(max_tokens=max_tokens, response_mode=response_mode)
                def _run():
                    try:
                        resp = self.gemini_model.generate_content(full_prompt, generation_config=gen_config)
                        return self._extract_gemini_text(resp) or ""
                    except Exception as e:  # pragma: no cover
                        return f"❌ AI servis hatası: {str(e)}"
                return await asyncio.to_thread(_run)
            return "❌ Gemini API yapılandırılmadı"
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")
            return f"❌ AI servis hatası: {str(e)}"
    
    def get_system_prompt(self, context: str) -> str:
        """Get context-specific system prompt"""
        base_prompt = """Sen Ada AI'sın, UpSchool mezunu teknolojide öncü kadınların kariyer koçu ve mentorüsün. 
        Empati dolu, destekleyici ve motive edici bir yaklaşımla yanıtlar ver. 
        Türkçe konuş ve kadınları güçlendirici bir dil kullan."""
        
        context_prompts = {
            "career": base_prompt + "\n\nKariyer gelişimi, iş arama stratejileri ve profesyonel gelişim konularında uzmanlaş.",
            "interview": base_prompt + "\n\nMülakat hazırlığı, kendini tanıtma ve teknik sorular konularında rehberlik et.",
            "technical": base_prompt + "\n\nProgramlama, teknik beceriler ve teknoloji trendleri hakkında bilgi ver.",
            "network": base_prompt + "\n\nNetworking, topluluk katılımı ve profesyonel ilişkiler konularında tavsiye ver.",
            "profile": base_prompt + "\n\nProfil optimizasyonu, CV hazırlama ve kişisel markalaşma konularında yardım et."
        }
        
        return context_prompts.get(context, base_prompt)
    
    async def enhanced_chat(
        self, 
        user_id: str, 
        message: str, 
        context: str = "general",
        use_streaming: bool = True,
        *,
        response_mode: str = "auto",
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """Enhanced chat with user context and history"""
        
        # Gemini readiness
        gemini_available = await self.check_gemini_status()

        if gemini_available and use_streaming:
            full_response = ""
            async for chunk in self.chat_with_gemini_stream(message, context, response_mode=response_mode, max_tokens=max_tokens):
                full_response += chunk
                yield chunk
            self.save_chat_history(user_id, message, full_response, context)
        else:
            # Non-stream path uses Gemini non-stream
            response = await self.chat_nonstream(message, context, response_mode=response_mode, max_tokens=max_tokens)
            self.save_chat_history(user_id, message, response, context)
            yield response
    
    def save_chat_history(self, user_id: str, message: str, response: str, context: str):
        """Save chat interaction to database"""
        try:
            import uuid
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO chat_history (id, user_id, message, response, context)
                VALUES (?, ?, ?, ?, ?)
            ''', (str(uuid.uuid4()), user_id, message, response, context))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to save chat history: {e}")

    def _extract_gemini_text(self, obj: Any) -> str:
        """Best-effort extraction of text from Gemini response/chunk across versions."""
        try:
            # Most versions expose .text
            text = getattr(obj, "text", None)
            if text:
                return str(text)
            # Fallbacks: try candidates[0].content.parts
            candidates = getattr(obj, "candidates", None)
            if candidates:
                try:
                    content = candidates[0].content
                    parts = getattr(content, "parts", None)
                    if parts:
                        return "".join(str(getattr(p, "text", "")) for p in parts)
                except Exception:
                    pass
        except Exception:
            pass
        # Last resort string cast
        try:
            return str(obj)
        except Exception:
            return ""
    
    def get_chat_history(self, user_id: str, limit: int = 10) -> List[Dict]:
        """Get user's chat history"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT message, response, context, created_at
                FROM chat_history 
                WHERE user_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            ''', (user_id, limit))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [{
                "message": row[0],
                "response": row[1], 
                "context": row[2],
                "created_at": row[3]
            } for row in rows]
            
        except Exception as e:
            logger.error(f"Failed to get chat history: {e}")
            return []
    
    async def upload_document(self, user_id: str, filename: str, content: str) -> Dict[str, Any]:
        """Upload and process user document"""
        try:
            import uuid
            
            # Save document to database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            doc_id = str(uuid.uuid4())
            file_type = Path(filename).suffix.lower()
            
            cursor.execute('''
                INSERT INTO user_documents (id, user_id, filename, content, file_type)
                VALUES (?, ?, ?, ?, ?)
            ''', (doc_id, user_id, filename, content, file_type))
            
            conn.commit()
            conn.close()
            
            # Generate AI insights
            insights = await self.analyze_document(content, file_type)
            self.save_ai_insights(user_id, "document_analysis", insights)
            
            return {
                "success": True,
                "document_id": doc_id,
                "insights": insights,
                "message": "Döküman başarıyla yüklendi ve analiz edildi"
            }
            
        except Exception as e:
            logger.error(f"Document upload error: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Döküman yükleme hatası"
            }
    
    async def analyze_document(self, content: str, file_type: str) -> Dict[str, Any]:
        """Analyze uploaded document with AI"""
        try:
            # Truncate content if too long
            analysis_content = content[:2000] if len(content) > 2000 else content
            
            analysis_prompt = f"""
            Bu CV/dökümanı analiz et ve şu bilgileri çıkar:
            1. Teknik beceriler
            2. Deneyim seviyesi
            3. Güçlü yanlar
            4. Gelişim alanları
            5. Kariyer önerileri
            
            Döküman içeriği:
            {analysis_content}
            
            JSON formatında yanıt ver.
            """
            
            gemini_available = await self.check_gemini_status()
            
            if gemini_available:
                response_text = ""
                async for chunk in self.chat_with_gemini_stream(analysis_prompt, "profile"):
                    response_text += chunk
            else:
                response_text = await self.chat_nonstream(analysis_prompt, "profile")
            
            # Try to parse as JSON, fallback to structured text
            try:
                return json.loads(response_text)
            except:
                return {
                    "analysis": response_text,
                    "extracted_skills": [],
                    "experience_level": "unknown",
                    "recommendations": []
                }
                
        except Exception as e:
            logger.error(f"Document analysis error: {e}")
            return {
                "error": str(e),
                "analysis": "Döküman analizi şu anda kullanılamıyor"
            }
    
    def save_ai_insights(self, user_id: str, insight_type: str, insight_data: Dict):
        """Save AI insights to database"""
        try:
            import uuid
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO ai_insights (id, user_id, insight_type, insight_data)
                VALUES (?, ?, ?, ?)
            ''', (str(uuid.uuid4()), user_id, insight_type, json.dumps(insight_data)))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to save AI insights: {e}")
    
    def get_user_insights(self, user_id: str) -> List[Dict]:
        """Get user's AI insights"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT insight_type, insight_data, created_at
                FROM ai_insights 
                WHERE user_id = ?
                ORDER BY created_at DESC
            ''', (user_id,))
            
            rows = cursor.fetchall()
            conn.close()
            
            return [{
                "type": row[0],
                "data": json.loads(row[1]),
                "created_at": row[2]
            } for row in rows]
            
        except Exception as e:
            logger.error(f"Failed to get user insights: {e}")
            return []

# Global instance
enhanced_ai_service = EnhancedAIService()
