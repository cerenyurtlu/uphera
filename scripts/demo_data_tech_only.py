#!/usr/bin/env python3
"""
Sadece Teknoloji Pozisyonları Demo Veri Script'i
Up Hera: Kadınlara yönelik AI destekli iş eşleştirme platformu
"""

import json
import random
from datetime import datetime

# Demo veriler - Sadece kadın adaylar (UpHera kadınlara yönelik platform)
DEMO_CANDIDATES = [
    {
        "name": "Ayşe Yılmaz",
        "email": "ayse.yilmaz@email.com",
        "github_url": "https://github.com/ayseyilmaz",
        "location": "İstanbul",
        "salary_expectation": 35000,
        "skills": ["React", "JavaScript", "TypeScript", "CSS", "HTML"],
        "projects": [
            {"name": "E-ticaret Sitesi", "description": "React ve Node.js ile geliştirilmiş modern e-ticaret platformu", "technologies": ["React", "Node.js", "MongoDB"]},
            {"name": "Task Yönetimi", "description": "Takım çalışması için task yönetim uygulaması", "technologies": ["Vue.js", "Firebase"]}
        ]
    },
    {
        "name": "Zeynep Demir",
        "email": "zeynep.demir@email.com",
        "github_url": "https://github.com/zeynepdemir",
        "location": "İzmir",
        "salary_expectation": 38000,
        "skills": ["React Native", "JavaScript", "Swift", "Kotlin", "Firebase"],
        "projects": [
            {"name": "Mobil Bankacılık", "description": "React Native ile mobil bankacılık uygulaması", "technologies": ["React Native", "Redux", "Firebase"]},
            {"name": "Fitness Tracker", "description": "Kişisel fitness takip uygulaması", "technologies": ["Swift", "CoreData", "HealthKit"]}
        ]
    },
    {
        "name": "Elif Şahin",
        "email": "elif.sahin@email.com",
        "github_url": "https://github.com/elifsahin",
        "location": "Bursa",
        "salary_expectation": 32000,
        "skills": ["Angular", "TypeScript", "RxJS", "NgRx", "SCSS"],
        "projects": [
            {"name": "Proje Yönetimi", "description": "Angular ile enterprise proje yönetim sistemi", "technologies": ["Angular", "TypeScript", "NgRx"]},
            {"name": "Dashboard Analytics", "description": "İş zekası dashboard uygulaması", "technologies": ["Angular", "D3.js", "Chart.js"]}
        ]
    },
    {
        "name": "Seda Kaya",
        "email": "seda.kaya@email.com",
        "github_url": "https://github.com/sedakaya",
        "location": "Ankara",
        "salary_expectation": 42000,
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Docker"],
        "projects": [
            {"name": "API Gateway", "description": "Mikroservis mimarisi için API gateway", "technologies": ["Python", "FastAPI", "Redis"]},
            {"name": "Veri Analiz Platformu", "description": "Büyük veri analizi için Django platformu", "technologies": ["Django", "Pandas", "PostgreSQL"]}
        ]
    },
    {
        "name": "Cansu Özkan",
        "email": "cansu.ozkan@email.com",
        "github_url": "https://github.com/cansuozkan",
        "location": "İstanbul",
        "salary_expectation": 45000,
        "skills": ["Vue.js", "Nuxt.js", "Node.js", "Express", "MongoDB"],
        "projects": [
            {"name": "CMS Platformu", "description": "Vue.js tabanlı içerik yönetim sistemi", "technologies": ["Vue.js", "Nuxt.js", "MongoDB"]},
            {"name": "Real-time Chat", "description": "Socket.io ile gerçek zamanlı chat uygulaması", "technologies": ["Node.js", "Socket.io", "Express"]}
        ]
    },
    {
        "name": "Merve Arslan",
        "email": "merve.arslan@email.com",
        "github_url": "https://github.com/mervearslan",
        "location": "İzmir",
        "salary_expectation": 40000,
        "skills": ["Java", "Spring Boot", "Kubernetes", "AWS", "MySQL"],
        "projects": [
            {"name": "Mikroservis Mimarisi", "description": "Spring Boot ile ölçeklenebilir mikroservis sistemi", "technologies": ["Java", "Spring Boot", "Docker"]},
            {"name": "Cloud Migration", "description": "Legacy sistemlerin AWS'ye taşınması projesi", "technologies": ["AWS", "Kubernetes", "Terraform"]}
        ]
    },
    {
        "name": "Büşra Tekin",
        "email": "busra.tekin@email.com",
        "github_url": "https://github.com/busratekin",
        "location": "Ankara",
        "salary_expectation": 36000,
        "skills": ["C#", ".NET Core", "ASP.NET", "SQL Server", "Azure"],
        "projects": [
            {"name": "ERP Sistemi", "description": ".NET Core ile enterprise kaynak planlama sistemi", "technologies": [".NET Core", "SQL Server", "Azure"]},
            {"name": "Web API", "description": "RESTful API geliştirme ve dökümantasyonu", "technologies": ["ASP.NET", "Swagger", "Entity Framework"]}
        ]
    },
    {
        "name": "Deniz Yıldız",
        "email": "deniz.yildiz@email.com",
        "github_url": "https://github.com/denizyildiz",
        "location": "İstanbul",
        "salary_expectation": 48000,
        "skills": ["Flutter", "Dart", "iOS", "Android", "Firebase"],
        "projects": [
            {"name": "Fintech Uygulaması", "description": "Flutter ile çapraz platform fintech uygulaması", "technologies": ["Flutter", "Dart", "Firebase"]},
            {"name": "E-learning Platform", "description": "Interaktif öğrenme platformu mobil uygulaması", "technologies": ["Flutter", "GraphQL", "Bloc"]}
        ]
    },
    {
        "name": "Fatma Avcı",
        "email": "fatma.avci@email.com",
        "github_url": "https://github.com/fatmaavci",
        "location": "İstanbul",
        "salary_expectation": 55000,
        "skills": ["Python", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "Scikit-learn"],
        "projects": [
            {"name": "Öneri Sistemi", "description": "E-ticaret için makine öğrenmesi tabanlı öneri sistemi", "technologies": ["Python", "TensorFlow", "Redis"]},
            {"name": "Doğal Dil İşleme", "description": "Türkçe sentiment analizi modeli", "technologies": ["Python", "NLTK", "Transformer"]}
        ]
    },
    {
        "name": "Ceren Öztürk",
        "email": "ceren.ozturk@email.com",
        "github_url": "https://github.com/cerenozturk",
        "location": "Ankara",
        "salary_expectation": 60000,
        "skills": ["Python", "PyTorch", "Deep Learning", "Computer Vision", "OpenCV"],
        "projects": [
            {"name": "Görüntü Tanıma", "description": "Tıbbi görüntü analizi için CNN modeli", "technologies": ["PyTorch", "OpenCV", "Flask"]},
            {"name": "Otomatik OCR", "description": "Belge tarama ve metin çıkarma sistemi", "technologies": ["TensorFlow", "Tesseract", "FastAPI"]}
        ]
    }
]

