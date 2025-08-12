# Up Hera Vercel Deployment Rehberi

## 🚀 Vercel'de Deploy Alma Adımları

### ⚠️ ÖNEMLİ: Ayrı Projeler Yaklaşımı

API ve Web uygulaması ayrı Vercel projeleri olarak deploy edilecek:
- **API Projesi**: `up-hera-api.vercel.app`
- **Web Projesi**: `up-hera-web.vercel.app`

### 🔧 ÖNEMLİ: AI Servisleri Geçici Olarak Devre Dışı

Vercel'in disk alanı sınırlaması nedeniyle AI servisleri (chat, document upload, insights) geçici olarak devre dışı bırakılmıştır. Bu servisler daha sonra ayrı bir AI servisi olarak deploy edilebilir.

### 1. API Deploy (Backend)

#### Gerekli Environment Variables:
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI (opsiyonel - AI servisleri devre dışı)
OPENAI_API_KEY=your_openai_api_key

# SendGrid (Email)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@uphera.ai
SENDGRID_SANDBOX_MODE=false

# Security
SECRET_KEY=your_very_secure_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend URL
FRONTEND_URL=https://up-hera-web.vercel.app

# API Settings
API_DEBUG=false
```

#### Deploy Adımları:
1. **Vercel CLI ile:**
```bash
cd api
vercel --prod --name up-hera-api
```

2. **Veya GitHub'dan:**
   - API klasörünü ayrı bir repo'ya push edin
   - Vercel'de yeni proje oluşturun: `up-hera-api`
   - GitHub repo'nuzu bağlayın
   - Environment variables'ları ayarlayın

### 2. Web Deploy (Frontend)

#### Gerekli Environment Variables:
```bash
VITE_API_URL=https://up-hera-api.vercel.app
```

#### Deploy Adımları:
1. **Vercel CLI ile:**
```bash
cd web
vercel --prod --name up-hera-web
```

2. **Veya GitHub'dan:**
   - Web klasörünü ayrı bir repo'ya push edin
   - Vercel'de yeni proje oluşturun: `up-hera-web`
   - GitHub repo'nuzu bağlayın
   - Environment variables'ları ayarlayın

### 3. Otomatik Deployment

#### Script Kullanarak:
```bash
# Tüm projeyi deploy et
./scripts/deploy-vercel.sh

# Veya sadece API
cd api && vercel --prod --name up-hera-api

# Veya sadece Web
cd web && vercel --prod --name up-hera-web
```

### 4. Database Kurulumu

#### PostgreSQL (Önerilen):
1. **Vercel Postgres** kullanın (en kolay)
2. **Supabase** kullanın
3. **Railway** kullanın
4. DATABASE_URL'i environment variable olarak ekleyin

#### Vercel Postgres Kurulumu:
1. Vercel Dashboard'da projenize gidin
2. Storage > Create Database
3. PostgreSQL seçin
4. DATABASE_URL'i kopyalayın ve environment variable olarak ekleyin

### 5. Environment Variables Ayarlama

#### API Projesi için:
```bash
# Vercel CLI ile
vercel env add DATABASE_URL
vercel env add SENDGRID_API_KEY
vercel env add SECRET_KEY
vercel env add FRONTEND_URL

# Veya Vercel Dashboard'dan
# Settings > Environment Variables
```

#### Web Projesi için:
```bash
# Vercel CLI ile
vercel env add VITE_API_URL

# Veya Vercel Dashboard'dan
# Settings > Environment Variables
```

### 6. Önemli Notlar

#### API için:
- `requirements-vercel.txt` kullanılıyor (minimal paketler)
- PostgreSQL desteği eklendi
- CORS ayarları production için güncellendi
- AI servisleri geçici olarak devre dışı
- Temel CRUD işlemleri çalışıyor

#### Web için:
- Vite build sistemi kullanılıyor
- API URL'i environment variable ile ayarlanıyor
- SPA routing için gerekli ayarlar yapıldı

### 7. Çalışan Özellikler

#### ✅ Çalışan Özellikler:
- Kullanıcı kayıt/giriş
- Profil yönetimi
- İş ilanları (mock data)
- Temel CRUD işlemleri
- Database bağlantısı

#### ⚠️ Geçici Olarak Devre Dışı:
- AI Chat
- Document Upload
- AI Insights
- Job Matching

### 8. Monitoring ve Debugging

#### Vercel Logs:
```bash
# API logs
vercel logs --scope up-hera-api

# Web logs
vercel logs --scope up-hera-web
```

#### Environment Variables Kontrolü:
```bash
vercel env ls --scope up-hera-api
vercel env ls --scope up-hera-web
```

### 9. Troubleshooting

#### Yaygın Sorunlar:
1. **CORS Hatası**: CORS_ORIGINS'te frontend URL'inin olduğundan emin olun
2. **Database Bağlantı Hatası**: DATABASE_URL'in doğru formatta olduğunu kontrol edin
3. **Build Hatası**: requirements-vercel.txt'deki paketlerin uyumlu olduğunu kontrol edin
4. **API URL Hatası**: Web projesinde VITE_API_URL'in doğru olduğunu kontrol edin

#### Debug Komutları:
```bash
# API build test
cd api
python -m pip install -r requirements-vercel.txt
python main.py

# Web build test
cd web
npm install
npm run build
```

### 10. Production Checklist

- [ ] API projesi deploy edildi
- [ ] Web projesi deploy edildi
- [ ] Environment variables ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] CORS ayarları doğru
- [ ] API URL'i web projesinde doğru
- [ ] SSL sertifikası aktif
- [ ] Custom domain ayarlandı (opsiyonel)
- [ ] Monitoring aktif
- [ ] Error logging aktif

### 11. URL'ler

- **API**: https://up-hera-api.vercel.app
- **Web**: https://up-hera-web.vercel.app
- **API Docs**: https://up-hera-api.vercel.app/docs

### 12. AI Servisleri Gelecek Planı

AI servislerini tekrar aktif etmek için:
1. Ayrı bir AI servisi oluşturun (Railway, Render, vb.)
2. Büyük AI paketlerini bu serviste barındırın
3. API'den bu servise HTTP istekleri gönderin

### 13. Support

Sorun yaşarsanız:
1. Vercel documentation'ı kontrol edin
2. GitHub issues'da arama yapın
3. Vercel support'a başvurun
