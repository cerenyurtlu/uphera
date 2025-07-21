from celery import Celery
import os
from api.services.ai_service import AIService
from api.services.email_service import EmailService
from api.database import AsyncSessionLocal
from api.models import Candidate, Job, Embedding
from sqlalchemy import select
import json

# Celery app configuration
celery_app = Celery(
    "hireher_workers",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# Initialize services
ai_service = AIService()
email_service = EmailService()

@celery_app.task
def generate_candidate_embedding_task(candidate_id: str):
    """Generate embedding for a candidate"""
    try:
        # This would need to be adapted for async context
        # For now, we'll use a sync approach
        print(f"Generating embedding for candidate {candidate_id}")
        
        # In a real implementation, you'd fetch the candidate from DB
        # and generate the embedding asynchronously
        
        return {"status": "success", "candidate_id": candidate_id}
    except Exception as e:
        print(f"Error generating candidate embedding: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def generate_job_embedding_task(job_id: str):
    """Generate embedding for a job"""
    try:
        print(f"Generating embedding for job {job_id}")
        
        # In a real implementation, you'd fetch the job from DB
        # and generate the embedding asynchronously
        
        return {"status": "success", "job_id": job_id}
    except Exception as e:
        print(f"Error generating job embedding: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def send_pitch_email_task(
    to_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    pitch_content: str
):
    """Send pitch email asynchronously"""
    try:
        # This would need to be adapted for async context
        print(f"Sending pitch email to {to_email}")
        
        # In a real implementation, you'd call the email service
        
        return {"status": "success", "email": to_email}
    except Exception as e:
        print(f"Error sending pitch email: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def send_candidate_notification_task(
    candidate_email: str,
    candidate_name: str,
    company_name: str,
    job_title: str
):
    """Send candidate notification asynchronously"""
    try:
        print(f"Sending notification to candidate {candidate_email}")
        
        # In a real implementation, you'd call the email service
        
        return {"status": "success", "email": candidate_email}
    except Exception as e:
        print(f"Error sending candidate notification: {e}")
        return {"status": "error", "error": str(e)}

@celery_app.task
def process_match_feedback_task(match_id: str, status: str, feedback: str = None):
    """Process match feedback for re-ranking"""
    try:
        print(f"Processing feedback for match {match_id}")
        
        # In a real implementation, you'd update the match status
        # and potentially trigger re-ranking model training
        
        return {"status": "success", "match_id": match_id}
    except Exception as e:
        print(f"Error processing match feedback: {e}")
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    celery_app.start() 