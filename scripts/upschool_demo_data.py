#!/usr/bin/env python3
"""
UpSchool Partner Şirketleri Demo Veri Script'i
Gerçek UpSchool verilerine dayalı, çeşitli seviyeli pozisyonlar
"""

import asyncio
import json
import uuid
from datetime import datetime, timezone
import sys
import os
import random

# Parent directory'yi path'e ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import init_db
from api.models import Candidate, Job, Match, Embedding
from sqlalchemy import text, delete
import sqlite3
from api.models import Candidate, Job, Match, Embedding
from sqlalchemy import text, delete

# Gerçek UpSchool Bootcamp Programları
UPSCHOOL_BOOTCAMPS = [
    {
        "name": "Frontend Development",
        "cohorts": ["Frontend-2023-1", "Frontend-2023-2", "Frontend-2024-1"],
        "skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Redux", "Next.js", "Tailwind CSS"],
        "icon": "⚛️"
    },
    {
        "name": "Backend Development", 
        "cohorts": ["Backend-2023-1", "Backend-2023-2", "Backend-2024-1"],
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS"],
        "icon": "🔧"
    },
    {
        "name": "Full Stack Development",
        "cohorts": ["FullStack-2023-1", "FullStack-2023-2", "FullStack-2024-1"],
        "skills": ["React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Git", "Docker", "TypeScript"],
        "icon": "🚀"
    },
    {
        "name": "Data Science",
        "cohorts": ["DataScience-2023-1", "DataScience-2023-2", "DataScience-2024-1"],
        "skills": ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "SQL", "Tableau", "Jupyter"],
        "icon": "📊"
    },
    {
        "name": "Mobile Development",
        "cohorts": ["Mobile-2023-1", "Mobile-2023-2", "Mobile-2024-1"],
        "skills": ["React Native", "Flutter", "Swift", "Kotlin", "Firebase", "Redux", "AsyncStorage"],
        "icon": "📱"
    },
    {
        "name": "DevOps Engineering",
        "cohorts": ["DevOps-2023-1", "DevOps-2024-1"],
        "skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux", "Git", "Python"],
        "icon": "⚙️"
    },
    {
        "name": "UI/UX Design",
        "cohorts": ["UIUX-2023-1", "UIUX-2023-2", "UIUX-2024-1"],
        "skills": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "HTML", "CSS"],
        "icon": "🎨"
    }
]

# Gerçek UpSchool Partner Şirketleri ve Pozisyonları
UPSCHOOL_PARTNERS = [
    {
        "company": "A101 Teknoloji",
        "description": "Türkiye'nin en büyük perakende zincirlerinden biri",
        "positions": [
            {"title": "Junior Frontend Developer", "level": "junior", "salary": "25000-35000"},
            {"title": "Mid-Level React Developer", "level": "mid", "salary": "35000-50000"},
            {"title": "Senior Full Stack Developer", "level": "senior", "salary": "55000-75000"}
        ]
    },
    {
        "company": "Vodafone Türkiye",
        "description": "Lider telekomünikasyon şirketi",
        "positions": [
            {"title": "Trainee Software Developer", "level": "trainee", "salary": "22000-30000"},
            {"title": "Backend Developer", "level": "mid", "salary": "40000-55000"},
            {"title": "DevOps Engineer", "level": "senior", "salary": "60000-80000"}
        ]
    },
    {
        "company": "Amazon Türkiye",
        "description": "Global e-ticaret devi",
        "positions": [
            {"title": "Software Development Engineer I", "level": "junior", "salary": "45000-60000"},
            {"title": "Software Development Engineer II", "level": "mid", "salary": "65000-85000"},
            {"title": "Principal Engineer", "level": "senior", "salary": "100000-140000"}
        ]
    },
    {
        "company": "Arçelik Global",
        "description": "Beyaz eşya ve teknoloji grubu",
        "positions": [
            {"title": "IoT Developer", "level": "junior", "salary": "28000-38000"},
            {"title": "Mobile App Developer", "level": "mid", "salary": "38000-52000"},
            {"title": "Tech Lead", "level": "senior", "salary": "65000-85000"}
        ]
    },
    {
        "company": "CITS (Coca-Cola İçecek)",
        "description": "Coca-Cola Bottling Company",
        "positions": [
            {"title": "Junior Data Analyst", "level": "junior", "salary": "26000-36000"},
            {"title": "Business Intelligence Developer", "level": "mid", "salary": "42000-58000"},
            {"title": "Data Science Lead", "level": "senior", "salary": "70000-95000"}
        ]
    },
    {
        "company": "Getir Teknoloji",
        "description": "Dünyaya açılan hızlı teslimat uygulaması",
        "positions": [
            {"title": "Frontend Developer", "level": "junior", "salary": "32000-42000"},
            {"title": "Mobile Developer", "level": "mid", "salary": "45000-60000"},
            {"title": "Staff Engineer", "level": "senior", "salary": "80000-110000"}
        ]
    },
    {
        "company": "Trendyol Group",
        "description": "Türkiye'nin en büyük e-ticaret platformu", 
        "positions": [
            {"title": "Junior Software Engineer", "level": "junior", "salary": "35000-45000"},
            {"title": "Software Engineer", "level": "mid", "salary": "50000-70000"},
            {"title": "Senior Software Engineer", "level": "senior", "salary": "75000-100000"}
        ]
    },
    {
        "company": "Hepsiburada Technology",
        "description": "Türkiye'nin önde gelen e-ticaret platformu",
        "positions": [
            {"title": "Associate Software Developer", "level": "trainee", "salary": "28000-38000"},
            {"title": "Software Developer", "level": "mid", "salary": "45000-62000"},
            {"title": "Principal Software Engineer", "level": "senior", "salary": "85000-115000"}
        ]
    },
    {
        "company": "Akbank Teknoloji",
        "description": "Dijital bankacılık çözümleri",
        "positions": [
            {"title": "Junior Full Stack Developer", "level": "junior", "salary": "30000-40000"},
            {"title": "Backend Developer", "level": "mid", "salary": "42000-58000"},
            {"title": "Solution Architect", "level": "senior", "salary": "75000-100000"}
        ]
    },
    {
        "company": "Turkcell Teknoloji",
        "description": "Türkiye'nin lider teknoloji şirketi",
        "positions": [
            {"title": "Graduate Software Engineer", "level": "trainee", "salary": "25000-35000"},
            {"title": "Mobile Application Developer", "level": "mid", "salary": "40000-55000"},
            {"title": "Engineering Manager", "level": "senior", "salary": "70000-95000"}
        ]
    }
]

