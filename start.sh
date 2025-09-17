#!/bin/bash

# Up Hera - Hızlı Başlangıç Script'i

echo "🚀 Up Hera başlatılıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kontrol fonksiyonları
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 bulunamadı. Lütfen kurulum yapın.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 bulundu${NC}"
    fi
}

check_service() {
    if pgrep -x "$1" > /dev/null; then
        echo -e "${GREEN}✅ $1 çalışıyor${NC}"
    else
        echo -e "${YELLOW}⚠️  $1 çalışmıyor${NC}"
    fi
}

# Gerekli komutları kontrol et
echo -e "${BLUE}📋 Gerekli komutlar kontrol ediliyor...${NC}"
check_command "python3"
check_command "node"
check_command "npm"
check_command "redis-cli"

# Servisleri kontrol et
echo -e "${BLUE}🔍 Servisler kontrol ediliyor...${NC}"
check_service "redis-server"
check_service "postgres"

# Environment dosyasını kontrol et
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı. env.example'dan kopyalanıyor...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Lütfen .env dosyasını düzenleyin ve API anahtarlarını ekleyin.${NC}"
fi

# Virtual environment kontrol et
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment bulunamadı. Oluşturuluyor...${NC}"
    python3 -m venv .venv
fi

# Virtual environment'ı aktifleştir
echo -e "${BLUE}🐍 Virtual environment aktifleştiriliyor...${NC}"
source .venv/bin/activate

# Backend bağımlılıklarını kontrol et
if [ ! -d "api/__pycache__" ]; then
    echo -e "${YELLOW}⚠️  Backend bağımlılıkları yükleniyor...${NC}"
    pip install -r api/requirements.txt
fi

# Frontend bağımlılıklarını kontrol et
if [ ! -d "web/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend bağımlılıkları yükleniyor...${NC}"
    cd web
    npm install
    cd ..
fi

echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo -e "${BLUE}🚀 Servisleri başlatmak için aşağıdaki komutları farklı terminal'lerde çalıştırın:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend API):${NC}"
echo "source .venv/bin/activate"
echo "cd api"
echo "uvicorn main:app --reload --port 8000"
echo ""
echo -e "${YELLOW}Terminal 2 (Celery Worker):${NC}"
echo "source .venv/bin/activate"
echo "celery -A workers.main worker -l info"
echo ""
echo -e "${YELLOW}Terminal 3 (Frontend):${NC}"
echo "cd web"
echo "npm run dev"
echo ""
echo -e "${GREEN}🌐 Erişim URL'leri:${NC}"
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo -e "${BLUE}📖 Detaylı kurulum rehberi için SETUP.md dosyasını okuyun.${NC}" 