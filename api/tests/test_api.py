"""
Comprehensive test suite for Up Hera API
"""
import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json

# Import the app
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from config import settings
from database import init_db, create_user, authenticate_user, hash_password

# Test client
client = TestClient(app)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Setup test database"""
    # Use in-memory database for tests
    settings.DATABASE_URL = "sqlite:///:memory:"
    init_optimized_db()
    
    # Create test user
    test_user_data = {
        "email": "test@uphera.com",
        "password_hash": hash_password("TestPass123!"),
        "firstName": "Test",
        "lastName": "User",
        "upschoolProgram": "Full Stack Development",
        "userType": "mezun"
    }
    
    from api.database_optimized import create_user_optimized
    create_user_optimized(test_user_data)

class TestHealthChecks:
    """Test health check endpoints"""
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Up Hera API" in data["message"]
    
    def test_basic_health_check(self):
        """Test basic health check"""
        response = client.get("/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_detailed_health_check(self):
        """Test detailed health check"""
        response = client.get("/health/detailed")
        assert response.status_code == 200
        data = response.json()
        assert "checks" in data
        assert "database" in data["checks"]
        assert "memory" in data["checks"]

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful login"""
        response = client.post("/api/auth/login", json={
            "email": "test@uphera.com",
            "password": "TestPass123!",
            "user_type": "mezun"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@uphera.com"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = client.post("/api/auth/login", json={
            "email": "test@uphera.com",
            "password": "wrongpassword",
            "user_type": "mezun"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "Invalid email or password" in data["message"]
    
    def test_login_nonexistent_user(self):
        """Test login with non-existent user"""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@uphera.com",
            "password": "TestPass123!",
            "user_type": "mezun"
        })
        
        assert response.status_code == 401
    
    def test_register_success(self):
        """Test successful registration"""
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "New",
            "lastName": "User",
            "email": "newuser@uphera.com",
            "password": "StrongPass123!",
            "upschoolProgram": "Data Science",
            "experienceLevel": "entry"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "user" in data
    
    def test_register_weak_password(self):
        """Test registration with weak password"""
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "Test",
            "lastName": "User",
            "email": "test2@uphera.com",
            "password": "weak",
            "upschoolProgram": "Full Stack",
            "experienceLevel": "entry"
        })
        
        assert response.status_code == 400
        data = response.json()
        assert "Weak password" in data["detail"]["error"]
    
    def test_register_duplicate_email(self):
        """Test registration with existing email"""
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "Another",
            "lastName": "User",
            "email": "test@uphera.com",  # Already exists
            "password": "StrongPass123!",
            "upschoolProgram": "Full Stack",
            "experienceLevel": "entry"
        })
        
        assert response.status_code == 409
        data = response.json()
        assert "already exists" in data["message"]

class TestProfileManagement:
    """Test profile management endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        # Login to get token
        response = client.post("/api/auth/login", json={
            "email": "test@uphera.com",
            "password": "TestPass123!",
            "user_type": "mezun"
        })
        
        token = response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_profile(self, auth_headers):
        """Test getting user profile"""
        response = client.get("/api/auth/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "user" in data
        assert data["user"]["email"] == "test@uphera.com"
    
    def test_get_profile_unauthorized(self):
        """Test getting profile without authentication"""
        response = client.get("/api/auth/profile")
        
        assert response.status_code == 401
    
    def test_update_profile(self, auth_headers):
        """Test updating user profile"""
        update_data = {
            "firstName": "Updated",
            "lastName": "User",
            "phone": "+90 555 123 4567",
            "upschoolProgram": "Full Stack Development",
            "graduationDate": "2024-12-31",
            "skills": ["Python", "JavaScript", "React"],
            "experience": "junior",
            "location": "Istanbul",
            "portfolioUrl": "https://portfolio.example.com",
            "githubUrl": "https://github.com/testuser",
            "linkedinUrl": "https://linkedin.com/in/testuser",
            "aboutMe": "I am a passionate developer"
        }
        
        response = client.put("/api/auth/profile", json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["user"]["firstName"] == "Updated"
        assert data["user"]["skills"] == ["Python", "JavaScript", "React"]
    
    def test_logout(self, auth_headers):
        """Test user logout"""
        response = client.post("/api/auth/logout", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

class TestErrorHandling:
    """Test error handling scenarios"""
    
    def test_404_endpoint(self):
        """Test non-existent endpoint"""
        response = client.get("/api/nonexistent")
        
        assert response.status_code == 404
    
    def test_invalid_json(self):
        """Test invalid JSON input"""
        response = client.post("/api/auth/login", 
                              data="invalid json",
                              headers={"Content-Type": "application/json"})
        
        assert response.status_code == 422
    
    def test_missing_required_fields(self):
        """Test missing required fields"""
        response = client.post("/api/auth/login", json={
            "email": "test@uphera.com"
            # Missing password
        })
        
        assert response.status_code == 422

class TestSecurity:
    """Test security features"""
    
    def test_security_headers(self):
        """Test security headers are present"""
        response = client.get("/")
        
        assert "X-Content-Type-Options" in response.headers
        assert "X-Frame-Options" in response.headers
        assert "X-XSS-Protection" in response.headers
    
    def test_cors_headers(self):
        """Test CORS headers"""
        response = client.options("/api/auth/login",
                                 headers={"Origin": "http://localhost:5173"})
        
        assert response.status_code == 200
        assert "Access-Control-Allow-Origin" in response.headers

class TestPerformance:
    """Test performance and scalability"""
    
    def test_concurrent_requests(self):
        """Test handling concurrent requests"""
        import concurrent.futures
        import time
        
        def make_request():
            start = time.time()
            response = client.get("/health/")
            end = time.time()
            return response.status_code, end - start
        
        # Make 10 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            results = [future.result() for future in futures]
        
        # All requests should succeed
        for status_code, duration in results:
            assert status_code == 200
            assert duration < 1.0  # Should complete within 1 second

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
