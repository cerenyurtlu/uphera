# Up Hera Vercel Deployment Rehberi

## 🚀 Vercel'de Deploy Alma Adımları

### 1. API Deploy (Backend)

#### Gerekli Environment Variables:
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# OpenAI
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
1. Vercel CLI ile API klasörüne gidin:
```bash
cd api
vercel
```

2. Veya GitHub'dan deploy:
   - API klasörünü ayrı bir repo'ya push edin
   - Vercel'de yeni proje oluşturun
   - GitHub repo'nuzu bağlayın
   - Environment variables'ları ayarlayın

### 2. Web Deploy (Frontend)

#### Gerekli Environment Variables:
```bash
VITE_API_URL=https://up-hera-api.vercel.app
```

#### Deploy Adımları:
1. Vercel CLI ile web klasörüne gidin:
```bash
cd web
vercel
```

2. Veya GitHub'dan deploy:
   - Web klasörünü ayrı bir repo'ya push edin
   - Vercel'de yeni proje oluşturun
   - GitHub repo'nuzu bağlayın
   - Environment variables'ları ayarlayın

### 3. Database Kurulumu

#### PostgreSQL (Önerilen):
1. Vercel Postgres kullanın veya
2. Supabase, Railway, veya başka bir PostgreSQL provider kullanın
3. DATABASE_URL'i environment variable olarak ekleyin

#### SQLite (Geliştirme için):
- Production'da önerilmez
- Vercel'de dosya sistemi geçici olduğu için veri kaybı olabilir

### 4. Önemli Notlar

#### API için:
- `requirements-vercel.txt` kullanılıyor
- PostgreSQL desteği eklendi
- CORS ayarları production için güncellendi
- File upload'lar için Vercel'in geçici dosya sistemi kullanılıyor

#### Web için:
- Vite build sistemi kullanılıyor
- API URL'i environment variable ile ayarlanıyor
- SPA routing için gerekli ayarlar yapıldı

### 5. Monitoring ve Debugging

#### Vercel Logs:
```bash
vercel logs
```

#### Environment Variables Kontrolü:
```bash
vercel env ls
```

### 6. Custom Domain

1. Vercel Dashboard'da domain ayarlarına gidin
2. Custom domain ekleyin
3. DNS ayarlarını yapın
4. SSL sertifikası otomatik olarak verilecek

### 7. Performance Optimizasyonu

#### API:
- Database connection pooling
- Caching stratejileri
- CDN kullanımı

#### Web:
- Image optimization
- Code splitting
- Lazy loading

### 8. Troubleshooting

#### Yaygın Sorunlar:
1. **CORS Hatası**: CORS_ORIGINS'te frontend URL'inin olduğundan emin olun
2. **Database Bağlantı Hatası**: DATABASE_URL'in doğru formatta olduğunu kontrol edin
3. **Build Hatası**: requirements-vercel.txt'deki paketlerin uyumlu olduğunu kontrol edin

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

### 9. Production Checklist

- [ ] Environment variables ayarlandı
- [ ] Database bağlantısı test edildi
- [ ] CORS ayarları doğru
- [ ] SSL sertifikası aktif
- [ ] Custom domain ayarlandı (opsiyonel)
- [ ] Monitoring aktif
- [ ] Backup stratejisi hazır
- [ ] Error logging aktif

### 10. Support

Sorun yaşarsanız:
1. Vercel documentation'ı kontrol edin
2. GitHub issues'da arama yapın
3. Vercel support'a başvurun
