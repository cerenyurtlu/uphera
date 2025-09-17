"""
Enhanced AI Service with real Ollama and OpenAI integration
"""
import asyncio
import json
import logging
import httpx
from typing import AsyncGenerator, Dict, Any, Optional, List
from pathlib import Path
import sqlite3
from datetime import datetime

from api.config import settings

logger = logging.getLogger(__name__)

class EnhancedAIService:
    """Production-ready AI service with Ollama and OpenAI fallback"""
    
    def __init__(self):
        self.ollama_url = settings.OLLAMA_BASE_URL
        self.openai_api_key = settings.OPENAI_API_KEY
        self.db_path = "uphera.db"
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
    
    async def check_ollama_status(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self.ollama_url}/api/tags")
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            return False
    
    async def chat_with_ollama(self, message: str, context: str = "general") -> AsyncGenerator[str, None]:
        """Chat with Ollama with streaming response"""
        try:
            # Build context-aware prompt
            system_prompt = self.get_system_prompt(context)
            full_prompt = f"{system_prompt}\n\nKullanıcı: {message}\n\nAda AI:"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream(
                    "POST",
                    f"{self.ollama_url}/api/generate",
                    json={
                        "model": "llama3.2:3b",
                        "prompt": full_prompt,
                        "stream": True,
                        "options": {
                            "temperature": 0.7,
                            "top_k": 40,
                            "top_p": 0.9,
                            "repeat_penalty": 1.1
                        }
                    }
                ) as response:
                    if response.status_code == 200:
                        async for line in response.aiter_lines():
                            if line:
                                try:
                                    data = json.loads(line)
                                    if "response" in data:
                                        yield data["response"]
                                    if data.get("done"):
                                        break
                                except json.JSONDecodeError:
                                    continue
                    else:
                        yield "❌ Ollama bağlantı hatası"
                        
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            yield f"❌ AI servis hatası: {str(e)}"
    
    async def chat_with_openai(self, message: str, context: str = "general") -> str:
        """Fallback to OpenAI if Ollama is not available"""
        if not self.openai_api_key:
            return "❌ AI servisleri şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin."
        
        try:
            system_prompt = self.get_system_prompt(context)
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data["choices"][0]["message"]["content"]
                else:
                    return "❌ OpenAI API hatası"
                    
        except Exception as e:
            logger.error(f"OpenAI chat error: {e}")
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
        use_streaming: bool = True
    ) -> AsyncGenerator[str, None]:
        """Enhanced chat with user context and history"""
        
        # Check Ollama availability
        ollama_available = await self.check_ollama_status()
        
        if ollama_available and use_streaming:
            # Use Ollama for streaming
            full_response = ""
            async for chunk in self.chat_with_ollama(message, context):
                full_response += chunk
                yield chunk
            
            # Save to history
            self.save_chat_history(user_id, message, full_response, context)
            
        else:
            # Fallback to OpenAI
            response = await self.chat_with_openai(message, context)
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
            
            ollama_available = await self.check_ollama_status()
            
            if ollama_available:
                response_text = ""
                async for chunk in self.chat_with_ollama(analysis_prompt, "profile"):
                    response_text += chunk
            else:
                response_text = await self.chat_with_openai(analysis_prompt, "profile")
            
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
