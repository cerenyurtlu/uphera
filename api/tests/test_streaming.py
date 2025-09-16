"""
AI Streaming Chat Integration Tests for Up Hera
"""

import pytest
import asyncio
import json
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Import test dependencies  
from ..main import app
from ..services.enhanced_ai_service import enhanced_ai_service

# Test client
client = TestClient(app)

class TestAIStreamingChat:
    """Test AI streaming chat functionality"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers for testing"""
        # Create test user and login
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "Stream",
            "lastName": "Test",
            "email": "streamtest@uphera.com",
            "password": "StreamTest123!",
            "upschoolProgram": "Full Stack Development",
            "experienceLevel": "entry"
        })
        
        # Login to get token
        login_response = client.post("/api/auth/login", json={
            "email": "streamtest@uphera.com", 
            "password": "StreamTest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_non_streaming_chat_endpoint(self, auth_headers):
        """Test non-streaming AI chat endpoint"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Mock the async generator
            async def mock_generator():
                yield "Bu"
                yield " bir"
                yield " test"
                yield " yanıtıdır."
            
            mock_chat.return_value = mock_generator()
            
            response = client.post("/ai-coach/chat", 
                headers=auth_headers,
                json={
                    "message": "Merhaba, nasılsın?",
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            data = response.json()
            
            assert data["success"] is True
            assert "response" in data
            assert "suggestions" in data
            assert len(data["suggestions"]) > 0
            assert data["response"] == "Bu bir test yanıtıdır."
            
            # Verify enhanced_chat was called correctly
            mock_chat.assert_called_once()
            call_args = mock_chat.call_args
            assert call_args[1]["message"] == "Merhaba, nasılsın?"
            assert call_args[1]["context"] == "general"
            assert call_args[1]["use_streaming"] is False
    
    def test_streaming_chat_endpoint(self, auth_headers):
        """Test streaming AI chat endpoint"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Mock the async generator for streaming
            async def mock_streaming_generator():
                chunks = ["Merhaba! ", "Ben ", "Ada, ", "AI ", "koçunuz. ", "Size ", "nasıl ", "yardımcı ", "olabilirim?"]
                for chunk in chunks:
                    yield chunk
                    await asyncio.sleep(0.01)  # Simulate streaming delay
            
            mock_chat.return_value = mock_streaming_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": "AI koçumla tanışmak istiyorum",
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            assert response.headers["content-type"] == "text/plain; charset=utf-8"
            assert "no-cache" in response.headers.get("cache-control", "")
            
            # Read streaming response
            content = response.text
            assert "data: " in content
            
            # Parse streaming chunks
            lines = content.strip().split('\n')
            data_lines = [line for line in lines if line.startswith('data: ')]
            
            assert len(data_lines) > 0
            
            # Verify chunks
            chunks = []
            for line in data_lines:
                try:
                    json_data = json.loads(line[6:])  # Remove 'data: ' prefix
                    if 'chunk' in json_data:
                        chunks.append(json_data['chunk'])
                    elif json_data.get('done'):
                        break
                except json.JSONDecodeError:
                    continue
            
            assert len(chunks) > 0
            full_response = ''.join(chunks)
            assert "Merhaba!" in full_response
            assert "Ada" in full_response
            
            # Verify enhanced_chat was called with streaming=True
            mock_chat.assert_called_once()
            call_args = mock_chat.call_args
            assert call_args[1]["use_streaming"] is True
    
    @pytest.mark.asyncio
    async def test_enhanced_ai_service_streaming(self):
        """Test enhanced AI service streaming functionality"""
        with patch.object(enhanced_ai_service, 'check_ollama_status') as mock_ollama_check:
            with patch.object(enhanced_ai_service, 'chat_with_ollama') as mock_ollama_chat:
                with patch.object(enhanced_ai_service, 'save_chat_history') as mock_save_history:
                    
                    # Mock Ollama as available
                    mock_ollama_check.return_value = True
                    
                    # Mock Ollama streaming response
                    async def mock_ollama_generator():
                        chunks = ["Test ", "streaming ", "response ", "from ", "Ollama"]
                        for chunk in chunks:
                            yield chunk
                            await asyncio.sleep(0.01)
                    
                    mock_ollama_chat.return_value = mock_ollama_generator()
                    
                    # Test streaming
                    chunks = []
                    async for chunk in enhanced_ai_service.enhanced_chat(
                        user_id="test_user",
                        message="Test message",
                        context="general",
                        use_streaming=True
                    ):
                        chunks.append(chunk)
                    
                    # Verify chunks
                    assert len(chunks) == 5
                    assert chunks == ["Test ", "streaming ", "response ", "from ", "Ollama"]
                    
                    # Verify methods were called
                    mock_ollama_check.assert_called_once()
                    mock_ollama_chat.assert_called_once()
                    mock_save_history.assert_called_once()
                    
                    # Verify save_history was called with correct parameters
                    save_call_args = mock_save_history.call_args[0]
                    assert save_call_args[0] == "test_user"  # user_id
                    assert save_call_args[1] == "Test message"  # message
                    assert save_call_args[2] == "Test streaming response from Ollama"  # full response
                    assert save_call_args[3] == "general"  # context
    
    @pytest.mark.asyncio
    async def test_openai_fallback_streaming(self):
        """Test OpenAI fallback when Ollama is unavailable"""
        with patch.object(enhanced_ai_service, 'check_ollama_status') as mock_ollama_check:
            with patch.object(enhanced_ai_service, 'chat_with_openai') as mock_openai_chat:
                with patch.object(enhanced_ai_service, 'save_chat_history') as mock_save_history:
                    
                    # Mock Ollama as unavailable
                    mock_ollama_check.return_value = False
                    
                    # Mock OpenAI response
                    mock_openai_chat.return_value = "OpenAI fallback response"
                    
                    # Test streaming (should fallback to non-streaming)
                    chunks = []
                    async for chunk in enhanced_ai_service.enhanced_chat(
                        user_id="test_user",
                        message="Test fallback",
                        context="general",
                        use_streaming=True
                    ):
                        chunks.append(chunk)
                    
                    # Should get single response from OpenAI
                    assert len(chunks) == 1
                    assert chunks[0] == "OpenAI fallback response"
                    
                    # Verify methods were called
                    mock_ollama_check.assert_called_once()
                    mock_openai_chat.assert_called_once()
                    mock_save_history.assert_called_once()
    
    def test_streaming_error_handling(self, auth_headers):
        """Test error handling in streaming endpoint"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Mock an exception
            async def mock_error_generator():
                yield "Starting response..."
                raise Exception("Simulated AI error")
            
            mock_chat.return_value = mock_error_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": "This will cause an error",
                    "context": "general"
                }
            )
            
            assert response.status_code == 500
            assert "AI stream hatası" in response.json()["detail"]
    
    def test_streaming_unauthorized_access(self):
        """Test streaming endpoint without authentication"""
        response = client.post("/ai-coach/chat/stream",
            json={
                "message": "Unauthorized test",
                "context": "general"
            }
        )
        
        assert response.status_code == 401
    
    def test_invalid_streaming_request(self, auth_headers):
        """Test streaming endpoint with invalid request data"""
        # Missing message field
        response = client.post("/ai-coach/chat/stream",
            headers=auth_headers,
            json={
                "context": "general"
                # Missing "message" field
            }
        )
        
        assert response.status_code == 422  # Validation error

class TestStreamingPerformance:
    """Performance tests for streaming functionality"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "Perf",
            "lastName": "Test",
            "email": "perftest@uphera.com",
            "password": "PerfTest123!",
            "upschoolProgram": "Data Science",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "perftest@uphera.com",
            "password": "PerfTest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_concurrent_streaming_requests(self, auth_headers):
        """Test multiple concurrent streaming requests"""
        import concurrent.futures
        import time
        
        def make_streaming_request():
            with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
                # Quick mock response
                async def quick_generator():
                    for i in range(3):
                        yield f"Chunk {i} "
                
                mock_chat.return_value = quick_generator()
                
                start_time = time.time()
                response = client.post("/ai-coach/chat/stream",
                    headers=auth_headers,
                    json={
                        "message": f"Concurrent test {time.time()}",
                        "context": "general"
                    }
                )
                end_time = time.time()
                
                return response.status_code, end_time - start_time
        
        # Make 5 concurrent requests
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_streaming_request) for _ in range(5)]
            results = [future.result() for future in futures]
        
        # All should succeed
        for status_code, duration in results:
            assert status_code == 200
            assert duration < 2.0  # Should complete quickly
    
    @pytest.mark.asyncio
    async def test_large_streaming_response(self):
        """Test handling of large streaming responses"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Generate large response
            async def large_generator():
                # Simulate 1000 small chunks
                for i in range(1000):
                    yield f"Word{i} "
                    if i % 100 == 0:
                        await asyncio.sleep(0.001)  # Small delay every 100 words
            
            mock_chat.return_value = large_generator()
            
            # Collect all chunks
            chunks = []
            async for chunk in enhanced_ai_service.enhanced_chat(
                user_id="large_test_user",
                message="Generate large response",
                context="general",
                use_streaming=True
            ):
                chunks.append(chunk)
            
            # Verify we got all chunks
            assert len(chunks) == 1000
            
            # Verify content
            full_response = ''.join(chunks)
            assert "Word0 " in full_response
            assert "Word999 " in full_response
    
    def test_streaming_memory_usage(self, auth_headers):
        """Test memory usage during streaming"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make streaming request
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Medium-sized response
            async def memory_test_generator():
                for i in range(500):
                    yield f"Testing memory usage with chunk {i} and some additional text to make it longer. "
            
            mock_chat.return_value = memory_test_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": "Memory test message",
                    "context": "general"
                }
            )
            
            # Consume the entire response
            _ = response.text
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 50MB)
        assert memory_increase < 50 * 1024 * 1024
        
        assert response.status_code == 200

