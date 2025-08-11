#!/bin/bash

# UpHera Rebranding Verification Script
# Bu script repository'de kalan "hireher" referanslarını kontrol eder

echo "🔍 UpHera Rebranding Verification"
echo "================================="

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Aranacak eski terimler
OLD_TERMS=(
  "HireHerAI"
  "Hire Her AI"
  "hire-her-ai"
  "hire_her_ai"
  "hireher-ai"
  "hireherai"
  "hireher"
  "hire-her"
)

# Kontrol edilecek dosya türleri
EXTENSIONS=(
  "*.tsx"
  "*.ts" 
  "*.js"
  "*.json"
  "*.md"
  "*.py"
  "*.sh"
  "*.yml"
  "*.yaml"
  "*.html"
  "*.css"
  "*.svg"
)

# Hariç tutulacak klasörler
EXCLUDE_DIRS=(
  "node_modules"
  ".git"
  "dist"
  "build"
  "__pycache__"
  ".venv"
  "*.db-*"
)

# Geçici sonuç dosyası
TEMP_FILE="/tmp/uphera_rebrand_check.tmp"
> "$TEMP_FILE"

echo -e "${BLUE}📝 Aranacak eski terimler:${NC}"
for term in "${OLD_TERMS[@]}"; do
  echo "  - $term"
done
echo ""

echo -e "${BLUE}🔍 Tarama başlıyor...${NC}"

# Ana tarama
FOUND_COUNT=0

for term in "${OLD_TERMS[@]}"; do
  echo -e "  ${YELLOW}Aranan: ${term}${NC}"
  
  # find komutu ile dosyaları bul ve grep ile ara
  FIND_CMD="find . -type f \( "
  
  # Dosya uzantılarını ekle
  for i in "${!EXTENSIONS[@]}"; do
    if [ $i -eq 0 ]; then
      FIND_CMD+=" -name \"${EXTENSIONS[$i]}\""
    else
      FIND_CMD+=" -o -name \"${EXTENSIONS[$i]}\""
    fi
  done
  
  FIND_CMD+=" \)"
  
  # Hariç tutulacak klasörleri ekle
  for exclude in "${EXCLUDE_DIRS[@]}"; do
    FIND_CMD+=" -not -path \"./*${exclude}/*\""
  done
  
  # grep ile ara (case-insensitive) - verification script'ini hariç tut
  RESULTS=$(eval "$FIND_CMD" | grep -v "verify_rebrand.sh" | xargs grep -l -i "$term" 2>/dev/null || true)
  
  if [ ! -z "$RESULTS" ]; then
    echo -e "    ${RED}❌ Bulundu:${NC}"
    echo "$RESULTS" | while read -r file; do
      if [ ! -z "$file" ]; then
        echo "      📄 $file"
        echo "$file: $term" >> "$TEMP_FILE"
        ((FOUND_COUNT++))
      fi
    done
  else
    echo -e "    ${GREEN}✅ Temiz${NC}"
  fi
done

echo ""
echo -e "${BLUE}📊 Özet Rapor${NC}"
echo "=============="

if [ -s "$TEMP_FILE" ]; then
  TOTAL_FILES=$(cat "$TEMP_FILE" | cut -d':' -f1 | sort -u | wc -l)
  echo -e "${RED}❌ Rebranding tamamlanmadı!${NC}"
  echo -e "📊 ${TOTAL_FILES} dosyada eski referanslar bulundu:"
  echo ""
  
  cat "$TEMP_FILE" | sort | while read -r line; do
    echo "  🔸 $line"
  done
  
  echo ""
  echo -e "${YELLOW}💡 Öneriler:${NC}"
  echo "  1. Listelenen dosyaları kontrol edin"
  echo "  2. Manuel olarak güncelleyin"
  echo "  3. Bu scripti tekrar çalıştırın"
  
  exit 1
else
  echo -e "${GREEN}✅ Rebranding başarıyla tamamlandı!${NC}"
  echo "🎉 Repository'de eski referans kalmadı"
  
  # Brand assets kontrolü
  echo ""
  echo -e "${BLUE}🎨 Brand Assets Kontrolü${NC}"
  
  BRAND_FILES=(
    "web/public/brand/uphera-logo.svg"
    "web/public/brand/uphera-symbol-512.png"
    "web/public/brand/favicon.ico"
  )
  
  ALL_ASSETS_OK=true
  for asset in "${BRAND_FILES[@]}"; do
    if [ -f "$asset" ]; then
      echo -e "  ${GREEN}✅ $asset${NC}"
    else
      echo -e "  ${RED}❌ $asset (eksik)${NC}"
      ALL_ASSETS_OK=false
    fi
  done
  
  if [ "$ALL_ASSETS_OK" = true ]; then
    echo -e "${GREEN}✅ Tüm brand assets mevcut${NC}"
  else
    echo -e "${YELLOW}⚠️ Bazı brand assets eksik${NC}"
  fi
  
  echo ""
  echo -e "${GREEN}🚀 UpHera rebranding tamamlandı!${NC}"
  
  exit 0
fi

# Geçici dosyayı temizle
rm -f "$TEMP_FILE"