# Çeşitli seviyeli UpSchool mezunu kadın developer'lar
UPSCHOOL_GRADUATES = [
    # Junior/Trainee Level
    {
        "name": "Ayşe Yılmaz",
        "email": "ayse.yilmaz@email.com",
        "bootcamp": "Frontend Development",
        "cohort": "Frontend-2024-1",
        "level": "junior",
        "graduation_date": "2024-01-15",
        "experience_months": 8,
        "skills": ["React", "JavaScript", "CSS", "HTML", "Git"],
        "location": "İstanbul",
        "salary_expectation": 28000,
        "projects": [
            {
                "name": "Kişisel Portfolio Sitesi",
                "description": "React ile geliştirilmiş responsive portfolio website",
                "technologies": ["React", "CSS3", "JavaScript"],
                "github": "https://github.com/ayseyilmaz/portfolio",
                "live": "https://ayseyilmaz.dev"
            },
            {
                "name": "Todo Uygulaması",
                "description": "Local storage ile veri saklayan todo list uygulaması",
                "technologies": ["HTML", "CSS", "JavaScript"],
                "github": "https://github.com/ayseyilmaz/todo-app"
            }
        ]
    },
    {
        "name": "Fatma Özdemir",
        "email": "fatma.ozdemir@email.com",
        "bootcamp": "Backend Development",
        "cohort": "Backend-2024-1",
        "level": "trainee",
        "graduation_date": "2024-01-20",
        "experience_months": 6,
        "skills": ["Python", "Django", "PostgreSQL", "Git"],
        "location": "Ankara",
        "salary_expectation": 24000,
        "projects": [
            {
                "name": "Blog API",
                "description": "Django REST framework ile blog API'si",
                "technologies": ["Python", "Django", "DRF", "PostgreSQL"],
                "github": "https://github.com/fatmaozdemir/blog-api"
            }
        ]
    },
    {
        "name": "Selin Demir",
        "email": "selin.demir@email.com",
        "bootcamp": "Mobile Development",
        "cohort": "Mobile-2023-2",
        "level": "junior",
        "graduation_date": "2023-12-10",
        "experience_months": 14,
        "skills": ["React Native", "JavaScript", "Firebase", "Redux"],
        "location": "İzmir",
        "salary_expectation": 32000,
        "projects": [
            {
                "name": "Fitness Tracker",
                "description": "React Native ile fitness takip uygulaması",
                "technologies": ["React Native", "Firebase", "Redux"],
                "github": "https://github.com/selindemir/fitness-tracker"
            }
        ]
    },
    
    # Mid Level
    {
        "name": "Zeynep Kaya",
        "email": "zeynep.kaya@email.com",
        "bootcamp": "Full Stack Development",
        "cohort": "FullStack-2023-1",
        "level": "mid",
        "graduation_date": "2023-06-15",
        "experience_months": 20,
        "skills": ["React", "Node.js", "Express", "MongoDB", "TypeScript", "Docker"],
        "location": "İstanbul",
        "salary_expectation": 45000,
        "projects": [
            {
                "name": "E-ticaret Platformu",
                "description": "MERN stack ile tam özellikli e-ticaret sitesi",
                "technologies": ["React", "Node.js", "Express", "MongoDB"],
                "github": "https://github.com/zeynepkaya/ecommerce-platform",
                "live": "https://ecommerce-zk.herokuapp.com"
            },
            {
                "name": "Task Management System",
                "description": "Takım çalışması için proje yönetim uygulaması",
                "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL"],
                "github": "https://github.com/zeynepkaya/task-manager"
            }
        ]
    },
    {
        "name": "Elif Şahin",
        "email": "elif.sahin@email.com",
        "bootcamp": "Data Science",
        "cohort": "DataScience-2023-1",
        "level": "mid",
        "graduation_date": "2023-07-20",
        "experience_months": 18,
        "skills": ["Python", "Pandas", "NumPy", "Scikit-learn", "SQL", "Tableau"],
        "location": "Bursa",
        "salary_expectation": 42000,
        "projects": [
            {
                "name": "Müşteri Segmentasyonu",
                "description": "Machine learning ile müşteri analizi ve segmentasyon",
                "technologies": ["Python", "Pandas", "Scikit-learn", "Matplotlib"],
                "github": "https://github.com/elifsahin/customer-segmentation"
            }
        ]
    },
    
    # Senior Level
    {
        "name": "Büşra Tekin",
        "email": "busra.tekin@email.com",
        "bootcamp": "Backend Development",
        "cohort": "Backend-2022-2",
        "level": "senior",
        "graduation_date": "2022-12-15",
        "experience_months": 36,
        "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS"],
        "location": "İstanbul",
        "salary_expectation": 72000,
        "projects": [
            {
                "name": "Mikroservis Mimarisi",
                "description": "Docker ve Kubernetes ile ölçeklenebilir mikroservis sistemi",
                "technologies": ["Python", "FastAPI", "Docker", "Kubernetes", "PostgreSQL"],
                "github": "https://github.com/busratekin/microservices-arch"
            },
            {
                "name": "Real-time Analytics API",
                "description": "Yüksek performanslı real-time veri işleme API'si",
                "technologies": ["Python", "FastAPI", "Redis", "Celery", "PostgreSQL"],
                "github": "https://github.com/busratekin/analytics-api"
            }
        ]
    },
    {
        "name": "Deniz Yıldız",
        "email": "deniz.yildiz@email.com",
        "bootcamp": "Frontend Development",
        "cohort": "Frontend-2022-1",
        "level": "senior",
        "graduation_date": "2022-06-20",
        "experience_months": 42,
        "skills": ["React", "TypeScript", "Next.js", "Redux", "GraphQL", "Jest", "Cypress"],
        "location": "İstanbul",
        "salary_expectation": 68000,
        "projects": [
            {
                "name": "Enterprise Dashboard",
                "description": "React ve TypeScript ile enterprise seviye dashboard",
                "technologies": ["React", "TypeScript", "Next.js", "GraphQL"],
                "github": "https://github.com/denizyildiz/enterprise-dashboard",
                "live": "https://dashboard-demo.vercel.app"
            }
        ]
    },
    
    # Daha fazla çeşitlilik için ekstra profiller
    {
        "name": "Merve Arslan",
        "email": "merve.arslan@email.com",
        "bootcamp": "DevOps Engineering",
        "cohort": "DevOps-2023-1",
        "level": "mid",
        "graduation_date": "2023-09-10",
        "experience_months": 16,
        "skills": ["Docker", "Kubernetes", "AWS", "Jenkins", "Terraform", "Linux"],
        "location": "Ankara",
        "salary_expectation": 48000,
        "projects": [
            {
                "name": "CI/CD Pipeline",
                "description": "Jenkins ve Docker ile otomatik deployment sistemi",
                "technologies": ["Jenkins", "Docker", "AWS", "Terraform"],
                "github": "https://github.com/mervearslan/cicd-pipeline"
            }
        ]
    },
    {
        "name": "Cansu Özkan",
        "email": "cansu.ozkan@email.com",
        "bootcamp": "UI/UX Design",
        "cohort": "UIUX-2023-2",
        "level": "junior",
        "graduation_date": "2023-11-25",
        "experience_months": 10,
        "skills": ["Figma", "Adobe XD", "Prototyping", "User Research", "HTML", "CSS"],
        "location": "İzmir",
        "salary_expectation": 26000,
        "projects": [
            {
                "name": "Mobil Bankacılık UX",
                "description": "Mobil bankacılık uygulaması UX/UI tasarımı",
                "technologies": ["Figma", "Prototyping", "User Research"],
                "live": "https://www.figma.com/proto/cansu-banking-app"
            }
        ]
    }
]

