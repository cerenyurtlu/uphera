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
    },
    
    # SAĞLIK SEKTÖRÜ ADAYLARI
    {
        "name": "Dr. Leyla Korkmaz",
        "email": "leyla.korkmaz@email.com",
        "github_url": "https://github.com/leylakorkmaz",
        "location": "İstanbul",
        "salary_expectation": 45000,
        "skills": ["Healthcare IT", "HL7", "FHIR", "Medical Informatics", "Database Management", "Python"],
        "projects": [
            {"name": "Hasta Veri Analizi", "description": "Hastane hasta verilerinin analizi ve raporlama sistemi", "technologies": ["Python", "Pandas", "HL7", "PostgreSQL"]},
            {"name": "Telemedicine Platform", "description": "Uzaktan hasta takip sistemi", "technologies": ["React", "Node.js", "WebRTC", "FHIR"]}
        ]
    },
    {
        "name": "Sıla Ateş",
        "email": "sila.ates@email.com",
        "github_url": "https://github.com/silaates",
        "location": "Ankara",
        "salary_expectation": 42000,
        "skills": ["Medical Device Software", "C++", "Real-time Systems", "FDA Regulations", "Qt"],
        "projects": [
            {"name": "Kalp Monitörü Yazılımı", "description": "Gerçek zamanlı kalp monitörü cihazı yazılımı", "technologies": ["C++", "Qt", "Real-time OS"]},
            {"name": "Ventilator Control", "description": "Solunum cihazı kontrol sistemi", "technologies": ["Embedded C", "RTOS", "Medical Standards"]}
        ]
    },
    {
        "name": "Elif Demirci",
        "email": "elif.demirci@email.com",
        "github_url": "https://github.com/elifdemirci",
        "location": "İzmir",
        "salary_expectation": 50000,
        "skills": ["Bioinformatics", "Python", "R", "Machine Learning", "Genomics", "Statistics"],
        "projects": [
            {"name": "DNA Sekans Analizi", "description": "Genom verilerinin makine öğrenmesi ile analizi", "technologies": ["Python", "BioPython", "TensorFlow", "R"]},
            {"name": "Drug Discovery Platform", "description": "İlaç keşfi için veri analiz platformu", "technologies": ["Python", "Scikit-learn", "RDKit", "PostgreSQL"]}
        ]
    },
    
    # EĞİTİM SEKTÖRÜ ADAYLARI
    {
        "name": "Öğr. Gör. Nihan Yaşar",
        "email": "nihan.yasar@email.com",
        "github_url": "https://github.com/nihanyasar",
        "location": "İstanbul",
        "salary_expectation": 35000,
        "skills": ["EdTech", "LMS Development", "SCORM", "xAPI", "Vue.js", "Educational Design"],
        "projects": [
            {"name": "Online Sınav Sistemi", "description": "Adaptive testing ile online sınav platformu", "technologies": ["Vue.js", "Node.js", "SCORM", "MongoDB"]},
            {"name": "Virtual Laboratory", "description": "Sanal laboratuvar simülasyon ortamı", "technologies": ["Unity", "WebGL", "Educational Games"]}
        ]
    },
    {
        "name": "Gamze Özdemir",
        "email": "gamze.ozdemir@email.com",
        "github_url": "https://github.com/gamzeozdemir",
        "location": "Ankara",
        "salary_expectation": 38000,
        "skills": ["AR/VR", "Unity", "Educational Technology", "3D Modeling", "Interactive Design"],
        "projects": [
            {"name": "VR Sınıf Ortamı", "description": "Sanal gerçeklik ile immersive öğrenme ortamı", "technologies": ["Unity", "VR SDK", "C#", "Oculus"]},
            {"name": "AR Anatomi Uygulaması", "description": "Artırılmış gerçeklik anatomi öğrenme uygulaması", "technologies": ["Unity", "ARCore", "3D Modeling", "Android"]}
        ]
    },
    {
        "name": "İrem Yıldırım",
        "email": "irem.yildirim@email.com",
        "github_url": "https://github.com/iremyildirim",
        "location": "İzmir",
        "salary_expectation": 40000,
        "skills": ["NLP", "Speech Recognition", "Machine Learning", "Language Processing", "Python"],
        "projects": [
            {"name": "Türkçe Dil Öğrenme AI", "description": "AI destekli Türkçe dil öğrenme asistanı", "technologies": ["Python", "NLP", "Speech Recognition", "TensorFlow"]},
            {"name": "Otomatik Değerlendirme", "description": "Yazılı sınavların otomatik değerlendirme sistemi", "technologies": ["NLP", "BERT", "Python", "Flask"]}
        ]
    },
    
    # FİNANS SEKTÖRÜ ADAYLARI
    {
        "name": "Econ. Seda Köse",
        "email": "seda.kose@email.com",
        "github_url": "https://github.com/sedakose",
        "location": "İstanbul",
        "salary_expectation": 55000,
        "skills": ["Core Banking", "COBOL", "Java", "Oracle", "Financial Systems", "Risk Management"],
        "projects": [
            {"name": "Core Banking Migration", "description": "Legacy banking sisteminin modern mimariye taşınması", "technologies": ["Java", "Oracle", "COBOL", "Spring Boot"]},
            {"name": "Risk Calculation Engine", "description": "Gerçek zamanlı risk hesaplama motoru", "technologies": ["Java", "Oracle", "Apache Kafka", "Redis"]}
        ]
    },
    {
        "name": "CFA Aylin Doğan",
        "email": "aylin.dogan@email.com",
        "github_url": "https://github.com/aylindogan",
        "location": "İstanbul",
        "salary_expectation": 48000,
        "skills": ["Risk Modeling", "Python", "Statistics", "Credit Scoring", "Machine Learning", "Finance"],
        "projects": [
            {"name": "Credit Scoring Model", "description": "Makine öğrenmesi ile kredi risk modelleme", "technologies": ["Python", "Scikit-learn", "XGBoost", "Pandas"]},
            {"name": "Portfolio Optimization", "description": "Portföy optimizasyonu ve risk analizi", "technologies": ["Python", "NumPy", "Scipy", "Financial APIs"]}
        ]
    },
    {
        "name": "Meryem Şener",
        "email": "meryem.sener@email.com",
        "github_url": "https://github.com/meryemsener",
        "location": "Ankara",
        "salary_expectation": 45000,
        "skills": ["Insurance Tech", ".NET", "Actuarial Science", "SQL Server", "Risk Assessment"],
        "projects": [
            {"name": "Sigorta Prim Hesaplama", "description": "Aktuaryal modeller ile prim hesaplama sistemi", "technologies": [".NET Core", "SQL Server", "R", "Actuarial Models"]},
            {"name": "Claims Processing", "description": "Otomatik hasar işleme ve değerlendirme sistemi", "technologies": [".NET", "ML.NET", "Azure", "Computer Vision"]}
        ]
    },
    {
        "name": "Zehra Karaman",
        "email": "zehra.karaman@email.com",
        "github_url": "https://github.com/zehrakaraman",
        "location": "İzmir",
        "salary_expectation": 50000,
        "skills": ["Payment Processing", "PCI DSS", "Cryptography", "Java", "Security", "Blockchain"],
        "projects": [
            {"name": "Secure Payment Gateway", "description": "PCI DSS uyumlu güvenli ödeme gateway'i", "technologies": ["Java", "Spring Security", "Cryptography", "PostgreSQL"]},
            {"name": "Digital Wallet", "description": "Blockchain tabanlı dijital cüzdan", "technologies": ["Java", "Ethereum", "Web3j", "Security"]}
        ]
    },
    
    # PAZARLAMA & İLETİŞİM ADAYLARI
    {
        "name": "Işıl Kaya",
        "email": "isil.kaya@email.com",
        "github_url": "https://github.com/isilkaya",
        "location": "İstanbul",
        "salary_expectation": 35000,
        "skills": ["Marketing Automation", "CRM", "Email Marketing", "Analytics", "Python", "SQL"],
        "projects": [
            {"name": "Customer Journey Analytics", "description": "Müşteri yolculuğu analizi ve optimizasyonu", "technologies": ["Python", "SQL", "Tableau", "Google Analytics"]},
            {"name": "A/B Testing Platform", "description": "Pazarlama kampanyaları için A/B test platformu", "technologies": ["Python", "Django", "Statistics", "JavaScript"]}
        ]
    },
    {
        "name": "Buse Eren",
        "email": "buse.eren@email.com",
        "github_url": "https://github.com/buseeren",
        "location": "Ankara",
        "salary_expectation": 32000,
        "skills": ["Social Media APIs", "Data Analytics", "Sentiment Analysis", "Python", "Visualization"],
        "projects": [
            {"name": "Brand Monitoring", "description": "Sosyal medya marka izleme ve analiz sistemi", "technologies": ["Python", "Twitter API", "NLP", "Sentiment Analysis"]},
            {"name": "Influencer Analytics", "description": "Influencer performans analiz platformu", "technologies": ["Python", "Instagram API", "Data Visualization", "Flask"]}
        ]
    },
    {
        "name": "Duygu Aslan",
        "email": "duygu.aslan@email.com",
        "github_url": "https://github.com/duyguaslan",
        "location": "İzmir",
        "salary_expectation": 38000,
        "skills": ["CMS Development", "WordPress", "Drupal", "PHP", "Content Strategy", "SEO"],
        "projects": [
            {"name": "Enterprise CMS", "description": "Çok dilli enterprise içerik yönetim sistemi", "technologies": ["WordPress", "PHP", "MySQL", "Custom Plugins"]},
            {"name": "SEO Optimization Tool", "description": "Otomatik SEO analizi ve önerileri", "technologies": ["PHP", "WordPress", "Google APIs", "JavaScript"]}
        ]
    },
    
    # LOJİSTİK & ULAŞTIRMA ADAYLARI
    {
        "name": "Sevgi Acar",
        "email": "sevgi.acar@email.com",
        "github_url": "https://github.com/sevgiacar",
        "location": "İstanbul",
        "salary_expectation": 40000,
        "skills": ["Logistics Systems", "RFID", "GPS Tracking", "Java", "Supply Chain", "IoT"],
        "projects": [
            {"name": "Smart Cargo Tracking", "description": "IoT sensörlü akıllı kargo takip sistemi", "technologies": ["Java", "Spring Boot", "IoT", "GPS API"]},
            {"name": "Warehouse Management", "description": "RFID tabanlı depo yönetim sistemi", "technologies": ["Java", "RFID", "PostgreSQL", "REST API"]}
        ]
    },
    {
        "name": "Gül Bayram",
        "email": "gul.bayram@email.com",
        "github_url": "https://github.com/gulbayram",
        "location": "Ankara",
        "salary_expectation": 38000,
        "skills": ["Fleet Management", "GPS", "Route Optimization", "React", "Maps API", "Algorithms"],
        "projects": [
            {"name": "Route Optimization Engine", "description": "AI destekli rota optimizasyon algoritması", "technologies": ["Python", "Google Maps API", "Machine Learning", "Flask"]},
            {"name": "Fleet Dashboard", "description": "Gerçek zamanlı filo takip dashboard'u", "technologies": ["React", "Node.js", "GPS API", "WebSocket"]}
        ]
    },
    
    # ENERJI & ÇEVRE ADAYLARI
    {
        "name": "Ekoloji Uzm. Derya Işık",
        "email": "derya.isik@email.com",
        "github_url": "https://github.com/deryaisik",
        "location": "İstanbul",
        "salary_expectation": 42000,
        "skills": ["Energy Management", "Smart Grid", "IoT", "Renewable Energy", "Python", "Environmental Science"],
        "projects": [
            {"name": "Smart Grid Monitor", "description": "Akıllı şebeke izleme ve analiz sistemi", "technologies": ["Python", "IoT", "Time Series DB", "Machine Learning"]},
            {"name": "Solar Energy Optimizer", "description": "Güneş paneli verimlilik optimizasyonu", "technologies": ["Python", "TensorFlow", "Weather APIs", "IoT Sensors"]}
        ]
    },
    {
        "name": "Çevre Müh. Eda Çelik",
        "email": "eda.celik@email.com",
        "github_url": "https://github.com/edacelik",
        "location": "Ankara",
        "salary_expectation": 38000,
        "skills": ["Environmental Monitoring", "Sensor Networks", "Data Visualization", "GIS", "Python"],
        "projects": [
            {"name": "Air Quality Monitor", "description": "Hava kalitesi izleme sensor ağı", "technologies": ["Python", "IoT", "GIS", "Data Visualization"]},
            {"name": "Water Quality Analysis", "description": "Su kalitesi veri analizi ve erken uyarı sistemi", "technologies": ["Python", "Sensor Data", "Machine Learning", "GIS"]}
        ]
    },
    
    # TARIM & GIDA ADAYLARI
    {
        "name": "Ziraat Müh. Yasemin Özkan",
        "email": "yasemin.ozkan@email.com",
        "github_url": "https://github.com/yaseminozkan",
        "location": "Konya",
        "salary_expectation": 35000,
        "skills": ["AgriTech", "IoT", "Drone Technology", "Satellite Data", "Machine Learning", "Precision Agriculture"],
        "projects": [
            {"name": "Precision Farming", "description": "Drone ve uydu verisi ile hassas tarım", "technologies": ["Python", "Drone APIs", "Satellite Data", "Machine Learning"]},
            {"name": "Crop Monitoring", "description": "IoT sensörlerle mahsul izleme sistemi", "technologies": ["IoT", "Python", "Time Series Analysis", "Mobile App"]}
        ]
    },
    {
        "name": "Gıda Müh. Selma Kartal",
        "email": "selma.kartal@email.com",
        "github_url": "https://github.com/selmakartal",
        "location": "İstanbul",
        "salary_expectation": 38000,
        "skills": ["Food Safety", "Traceability", "Blockchain", "Quality Management", "IoT", "Supply Chain"],
        "projects": [
            {"name": "Food Traceability", "description": "Blockchain tabanlı gıda izlenebilirlik sistemi", "technologies": ["Blockchain", "Ethereum", "Node.js", "Supply Chain"]},
            {"name": "Quality Control IoT", "description": "IoT sensörlerle gıda kalite kontrol sistemi", "technologies": ["IoT", "Python", "Real-time Monitoring", "Database"]}
        ]
    },
    
    # TURİZM & OTELCILIK ADAYLARI
    {
        "name": "Turizm Uzm. Ayşe Güler",
        "email": "ayse.guler@email.com",
        "github_url": "https://github.com/ayseguler",
        "location": "Antalya",
        "salary_expectation": 32000,
        "skills": ["Hospitality Tech", "PMS", "Channel Manager", "PHP", "Booking Systems", "Tourism"],
        "projects": [
            {"name": "Hotel Booking Engine", "description": "Çok kanallı otel rezervasyon motoru", "technologies": ["PHP", "Laravel", "MySQL", "API Integration"]},
            {"name": "Guest Experience App", "description": "Misafir deneyimi mobil uygulaması", "technologies": ["React Native", "Node.js", "Hotel APIs", "Firebase"]}
        ]
    },
    {
        "name": "Seyahat Uzm. Meltem Ak",
        "email": "meltem.ak@email.com",
        "github_url": "https://github.com/meltemak",
        "location": "İstanbul",
        "salary_expectation": 35000,
        "skills": ["Travel Tech", "React Native", "Maps Integration", "Payment Gateway", "User Experience"],
        "projects": [
            {"name": "Travel Planning App", "description": "AI destekli seyahat planlama uygulaması", "technologies": ["React Native", "AI", "Maps API", "Payment Integration"]},
            {"name": "Local Guide Platform", "description": "Yerel rehber eşleştirme platformu", "technologies": ["React", "Node.js", "Geolocation", "Real-time Chat"]}
        ]
    }
]

