import asyncio
import json
import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class UserProfile:
    """User profile structure for matching"""
    id: str
    name: str
    skills: List[str]
    experience_years: int = 0
    location: str = ""
    salary_expectation: int = 0
    upschool_batch: str = ""
    projects: List[Dict] = None
    github_repos: int = 0
    linkedin_connections: int = 0

@dataclass 
class JobPosting:
    """Job posting structure for matching"""
    id: str
    title: str
    company: str
    required_skills: List[str]
    location: str = ""
    salary_range: str = ""
    experience_level: str = "junior"  # junior, mid, senior
    company_size: str = "medium"  # startup, small, medium, large
    remote_friendly: bool = False
    urgency: str = "normal"  # normal, urgent, flexible

@dataclass
class MatchResult:
    """Matching result with detailed scoring"""
    job_id: str
    user_id: str
    total_score: float
    skill_match_score: float
    location_score: float
    salary_score: float
    experience_score: float
    cultural_fit_score: float
    confidence: float
    explanation: str
    recommendations: List[str]

class ProfessionalMatchingService:
    """
    Profesyonel iş eşleştirme servisi:
    - Gerçek dünya senaryolarına odaklı
    - Hızlı ve doğru sonuçlar
    - UpSchool mezunları için optimize edilmiş
    """
    
    def __init__(self):
        # Skill normalization ve synonyms
        self.skill_synonyms = {
            "React.js": ["React", "ReactJS", "React JS"],
            "Node.js": ["Node", "NodeJS", "Node JS"],
            "PostgreSQL": ["Postgres", "pg", "PostgreSQL DB"],
            "JavaScript": ["JS", "Javascript", "ECMAScript"],
            "TypeScript": ["TS", "Typescript", "Type Script"],
            "Machine Learning": ["ML", "AI", "Artificial Intelligence"],
            "User Experience": ["UX", "User Experience Design"],
            "User Interface": ["UI", "User Interface Design"],
            "RESTful API": ["REST API", "API", "REST"],
            "CSS3": ["CSS", "Cascading Style Sheets"],
            "HTML5": ["HTML", "HyperText Markup Language"],
            "Git": ["Version Control", "GitHub", "GitLab"],
            "Docker": ["Containerization", "Container"],
            "AWS": ["Amazon Web Services", "Cloud"],
            "Python": ["Python3", "Py"]
        }
        
        # UpSchool program skill map (gerçek müfredat bazlı)
        self.upschool_programs = {
            "Frontend Development": {
                "core_skills": ["React", "JavaScript", "HTML", "CSS", "TypeScript"],
                "bonus_skills": ["Redux", "Next.js", "Tailwind CSS", "Git", "Responsive Design"],
                "job_keywords": ["frontend", "react", "javascript", "web developer", "ui developer"]
            },
            "Backend Development": {
                "core_skills": ["Python", "FastAPI", "Django", "PostgreSQL", "API"],
                "bonus_skills": ["Docker", "Redis", "AWS", "Linux", "Git"],
                "job_keywords": ["backend", "python", "api", "server", "database"]
            },
            "Data Science": {
                "core_skills": ["Python", "Pandas", "NumPy", "SQL", "Machine Learning"],
                "bonus_skills": ["Scikit-learn", "Jupyter", "Matplotlib", "Statistics"],
                "job_keywords": ["data scientist", "data analyst", "ml engineer", "analytics"]
            },
            "Mobile Development": {
                "core_skills": ["React Native", "JavaScript", "Mobile Development"],
                "bonus_skills": ["Firebase", "API Integration", "App Store"],
                "job_keywords": ["mobile", "react native", "app developer", "ios", "android"]
            }
        }
        
        # Experience level mapping (realistic)
        self.experience_levels = {
            "intern": 0,
            "junior": 1,
            "mid": 2,
            "senior": 4,
            "lead": 6
        }
        
        # Turkish cities and regions
        self.city_groups = {
            "istanbul": ["istanbul", "beyoglu", "kadikoy", "besiktas"],
            "ankara": ["ankara", "cankaya", "kizilay"],
            "izmir": ["izmir", "bornova", "konak"],
            "bursa": ["bursa", "osmangazi"],
            "antalya": ["antalya", "muratpasa"]
        }

    def normalize_skill(self, skill: str) -> List[str]:
        """Normalize a skill and return all possible variations"""
        skill_clean = skill.strip().title()
        variations = [skill_clean]
        
        # Add synonyms
        for main_skill, synonyms in self.skill_synonyms.items():
            if skill_clean.lower() in [s.lower() for s in synonyms]:
                variations.append(main_skill)
                variations.extend(synonyms)
            elif skill_clean.lower() == main_skill.lower():
                variations.extend(synonyms)
        
        return list(set(variations))

    def calculate_skill_match(self, user_skills: List[str], job_skills: List[str]) -> Tuple[float, Dict]:
        """Calculate skill match with detailed breakdown"""
        if not user_skills or not job_skills:
            return 0.0, {"matched": [], "missing": job_skills, "extra": user_skills}
        
        # Normalize skills
        user_normalized = []
        for skill in user_skills:
            user_normalized.extend(self.normalize_skill(skill))
        user_normalized = [s.lower() for s in set(user_normalized)]
        
        job_normalized = []
        for skill in job_skills:
            job_normalized.extend(self.normalize_skill(skill))
        job_normalized = [s.lower() for s in set(job_normalized)]
        
        # Find matches
        matched_skills = []
        for job_skill in job_skills:
            job_skill_variations = [s.lower() for s in self.normalize_skill(job_skill)]
            if any(var in user_normalized for var in job_skill_variations):
                matched_skills.append(job_skill)
        
        # Calculate score
        match_ratio = len(matched_skills) / len(job_skills) if job_skills else 0
        
        # Missing skills
        missing_skills = [skill for skill in job_skills if skill not in matched_skills]
        
        # Extra skills (user has but job doesn't require)
        extra_skills = []
        for user_skill in user_skills:
            user_skill_variations = [s.lower() for s in self.normalize_skill(user_skill)]
            if not any(var in job_normalized for var in user_skill_variations):
                extra_skills.append(user_skill)
        
        return match_ratio, {
            "matched": matched_skills,
            "missing": missing_skills,
            "extra": extra_skills[:3],  # Limit to top 3
            "match_count": len(matched_skills),
            "total_required": len(job_skills)
        }

    def calculate_experience_match(self, user_exp: int, job_level: str) -> Tuple[float, str]:
        """Calculate experience compatibility"""
        if job_level.lower() not in self.experience_levels:
            return 0.6, f"Belirsiz deneyim seviyesi: {job_level}"
        
        required_exp = self.experience_levels[job_level.lower()]
        
        if user_exp >= required_exp:
            if user_exp == required_exp:
                return 1.0, "Deneyim seviyesi tam uyumlu"
            elif user_exp <= required_exp + 1:
                return 0.95, "Deneyim seviyesi uygun"
            elif user_exp <= required_exp + 2:
                return 0.8, "Biraz fazla deneyimli ama uygun"
            else:
                return 0.6, "Fazla deneyimli - daha üst pozisyon arayabilir"
        else:
            exp_gap = required_exp - user_exp
            if exp_gap <= 1:
                return 0.7, "Deneyim biraz eksik ama öğrenebilir"
            elif exp_gap <= 2:
                return 0.4, "Deneyim eksikliği var"
            else:
                return 0.2, "Önemli deneyim eksikliği"

    def calculate_location_match(self, user_location: str, job_location: str, remote_friendly: bool = False) -> Tuple[float, str]:
        """Calculate location compatibility"""
        if remote_friendly:
            return 1.0, "Remote pozisyon"
        
        if not user_location or not job_location:
            return 0.5, "Lokasyon bilgisi eksik"
        
        user_loc = user_location.lower().strip()
        job_loc = job_location.lower().strip()
        
        # Exact match
        if user_loc == job_loc:
            return 1.0, f"Aynı şehir: {job_location}"
        
        # City group match (same metropolitan area)
        user_city_group = None
        job_city_group = None
        
        for city_group, cities in self.city_groups.items():
            if any(city in user_loc for city in cities):
                user_city_group = city_group
            if any(city in job_loc for city in cities):
                job_city_group = city_group
        
        if user_city_group and job_city_group:
            if user_city_group == job_city_group:
                return 1.0, f"Aynı bölge: {user_city_group.title()}"
            elif user_city_group in ["istanbul", "ankara", "izmir"] and job_city_group in ["istanbul", "ankara", "izmir"]:
                return 0.6, "Farklı büyük şehirler - taşınma gerekebilir"
            else:
                return 0.3, "Farklı bölgeler"
        
        return 0.4, "Lokasyon uyumsuzluğu"

    def calculate_salary_match(self, user_expectation: int, job_salary_range: str) -> Tuple[float, str]:
        """Calculate salary compatibility"""
        if not job_salary_range or user_expectation <= 0:
            return 0.6, "Maaş bilgisi belirtilmemiş"
        
        if "competitive" in job_salary_range.lower() or "pazarlık" in job_salary_range.lower():
            return 0.7, "Rekabetçi maaş - görüşülebilir"
        
        # Extract salary numbers
        numbers = re.findall(r'\d+', job_salary_range.replace('.', '').replace(',', ''))
        if len(numbers) >= 2:
            try:
                min_salary = int(numbers[0])
                max_salary = int(numbers[1])
                
                # Handle K format
                if 'k' in job_salary_range.lower() or 'bin' in job_salary_range.lower():
                    min_salary *= 1000
                    max_salary *= 1000
                
                if min_salary <= user_expectation <= max_salary:
                    return 1.0, f"Maaş beklentisi aralıkta ({min_salary:,}-{max_salary:,} TL)"
                elif user_expectation < min_salary:
                    diff_ratio = (min_salary - user_expectation) / min_salary
                    if diff_ratio < 0.15:
                        return 0.85, "Maaş beklentisi biraz düşük - büyüme fırsatı"
                    else:
                        return 0.5, "Maaş beklentisi düşük"
                else:  # user_expectation > max_salary
                    diff_ratio = (user_expectation - max_salary) / max_salary
                    if diff_ratio < 0.25:
                        return 0.7, "Maaş beklentisi biraz yüksek - görüşülebilir"
                    else:
                        return 0.3, "Maaş beklentisi çok yüksek"
            except:
                return 0.5, "Maaş aralığı anlaşılamadı"
        
        return 0.5, "Maaş bilgisi net değil"

    def get_upschool_boost(self, user_profile: UserProfile, job: JobPosting) -> float:
        """UpSchool program alignment boost"""
        if not user_profile.upschool_batch:
            return 0.0
        
        # Determine user's program
        user_program = None
        for program_name in self.upschool_programs.keys():
            if program_name.lower() in user_profile.upschool_batch.lower():
                user_program = program_name
                break
        
        if not user_program:
            return 0.05  # General UpSchool boost
        
        # Check job alignment with program
        program_info = self.upschool_programs[user_program]
        job_text = f"{job.title} {' '.join(job.required_skills)}".lower()
        
        keyword_matches = sum(1 for keyword in program_info["job_keywords"] if keyword in job_text)
        
        if keyword_matches > 0:
            return 0.15  # 15% boost for program alignment
        else:
            return 0.05  # 5% general UpSchool boost

    async def match_user_to_jobs(self, user_profile: UserProfile, job_postings: List[JobPosting], limit: int = 10) -> List[MatchResult]:
        """Main matching function - professional and fast"""
        matches = []
        
        for job in job_postings:
            try:
                # Calculate component scores
                skill_score, skill_details = self.calculate_skill_match(
                    user_profile.skills, job.required_skills
                )
                
                exp_score, exp_explanation = self.calculate_experience_match(
                    user_profile.experience_years, job.experience_level
                )
                
                location_score, location_explanation = self.calculate_location_match(
                    user_profile.location, job.location, job.remote_friendly
                )
                
                salary_score, salary_explanation = self.calculate_salary_match(
                    user_profile.salary_expectation, job.salary_range
                )
                
                # Calculate weighted total (skill-heavy for entry level)
                total_score = (
                    skill_score * 0.45 +      # Skills most important
                    exp_score * 0.25 +        # Experience important
                    location_score * 0.20 +   # Location practical concern
                    salary_score * 0.10       # Salary often negotiable
                )
                
                # UpSchool boost
                upschool_boost = self.get_upschool_boost(user_profile, job)
                total_score = min(1.0, total_score + upschool_boost)
                
                # Cultural fit (default good for UpSchool grads)
                cultural_fit = 0.8
                
                # Confidence based on data completeness
                data_completeness = sum([
                    1.0 if user_profile.skills else 0.0,
                    1.0 if user_profile.experience_years >= 0 else 0.0,
                    1.0 if user_profile.location else 0.0,
                    0.8 if user_profile.salary_expectation > 0 else 0.2
                ]) / 4.0
                
                confidence = min(1.0, data_completeness * 0.8 + total_score * 0.2)
                
                # Generate clear explanation
                explanation_parts = [
                    f"Beceri: {skill_score:.0%} ({skill_details['match_count']}/{skill_details['total_required']})",
                    f"Deneyim: {exp_score:.0%}",
                    f"Lokasyon: {location_score:.0%}",
                    f"Maaş: {salary_score:.0%}"
                ]
                
                if upschool_boost > 0:
                    explanation_parts.append(f"UpSchool avantajı (+{upschool_boost:.0%})")
                
                explanation = " | ".join(explanation_parts)
                
                # Generate practical recommendations
                recommendations = []
                
                if skill_details['missing'] and len(skill_details['missing']) <= 3:
                    recommendations.append(f"Öğrenilecek: {', '.join(skill_details['missing'])}")
                elif skill_details['missing']:
                    recommendations.append("Eksik beceriler var - detayları incele")
                
                if exp_score < 0.6:
                    recommendations.append("GitHub projelerin ve bootcamp çalışmalarını öne çıkar")
                
                if location_score < 0.6 and not job.remote_friendly:
                    recommendations.append("Remote seçenekleri araştır")
                
                if total_score >= 0.8:
                    recommendations.append("Mükemmel eşleşme - hemen başvur!")
                elif total_score >= 0.6:
                    recommendations.append("İyi eşleşme - başvurmaya değer")
                
                matches.append(MatchResult(
                    job_id=job.id,
                    user_id=user_profile.id,
                    total_score=total_score,
                    skill_match_score=skill_score,
                    location_score=location_score,
                    salary_score=salary_score,
                    experience_score=exp_score,
                    cultural_fit_score=cultural_fit,
                    confidence=confidence,
                    explanation=explanation,
                    recommendations=recommendations
                ))
                
            except Exception as e:
                logger.error(f"Error matching job {job.id}: {str(e)}")
                continue
        
        # Sort by total score and return top matches
        matches.sort(key=lambda x: x.total_score, reverse=True)
        return matches[:limit]

