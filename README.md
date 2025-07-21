# 🚀 HireHer AI - Teknoloji Kadınları İçin AI Destekli İş Platformu

> **UpSchool Mezunu Teknoloji Kadınlarının Kariyer Yolculuğunda AI Mentoru** 👩‍💻✨

## 📋 Proje Özeti

HireHer AI, teknoloji sektöründe çalışmak isteyen kadınlar için geliştirilmiş kapsamlı bir AI destekli iş platformudur. UpSchool bootcamp mezunlarının kariyer yolculuğunu desteklemek için tasarlanmış modern web uygulaması.

## 🎯 Temel Özellikler

### 🤖 Ada AI - Enhanced Kariyer Koçu
- **Vector Database & Memory**: ChromaDB + LangChain ile akıllı bellek sistemi
- **CV Upload & Analysis**: PDF/DOC yükleme ve AI tabanlı analiz
- **Streaming Chat**: Gerçek zamanlı AI sohbet deneyimi
- **Context-Aware**: Profil, mülakat, network odaklı özelleşmiş yanıtlar
- **UpSchool Knowledge Base**: Bootcamp ve sektör bilgileri entegre
- **Türkçe Sentence Embeddings**: Geliştirilmiş anlam analizi

### 🎯 Mülakat Hazırlık Sistemi
- AI destekli mülakat simülasyonu
- Kendini tanıtma pratiği
- Teknik beceri değerlendirmesi
- Şirket araştırma rehberi
- Özgüven artırma modülleri

### 👥 UpSchool Mezun Topluluğu
- Kaydırılabilir başarı hikayeleri
- Mezun network haritası
- Mentor-mentee eşleştirme
- Teknoloji kadınları etkinlikleri
- Güçlendirici topluluk deneyimi

### 💼 Akıllı İş Eşleştirme
- AI tabanlı beceri analizi
- Kişiselleştirilmiş iş önerileri  
- Otomatik başvuru sistemi
- Real-time iş ilanları
- Kariyer yol haritası

## 🛠️ Teknoloji Yığını

### Frontend
- **React 18** - Modern component architecture
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **TanStack Query** - Server state management
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications
- **WebSocket** - Real-time communication

### Backend
- **Python 3.12** - Modern Python features
- **FastAPI** - High-performance async API
- **SQLite** - Lightweight database (mock)
- **SQLAlchemy** - Async ORM
- **Celery + Redis** - Background task processing
- **SendGrid** - Email service integration

### AI & Machine Learning
- **Ollama + Llama 3.2:3b** - Open-source LLM
- **ChromaDB** - Vector database for embeddings
- **LangChain** - LLM application framework
- **Sentence Transformers** - Text embeddings
- **PyPDF2** - PDF document processing
- **OpenAI API** - Fallback AI service (mocked)

### Enhanced AI Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI        │    │   Ollama        │
│   React + TS    │◄──►│   + LangChain    │◄──►│   Llama 3.2:3b  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   ChromaDB       │
                       │   Vector Store   │
                       │   + Embeddings   │
                       └──────────────────┘
```

## 🚀 Kurulum & Çalıştırma

### Ön Gereksinimler
- Node.js 18+
- Python 3.12+
- Ollama (Enhanced AI için)

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/your-username/hireher-ai.git
cd hireher-ai
```

### 2. Backend Kurulumu
```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Ollama & Enhanced AI Kurulumu
```bash
# Otomatik kurulum scripti
chmod +x scripts/setup_ollama.sh
./scripts/setup_ollama.sh

# Manuel kurulum
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve  # Background'da çalıştır
ollama pull llama3.2:3b
```

### 4. Frontend Kurulumu
```bash
cd web
npm install
```

### 5. Uygulamayı Başlatın

**Backend (Terminal 1):**
```bash
cd api
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend (Terminal 2):**
```bash
cd web
npm run dev
```