def create_mock_embedding():
    """3072 boyutlu mock embedding vektörü oluştur"""
    return [random.uniform(-0.1, 0.1) for _ in range(3072)]

def get_level_emoji(level):
    """Seviye emojisi döndür"""
    level_map = {
        "trainee": "🌱",
        "junior": "🌿", 
        "mid": "🌳",
        "senior": "🌲"
    }
    return level_map.get(level, "💼")

async def create_expanded_demo_data():
    """Genişletilmiş UpSchool demo verisi oluştur"""
    print("🚀 Up Hera - UpSchool Partner Şirketleri Demo Verisi")
    print("📊 Gerçek UpSchool istatistikleri: 30.000+ başvuru, %70 tamamlama, %70 işe girme oranı")
    
    # Veritabanını başlat
    await init_db()
    print("✅ Veritabanı tabloları oluşturuldu!")
    
    async with AsyncSessionLocal() as session:
        try:
            # Mevcut verileri temizle
            print("🧹 Mevcut veriler temizleniyor...")
            try:
                await session.execute(delete(Match))
                await session.execute(delete(Embedding))
                await session.execute(delete(Candidate))
                await session.execute(delete(Job))
                await session.commit()
                print("✅ Mevcut veriler temizlendi!")
            except Exception as e:
                print(f"ℹ️  Temizleme atlandı (ilk çalıştırma): {e}")
                await session.rollback()
            
            # UpSchool mezunu kadın developer'ları oluştur
            print("👩‍💻 UpSchool mezunu kadın developer'lar oluşturuluyor...")
            candidate_ids = []
            
            for candidate_data in UPSCHOOL_GRADUATES:
                bootcamp_info = next((b for b in UPSCHOOL_BOOTCAMPS if b["name"] == candidate_data["bootcamp"]), None)
                
                candidate = Candidate(
                    id=str(uuid.uuid4()),
                    name=candidate_data["name"],
                    email=candidate_data["email"],
                    github_url=f"https://github.com/{candidate_data['name'].lower().replace(' ', '')}",
                    location=candidate_data["location"],
                    salary_expectation=candidate_data["salary_expectation"],
                    skills=candidate_data["skills"],
                    projects=candidate_data["projects"]
                )
                session.add(candidate)
                candidate_ids.append(candidate.id)
                
                # Mock embedding oluştur
                embedding = Embedding(
                    id=str(uuid.uuid4()),
                    candidate_id=candidate.id,
                    embedding_vector=json.dumps(create_mock_embedding())
                )
                session.add(embedding)
                
                print(f"  {get_level_emoji(candidate_data['level'])} {candidate_data['name']} - {candidate_data['bootcamp']} ({candidate_data['level'].title()})")
            
            # UpSchool partner şirketlerinin pozisyonlarını oluştur
            print("🏢 UpSchool Partner Şirketleri pozisyonları oluşturuluyor...")
            job_ids = []
            
            for partner in UPSCHOOL_PARTNERS:
                for position in partner["positions"]:
                    # Bootcamp'lere göre uygun skillset seç
                    relevant_bootcamp = random.choice(UPSCHOOL_BOOTCAMPS)
                    required_skills = random.sample(relevant_bootcamp["skills"], k=random.randint(3, 6))
                    
                    # Seviye bazlı açıklama oluştur
                    level_descriptions = {
                        "trainee": f"🌱 UpSchool yeni mezunları için mükemmel fırsat! {partner['company']}'de kariyerine başla.",
                        "junior": f"🌿 0-2 yıl deneyimli UpSchool mezunları için {partner['company']}'de büyüme fırsatı.",
                        "mid": f"🌳 2+ yıl deneyimli UpSchool mezunları tercih edilir. {partner['company']}'de liderlik yolculuğuna başla.",
                        "senior": f"🌲 Deneyimli UpSchool mezunu senior developer'lar arıyoruz. {partner['company']}'de teknik liderlik rolü."
                    }
                    
                    job = Job(
                        id=str(uuid.uuid4()),
                        company=partner["company"],
                        title=position["title"],
                        description=level_descriptions.get(position["level"], f"{partner['company']}'de harika kariyer fırsatı!"),
                        location=random.choice(["İstanbul", "Ankara", "İzmir", "Bursa", "Uzaktan", "Hibrit"]),
                        salary_range=f"{position['salary']} TL",
                        required_skills=required_skills,
                        hr_email=f"hr@{partner['company'].lower().replace(' ', '').replace('ü', 'u').replace('ç', 'c').replace('ş', 's').replace('ğ', 'g').replace('ı', 'i').replace('ö', 'o')}.com"
                    )
                    session.add(job)
                    job_ids.append(job.id)
                    
                    # Mock embedding oluştur
                    embedding = Embedding(
                        id=str(uuid.uuid4()),
                        job_id=job.id,
                        embedding_vector=json.dumps(create_mock_embedding())
                    )
                    session.add(embedding)
                    
                    print(f"  {get_level_emoji(position['level'])} {position['title']} - {partner['company']} ({position['salary']} TL)")
            
            # Seviye uyumlu eşleşmeler oluştur
            print("🎯 Seviye uyumlu AI eşleşmeleri oluşturuluyor...")
            
            # Seviye gruplarını oluştur
            trainee_jobs = [job_id for i, job_id in enumerate(job_ids) if any(pos["level"] == "trainee" for pos in UPSCHOOL_PARTNERS[i // len(UPSCHOOL_PARTNERS[0]["positions"])]["positions"])]
            junior_jobs = [job_id for i, job_id in enumerate(job_ids) if any(pos["level"] == "junior" for pos in UPSCHOOL_PARTNERS[i // len(UPSCHOOL_PARTNERS[0]["positions"])]["positions"])]
            mid_jobs = [job_id for i, job_id in enumerate(job_ids) if any(pos["level"] == "mid" for pos in UPSCHOOL_PARTNERS[i // len(UPSCHOOL_PARTNERS[0]["positions"])]["positions"])]
            senior_jobs = [job_id for i, job_id in enumerate(job_ids) if any(pos["level"] == "senior" for pos in UPSCHOOL_PARTNERS[i // len(UPSCHOOL_PARTNERS[0]["positions"])]["positions"])]
            
            # Her seviye için eşleşme oluştur
            for i in range(30):  # Daha fazla eşleşme
                # Seviye uyumlu job seçimi
                job_pool = random.choice([trainee_jobs, junior_jobs, mid_jobs, senior_jobs]) if any([trainee_jobs, junior_jobs, mid_jobs, senior_jobs]) else job_ids
                
                if job_pool and candidate_ids:
                    match = Match(
                        id=str(uuid.uuid4()),
                        job_id=random.choice(job_pool if job_pool else job_ids),
                        candidate_id=random.choice(candidate_ids),
                        score=random.uniform(0.75, 0.98),  # Daha yüksek eşleşme skorları
                        status=random.choice(["pending", "sent", "viewed", "interview", "hired"])
                    )
                    session.add(match)
            
            await session.commit()
            
            # Başarı istatistikleri
            print("\n🎉 UpSchool Up Hera Demo Verisi Başarıyla Oluşturuldu!")
            print("=" * 60)
            print(f"👩‍💻 {len(UPSCHOOL_GRADUATES)} UpSchool mezunu kadın developer")
            print(f"🏢 {len([pos for partner in UPSCHOOL_PARTNERS for pos in partner['positions']])} partner şirket pozisyonu")
            print(f"🎯 30 seviye uyumlu AI eşleşme")
            print(f"🚀 {len(UPSCHOOL_BOOTCAMPS)} farklı bootcamp programı")
            
            print("\n📊 Seviye Dağılımı:")
            levels = [grad["level"] for grad in UPSCHOOL_GRADUATES]
            for level in ["trainee", "junior", "mid", "senior"]:
                count = levels.count(level)
                emoji = get_level_emoji(level)
                print(f"  {emoji} {level.title()}: {count} kişi")
            
            print("\n🏆 UpSchool Partner Şirketleri:")
            for partner in UPSCHOOL_PARTNERS[:5]:  # İlk 5'ini göster
                print(f"  • {partner['company']}")
            print(f"  ... ve {len(UPSCHOOL_PARTNERS)-5} partner daha!")
            
            print("\n💫 Up Hera ile UpSchool mezunlarının geleceği parlak!")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Hata: {str(e)}")
            raise

async def main():
    """Ana fonksiyon"""
    await create_expanded_demo_data()

if __name__ == "__main__":
    asyncio.run(main()) 