DEMO_JOBS = [
    # FRONTEND GELİŞTİRME
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
        "company": "ReactWorks",
        "title": "Senior React Developer",
        "description": "Büyük ölçekli React uygulamaları geliştirmek ve takım liderliği yapmak için senior developer arıyoruz.",
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
        "description": "Enterprise düzeyinde Angular uygulamaları geliştirmek için deneyimli developer arıyoruz.",
        "location": "Bursa",
        "salary_range": "28000-42000",
        "required_skills": ["Angular", "TypeScript", "RxJS", "NgRx"],
        "hr_email": "hr@datacorp.com"
    },
    
    # BACKEND GELİŞTİRME
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
        "description": "Native iOS uygulamaları geliştirmek için Swift ve SwiftUI uzmanı arıyoruz.",
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
    
    # FULL STACK GELİŞTİRME
    {
        "company": "WebSolutions",
        "title": "Full Stack Developer",
        "description": "MERN stack ile full stack web uygulamaları geliştirmek için developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "38000-58000",
        "required_skills": ["React", "Node.js", "MongoDB", "Express"],
        "hr_email": "hr@websolutions.com"
    },
    {
        "company": "TechStartup",
        "title": "Full Stack Startup Developer",
        "description": "Startup ortamında hızlı geliştirme için çok yönlü developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "25000-45000",
        "required_skills": ["React", "Node.js", "Python", "AWS", "Startup Mindset"],
        "hr_email": "hr@techstartup.com"
    },
    
    # VERİ BİLİMİ & YAPAY ZEKA
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
        "company": "DataAnalytics",
        "title": "Data Engineer",
        "description": "Büyük veri işleme pipeline'ları ve veri altyapısı geliştirme.",
        "location": "İzmir",
        "salary_range": "40000-60000",
        "required_skills": ["Python", "Apache Spark", "Kafka", "SQL", "Cloud Platforms"],
        "hr_email": "hr@dataanalytics.com"
    },
    {
        "company": "Analytics Pro",
        "title": "Business Intelligence Developer",
        "description": "İş zekası raporları ve dashboard'lar geliştirmek için BI developer arıyoruz.",
        "location": "Ankara",
        "salary_range": "32000-48000",
        "required_skills": ["SQL", "Power BI", "Tableau", "Python", "Data Warehousing"],
        "hr_email": "hr@analyticspro.com"
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
        "company": "CloudNative",
        "title": "Kubernetes Engineer",
        "description": "Container orchestration ve cloud-native uygulamalar için uzman arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-65000",
        "required_skills": ["Kubernetes", "Docker", "Helm", "Istio", "Cloud Platforms"],
        "hr_email": "hr@cloudnative.com"
    },
    {
        "company": "Infrastructure Co",
        "title": "Cloud Solutions Architect",
        "description": "AWS ve Azure cloud çözümleri tasarlamak için deneyimli architect arıyoruz.",
        "location": "Ankara",
        "salary_range": "55000-80000",
        "required_skills": ["AWS", "Azure", "Terraform", "Microservices", "System Design"],
        "hr_email": "hr@infrastructure.com"
    },
    {
        "company": "SecureOps",
        "title": "Site Reliability Engineer",
        "description": "Sistem güvenilirliği ve performans optimizasyonu için SRE arıyoruz.",
        "location": "İzmir",
        "salary_range": "40000-60000",
        "required_skills": ["Linux", "Python", "Monitoring", "Grafana", "Prometheus"],
        "hr_email": "hr@secureops.com"
    },
    
    # UI/UX & PRODUCT DESIGN
    {
        "company": "DesignHub",
        "title": "UI/UX Designer",
        "description": "Teknoloji ürünleri için kullanıcı deneyimi tasarımı ve arayüz geliştirme.",
        "location": "İstanbul",
        "salary_range": "28000-45000",
        "required_skills": ["Figma", "Adobe XD", "Sketch", "Prototyping", "User Research"],
        "hr_email": "hr@designhub.com"
    },
    {
        "company": "ProductTech",
        "title": "Product Manager",
        "description": "Teknoloji ürünlerinin product management'ı için deneyimli PM arıyoruz.",
        "location": "Ankara",
        "salary_range": "40000-60000",
        "required_skills": ["Product Management", "Agile", "Analytics", "Tech Background", "Roadmap Planning"],
        "hr_email": "hr@producttech.com"
    },
    
    # YAZILIM TESTİ & KALİTE
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
        "required_skills": ["Selenium", "Cypress", "Java", "Python", "REST API"],
        "hr_email": "hr@autotest.com"
    },
    
    # SİBER GÜVENLİK
    {
        "company": "CyberShield",
        "title": "Cybersecurity Engineer",
        "description": "Siber güvenlik tehditleri analizi ve savunma sistemleri için uzman arıyoruz.",
        "location": "İstanbul",
        "salary_range": "40000-60000",
        "required_skills": ["Network Security", "Penetration Testing", "SIEM", "Security Tools"],
        "hr_email": "hr@cybershield.com"
    },
    {
        "company": "SecureNet",
        "title": "Security Software Developer",
        "description": "Güvenlik yazılımları ve penetration testing araçları geliştirme.",
        "location": "Ankara",
        "salary_range": "45000-65000",
        "required_skills": ["Python", "Cybersecurity", "Penetration Testing", "Security Protocols"],
        "hr_email": "hr@securenet.com"
    },
    
    # BLOCKCHAIN & FINTECH
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
        "required_skills": ["Python", "Django", "Payment APIs", "Financial Systems", "Security"],
        "hr_email": "hr@financeai.com"
    },
    
    # OYUN GELİŞTİRME
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
        "title": "Game Developer",
        "description": "Indie oyun geliştirme ve gameplay programlama pozisyonu.",
        "location": "Ankara",
        "salary_range": "25000-40000",
        "required_skills": ["Unity", "Unreal Engine", "C#", "Game Logic", "Creative Thinking"],
        "hr_email": "hr@indiegames.com"
    },
    
    # UZAKTAN ÇALIŞMA POZİSYONLARI
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
    },
    
    # TEKNİK LİDERLİK
    {
        "company": "InnovateNow",
        "title": "Technical Lead",
        "description": "Geliştirici ekibini yönetmek için technical lead arıyoruz.",
        "location": "İstanbul",
        "salary_range": "50000-70000",
        "required_skills": ["Team Leadership", "Architecture", "React", "Python", "Project Management"],
        "hr_email": "hr@innovatenow.com"
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
        print(f"   💼 {len(DEMO_JOBS)} teknoloji iş ilanı")
        
        print("\n💼 TEKNOLOJİ POZİSYONLARI:")
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
    },
    
    # EK TEKNOLOJİ POZİSYONLARI
    {
        "company": "TechInnovate",
        "title": "Senior React Developer",
        "description": "Büyük ölçekli React uygulamaları geliştirmek ve takım liderliği yapmak için senior developer arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-65000",
        "required_skills": ["React", "TypeScript", "Redux", "Next.js", "Team Leadership"],
        "hr_email": "hr@techinnovate.com"
    },
    {
        "company": "MobileTech",
        "title": "iOS Developer",
        "description": "Native iOS uygulamaları geliştirmek için Swift ve SwiftUI uzmanı arıyoruz.",
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
    {
        "company": "CloudNative",
        "title": "Kubernetes Engineer",
        "description": "Container orchestration ve cloud-native uygulamalar için uzman arıyoruz.",
        "location": "İstanbul",
        "salary_range": "45000-65000",
        "required_skills": ["Kubernetes", "Docker", "Helm", "Istio", "Cloud Platforms"],
        "hr_email": "hr@cloudnative.com"
    },
    
    # YAZILIM TESTİ & KALİTE  
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
        "company": "Virtual Classroom",
        "title": "Eğitim Teknolojileri Uzmanı",
        "description": "Sanal sınıf teknolojileri ve etkileşimli öğrenme araçları geliştirme.",
        "location": "Ankara",
        "salary_range": "30000-45000",
        "required_skills": ["EdTech", "WebRTC", "AR/VR", "Unity", "Educational Design"],
        "hr_email": "hr@virtualclassroom.com"
    },
    {
        "company": "StudentTracker",
        "title": "Öğrenci Bilgi Sistemi Developer",
        "description": "Okul yönetim sistemleri ve öğrenci takip uygulamaları geliştirme.",
        "location": "Bursa",
        "salary_range": "25000-38000",
        "required_skills": ["Java", "Spring Boot", "Student Information Systems", "PostgreSQL", "REST API"],
        "hr_email": "hr@studenttracker.com"
    },
    {
        "company": "Language Learning Co",
        "title": "Dil Öğrenme App Developer",
        "description": "AI destekli dil öğrenme uygulamaları ve gamification özellikleri.",
        "location": "İzmir",
        "salary_range": "35000-50000",
        "required_skills": ["React Native", "Machine Learning", "NLP", "Gamification", "Speech Recognition"],
        "hr_email": "hr@languagelearning.com"
    },
    
    # FİNANS & BANKACILIK
    {
        "company": "FinanceCore",
        "title": "Bankacılık Yazılım Uzmanı",
        "description": "Core banking sistemleri ve finansal işlemler için yazılım geliştirme.",
        "location": "İstanbul",
        "salary_range": "45000-65000",
        "required_skills": ["Core Banking", "COBOL", "Java", "Oracle", "Financial Systems"],
        "hr_email": "hr@financecore.com"
    },
    {
        "company": "InsureTech",
        "title": "Sigorta Teknolojileri Developer",
        "description": "Sigorta süreçleri otomasyonu ve risk analizi sistemleri geliştirme.",
        "location": "Ankara",
        "salary_range": "38000-55000",
        "required_skills": ["Insurance Tech", ".NET", "Actuarial Science", "SQL Server", "Risk Management"],
        "hr_email": "hr@insuretech.com"
    },
    {
        "company": "CreditAnalytics",
        "title": "Kredi Risk Analisti",
        "description": "Kredi değerlendirme algoritmaları ve risk modelleme çalışmaları.",
        "location": "İstanbul",
        "salary_range": "40000-58000",
        "required_skills": ["Risk Modeling", "Python", "Statistics", "Credit Scoring", "Machine Learning"],
        "hr_email": "hr@creditanalytics.com"
    },
    {
        "company": "PaymentGateway",
        "title": "Ödeme Sistemleri Developer",
        "description": "Güvenli ödeme altyapısı ve PCI DSS uyumlu sistemler geliştirme.",
        "location": "İzmir",
        "salary_range": "42000-60000",
        "required_skills": ["Payment Processing", "PCI DSS", "Cryptography", "Java", "Security"],
        "hr_email": "hr@paymentgateway.com"
    },
    
    # PAZARLAMA & E-TİCARET
    {
        "company": "MarketingAI",
        "title": "Dijital Pazarlama Otomasyonu Uzmanı",
        "description": "Pazarlama otomasyon sistemleri ve müşteri segmentasyon araçları.",
        "location": "İstanbul",
        "salary_range": "32000-48000",
        "required_skills": ["Marketing Automation", "CRM", "Email Marketing", "Analytics", "Python"],
        "hr_email": "hr@marketingai.com"
    },
    {
        "company": "SocialMedia Pro",
        "title": "Sosyal Medya Analytics Developer",
        "description": "Sosyal medya veri analizi ve trend takip sistemleri geliştirme.",
        "location": "Ankara",
        "salary_range": "28000-42000",
        "required_skills": ["Social Media APIs", "Data Analytics", "Sentiment Analysis", "Python", "Visualization"],
        "hr_email": "hr@socialmedia.com"
    },
    {
        "company": "ContentManager",
        "title": "İçerik Yönetim Sistemi Developer",
        "description": "Enterprise içerik yönetimi ve dijital asset management sistemleri.",
        "location": "İzmir",
        "salary_range": "30000-45000",
        "required_skills": ["CMS Development", "WordPress", "Drupal", "PHP", "Content Strategy"],
        "hr_email": "hr@contentmanager.com"
    },
    {
        "company": "RetailTech",
        "title": "E-ticaret Platform Uzmanı",
        "description": "Omnichannel e-ticaret çözümleri ve müşteri deneyimi optimizasyonu.",
        "location": "İstanbul",
        "salary_range": "35000-52000",
        "required_skills": ["E-commerce", "Magento", "Shopify Plus", "API Integration", "Customer Experience"],
        "hr_email": "hr@retailtech.com"
    },
    
    # LOJİSTİK & ULAŞTIRMA
    {
        "company": "LogiTrack",
        "title": "Lojistik Yazılım Developer",
        "description": "Kargo takip sistemleri ve envanter yönetimi uygulamaları geliştirme.",
        "location": "İstanbul",
        "salary_range": "32000-48000",
        "required_skills": ["Logistics Systems", "RFID", "GPS Tracking", "Java", "Supply Chain"],
        "hr_email": "hr@logitrack.com"
    },
    {
        "company": "FleetManagement",
        "title": "Filo Yönetim Sistemi Uzmanı",
        "description": "Araç filo takibi ve route optimization sistemleri geliştirme.",
        "location": "Ankara",
        "salary_range": "30000-45000",
        "required_skills": ["Fleet Management", "GPS", "Route Optimization", "React", "Maps API"],
        "hr_email": "hr@fleetmanagement.com"
    },
    {
        "company": "SmartWarehouse",
        "title": "Depo Otomasyon Developer",
        "description": "Akıllı depo yönetimi ve robotik sistem entegrasyonları.",
        "location": "İzmir",
        "salary_range": "38000-55000",
        "required_skills": ["Warehouse Automation", "IoT", "Robotics", "Python", "Industrial Systems"],
        "hr_email": "hr@smartwarehouse.com"
    },
    
    # İMALAT & ENDÜSTRİ 4.0
    {
        "company": "SmartFactory",
        "title": "Endüstri 4.0 Uzmanı",
        "description": "Akıllı fabrika sistemleri ve IoT tabanlı üretim çözümleri.",
        "location": "İstanbul",
        "salary_range": "42000-60000",
        "required_skills": ["Industry 4.0", "IoT", "PLC Programming", "SCADA", "Industrial Networks"],
        "hr_email": "hr@smartfactory.com"
    },
    {
        "company": "QualityControl Systems",
        "title": "Kalite Kontrol Yazılım Developer",
        "description": "Üretim kalite kontrol sistemleri ve görüntü işleme uygulamaları.",
        "location": "Bursa",
        "salary_range": "35000-50000",
        "required_skills": ["Computer Vision", "Quality Control", "Image Processing", "C++", "Manufacturing"],
        "hr_email": "hr@qualitycontrol.com"
    },
    {
        "company": "ProcessOptimization",
        "title": "Üretim Süreç Analisti",
        "description": "Üretim süreçlerinin optimizasyonu ve veri analizi çalışmaları.",
        "location": "İzmir",
        "salary_range": "38000-52000",
        "required_skills": ["Process Optimization", "Data Analysis", "Lean Manufacturing", "Python", "Statistics"],
        "hr_email": "hr@processopt.com"
    },
    
    # TURİZM & OTELCILIK
    {
        "company": "HotelTech",
        "title": "Otel Yönetim Sistemi Developer",
        "description": "Otel rezervasyon ve müşteri yönetimi sistemleri geliştirme.",
        "location": "Antalya",
        "salary_range": "28000-42000",
        "required_skills": ["Hospitality Tech", "PMS", "Channel Manager", "PHP", "Booking Systems"],
        "hr_email": "hr@hoteltech.com"
    },
    {
        "company": "TravelApp",
        "title": "Seyahat Planlama App Developer",
        "description": "Seyahat rehberi ve tatil planlama uygulamaları geliştirme.",
        "location": "İstanbul",
        "salary_range": "30000-45000",
        "required_skills": ["Travel Tech", "React Native", "Maps Integration", "Payment Gateway", "User Experience"],
        "hr_email": "hr@travelapp.com"
    },
    {
        "company": "TourGuide AI",
        "title": "Turizm AI Uzmanı",
        "description": "AI destekli tur rehberi ve kişiselleştirilmiş seyahat önerileri.",
        "location": "İzmir",
        "salary_range": "35000-50000",
        "required_skills": ["AI", "Recommendation Systems", "NLP", "Tourism", "Machine Learning"],
        "hr_email": "hr@tourguideai.com"
    },
    
    # MEDYA & İLETİŞİM
    {
        "company": "MediaStreaming",
        "title": "Video Streaming Platform Developer",
        "description": "Canlı yayın ve video içerik yönetimi platformları geliştirme.",
        "location": "İstanbul",
        "salary_range": "35000-52000",
        "required_skills": ["Video Streaming", "WebRTC", "CDN", "Node.js", "Media Processing"],
        "hr_email": "hr@mediastreaming.com"
    },
    {
        "company": "NewsAI",
        "title": "Haber İçerik Analizi Uzmanı",
        "description": "Haber metinlerinin otomatik analizi ve içerik kategorizasyonu.",
        "location": "Ankara",
        "salary_range": "32000-48000",
        "required_skills": ["NLP", "Content Analysis", "Text Mining", "Python", "News Processing"],
        "hr_email": "hr@newsai.com"
    },
    {
        "company": "PodcastTech",
        "title": "Podcast Platform Developer",
        "description": "Podcast yayıncılığı ve ses içerik yönetimi platformları.",
        "location": "İzmir",
        "salary_range": "28000-42000",
        "required_skills": ["Audio Processing", "Streaming", "React", "Audio APIs", "Content Management"],
        "hr_email": "hr@podcasttech.com"
    },
    
    # ENERJI & ÇEVRE
    {
        "company": "GreenEnergy Systems",
        "title": "Enerji Yönetim Sistemi Developer",
        "description": "Akıllı enerji ölçüm ve yenilenebilir enerji sistemleri geliştirme.",
        "location": "İstanbul",
        "salary_range": "38000-55000",
        "required_skills": ["Energy Management", "Smart Grid", "IoT", "Renewable Energy", "Python"],
        "hr_email": "hr@greenenergy.com"
    },
    {
        "company": "EnviroMonitor",
        "title": "Çevre İzleme Sistemi Uzmanı",
        "description": "Hava kalitesi ve çevre kirliliği izleme sistemleri geliştirme.",
        "location": "Ankara",
        "salary_range": "32000-48000",
        "required_skills": ["Environmental Monitoring", "Sensor Networks", "Data Visualization", "GIS", "Python"],
        "hr_email": "hr@enviromonitor.com"
    },
    {
        "company": "SolarTech",
        "title": "Güneş Enerji Sistemi Developer",
        "description": "Güneş paneli verimliliği ve enerji üretim optimizasyonu sistemleri.",
        "location": "İzmir",
        "salary_range": "35000-50000",
        "required_skills": ["Solar Energy", "Energy Analytics", "Embedded Systems", "C++", "Power Systems"],
        "hr_email": "hr@solartech.com"
    },
    
    # TARIM & GIDA
    {
        "company": "AgriTech Solutions",
        "title": "Tarım Teknolojileri Developer",
        "description": "Akıllı tarım ve precision farming uygulamaları geliştirme.",
        "location": "Konya",
        "salary_range": "30000-45000",
        "required_skills": ["AgriTech", "IoT", "Drone Technology", "Satellite Data", "Machine Learning"],
        "hr_email": "hr@agritech.com"
    },
    {
        "company": "FoodSafety Tech",
        "title": "Gıda Güvenliği Sistemi Uzmanı",
        "description": "Gıda izlenebilirliği ve kalite kontrol sistemleri geliştirme.",
        "location": "İstanbul",
        "salary_range": "32000-48000",
        "required_skills": ["Food Safety", "Traceability", "Blockchain", "Quality Management", "Regulatory Compliance"],
        "hr_email": "hr@foodsafety.com"
    },
    {
        "company": "VerticalFarm",
        "title": "Dikey Tarım Otomasyon Uzmanı",
        "description": "Kapalı alan tarımı ve otomasyon sistemleri geliştirme.",
        "location": "İzmir",
        "salary_range": "35000-50000",
        "required_skills": ["Vertical Farming", "Automation", "Hydroponics", "Environmental Control", "Python"],
        "hr_email": "hr@verticalfarm.com"
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