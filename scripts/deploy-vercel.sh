#!/bin/bash

# Up Hera Vercel Deployment Script
echo "🚀 Up Hera Vercel Deployment Başlatılıyor..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI bulunamadı. Lütfen önce yükleyin:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_warning "Vercel'e giriş yapılmamış. Giriş yapın:"
    vercel login
fi

# Function to deploy API
deploy_api() {
    print_status "API deployment başlatılıyor..."
    
    cd api
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        print_error "api/vercel.json dosyası bulunamadı!"
        exit 1
    fi
    
    # Check if requirements-vercel.txt exists
    if [ ! -f "requirements-vercel.txt" ]; then
        print_error "api/requirements-vercel.txt dosyası bulunamadı!"
        exit 1
    fi
    
    # Test import
    print_status "API import testi yapılıyor..."
    if ! python -c "import fastapi" 2>/dev/null; then
        print_warning "Dependencies eksik, local test için yükleniyor..."
        pip install -r requirements.txt
    fi
    
    if ! python -c "import main; print('API import başarılı')" 2>/dev/null; then
        print_error "API import testi başarısız!"
        exit 1
    fi
    
    print_status "API projesi deploy ediliyor..."
    vercel --prod --name up-hera-api
    
    cd ..
}

# Function to deploy Web
deploy_web() {
    print_status "Web deployment başlatılıyor..."
    
    cd web
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        print_error "web/vercel.json dosyası bulunamadı!"
        exit 1
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "web/package.json dosyası bulunamadı!"
        exit 1
    fi
    
    # Install dependencies
    print_status "Web dependencies yükleniyor..."
    npm install
    
    # Build the project
    print_status "Web projesi build ediliyor..."
    npm run build
    
    print_status "Web projesi deploy ediliyor..."
    vercel --prod --name up-hera-web
    
    cd ..
}

# Main deployment logic
main() {
    print_status "Up Hera deployment başlatılıyor..."
    
    # Check if we're in the right directory
    if [ ! -d "api" ] || [ ! -d "web" ]; then
        print_error "Bu script uphera root dizininde çalıştırılmalıdır!"
        exit 1
    fi
    
    # Ask user which components to deploy
    echo "Hangi bileşenleri deploy etmek istiyorsunuz?"
    echo "1) Sadece API"
    echo "2) Sadece Web"
    echo "3) Her ikisi (önce API, sonra Web)"
    read -p "Seçiminiz (1-3): " choice
    
    case $choice in
        1)
            deploy_api
            ;;
        2)
            deploy_web
            ;;
        3)
            print_status "Önce API deploy ediliyor..."
            deploy_api
            print_status "Şimdi Web deploy ediliyor..."
            deploy_web
            ;;
        *)
            print_error "Geçersiz seçim!"
            exit 1
            ;;
    esac
    
    print_status "Deployment tamamlandı! 🎉"
    print_warning "Environment variables'ları Vercel dashboard'da ayarlamayı unutmayın!"
    print_status "API URL: https://up-hera-api.vercel.app"
    print_status "Web URL: https://up-hera-web.vercel.app"
}

# Run main function
main