**Ollama (Terminal 3 - Eğer background'da değilse):**
```bash
ollama serve
```

## 🧠 Enhanced AI Coach - Ada AI

### Özellikler
- **Vector Database**: ChromaDB ile belge saklama ve arama
- **Conversation Memory**: LangChain ile oturum bazlı hafıza
- **CV Processing**: PDF yükleme ve akıllı analiz
- **Streaming Responses**: Gerçek zamanlı token akışı
- **Context-Aware**: Durum bazlı özelleştirilmiş yanıtlar

### API Endpoints

#### Enhanced Chat
```bash
# Non-streaming
POST /ai-coach/chat/enhanced
{
  "message": "Kariyerimde nasıl ilerleyebilirim?",
  "context": "career",
  "user_data": {"id": "user123", "name": "Ayşe"},
  "use_enhanced": true
}

# Streaming
POST /ai-coach/chat/enhanced/stream
# Server-Sent Events formatında stream döner
```

#### CV Upload & Analysis
```bash
# CV Yükleme
POST /ai-coach/cv/upload?user_id=user123
Content-Type: multipart/form-data
# File: PDF/DOC/TXT

# CV Insights
POST /ai-coach/cv/insights
{"user_id": "user123"}
```

### Kullanım Örnekleri

#### 1. Basic Chat
```python
import asyncio
from api.services.enhanced_ai_coach import get_enhanced_ai_response

async def chat_example():
    user_id = "demo_user"
    message = "React ile yeni proje başlıyorum, tavsiye ver"
    
    async for chunk in get_enhanced_ai_response(
        user_id=user_id,
        message=message,
        context="career"
    ):
        print(chunk, end="", flush=True)

asyncio.run(chat_example())
```

#### 2. CV Upload
```python
from api.services.enhanced_ai_coach import upload_user_cv

async def cv_upload_example():
    with open("cv.pdf", "rb") as f:
        result = await upload_user_cv(
            user_id="demo_user",
            file_content=f.read(),
            filename="cv.pdf"
        )
    print(result)
```

## 🎨 UI/UX Tasarım

### UpSchool Kurumsal Kimlik
- **Primary Color**: #3A4EFF (UP Blue)
- **Secondary**: #202B7C (Dark Blue)  
- **Accent**: #FFFFFF (White)
- **Light Gray**: #F2F4F7
- **Dark Gray**: #6B7280

### Tasarım İlkeleri
- **Glassmorphism**: Modern cam efekti
- **Responsive First**: Mobil öncelikli tasarım
- **Accessibility**: WCAG 2.1 AA uyumlu
- **Minimalist**: Temiz ve amaçlı arayüz
- **Empowering**: Güçlendirici renk paleti

## 📱 Responsive Tasarım

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+
- **Large**: 1440px+

## 🔧 Geliştirme

### Proje Yapısı
```
hireher-ai/
├── api/                    # Backend (FastAPI)
│   ├── services/
│   │   ├── enhanced_ai_coach.py    # Enhanced AI servis
│   │   ├── ollama_service.py       # Basic AI servis
│   │   └── ai_service.py           # AI utilities
│   ├── main.py            # API endpoints
│   └── requirements.txt
├── web/                   # Frontend (React)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   └── App.tsx
│   └── package.json
├── scripts/
│   └── setup_ollama.sh    # Ollama kurulum scripti
└── README.md
```

### Code Standards
- **TypeScript** - Strict mode enabled
- **ESLint + Prettier** - Code formatting
- **Python Black** - Backend formatting
- **Component-driven** - Reusable components
- **API-first** - Backend-frontend separation

## 🚀 Deployment

### Backend
```bash
# Production
gunicorn api.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Docker
docker build -t hireher-api .
docker run -p 8000:8000 hireher-api
```

### Frontend
```bash
# Build
npm run build

# Preview
npm run preview
```

## 🧪 Testing

### Backend Tests
```bash
cd api
pytest tests/ -v
```

### Frontend Tests
```bash
cd web
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📊 Monitoring & Analytics

- **API Metrics**: FastAPI built-in metrics
- **User Analytics**: React error boundaries
- **AI Performance**: Response time tracking
- **CV Processing**: Success rate monitoring

## 🔐 Güvenlik

- **CORS**: Configured for development
- **Input Validation**: Pydantic models
- **File Upload**: Type & size restrictions
- **API Rate Limiting**: Production ready
- **Data Privacy**: GDPR compliant cleanup

## 🤝 Katkıda Bulunma

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Takım

- **Frontend**: React + TypeScript
- **Backend**: Python + FastAPI
- **AI**: Ollama + LangChain
- **Design**: UpSchool Corporate Identity

## 🙏 Teşekkürler

- **UpSchool** - Teknoloji kadınları topluluğuna güç verdiği için
- **Ollama** - Açık kaynak LLM altyapısı için
- **LangChain** - AI uygulama framework'ü için
- **ChromaDB** - Vector database çözümü için

## 📞 İletişim

- **Website**: [HireHer AI](https://hireher.ai)
- **Email**: hello@hireher.ai
- **LinkedIn**: [@hireher-ai](https://linkedin.com/company/hireher-ai)

---

**🌟 "Her teknoloji kadınının hikayesi, geleceğin teknolojisini şekillendiriyor." 🌟**