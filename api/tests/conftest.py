"""
Pytest configuration and fixtures
"""

import pytest
import asyncio
import os
import tempfile
from unittest.mock import patch

from api.database import init_db
from api.services.notification_service import notification_service
from api.services.websocket_service import manager

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Setup test database for all tests"""
    # Use temporary database for tests
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        test_db_path = tmp.name
    
    # Patch database path
    with patch('api.database.DB_PATH', test_db_path):
        init_db()
        yield
    
    # Cleanup
    if os.path.exists(test_db_path):
        os.unlink(test_db_path)

@pytest.fixture(scope="function", autouse=True)
def setup_test_services():
    """Setup services for each test"""
    # Use in-memory database for notifications
    notification_service.db_path = ":memory:"
    notification_service.init_notifications_db()
    
    yield
    
    # Cleanup WebSocket connections
    if hasattr(manager, 'active_connections'):
        manager.active_connections.clear()
    if hasattr(manager, 'rooms'):
        manager.rooms.clear()
    if hasattr(manager, 'connection_meta'):
        manager.connection_meta.clear()

@pytest.fixture
def mock_ai_service():
    """Mock AI service for testing"""
    with patch('api.services.enhanced_ai_service.enhanced_ai_service') as mock:
        async def mock_chat_response(*args, **kwargs):
            yield "Mocked AI response"
        
        mock.enhanced_chat.return_value = mock_chat_response()
        yield mock

@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com",
        "password": "TestPass123!",
        "upschoolProgram": "Full Stack Development",
        "experienceLevel": "entry"
    }

@pytest.fixture
def sample_job_data():
    """Sample job data for testing"""
    return {
        "title": "Senior Python Developer",
        "company": "Tech Corp",
        "location": "Istanbul",
        "remote": True,
        "experienceLevel": "senior",
        "description": "We are looking for a senior Python developer...",
        "requirements": ["Python", "Django", "PostgreSQL"],
        "salary": "15000-25000 TL"
    }
