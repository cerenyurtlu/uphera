#!/usr/bin/env python3
"""
Mock data generator for HireHer AI
Usage: python scripts/mock_data.py --candidates 20 --jobs 10
"""

import argparse
import json
import random
from typing import List, Dict, Any
import os
import sys

# Add parent directory to path to import api modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import AsyncSessionLocal
from api.models import Candidate, Job
from api.services.ai_service import AIService

# Mock data
CANDIDATE_NAMES = [
    "Zeynep Kaya", "Ayşe Demir", "Fatma Özkan", "Elif Yılmaz", "Merve Çelik",
    "Selin Arslan", "Büşra Koç", "Esra Şahin", "Derya Özdemir", "Gizem Korkmaz",
    "Seda Yıldız", "Pınar Aydın", "Merve Özkan", "Elif Demir", "Zeynep Çelik",
    "Ayşe Kaya", "Fatma Yılmaz", "Selin Özdemir", "Büşra Arslan", "Esra Koç"
]

COMPANIES = [
    "TechCorp", "InnovateSoft", "DigitalFlow", "CodeCraft", "ByteLogic",
    "DataSphere", "CloudTech", "AI Solutions", "WebWorks", "MobileFirst"
]

JOB_TITLES = [
    "Frontend Developer", "Backend Developer", "Full Stack Developer", 
    "Data Scientist", "DevOps Engineer", "Mobile Developer", "UI/UX Designer",
    "Product Manager", "QA Engineer", "System Administrator"
]

LOCATIONS = [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Remote", "Hybrid"
]

SKILLS = [
    "Python", "JavaScript", "React", "Node.js", "Django", "FastAPI",
    "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Azure",
    "Git", "TypeScript", "Vue.js", "Angular", "Flutter", "React Native",
    "Machine Learning", "Data Analysis", "SQL", "Redis", "Elasticsearch"
]

def generate_candidate_data(name: str) -> Dict[str, Any]:
    """Generate mock candidate data"""
    skills = random.sample(SKILLS, random.randint(3, 8))
    projects = []
    
    for i in range(random.randint(1, 4)):
        project_skills = random.sample(skills, random.randint(1, 3))
        projects.append({
            "name": f"Project {i+1}",
            "description": f"A {random.choice(['web', 'mobile', 'data science', 'machine learning'])} project using {', '.join(project_skills)}",
            "github_url": f"https://github.com/{name.lower().replace(' ', '')}/project{i+1}",
            "technologies": project_skills
        })
    
    return {
        "name": name,
        "email": f"{name.lower().replace(' ', '.')}@example.com",
        "github_url": f"https://github.com/{name.lower().replace(' ', '')}",
        "location": random.choice(LOCATIONS),
        "salary_expectation": random.randint(15000, 45000),
        "skills": skills,
        "projects": projects
    }

def generate_job_data() -> Dict[str, Any]:
    """Generate mock job data"""
    company = random.choice(COMPANIES)
    title = random.choice(JOB_TITLES)
    required_skills = random.sample(SKILLS, random.randint(3, 6))
    
    return {
        "company": company,
        "title": title,
        "description": f"We are looking for a talented {title} to join our team at {company}. This role involves working on cutting-edge projects and collaborating with a diverse team.",
        "location": random.choice(LOCATIONS),
        "salary_range": f"{random.randint(20000, 35000)}-{random.randint(45000, 70000)}",
        "required_skills": required_skills,
        "hr_email": f"hr@{company.lower()}.com"
    }

async def create_mock_data(num_candidates: int, num_jobs: int):
    """Create mock data in database"""
    ai_service = AIService()
    
    async with AsyncSessionLocal() as session:
        # Create candidates
        candidates = []
        for i in range(num_candidates):
            name = CANDIDATE_NAMES[i % len(CANDIDATE_NAMES)]
            candidate_data = generate_candidate_data(name)
            
            candidate = Candidate(**candidate_data)
            session.add(candidate)
            candidates.append(candidate)
        
        await session.commit()
        
        # Create jobs
        jobs = []
        for i in range(num_jobs):
            job_data = generate_job_data()
            
            job = Job(**job_data)
            session.add(job)
            jobs.append(job)
        
        await session.commit()
        
        print(f"Created {len(candidates)} candidates and {len(jobs)} jobs")
        
        # Generate embeddings (this would be done asynchronously in production)
        print("Generating embeddings...")
        for candidate in candidates:
            try:
                await ai_service.generate_candidate_embedding(candidate)
                print(f"Generated embedding for {candidate.name}")
            except Exception as e:
                print(f"Error generating embedding for {candidate.name}: {e}")
        
        for job in jobs:
            try:
                await ai_service.generate_job_embedding(job)
                print(f"Generated embedding for {job.title} at {job.company}")
            except Exception as e:
                print(f"Error generating embedding for {job.title}: {e}")

def save_mock_data_to_json(num_candidates: int, num_jobs: int):
    """Save mock data to JSON files"""
    os.makedirs("data/mock", exist_ok=True)
    
    # Generate candidate data
    candidates = []
    for i in range(num_candidates):
        name = CANDIDATE_NAMES[i % len(CANDIDATE_NAMES)]
        candidates.append(generate_candidate_data(name))
    
    # Generate job data
    jobs = []
    for i in range(num_jobs):
        jobs.append(generate_job_data())
    
    # Save to files
    with open("data/mock/candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, indent=2, ensure_ascii=False)
    
    with open("data/mock/jobs.json", "w", encoding="utf-8") as f:
        json.dump(jobs, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(candidates)} candidates and {len(jobs)} jobs to data/mock/")

async def main():
    parser = argparse.ArgumentParser(description="Generate mock data for HireHer AI")
    parser.add_argument("--candidates", type=int, default=20, help="Number of candidates to create")
    parser.add_argument("--jobs", type=int, default=10, help="Number of jobs to create")
    parser.add_argument("--json-only", action="store_true", help="Only generate JSON files, not database entries")
    
    args = parser.parse_args()
    
    if args.json_only:
        save_mock_data_to_json(args.candidates, args.jobs)
    else:
        await create_mock_data(args.candidates, args.jobs)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 