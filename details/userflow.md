## USERFLOW.md

### Kapsam
- Web uygulaması (React/TS) ve FastAPI backend üzerinden çalışan Up Hera platformunun uçtan uca kullanıcı akışı.
- Aktörler: UpSchool mezunu (mezun), admin.
- Özellikler: Kayıt/giriş, profil yönetimi, iş ilanları, başvuru/favori, AI sohbet (Ada AI), CV/doküman analizi, gerçek zamanlı (WebSocket) ve bildirimler, ayarlar, topluluk/başarı hikayeleri.

### Teknik Notlar
- Ana backend: `api/main.py`
- Web API istemcisi: `web/src/services/api.ts`
- Sohbet bileşeni: `web/src/components/AIChatbot.tsx`
- Login ekranı: `web/src/screens/LoginScreen.tsx`
- WebSocket servisi: `api/services/websocket_service.py`

---

## Aktörler ve Roller
- Mezun: Platformun temel kullanıcısı. Kayıt olur, giriş yapar, profilini günceller, iş ilanlarına bakar/başvurur/favoriler, AI ile sohbet eder ve CV/doküman analizlerini alır.
- Admin: Yönetim paneline erişir. Backend ilk açılışta varsayılan admin kullanıcıyı oluşturur.

---

## Genel Mimari Akış
- İstemci tarafı base URL fallbacks: `https://up-hera-api.vercel.app` → `http://127.0.0.1:8000` → `http://localhost:8000`
- Oturum: `localStorage` içinde `uphera_user` saklanır; `Authorization: Bearer <token>` header’ı otomatik eklenir.
- Hızlı demo erişimi:
  - Frontend: `LoginScreen` içinde `cerennyurtlu@gmail.com / 123456` veya `admin@gmail.com / 123456` girilirse local demo token yazılır ve yönlendirme yapılır.
  - Backend: Header’daki token `demo-token*` ile başlıyorsa demo kullanıcı fallback’ı devreye girer ve doğrulama sağlanır.

---

## 1) Kayıt Olma (Mezun)
- Ekran: `LoginScreen.tsx` içinde “Hesap Oluştur”.
- Doğrulamalar: Zorunlu alanlar, şifre uzunluğu, şifre tekrar, en az bir beceri.
- İstek:
```json
POST /api/auth/graduate/register
{
  "firstName": "...",
  "lastName": "...",
  "email": "...",
  "password": "...",
  "upschoolProgram": "...",
  "graduationDate": "YYYY",
  "experienceLevel": "entry|junior|mid|senior",
  "location": "",
  "skills": ["React", "TypeScript", ...]
}
```
- Yanıt (başarılı):
```json
{
  "success": true,
  "user": { "id": "...", "name": "Ad Soyad", "email": "...", "program": "..." },
  "token": "....",
  "redirect_url": "/dashboard"
}
```
- Etki: `localStorage.uphera_user` kaydedilir, otomatik giriş ve yönlendirme (`/dashboard` veya `/jobs`).

---

## 2) Giriş Yapma
- Ekran: `LoginScreen.tsx`
- Demo hızlı giriş:
  - Mezun: `cerennyurtlu@gmail.com / 123456` → `token: demo-token-123` → `/dashboard`
  - Admin: `admin@gmail.com / 123456` → `token: demo-token-admin` → `/admin`
- API girişi:
```json
POST /api/auth/login
{ "email": "...", "password": "...", "user_type": "mezun|admin" }
```
- Yanıt (başarılı):
```json
{
  "success": true,
  "user": { "id": "...", "name": "Ad Soyad", "email": "...", "program": "...", "user_type": "mezun|admin" },
  "token": "...",
  "redirect_url": "/admin" | "/dashboard"
}
```
- Etki: `localStorage.uphera_user` set edilir; tüm isteklerde `Authorization` header’ı eklenir.

---

## 3) Oturum ve Profil
- Profil getir:
```
GET /api/auth/profile
Authorization: Bearer <token>
```
- Profil güncelle (kısmi, 422 düşmez; alanlar opsiyonel):
```json
PUT /api/auth/profile
{ "firstName": "...", "lastName": "...", "skills": ["..."], "location": "...", ... }
```
- Etki: Başarılı güncelleme sonrası güncel kullanıcı bilgisi döner ve istemci `localStorage`’ı günceller.

