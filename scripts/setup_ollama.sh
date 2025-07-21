#!/bin/bash

echo "🚀 HireHer AI - Ollama Setup Script"
echo "===================================="
echo ""

# macOS için Ollama kurulumu
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📱 macOS detected. Installing Ollama..."
    
    # Homebrew ile kurulum
    if command -v brew >/dev/null 2>&1; then
        echo "🍺 Installing Ollama via Homebrew..."
        brew install ollama
    else
        echo "📥 Downloading Ollama installer..."
        curl -fsSL https://ollama.ai/install.sh | sh
    fi
    
    # Ollama service başlat
    echo "🔄 Starting Ollama service..."
    brew services start ollama
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected. Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    
    # Systemd service başlat
    echo "🔄 Starting Ollama service..."
    sudo systemctl start ollama
    sudo systemctl enable ollama
    
else
    echo "💻 For Windows, please visit: https://ollama.ai/download"
    echo "   Download and install Ollama for Windows"
    exit 1
fi

echo ""
echo "⏳ Waiting for Ollama to start..."
sleep 5

# Ollama'nın çalışıp çalışmadığını kontrol et
if curl -s http://localhost:11434/api/version >/dev/null; then
    echo "✅ Ollama is running!"
else
    echo "❌ Ollama is not running. Please start it manually:"
    echo "   macOS: brew services start ollama"
    echo "   Linux: sudo systemctl start ollama"
    exit 1
fi

echo ""
echo "📦 Installing Ada AI model (llama3.2:3b)..."
echo "   This may take a few minutes..."

# Model indir
ollama pull llama3.2:3b

if [ $? -eq 0 ]; then
    echo "✅ Model downloaded successfully!"
else
    echo "❌ Model download failed. Trying alternative..."
    ollama pull llama3.1:8b
fi

echo ""
echo "🧪 Testing Ada AI..."
echo "   Sending test message..."

# Test mesajı gönder
response=$(ollama run llama3.2:3b "Merhaba! Ben UpSchool mezunu bir Frontend Developer'ım. Kısa bir motivasyon mesajı verebilir misin?" --timeout 30s)

if [ $? -eq 0 ]; then
    echo "✅ Ada AI is working!"
    echo "🗨️  Test response:"
    echo "   $response"
else
    echo "❌ Ada AI test failed. Please check the installation."
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Start the backend: cd api && python -m uvicorn main:app --reload"
echo "   2. Start the frontend: cd web && npm run dev"
echo "   3. Chat with Ada AI in the application!"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Check Ollama status: ollama list"
echo "   • Restart Ollama: brew services restart ollama (macOS)"
echo "   • View logs: journalctl -u ollama (Linux)"
echo "" 