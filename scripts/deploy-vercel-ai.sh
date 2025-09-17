#!/bin/bash

# UpHera AI-Enhanced Vercel Deployment Script
# Bu script AI servisleri ile birlikte Vercel'de deploy alır

echo "🚀 UpHera AI-Enhanced Vercel Deployment Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hata kontrolü
set -e

echo -e "${BLUE}📋 Gerekli kontroller yapılıyor...${NC}"

# Vercel CLI kontrolü
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI bulunamadı. Lütfen 'npm i -g vercel' komutunu çalıştırın.${NC}"
    exit 1
fi

# Python kontrolü
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 bulunamadı.${NC}"
    exit 1
fi

# API dizinine geç
cd api

echo -e "${BLUE}🔧 Python bağımlılıkları yükleniyor...${NC}"

# Virtual environment oluştur (eğer yoksa)
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}📦 Virtual environment oluşturuluyor...${NC}"
    python3 -m venv venv
fi

# Virtual environment aktifleştir
source venv/bin/activate

# Bağımlılıkları yükle
echo -e "${YELLOW}📦 AI bağımlılıkları yükleniyor...${NC}"
pip install -r requirements.txt

echo -e "${GREEN}✅ Bağımlılıklar yüklendi${NC}"

# Environment variables kontrolü
echo -e "${BLUE}🔐 Environment variables kontrol ediliyor...${NC}"

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı. env.example'dan kopyalanıyor...${NC}"
    cp env.example .env
    echo -e "${RED}❌ Lütfen .env dosyasını düzenleyip GEMINI_API_KEY ekleyin!${NC}"
    echo -e "${YELLOW}📝 Örnek .env içeriği:${NC}"
    echo "GEMINI_API_KEY=your_gemini_api_key_here"
    echo "SECRET_KEY=your_secret_key_here"
    echo "FRONTEND_URL=https://your-frontend-url.vercel.app"
    exit 1
fi

# GEMINI_API_KEY kontrolü
if ! grep -q "GEMINI_API_KEY" .env; then
    echo -e "${RED}❌ GEMINI_API_KEY .env dosyasında bulunamadı!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables hazır${NC}"

# Test çalıştır
echo -e "${BLUE}🧪 AI servisleri test ediliyor...${NC}"

# Basit test
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    print('❌ GEMINI_API_KEY bulunamadı')
    exit(1)
print('✅ GEMINI_API_KEY mevcut')
"

echo -e "${GREEN}✅ Test başarılı${NC}"

# Vercel deploy
echo -e "${BLUE}🚀 Vercel'de deploy alınıyor...${NC}"

# Production deploy
echo -e "${YELLOW}📤 Production'a deploy ediliyor...${NC}"
vercel --prod --name up-hera-ai-enhanced

echo -e "${GREEN}🎉 Deploy tamamlandı!${NC}"

# Deploy URL'ini al
DEPLOY_URL=$(vercel ls | grep "up-hera-ai-enhanced" | awk '{print $2}')

echo -e "${GREEN}🌐 Deploy URL: ${DEPLOY_URL}${NC}"
echo -e "${BLUE}📊 API Docs: ${DEPLOY_URL}/docs${NC}"
echo -e "${BLUE}🔍 ReDoc: ${DEPLOY_URL}/redoc${NC}"

# Frontend için environment variable güncelleme talimatları
echo -e "${YELLOW}📝 Frontend için yapılacaklar:${NC}"
echo -e "${BLUE}1. Frontend .env dosyasında VITE_API_URL'i güncelleyin:${NC}"
echo "VITE_API_URL=${DEPLOY_URL}"

echo -e "${BLUE}2. Frontend'i deploy edin:${NC}"
echo "cd ../web"
echo "vercel --prod --name up-hera-web"

echo -e "${GREEN}✅ AI-Enhanced deployment tamamlandı!${NC}"
echo -e "${BLUE}🎯 AI servisleri maksimum token kullanımı için optimize edildi${NC}"
echo -e "${BLUE}🚀 Streaming, document analysis ve insights aktif${NC}"

# Kullanım istatistikleri
echo -e "${YELLOW}📊 Beklenen Token Kullanımı:${NC}"
echo "- Chat: ~2000-5000 tokens/request"
echo "- Document Analysis: ~3000-8000 tokens/request" 
echo "- Insights: ~4000-10000 tokens/request"
echo "- Streaming: ~1000-3000 tokens/request"

echo -e "${GREEN}🎉 UpHera AI-Enhanced başarıyla deploy edildi!${NC}"
