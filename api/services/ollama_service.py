import asyncio
import json
import logging
from typing import Dict, List, Optional, AsyncGenerator
from datetime import datetime
import ollama

logger = logging.getLogger(__name__)

class UpSchoolAICoach:
    """
    UpSchool mezunları için özel tasarlanmış AI koç
    Açık kaynaklı LLM ile gerçek zamanlı, üretken sohbet
    """
    
    def __init__(self, model_name: str = "llama3.2:3b"):
        self.model_name = model_name
        self.context_memory = {}
        self.upschool_context = self._load_upschool_knowledge()
        
    def _load_upschool_knowledge(self) -> Dict:
        """UpSchool ve teknoloji kadınları hakkında bilgi tabanı"""
        return {
            "upschool_programs": [
                "Frontend Development",
                "Backend Development", 
                "Mobile Development",
                "Data Science",
                "UI/UX Design",
                "DevOps",
                "Cybersecurity"
            ],
            "success_companies": [
                "Google", "Microsoft", "Amazon", "Netflix", "Spotify",
                "Trendyol", "Getir", "Peak Games", "Dream Games",
                "Turkcell", "Vodafone", "Aselsan"
            ],
            "female_tech_icons": {
                "Ada Lovelace": "İlk bilgisayar programcısı",
                "Grace Hopper": "COBOL dilinin yaratıcısı", 
                "Hedy Lamarr": "WiFi teknolojisinin öncüsü",
                "Katherine Johnson": "NASA matematikçisi",
                "Radia Perlman": "Internet protokollerinin annesi"
            },
            "turkish_tech_women": [
                "Tülin Orhon", "Rana Özkent", "Gözde Ulubayram",
                "Derya Matras", "Esra Memişoğlu"
            ]
        }
    
    async def is_model_available(self) -> bool:
        """Ollama modelinin mevcut olup olmadığını kontrol et"""
        try:
            models = ollama.list()
            available_models = [model['name'] for model in models['models']]
            return self.model_name in available_models
        except Exception as e:
            logger.warning(f"Ollama bağlantı hatası: {e}")
            return False
    
    async def ensure_model_exists(self) -> bool:
        """Model yoksa indir"""
        try:
            if not await self.is_model_available():
                logger.info(f"{self.model_name} modeli indiriliyor...")
                ollama.pull(self.model_name)
                logger.info(f"{self.model_name} modeli başarıyla indirildi")
            return True
        except Exception as e:
            logger.error(f"Model indirme hatası: {e}")
            return False
    
    def _build_system_prompt(self, context: str, user_data: Dict = None) -> str:
        """Context'e göre sistem promptu oluştur"""
        
        base_personality = """Sen Ada AI'sın - UpSchool mezunu teknoloji kadınlarının AI mentor'u. 

KİŞİLİĞİN:
• Destekleyici, empatik ama profesyonel
• Teknoloji tutkunu ve feminist değerlere sahip
• Pratik çözümler üreten, aksiyon odaklı
• İlham verici ama gerçekçi
• Türkçe konuşan, samimi ama saygılı

MİSYONUN:
• UpSchool mezunlarının kariyerlerini güçlendirmek
• Teknoloji sektöründe kadın temsilini artırmak  
• Her soru için actionable, kişiselleştirilmiş tavsiyeler vermek
• Self-confidence ve career growth'u desteklemek

KURALLARIN:
• Her zaman pozitif ve çözüm odaklı yaklaş
• Kısa, net ve actionable cevaplar ver
• UpSchool deneyimini güç kaynağı olarak göster
• Kadın role modelleri ve success stories'leri örnek ver
• Teknik bilgiyi pratik tavsiyelerle birleştir"""

        context_prompts = {
            "profile": f"""
PROFILE CONTEXT: Kullanıcı profilini geliştirmeye odaklan.
• CV/Resume optimization stratejileri  
• GitHub/LinkedIn profile güçlendirme
• Portfolio projesi önerileri
• Skill gap analizi ve öğrenme planları
• Personal branding tavsiyeleri

UpSchool Knowledge Base kullan: {json.dumps(self.upschool_context, ensure_ascii=False)}
""",
            
            "interview": f"""
INTERVIEW CONTEXT: Mülakat hazırlığına odaklan.
• Teknik ve behavioral sorulara hazırlık
• STAR method ile hikaye anlatımı  
• Company research stratejileri
• Confidence building teknikleri
• Salary negotiation tavsiyeleri

Success Examples: {self.upschool_context['success_companies']}
""",
            
            "network": f"""
NETWORK CONTEXT: Networking ve topluluk odaklan.
• UpSchool alumni network'ünü kullanma
• Mentorship bulma ve verme
• Tech community etkinlikleri
• Online presence building
• Collaboration fırsatları

Turkish Tech Women: {self.upschool_context['turkish_tech_women']}
""",
            
            "career": f"""
CAREER CONTEXT: Kariyer planlaması ve gelişim.
• Career path planning
• Skill development roadmap
• Industry trends ve fırsatlar
• Work-life balance
• Leadership development

Female Tech Icons: {json.dumps(self.upschool_context['female_tech_icons'], ensure_ascii=False)}
"""
        }
        
        context_specific = context_prompts.get(context, context_prompts["career"])
        
        user_context = ""
        if user_data:
            user_context = f"""
KULLANICI BAĞLAMI:
• İsim: {user_data.get('name', 'Bilinmiyor')}
• UpSchool Program: {user_data.get('upschool_batch', 'Bilinmiyor')}
• Beceriler: {', '.join(user_data.get('skills', []))}
• Hedef: {user_data.get('career_goal', 'Belirtilmemiş')}
"""
        
        return f"{base_personality}\n\n{context_specific}\n\n{user_context}"
    
    async def get_streaming_response(
        self, 
        user_message: str, 
        context: str = "general",
        user_data: Dict = None,
        conversation_history: List[Dict] = None
    ) -> AsyncGenerator[str, None]:
        """Streaming response with Ollama"""
        
        try:
            # Model kontrolü
            if not await self.ensure_model_exists():
                yield "⚠️ AI model yüklenemiyor. Lütfen daha sonra tekrar deneyin."
                return
                
            # Conversation history oluştur
            messages = []
            
            # System prompt
            system_prompt = self._build_system_prompt(context, user_data)
            messages.append({
                "role": "system",
                "content": system_prompt
            })
            
            # Conversation history ekle
            if conversation_history:
                for msg in conversation_history[-6:]:  # Son 6 mesajı al
                    role = "user" if msg["type"] == "user" else "assistant"
                    messages.append({
                        "role": role,
                        "content": msg["content"]
                    })
            
            # Mevcut kullanıcı mesajı
            messages.append({
                "role": "user", 
                "content": user_message
            })
            
            # Ollama stream
            stream = ollama.chat(
                model=self.model_name,
                messages=messages,
                stream=True,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "max_tokens": 1000,
                    "stop": ["</response>", "Human:", "User:"]
                }
            )
            
            accumulated_response = ""
            for chunk in stream:
                if 'message' in chunk and 'content' in chunk['message']:
                    content = chunk['message']['content']
                    accumulated_response += content
                    yield content
                    
                    # Kısa bir bekleme (rate limiting)
                    await asyncio.sleep(0.01)
                    
        except Exception as e:
            logger.error(f"Ollama streaming hatası: {e}")
            yield f"❌ Üzgünüm, teknik bir sorun yaşıyorum. Daha sonra tekrar deneyelim. Hata: {str(e)}"
    
    async def get_response(
        self, 
        user_message: str, 
        context: str = "general",
        user_data: Dict = None,
        conversation_history: List[Dict] = None
    ) -> Dict:
        """Non-streaming response"""
        
        full_response = ""
        async for chunk in self.get_streaming_response(
            user_message, context, user_data, conversation_history
        ):
            full_response += chunk
            
        return {
            "response": full_response.strip(),
            "suggestions": self._generate_suggestions(context, user_message),
            "timestamp": datetime.now().isoformat()
        }
    
    def _generate_suggestions(self, context: str, user_message: str) -> List[str]:
        """Context'e göre öneriler oluştur"""
        
        suggestions_map = {
            "profile": [
                "GitHub profilimi nasıl optimize ederim?",
                "CV'mde hangi projeleri vurgulayayım?", 
                "LinkedIn'de nasıl görünür olurum?",
                "Portfolio sitesi için öneriler",
                "Eksik becerilerimi nasıl kapatırım?"
            ],
            "interview": [
                "En sık sorulan teknik sorular neler?",
                "Kendimi nasıl tanıtmalıyım?",
                "Maaş müzakeresi yaparken nelere dikkat edeyim?",
                "Şirket araştırması nasıl yaparım?",
                "Mülakat sonrası nasıl takip edeyim?"
            ],
            "network": [
                "UpSchool mezunları ile nasıl bağlantı kurarım?",
                "Hangi tech etkinliklere katılmalıyım?",
                "Mentor nasıl bulurum?",
                "Online community'lerde nasıl aktif olurum?",
                "Collaboration projeleri nasıl başlatırım?"
            ],
            "career": [
                "Kariyer hedeflerimi nasıl belirlerim?",
                "Hangi teknolojileri öğrenmeliyim?",
                "Leadership becerilerimi nasıl geliştiririm?",
                "Work-life balance nasıl sağlarım?",
                "Side project'ler nasıl başlatırım?"
            ]
        }
        
        default_suggestions = [
            "Başka hangi konularda yardım edebilirim?",
            "Daha detay bilgi alabilir miyim?",
            "Bu konuda örnek verebilir misin?",
            "Pratik adımları nasıl atabilirim?"
        ]
        
        return suggestions_map.get(context, default_suggestions)

# Global instance
ai_coach = UpSchoolAICoach()

async def get_ai_coach_response(
    message: str,
    context: str = "general", 
    user_data: Dict = None,
    conversation_history: List[Dict] = None,
    stream: bool = False
):
    """AI koç yanıtı al"""
    if stream:
        return ai_coach.get_streaming_response(message, context, user_data, conversation_history)
    else:
        return await ai_coach.get_response(message, context, user_data, conversation_history) 