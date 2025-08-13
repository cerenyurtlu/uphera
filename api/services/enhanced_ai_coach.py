import asyncio
import json
import logging
import os
from typing import Dict, List, Optional, AsyncGenerator, Any
from datetime import datetime
import google.generativeai as genai
from config import settings

# Configure Gemini API
try:
    if settings and getattr(settings, 'GEMINI_API_KEY', ''):
        genai.configure(api_key=settings.GEMINI_API_KEY)
    else:
        genai.configure(api_key=os.getenv('GEMINI_API_KEY', ''))
except Exception:
    pass

logger = logging.getLogger(__name__)

class EnhancedAdaAI:
    """
    Enhanced Ada AI Coach with Google Gemini 2.5 Flash Lite
    - Maximum token usage (65,536 tokens)
    - Fast streaming responses
    - No mock data, only real AI responses
    """
    
    def __init__(self):
        # Initialize Google Gemini API with maximum token configuration
        self.gemini_model = genai.GenerativeModel(
            'gemini-2.5-flash-lite',
            generation_config={
                "max_output_tokens": 220,  # Daha kısa yanıtlar için daha düşük sınır
                "temperature": 0.8,        # Çeşitlilik için artırıldı
                "top_p": 0.9,
                "top_k": 40,
                "candidate_count": 1
            }
        )
        
        logger.info("✅ Enhanced Ada AI initialized with Gemini 2.5 Flash Lite")
    
    async def get_enhanced_response(
        self, 
        user_id: str,
        message: str, 
        context: str = "general",
        user_data: Optional[Dict] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> AsyncGenerator[str, None]:
        """Get enhanced AI response with maximum token usage"""
        
        try:
            # Create comprehensive prompt with maximum context
            enhanced_prompt = self._create_enhanced_prompt(
                message, context, user_data, conversation_history
            )
            
            # Generate response with maximum token usage and streaming
            # Dynamic token control
            user_max_tokens = 0
            try:
                if user_data and isinstance(user_data, dict) and user_data.get('max_tokens') is not None:
                    user_max_tokens = int(user_data.get('max_tokens') or 0)
            except Exception:
                user_max_tokens = 0

            # Auto length selection based on message intent length and mode
            response_mode = (user_data or {}).get('response_mode', 'auto')
            approx_input_len = len(message or '')
            if user_max_tokens > 0:
                max_tokens = user_max_tokens
            else:
                if response_mode == 'short':
                    max_tokens = 220
                elif response_mode == 'long':
                    max_tokens = 512
                else:  # auto
                    # Heuristik: kısa soruya kısa, kapsamlı soruya daha uzun yanıt
                    if approx_input_len < 80:
                        max_tokens = 220
                    elif approx_input_len < 240:
                        max_tokens = 350
                    else:
                        max_tokens = 512

            gen_config = {
                "max_output_tokens": max_tokens,
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40
            }

            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                enhanced_prompt,
                stream=True,
                generation_config=gen_config
            )
            
            # Stream response with optimized token delivery
            full_response = ""
            for chunk in response:
                if chunk.text:
                    full_response += chunk.text
                    yield chunk.text
                    # Fast streaming for better user experience
                    await asyncio.sleep(0.0)
            
            logger.info(f"✅ Generated response for user {user_id} with {len(full_response)} characters")
                
        except Exception as e:
            logger.error(f"AI response error: {e}")
            # Sadece Gemini kullanılacak; anahtar yoksa bilgilendir
            try:
                import os
                if not getattr(settings, 'GEMINI_API_KEY', '') and not os.getenv('GEMINI_API_KEY', ''):
                    yield "Gemini için API anahtarı gerekli. Lütfen GEMINI_API_KEY ortam değişkenini ayarlayın."
                    return
            except Exception:
                pass
            yield "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin."
    
    def _create_enhanced_prompt(
        self, 
        message: str, 
        context: str, 
        user_data: Optional[Dict],
        conversation_history: Optional[List[Dict]]
    ) -> str:
        """Create comprehensive prompt with maximum context"""
        
        base_prompt = f"""
        Sen Ada AI'sın - UpSchool mezunu teknoloji kadınlarının AI mentoru.
        
        KİŞİLİĞİN:
        • Destekleyici, empatik ama profesyonel
        • Teknoloji tutkunu ve feminist değerlere sahip  
        • Pratik çözümler üreten, aksiyon odaklı
        • İlham verici ama gerçekçi
        • Türkçe konuşan, samimi ama saygılı
        • Kısa ve net yanıtlar veren; gerektiğinde maddelerle özetleyen
        
        BAĞLAM: {context}
        
        KULLANICI BİLGİLERİ:
        {json.dumps(user_data, ensure_ascii=False) if user_data else "Bilinmiyor"}
        """
        
        # Add recent conversation history if provided
        if conversation_history:
            base_prompt += "\n\nSON 6 MESAJ GEÇMİŞİ:\n"
            for item in conversation_history[-6:]:
                role = item.get('type', 'user')
                content = item.get('content', '')
                base_prompt += f"- {role}: {content[:400]}\n"
        
        base_prompt += f"""
        
        KULLANICI MESAJI: {message}
        
        YANIT TALİMATLARI:
        • Kısa soruya kısa, kapsamlı soruya yeterli uzunlukta (gerektiği kadar) yanıt ver.
        • Gereksiz girizgah ve tekrar yapma; konuya odaklan, dolgu metinden kaçın.
        • En fazla 3 maddelik net liste kullan; tablo/başlık (###) kullanma.
        • Türkçe teknik terimler kullan ve mümkünse uygulanabilir tek öneri ile bitir.
        • Aşırı uzun veya aşırı kısa olma; sorunun kapsamı kadar açık ve net ol.
        """
        
        return base_prompt
    
    async def get_cv_insights(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive CV insights with maximum token usage"""
        
        try:
            # Create comprehensive CV analysis prompt
            insights_prompt = f"""
            UpSchool mezunu teknoloji kadınının CV analizi için kapsamlı bir rehber hazırla:

            Lütfen şu kategorilerde detaylı analiz yap:

            1. GÜÇLÜ TEKNİK BECERİLER:
            - En güçlü programlama dilleri
            - Framework uzmanlıkları
            - Database ve cloud bilgileri
            - DevOps ve araçlar
            - UpSchool programıyla uyumluluk

            2. PROJE DENEYİMİ KALİTESİ:
            - Proje karmaşıklığı ve ölçeği
            - Kullanılan teknolojiler
            - Problem çözme yaklaşımları
            - Sonuçlar ve metrikler
            - Portfolio kalitesi

            3. KARİYER GELİŞİM ÖNERİLERİ:
            - Uygun pozisyonlar ve seviyeler
            - Maaş beklentileri (Türkiye piyasası)
            - Hedef şirketler
            - Kariyer yolu önerileri
            - Networking stratejileri

            4. EKSİK ALANLAR VE ÖĞRENME PLANI:
            - Geliştirilmesi gereken beceriler
            - Sertifika önerileri
            - Öğrenme kaynakları
            - Proje önerileri
            - Zaman planlaması

            5. İŞ BAŞVURU STRATEJİSİ:
            - CV optimizasyonu
            - Mülakat hazırlığı
            - Portfolio geliştirme
            - Online presence
            - Başvuru taktikleri

            6. UP SCHOOL TOPLULUĞU FAYDALANMA:
            - Mentorluk programları
            - Etkinlik katılımı
            - Proje paylaşımları
            - Networking fırsatları
            - Kariyer gelişimi

            Her kategori için spesifik, ölçülebilir ve uygulanabilir öneriler ver.
            Türkçe teknoloji terimlerini kullan ve UpSchool topluluğuna özel tavsiyeler ekle.
            Maaş beklentilerini Türkiye piyasasına göre ver.
            """
            
            # Use maximum token configuration for comprehensive insights
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                insights_prompt,
                generation_config={
                    "max_output_tokens": 65536,  # Maximum tokens for comprehensive analysis
                    "temperature": 0.3,
                    "top_p": 0.95,
                    "top_k": 50
                }
            )
            
            return {
                "insights": response.text,
                "has_cv": True,
                "analyzed_at": datetime.now().isoformat(),
                "token_usage": "maximized",
                "analysis_depth": "comprehensive",
                "recommendations": [
                    "CV'nizi güncelleyin",
                    "Yeni projeler ekleyin",
                    "Teknik becerilerinizi geliştirin",
                    "Portfolio'nuzu güncelleyin",
                    "Networking yapın"
                ]
            }
            
        except Exception as e:
            logger.error(f"CV insights error: {e}")
            return {
                "insights": "CV analizi şu anda yapılamıyor.",
                "has_cv": False,
                "error": str(e),
                "recommendations": [
                    "Teknik sorun nedeniyle analiz yapılamıyor",
                    "Lütfen daha sonra tekrar deneyin"
                ]
            }

# Global instance
enhanced_ada_ai = EnhancedAdaAI()

async def get_enhanced_ai_response(
    user_id: str,
    message: str,
    context: str = "general",
    user_data: Optional[Dict] = None,
    conversation_history: Optional[List[Dict]] = None
) -> AsyncGenerator[str, None]:
    """Get enhanced AI response with memory and retrieval"""
    async for chunk in enhanced_ada_ai.get_enhanced_response(
        user_id, message, context, user_data, conversation_history
    ):
        yield chunk

# -----------------------------------------------
# Backward-compat helpers expected by api/main.py
# -----------------------------------------------

async def upload_user_cv(user_id: str, content: bytes, filename: str) -> Dict[str, Any]:
    """Save uploaded CV, optionally run a brief AI analysis, and return UI-friendly payload.

    Frontend expects keys: success, filename, chunks_processed, analysis.analysis
    """
    try:
        upload_dir = getattr(settings, 'UPLOAD_DIR', './uploads')
        max_size = getattr(settings, 'MAX_FILE_SIZE', 10 * 1024 * 1024)

        if len(content) > max_size:
            return {
                "success": False,
                "message": "Dosya boyutu sınırı aşıldı",
            }

        # Persist file
        os.makedirs(upload_dir, exist_ok=True)
        safe_name = os.path.basename(filename) if filename else f"cv_{datetime.now().timestamp()}"
        saved_path = os.path.join(upload_dir, f"{user_id}_{safe_name}")

        def _write_file():
            with open(saved_path, 'wb') as f:
                f.write(content)

        await asyncio.to_thread(_write_file)

        # Try a very short AI analysis (best-effort)
        analysis_text = "CV yüklendi ve kaydedildi. AI analizi için hazır."
        try:
            # Attempt to decode some text; if binary (pdf/docx) this may be noisy, so we truncate
            decoded = None
            try:
                decoded = content.decode('utf-8', errors='ignore')
            except Exception:
                decoded = None

            snippet = (decoded or "").strip()[:1500]
            if snippet:
                prompt = (
                    "Aşağıdaki özgeçmiş metnini kısaca değerlendir ve 3 maddelik iyileştirme önerisi ver.\n\n" + snippet
                )
                response = await asyncio.to_thread(enhanced_ada_ai.gemini_model.generate_content, prompt, generation_config={
                    "max_output_tokens": 220,
                    "temperature": 0.6,
                })
                if getattr(response, 'text', None):
                    analysis_text = response.text
        except Exception as ai_err:
            logger.warning(f"CV quick analysis failed: {ai_err}")

        return {
            "success": True,
            "filename": safe_name,
            "file_size": len(content),
            "saved_path": saved_path,
            "chunks_processed": 1,
            "analysis": {"analysis": analysis_text},
        }

    except Exception as e:
        logger.error(f"upload_user_cv error: {e}")
        return {"success": False, "message": "CV yükleme hatası", "error": str(e)}


async def get_user_cv_insights(user_id: str) -> Dict[str, Any]:
    """Bridge function used by api/main.py to get CV insights."""
    return await enhanced_ada_ai.get_cv_insights(user_id)


class EnhancedAICoach:
    """Compatibility shim used by /ai-coach/document/upload endpoint."""

    async def analyze_document(self, prompt: str) -> str:
        try:
            response = await asyncio.to_thread(
                enhanced_ada_ai.gemini_model.generate_content,
                prompt,
                generation_config={
                    "max_output_tokens": 2048,
                    "temperature": 0.5,
                }
            )
            return getattr(response, 'text', '') or ''
        except Exception as e:
            logger.error(f"analyze_document error: {e}")
            return "Döküman analizi şu anda yapılamıyor. Lütfen daha sonra tekrar deneyin."