#!/usr/bin/env python3
"""
Demo veri oluşturma script'i - Mock Database
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
    # Data Science & AI uzmanları
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
    },
    {
        "name": "Gülşah Polat",
        "email": "gulsah.polat@email.com",
        "github_url": "https://github.com/gulsahpolat",
        "location": "İzmir",
        "salary_expectation": 45000,
        "skills": ["SQL", "Power BI", "Tableau", "Python", "Statistics"],
        "projects": [
            {"name": "Satış Analizi", "description": "Power BI ile interaktif satış dashboard'u", "technologies": ["Power BI", "SQL Server", "DAX"]},
            {"name": "Müşteri Segmentasyonu", "description": "Python ile müşteri davranış analizi", "technologies": ["Python", "Sklearn", "Matplotlib"]}
        ]
    },
    # DevOps & Cloud uzmanları
    {
        "name": "Özlem Kartal",
        "email": "ozlem.kartal@email.com",
        "github_url": "https://github.com/ozlemkartal",
        "location": "İstanbul",
        "salary_expectation": 52000,
        "skills": ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform"],
        "projects": [
            {"name": "CI/CD Pipeline", "description": "Jenkins ile otomatik deployment sistemi", "technologies": ["Jenkins", "Docker", "Kubernetes"]},
            {"name": "Infrastructure as Code", "description": "Terraform ile AWS altyapı otomasyonu", "technologies": ["Terraform", "AWS", "Ansible"]}
        ]
    },
    {
        "name": "Nesrin Yıldırım",
        "email": "nesrin.yildirim@email.com",
        "github_url": "https://github.com/nesrinyildirim",
        "location": "Ankara",
        "salary_expectation": 65000,
        "skills": ["AWS", "Azure", "Google Cloud", "Terraform", "Microservices"],
        "projects": [
            {"name": "Multi-Cloud Migration", "description": "Hibrit cloud mimarisi tasarımı", "technologies": ["AWS", "Azure", "Terraform"]},
            {"name": "Serverless Architecture", "description": "Lambda tabanlı serverless uygulama", "technologies": ["AWS Lambda", "DynamoDB", "API Gateway"]}
        ]
    },
    {
        "name": "Sibel Erdem",
        "email": "sibel.erdem@email.com",
        "github_url": "https://github.com/sibelerdem",
        "location": "İzmir",
        "salary_expectation": 48000,
        "skills": ["Linux", "Python", "Monitoring", "Grafana", "Prometheus"],
        "projects": [
            {"name": "Monitoring Stack", "description": "Prometheus ve Grafana ile sistem izleme", "technologies": ["Prometheus", "Grafana", "AlertManager"]},
            {"name": "Log Aggregation", "description": "ELK Stack ile log toplama sistemi", "technologies": ["Elasticsearch", "Logstash", "Kibana"]}
        ]
    },
    # UI/UX & Product uzmanları
    {
        "name": "Pınar Aktaş",
        "email": "pinar.aktas@email.com",
        "github_url": "https://github.com/pinaraktas",
        "location": "İstanbul",
        "salary_expectation": 38000,
        "skills": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
        "projects": [
            {"name": "Mobil Banking UX", "description": "Mobil bankacılık uygulaması kullanıcı deneyimi tasarımı", "technologies": ["Figma", "Principle", "InVision"]},
            {"name": "E-commerce Redesign", "description": "E-ticaret sitesi UX optimizasyonu", "technologies": ["Adobe XD", "Maze", "Hotjar"]}
        ]
    },
    {
        "name": "Begüm Çelik",
        "email": "begum.celik@email.com",
        "github_url": "https://github.com/begumcelik",
        "location": "Ankara",
        "salary_expectation": 45000,
        "skills": ["Product Management", "Agile", "Analytics", "User Research"],
        "projects": [
            {"name": "Feature Roadmap", "description": "SaaS ürünü için 2-yıllık feature roadmap'i", "technologies": ["Jira", "Miro", "Google Analytics"]},
            {"name": "A/B Testing", "description": "Kullanıcı deneyimi iyileştirme testleri", "technologies": ["Optimizely", "Amplitude", "Mixpanel"]}
        ]
    },
    {
        "name": "Ece Özer",
        "email": "ece.ozer@email.com",
        "github_url": "https://github.com/eceozer",
        "location": "İzmir",
        "salary_expectation": 42000,
        "skills": ["User Research", "Usability Testing", "Analytics", "Survey Design"],
        "projects": [
            {"name": "User Journey Mapping", "description": "Fintech ürünü kullanıcı yolculuğu analizi", "technologies": ["Miro", "Dovetail", "UserZoom"]},
            {"name": "Accessibility Audit", "description": "Web erişilebilirlik analizi ve önerileri", "technologies": ["WAVE", "aXe", "Lighthouse"]}
        ]
    },
    # QA & Testing uzmanları
    {
        "name": "Tülay Korkmaz",
        "email": "tulay.korkmaz@email.com",
        "github_url": "https://github.com/tulaykorkmaz",
        "location": "İstanbul",
        "salary_expectation": 32000,
        "skills": ["Test Planning", "Selenium", "API Testing", "Bug Tracking"],
        "projects": [
            {"name": "Test Automation Framework", "description": "Selenium ile web uygulaması test otomasyonu", "technologies": ["Selenium", "TestNG", "Maven"]},
            {"name": "API Test Suite", "description": "RESTful API test süitleri", "technologies": ["Postman", "Newman", "RestAssured"]}
        ]
    },
    {
        "name": "Neslihan Güneş",
        "email": "neslihan.gunes@email.com",
        "github_url": "https://github.com/neslihangunes",
        "location": "Ankara",
        "salary_expectation": 38000,
        "skills": ["Selenium", "Cypress", "Java", "Python", "REST API"],
        "projects": [
            {"name": "E2E Test Framework", "description": "Cypress ile end-to-end test otomasyonu", "technologies": ["Cypress", "JavaScript", "Docker"]},
            {"name": "Performance Testing", "description": "JMeter ile performans test senaryoları", "technologies": ["JMeter", "BlazeMeter", "Grafana"]}
        ]
    },
    # Cybersecurity uzmanları
    {
        "name": "Dilek Arslan",
        "email": "dilek.arslan@email.com",
        "github_url": "https://github.com/dilekarslan",
        "location": "İstanbul",
        "salary_expectation": 50000,
        "skills": ["Network Security", "Penetration Testing", "SIEM", "Incident Response"],
        "projects": [
            {"name": "Security Assessment", "description": "Enterprise ağ güvenlik değerlendirmesi", "technologies": ["Nessus", "Wireshark", "Metasploit"]},
            {"name": "SIEM Implementation", "description": "Splunk ile güvenlik izleme sistemi", "technologies": ["Splunk", "ELK Stack", "Python"]}
        ]
    },
    {
        "name": "Sevda Toprak",
        "email": "sevda.toprak@email.com",
        "github_url": "https://github.com/sevdatoprak",
        "location": "Ankara",
        "salary_expectation": 55000,
        "skills": ["Ethical Hacking", "Penetration Testing", "Vulnerability Assessment"],
        "projects": [
            {"name": "Vulnerability Scanner", "description": "Özel güvenlik açığı tarama aracı", "technologies": ["Python", "Nmap", "Burp Suite"]},
            {"name": "Red Team Exercise", "description": "Kurumsal red team sızma testleri", "technologies": ["Kali Linux", "Cobalt Strike", "Empire"]}
        ]
    },
    # Game Development uzmanları
    {
        "name": "Melis Şimşek",
        "email": "melis.simsek@email.com",
        "github_url": "https://github.com/melissimsek",
        "location": "İstanbul",
        "salary_expectation": 42000,
        "skills": ["Unity", "C#", "3D Graphics", "Game Design", "Mobile Development"],
        "projects": [
            {"name": "Puzzle Game", "description": "Unity ile 3D puzzle oyunu", "technologies": ["Unity", "C#", "Blender"]},
            {"name": "AR Game", "description": "Artırılmış gerçeklik mobil oyunu", "technologies": ["Unity", "ARCore", "Vuforia"]}
        ]
    },
    {
        "name": "Burcu Tan",
        "email": "burcu.tan@email.com",
        "github_url": "https://github.com/burcutan",
        "location": "Ankara",
        "salary_expectation": 35000,
        "skills": ["Game Design", "Level Design", "Unity", "Photoshop"],
        "projects": [
            {"name": "Indie RPG", "description": "Bağımsız RPG oyunu tasarımı", "technologies": ["Unity", "Photoshop", "Aseprite"]},
            {"name": "Educational Game", "description": "Çocuklar için eğitici oyun", "technologies": ["Construct 3", "Adobe Illustrator"]}
        ]
    },
    # Blockchain & Fintech uzmanları
    {
        "name": "Hilal Koç",
        "email": "hilal.koc@email.com",
        "github_url": "https://github.com/hilalkoc",
        "location": "İstanbul",
        "salary_expectation": 58000,
        "skills": ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "JavaScript"],
        "projects": [
            {"name": "DeFi Protocol", "description": "Merkezi olmayan finans protokolü", "technologies": ["Solidity", "Web3.js", "React"]},
            {"name": "NFT Marketplace", "description": "NFT alım-satım platformu", "technologies": ["Ethereum", "IPFS", "Next.js"]}
        ]
    },
    {
        "name": "Aslı Demirtaş",
        "email": "asli.demirtas@email.com",
        "github_url": "https://github.com/aslidemirtas",
        "location": "İzmir",
        "salary_expectation": 48000,
        "skills": ["Python", "Django", "Payment APIs", "Financial APIs", "Security"],
        "projects": [
            {"name": "Digital Wallet", "description": "Dijital cüzdan uygulaması", "technologies": ["Django", "Stripe", "PostgreSQL"]},
            {"name": "Crypto Exchange", "description": "Kripto para borsası backend'i", "technologies": ["FastAPI", "Redis", "WebSocket"]}
        ]
    },
    # E-commerce & Digital Marketing uzmanları
    {
        "name": "Selin Karaca",
        "email": "selin.karaca@email.com",
        "github_url": "https://github.com/selinkaraca",
        "location": "İstanbul",
        "salary_expectation": 40000,
        "skills": ["PHP", "Laravel", "WooCommerce", "Shopify", "Payment Integration"],
        "projects": [
            {"name": "Multi-vendor Marketplace", "description": "Çok satıcılı e-ticaret platformu", "technologies": ["Laravel", "MySQL", "Stripe"]},
            {"name": "Inventory Management", "description": "Stok yönetimi sistemi entegrasyonu", "technologies": ["WooCommerce", "REST API", "Webhook"]}
        ]
    },
    {
        "name": "İpek Yalçın",
        "email": "ipek.yalcin@email.com",
        "github_url": "https://github.com/ipekyalcin",
        "location": "Ankara",
        "salary_expectation": 28000,
        "skills": ["Google Analytics", "SEO", "SEM", "Social Media", "Content Marketing"],
        "projects": [
            {"name": "SEO Optimization", "description": "E-ticaret sitesi SEO optimizasyonu", "technologies": ["Google Analytics", "Search Console", "SEMrush"]},
            {"name": "Marketing Automation", "description": "E-posta pazarlama otomasyonu", "technologies": ["Mailchimp", "HubSpot", "Google Ads"]}
        ]
    },
    # Remote & International uzmanlar
    {
        "name": "Duygu Ergin",
        "email": "duygu.ergin@email.com",
        "github_url": "https://github.com/duygurergin",
        "location": "Uzaktan",
        "salary_expectation": 45000,
        "skills": ["React", "TypeScript", "Remote Work", "Communication", "English"],
        "projects": [
            {"name": "Global Dashboard", "description": "Uluslararası ekip için dashboard uygulaması", "technologies": ["React", "TypeScript", "GraphQL"]},
            {"name": "Multi-language Platform", "description": "Çok dilli web platformu", "technologies": ["Next.js", "i18next", "Strapi"]}
        ]
    },
    {
        "name": "Yasemin Bulut",
        "email": "yasemin.bulut@email.com",
        "github_url": "https://github.com/yaseminbulut",
        "location": "Uzaktan",
        "salary_expectation": 52000,
        "skills": ["Python", "Django", "PostgreSQL", "English", "Remote Collaboration"],
        "projects": [
            {"name": "International API", "description": "Küresel API servisleri geliştirmesi", "technologies": ["Django", "DRF", "Docker"]},
            {"name": "Cross-timezone System", "description": "Farklı zaman dilimlerinde çalışan sistem", "technologies": ["Celery", "Redis", "Timezone handling"]}
        ]
    },
    # Junior pozisyonlar için fresh graduates
    {
        "name": "Esra Kılıç",
        "email": "esra.kilic@email.com",
        "github_url": "https://github.com/esrakilic",
        "location": "İstanbul",
        "salary_expectation": 22000,
        "skills": ["HTML", "CSS", "JavaScript", "React", "Bootstrap"],
        "projects": [
            {"name": "Portfolio Website", "description": "Kişisel portfolio web sitesi", "technologies": ["React", "CSS", "GitHub Pages"]},
            {"name": "Weather App", "description": "Hava durumu uygulaması", "technologies": ["JavaScript", "API", "Bootstrap"]}
        ]
    },
    {
        "name": "Betül Aydın",
        "email": "betul.aydin@email.com",
        "github_url": "https://github.com/betulaydin",
        "location": "Ankara",
        "salary_expectation": 24000,
        "skills": ["Python", "Flask", "SQLite", "HTML", "CSS"],
        "projects": [
            {"name": "Blog Application", "description": "Flask ile basit blog uygulaması", "technologies": ["Flask", "SQLite", "Bootstrap"]},
            {"name": "Todo App", "description": "Yapılacaklar listesi uygulaması", "technologies": ["Python", "Flask", "JavaScript"]}
        ]
    }
]

DEMO_JOBS = [
    {
        "company": "TechCorp İstanbul",
        "title": "Frontend Developer",
        "description": "Modern React uygulamaları geliştirmek için deneyimli frontend developer arıyoruz. TypeScript ve modern CSS framework'leri bilgisi gereklidir.",
        "location": "İstanbul",
        "salary_range": "30000-50000",
        "required_skills": ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
        "hr_email": "hr@techcorp.com"
    },
    {
        "company": "InnovateSoft",
        "title": "Python Backend Developer",
        "description": "Ölçeklenebilir backend servisler geliştirmek için Python developer arıyoruz. FastAPI ve veritabanı yönetimi deneyimi önemlidir.",
        "location": "Ankara",
        "salary_range": "35000-55000",
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"],
        "hr_email": "hr@innovatesoft.com"
    },
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
        "company": "WebSolutions",
        "title": "Full Stack Developer",
        "description": "Vue.js ve Node.js ile full stack web uygulamaları geliştirmek için developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "38000-58000",
        "required_skills": ["Vue.js", "Node.js", "MongoDB", "Express"],
        "hr_email": "hr@websolutions.com"
    },
    {
        "company": "DataCorp",
        "title": "Angular Developer",
        "description": "Enterprise düzeyinde Angular uygulamaları geliştirmek için deneyimli developer arıyoruz.",
        "location": "Bursa",
        "salary_range": "28000-42000",
        "required_skills": ["Angular", "TypeScript", "RxJS", "NgRx"],
        "hr_email": "hr@datacorp.com"
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
        "company": "FlutterWorks",
        "title": "Flutter Developer",
        "description": "Cross-platform mobil uygulamalar geliştirmek için Flutter uzmanı arıyoruz.",
        "location": "İstanbul",
        "salary_range": "40000-60000",
        "required_skills": ["Flutter", "Dart", "iOS", "Android", "Firebase"],
        "hr_email": "hr@flutterworks.com"
    },
    # Data Science & AI pozisyonları
    {
        "company": "AI Research Labs",
        "title": "Data Scientist",
        "description": "Makine öğrenmesi modelleri geliştirmek ve veri analizi yapmak için data scientist arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-70000",
        "required_skills": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-learn", "TensorFlow"],
        "hr_email": "hr@airesearch.com"
    },
    {
        "company": "DeepTech Solutions",
        "title": "Machine Learning Engineer",
        "description": "ML pipeline'ları tasarlayıp geliştirmek için deneyimli ML engineer arıyoruz.",
        "location": "Ankara",
        "salary_range": "50000-75000",
        "required_skills": ["Python", "TensorFlow", "PyTorch", "Kubernetes", "MLOps", "AWS"],
        "hr_email": "hr@deeptech.com"
    },
    {
        "company": "Analytics Pro",
        "title": "Business Intelligence Analyst",
        "description": "İş zekası raporları ve dashboard'lar geliştirmek için BI uzmanı arıyoruz.",
        "location": "İzmir",
        "salary_range": "25000-40000",
        "required_skills": ["SQL", "Power BI", "Tableau", "Python", "Excel"],
        "hr_email": "hr@analyticspro.com"
    },
    # DevOps & Cloud pozisyonları
    {
        "company": "CloudMasters",
        "title": "DevOps Engineer",
        "description": "CI/CD pipeline'ları ve cloud altyapısı yönetimi için DevOps engineer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "42000-65000",
        "required_skills": ["Docker", "Kubernetes", "Jenkins", "AWS", "Terraform", "Linux"],
        "hr_email": "hr@cloudmasters.com"
    },
    {
        "company": "Infrastructure Co",
        "title": "Cloud Architect",
        "description": "Kurumsal cloud mimarisi tasarlamak için deneyimli cloud architect arıyoruz.",
        "location": "Ankara",
        "salary_range": "55000-80000",
        "required_skills": ["AWS", "Azure", "Google Cloud", "Terraform", "Docker", "Microservices"],
        "hr_email": "hr@infrastructure.com"
    },
    {
        "company": "SecureOps",
        "title": "Site Reliability Engineer",
        "description": "Sistem güvenilirliği ve performans optimizasyonu için SRE arıyoruz.",
        "location": "İzmir",
        "salary_range": "40000-60000",
        "required_skills": ["Linux", "Python", "Monitoring", "Grafana", "Prometheus", "Kubernetes"],
        "hr_email": "hr@secureops.com"
    },
    # Product & Design pozisyonları
    {
        "company": "DesignHub",
        "title": "UI/UX Designer",
        "description": "Kullanıcı deneyimi tasarımı ve arayüz geliştirme için UI/UX designer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "25000-45000",
        "required_skills": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
        "hr_email": "hr@designhub.com"
    },
    {
        "company": "ProductVision",
        "title": "Product Manager",
        "description": "Teknoloji ürünlerinin product management'ı için deneyimli PM arıyoruz.",
        "location": "Ankara",
        "salary_range": "35000-55000",
        "required_skills": ["Product Management", "Agile", "Analytics", "User Research", "Roadmap Planning"],
        "hr_email": "hr@productvision.com"
    },
    {
        "company": "UXExperts",
        "title": "UX Researcher",
        "description": "Kullanıcı araştırmaları ve deneyim analizleri için UX researcher arıyoruz.",
        "location": "İzmir",
        "salary_range": "30000-50000",
        "required_skills": ["User Research", "Usability Testing", "Analytics", "Survey Design", "A/B Testing"],
        "hr_email": "hr@uxexperts.com"
    },
    # QA & Testing pozisyonları
    {
        "company": "QualityFirst",
        "title": "QA Engineer",
        "description": "Manual ve otomatik test süreçleri için deneyimli QA engineer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "22000-38000",
        "required_skills": ["Test Planning", "Selenium", "API Testing", "Bug Tracking", "Agile"],
        "hr_email": "hr@qualityfirst.com"
    },
    {
        "company": "AutoTest Solutions",
        "title": "Test Automation Engineer",
        "description": "Test otomasyonu framework'leri geliştirmek için automation engineer arıyoruz.",
        "location": "Ankara",
        "salary_range": "28000-45000",
        "required_skills": ["Selenium", "Cypress", "Java", "Python", "REST API", "CI/CD"],
        "hr_email": "hr@autotest.com"
    },
    # Cybersecurity pozisyonları
    {
        "company": "CyberShield",
        "title": "Cybersecurity Analyst",
        "description": "Siber güvenlik tehditleri analizi ve savunma sistemleri için uzman arıyoruz.",
        "location": "İstanbul",
        "salary_range": "35000-55000",
        "required_skills": ["Network Security", "Penetration Testing", "SIEM", "Incident Response"],
        "hr_email": "hr@cybershield.com"
    },
    {
        "company": "SecureNet",
        "title": "Penetration Tester",
        "description": "Güvenlik açıklarını tespit etmek için penetration testing uzmanı arıyoruz.",
        "location": "Ankara",
        "salary_range": "40000-65000",
        "required_skills": ["Ethical Hacking", "Penetration Testing", "Vulnerability Assessment", "Kali Linux"],
        "hr_email": "hr@securenet.com"
    },
    # Blockchain & Fintech
    {
        "company": "CryptoTech",
        "title": "Blockchain Developer",
        "description": "Blockchain uygulamaları ve smart contract geliştirme için developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-70000",
        "required_skills": ["Solidity", "Web3.js", "Ethereum", "Smart Contracts", "JavaScript"],
        "hr_email": "hr@cryptotech.com"
    },
    {
        "company": "FinanceAI",
        "title": "Fintech Developer",
        "description": "Finansal teknoloji ürünleri geliştirmek için fintech developer arıyoruz.",
        "location": "İzmir",
        "salary_range": "38000-58000",
        "required_skills": ["Python", "Django", "Payment APIs", "Financial APIs", "Security"],
        "hr_email": "hr@financeai.com"
    },
    # Game Development
    {
        "company": "GameStudio",
        "title": "Unity Game Developer",
        "description": "Mobile ve PC oyunları geliştirmek için Unity developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "30000-50000",
        "required_skills": ["Unity", "C#", "3D Graphics", "Game Design", "Mobile Development"],
        "hr_email": "hr@gamestudio.com"
    },
    {
        "company": "IndieGames",
        "title": "Game Designer",
        "description": "Oyun mekanikleri ve level tasarımı için game designer arıyoruz.",
        "location": "Ankara",
        "salary_range": "25000-40000",
        "required_skills": ["Game Design", "Level Design", "Unity", "Photoshop", "Creative Thinking"],
        "hr_email": "hr@indiegames.com"
    },
    # E-commerce & Digital Marketing
    {
        "company": "E-CommerceGiant",
        "title": "E-commerce Developer",
        "description": "Online satış platformları geliştirmek için e-commerce developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "32000-48000",
        "required_skills": ["PHP", "Laravel", "WooCommerce", "Shopify", "Payment Integration"],
        "hr_email": "hr@ecommercegiant.com"
    },
    {
        "company": "DigitalMarket",
        "title": "Digital Marketing Specialist",
        "description": "Dijital pazarlama kampanyaları ve analitik için uzman arıyoruz.",
        "location": "İzmir",
        "salary_range": "20000-35000",
        "required_skills": ["Google Analytics", "SEO", "SEM", "Social Media", "Content Marketing"],
        "hr_email": "hr@digitalmarket.com"
    },
    # Startup pozisyonları
    {
        "company": "TechStartup",
        "title": "Full Stack Startup Developer",
        "description": "Startup ortamında hızlı geliştirme için çok yönlü developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "25000-45000",
        "required_skills": ["React", "Node.js", "Python", "AWS", "Startup Mindset"],
        "hr_email": "hr@techstartup.com"
    },
    {
        "company": "InnovateNow",
        "title": "Technical Lead",
        "description": "Küçük geliştirici ekibini yönetmek için technical lead arıyoruz.",
        "location": "Ankara",
        "salary_range": "45000-65000",
        "required_skills": ["Team Leadership", "Architecture", "React", "Python", "Project Management"],
        "hr_email": "hr@innovatenow.com"
    },
    # Remote pozisyonları
    {
        "company": "RemoteFirst",
        "title": "Remote Frontend Developer",
        "description": "Tamamen uzaktan çalışabileceğiniz frontend developer pozisyonu.",
        "location": "Uzaktan",
        "salary_range": "35000-55000",
        "required_skills": ["React", "TypeScript", "Remote Work", "Communication", "Self-Management"],
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
    print("🚀 Up Hera Demo Veri Oluşturucu")
    print("=" * 50)
    
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
        
        print(f"✅ {len(DEMO_CANDIDATES)} mezun profili kaydedildi")
        print(f"✅ {len(DEMO_JOBS)} iş ilanı kaydedildi")
        print("\n🎯 ÖZET:")
        print("=" * 30)
        print(f"   👩‍💻 {len(DEMO_CANDIDATES)} kadın developer")
        print(f"   💼 {len(DEMO_JOBS)} iş ilanı")
        print(f"   🎨 {len([c for c in DEMO_CANDIDATES if 'UI' in str(c.get('skills', []))])} UI/UX uzmanı")
        print(f"   🤖 {len([c for c in DEMO_CANDIDATES if 'Python' in str(c.get('skills', []))])} Python developer")
        print(f"   📱 {len([c for c in DEMO_CANDIDATES if any(skill in str(c.get('skills', [])) for skill in ['React Native', 'Flutter', 'iOS', 'Android'])])} mobil developer")
        print(f"   ☁️ {len([c for c in DEMO_CANDIDATES if any(skill in str(c.get('skills', [])) for skill in ['AWS', 'Docker', 'Kubernetes'])])} DevOps uzmanı")
        
        print("\n💼 İŞ POZİSYONLARI:")
        print("=" * 30)
        job_types = {}
        for job in DEMO_JOBS:
            category = job['title'].split()[0] if job['title'] else 'Other'
            job_types[category] = job_types.get(category, 0) + 1
        
        for category, count in sorted(job_types.items()):
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
        
        print("\n🎉 Demo veri oluşturma tamamlandı!")
        print("🔗 Backend'i başlatıp http://localhost:8000/docs adresinden API'yi test edebilirsiniz")
        
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