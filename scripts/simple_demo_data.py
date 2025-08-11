#!/usr/bin/env python3
"""
Basit Demo Data Script
"""

import sqlite3
import hashlib
from datetime import datetime

def create_demo_data():
    # Database bağlantısı
    conn = sqlite3.connect('uphera.db')
    cursor = conn.cursor()
    
    # Users tablosunu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            user_type TEXT NOT NULL DEFAULT 'mezun',
            upschool_program TEXT,
            graduation_date TEXT,
            skills TEXT,
            experience_level TEXT DEFAULT 'entry',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Demo kullanıcı oluştur
    email = "cerennyurtlu@gmail.com"
    password = "123456"
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute('''
        INSERT OR REPLACE INTO users 
        (email, password_hash, first_name, last_name, user_type, upschool_program, graduation_date, skills, experience_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        email,
        password_hash,
        "Ceren",
        "Yurtlu",
        "mezun",
        "Data Science",
        "2024",
        "Python,SQL,Tableau,Scikit-learn",
        "entry"
    ))
    
    # Jobs tablosunu oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            description TEXT,
            location TEXT,
            salary_range TEXT,
            required_skills TEXT,
            hr_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Demo işler ekle
    demo_jobs = [
        ("Junior Data Analyst", "Trendyol", "Veri analizi ve raporlama", "İstanbul", "25000-35000", "Python,SQL,Excel", "hr@trendyol.com"),
        ("Frontend Developer", "Getir", "React tabanlı web uygulamaları", "İstanbul", "30000-45000", "React,JavaScript,HTML,CSS", "hr@getir.com"),
        ("Backend Developer", "Hepsiburada", "Python/Django API geliştirme", "İstanbul", "35000-50000", "Python,Django,PostgreSQL", "hr@hepsiburada.com"),
        ("Data Scientist", "Spotify", "Makine öğrenmesi modelleri", "İstanbul", "40000-60000", "Python,Scikit-learn,SQL", "hr@spotify.com"),
        ("UI/UX Designer", "Netflix", "Kullanıcı deneyimi tasarımı", "İstanbul", "35000-50000", "Figma,Adobe XD,Prototyping", "hr@netflix.com")
    ]
    
    for job in demo_jobs:
        cursor.execute('''
            INSERT INTO jobs (title, company, description, location, salary_range, required_skills, hr_email)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', job)
    
    # Commit ve kapat
    conn.commit()
    conn.close()
    
    print("✅ Demo data başarıyla oluşturuldu!")
    print(f"📧 Demo kullanıcı: {email}")
    print(f"🔑 Şifre: {password}")

if __name__ == "__main__":
    create_demo_data() 