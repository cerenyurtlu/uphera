"""
End-to-End Integration Tests for Up Hera
Complete system testing including:
- Authentication flow
- AI chat integration  
- Job system
- WebSocket real-time features
- Notification system
"""

import pytest
import asyncio
import json
import time
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Import test dependencies
from api.main import app
from api.database import init_db
from api.services.enhanced_ai_service import enhanced_ai_service
from api.services.websocket_service import manager
from api.services.notification_service import notification_service, NotificationType

# Test client
client = TestClient(app)

class TestCompleteUserJourney:
    """Test complete user journey from registration to job application"""
    
    def test_complete_graduate_journey(self):
        """Test complete graduate user journey"""
        
        # 1. Registration
        registration_data = {
            "firstName": "Ayşe",
            "lastName": "Tekniker",
            "email": "ayse.tekniker@uphera.com",
            "password": "AyşeStrong123!",
            "upschoolProgram": "Full Stack Development",
            "experienceLevel": "entry"
        }
        
        register_response = client.post("/api/auth/graduate/register", json=registration_data)
        assert register_response.status_code == 200
        
        register_data = register_response.json()
        assert register_data["success"] is True
        assert "user" in register_data
        
        user_id = register_data["user"]["id"]
        
        # 2. Login
        login_response = client.post("/api/auth/login", json={
            "email": "ayse.tekniker@uphera.com",
            "password": "AyşeStrong123!",
            "user_type": "mezun"
        })
        
        assert login_response.status_code == 200
        login_data = login_response.json()
        assert "access_token" in login_data
        
        auth_headers = {"Authorization": f"Bearer {login_data['access_token']}"}
        
        # 3. Get Profile
        profile_response = client.get("/api/auth/profile", headers=auth_headers)
        assert profile_response.status_code == 200
        
        profile_data = profile_response.json()
        assert profile_data["user"]["email"] == "ayse.tekniker@uphera.com"
        
        # 4. Update Profile
        profile_update = {
            "phone": "+90 555 123 4567",
            "skills": ["React", "Node.js", "Python", "SQL"],
            "experience": "junior",
            "location": "Istanbul",
            "aboutMe": "Passionate full-stack developer",
            "portfolioUrl": "https://aysetech.dev",
            "githubUrl": "https://github.com/aysetech",
            "linkedinUrl": "https://linkedin.com/in/aysetech"
        }
        
        update_response = client.put("/api/auth/profile", json=profile_update, headers=auth_headers)
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["user"]["skills"] == ["React", "Node.js", "Python", "SQL"]
        assert updated_data["user"]["location"] == "Istanbul"
        
        # 5. AI Chat Interaction
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            async def mock_ai_response():
                yield "Merhaba Ayşe! "
                yield "Full-stack developer olarak "
                yield "kariyer hedeflerinizi "
                yield "belirlemek için "
                yield "size yardımcı olabilirim."
            
            mock_chat.return_value = mock_ai_response()
            
            chat_response = client.post("/ai-coach/chat", 
                headers=auth_headers,
                json={
                    "message": "Merhaba, kariyer planlaması konusunda yardıma ihtiyacım var",
                    "context": "career"
                }
            )
            
            assert chat_response.status_code == 200
            chat_data = chat_response.json()
            assert chat_data["success"] is True
            assert "response" in chat_data
        
        # 6. Get Jobs
        jobs_response = client.get("/api/jobs", headers=auth_headers)
        assert jobs_response.status_code == 200
        
        jobs_data = jobs_response.json()
        assert "jobs" in jobs_data
        assert len(jobs_data["jobs"]) > 0
        
        # Pick first job for testing
        first_job = jobs_data["jobs"][0]
        job_id = first_job["id"]
        
        # 7. Get Job Details
        job_detail_response = client.get(f"/api/jobs/{job_id}", headers=auth_headers)
        assert job_detail_response.status_code == 200
        
        job_detail = job_detail_response.json()
        assert job_detail["job"]["id"] == job_id
        
        # 8. Apply to Job
        application_response = client.post(f"/api/jobs/{job_id}/apply", headers=auth_headers)
        assert application_response.status_code == 200
        
        application_data = application_response.json()
        assert application_data["success"] is True
        assert "application" in application_data
        
        # 9. Bookmark Job
        bookmark_response = client.post(f"/api/jobs/{job_id}/bookmark", headers=auth_headers)
        assert bookmark_response.status_code == 200
        
        bookmark_data = bookmark_response.json()
        assert bookmark_data["success"] is True
        
        # 10. Logout
        logout_response = client.post("/api/auth/logout", headers=auth_headers)
        assert logout_response.status_code == 200
        
        logout_data = logout_response.json()
        assert logout_data["success"] is True

