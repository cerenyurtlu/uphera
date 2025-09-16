# UpHera - Women in Tech Community Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-green)](#roadmap)

UpHera is an AI-first career companion for UpSchool graduates and women in tech, combining community, mentoring, and real job opportunities in a single modern platform.

## Contents
- [Platform Overview](#platform-overview)
- [Key Capabilities](#key-capabilities)
- [Live Demo & Contact](#live-demo--contact)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [AI Feature Deep Dive](#ai-feature-deep-dive)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Platform Overview

A comprehensive, production-ready platform tailored for women in technology, featuring a sisterhood community, mentorship programs, curated job marketplace, and actionable AI guidance.

## Key Capabilities

- **Sisterhood Community** – Intelligent algorithm matching graduates with curated opportunities and peers.
- **Real-time AI Assistant** – Ada AI chatbot powered by Google Gemini for instant, contextual career guidance.
- **CV Analysis & Optimization** – Document upload, smart parsing, and actionable improvement suggestions.
- **Interview Preparation** – Scenario-based coaching, question banks, and mock interview workflows.
- **Professional Networking** – Member directory, warm introductions, and event-driven engagement.
- **Mentorship Program** – Structured mentor matching and progress tracking for long-term growth.
- **Success Stories** – Storytelling hub celebrating outcomes within the community.
- **Freelance Opportunities** – Gig listings, project board, and matching for flexible work arrangements.

## Live Demo & Contact

- **Live preview**: [uphera.vercel.app](https://uphera.vercel.app)
- **Quick Start video**: [UpHera Walkthrough: Your AI Career Companion in Action](https://youtu.be/BEA28R47Dq0)
- **Feedback / contributions / support**: Feel free to email me → [cerennyurtlu@gmail.com](mailto:cerennyurtlu@gmail.com)

## Architecture Overview

```
┌──────────────────┐     ┌──────────────────────────┐
│ React + Vite UI  │◄──►│ FastAPI Application       │
│ (Vercel static)  │    │  (REST + WebSocket)       │
└────────┬─────────┘    ├──────────────┬───────────┤
         │              │              │           │
         │              │              │           │
         ▼              ▼              ▼           ▼
  Vercel Serverless   Google        SQLite     Background
  Functions (`web/`   Gemini API    Persistence Services
  api/*` routes)                   (`DB_PATH`) (jobs, emails)
```

- **Client**: React 18 + TypeScript served on Vercel with edge/serverless API routes dedicated to AI workloads.
- **API Layer**: FastAPI exposes authenticated REST, WebSocket streaming, and document upload capabilities.
- **AI Layer**: Google Generative Language API (Gemini) powers conversational coaching and CV intelligence.
- **Data Layer**: SQLite provides durable storage locally; `DATABASE_URL` unlocks managed databases in production.
- **Mobile Companion**: `UpHeraMobile/` hosts an Expo React Native prototype that consumes the same public APIs.

## Technology Stack

### Frontend
- **React 18 + TypeScript** with Vite tooling
- **Tailwind CSS** design system and utility classes
- **React Router** for client-side navigation
- **TanStack Query** for API data fetching and caching
- **React Hot Toast** and icon libraries for polished UX

### Backend
- **FastAPI** (Python) serving REST + WebSocket endpoints
- **SQLite** as the default datastore (configurable via `DB_PATH`)
- **httpx** powered integrations for third-party AI providers
- **Auth & security** with `python-jose`, `passlib`, and JWT sessions
- **Background services** for email, job matching, and notifications

### AI & Intelligence
- **Google Gemini 1.5 Flash / Pro** via Vercel serverless functions (`web/api/*`)
- **Google Generative Language API** powering chat streaming & CV analysis
- **Mammoth**, **pdf-parse**, and **pdfjs-dist** for CV/document text extraction
- **scikit-learn**, **numpy**, and custom scoring for AI job matching

## Getting Started

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

### Smoke Test
1. Visit `http://localhost:5173` and log in with a demo token or newly created account.
2. Open the Ada AI assistant, send a prompt, and confirm a Gemini-generated response.
3. Navigate to the Jobs area and verify job cards render with live data from the FastAPI backend.

## Environment Configuration
Prepare runtime secrets before launching either service layer. The API loads variables via `pydantic-settings`, while the web client relies on standard Vite `.env` files.

Create `.env` file in the `api` directory:
```env
# Database (defaults to /tmp/uphera.db if not set)
DB_PATH=./uphera.db
# Optional Postgres URL for future deployments
DATABASE_URL=postgresql://username:password@host:port/database

# AI provider
GEMINI_API_KEY=your_gemini_api_key_here

# Security
SECRET_KEY=your_secret_key_here
```

For the frontend, set the API base inside `web/env.local`:
```env
VITE_API_URL=http://localhost:8000
```

## Project Structure

```
UpHera/
├── api/                    # FastAPI backend
│   ├── services/          # AI and business services
│   │   ├── enhanced_ai_service.py  # Google Gemini integration for chat
│   │   └── ai_matching_service.py # Job matching algorithm
│   ├── main.py            # FastAPI application
│   ├── database.py        # SQLite persistence helpers
│   └── requirements.txt   # Python dependencies
├── web/                   # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Page components
│   │   └── services/      # API integration & hooks
│   ├── api/               # Vercel serverless functions (Gemini chat & CV analysis)
│   └── package.json       # Node dependencies
├── UpHeraMobile/          # Expo React Native prototype (shared auth + APIs)
│   └── App.tsx            # Mobile entrypoint (Expo Router)
└── README.md
```

## AI Feature Deep Dive

Gemini-backed intelligence powers both conversational coaching and data-driven talent workflows across the platform.

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

## Development Workflow

Follow the commands below to keep frontend and backend checks aligned with CI expectations.

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

## Roadmap

- [ ] **Real-time Collaboration**: Live coding sessions
- [ ] **Advanced Analytics**: Career insights and trends
- [ ] **Mobile Application**: React Native mobile app
- [ ] **AI Video Interviews**: Automated interview practice
- [ ] **Skill Assessment**: AI-powered skill evaluation
- [ ] **Application Tracking**: Integrated job application management

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **UpSchool** for educational foundation
- **Google Gemini** for AI capabilities
- **FastAPI** and **React** communities
- **Women in Tech** community for inspiration

---

**Built with ❤️ for women in technology**
