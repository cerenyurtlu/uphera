#!/usr/bin/env python3
"""
Demo JSON verilerini veritabanına yükle
Up Hera: Kadınlara yönelik AI destekli iş eşleştirme platformu
"""

import json
import sys
import os
import uuid
import sqlite3

# Parent directory'yi path'e ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import get_db_connection, _db_lock

def load_demo_data():
    """Demo JSON verilerini veritabanına yükle"""
    print("🚀 Demo veriler yükleniyor...")
    
    with _db_lock:
        conn, cursor = get_db_connection()
        
        try:
            # Önce gerekli tabloları oluştur
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS candidates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    github_url TEXT,
                    location TEXT,
                    salary_expectation INTEGER,
                    skills TEXT, -- JSON string
                    projects TEXT, -- JSON string
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS demo_jobs (
                    id TEXT PRIMARY KEY,
                    company TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    location TEXT,
                    salary_range TEXT,
                    required_skills TEXT, -- JSON string
                    hr_email TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Mevcut verileri temizle
            print("🧹 Mevcut veriler temizleniyor...")
            cursor.execute("DELETE FROM candidates")
            cursor.execute("DELETE FROM demo_jobs")
            
            # Candidates yükle
            print("👩‍💻 Adaylar yükleniyor...")
            with open("data/demo_candidates.json", "r", encoding="utf-8") as f:
                candidates_data = json.load(f)
            
            for candidate_data in candidates_data:
                cursor.execute('''
                    INSERT INTO candidates (id, name, email, github_url, location, salary_expectation, skills, projects)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    str(uuid.uuid4()),
                    candidate_data["name"],
                    candidate_data["email"],
                    candidate_data.get("github_url"),
                    candidate_data.get("location"),
                    candidate_data.get("salary_expectation"),
                    json.dumps(candidate_data.get("skills", [])),
                    json.dumps(candidate_data.get("projects", []))
                ))
            
            print(f"✅ {len(candidates_data)} aday yüklendi")
            
            # Jobs yükle
            print("💼 İş ilanları yükleniyor...")
            with open("data/demo_jobs.json", "r", encoding="utf-8") as f:
                jobs_data = json.load(f)
            
            for job_data in jobs_data:
                cursor.execute('''
                    INSERT INTO demo_jobs (id, company, title, description, location, salary_range, required_skills, hr_email)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    str(uuid.uuid4()),
                    job_data["company"],
                    job_data["title"],
                    job_data.get("description"),
                    job_data.get("location"),
                    job_data.get("salary_range"),
                    json.dumps(job_data.get("required_skills", [])),
                    job_data["hr_email"]
                ))
            
            print(f"✅ {len(jobs_data)} iş ilanı yüklendi")
            
            # Commit all changes
            conn.commit()
            
            print("\n🎉 Tüm demo veriler başarıyla yüklendi!")
            print(f"   👩‍💻 {len(candidates_data)} kadın aday")
            print(f"   💼 {len(jobs_data)} iş ilanı")
            print("\n📊 Sektör Dağılımı:")
            
            # İş ilanlarının sektör dağılımını göster
            sectors = {}
            for job in jobs_data:
                # İlk kelimeyi sektör olarak kabul et
                sector = job['title'].split()[0] if job['title'] else 'Diğer'
                if sector in ['Frontend', 'Backend', 'Full', 'React', 'Angular', 'Vue', 'Python', 'Java', '.NET', 'Flutter', 'Unity']:
                    sector = 'Teknoloji'
                elif sector in ['Sağlık', 'Tıbbi', 'Biyoinformatik', 'Telemedicine']:
                    sector = 'Sağlık'
                elif sector in ['E-Öğrenme', 'Eğitim', 'Öğrenci', 'Dil']:
                    sector = 'Eğitim'
                elif sector in ['Bankacılık', 'Sigorta', 'Kredi', 'Ödeme', 'Fintech']:
                    sector = 'Finans'
                elif sector in ['Dijital', 'Sosyal', 'İçerik', 'E-ticaret']:
                    sector = 'Pazarlama'
                elif sector in ['Lojistik', 'Filo', 'Depo']:
                    sector = 'Lojistik'
                elif sector in ['Enerji', 'Çevre', 'Güneş']:
                    sector = 'Enerji & Çevre'
                elif sector in ['Tarım', 'Gıda', 'Dikey']:
                    sector = 'Tarım & Gıda'
                elif sector in ['Otel', 'Seyahat', 'Turizm']:
                    sector = 'Turizm'
                elif sector in ['Video', 'Haber', 'Podcast']:
                    sector = 'Medya'
                elif sector in ['Endüstri', 'Kalite', 'Üretim']:
                    sector = 'İmalat'
                
                sectors[sector] = sectors.get(sector, 0) + 1
            
            for sector, count in sorted(sectors.items()):
                print(f"   {sector}: {count} pozisyon")
            
            print("\n🔗 Şimdi API'yi test edebilirsiniz:")
            print("   Backend: cd api && python main.py")
            print("   Frontend: cd web && npm run dev")
            
        except Exception as e:
            print(f"❌ Hata: {e}")
            conn.rollback()
            return False
        finally:
            conn.close()
    
    return True

if __name__ == "__main__":
    # Data klasörü kontrolü
    if not os.path.exists("data/demo_candidates.json"):
        print("❌ demo_candidates.json bulunamadı. Önce demo_data.py çalıştırın.")
        sys.exit(1)
    
    if not os.path.exists("data/demo_jobs.json"):
        print("❌ demo_jobs.json bulunamadı. Önce demo_data.py çalıştırın.")
        sys.exit(1)
    
    # Demo veri yükle
    load_demo_data()
