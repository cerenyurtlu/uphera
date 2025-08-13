# UpHera - Women in Tech Community Platform

A comprehensive career platform designed specifically for women in technology, featuring AI-powered job matching, mentorship programs, and professional networking.

## ✨ Key Features

- **AI-Powered Job Matching**: Intelligent algorithm matching candidates with suitable positions
- **Real-time AI Assistant**: Ada AI chatbot powered by Google Gemini for instant career guidance
- **CV Analysis & Optimization**: AI-driven CV review and improvement suggestions
- **Interview Preparation**: Personalized coaching and mock interview sessions
- **Professional Networking**: Connect with women in tech community
- **Mentorship Program**: Find and connect with experienced mentors
- **Success Stories**: Inspiring career journeys from community members
- **Freelance Opportunities**: Project-based work and gig economy integration

## 🌐 Live Demo & Contact

- **Live preview**: [uphera.vercel.app](https://uphera.vercel.app)
- **Feedback / contributions / support**: Feel free to email me → [cerennyurtlu@gmail.com](mailto:cerennyurtlu@gmail.com)

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern styling
- **React Router** for navigation
- **React Hot Toast** for user notifications

### Backend
- **FastAPI** with Python
- **SQLite** database (production-ready)
- **Google Gemini API** for AI capabilities
- **ChromaDB** for vector storage and retrieval
- **LangChain** for AI orchestration
- **WebSocket** for real-time communication

### AI & Machine Learning
- **Google Gemini 2.5 Flash Lite** for fast, reliable AI responses
- **Sentence Transformers** for text embeddings
- **ChromaDB** for document storage and semantic search
- **AI-powered CV analysis** with actionable insights

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

### Environment Configuration
Create `.env` file in the `api` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here
```

## 🏗️ Project Structure

```
UpHera/
├── api/                    # FastAPI backend
│   ├── services/          # AI and business services
│   │   ├── enhanced_ai_coach.py  # AI career coach
│   │   └── ai_matching_service.py # Job matching algorithm
│   ├── main.py            # FastAPI application
│   └── requirements.txt   # Python dependencies
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Page components
│   │   └── services/      # API integration
│   └── package.json       # Node dependencies
└── README.md
```

## 🤖 AI Features

### Ada AI Assistant
- **Context-Aware Conversations**: Maintains conversation history
- **CV Analysis**: Upload and analyze CVs for optimization
- **Interview Coaching**: Personalized interview preparation
- **Career Guidance**: Professional development advice
- **Offline Capability**: Works without backend connection

### Smart Job Matching
- **Skill-Based Matching**: Aligns skills with job requirements
- **Experience Level**: Considers seniority and expertise
- **Location Preferences**: Geographic matching
- **Salary Alignment**: Compensation expectation matching

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd api
pytest

# Frontend tests
cd web
npm test
```

### Code Quality
```bash
# Backend formatting
cd api
black .
flake8 .

# Frontend linting
cd web
npm run lint
npm run format
```

## 📈 Roadmap

- [ ] **Real-time Collaboration**: Live coding sessions
- [ ] **Advanced Analytics**: Career insights and trends
- [ ] **Mobile Application**: React Native mobile app
- [ ] **AI Video Interviews**: Automated interview practice
- [ ] **Skill Assessment**: AI-powered skill evaluation
- [ ] **Application Tracking**: Integrated job application management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UpSchool** for educational foundation
- **Google Gemini** for AI capabilities
- **FastAPI** and **React** communities
- **Women in Tech** community for inspiration

---

**Built with ❤️ for women in technology**