- Çıkış:
  - İstemci tarafında `localStorage.uphera_user` ve `uphera_settings` temizlenir.

---

## 4) İş İlanları ve Başvurular
- Listeleme (filtrelerle):
```
GET /api/jobs?limit&offset&location&job_type&experience_level&remote_only&search
```
- Detay:
```
GET /api/jobs/{job_id}
```
- Başvuru:
```json
POST /api/jobs/{job_id}/apply
{ "cover_letter": "...", "resume_content": "..." }
```
- Favori (toggle):
```
POST /api/jobs/{job_id}/bookmark
```
- Benim başvurularım:
```
GET /api/jobs/my/applications
```
- Benim favorilerim:
```
GET /api/jobs/my/bookmarks
```
- Not: `job_service` yoksa backend mock veri döndürür, UX bozulmaz.

---

## 5) Ada AI (Sohbet, CV/Doküman Analizi, Insights)
### 5.1 Sohbet (Non-Streaming, varsayılan)
- İstek:
```json
POST /ai-coach/chat
{
  "message": "...",
  "context": "general|profile|interview|network",
  "user_data": { ... },                // opsiyonel
  "conversation_history": [{...}],     // opsiyonel
  "response_mode": "auto|short|long",  // opsiyonel
  "max_tokens":  ...                   // opsiyonel
}
```
- Yanıt:
```json
{ "success": true, "response": "....", "suggestions": ["..."] }
```
- Arayüz: `AIChatbot` içinde yanıt + öneriler. “cv analizi” yazarsanız CV insights tetiklenir.

### 5.2 Sohbet (Streaming - SSE)
- POST tabanlı:
  - `POST /ai-coach/chat/stream` → SSE event’leri:
    - content: `data: {"type":"content","content":"..."}`
    - done: `data: {"type":"done","enhanced": true, "suggestions": [...] }`
- GET tabanlı (Safari/iOS/mobil EventSource uyumu):
  - `GET /ai-coach/chat/stream-get?message=...&context=...&response_mode=...&max_tokens=...`
- Not (Frontend): `AIChatbot` içinde şu an varsayılan gönderim non-streaming modda çalışır; streaming seçeneği UI’da görünüyor olsa da gönderim akışında devre dışı.

### 5.3 CV Yükleme ve CV Insights
- CV yükleme:
```
POST /ai-coach/cv/upload?user_id=<id>
Content-Type: multipart/form-data
file: <dosya>
```
- Başarıyla yüklenince sohbet ekranına analiz özeti mesajı düşer.
- CV Insights:
```json
POST /ai-coach/cv/insights
{ "user_id": "..." }
```
- Sohbet içinde detaylı CV analizi metni mesaj olarak eklenir.

### 5.4 Doküman Analizi (Kapsamlı)
- Kimlik gerektirir:
```
POST /ai-coach/document/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
file: <doc/pdf/txt>
```
- Yanıt: Çok bölümlü kapsamlı analiz (özet, içerik analizi, öneriler, beceri analizi, kariyer içgörüleri, eylem planı vb.).

### 5.5 AI Insights (Kapsamlı)
- Kimlik gerektirir:
```
GET /ai-coach/insights
```
- Yanıt: Kullanıcıya özel kapsamlı içgörüler ve öneriler.

### 5.6 Sohbet Geçmişi
- `GET /ai-coach/history?limit=N` şu an boş/uyarı metni döndürür (Vercel kısıtı mesajı).

---

## 6) Gerçek Zamanlı ve Bildirimler
### 6.1 WebSocket Kanalları
- Genel: `ws://.../ws/general/{user_id}`
- Sohbet: `ws://.../ws/chat/{user_id}` → otomatik `general_chat` odasına katılır.
- Bildirimler: `ws://.../ws/notifications/{user_id}` → hoş geldin mesajı gönderilir.

### 6.2 Mesaj Tipleri (client → server)
- `chat_message`: `{ "type": "chat_message", "room_id": "general", "content": "..." }`
- `join_room`: `{ "type": "join_room", "room_id": "general_chat" }`
- `leave_room`: `{ "type": "leave_room", "room_id": "..." }`
- `get_online_users`: `{ "type": "get_online_users" }`
- `pong`: `{ "type": "pong" }`

