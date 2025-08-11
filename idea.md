# UpHera – Problem Tanımı ve Fikir Geliştirme

## 📌 Hangi Problemi Çözüyoruz?
UpSchool mezunları her ne kadar %70 oranında işe yerleşse de süreç hâlâ **Slack duyuruları**, **LinkedIn ilan taraması** ve **manuel e-posta trafiği** ile yürütülüyor.  
Mezun havuzu büyüdükçe, yerleştirme operasyonu UpSchool ekibinin **ölçeklenme darboğazına** dönüşüyor.

**İşverenlerle doğrudan etkileşim yerine**, tüm ilan girişleri, aday eşleşmeleri ve sürecin takibi **Placement Admin** (UpSchool ekibi) tarafından yürütülüyor.  
Bu durum, ilan yönetimi, aday takibi ve topluluk etkileşiminde **zaman kaybı** ve **veri dağınıklığı** yaratıyor.

---

## 👥 Bu Problemi Yaşayan Kullanıcılar

### 🎓 Mezun (Alumni)
- Teknik projeleri, GitHub bağlantıları, sertifikaları hazır.
- Kendisine uygun fırsatlara erişmek için tek bir merkezi platform arıyor.
- Mentorluk, network ve freelance proje fırsatlarını da aynı panelden görmek istiyor.

### 🛠 Placement Admin (UpSchool Ekibi)
- İlan girişlerini, eşleşmeleri, aday takibini manuel yürütmek zorunda.
- Community moderasyonu + işe yerleştirme süreçleri ayrı araçlarda olduğu için veri bütünlüğü bozuluyor.
- Aynı anda hem **topluluk yönetimi** hem **kariyer yerleştirme** süreçlerini idare ediyor.

---

## 🤖 AI Bu Çözümde Nasıl Rol Alıyor?

### **1. Profil & İlan Anlamlandırma — Embeddings**
- Mezun profilleri (GitHub, proje özetleri, sertifikalar) ve iş tanımları **`text-embedding-3-large`** ile çok dilli vektörlere dönüştürülür.
- Projeler, tech stack, uzmanlık alanları otomatik etiketlenir.

### **2. Eşleştirme Motoru**
- **Cosine Similarity** + **kural temelli filtreleme** (zorunlu beceri, lokasyon vb.) ile ilk sıralama.
- **RL fine-tuning (trlX)** ile “İletildi → Görüşme → Teklif” gibi geri bildirimlerden öğrenerek sürekli gelişen **re-ranker**.

### **3. Auto-Pitch Agent**
- **GPT-4o-mini** ile aday–ilan uyumuna göre kişiselleştirilmiş **120 kelimelik tanıtım e-postası** veya “iç aday” notu oluşturulur.
- Placement admin tek tıkla bu metni işverene iletebilir.

### **4. Dashboard İçgörüleri**
- LLM destekli raporlama ile **haftalık yetenek trendleri**, **ilan dönüşüm hunisi**, **profil skorları** görüntülenir.
- Placement admin için otomatik görev hatırlatıcılar.

---

## 📊 Başarı Ölçütleri

**İlk Beta:**
- 10 iş ilanı için **≥ %80 eşleşme tatmini** (placement admin anketi).
- Manuel e-posta hazırlama süresi < 5 dk → **Auto-Pitch** ile < 15 sn.

**İlk 3 Ay:**
- En az **5 başarılı işe yerleşme** vakası UpHera üzerinden.
- Placement ekibi operasyon süresinde **%50 azalma**.

---

## 🌟 Fark Yaratan Noktalar
- **Tek panel**: Community + Kariyer yerleştirme + Mentorluk
- **AI destekli** eşleştirme, öneri ve mülakat hazırlığı
- **Gerçek zamanlı bildirimler** ve profil güçlendirme önerileri
- **Tam UpSchool ekosistem entegrasyonu**