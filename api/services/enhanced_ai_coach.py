import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, AsyncGenerator, Any
from datetime import datetime
import time
import threading
from concurrent.futures import ThreadPoolExecutor
import google.generativeai as genai

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManagerForLLMRun
import PyPDF2
from io import BytesIO

# Configure Gemini API
genai.configure(api_key='AIzaSyDzneKXfPU_tq5-8K0DIDRvgZ1qd0PjjWg')

# Gemini LLM wrapper for LangChain compatibility
class GeminiLLM(LLM):
    def __init__(self, model_name: str = "gemini-2.5-flash-lite"):
        super().__init__()
        self.model_name = model_name
        self.model = genai.GenerativeModel(model_name)
    
    @property
    def _llm_type(self) -> str:
        return "gemini"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logging.error(f"Gemini API error: {e}")
            return "Üzgünüm, şu anda yanıt veremiyorum. Lütfen daha sonra tekrar deneyin."

logger = logging.getLogger(__name__)

class EnhancedAdaAI:
    """
    Enhanced Ada AI Coach with:
    - Vector DB for CV/document storage and retrieval
    - LangChain for conversation memory
    - Sentence Transformers for Turkish embeddings
    - CV upload and parsing capabilities
    - Google Gemini API for fast responses
    """
    
    def __init__(self):
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize vector store directory
        self.chroma_dir = self.data_dir / "chroma_db"
        self.chroma_dir.mkdir(exist_ok=True)
        
        # Performance optimizations
        self.response_cache = {}  # Simple in-memory cache
        self.cache_ttl = 300  # 5 minutes
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Initialize Google Gemini API directly for faster responses
        self.gemini_model = genai.GenerativeModel('gemini-2.5-flash-lite')
        
        # Initialize embeddings (Turkish-English BGE model)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-base-en-v1.5",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize ChromaDB with performance settings
        self.chroma_client = chromadb.PersistentClient(
            path=str(self.chroma_dir),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize vector store
        self.vector_store = Chroma(
            client=self.chroma_client,
            collection_name="upschool_documents",
            embedding_function=self.embeddings,
            persist_directory=str(self.chroma_dir)
        )
        
        # Text splitter for documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Initialize memory for each user session
        self.user_memories: Dict[str, ConversationBufferWindowMemory] = {}
        
        # Pre-computed responses for common questions
        self.quick_responses = self._setup_quick_responses()
        
        # Initialize UpSchool knowledge base
        self._setup_upschool_knowledge()
        
    def _setup_quick_responses(self) -> Dict[str, str]:
        """Setup pre-computed responses for common questions"""
        return {
            "merhaba": "Merhaba! 👋 Ben Ada AI - Up Hera topluluğunun AI mentoru! Senin teknoloji yolculuğunda yanındayım. Size nasıl yardım edebilirim?",
            "selam": "Selam! 🚀 Ada AI burada! UpSchool mezunu olarak kariyer hedeflerine ulaşmana yardım edeceğim. Hangi konuda sohbet etmek istiyorsun?",
            "nasılsın": "Harika! Seninle sohbet etmek beni mutlu ediyor. UpSchool topluluğunun gücüyle birlikte harika şeyler başaracağız! 💪",
            "yardım": "Tabii! Size şu konularda yardım edebilirim:\n• 🎯 Mülakat hazırlığı\n• 📄 CV optimizasyonu\n• 💼 İş arama stratejileri\n• 🚀 Kariyer planlama\n• 💻 Teknik beceri geliştirme\n\nHangi konuda yardım istiyorsun?",
            "teşekkür": "Rica ederim! 😊 UpSchool topluluğu olarak birbirimizi desteklemeye devam edelim. Başka bir sorunuz var mı?",
            "görüşürüz": "Görüşmek üzere! 👋 Başarılar dilerim. UpSchool topluluğu her zaman yanında! 💪",
            "mülakat": "🎯 **Mülakat Hazırlık Rehberi**\n\n**Teknik Mülakat İçin:**\n• STAR tekniği ile projelerini anlat\n• Kod yazarken düşüncelerini sesli ifade et\n• Time complexity ve space complexity'yi belirt\n• Test case'ler düşün\n\n**Behavioral Sorular İçin:**\n• \"En zor proje\" sorusu için UpSchool projelerini kullan\n• \"Takım çalışması\" için grup projelerini anlat\n• \"Hata yönetimi\" için debugging deneyimlerini paylaş\n\n**Özgüven İçin:**\n• Her gün 15 dakika ayna karşısında pratik yap\n• Pozitif self-talk geliştir\n• Nefes teknikleri öğren",
            "cv": "📄 **CV Optimizasyon Rehberi**\n\n**Güçlü CV İçin:**\n• Action verbs kullan (Geliştirdim, Yönettim, Optimize ettim)\n• Sayısal sonuçlar ekle (Kullanıcı deneyimini %40 artırdım)\n• UpSchool projelerini öne çıkar\n• GitHub linkini ekle\n\n**Teknik CV Formatı:**\n• Contact bilgileri\n• Professional Summary (2-3 cümle)\n• Skills (Frontend, Backend, Tools)\n• Projects (En güçlü 3-4 proje)\n• Education (UpSchool vurgusu)",
            "react": "⚛️ **Frontend Development Rehberi**\n\n**Öğrenme Yolu:**\n1. **HTML/CSS** (2-3 hafta)\n2. **JavaScript** (4-6 hafta)\n3. **React** (6-8 hafta)\n4. **TypeScript** (2-3 hafta)\n5. **State Management** (Redux/Zustand)\n\n**Önerilen Projeler:**\n• Todo App (React + LocalStorage)\n• Weather App (API integration)\n• E-commerce (Full stack)\n• Portfolio Website",
            "python": "🐍 **Data Science & Python Rehberi**\n\n**Öğrenme Yolu:**\n1. **Python Temelleri** (3-4 hafta)\n2. **Pandas & NumPy** (2-3 hafta)\n3. **Data Visualization** (Matplotlib, Seaborn)\n4. **Machine Learning** (Scikit-learn)\n5. **Deep Learning** (TensorFlow/PyTorch)\n\n**Önerilen Projeler:**\n• Data Analysis Dashboard\n• ML Model (Classification/Regression)\n• Web Scraping Tool\n• Data Visualization App",
            "javascript": "🟨 **JavaScript Rehberi**\n\n**Temel Konular:**\n• Variables, Functions, Objects\n• ES6+ Features (Arrow functions, Destructuring)\n• Async/Await ve Promises\n• DOM Manipulation\n• Event Handling\n\n**İleri Seviye:**\n• Closures ve Scope\n• Prototypes ve Inheritance\n• Error Handling\n• Modules (ES6)\n• Testing (Jest)\n\n**Proje Önerileri:**\n• Calculator App\n• Todo List\n• Weather App\n• Quiz Game",
            "typescript": "🔷 **TypeScript Rehberi**\n\n**Temel Konular:**\n• Type Annotations\n• Interfaces ve Types\n• Generics\n• Enums\n• Union Types\n\n**İleri Seviye:**\n• Advanced Types\n• Decorators\n• Namespaces\n• Module Resolution\n• Type Guards\n\n**Proje Önerileri:**\n• Type-safe API Client\n• React + TypeScript App\n• Node.js Backend\n• Library Development",
            "node": "🟢 **Node.js Rehberi**\n\n**Temel Konular:**\n• Event Loop\n• Streams ve Buffers\n• File System\n• HTTP Module\n• NPM ve Package Management\n\n**Framework'ler:**\n• Express.js\n• Fastify\n• NestJS\n• Koa\n\n**Database:**\n• MongoDB (Mongoose)\n• PostgreSQL (Prisma)\n• Redis\n\n**Proje Önerileri:**\n• REST API\n• Real-time Chat App\n• File Upload Service\n• Authentication System",
            "kariyer": "💼 **Kariyer Rehberi**\n\n**İş Arama Stratejileri:**\n• LinkedIn profilini güncelle ve aktif ol\n• GitHub'da projelerini paylaş\n• Networking etkinliklerine katıl\n• UpSchool topluluğunu kullan\n\n**Popüler Pozisyonlar:**\n• Frontend Developer (React, Vue.js)\n• Backend Developer (Node.js, Python)\n• Full Stack Developer\n• Data Scientist\n• UI/UX Designer\n\n**Maaş Beklentileri (Türkiye):**\n• Junior: 15.000-25.000 TL\n• Mid-level: 25.000-40.000 TL\n• Senior: 40.000-60.000 TL+",
            "network": "👥 **Network Kurma Rehberi**\n\n**LinkedIn Optimizasyonu:**\n• Profil fotoğrafı ve banner\n• Güçlü headline yaz\n• Deneyim ve eğitim detayları\n• Skills ve endorsements\n\n**Networking Stratejileri:**\n• Tech meetup'lara katıl\n• Online topluluklarda aktif ol\n• Mentor bul ve mentorluk ver\n• Konferanslara katıl\n\n**UpSchool Topluluğu:**\n• Mezun gruplarında aktif ol\n• Proje paylaşımları yap\n• Deneyim paylaş\n• Yeni mezunlara yardım et",
            "proje": "🚀 **Proje Geliştirme Rehberi**\n\n**Portfolio Projeleri:**\n• E-commerce Platform\n• Task Management App\n• Social Media Clone\n• Data Visualization Dashboard\n\n**Proje Geliştirme Süreci:**\n• Planning ve Wireframing\n• UI/UX Design\n• Development (Agile)\n• Testing ve Debugging\n• Deployment\n\n**GitHub Optimizasyonu:**\n• README dosyaları yaz\n• Live demo linkleri ekle\n• Clean code yaz\n• Regular commits yap"
        }
    
    def _setup_upschool_knowledge(self):
        """Setup UpSchool specific knowledge base"""
        
        upschool_knowledge = {
            "programs": {
                "Frontend Development": {
                    "skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Redux", "Next.js"],
                    "projects": ["E-commerce website", "Todo app", "Blog platform", "Portfolio site"],
                    "duration": "16 hafta",
                    "mentor_support": "1:1 mentorship + peer learning"
                },
                "Backend Development": {
                    "skills": ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker"],
                    "projects": ["REST API", "Microservice architecture", "Database design"],
                    "duration": "16 hafta", 
                    "mentor_support": "Code review + architecture guidance"
                },
                "Data Science": {
                    "skills": ["Python", "Pandas", "Scikit-learn", "TensorFlow", "SQL", "Tableau"],
                    "projects": ["Data analysis", "ML model", "Visualization dashboard"],
                    "duration": "20 hafta",
                    "mentor_support": "Research guidance + industry projects"
                },
                "Mobile Development": {
                    "skills": ["React Native", "Flutter", "JavaScript", "Dart", "API Integration"],
                    "projects": ["Cross-platform app", "Native features", "App store deployment"],
                    "duration": "16 hafta",
                    "mentor_support": "Mobile-specific mentorship"
                }
            },
            "success_companies": [
                "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Spotify",
                "Trendyol", "Getir", "Hepsiburada", "BiTaksi", "Peak Games",
                "Turkcell", "Vodafone", "Garanti BBVA", "İş Bankası"
            ],
            "career_paths": {
                "Frontend Developer": {
                    "junior": "React, JavaScript basics, responsive design",
                    "mid": "TypeScript, state management, testing, performance optimization",
                    "senior": "Architecture decisions, mentoring, system design"
                },
                "Backend Developer": {
                    "junior": "API development, database basics, version control",
                    "mid": "Microservices, caching, security, CI/CD",
                    "senior": "System architecture, scalability, team leadership"
                }
            },
            "interview_preparation": {
                "technical_questions": {
                    "React": [
                        "What is JSX and how does it work?",
                        "Explain React lifecycle methods",
                        "What are React Hooks and why use them?",
                        "How do you optimize React performance?"
                    ],
                    "JavaScript": [
                        "Explain closures with an example",
                        "What is the difference between let, const, and var?",
                        "How does async/await work?",
                        "What is event delegation?"
                    ]
                },
                "behavioral_questions": [
                    "Tell me about a challenging project you worked on",
                    "How do you handle tight deadlines?",
                    "Describe a time you had to learn a new technology quickly",
                    "How do you approach debugging complex issues?"
                ]
            }
        }
        
        # Store UpSchool knowledge in vector store
        for category, content in upschool_knowledge.items():
            doc_text = f"UpSchool {category}: {json.dumps(content, ensure_ascii=False)}"
            document = Document(
                page_content=doc_text,
                metadata={
                    "source": "upschool_knowledge",
                    "category": category,
                    "type": "knowledge_base"
                }
            )
            self.vector_store.add_documents([document])
        
        # Persist the vector store
        self.vector_store.persist()
        
    def get_user_memory(self, user_id: str) -> ConversationBufferWindowMemory:
        """Get or create memory for specific user"""
        if user_id not in self.user_memories:
            self.user_memories[user_id] = ConversationBufferWindowMemory(
                k=6,  # Remember last 6 exchanges
                memory_key="chat_history",
                return_messages=True
            )
        return self.user_memories[user_id]
    
    async def upload_cv(self, user_id: str, file_content: bytes, filename: str) -> Dict[str, Any]:
        """Upload and process CV document"""
        try:
            # Parse PDF content
            if filename.lower().endswith('.pdf'):
                text_content = self._extract_pdf_text(file_content)
            else:
                # For now, assume text files
                text_content = file_content.decode('utf-8')
            
            # Split text into chunks
            chunks = self.text_splitter.split_text(text_content)
            
            # Create documents
            documents = []
            for i, chunk in enumerate(chunks):
                doc = Document(
                    page_content=chunk,
                    metadata={
                        "source": f"cv_{user_id}",
                        "filename": filename,
                        "chunk_id": i,
                        "user_id": user_id,
                        "type": "cv",
                        "upload_date": datetime.now().isoformat()
                    }
                )
                documents.append(doc)
            
            # Add to vector store
            self.vector_store.add_documents(documents)
            self.vector_store.persist()
            
            # Analyze CV content
            analysis = await self._analyze_cv_content(text_content, user_id)
            
            return {
                "success": True,
                "filename": filename,
                "chunks_processed": len(chunks),
                "analysis": analysis,
                "message": "CV başarıyla yüklendi ve analiz edildi!"
            }
            
        except Exception as e:
            logger.error(f"CV upload error for user {user_id}: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "CV yüklenirken hata oluştu"
            }
    
    def _extract_pdf_text(self, pdf_content: bytes) -> str:
        """Extract text from PDF content"""
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    async def _analyze_cv_content(self, cv_text: str, user_id: str) -> Dict[str, Any]:
        """Analyze CV content and provide insights"""
        
        # Create analysis prompt
        analysis_prompt = f"""
        UpSchool mezunu bir adayın CV'sini analiz et ve şu konularda feedback ver:
        
        CV İçeriği:
        {cv_text[:2000]}...
        
        Lütfen şunları değerlendir:
        1. Teknik beceriler ve UpSchool programıyla uyumluluğu
        2. Proje deneyimi kalitesi
        3. CV formatı ve sunum
        4. Eksik olan alanlar
        5. Güçlü yanlar
        6. İyileştirme önerileri
        
        Kısa ve yapıcı feedback ver:
        """
        
        try:
            response = await asyncio.to_thread(self.gemini_model.generate_content, analysis_prompt)
            return {
                "analysis": response.text,
                "analyzed_at": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"CV analysis error: {e}")
            return {
                "analysis": "CV analizi şu anda yapılamıyor, lütfen daha sonra tekrar deneyin.",
                "error": str(e)
            }
    
    async def get_enhanced_response(
        self, 
        user_id: str,
        message: str, 
        context: str = "general",
        user_data: Optional[Dict] = None
    ) -> AsyncGenerator[str, None]:
        """Get enhanced response with retrieval and memory"""
        
        try:
            # Check for quick responses first (instant replies)
            message_lower = message.lower().strip()
            
            # Extended quick response matching
            for key, response in self.quick_responses.items():
                if key in message_lower:
                    logger.info(f"Serving quick response for user {user_id} - matched: {key}")
                    words = response.split()
                    for i, word in enumerate(words):
                        yield word + " "
                        if i % 2 == 0:  # Faster streaming for quick responses
                            await asyncio.sleep(0.02)  # Even faster
                    return
            
            # Check cache for similar questions
            cache_key = f"{message_lower}_{context}"
            if cache_key in self.response_cache and time.time() - self.response_cache[cache_key]['timestamp'] < self.cache_ttl:
                cached_response = self.response_cache[cache_key]['response']
                logger.info(f"Serving cached response for user {user_id}")
                words = cached_response.split()
                for i, word in enumerate(words):
                    yield word + " "
                    if i % 3 == 0:
                        await asyncio.sleep(0.03)  # Faster
                return

            # Get user memory
            memory = self.get_user_memory(user_id)
            
            # Search relevant documents (async)
            relevant_docs = await self._search_relevant_context(
                message, user_id, context
            )
            
            # Create enhanced prompt with context
            enhanced_prompt = self._build_enhanced_prompt(
                message, context, user_data, relevant_docs
            )
            
            # Get response with timeout using Gemini directly
            try:
                response = await asyncio.wait_for(
                    asyncio.to_thread(
                        self.gemini_model.generate_content,
                        enhanced_prompt
                    ),
                    timeout=10.0  # 10 second timeout for faster responses
                )
                
                response_text = response.text
                
                # Cache the response
                self.response_cache[cache_key] = {
                    "response": response_text,
                    "timestamp": time.time()
                }
                
                # Stream the response
                words = response_text.split()
                for i, word in enumerate(words):
                    yield word + " "
                    if i % 3 == 0:
                        await asyncio.sleep(0.02)  # Very fast streaming for Gemini
                        
            except asyncio.TimeoutError:
                logger.warning(f"Response timeout for user {user_id}")
                yield "⏱️ Yanıt biraz uzun sürüyor... Lütfen bekleyin veya sorunuzu daha kısa tutun."
                
        except Exception as e:
            logger.error(f"Enhanced response error: {e}")
            yield f"❌ Üzgünüm, şu anda teknik bir sorun yaşıyorum. Hata: {str(e)}"
    
    async def _search_relevant_context(
        self, message: str, user_id: str, context: str
    ) -> List[Document]:
        """Search for relevant context from vector store"""
        
        # Search user's CV if available
        user_docs = self.vector_store.similarity_search(
            message,
            k=2,
            filter={"user_id": user_id, "type": "cv"}
        )
        
        # Search UpSchool knowledge base
        knowledge_docs = self.vector_store.similarity_search(
            message,
            k=2,
            filter={"type": "knowledge_base"}
        )
        
        return user_docs + knowledge_docs
    
    def _build_enhanced_prompt(
        self, 
        message: str, 
        context: str, 
        user_data: Optional[Dict],
        relevant_docs: List[Document]
    ) -> str:
        """Build enhanced prompt with context and retrieved information"""
        
        base_prompt = f"""
        Sen Ada AI'sın - UpSchool mezunu teknoloji kadınlarının AI mentoru.
        
        KİŞİLİĞİN:
        • Destekleyici, empatik ama profesyonel
        • Teknoloji tutkunu ve feminist değerlere sahip  
        • Pratik çözümler üreten, aksiyon odaklı
        • İlham verici ama gerçekçi
        • Türkçe konuşan, samimi ama saygılı
        
        BAĞLAM: {context}
        
        KULLANICI BİLGİLERİ:
        {json.dumps(user_data, ensure_ascii=False) if user_data else "Bilinmiyor"}
        
        İLGİLİ BELGELER VE BİLGİLER:
        """
        
        # Add relevant documents
        for doc in relevant_docs:
            base_prompt += f"\n- {doc.page_content[:300]}...\n"
        
        base_prompt += f"""
        
        KULLANICI MESAJI: {message}
        
        Yukarıdaki bilgileri kullanarak kişiselleştirilmiş, pratik ve destekleyici bir yanıt ver.
        Eğer kullanıcının CV'si varsa ondan da yararlan.
        """
        
        return base_prompt
    
    async def get_cv_insights(self, user_id: str) -> Dict[str, Any]:
        """Get specific insights about user's CV"""
        
        try:
            # Search user's CV documents
            cv_docs = self.vector_store.similarity_search(
                "CV analizi beceriler deneyim",
                k=5,
                filter={"user_id": user_id, "type": "cv"}
            )
            
            if not cv_docs:
                return {
                    "insights": "Henüz CV yüklenmemiş. CV yükleyerek kişiselleştirilmiş analiz alabilirsin!",
                    "has_cv": False
                }
            
            # Combine CV content
            cv_content = "\n".join([doc.page_content for doc in cv_docs])
            
            insights_prompt = f"""
            UpSchool mezunu adayın CV içeriğini analiz et:
            
            {cv_content[:1500]}
            
            Şu konularda öngörüler ver:
            1. Güçlü teknik beceriler
            2. Proje deneyimi kalitesi  
            3. Kariyer gelişim önerileri
            4. Eksik alanlar ve öğrenme planı
            5. İş başvuru stratejisi
            
            Kısa ve actionable tavsiyeler ver:
            """
            
            response = await asyncio.to_thread(self.gemini_model.generate_content, insights_prompt)
            
            return {
                "insights": response.text,
                "has_cv": True,
                "cv_chunks": len(cv_docs),
                "analyzed_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"CV insights error: {e}")
            return {
                "insights": "CV analizi şu anda yapılamıyor.",
                "has_cv": False,
                "error": str(e)
            }
    
    async def cleanup_user_data(self, user_id: str):
        """Clean up user-specific data (GDPR compliance)"""
        try:
            # Remove user's documents from vector store
            collection = self.chroma_client.get_collection("upschool_documents")
            collection.delete(where={"user_id": user_id})
            
            # Remove user memory
            if user_id in self.user_memories:
                del self.user_memories[user_id]
            
            logger.info(f"Cleaned up data for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Cleanup error for user {user_id}: {e}")
            return False

# Global instance
enhanced_ada_ai = EnhancedAdaAI()

async def get_enhanced_ai_response(
    user_id: str,
    message: str,
    context: str = "general",
    user_data: Optional[Dict] = None
) -> AsyncGenerator[str, None]:
    """Get enhanced AI response with memory and retrieval"""
    async for chunk in enhanced_ada_ai.get_enhanced_response(
        user_id, message, context, user_data
    ):
        yield chunk

async def upload_user_cv(
    user_id: str, 
    file_content: bytes, 
    filename: str
) -> Dict[str, Any]:
    """Upload and process user CV"""
    return await enhanced_ada_ai.upload_cv(user_id, file_content, filename)

async def get_user_cv_insights(user_id: str) -> Dict[str, Any]:
    """Get CV-based insights for user"""
    return await enhanced_ada_ai.get_cv_insights(user_id) 