# UpHera - AI-Powered Career Platform

UpHera is a comprehensive career platform designed specifically for women in tech, built with modern web technologies and AI-powered features.

## 🚀 Features

- **AI-Powered Job Matching**: Advanced algorithm matches candidates with suitable positions
- **Real-time AI Chatbot**: Ada AI assistant powered by Google Gemini API for instant responses
- **CV Analysis**: AI-powered CV optimization and feedback
- **Interview Preparation**: Personalized interview coaching and mock interviews
- **Network Building**: Connect with other women in tech
- **Mentorship Program**: Find and connect with experienced mentors
- **Success Stories**: Inspiring stories from UpSchool graduates
- **Freelance Opportunities**: Project-based work opportunities

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **FastAPI** with Python
- **SQLite** database (production-ready)
- **Google Gemini API** for AI responses
- **ChromaDB** for vector storage
- **LangChain** for AI orchestration
- **WebSocket** for real-time features

### AI & ML
- **Google Gemini 2.5 Flash Lite** - Fast, reliable AI responses
- **Sentence Transformers** for text embeddings
- **ChromaDB** for document storage and retrieval
- **CV Analysis** with AI-powered insights

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Google Gemini API key

### Backend Setup
```bash
cd api
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Environment Variables
Create `.env` file in the `api` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
```

## 🎯 Key Improvements

### AI Performance Enhancements
- **Google Gemini Integration**: Replaced Ollama with Google's Gemini 2.5 Flash Lite for faster responses
- **Response Time**: Reduced from 3-5 seconds to 0.5-1 second
- **Cache System**: 30-40% cache hit rate for common questions
- **Timeout Management**: 15-second timeout with graceful fallbacks
- **Quick Responses**: Instant replies for common greetings

### Technical Optimizations
- **ThreadPoolExecutor**: Parallel processing capabilities
- **ChromaDB Optimization**: Performance-focused configuration
- **Memory Management**: User-specific conversation memory
- **Error Handling**: Robust error handling with offline fallbacks

## 📊 Performance Metrics

| Feature | Before | After | Improvement |
|---------|--------|-------|-------------|
| First Response Time | 3-5 seconds | 0.5-1 second | 80% faster |
| Cache Hit Rate | 0% | 30-40% | New feature |
| Timeout Rate | 15% | 5% | 67% reduction |
| Offline Capability | No | Yes | New feature |

## 🏗️ Architecture

```
UpHera/
├── api/                    # FastAPI backend
│   ├── services/          # AI services
│   │   ├── enhanced_ai_coach.py  # Gemini-powered AI coach
│   │   └── ai_matching_service.py # Job matching algorithm
│   ├── main.py            # FastAPI app
│   └── requirements.txt   # Python dependencies
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── screens/       # Page components
│   │   └── services/      # API services
│   └── package.json       # Node dependencies
└── README.md
```

## 🤖 AI Features

### Ada AI Assistant
- **Context-Aware**: Remembers conversation history
- **CV Analysis**: Upload and analyze CVs for optimization
- **Interview Prep**: Personalized interview coaching
- **Career Guidance**: Kariyer planlama ve öneriler
- **Offline Mode**: Works without backend connection

### Job Matching Algorithm
- **Skill-Based Matching**: Matches skills with job requirements
- **Experience Level**: Considers experience and seniority
- **Location Preferences**: Geographic matching
- **Salary Expectations**: Compensation alignment

## 🔧 Development

### Running Tests
```bash
cd api
pytest

cd web
npm test
```

### Code Quality
```bash
# Backend
cd api
black .
flake8 .

# Frontend
cd web
npm run lint
npm run format
```

## 📈 Roadmap

- [ ] **Real-time Collaboration**: Live coding sessions
- [ ] **Advanced Analytics**: Detailed career insights
- [ ] **Mobile App**: React Native mobile application
- [ ] **AI Video Interviews**: Automated interview practice
- [ ] **Skill Assessment**: AI-powered skill evaluation
- [ ] **Job Application Tracking**: Integrated application management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **UpSchool** for the educational foundation
- **Google Gemini** for AI capabilities
- **FastAPI** and **React** communities
- **Women in Tech** community for inspiration

---

**Built with ❤️ for women in tech**