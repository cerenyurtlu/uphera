#!/bin/bash

# Basit doğrulama scripti: rebrand artıklarında arama

ROOT_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
cd "$ROOT_DIR" || exit 1

echo "🔎 Rebrand doğrulaması çalışıyor..."

PATTERNS=(
  "HireHerAI"
  "Hire Her AI"
  "hire-her-ai"
  "hire_her_ai"
  "hireher-ai"
  "hireherai"
)

FAIL=0
for p in "${PATTERNS[@]}"; do
  if command -v rg >/dev/null 2>&1; then
    SEARCH_CMD="rg -n --hidden --glob !**/node_modules/** --glob !**/.venv/** --glob !**/*.lock --glob !**/package-lock.json --glob !**/yarn.lock --glob !**/pnpm-lock.yaml"
  else
    SEARCH_CMD="grep -RIn --exclude-dir=node_modules --exclude-dir=.venv --exclude=package-lock.json --exclude=yarn.lock --exclude=pnpm-lock.yaml"
  fi

  if eval $SEARCH_CMD "$p" >/dev/null 2>&1; then
    echo "❌ Kalan kalıntı bulundu: $p"
    eval $SEARCH_CMD "$p" | head -n 20
    FAIL=1
  else
    echo "✅ Temiz: $p"
  fi
done

if [ $FAIL -eq 0 ]; then
  echo "🎉 Rebrand kalıntısı bulunmadı."
  exit 0
else
  echo "⚠️  Yukarıdaki kalıntıları temizleyin."
  exit 2
fi