# Sadece teknoloji pozisyonları
DEMO_JOBS = [
    # FRONTEND GELİŞTİRME
    {
        "company": "TechCorp İstanbul",
        "title": "Frontend Developer",
        "description": "Modern React uygulamaları geliştirmek için deneyimli frontend developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "30000-50000",
        "required_skills": ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
        "hr_email": "hr@techcorp.com"
    },
    {
        "company": "ReactWorks",
        "title": "Senior React Developer",
        "description": "Büyük ölçekli React uygulamaları geliştirmek için senior developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-65000",
        "required_skills": ["React", "TypeScript", "Redux", "Next.js", "Team Leadership"],
        "hr_email": "hr@reactworks.com"
    },
    {
        "company": "VueJS Solutions",
        "title": "Vue.js Developer",
        "description": "Vue.js ve Nuxt.js ile modern frontend uygulamaları geliştirme.",
        "location": "Ankara",
        "salary_range": "32000-48000",
        "required_skills": ["Vue.js", "Nuxt.js", "Vuex", "TypeScript", "CSS3"],
        "hr_email": "hr@vuejs.com"
    },
    {
        "company": "DataCorp",
        "title": "Angular Developer",
        "description": "Enterprise düzeyinde Angular uygulamaları geliştirmek için developer arıyoruz.",
        "location": "Bursa",
        "salary_range": "28000-42000",
        "required_skills": ["Angular", "TypeScript", "RxJS", "NgRx"],
        "hr_email": "hr@datacorp.com"
    },
    
    # BACKEND GELİŞTİRME
    {
        "company": "InnovateSoft",
        "title": "Python Backend Developer",
        "description": "Ölçeklenebilir backend servisler geliştirmek için Python developer arıyoruz.",
        "location": "Ankara",
        "salary_range": "35000-55000",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        "hr_email": "hr@innovatesoft.com"
    },
    {
        "company": "CloudTech",
        "title": "Java Backend Developer",
        "description": "Spring Boot ve mikroservis mimarisi deneyimi olan Java developer arayışımız.",
        "location": "İzmir",
        "salary_range": "36000-52000",
        "required_skills": ["Java", "Spring Boot", "Kubernetes", "AWS", "MySQL"],
        "hr_email": "hr@cloudtech.com"
    },
    {
        "company": "Microsoft Solutions",
        "title": ".NET Developer",
        "description": "Enterprise .NET uygulamaları geliştirmek için deneyimli developer arıyoruz.",
        "location": "Ankara",
        "salary_range": "34000-48000",
        "required_skills": ["C#", ".NET Core", "ASP.NET", "SQL Server", "Azure"],
        "hr_email": "hr@mssolutions.com"
    },
    {
        "company": "NodeJS Expert",
        "title": "Node.js Backend Developer",
        "description": "Yüksek performanslı Node.js API'leri ve mikroservisler geliştirme.",
        "location": "İstanbul",
        "salary_range": "38000-58000",
        "required_skills": ["Node.js", "Express", "MongoDB", "TypeScript", "Microservices"],
        "hr_email": "hr@nodejs.com"
    },
    
    # MOBİL UYGULAMA GELİŞTİRME
    {
        "company": "MobileFirst",
        "title": "React Native Developer",
        "description": "Çapraz platform mobil uygulamalar geliştirmek için React Native uzmanı arıyoruz.",
        "location": "İzmir",
        "salary_range": "32000-48000",
        "required_skills": ["React Native", "JavaScript", "Redux", "Firebase"],
        "hr_email": "hr@mobilefirst.com"
    },
    {
        "company": "FlutterWorks",
        "title": "Flutter Developer",
        "description": "Cross-platform mobil uygulamalar geliştirmek için Flutter uzmanı arıyoruz.",
        "location": "İstanbul",
        "salary_range": "40000-60000",
        "required_skills": ["Flutter", "Dart", "iOS", "Android", "Firebase"],
        "hr_email": "hr@flutterworks.com"
    },
    {
        "company": "MobileTech",
        "title": "iOS Developer",
        "description": "Native iOS uygulamaları geliştirmek için Swift uzmanı arıyoruz.",
        "location": "Ankara",
        "salary_range": "38000-55000",
        "required_skills": ["Swift", "SwiftUI", "iOS", "Xcode", "Core Data"],
        "hr_email": "hr@mobiletech.com"
    },
    {
        "company": "AndroidWorks",
        "title": "Android Developer",
        "description": "Native Android uygulamaları geliştirmek için Kotlin uzmanı arıyoruz.",
        "location": "İzmir",
        "salary_range": "35000-50000",
        "required_skills": ["Kotlin", "Android", "Jetpack Compose", "MVVM", "Room"],
        "hr_email": "hr@androidworks.com"
    },
    
    # VERİ BİLİMİ & YAPAY ZEKA
    {
        "company": "AI Research Labs",
        "title": "Data Scientist",
        "description": "Makine öğrenmesi modelleri geliştirmek için data scientist arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-70000",
        "required_skills": ["Python", "Machine Learning", "Pandas", "TensorFlow", "Statistics"],
        "hr_email": "hr@airesearch.com"
    },
    {
        "company": "DeepTech Solutions",
        "title": "Machine Learning Engineer",
        "description": "ML pipeline'ları tasarlayıp geliştirmek için ML engineer arıyoruz.",
        "location": "Ankara",
        "salary_range": "50000-75000",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "MLOps", "AWS"],
        "hr_email": "hr@deeptech.com"
    },
    {
        "company": "DataAnalytics",
        "title": "Data Engineer",
        "description": "Büyük veri işleme pipeline'ları ve veri altyapısı geliştirme.",
        "location": "İzmir",
        "salary_range": "40000-60000",
        "required_skills": ["Python", "Apache Spark", "Kafka", "SQL", "Cloud Platforms"],
        "hr_email": "hr@dataanalytics.com"
    },
    
    # DEVOPS & CLOUD
    {
        "company": "CloudMasters",
        "title": "DevOps Engineer",
        "description": "CI/CD pipeline'ları ve cloud altyapısı yönetimi için DevOps engineer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "42000-65000",
        "required_skills": ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform"],
        "hr_email": "hr@cloudmasters.com"
    },
    {
        "company": "Infrastructure Co",
        "title": "Cloud Solutions Architect",
        "description": "AWS ve Azure cloud çözümleri tasarlamak için architect arıyoruz.",
        "location": "Ankara",
        "salary_range": "55000-80000",
        "required_skills": ["AWS", "Azure", "Terraform", "Microservices", "System Design"],
        "hr_email": "hr@infrastructure.com"
    },
    
    # YAZILIM TESTİ & KALİTE
    {
        "company": "QualityFirst",
        "title": "QA Engineer",
        "description": "Manual ve otomatik test süreçleri için QA engineer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "22000-38000",
        "required_skills": ["Test Planning", "Selenium", "API Testing", "Bug Tracking"],
        "hr_email": "hr@qualityfirst.com"
    },
    {
        "company": "AutoTest Solutions",
        "title": "Test Automation Engineer",
        "description": "Test otomasyonu framework'leri geliştirmek için engineer arıyoruz.",
        "location": "Ankara",
        "salary_range": "28000-45000",
        "required_skills": ["Selenium", "Cypress", "Java", "Python", "REST API"],
        "hr_email": "hr@autotest.com"
    },
    
    # UI/UX & PRODUCT DESIGN
    {
        "company": "DesignHub",
        "title": "UI/UX Designer",
        "description": "Teknoloji ürünleri için kullanıcı deneyimi tasarımı.",
        "location": "İstanbul",
        "salary_range": "28000-45000",
        "required_skills": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
        "hr_email": "hr@designhub.com"
    },
    {
        "company": "ProductTech",
        "title": "Product Manager",
        "description": "Teknoloji ürünlerinin product management'ı için PM arıyoruz.",
        "location": "Ankara",
        "salary_range": "40000-60000",
        "required_skills": ["Product Management", "Agile", "Analytics", "Tech Background"],
        "hr_email": "hr@producttech.com"
    },
    
    # SİBER GÜVENLİK
    {
        "company": "CyberShield",
        "title": "Cybersecurity Engineer",
        "description": "Siber güvenlik tehditleri analizi için uzman arıyoruz.",
        "location": "İstanbul",
        "salary_range": "40000-60000",
        "required_skills": ["Network Security", "Penetration Testing", "SIEM", "Security Tools"],
        "hr_email": "hr@cybershield.com"
    },
    
    # UZAKTAN ÇALIŞMA
    {
        "company": "RemoteFirst",
        "title": "Remote Frontend Developer",
        "description": "Tamamen uzaktan çalışabileceğiniz frontend developer pozisyonu.",
        "location": "Uzaktan",
        "salary_range": "35000-55000",
        "required_skills": ["React", "TypeScript", "Remote Work", "Communication"],
        "hr_email": "hr@remotefirst.com"
    },
    {
        "company": "GlobalTech",
        "title": "Remote Backend Engineer",
        "description": "International team ile uzaktan backend geliştirme pozisyonu.",
        "location": "Uzaktan",
        "salary_range": "40000-60000",
        "required_skills": ["Python", "Django", "PostgreSQL", "English", "Remote Collaboration"],
        "hr_email": "hr@globaltech.com"
    }
]

