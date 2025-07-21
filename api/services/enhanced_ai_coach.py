import asyncio
import json
import logging
import os
from pathlib import Path
from typing import Dict, List, Optional, AsyncGenerator, Any
from datetime import datetime

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_ollama import OllamaLLM
from langchain.schema import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.prompts import PromptTemplate
import PyPDF2
from io import BytesIO

logger = logging.getLogger(__name__)

class EnhancedAdaAI:
    """
    Enhanced Ada AI Coach with:
    - Vector DB for CV/document storage and retrieval
    - LangChain for conversation memory
    - Sentence Transformers for Turkish embeddings
    - CV upload and parsing capabilities
    """
    
    def __init__(self):
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        
        # Initialize vector store directory
        self.chroma_dir = self.data_dir / "chroma_db"
        self.chroma_dir.mkdir(exist_ok=True)
        
        # Initialize embeddings (Turkish-English BGE model)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-base-en-v1.5",  # Fallback to English if Turkish not available
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(path=str(self.chroma_dir))
        
        # Initialize vector store
        self.vector_store = Chroma(
            client=self.chroma_client,
            collection_name="upschool_documents",
            embedding_function=self.embeddings,
            persist_directory=str(self.chroma_dir)
        )
        
        # Initialize LLM
        self.llm = OllamaLLM(
            model="llama3.2:3b",
            temperature=0.7,
            base_url="http://localhost:11434"
        )
        
        # Text splitter for documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Initialize memory for each user session
        self.user_memories: Dict[str, ConversationBufferWindowMemory] = {}
        
        # Initialize UpSchool knowledge base
        self._setup_upschool_knowledge()
        
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
            response = await asyncio.to_thread(self.llm.invoke, analysis_prompt)
            return {
                "analysis": response,
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
            # Get user memory
            memory = self.get_user_memory(user_id)
            
            # Search relevant documents
            relevant_docs = await self._search_relevant_context(
                message, user_id, context
            )
            
            # Create enhanced prompt with context
            enhanced_prompt = self._build_enhanced_prompt(
                message, context, user_data, relevant_docs
            )
            
            # Create retrieval chain
            retrieval_chain = ConversationalRetrievalChain.from_llm(
                llm=self.llm,
                retriever=self.vector_store.as_retriever(search_kwargs={"k": 3}),
                memory=memory,
                return_source_documents=True,
                verbose=True
            )
            
            # Get response
            response = await asyncio.to_thread(
                retrieval_chain.invoke,
                {"question": enhanced_prompt}
            )
            
            # Stream the response
            full_response = response['answer']
            
            # Simulate streaming
            words = full_response.split()
            for i, word in enumerate(words):
                yield word + " "
                if i % 3 == 0:  # Add small delay every few words
                    await asyncio.sleep(0.05)
            
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
            
            response = await asyncio.to_thread(self.llm.invoke, insights_prompt)
            
            return {
                "insights": response,
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