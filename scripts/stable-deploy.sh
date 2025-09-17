#!/bin/bash

# UpHera Stable Deployment Script
# Bu script site gidip gelme sorununu çözer

echo "🚀 UpHera Stable Deployment Başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Hata kontrolü
set -e

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Environment Variables Kontrolü
print_status "Environment variables kontrol ediliyor..."

# API için gerekli env vars
API_ENV_VARS=(
    "DATABASE_URL"
    "SECRET_KEY"
    "FRONTEND_URL"
    "API_DEBUG"
)

# Web için gerekli env vars
WEB_ENV_VARS=(
    "VITE_API_URL"
)

print_status "API environment variables:"
for var in "${API_ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ $var: ${!var:0:20}...${NC}"
    else
        echo -e "${RED}❌ $var: EKSIK${NC}"
    fi
done

print_status "Web environment variables:"
for var in "${WEB_ENV_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo -e "${GREEN}✅ $var: ${!var:0:20}...${NC}"
    else
        echo -e "${RED}❌ $var: EKSIK${NC}"
    fi
done

# 2. Build Test
print_status "Build testleri yapılıyor..."

# API build test
print_status "API build testi..."
cd api

# Check if Python dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    print_warning "Python bağımlılıkları eksik, yükleniyor..."
    pip install -r requirements.txt
fi

if python -c "import main; print('✅ API import başarılı')" 2>/dev/null; then
    print_status "API build testi başarılı"
else
    print_error "API build testi başarısız!"
    exit 1
fi
cd ..

# Web build test
print_status "Web build testi..."
cd web

# Check if Node dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "Node dependencies eksik, yükleniyor..."
    npm install
fi

if npm run build 2>/dev/null; then
    print_status "Web build testi başarılı"
else
    print_error "Web build testi başarısız!"
    exit 1
fi
cd ..

# 3. Vercel Deploy
print_status "Vercel deployment başlatılıyor..."

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI bulunamadı. Lütfen 'npm i -g vercel' komutunu çalıştırın."
    exit 1
fi

# Vercel login kontrolü
if ! vercel whoami &> /dev/null; then
    print_warning "Vercel'e giriş yapılmamış. Giriş yapın:"
    vercel login
fi

# API deploy
print_status "API deploy ediliyor..."
cd api
vercel --prod --name up-hera-api --yes
API_URL=$(vercel ls | grep "up-hera-api" | awk '{print $2}')
print_status "API URL: $API_URL"
cd ..

# Web deploy
print_status "Web deploy ediliyor..."
cd web
vercel --prod --name up-hera-web --yes
WEB_URL=$(vercel ls | grep "up-hera-web" | awk '{print $2}')
print_status "Web URL: $WEB_URL"
cd ..

# 4. Health Check
print_status "Health check yapılıyor..."

# API health check
if curl -f "$API_URL/health" 2>/dev/null; then
    print_status "✅ API health check başarılı"
else
    print_warning "⚠️ API health check başarısız"
fi

# Web health check
if curl -f "$WEB_URL" 2>/dev/null; then
    print_status "✅ Web health check başarılı"
else
    print_warning "⚠️ Web health check başarısız"
fi

# 5. Sonuç
print_status "🎉 Stable deployment tamamlandı!"
print_status "API URL: $API_URL"
print_status "Web URL: $WEB_URL"
print_status "API Docs: $API_URL/docs"

print_warning "📝 Önemli notlar:"
echo "- Environment variables'ları Vercel dashboard'da kontrol edin"
echo "- Database bağlantısını test edin"
echo "- CORS ayarlarını kontrol edin"
echo "- SSL sertifikalarının aktif olduğundan emin olun"

print_status "🔧 Sorun giderme:"
echo "- Site gidip geliyorsa: vercel logs --scope up-hera-api"
echo "- Build hataları için: GitHub Actions logs"
echo "- Database sorunları için: Vercel dashboard > Storage"
