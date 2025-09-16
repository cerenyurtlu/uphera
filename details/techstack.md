### Up Hera Tech Stack

Bu döküman, Up Hera platformunun güncel teknoloji yığınını ve mimari bileşenlerini detaylı şekilde özetler.

### Genel Bakış
- **Monorepo**: Backend (FastAPI), Web (React/Vite), ek Next.js chatbot ve Expo tabanlı mobil uygulama
- **Öne çıkan özellikler**: AI koç (Google Gemini), SSE akışı, WebSocket gerçek zamanlılık, CV/doküman analizi, SQL tabanlı oturumlar, CORS ve çoklu ortam desteği

### Backend (FastAPI / Python)
- **Framework**: FastAPI 0.104.x, Uvicorn 0.24.x
- **Dil/Sürüm**: Python 3.8+ (öneri), `api/requirements*.txt` ile bağımlılık yönetimi
- **Uygulama girişi**: `api/main.py`
- **Yapılandırma**: `api/config.py` üzerinden `.env` yüklenir (`dotenv`)

#### API & Streaming
- REST uçları: Kimlik, profil, iş ilanları, başvuru, AI sohbet/analiz, topluluk verileri
- SSE (Server-Sent Events): `/ai-coach/chat/stream` (POST) ve `/ai-coach/chat/stream-get` (GET, iOS/Safari uyumu)
- CORS: Geniş serbestlik; `allow_origin_regex` ve `CORS_ORIGINS` listesi ile yapılandırılır

#### WebSocket (Gerçek Zamanlı)
- Uçlar: `/ws/general/{user_id}`, `/ws/chat/{user_id}`, `/ws/notifications/{user_id}`
- Bağlantı yöneticisi: `api/services/websocket_service.py` içinde `ConnectionManager`
- Özellikler: Oda yönetimi, kullanıcı çevrimiçi/ofline yayını, bildirim/sohbet yayınları, periyodik `ping`

#### Kimlik Doğrulama ve Oturum
- Yaklaşım: JWT kütüphanesi mevcut olsa da fiiliyatta DB tabanlı session token (SQLite tablosu `user_sessions`)
- Header: `Authorization: Bearer <token>`
- Demo desteği: `demo-token*` ile gelen talepler için demo kullanıcı fallback

#### Veri Tabanı
- Varsayılan: SQLite (Vercel uyumu için `DB_PATH=/tmp/uphera.db`)
- Şema: `users`, `jobs`, `applications`, `user_sessions` (indekslerle)
- Erişim: Doğrudan `sqlite3` ile (kodda `SQLAlchemy` kurulu ama aktif kullanılmıyor)
- Şifreleme: SHA-256 (Passlib/bcrypt paketi kurulu olsa da mevcut akış SHA-256 kullanır)

#### Dosya Yükleme ve Depolama
- Döküman/CV yükleme: `multipart/form-data`, `UPLOAD_DIR` (varsayılan `./uploads`)
- Vercel notu: Sunucu dosya sistemi ephemeral; kalıcılık gerektiren senaryolarda harici depolama önerilir

#### AI (Google Gemini, LangChain, Vektör)
- Ana model: Google Gemini 2.5 Flash Lite (`google-generativeai`)
- Servis: `api/services/enhanced_ai_coach.py` üzerinden yanıt üretimi ve akış
- Ek bağımlılıklar: `langchain`, `langchain-google-genai`, `chromadb`, `sentence-transformers`
- Not: Mevcut AI akışı doğrudan Gemini ile çalışır; Chroma/embeddings hazır olsa da temel akış için zorunlu değildir

#### Başlıca Python Bağımlılıkları
- FastAPI, Uvicorn, python-multipart, python-dotenv, pydantic v2, pydantic-settings, httpx, websockets
- google-generativeai, langchain, langchain-google-genai, chromadb, sentence-transformers, numpy, pandas
- python-jose[cryptography] (JWT için), passlib[bcrypt] (halen kullanılmıyor), sqlalchemy (halen aktif kullanılmıyor)
- Vercel varyantında: `psycopg2-binary`, `PyPDF2` ekleri bulunur (opsiyonel)

### Web Frontend (React / Vite / TypeScript)
- **Framework**: React 18, TypeScript 5
- **Toolchain**: Vite 4 (`@vitejs/plugin-react`), HMR
- **UI**: Tailwind CSS 3, `lucide-react`, `react-icons`, `tailwind-merge`
- **Durum/Veri**: `@tanstack/react-query` (hazır), `axios`
- **Yönlendirme**: `react-router-dom`
- **Bildirim**: `react-hot-toast`
- **API İstemcisi**: `web/src/services/api.ts`
  - Base URL fallback: `VITE_API_URL` → `http://127.0.0.1:8000` → `http://localhost:8000`
  - Global `Authorization` header ekleme, tekrar deneme ve zaman aşımı yönetimi
  - SSE olmayan akışta fallback ve mock-dostu bildirim/ayar uçları