def create_mock_embedding():
    """3072 boyutlu mock embedding vektörü oluştur"""
    return [random.uniform(-0.1, 0.1) for _ in range(3072)]

async def create_demo_data():
    """Demo verilerini oluştur ve JSON dosyalarına kaydet"""
    print("🚀 Up Hera Demo Veri Oluşturucu - SADECE TEKNOLOJİ POZİSYONLARI")
    print("=" * 60)
    
    # JSON dosyalarına kaydet
    print("📁 Demo veriler JSON dosyalarına kaydediliyor...")
    
    try:
        # Candidates
        with open("data/demo_candidates.json", "w", encoding="utf-8") as f:
            candidates_with_embeddings = []
            for candidate in DEMO_CANDIDATES:
                candidate_with_embedding = candidate.copy()
                candidate_with_embedding["embedding"] = create_mock_embedding()
                candidates_with_embeddings.append(candidate_with_embedding)
            json.dump(candidates_with_embeddings, f, ensure_ascii=False, indent=2)
        
        # Jobs
        with open("data/demo_jobs.json", "w", encoding="utf-8") as f:
            jobs_with_embeddings = []
            for job in DEMO_JOBS:
                job_with_embedding = job.copy()
                job_with_embedding["embedding"] = create_mock_embedding()
                jobs_with_embeddings.append(job_with_embedding)
            json.dump(jobs_with_embeddings, f, ensure_ascii=False, indent=2)
        
        print(f"✅ {len(DEMO_CANDIDATES)} kadın teknoloji uzmanı kaydedildi")
        print(f"✅ {len(DEMO_JOBS)} teknoloji iş ilanı kaydedildi")
        
        print("\n🎯 TEKNOLOJİ POZISYONLARI:")
        print("=" * 40)
        tech_categories = {
            "Frontend": ["Frontend", "React", "Vue.js", "Angular"],
            "Backend": ["Python", "Java", ".NET", "Node.js"],
            "Mobile": ["React Native", "Flutter", "iOS", "Android"],
            "Data Science": ["Data Scientist", "Machine Learning", "Data Engineer"],
            "DevOps": ["DevOps", "Cloud"],
            "QA": ["QA", "Test"],
            "Design": ["UI/UX", "Product"],
            "Security": ["Cybersecurity"],
            "Remote": ["Remote"]
        }
        
        for category, keywords in tech_categories.items():
            count = sum(1 for job in DEMO_JOBS if any(keyword in job['title'] for keyword in keywords))
            if count > 0:
                print(f"   {category}: {count} pozisyon")
        
        print("\n🌍 LOKASYONLAR:")
        print("=" * 30)
        locations = {}
        for candidate in DEMO_CANDIDATES:
            loc = candidate.get('location', 'Belirtilmemiş')
            locations[loc] = locations.get(loc, 0) + 1
        
        for location, count in sorted(locations.items()):
            print(f"   {location}: {count} kişi")
        
        print("\n💰 MAAŞ DAĞILIMI:")
        print("=" * 30)
        salary_ranges = {
            "20-30K": len([c for c in DEMO_CANDIDATES if 20000 <= c.get('salary_expectation', 0) < 30000]),
            "30-40K": len([c for c in DEMO_CANDIDATES if 30000 <= c.get('salary_expectation', 0) < 40000]),
            "40-50K": len([c for c in DEMO_CANDIDATES if 40000 <= c.get('salary_expectation', 0) < 50000]),
            "50K+": len([c for c in DEMO_CANDIDATES if c.get('salary_expectation', 0) >= 50000])
        }
        
        for range_name, count in salary_ranges.items():
            print(f"   {range_name}: {count} kişi")
        
        print("\n🎉 Teknoloji odaklı demo veri oluşturma tamamlandı!")
        print("🔗 Backend'i başlatıp http://localhost:8000/docs adresinden test edebilirsiniz")
        
    except Exception as e:
        print(f"❌ Hata: {e}")
        return False
    
    return True

if __name__ == "__main__":
    import asyncio
    import os
    
    # Data klasörünü oluştur
    os.makedirs("data", exist_ok=True)
    
    # Demo veri oluştur
    asyncio.run(create_demo_data())
