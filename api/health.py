"""
Health checks and monitoring endpoints
"""
import time
import psutil
import logging
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends

from .config import settings
from .database_optimized import execute_query, connection_pool
from .auth import get_current_admin_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/health", tags=["health"])

@router.get("/")
async def health_check() -> Dict[str, Any]:
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "Up Hera API",
        "version": "3.0"
    }

@router.get("/detailed")
async def detailed_health_check() -> Dict[str, Any]:
    """Detailed health check with system metrics"""
    
    # Database health
    db_healthy = True
    db_response_time = None
    
    try:
        start_time = time.time()
        execute_query("SELECT 1", fetch_one=True)
        db_response_time = (time.time() - start_time) * 1000  # ms
    except Exception as e:
        db_healthy = False
        logger.error(f"Database health check failed: {e}")
    
    # System metrics
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Connection pool stats
    pool_stats = {
        "size": connection_pool.config.pool_size,
        "available": connection_pool.pool.qsize(),
        "in_use": connection_pool.config.pool_size - connection_pool.pool.qsize()
    }
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": {
                "status": "healthy" if db_healthy else "unhealthy",
                "response_time_ms": db_response_time
            },
            "memory": {
                "status": "healthy" if memory.percent < 85 else "warning",
                "usage_percent": memory.percent,
                "available_gb": round(memory.available / (1024**3), 2)
            },
            "disk": {
                "status": "healthy" if disk.percent < 85 else "warning",
                "usage_percent": disk.percent,
                "free_gb": round(disk.free / (1024**3), 2)
            },
            "connection_pool": {
                "status": "healthy" if pool_stats["available"] > 0 else "warning",
                **pool_stats
            }
        }
    }

@router.get("/metrics")
async def metrics(admin_user: Dict = Depends(get_current_admin_user)) -> Dict[str, Any]:
    """System metrics for monitoring (admin only)"""
    
    # Database metrics
    try:
        user_count = execute_query("SELECT COUNT(*) as count FROM users WHERE is_active = 1", fetch_one=True)["count"]
        job_count = execute_query("SELECT COUNT(*) as count FROM jobs WHERE is_active = 1", fetch_one=True)["count"]
        application_count = execute_query("SELECT COUNT(*) as count FROM applications", fetch_one=True)["count"]
        active_sessions = execute_query("SELECT COUNT(*) as count FROM user_sessions WHERE is_active = 1 AND expires_at > CURRENT_TIMESTAMP", fetch_one=True)["count"]
    except Exception as e:
        logger.error(f"Metrics query failed: {e}")
        user_count = job_count = application_count = active_sessions = 0
    
    # System metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Network metrics (if available)
    try:
        network = psutil.net_io_counters()
        network_stats = {
            "bytes_sent": network.bytes_sent,
            "bytes_recv": network.bytes_recv,
            "packets_sent": network.packets_sent,
            "packets_recv": network.packets_recv
        }
    except:
        network_stats = {}
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "database": {
            "users": user_count,
            "jobs": job_count,
            "applications": application_count,
            "active_sessions": active_sessions
        },
        "system": {
            "cpu_percent": cpu_percent,
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "percent": memory.percent
            },
            "disk": {
                "total_gb": round(disk.total / (1024**3), 2),
                "free_gb": round(disk.free / (1024**3), 2),
                "percent": disk.percent
            },
            "network": network_stats
        },
        "connection_pool": {
            "size": connection_pool.config.pool_size,
            "available": connection_pool.pool.qsize(),
            "in_use": connection_pool.config.pool_size - connection_pool.pool.qsize()
        }
    }

@router.get("/readiness")
async def readiness_check() -> Dict[str, Any]:
    """Kubernetes readiness probe"""
    
    # Check if database is accessible
    try:
        execute_query("SELECT 1", fetch_one=True)
        db_ready = True
    except:
        db_ready = False
    
    # Check if critical services are available
    ready = db_ready
    
    if ready:
        return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}
    else:
        return {"status": "not ready", "timestamp": datetime.utcnow().isoformat()}

@router.get("/liveness")
async def liveness_check() -> Dict[str, Any]:
    """Kubernetes liveness probe"""
    
    # Simple liveness check - if this endpoint responds, the service is alive
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": time.time() - psutil.boot_time()
    }
