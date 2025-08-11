# UpHera — Userflow

## 👥 Personalar & Giriş Noktaları
- **🎓 Mezun (Alumni)**  
  - Giriş: Slack OAuth / Google OAuth  
  - Erişim: Kişisel Dashboard, Community Feed, Mentorluk özellikleri  
  - Amaç: Kariyer fırsatlarını keşfetmek, network oluşturmak, topluluğa katkı sağlamak

- **🛠 Placement Admin (UpSchool Ekibi)**  
  - Giriş: SSO + 2FA (Yüksek güvenlik)  
  - Erişim: Admin Panel (İlan yönetimi, eşleştirme, moderasyon, raporlama)  
  - Amaç: Mezunları en doğru pozisyonlarla eşleştirmek, topluluğu yönetmek

---

## 🚀 1) Mezun (Alumni) Akışı
### 1. Onboarding
1. Slack veya Google OAuth ile giriş  
2. Kısa form doldurma:  
   - Şehir, çalışma şekli (remote/hybrid/on-site)  
   - Maaş beklentisi, vize/çalışma izni durumu  
   - Tercih edilen sektör ve pozisyonlar  
3. CV yükleme veya LinkedIn/GitHub bağlantısı ile otomatik veri çekme  
4. AI destekli **Skill Tag Önerisi** → Kullanıcı onayı ile profil etiketleri eklenir  
5. Profil Skoru hesaplanır (%).

### 2. Profil Yönetimi
- Projeler, sertifikalar, portfolyo linkleri  
- Profil geliştirme önerileri (AI öneri motoru)  
- **Mentor Ol** seçeneği (isteğe bağlı)

### 3. Eşleşme Süreci
- Bildirim: “X şirketinin ilanı ile %85 eşleşiyorsun”  
- Neden eşleştiğini gösteren açıklama (Match Reasoning)  
- Aksiyonlar: **Başvur / Reddet / Daha Sonra Kaydet**

### 4. Süreç Takibi (ATS-lite)
- Aşamalar: Prospect → Applied → Interview → Offer → Hired / Rejected  
- Her aşama değişiminde e-posta + dashboard bildirimi

### 5. Hazırlık Modülü
- **AI Kariyer Koçu**:  
  - İlanın JD’sine göre teknik/mülakat soruları  
  - CV bullet revizyonları  
  - 30-60-90 gün iş planı  
- Mock interview rezervasyonu

### 6. Topluluk Özellikleri
- **Community Feed**: Etkinlikler, başarı hikâyeleri, iş fırsatları  
- **Mentorluk Modülü**: 1:1 mentorluk randevuları  
- **Network**: Mezun arama (bootcamp, şehir, uzmanlık alanı)

---

## 🏢 2) Placement Admin Akışı
### 1. İlan Yönetimi
- LinkedIn/Lever URL yapıştır veya PDF/metin yükle  
- AI parse → rol, seviye, lokasyon, zorunlu/tercih edilen skill çıkarımı  
- Durumlar: Taslak / Aktif / Durduruldu

### 2. Eşleştirme Motoru
- “Eşleştir” butonu ile 30 sn içinde skorlanmış aday listesi  
- Filtre: Bootcamp, seviye, lokasyon, maaş aralığı, çalışma izni  
- Toplu davet gönderme (şablon e-posta + panel bildirimi)

### 3. Aday Yönetimi
- Aşama değiştirme (drag-drop kanban board)  
- Not ekleme, dosya ekleme, görüşme durumu işaretleme  
- Re-ranker algoritmasına geri besleme

### 4. Community Moderasyonu
- Etkinlik oluşturma, içerik yayını  
- Rapor/flag yönetimi, uygunsuz içerik kaldırma

### 5. Raporlama & Analitik
- Dönüşüm hunisi: İlan → Davet → Görüşme → Teklif → İşe giriş  
- KPI takibi: Median match_score, time-to-invite, acceptance rate  
- CSV / Notion entegrasyonu ile dışa aktarım

---

## 🔄 Durum Makineleri

### Application State
```
Prospect → Applied → Interview → Offer → Hired
                     ↘ Rejected (any step)
```

### Job State
```
Draft → Active → Paused/Closed
```

### Notification Triggers
- Yeni eşleşme  
- Aşama değişikliği  
- Görüşme daveti  
- Teklif / Reddedilme  
- Etkinlik hatırlatıcısı  
- Mentor slot onayı

---

## 🔐 İzinler Matrisi
| Özellik                 | Mezun | Placement Admin |
|------------------------|:----:|:---------------:|
| Kendi profilini düzenle|  ✔   |        ✖        |
| İlan oluştur/durdur    |  ✖   |        ✔        |
| Eşleştirme çalıştır    |  ✖   |        ✔        |
| Aday aşamasını değiştir|  ✖   |        ✔        |
| Etkinlik/duyuru yayınla|  ✖   |        ✔        |
| Community moderasyonu  |  ✖   |        ✔        |

---

## 🖥 Mezun Dashboard Bileşenleri
- **Kariyer Özeti Kartları**: Profil Gücü • Aktif Başvuru • Mülakat • Network  
- **Ana CTA’lar**: Kendine İş Bul • Toplulukta Güçlen • Diğerlerini Destekle  
- **Topluluk Vurguları**: “Bu ay X mezun işe yerleşti” • Başarı hikâyeleri  
- **Etkinlikler**: Tech Talk / Meetup / Freelance fırsatları

---

## 📊 Akış Diyagramları (Mermaid)

### Mezun Onboarding
```mermaid
flowchart LR
A[Slack OAuth] --> B{Profil var mı?}
B -- Hayır --> C[CV yükle / LinkedIn çek]
C --> D[Skill önerileri (AI)]
D --> E[Profil skoru hesapla]
B -- Evet --> E
E --> F[Dashboard]
```

### Admin İlan → Eşleştirme
```mermaid
flowchart LR
J[İlan URL/PDF] --> K[Parse & Normalize]
K --> L[İlanı Aktif Et]
L --> M[Eşleştir (30sn)]
M --> N[Skorlu Liste + Filtreler]
N --> O[Toplu Davet/E-posta]
O --> P[ATS Aşamaları]
P --> Q[Raporlar & Sinyaller]
```
Up Hera – Kullanıcı Akışı

1 · İşveren

Kayıt / Giriş – Magic‑link ile e‑posta doğrulanır.

İlan Yükle – PDF yükler veya LinkedIn URL’si yapıştırır.

Eşleşme Listesi – 30 sn içinde skorlanmış aday tablosu görüntüler.

Aday İncele – Profil modalında GitHub, proje girişi, tanıtım e‑postası taslağı.

Pitch Gönder – "Send" tıklayınca e‑posta HR mailinden çıkar; aktivite log’a düşer.

Geri Bildirim – "Görüştüm / Görüşülmedi" butonları re‑ranker’a sinyal gönderir.

2 · Mezun / Aday

Onboarding – Slack OAuth → Kısa form (lokasyon, maaş beklentisi).

Profil Oluştur – GitHub repo linkleri, proje açıklaması, uzmanlık etiketleri.

Eşleşme Bildirimi – "X şirketi profiline baktı" maili ve panelde durum.

Takip – Görüşme daveti geldiğinde panelde aşama (Interview → Offer → Hire).

3 · UpSchool Placement Ekibi

Genel Dashboard – Aktif ilan, eşleşme sayısı, dönüşüm hunisi.

Dışa Aktar – CSV/Notion raporları.