class TestAIIntegrationFlow:
    """Test AI chat integration flow"""
    
    @pytest.fixture
    def authenticated_user(self):
        """Create and authenticate a test user"""
        # Register user
        register_response = client.post("/api/auth/graduate/register", json={
            "firstName": "AI",
            "lastName": "Tester",
            "email": "ai.tester@uphera.com",
            "password": "AITest123!",
            "upschoolProgram": "Data Science",
            "experienceLevel": "entry"
        })
        
        # Login
        login_response = client.post("/api/auth/login", json={
            "email": "ai.tester@uphera.com",
            "password": "AITest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        user_id = login_response.json()["user"]["id"]
        
        return {
            "headers": {"Authorization": f"Bearer {token}"},
            "user_id": user_id
        }
    
    def test_ai_conversation_flow(self, authenticated_user):
        """Test complete AI conversation flow"""
        headers = authenticated_user["headers"]
        
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            
            # Test 1: Career guidance
            async def career_response():
                yield "Kariyer planlaması için "
                yield "öncelikle hedeflerinizi "
                yield "netleştirmemiz gerekiyor."
            
            mock_chat.return_value = career_response()
            
            response1 = client.post("/ai-coach/chat",
                headers=headers,
                json={
                    "message": "Kariyer hedeflerimi nasıl belirleyebilirim?",
                    "context": "career"
                }
            )
            
            assert response1.status_code == 200
            assert "Kariyer planlaması" in response1.json()["response"]
            
            # Test 2: Technical skills
            async def technical_response():
                yield "Python ve machine learning "
                yield "alanında uzmanlaşmak "
                yield "harika bir hedef!"
            
            mock_chat.return_value = technical_response()
            
            response2 = client.post("/ai-coach/chat",
                headers=headers,
                json={
                    "message": "Python ve ML alanında uzmanlaşmak istiyorum",
                    "context": "technical"
                }
            )
            
            assert response2.status_code == 200
            assert "Python" in response2.json()["response"]
            
            # Test 3: Interview preparation
            async def interview_response():
                yield "Mülakat için "
                yield "STAR metodunu "
                yield "kullanmanızı öneriyorum."
            
            mock_chat.return_value = interview_response()
            
            response3 = client.post("/ai-coach/chat",
                headers=headers,
                json={
                    "message": "Mülakata nasıl hazırlanmalıyım?",
                    "context": "interview"
                }
            )
            
            assert response3.status_code == 200
            assert "STAR" in response3.json()["response"]
            
            # Verify all calls were made with correct contexts
            assert mock_chat.call_count == 3
            
            calls = mock_chat.call_args_list
            assert calls[0][1]["context"] == "career"
            assert calls[1][1]["context"] == "technical"
            assert calls[2][1]["context"] == "interview"
    
    def test_ai_streaming_conversation(self, authenticated_user):
        """Test AI streaming conversation"""
        headers = authenticated_user["headers"]
        
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            async def streaming_response():
                chunks = [
                    "Streaming ", "test ", "için ", "bu ", "yanıt ", 
                    "parça ", "parça ", "gönderiliyor. ", "Her ", "kelime ", 
                    "ayrı ", "bir ", "chunk ", "olarak ", "geliyor."
                ]
                for chunk in chunks:
                    yield chunk
                    await asyncio.sleep(0.01)
            
            mock_chat.return_value = streaming_response()
            
            response = client.post("/ai-coach/chat/stream",
                headers=headers,
                json={
                    "message": "Streaming testi yap",
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            assert "text/plain" in response.headers["content-type"]
            
            # Parse streaming content
            content = response.text
            lines = content.strip().split('\n')
            data_lines = [line for line in lines if line.startswith('data: ')]
            
            assert len(data_lines) > 10  # Should have multiple chunks
            
            # Verify chunks contain expected words
            all_chunks = []
            for line in data_lines:
                try:
                    json_data = json.loads(line[6:])
                    if 'chunk' in json_data:
                        all_chunks.append(json_data['chunk'])
                except:
                    continue
            
            full_response = ''.join(all_chunks)
            assert "Streaming" in full_response
            assert "chunk" in full_response

class TestWebSocketIntegrationFlow:
    """Test WebSocket integration with the complete system"""
    
    @pytest.fixture
    def authenticated_user(self):
        """Create authenticated user"""
        register_response = client.post("/api/auth/graduate/register", json={
            "firstName": "WebSocket",
            "lastName": "Tester",
            "email": "ws.tester@uphera.com",
            "password": "WSTest123!",
            "upschoolProgram": "Backend Development",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "ws.tester@uphera.com",
            "password": "WSTest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        user_id = login_response.json()["user"]["id"]
        
        return {"headers": {"Authorization": f"Bearer {token}"}, "user_id": user_id}
    
    @pytest.mark.asyncio
    async def test_notification_websocket_flow(self, authenticated_user):
        """Test notification flow via WebSocket"""
        user_id = authenticated_user["user_id"]
        
        # Mock WebSocket connection
        mock_websocket = MagicMock()
        connection_id = await manager.connect(mock_websocket, user_id, "notifications")
        
        # Create notification
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            notification_type=NotificationType.JOB_MATCH,
            title="Yeni İş Eşleşmesi",
            message="Size uygun yeni bir iş bulundu!",
            data={"job_id": "test_job_123", "match_score": 85},
            send_immediately=True
        )
        
        # Verify WebSocket was called
        mock_websocket.send_text.assert_called()
        
        # Verify notification content
        sent_message = json.loads(mock_websocket.send_text.call_args[0][0])
        assert sent_message["type"] == "notification"
        assert "Yeni İş Eşleşmesi" in sent_message["notification"]["title"]
        
        # Mark as read
        read_success = notification_service.mark_notification_read(notification_id, user_id)
        assert read_success
        
        # Cleanup
        manager.disconnect(user_id, connection_id)
    
    @pytest.mark.asyncio
    async def test_real_time_chat_flow(self, authenticated_user):
        """Test real-time chat flow"""
        user_id = authenticated_user["user_id"]
        
        # Setup chat WebSocket
        mock_chat_ws = MagicMock()
        chat_connection_id = await manager.connect(mock_chat_ws, user_id, "chat")
        
        # Join chat room
        manager.join_room(user_id, "general_chat")
        
        # Simulate sending chat message
        from api.services.websocket_service import websocket_service
        
        chat_message = {
            "type": "chat_message",
            "room_id": "general_chat", 
            "content": "Merhaba herkese! Bu bir test mesajıdır."
        }
        
        await websocket_service.handle_message(mock_chat_ws, user_id, chat_message)
        
        # Verify message was handled (broadcasted)
        mock_chat_ws.send_text.assert_called()
        
        # Cleanup
        manager.leave_room(user_id, "general_chat")
        manager.disconnect(user_id, chat_connection_id)

class TestJobSystemIntegration:
    """Test job system integration"""
    
    @pytest.fixture
    def authenticated_user(self):
        """Create authenticated user"""
        register_response = client.post("/api/auth/graduate/register", json={
            "firstName": "Job",
            "lastName": "Seeker", 
            "email": "job.seeker@uphera.com",
            "password": "JobSeek123!",
            "upschoolProgram": "Frontend Development",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "job.seeker@uphera.com",
            "password": "JobSeek123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        user_id = login_response.json()["user"]["id"]
        
        return {"headers": {"Authorization": f"Bearer {token}"}, "user_id": user_id}
    
    def test_job_search_and_application_flow(self, authenticated_user):
        """Test complete job search and application flow"""
        headers = authenticated_user["headers"]
        user_id = authenticated_user["user_id"]
        
        # 1. Search all jobs
        all_jobs_response = client.get("/api/jobs", headers=headers)
        assert all_jobs_response.status_code == 200
        
        all_jobs = all_jobs_response.json()["jobs"]
        assert len(all_jobs) > 0
        
        # 2. Filter jobs by location
        istanbul_jobs_response = client.get("/api/jobs?location=Istanbul", headers=headers)
        assert istanbul_jobs_response.status_code == 200
        
        istanbul_jobs = istanbul_jobs_response.json()["jobs"]
        
        # 3. Filter jobs by experience level
        entry_jobs_response = client.get("/api/jobs?experience_level=entry", headers=headers)
        assert entry_jobs_response.status_code == 200
        
        entry_jobs = entry_jobs_response.json()["jobs"]
        
        # 4. Filter remote jobs
        remote_jobs_response = client.get("/api/jobs?remote=true", headers=headers)
        assert remote_jobs_response.status_code == 200
        
        remote_jobs = remote_jobs_response.json()["jobs"]
        
        # 5. Get specific job details
        if all_jobs:
            job_id = all_jobs[0]["id"]
            
            job_detail_response = client.get(f"/api/jobs/{job_id}", headers=headers)
            assert job_detail_response.status_code == 200
            
            job_detail = job_detail_response.json()["job"]
            assert job_detail["id"] == job_id
            
            # 6. Apply to job
            apply_response = client.post(f"/api/jobs/{job_id}/apply", headers=headers)
            assert apply_response.status_code == 200
            
            application = apply_response.json()["application"]
            assert application["jobId"] == job_id
            assert application["userId"] == user_id
            assert application["status"] == "pending"
            
            # 7. Try to apply again (should fail or return existing)
            apply_again_response = client.post(f"/api/jobs/{job_id}/apply", headers=headers)
            # Should either be 200 (existing) or 409 (conflict)
            assert apply_again_response.status_code in [200, 409]
            
            # 8. Bookmark the job
            bookmark_response = client.post(f"/api/jobs/{job_id}/bookmark", headers=headers)
            assert bookmark_response.status_code == 200
            
            # 9. Try to bookmark again (should succeed)
            bookmark_again_response = client.post(f"/api/jobs/{job_id}/bookmark", headers=headers)
            assert bookmark_again_response.status_code == 200

class TestSystemHealthAndPerformance:
    """Test system health and performance under integration scenarios"""
    
    def test_system_health_under_load(self):
        """Test system health during simulated load"""
        import concurrent.futures
        import time
        
        def make_health_request():
            start_time = time.time()
            response = client.get("/health/detailed")
            end_time = time.time()
            return response.status_code, end_time - start_time, response.json()
        
        # Make 20 concurrent health requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_health_request) for _ in range(20)]
            results = [future.result() for future in futures]
        
        # All should succeed quickly
        for status_code, duration, health_data in results:
            assert status_code == 200
            assert duration < 1.0  # Should complete within 1 second
            assert health_data["status"] == "healthy"
            assert "checks" in health_data
    
    def test_mixed_api_operations_performance(self):
        """Test performance with mixed API operations"""
        # Create test user
        register_response = client.post("/api/auth/graduate/register", json={
            "firstName": "Perf",
            "lastName": "Tester",
            "email": "perf.mixed@uphera.com", 
            "password": "PerfTest123!",
            "upschoolProgram": "Mixed Testing",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "perf.mixed@uphera.com",
            "password": "PerfTest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        def mixed_operations():
            operations_times = []
            
            # Profile operations
            start = time.time()
            client.get("/api/auth/profile", headers=headers)
            operations_times.append(("profile_get", time.time() - start))
            
            # Jobs operations  
            start = time.time()
            jobs_response = client.get("/api/jobs", headers=headers)
            operations_times.append(("jobs_list", time.time() - start))
            
            # AI Chat (mocked)
            with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
                async def quick_response():
                    yield "Quick test response"
                
                mock_chat.return_value = quick_response()
                
                start = time.time()
                client.post("/ai-coach/chat", headers=headers, json={
                    "message": "Performance test",
                    "context": "general"
                })
                operations_times.append(("ai_chat", time.time() - start))
            
            # Health check
            start = time.time()
            client.get("/health/")
            operations_times.append(("health", time.time() - start))
            
            return operations_times
        
        # Run mixed operations
        operation_times = mixed_operations()
        
        # Verify all operations completed quickly
        for operation, duration in operation_times:
            assert duration < 2.0, f"{operation} took too long: {duration}s"
        
        # Total time should be reasonable
        total_time = sum(duration for _, duration in operation_times)
        assert total_time < 5.0, f"Total operation time too long: {total_time}s"

class TestErrorHandlingIntegration:
    """Test error handling across integrated systems"""
    
    def test_auth_error_propagation(self):
        """Test authentication error handling across endpoints"""
        invalid_headers = {"Authorization": "Bearer invalid_token"}
        
        # Test various endpoints with invalid auth
        endpoints_to_test = [
            ("/api/auth/profile", "GET"),
            ("/api/jobs", "GET"),
            ("/ai-coach/chat", "POST"),
            ("/ai-coach/chat/stream", "POST")
        ]
        
        for endpoint, method in endpoints_to_test:
            if method == "GET":
                response = client.get(endpoint, headers=invalid_headers)
            else:
                response = client.post(endpoint, headers=invalid_headers, json={})
            
            assert response.status_code == 401, f"Endpoint {endpoint} should return 401"
    
    def test_validation_error_handling(self):
        """Test validation error handling"""
        # Create valid user for testing
        register_response = client.post("/api/auth/graduate/register", json={
            "firstName": "Valid",
            "lastName": "User",
            "email": "valid.user@uphera.com",
            "password": "ValidPass123!",
            "upschoolProgram": "Testing",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "valid.user@uphera.com",
            "password": "ValidPass123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test various validation errors
        validation_tests = [
            # AI Chat without message
            ("/ai-coach/chat", "POST", {"context": "general"}),
            # Invalid job application
            ("/api/jobs/invalid_job_id/apply", "POST", {}),
            # Invalid profile update
            ("/api/auth/profile", "PUT", {"email": "invalid_email"})
        ]
        
        for endpoint, method, data in validation_tests:
            if method == "POST":
                response = client.post(endpoint, headers=headers, json=data)
            else:
                response = client.put(endpoint, headers=headers, json=data)
            
            # Should return validation error (422) or not found (404)
            assert response.status_code in [422, 404, 400], f"Endpoint {endpoint} should return validation error"

# Test configuration
@pytest.fixture(scope="session", autouse=True)
def setup_integration_tests():
    """Setup for integration tests"""
    # Initialize database
    init_db()
    
    # Setup notification service with test DB
    notification_service.db_path = ":memory:"
    notification_service.init_notifications_db()
    
    yield
    
    # Cleanup
    # Clear any remaining WebSocket connections
    if hasattr(manager, 'active_connections'):
        manager.active_connections.clear()
    if hasattr(manager, 'rooms'):
        manager.rooms.clear()

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
