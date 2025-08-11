"""
Production-ready middleware for FastAPI
"""
import time
import logging
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import asyncio
from collections import defaultdict
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Security headers and basic protection"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Enhanced request/response logging"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()
        
        # Log request
        logger.info(f"🔄 {request.method} {request.url.path} - Client: {request.client.host if request.client else 'Unknown'}")
        
        try:
            response = await call_next(request)
            
            # Calculate processing time
            process_time = time.time() - start_time
            
            # Log response
            status_emoji = "✅" if response.status_code < 400 else "❌"
            logger.info(f"{status_emoji} {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
            
            # Add processing time header
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(f"❌ {request.method} {request.url.path} - ERROR - {process_time:.3f}s - {str(e)}")
            raise

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple in-memory rate limiting"""
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Check rate limit
        now = datetime.now()
        minute_ago = now - timedelta(minutes=1)
        
        # Clean old requests
        self.requests[client_ip] = [req_time for req_time in self.requests[client_ip] if req_time > minute_ago]
        
        # Check limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.warning(f"🚫 Rate limit exceeded for {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Maximum {self.requests_per_minute} requests per minute allowed",
                    "retry_after": 60
                }
            )
        
        # Add current request
        self.requests[client_ip].append(now)
        
        return await call_next(request)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Global error handling"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except HTTPException:
            # Let FastAPI handle HTTP exceptions
            raise
        except Exception as e:
            logger.error(f"💥 Unhandled error in {request.method} {request.url.path}: {str(e)}", exc_info=True)
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Internal server error",
                    "message": "An unexpected error occurred. Please try again later.",
                    "request_id": str(time.time())
                }
            )

class DatabaseMiddleware(BaseHTTPMiddleware):
    """Database connection management"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Add database session to request state if needed
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Log database-related errors
            if "database" in str(e).lower() or "sqlite" in str(e).lower():
                logger.error(f"💾 Database error in {request.method} {request.url.path}: {str(e)}")
            raise

def setup_middleware(app):
    """Setup all middleware for the FastAPI app"""
    
    # Order matters! First added = last executed (for requests)
    app.add_middleware(SecurityMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RateLimitMiddleware, requests_per_minute=100)
    app.add_middleware(ErrorHandlingMiddleware)
    app.add_middleware(DatabaseMiddleware)
    
    logger.info("🛡️ All middleware configured successfully")