class TestStreamingEdgeCases:
    """Edge case tests for streaming functionality"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = client.post("/api/auth/graduate/register", json={
            "firstName": "Edge",
            "lastName": "Test",
            "email": "edgetest@uphera.com",
            "password": "EdgeTest123!",
            "upschoolProgram": "AI Development",
            "experienceLevel": "entry"
        })
        
        login_response = client.post("/api/auth/login", json={
            "email": "edgetest@uphera.com",
            "password": "EdgeTest123!",
            "user_type": "mezun"
        })
        
        token = login_response.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}
    
    def test_empty_streaming_response(self, auth_headers):
        """Test streaming with empty response"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            # Empty generator
            async def empty_generator():
                return
                yield  # This line won't be reached
            
            mock_chat.return_value = empty_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": "Empty response test",
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            
            # Should still have proper format
            content = response.text
            assert "data: " in content
    
    def test_very_long_message(self, auth_headers):
        """Test streaming with very long input message"""
        # Create a very long message (10KB)
        long_message = "Bu çok uzun bir mesajdır. " * 400  # ~10KB
        
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            async def normal_generator():
                yield "Uzun mesajınızı aldım ve işliyorum."
            
            mock_chat.return_value = normal_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": long_message,
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            
            # Verify the service received the long message
            mock_chat.assert_called_once()
            call_args = mock_chat.call_args
            assert len(call_args[1]["message"]) > 9000
    
    def test_special_characters_streaming(self, auth_headers):
        """Test streaming with special characters and emojis"""
        with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
            async def special_char_generator():
                yield "Merhaba! 👋 "
                yield "Türkçe karakterler: ğüşıöç "
                yield "Özel işaretler: @#$%^&*() "
                yield "Emoji: 🚀 🎯 💼 👩‍💻 ✨"
            
            mock_chat.return_value = special_char_generator()
            
            response = client.post("/ai-coach/chat/stream",
                headers=auth_headers,
                json={
                    "message": "Özel karakterler ve emoji test 🤖",
                    "context": "general"
                }
            )
            
            assert response.status_code == 200
            
            content = response.text
            # Verify special characters are properly encoded
            assert "👋" in content or "\\ud83d\\udc4b" in content  # Either direct or escaped
            assert "ğüşıöç" in content or "\\u" in content  # Turkish characters

# Configuration for async tests
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
