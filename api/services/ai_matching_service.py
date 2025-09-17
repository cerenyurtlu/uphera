"""
AI Job Matching Service
Cosine similarity + rule-based boosts for accurate job matching
"""

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, List, Any, Tuple
import json

class AIMatchingService:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1
        )
        
        # Skill importance weights
        self.skill_weights = {
            'python': 1.2,
            'react': 1.2,
            'javascript': 1.1,
            'typescript': 1.3,
            'node.js': 1.2,
            'django': 1.3,
            'fastapi': 1.3,
            'postgresql': 1.1,
            'mongodb': 1.1,
            'docker': 1.2,
            'kubernetes': 1.3,
            'aws': 1.3,
            'machine learning': 1.4,
            'data science': 1.4,
            'tensorflow': 1.4,
            'pandas': 1.2,
            'numpy': 1.1,
            'react native': 1.3,
            'flutter': 1.3,
            'swift': 1.3,
            'kotlin': 1.3,
            'java': 1.2,
            'c++': 1.2,
            'git': 1.0,
            'agile': 1.0,
            'scrum': 1.0
        }
        
        # Experience level matching
        self.experience_weights = {
            'entry': 1.0,
            'junior': 1.1,
            'mid': 1.2,
            'senior': 1.3,
            'lead': 1.4
        }
        
        # Location preference
        self.location_weights = {
            'istanbul': 1.2,
            'ankara': 1.1,
            'izmir': 1.1,
            'bursa': 1.0,
            'antalya': 1.0,
            'remote': 1.1
        }

    def preprocess_text(self, text: str) -> str:
        """Text preprocessing for better matching"""
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-z0-9\s]', ' ', text)
        
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text

    def calculate_skill_similarity(self, user_skills: List[str], job_requirements: List[str]) -> float:
        """Calculate skill similarity using TF-IDF and cosine similarity"""
        if not user_skills or not job_requirements:
            return 0.0
        
        # Preprocess skills
        user_skills_text = ' '.join([self.preprocess_text(skill) for skill in user_skills])
        job_requirements_text = ' '.join([self.preprocess_text(req) for req in job_requirements])
        
        # Create TF-IDF vectors
        try:
            tfidf_matrix = self.vectorizer.fit_transform([user_skills_text, job_requirements_text])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            return 0.0

    def calculate_skill_boost(self, user_skills: List[str], job_requirements: List[str]) -> float:
        """Calculate skill-based boost using weighted matching"""
        if not user_skills or not job_requirements:
            return 0.0
        
        total_boost = 0.0
        matched_skills = 0
        
        for user_skill in user_skills:
            user_skill_lower = user_skill.lower()
            for req in job_requirements:
                req_lower = req.lower()
                
                # Exact match
                if user_skill_lower == req_lower:
                    weight = self.skill_weights.get(user_skill_lower, 1.0)
                    total_boost += weight
                    matched_skills += 1
                    break
                
                # Partial match
                elif user_skill_lower in req_lower or req_lower in user_skill_lower:
                    weight = self.skill_weights.get(user_skill_lower, 1.0) * 0.7
                    total_boost += weight
                    matched_skills += 0.5
                    break
        
        # Normalize by number of job requirements
        if job_requirements:
            return min(total_boost / len(job_requirements), 1.0)
        return 0.0

    def calculate_experience_match(self, user_experience: str, job_experience: str) -> float:
        """Calculate experience level compatibility"""
        user_weight = self.experience_weights.get(user_experience.lower(), 1.0)
        job_weight = self.experience_weights.get(job_experience.lower(), 1.0)
        
        # User can apply for same or lower level jobs
        if user_weight >= job_weight:
            return 1.0
        else:
            # Penalty for applying to higher level jobs
            return max(0.3, 1.0 - (job_weight - user_weight) * 0.2)

    def calculate_location_match(self, user_location: str, job_location: str, remote_friendly: bool) -> float:
        """Calculate location compatibility"""
        if remote_friendly:
            return 1.0  # Remote jobs are accessible to everyone
        
        user_location_lower = user_location.lower()
        job_location_lower = job_location.lower()
        
        # Exact location match
        if user_location_lower == job_location_lower:
            return 1.0
        
        # Location preference boost
        user_boost = self.location_weights.get(user_location_lower, 1.0)
        job_boost = self.location_weights.get(job_location_lower, 1.0)
        
        # Average of location preferences
        return (user_boost + job_boost) / 2

    def calculate_program_relevance(self, user_program: str, job_title: str, job_description: str) -> float:
        """Calculate bootcamp program relevance to job"""
        program_keywords = {
            'frontend development': ['frontend', 'react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html'],
            'backend development': ['backend', 'python', 'django', 'fastapi', 'node.js', 'express', 'java', 'spring'],
            'data science': ['data', 'machine learning', 'python', 'pandas', 'numpy', 'tensorflow', 'scikit-learn'],
            'mobile development': ['mobile', 'react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
            'full stack development': ['full stack', 'frontend', 'backend', 'react', 'node.js', 'python']
        }
        
        user_program_lower = user_program.lower()
        job_text = f"{job_title} {job_description}".lower()
        
        if user_program_lower in program_keywords:
            keywords = program_keywords[user_program_lower]
            matches = sum(1 for keyword in keywords if keyword in job_text)
            return min(matches / len(keywords), 1.0)
        
        return 0.5  # Default relevance

    def calculate_match_score(self, user_profile: Dict[str, Any], job: Dict[str, Any]) -> float:
        """Calculate comprehensive match score using AI"""
        
        # Extract user data
        user_skills = user_profile.get('skills', [])
        user_experience = user_profile.get('experienceLevel', 'entry')
        user_location = user_profile.get('location', 'Türkiye')
        user_program = user_profile.get('upschoolProgram', 'Data Science')
        
        # Extract job data
        job_requirements = job.get('required_skills', [])
        job_experience = job.get('experience_level', 'entry')
        job_location = job.get('location', 'Türkiye')
        job_title = job.get('title', '')
        job_description = job.get('description', '')
        remote_friendly = job.get('remote_friendly', False)
        
        # Calculate individual scores
        skill_similarity = self.calculate_skill_similarity(user_skills, job_requirements)
        skill_boost = self.calculate_skill_boost(user_skills, job_requirements)
        experience_match = self.calculate_experience_match(user_experience, job_experience)
        location_match = self.calculate_location_match(user_location, job_location, remote_friendly)
        program_relevance = self.calculate_program_relevance(user_program, job_title, job_description)
        
        # Weighted combination
        weights = {
            'skill_similarity': 0.35,
            'skill_boost': 0.25,
            'experience_match': 0.15,
            'location_match': 0.10,
            'program_relevance': 0.15
        }
        
        final_score = (
            skill_similarity * weights['skill_similarity'] +
            skill_boost * weights['skill_boost'] +
            experience_match * weights['experience_match'] +
            location_match * weights['location_match'] +
            program_relevance * weights['program_relevance']
        )
        
        # Convert to percentage and ensure realistic range
        match_percentage = min(max(final_score * 100, 0), 100)
        
        return round(match_percentage, 1)

    def rank_jobs(self, user_profile: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Rank jobs by match score"""
        ranked_jobs = []
        
        for job in jobs:
            match_score = self.calculate_match_score(user_profile, job)
            job_with_score = job.copy()
            job_with_score['match_score'] = match_score
            ranked_jobs.append(job_with_score)
        
        # Sort by match score (highest first)
        ranked_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return ranked_jobs

# Global instance
ai_matcher = AIMatchingService() 