### Up Hera – Teknolojide Öncü Kadınlar Topluluğu

Bu doküman, Up Hera’nın güncel ürün fikrini, hedeflerini ve stratejik yol haritasını özetler. 

### Problem
- Teknoloji sektörüne adım atan kadınlar; görünürlük, mentorluk, network ve güven problemleri yaşıyor.
- UpSchool sonrası eğitimden işe geçişte: CV optimizasyonu, mülakat hazırlığı ve doğru ilanla eşleşme süreçleri parçalı ve yorucu.
- Türkçe, yerel pazar gerçeklerine uygun kişiselleştirilmiş rehberlik eksik.

### Çözüm (Up Hera)
- Türkçe konuşan AI koç (Ada AI) ile kişiselleştirilmiş kariyer rehberliği: CV analizi, mülakat hazırlığı, beceri haritası, aksiyon planı.
- Akıllı iş ilanı akışı: filtreleme, başvuru ve favori yönetimi; eşleşme zekasına doğru evrilebilir yapı.
- Topluluk odaklı yaklaşım: başarı hikayeleri, mentorluk ekosistemi, bildirimler ve canlı etkileşim (WebSocket).
- Çoklu kanal deneyimi: Web, deneysel mobil (Expo) ve örnek Next.js chatbot.

### Hedef Kitle ve Personalar
- UpSchool mezunu (Junior) yazılım geliştirici / veri bilimci.
- Kariyer değişimi yapan (cross-skill) aday.
- İşe ara verip geri dönmek isteyen yetenekli profesyonel.
- Admin / işe alım ortağı (şirket temsilcisi, HR partneri).
- Mentor (gönüllü/profesyonel rehber).

### Değer Önermesi
- Türkçe, güvenli ve kapsayıcı bir ortamda hızlandırılmış işe geçiş.
- Yerel piyasa ile uyumlu, uygulanabilir tavsiyeler ve ölçülebilir gelişim planı.
- AI + topluluk sinerjisi: bireysel koçluk ile kolektif deneyimin birleşimi.

### Temel Kullanım Senaryoları (Happy Path)
1) Mezun kayıt/giriş → profilini doldurur/günceller.
2) İş ilanlarını keşfeder; filtreler, detay inceler, favoriler, başvuru yapar.
3) Ada AI ile sohbet: CV yükleme/analiz, mülakat hazırlığı, kariyer planlama.
4) Bildirimler ve gerçek zamanlı akışla yönlendirilir; topluluk içeriklerinden faydalanır.
5) Ayarlarını yönetir; deneyimini kişiselleştirir.

### Kilit Özellikler (Mevcut)
- Ada AI (Google Gemini tabanlı) sohbet: non-stream varsayılan; iOS/Safari için GET-SSE; POST-SSE desteği.
- CV/Doküman analizi: kapsamlı değerlendirme ve aksiyon önerileri.
- AI Insights: kariyer içgörülerinin derin analizi.
- İş ilanları: liste, detay, başvuru, favori ve “benim başvurularım/favorilerim”.
- WebSocket: çevrimiçi durumu, bildirimler ve oda tabanlı sohbet altyapısı.
- Topluluk: başarı hikayeleri (örnek veri ile hazır), ayarlar yerel/uzak uyumlu.
- Demo/Offline deneyim: demo token ve localStorage fallback’leri ile kesintisiz deneme.

### Teknik Farklılaştırıcılar
- Türkçe odaklı AI koç ve yerel piyasa bağlamı.
- SSE + WebSocket hibrit gerçek zamanlılık; mobil/Safari uyumluluk için GET-SSE.
- Geliştirici dostu fallback’ler: URL retry, demo token, mock-dostu endpoints.

### Başarı Metrikleri (KPI)
- Aktivasyon: kayıt → ilk oturum → ilk AI sohbet oranı.
- CV yükleme oranı ve ilk 24 saatte AI oturumu sayısı.
- Aylık aktif kullanıcı başına başvuru sayısı; favori/başvuru dönüşümü.
- AI önerisi → uygulanan aksiyon oranı (ör. profil güncelleme, başvuru yapma).
- İlk iş zamanlaması (time-to-first-job), 30/90 günlük tutundurma, NPS.

### Yol Haritası
- Kısa vadeli (0-2 ay)
  - İş servisinin üretimleşmesi (gerçek kaynaklarla besleme, Postgres geçişi seçeneği).
  - Mentorluk API’leri (mentor listesi, eşleşme, takvim entegrasyonu) ve etkinlik uçları.
  - Bildirimlerin kalıcı depolanması; okundu/kanıtlanabilir durum.
  - Güvenlik: parola hash için bcrypt/argon2, CORS sıkılaştırma, rate limiting.
  - Observability: merkezi log, health metrics, temel analitik.