# Use the professional service
async def get_enhanced_job_matches(user_profile: Dict, jobs: List[Dict], limit: int = 10) -> List[Dict]:
    """Get professional job matches for a user"""
    user = UserProfile(
        id=user_profile.get('id', 'anonymous'),
        name=user_profile.get('name', 'Unknown'),
        skills=user_profile.get('skills', []),
        experience_years=user_profile.get('experience_years', 0),
        location=user_profile.get('location', ''),
        salary_expectation=user_profile.get('salary_expectation', 0),
        upschool_batch=user_profile.get('upschool_batch', ''),
        projects=user_profile.get('projects', [])
    )
    
    job_postings = []
    for job_data in jobs:
        job = JobPosting(
            id=job_data.get('id', ''),
            title=job_data.get('title', ''),
            company=job_data.get('company', ''),
            required_skills=job_data.get('required_skills', []),
            location=job_data.get('location', ''),
            salary_range=job_data.get('salary_range', ''),
            experience_level=job_data.get('experience_level', 'junior'),
            company_size=job_data.get('company_size', 'medium'),
            remote_friendly=job_data.get('remote_friendly', False),
            urgency=job_data.get('urgency', 'normal')
        )
        job_postings.append(job)
    
    # Use the professional matching service
    professional_service = ProfessionalMatchingService()
    match_results = await professional_service.match_user_to_jobs(user, job_postings, limit)
    
    # Convert to frontend format
    matches = []
    job_data_map = {job['id']: job for job in jobs}
    
    for match_result in match_results:
        job_data = job_data_map.get(match_result.job_id, {})
        
        match_dict = {
            **job_data,
            'match_score': int(match_result.total_score * 100),
            'confidence': int(match_result.confidence * 100),
            'skill_match': int(match_result.skill_match_score * 100),
            'location_match': int(match_result.location_score * 100),
            'salary_match': int(match_result.salary_score * 100),
            'experience_match': int(match_result.experience_score * 100),
            'cultural_fit': int(match_result.cultural_fit_score * 100),
            'explanation': match_result.explanation,
            'recommendations': match_result.recommendations
        }
        
        matches.append(match_dict)
    
    return matches 