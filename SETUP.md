# 🚀 Up Hera - Local Kurulum Rehberi

Bu rehber, Up Hera projesini local geliştirme ortamınızda nasıl çalıştıracağınızı adım adım açıklar.

## 📋 Önkoşullar

### 1. Python 3.12+ Kurulumu
```bash
# macOS (Homebrew ile)
brew install python@3.12

# Ubuntu/Debian
sudo apt update
sudo apt install python3.12 python3.12-venv python3.12-pip

# Windows
# https://www.python.org/downloads/ adresinden indirin
```

### 2. Node.js 20+ Kurulumu
```bash
# macOS (Homebrew ile)
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# https://nodejs.org/ adresinden indirin
```

### 3. PostgreSQL 15+ Kurulumu
```bash
# macOS (Homebrew ile)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows
# https://www.postgresql.org/download/windows/ adresinden indirin
```

### 4. Redis Kurulumu
```bash
# macOS (Homebrew ile)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Windows
# https://redis.io/download adresinden indirin
```

## 🔧 Kurulum Adımları

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/cerenyurtlu/up-hera.git
cd up-hera
```

### 2. Environment Değişkenlerini Ayarlayın
```bash
cp env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/uphera

# OpenAI (https://platform.openai.com/api-keys adresinden alın)
OPENAI_API_KEY=sk-your-openai-api-key-here

# SendGrid (https://sendgrid.com/ adresinden alın)
SENDGRID_API_KEY=your-sendgrid-api-key-here
FROM_EMAIL=noreply@uphera.ai
SENDGRID_SANDBOX_MODE=true

# Redis
REDIS_URL=redis://localhost:6379/0

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. PostgreSQL Veritabanını Hazırlayın
```bash
# PostgreSQL'e bağlanın
sudo -u postgres psql

# Veritabanı oluşturun
CREATE DATABASE uphera;  
# Not: Veritabanı adı değişmedi (marka dışı), isterseniz ayrıca güncelleyebiliriz.

# pgvector extension'ını etkinleştirin
\c uphera
CREATE EXTENSION IF NOT EXISTS vector;

# Çıkın
\q
```

### 4. Backend Kurulumu
```bash
# Python virtual environment oluşturun
python3.12 -m venv .venv

# Virtual environment'ı aktifleştirin
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

# Bağımlılıkları yükleyin (hızlı/minimal)
pip install -r api/requirements.txt
# Opsiyonel: Yerelde ileri AI (vector DB, embeddings) özellikleri için ağır bağımlılıklar
# pip install -r api/requirements-ai.txt

# Mock veri yükleyin (opsiyonel)
python scripts/mock_data.py --candidates 20 --jobs 10
```

### 5. Frontend Kurulumu
```bash
cd web

# Bağımlılıkları yükleyin
npm install

# TypeScript hatalarını kontrol edin
npm run lint
```

## 🚀 Servisleri Başlatın

### Terminal 1: Backend API
```bash
# Proje ana dizininde
source .venv/bin/activate  # Virtual environment'ı aktifleştirin
cd api
uvicorn main:app --reload --port 8000
```

### Terminal 2: Redis
```bash
# Redis zaten çalışıyor olmalı, kontrol edin:
redis-cli ping
# PONG yanıtı almalısınız
```

### Terminal 3: Celery Worker
```bash
# Proje ana dizininde
source .venv/bin/activate
celery -A workers.main worker -l info
```

### Terminal 4: Frontend
```bash
cd web
npm run dev
```

## 🌐 Erişim URL'leri

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🧪 Test Etme

### 1. Backend API Testi
```bash
# Health check
curl http://localhost:8000/health

# Adayları listele
curl http://localhost:8000/candidates

# İşleri listele
curl http://localhost:8000/jobs
```

### 2. Frontend Testi
1. http://localhost:5173 adresine gidin
2. Login ekranında herhangi bir e-posta/şifre ile giriş yapın
3. Job List ekranında işleri görüntüleyin
4. Dashboard'a gidin ve istatistikleri kontrol edin

## 🔍 Hata Ayıklama

### Yaygın Hatalar ve Çözümleri

#### 1. PostgreSQL Bağlantı Hatası
```bash
# PostgreSQL servisinin çalıştığını kontrol edin
sudo systemctl status postgresql

# Veritabanının var olduğunu kontrol edin
sudo -u postgres psql -l
```

#### 2. Redis Bağlantı Hatası
```bash
# Redis servisinin çalıştığını kontrol edin
redis-cli ping

# Redis'i yeniden başlatın
sudo systemctl restart redis-server
```

#### 3. Python Bağımlılık Hataları
```bash
# Virtual environment'ı yeniden oluşturun
rm -rf .venv
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r api/requirements.txt
# Opsiyonel ağır AI bağımlılıkları (sadece local deneyler için önerilir):
# pip install -r api/requirements-ai.txt
```

#### 4. Node.js Bağımlılık Hataları
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

#### 5. Port Çakışması
```bash
# Hangi portların kullanıldığını kontrol edin
lsof -i :8000
lsof -i :5173
lsof -i :6379

# Gerekirse servisleri durdurun
kill -9 <PID>
```

## 📊 Monitoring

### Backend Logları
```bash
# API loglarını takip edin
tail -f api/logs/app.log

# Celery loglarını takip edin
tail -f celery.log
```

### Frontend Logları
```bash
# Browser Developer Tools'da Console sekmesini kontrol edin
# Network sekmesinde API çağrılarını izleyin
```

## 🚀 Production'a Hazırlık

### Environment Değişkenleri
```bash
# Production için .env dosyasını güncelleyin
SENDGRID_SANDBOX_MODE=false
DATABASE_URL=your-production-database-url
```

### Build
```bash
# Frontend build
cd web
npm run build

# Backend için gerekli dosyalar hazır
```

## 📞 Destek

Sorun yaşarsanız:
1. Logları kontrol edin
2. Environment değişkenlerini doğrulayın
3. Servislerin çalıştığını kontrol edin
4. GitHub Issues'da sorun bildirin

---

**Not**: Bu rehber macOS/Linux için yazılmıştır. Windows kullanıcıları için bazı komutlar farklı olabilir. 