- Orta vadeli (2-6 ay)
  - Şirket/partner portalı: ilan yönetimi, aday eşleşmeleri, geri bildirim döngüsü.
  - Vektör arama (Chroma/Supabase Vector) ile profil-iş eşleşme önerileri.
  - Gelişmiş kullanıcı arama (skills, seviye, şehir) ve rozet/başarı sistemi.
  - Mobil beta (Expo) ve push bildirimleri.
- Uzun vadeli (6-18 ay)
  - Marketplace (freelance proje eşleşmeleri, mentor marketplace).
  - Maaş ve piyasa içgörüleri (yerel veriye dayalı trendler).
  - AI video mülakat, otomatik skor ve geri bildirim.
  - Ekosistem entegrasyonları (LinkedIn/GitHub/job boards).

### Monetizasyon
- B2B: şirket/partner abonelikleri, ilan paketleri, erişim katmanları.
- B2C: freemium + premium (ileri düzey AI koçluk, birebir seanslar, CV/mülakat paketleri).
- Sponsorluk ve program ortaklıkları (UpSchool/kurumsal sosyal sorumluluk).

### Go-To-Market (GTM)
- UpSchool mezunlarına doğrudan erişim; Alumni elçileri, ders/etkinlik entegrasyonu.
- Yerel teknoloji şirketleri ile pilot/partnerlik; başarı hikayeleri ve referanslar.
- Topluluk etkinlikleri, hackathon/mentorluk günleri, sosyal kanıt.

### Gizlilik, Güven ve Uyum
- KVKK/GDPR prensipleri: açık rıza, minimum veri, amaçla sınırlı kullanım.
- İçerik güvenliği: uygunsuz içerik moderasyonu, bildirim/şikayet akışı.
- Şeffaf AI: uyarı ve bağlamlayıcı metinler; kullanıcı kontrolü ve silme talepleri.

### Riskler ve Azaltım
- AI halüsinasyonları: sıkı istem (prompt) kuralları, küçük ve net yanıt ilkesi, öneri/uyarı metinleri.
- Veri güvenliği: HTTPS, access token ömrü, saklama politikası; güçlü parola hash’e geçiş.
- Tedarikçi bağımlılığı: LLM soyutlama, alternatif sağlayıcılar (ör. farklı Gemini sürümleri) ve taşınabilir entegrasyon katmanı.
- Ölçeklenebilirlik: SSE/WS backpressure, kuyruğa alma (ileride Celery/Redis), izleme.
- İçerik ve veri kıtlığı: partnerlerle ilan akışı; topluluk kaynaklarıyla içerik üretimi.
- Aktivasyon sürtünmesi: demo token akışı ve düşük bariyerli ilk deneyim.

### Teknik Strateji (Özet)
- Stack: FastAPI (Python), React/Vite (TS), WebSocket + SSE; Google Gemini AI; SQLite → Postgres yolu; Vercel dağıtımı + Docker Compose opsiyonları.
- Gelecek: Role tabanlı erişim, kalıcı dosya depolama (S3/Supabase), vektör veritabanı ile öneri motoru.
- Gözlemlenebilirlik: health/metrics/log ve temel ürün analitiği; CI/CD basitleştirmeleri.

### Demo Notları
- Demo giriş: `cerennyurtlu@gmail.com / 123456` veya `admin@gmail.com / 123456` (localStorage demo token).
- Demo token başlıkları `demo-token*` ile doğrulanır (backend fallback).
- Streaming iOS/Safari’de `GET /ai-coach/chat/stream-get` ile; aksi halde non-stream fallback.

### Ölçülebilir Deneyler (Hipotezler)
- H1: CV yükleme sonrası 7 gün içinde yapılan başvuru sayısı +%30 artar.
- H2: Kişiselleştirilmiş mülakat planı alan kullanıcıların 30 günlük tutundurması +%15 artar.
- H3: Başarı hikayesi okuyan kullanıcıların ilk başvuruya dönüşümü +%10 artar.

### Entegrasyon Fırsatları
- LinkedIn (profil ve network), GitHub (projeler), job boards (ilan akışı), takvim (mentorluk randevuları).
- E-posta/SMS bildirimleri (SendGrid vb.), push (mobil/web) bildirim altyapısı.

Kısa özet
- Up Hera; UpSchool mezunları ve teknolojiye adım atan kadınlar için AI destekli, Türkçe ve topluluk merkezli bir kariyer platformu.
- Mevcut temel taşlar: AI koç, CV/insight analizi, iş akışı, gerçek zamanlı bildirim ve demo-dostu deneyim.
- Odak: Üretimleşmeye giden güvenli yol, ölçülebilir etki ve sürdürülebilir büyüme.

