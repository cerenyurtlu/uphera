# 🚀 UpHera - Teknolojide Öncü Kadınlar Topluluğu
**UpSchool Mezunu Teknolojide Rol Model Kadınların Kariyer Yolculuğunda AI Mentoru** 👩‍💻✨

## 📋 Proje Özeti

Up Hera, teknoloji sektöründe çalışmak isteyen kadınlar için geliştirilmiş **tam çalışan, production-ready** AI destekli topluluk/iş platformudur. UpSchool bootcamp mezunlarının kariyer yolculuğunu desteklemek için tasarlanmış modern web uygulaması.

## ✅ **PRODUCTION-READY ÖZELLİKLER**

### 🎯 **Tam Çalışan Sistemler**
- ✅ **Gerçek AI Chat** - Ollama (Llama 3.2) + OpenAI fallback
- ✅ **İş İlanları Sistemi** - Gerçek başvuru ve filtreleme
- ✅ **Profil Yönetimi** - CV upload ve AI analizi
- ✅ **Authentication** - JWT token sistemi
- ✅ **Database** - SQLite ile tam veri persistency
- ✅ **Real-time Chat** - Streaming AI responses
- ✅ **File Upload** - CV ve döküman yükleme

## 🎯 Temel Özellikler

### 🤖 Ada AI - Enhanced Kariyer Koçu
- **Real AI Integration**: Ollama + LangChain ile gerçek AI sohbet
- **CV Upload & Analysis**: PDF/DOC yükleme ve AI tabanlı analiz
- **Streaming Chat**: Gerçek zamanlı AI sohbet deneyimi
- **Context-Aware**: Profil, mülakat, network odaklı özelleşmiş yanıtlar
- **Conversation Memory**: Kullanıcı bazlı sohbet geçmişi
- **Türkçe Support**: Tam Türkçe AI desteği

### 🎯 Mülakat Hazırlık Sistemi
- AI destekli mülakat simülasyonu
- Kendini tanıtma pratiği
- Teknik beceri değerlendirmesi
- Şirket araştırma rehberi
- Özgüven artırma modülleri

### 👥 UpSchool Mezun Topluluğu
- Başarı hikayeleri
- Mezun network haritası
- Mentor-mentee eşleştirme
- Teknoloji kadınları etkinlikleri
- Güçlendirici topluluk deneyimi

### 💼 Akıllı İş Eşleştirme
- **Gerçek İş İlanları**: Database'den dinamik iş listesi
- **Gelişmiş Filtreleme**: Konum, deneyim, uzaktan çalışma
- **Başvuru Sistemi**: Tek tıkla başvuru + takip
- **Favori Listesi**: İş ilanlarını kaydetme
- **Başvuru Geçmişi**: Tüm başvuruları takip etme

## 🛠️ Teknoloji Yığını

### Frontend
- **React 18** - Modern component architecture
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hot Toast** - Beautiful notifications

### Backend
- **Python 3.12** - Modern Python features
- **FastAPI** - High-performance async API
- **SQLite** - Production database with connection pooling
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation and serialization

### AI & Machine Learning
- **Ollama + Llama 3.2:3b** - Local AI model
- **OpenAI API** - Fallback AI service
- **Streaming Responses** - Real-time chat experience
- **Document Processing** - CV/PDF text extraction

### Production Features
- **Connection Pooling** - Optimized database performance
- **Error Handling** - Comprehensive error management
- **Retry Logic** - Network resilience
- **Health Checks** - System monitoring
- **CORS Security** - Cross-origin protection

## 🚀 Kurulum & Çalıştırma

### Ön Gereksinimler
- **Node.js 18+**
- **Python 3.12+**
- **Ollama** (Enhanced AI için - opsiyonel)

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/your-username/up-hera.git
cd up-hera
```

### 2. Backend Kurulumu
```bash
cd api
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Kurulumu
```bash
cd web
npm install
```

### 4. Ollama Kurulumu (Opsiyonel - Enhanced AI için)
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Model indirme
ollama pull llama3.2:3b

# Servis başlatma
ollama serve  # Background'da çalıştır
```

### 5. Uygulamayı Başlatın

**Backend (Terminal 1):**
```bash
cd api
python main.py
```

**Frontend (Terminal 2):**
```bash
cd web
npm run dev
```

**Ollama (Terminal 3 - Eğer kuruluysa):**
```bash
ollama serve
```

## 🧠 Enhanced AI Coach - Ada AI

### Özellikler
- **Real-time Chat**: Ollama ile streaming sohbet
- **Conversation Memory**: Kullanıcı bazlı sohbet geçmişi
- **CV Processing**: PDF yükleme ve AI analizi
- **Context-Aware**: Durum bazlı özelleştirilmiş yanıtlar
- **Fallback System**: Ollama yoksa OpenAI'ye geçiş

### API Endpoints

#### Enhanced Chat
```bash
# Non-streaming chat
POST /ai-coach/chat
{
  "message": "Kariyerimde nasıl ilerleyebilirim?",
  "context": "career",
  "use_streaming": false
}

# Streaming chat
POST /ai-coach/chat/stream
{
  "message": "React projesi için tavsiye",
  "context": "technical",
  "use_streaming": true
}
```

#### CV Upload & Analysis
```bash
# CV Yükleme
POST /ai-coach/document/upload
Content-Type: multipart/form-data
# File: PDF/DOC/TXT