- **Dev Proxy**: `vite.config.ts` ile `/api` → `http://localhost:8000`
- **Vercel**: `web/vercel.json` ile Vite build çıktısı (`dist`) serve edilir

### Next.js Chatbot (Ayrık Örnek Uygulama)
- **Framework**: Next.js 14, React 18
- **AI SDK**: `@google/generative-ai`
- Kullanım: Ayrı bir demo/chat örneği olarak repoda bulunur (`nextjs-chatbot/`)

### Mobil (Expo / React Native)
- **Platform**: Expo ~53, React Native 0.79.x, React 19
- **Başlatma**: `expo start` komutları (`android`, `ios`, `web` script’leri)
- Not: Mobil istemci, API/SSE/WS tüketimi için örnek temel iskelet sağlar

### Dağıtım ve Operasyon
- **Vercel (API)**: `api/vercel.json`
  - Entry: `main.py` (@vercel/python)
  - `maxDuration: 60s`, `regions: ["iad1"]`
  - Geniş CORS header’ları
- **Vercel (Web)**: `web/vercel.json`, framework `vite`, çıkış `dist`
- **Docker Compose (dev)**: `docker-compose.yml`
  - Servisler: Postgres (vector eklentili), Redis, API (uvicorn), Worker (celery), Web (Nginx serve)
  - Not: Postgres/Redis/Worker kurulumları opsiyoneldir; mevcut kod SQLite ve dahili WS/SSE ile çalışır
- **Docker Compose (prod)**: `docker-compose.prod.yml`
  - Servisler: API (FastAPI), Web (build edilmiş), Nginx (reverse proxy, SSL terminasyonu)
  - Healthcheck: API `/health`

### Ortam Değişkenleri (Seçki)
- `DATABASE_URL` (vars: `sqlite:///./uphera.db`)
- `OPENAI_API_KEY`, `GEMINI_API_KEY`, `OLLAMA_BASE_URL`
- `SENDGRID_API_KEY`, `FROM_EMAIL`, `SENDGRID_SANDBOX_MODE`
- `REDIS_URL`
- `FRONTEND_URL`, `CORS_ORIGINS`
- `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`
- `API_HOST`, `API_PORT`, `API_DEBUG`
- `UPLOAD_DIR`, `MAX_FILE_SIZE`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Güvenlik
- CORS geniş izinli; prod ortamında kökenlerin daraltılması önerilir
- Oturumlar DB tabanlı token ile; token sızıntılarına karşı HTTPS ve kısa ömürlü token ayarı önerilir
- Parola hash: SHA-256; bcrypt/argon2 gibi güçlü KDF’lere yükseltme önerilir
- Dosya yükleme boyut sınırı: `MAX_FILE_SIZE` (vars: 10MB)

### Test ve Kalite
- Backend testleri: `pytest` (örnekler `api/tests/` ve kökte `test_ai.py`)
- Frontend lint: `eslint` (script: `npm run lint`)
- Format/araçlar: README’de `black`, `flake8` komut örnekleri (yapılandırma dosyaları opsiyonel olabilir)

### Gözlemlenebilirlik ve Loglama
- Loglama: Python `logging` (INFO seviyesi), başlangıç/başarılı/uyarı/hata logları
- Health check: `GET /health` (DB ve servis durumu)

### Bilinen Notlar ve İyileştirme Önerileri
- `api/requirements.txt` içinde `google-generativeai==0.3.2langchain==0.1.0` satırı birleşik görünüyor; ayrı satırlara bölünmesi önerilir
- `passlib[bcrypt]` kurulu olsa da parola hash şu an SHA-256; bcrypt/argon2 geçişi önerilir
- `sqlalchemy` kurulu fakat veri erişimi doğrudan `sqlite3`; ileride ORM’e geçiş planlanıyorsa tablolar/şema uyumu gözden geçirilmeli
- Vercel dosya sistemi ephemeral; kalıcı doküman/CV arşivleri için harici depolama (S3, Supabase Storage vb.) tercih edilmeli
- SSE streaming `AIChatbot` UI akışında varsayılan olarak non-stream’e düşebiliyor; mobil/Safari için `stream-get` endpoint kullanımı mevcut


