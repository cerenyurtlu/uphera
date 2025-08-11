import json
import numpy as np
from typing import List, Dict, Any
import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from models import Candidate, Job, Embedding
from database import AsyncSessionLocal
import random

class AIService:
    def __init__(self):
        # Mock mode - OpenAI API gerekmez
        self.mock_mode = True
        self.embedding_model = "text-embedding-3-large"
        self.generation_model = "gpt-4o-mini"
    
    async def generate_candidate_embedding(self, candidate: Candidate):
        """Generate embedding for candidate profile (MOCK)"""
        if self.mock_mode:
            # Mock embedding oluştur
            embedding_vector = self._create_mock_embedding()
        else:
            # Gerçek OpenAI API kullanılacaksa
            candidate_text = self._create_candidate_text(candidate)
            # OpenAI API çağrısı burada olacak
            embedding_vector = self._create_mock_embedding()  # Şimdilik mock
        
        # Save to database
        async with AsyncSessionLocal() as session:
            # Mevcut embedding'i kontrol et
            existing_query = select(Embedding).where(Embedding.candidate_id == candidate.id)
            existing_result = await session.execute(existing_query)
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                existing.embedding_vector = json.dumps(embedding_vector)
            else:
                db_embedding = Embedding(
                    candidate_id=candidate.id,
                    embedding_vector=json.dumps(embedding_vector)
                )
                session.add(db_embedding)
            
            await session.commit()
    
    async def generate_job_embedding(self, job: Job):
        """Generate embedding for job description (MOCK)"""
        if self.mock_mode:
            # Mock embedding oluştur
            embedding_vector = self._create_mock_embedding()
        else:
            # Gerçek OpenAI API kullanılacaksa
            job_text = self._create_job_text(job)
            # OpenAI API çağrısı burada olacak
            embedding_vector = self._create_mock_embedding()  # Şimdilik mock
        
        # Save to database
        async with AsyncSessionLocal() as session:
            # Mevcut embedding'i kontrol et
            existing_query = select(Embedding).where(Embedding.job_id == job.id)
            existing_result = await session.execute(existing_query)
            existing = existing_result.scalar_one_or_none()
            
            if existing:
                existing.embedding_vector = json.dumps(embedding_vector)
            else:
                db_embedding = Embedding(
                    job_id=job.id,
                    embedding_vector=json.dumps(embedding_vector)
                )
                session.add(db_embedding)
            
            await session.commit()
    
    async def generate_pitch(self, job: Job, candidate: Candidate) -> str:
        """Generate personalized pitch email (MOCK)"""
        if self.mock_mode:
            return self._create_mock_pitch(job, candidate)
        else:
            # Gerçek OpenAI API kullanılacaksa
            return self._create_mock_pitch(job, candidate)  # Şimdilik mock
    
    def _create_mock_embedding(self) -> List[float]:
        """3072 boyutlu mock embedding vektörü oluştur"""
        return [random.uniform(-0.1, 0.1) for _ in range(3072)]
    
    def _create_mock_pitch(self, job: Job, candidate: Candidate) -> str:
        """Mock personalized pitch oluştur - Up Hera kadınlara yönelik platform"""
        skills_match = []
        if job.required_skills and candidate.skills:
            skills_match = list(set(job.required_skills) & set(candidate.skills))
        
        pitch = f"""Merhaba {job.company} ekibi,

Up Hera ile size mükemmel bir kadın developer adayı öneriyoruz: {candidate.name}! 💪

🌟 Neden {candidate.name} {job.title} pozisyonu için ideal:

✨ Teknik Yetkinlik: {', '.join(skills_match[:3]) if skills_match else 'Güçlü programlama becerilerine'} sahip
📍 Lokasyon: {candidate.location} - {job.location} bölgesinde
💼 Proje Deneyimi: {len(candidate.projects or [])} başarılı proje geliştirdi
🎯 Motivasyon: Teknoloji sektöründe kadın temsiliyetini artırmak için çabalıyor

📊 AI Eşleşme Puanı: %{random.randint(85, 95)}

Up Hera olarak, kadın developer'ların potansiyelini keşfetmek ve onlara hak ettikleri fırsatları sunmak için çalışıyoruz. {candidate.name} gibi yetenekli kadın profesyoneller teknoloji dünyasını daha da güçlendiriyor.

{candidate.name} ile hemen iletişime geçmenizi ve bu fırsatı değerlendirmenizi öneriyoruz.

Kadınların gücüyle,
Up Hera Ekibi 🚀

#WomenInTech #UpHera #DiversityInTech"""
        
        return pitch
    
    def _create_candidate_text(self, candidate: Candidate) -> str:
        """Create text representation of candidate for embedding"""
        text_parts = [
            f"Name: {candidate.name}",
            f"Location: {candidate.location or 'Not specified'}",
            f"Skills: {', '.join(candidate.skills or [])}",
        ]
        
        if candidate.projects:
            for project in candidate.projects:
                text_parts.append(f"Project: {project.get('name', 'Unknown')} - {project.get('description', '')}")
        
        return " ".join(text_parts)
    
    def _create_job_text(self, job: Job) -> str:
        """Create text representation of job for embedding"""
        text_parts = [
            f"Company: {job.company}",
            f"Position: {job.title}",
            f"Location: {job.location or 'Not specified'}",
            f"Required Skills: {', '.join(job.required_skills or [])}",
            f"Description: {job.description or ''}"
        ]
        
        return " ".join(text_parts)
    
    def calculate_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate cosine similarity between two embeddings"""
        vec1 = np.array(embedding1)
        vec2 = np.array(embedding2)
        
        # Normalize vectors
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        # Calculate cosine similarity
        similarity = np.dot(vec1, vec2) / (norm1 * norm2)
        return float(similarity) 