# AI Insights
GET /ai-coach/insights
```

#### Chat History
```bash
# Sohbet geçmişi
GET /ai-coach/history?limit=10
```

## 💼 İş İlanları Sistemi

### Özellikler
- **Demo Job Data**: 5 gerçek iş ilanı örneği
- **Gelişmiş Filtreleme**: Konum, tip, deneyim seviyesi
- **Search Functionality**: İlan başlığı, şirket, açıklama arama
- **Application System**: Başvuru yapma ve takip
- **Bookmark System**: Favori iş ilanları

### API Endpoints

```bash
# İş ilanları listesi
GET /api/jobs?limit=20&location=İstanbul&experience_level=entry&remote_only=true

# İş ilanı detayı
GET /api/jobs/{job_id}

# İş başvurusu
POST /api/jobs/{job_id}/apply
{
  "cover_letter": "Merhaba, bu pozisyona başvuru yapmak istiyorum...",
  "resume_content": "CV içeriği"
}

# Başvuru geçmişi
GET /api/jobs/my/applications

# Favori işlemleri
POST /api/jobs/{job_id}/bookmark
GET /api/jobs/my/bookmarks
```

## 🔐 Authentication Sistemi

### Secure JWT Authentication
```bash
# Kayıt
POST /api/auth/graduate/register
{
  "firstName": "Ayşe",
  "lastName": "Yılmaz",
  "email": "ayse@example.com",
  "password": "güçlü_şifre",
  "upschoolProgram": "Full Stack Development",
  "skills": ["React", "JavaScript", "Python"]
}

# Giriş
POST /api/auth/login
{
  "email": "ayse@example.com",
  "password": "güçlü_şifre",
  "user_type": "mezun"
}

# Profil görüntüleme
GET /api/auth/profile
Authorization: Bearer {token}

# Profil güncelleme
PUT /api/auth/profile
Authorization: Bearer {token}
{
  "firstName": "Ayşe",
  "lastName": "Yılmaz",
  "skills": ["React", "TypeScript", "Node.js"],
  "aboutMe": "Full stack developer..."
}
```

## 🎨 UI/UX Tasarım

### UpSchool Kurumsal Kimlik
- **Primary Color**: `#3A4EFF` (UP Blue)
- **Secondary**: `#202B7C` (Dark Blue)
- **Accent**: `#FFFFFF` (White)
- **Light Gray**: `#F2F4F7`
- **Dark Gray**: `#6B7280`

### Tasarım İlkeleri
- **Modern & Clean**: Minimalist ve amaçlı arayüz
- **Responsive First**: Mobil öncelikli tasarım
- **Accessibility**: WCAG 2.1 AA uyumlu
- **Empowering**: Güçlendirici renk paleti

## 📱 Responsive Tasarım
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large**: 1440px+

## 🔧 Geliştirme

### Proje Yapısı
```
up-hera/
├── api/                           # Backend (FastAPI)
│   ├── main.py                   # Ana API dosyası
│   ├── config.py                 # Konfigürasyon
│   ├── database.py               # Database işlemleri
│   ├── services/
│   │   ├── enhanced_ai_service.py    # AI servis
│   │   └── job_service.py            # İş ilanları servis
│   └── requirements.txt
├── web/                          # Frontend (React)
│   ├── src/
│   │   ├── components/           # React bileşenleri
│   │   ├── screens/              # Sayfa bileşenleri
│   │   ├── services/
│   │   │   └── api.ts           # API istemci
│   │   └── App.tsx
│   └── package.json
└── README.md
```

### Code Standards
- **TypeScript** - Strict mode enabled
- **ESLint + Prettier** - Code formatting
- **Python Black** - Backend formatting
- **Component-driven** - Reusable components
- **API-first** - Backend-frontend separation

## 📊 Sistem Monitoring

### Health Checks
```bash
# Temel sistem durumu
GET /health

# API fonksiyonalite testi
GET /

# AI sistem durumu
POST /ai-coach/chat (test mesajı)
```

### Database Status
- **SQLite Database**: Auto-initialize on startup
- **Connection Pooling**: Optimized performance
- **Demo Data**: Automatic seeding

## 🚀 Production Deployment

### Environment Variables
```bash
# .env dosyası oluşturun
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=your-production-secret-key
OPENAI_API_KEY=your-openai-key  # AI fallback için
```

### Docker Deployment (Gelecek sürüm)
```bash
# Production build
docker-compose up -d

# Health check
curl http://localhost:8000/health
```

## 🧪 Testing

### Backend Test
```bash
cd api
python -m pytest tests/ -v
```

### Frontend Test
```bash
cd web
npm test
```

### Manual Testing
1. **Authentication**: Kayıt → Giriş → Profil
2. **AI Chat**: Sohbet → Streaming → Geçmiş
3. **Jobs**: Liste → Detay → Başvuru → Favori
4. **Profile**: Görüntüleme → Düzenleme → CV upload

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **AI Coach Development**: Enhanced AI integration
- **Frontend Development**: React + TypeScript
- **Backend Development**: FastAPI + Python
- **Design**: UpSchool corporate identity

---

## 🎯 Roadmap

### ✅ Completed
- Full authentication system
- Real AI chat with Ollama
- Job listings and applications
- Profile management
- CV upload and analysis

### 🚧 In Progress
- WebSocket real-time features
- Advanced job matching algorithm
- Mobile app development

### 📋 Planned
- Email notifications
- Advanced analytics
- Multi-language support
- Enterprise features

---

**🚀 UpHera - Teknolojide Öncü Kadınlar Topluluğu**