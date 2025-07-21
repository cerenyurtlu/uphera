import json
import numpy as np
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_
from models import Candidate, Job, Embedding, Match
from database import AsyncSessionLocal
from services.ai_service import AIService

class MatchingService:
    def __init__(self):
        self.ai_service = AIService()
    
    async def find_matches(self, job_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Find best matching candidates for a job"""
        async with AsyncSessionLocal() as session:
            # Get job and its embedding
            job_query = select(Job).options(selectinload(Job.embeddings)).where(Job.id == job_id)
            job_result = await session.execute(job_query)
            job = job_result.scalar_one_or_none()
            
            if not job:
                return []
            
            # Get job embedding
            job_embedding_query = select(Embedding).where(Embedding.job_id == job_id)
            job_embedding_result = await session.execute(job_embedding_query)
            job_embedding = job_embedding_result.scalar_one_or_none()
            
            if not job_embedding:
                # Generate embedding if not exists
                await self.ai_service.generate_job_embedding(job)
                job_embedding_query = select(Embedding).where(Embedding.job_id == job_id)
                job_embedding_result = await session.execute(job_embedding_query)
                job_embedding = job_embedding_result.scalar_one_or_none()
            
            job_vector = json.loads(job_embedding.embedding_vector)
            
            # Get all candidates with embeddings
            candidates_query = select(Candidate).options(selectinload(Candidate.embeddings))
            candidates_result = await session.execute(candidates_query)
            candidates = candidates_result.scalars().all()
            
            matches = []
            
            for candidate in candidates:
                # Get candidate embedding
                candidate_embedding_query = select(Embedding).where(Embedding.candidate_id == candidate.id)
                candidate_embedding_result = await session.execute(candidate_embedding_query)
                candidate_embedding = candidate_embedding_result.scalar_one_or_none()
                
                if not candidate_embedding:
                    # Generate embedding if not exists
                    await self.ai_service.generate_candidate_embedding(candidate)
                    candidate_embedding_query = select(Embedding).where(Embedding.candidate_id == candidate.id)
                    candidate_embedding_result = await session.execute(candidate_embedding_query)
                    candidate_embedding = candidate_embedding_result.scalar_one_or_none()
                
                if candidate_embedding:
                    candidate_vector = json.loads(candidate_embedding.embedding_vector)
                    
                    # Calculate similarity score
                    base_score = self.ai_service.calculate_similarity(job_vector, candidate_vector)
                    
                    # Apply rule-based boosts
                    final_score = self._apply_rule_boosts(
                        base_score, job, candidate
                    )
                    
                    matches.append({
                        "candidate_id": str(candidate.id),
                        "candidate": candidate,
                        "score": final_score,
                        "base_score": base_score
                    })
            
            # Sort by score and return top matches
            matches.sort(key=lambda x: x["score"], reverse=True)
            return matches[:limit]
    
    def _apply_rule_boosts(self, base_score: float, job: Job, candidate: Candidate) -> float:
        """Apply rule-based boosts to similarity score"""
        score = base_score
        
        # Location match boost
        if job.location and candidate.location:
            if job.location.lower() == candidate.location.lower():
                score += 0.1
        
        # Skill overlap boost
        if job.required_skills and candidate.skills:
            skill_overlap = len(set(job.required_skills) & set(candidate.skills))
            total_required = len(job.required_skills)
            if total_required > 0:
                skill_match_ratio = skill_overlap / total_required
                score += skill_match_ratio * 0.2
        
        # Salary expectation check (penalty if too high)
        if job.salary_range and candidate.salary_expectation:
            # Simple salary range parsing (can be improved)
            try:
                if "-" in job.salary_range:
                    min_salary, max_salary = job.salary_range.split("-")
                    min_salary = int(min_salary.replace(",", "").replace("$", ""))
                    max_salary = int(max_salary.replace(",", "").replace("$", ""))
                    
                    if candidate.salary_expectation > max_salary * 1.2:
                        score -= 0.1
                    elif candidate.salary_expectation <= max_salary:
                        score += 0.05
            except:
                pass
        
        # Project experience boost
        if candidate.projects:
            score += min(len(candidate.projects) * 0.02, 0.1)
        
        return min(score, 1.0)  # Cap at 1.0
    
    async def update_match_feedback(self, match_id: str, status: str, feedback: str = None):
        """Update match status and feedback for re-ranking"""
        async with AsyncSessionLocal() as session:
            match_query = select(Match).where(Match.id == match_id)
            match_result = await session.execute(match_query)
            match = match_result.scalar_one_or_none()
            
            if match:
                match.status = status
                match.feedback = feedback
                await session.commit()
                
                # Here you could trigger re-ranking model training
                # await self._update_ranking_model(match)
    
    async def get_match_statistics(self) -> Dict[str, Any]:
        """Get matching statistics for dashboard"""
        async with AsyncSessionLocal() as session:
            # Total matches
            total_matches_query = select(Match)
            total_matches_result = await session.execute(total_matches_query)
            total_matches = len(total_matches_result.scalars().all())
            
            # Successful hires
            successful_hires_query = select(Match).where(Match.status == "hired")
            successful_hires_result = await session.execute(successful_hires_query)
            successful_hires = len(successful_hires_result.scalars().all())
            
            # Average score
            avg_score_query = select(Match.score)
            avg_scores_result = await session.execute(avg_score_query)
            scores = [row for row in avg_scores_result.scalars().all()]
            avg_score = np.mean(scores) if scores else 0.0
            
            return {
                "total_candidates": 156,  # Mock data
                "total_jobs": 23,  # Mock data
                "total_matches": total_matches,
                "successful_hires": successful_hires,
                "average_match_score": avg_score
            } 