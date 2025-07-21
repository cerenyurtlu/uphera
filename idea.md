HireHer AI – Problem Tanımı ve Fikir Geliştirme

Hangi problemi çözüyorsunuz?

UpSchool mezunları %70 oranında işe yerleşse de bu süreç hâlâ Slack duyuruları, LinkedIn ilan taraması ve e‑posta trafiğiyle yarı‑manuel yürütülüyor. Mezun havuzu büyüdükçe yerleştirme operasyonu UpSchool ekibinin en dar boğazı hâline geliyor; işveren tarafı ise "junior ama proje görmüş kadın mühendis" bulmakta zorlanıyor. Zaman kaybı, fırsat kaçırma ve operasyonel yorgunluk hem öğrencilerin motivasyonunu hem de UpSchool’un etki metriğini düşürüyor.

Bu problemi yaşayan kullanıcı kim?

Aday (Mezun / Son sınıf katılımcı): Teknik projeleri ve GitHub bağlantıları hazır; ilan kalabalığı arasında kendine uygun pozisyonu bulmakta zorlanıyor.

İşveren (HR & Hiring Manager): Çeşitliliği artırmak isteyen teknoloji şirketi; hızla filtrelenmiş, nitelikli aday listesi görmek istiyor.

UpSchool Placement Ekibi: Eşleşmeleri manuel yönetmekten kaynaklı zaman kısıtlaması ve ölçeklenme problemi yaşıyor.

AI bu çözümde nasıl bir rol üstleniyor?

Profil & JD Anlamlandırma — Embeddings:

Mezun profilleri (GitHub, proje özetleri) ve iş tanımları "text‑embedding‑3‑large" modeliyle çok‑dilli vektörlere dönüştürülür.

Eşleştirme Motoru:

Cosine benzerliği + kural temelli filtre (must‑have skill, lokasyon) ile ilk sıralama.

RL fine‑tune (trlX) ile "görüldü → görüşme → teklif" geri bildirimi kullanarak skoru sürekli iyileştiren re‑ranker.

Auto‑Pitch Agent:

GPT‑4o‑mini, aday–ilan kesişim noktalarını vurgulayan 120 kelimelik tanıtım e‑postası üretir.

Dashboard İçgörüleri:

LLM, eşleşme sonuçlarından haftalık "talep edilen yetenek trendi" raporu üretir.

Başarı Ölçütleri

İlk beta – 10 iş ilanı için ≥ %80 "eşleşme tatmini" (HR anketi)

Manual e-posta < 5 dk, Auto‑Pitch ile < 15 sn.

İlk 3 ayda en az 5 "HireHer AI üzerinden işe alım" vakası.