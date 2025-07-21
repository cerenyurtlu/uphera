from pydantic import BaseModel, HttpUrl, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# Base schemas
class CandidateBase(BaseModel):
    name: str
    email: str  # EmailStr yerine str kullanıyoruz
    github_url: Optional[HttpUrl] = None
    location: Optional[str] = None
    salary_expectation: Optional[int] = None
    skills: Optional[List[str]] = []
    projects: Optional[List[Dict[str, Any]]] = []

class JobBase(BaseModel):
    company: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[List[str]] = []
    hr_email: str  # EmailStr yerine str kullanıyoruz

class MatchBase(BaseModel):
    score: float
    status: Optional[str] = "pending"
    feedback: Optional[str] = None

# Create schemas
class CandidateCreate(CandidateBase):
    pass

class JobCreate(JobBase):
    pass

class PitchRequest(BaseModel):
    score: float

# Response schemas
class CandidateResponse(BaseModel):
    id: str  # UUID yerine str kullanıyoruz
    name: str
    email: str
    github_url: Optional[HttpUrl] = None
    location: Optional[str] = None
    salary_expectation: Optional[int] = None
    skills: Optional[List[str]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class JobResponse(BaseModel):
    id: str  # UUID yerine str kullanıyoruz
    company: str
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    required_skills: Optional[List[str]] = []
    hr_email: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

class MatchResponse(BaseModel):
    id: str  # UUID yerine str kullanıyoruz
    job_id: str  # UUID yerine str kullanıyoruz
    candidate_id: str  # UUID yerine str kullanıyoruz
    score: float
    status: str
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Include related data
    candidate: CandidateResponse
    job: JobResponse
    
    model_config = ConfigDict(from_attributes=True)

class EmbeddingResponse(BaseModel):
    id: str  # UUID yerine str kullanıyoruz
    candidate_id: Optional[str] = None  # UUID yerine str kullanıyoruz
    job_id: Optional[str] = None  # UUID yerine str kullanıyoruz
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Dashboard schemas
class DashboardStats(BaseModel):
    total_candidates: int
    total_jobs: int
    total_matches: int
    successful_hires: int
    average_match_score: float

class SkillTrend(BaseModel):
    skill: str
    demand_count: int
    trend_percentage: float

class DashboardResponse(BaseModel):
    stats: DashboardStats
    skill_trends: List[SkillTrend]
    recent_matches: List[MatchResponse] 