### 6.3 Server Yayınları (server → client)
- `chat_message`: Odaya yayın.
- `user_status`: Kullanıcı online/offline.
- `notification`: Anlık bildirim.
- `job_update`: İş güncellemeleri.
- Arkaplanda düzenli `ping` ile bağlantı sağlığı izlenir.

### 6.4 REST Bildirimleri (fallback)
- `GET /api/notifications` (varsa backend → yoksa localStorage mock)
- `POST /api/notifications/{id}/read` (başarısızsa bile istemci başarılı sayar)
- İstemci, mock bildirimleri `localStorage.uphera_notifications` altında saklayabilir.

---

## 7) Ayarlar
- `GET /api/settings` ve `PUT /api/settings` istekleri denenir; backend yoksa local fallback kullanılır.
- Varsayılan alanlar (örnek): email/push/job alerts, profile visibility, language, theme, remote work, location preferences vb.
- Yerel saklama: `localStorage.uphera_settings`

---

## 8) Topluluk ve Başarı Hikayeleri
- `GET /api/network/success-stories` hazırdır; örnek başarı hikayeleri döner.

---

## 9) Sağlık Kontrolü/Root
- Root:
```
GET /
```
- Health:
```
GET /health
```
- Bağlantı, servis durumları ve zaman damgası döner.

---

## 10) Admin Akışı
- Giriş: `user_type=admin` ile `/api/auth/login` veya demo hızlı giriş.
- Yönlendirme: `/admin`
- Backend ilk açılışta admin kullanıcıyı oluşturur:
  - Varsayılan: `ADMIN_EMAIL=admin@gmail.com`, `ADMIN_PASSWORD=123456` (env ile değiştirilebilir).

---

## 11) Hata ve Dayanıklılık
- İstemci istekleri:
  - URL fallback (prod → 127.0.0.1 → localhost)
  - Deneme sayısı ve per-istek timeout yönetimi
  - JSON yerine FormData durumunda header’ların uyarlanması
- Backend:
  - Demo token fallback (Authorization `demo-token*`)
  - CORS açık, `allow_origin_regex` geniş.
- Kullanıcı deneyimi:
  - İyi hata mesajları, `toast` bildirimleri
  - Streaming başarısızsa non-streaming’e düşme
  - Backend yoksa bile ayarlar/bildirimler mock veya local fallback ile çalışır.

---

## 12) “Mutlu Yol” (Mezun)
1) Kayıt ol → otomatik giriş ve `/dashboard`
2) Profilini güncelle (isteğe bağlı)
3) İş ilanlarını filtrele → detayını aç → başvuru/favori
4) Ada AI ile sohbet → CV yükle → CV insights al → önerileri uygula
5) Bildirimleri al (WebSocket veya REST fallback)
6) Ayarlarını güncelle
7) Çıkış

---

## 13) Depolama Anahtarları (İstemci)
- `uphera_user`: { id, name, email, program, token, userType, loginAt, ... }
- `uphera_settings`: kullanıcı ayarları (backend yoksa kalıcı yerel kaynak)
- `uphera_notifications`: mock bildirimler (backend yoksa)

---

## 14) Mobil/Safari Uyum Notu
- Streaming için `EventSource` uyumluluğu: `GET /ai-coach/chat/stream-get` kullanılır.
- Mobil/Safari’dede non-streaming fallback devrededir.

---

### Hızlı Uç Nokta Listesi
- Kimlik: `/api/auth/graduate/register`, `/api/auth/login`, `/api/auth/profile`
- AI: `/ai-coach/chat`, `/ai-coach/chat/stream`, `/ai-coach/chat/stream-get`, `/ai-coach/cv/upload`, `/ai-coach/cv/insights`, `/ai-coach/document/upload`, `/ai-coach/insights`, `/ai-coach/history`
- İş: `/api/jobs`, `/api/jobs/{id}`, `/api/jobs/{id}/apply`, `/api/jobs/{id}/bookmark`, `/api/jobs/my/applications`, `/api/jobs/my/bookmarks`
- Topluluk: `/api/network/success-stories`
- WS: `/ws/general/{user_id}`, `/ws/chat/{user_id}`, `/ws/notifications/{user_id}`
- Diğer: `/health`, `/`


