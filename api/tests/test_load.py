"""
Load Testing and Performance Tests for Up Hera
High-load scenarios and performance benchmarking
"""

import pytest
import asyncio
import time
import json
import statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import psutil
import os

# Import test dependencies
from ..main import app
from ..services.enhanced_ai_service import enhanced_ai_service
from ..services.websocket_service import manager
from ..services.notification_service import notification_service

# Test client
client = TestClient(app)

class TestHighLoadScenarios:
    """Test system under high load"""
    
    def test_concurrent_user_registrations(self):
        """Test system with many concurrent registrations"""
        def register_user(user_index):
            start_time = time.time()
            
            response = client.post("/api/auth/graduate/register", json={
                "firstName": f"User{user_index}",
                "lastName": "LoadTest",
                "email": f"user{user_index}.loadtest@uphera.com",
                "password": f"LoadTest{user_index}123!",
                "upschoolProgram": "Load Testing Program",
                "experienceLevel": "entry"
            })
            
            end_time = time.time()
            return {
                "user_index": user_index,
                "status_code": response.status_code,
                "response_time": end_time - start_time,
                "success": response.status_code == 200
            }
        
        # Test with 50 concurrent registrations
        num_users = 50
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(register_user, i) for i in range(num_users)]
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze results
        success_count = sum(1 for r in results if r["success"])
        response_times = [r["response_time"] for r in results if r["success"]]
        
        # Assertions
        assert success_count >= num_users * 0.95  # At least 95% success rate
        assert statistics.mean(response_times) < 2.0  # Average response time < 2s
        assert max(response_times) < 5.0  # Max response time < 5s
        
        print(f"✅ Registration Load Test Results:")
        print(f"   Success Rate: {success_count}/{num_users} ({success_count/num_users*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean(response_times):.3f}s")
        print(f"   Max Response Time: {max(response_times):.3f}s")
        print(f"   Min Response Time: {min(response_times):.3f}s")
    
    def test_concurrent_logins(self):
        """Test concurrent login load"""
        # First, create test users
        num_users = 30
        test_users = []
        
        for i in range(num_users):
            email = f"login{i}.loadtest@uphera.com"
            password = f"LoginTest{i}123!"
            
            # Register user
            client.post("/api/auth/graduate/register", json={
                "firstName": f"Login{i}",
                "lastName": "Test",
                "email": email,
                "password": password,
                "upschoolProgram": "Login Testing",
                "experienceLevel": "entry"
            })
            
            test_users.append({"email": email, "password": password})
        
        def login_user(user_data):
            start_time = time.time()
            
            response = client.post("/api/auth/login", json={
                "email": user_data["email"],
                "password": user_data["password"],
                "user_type": "mezun"
            })
            
            end_time = time.time()
            return {
                "email": user_data["email"],
                "status_code": response.status_code,
                "response_time": end_time - start_time,
                "success": response.status_code == 200,
                "has_token": "access_token" in response.json() if response.status_code == 200 else False
            }
        
        # Concurrent logins
        with ThreadPoolExecutor(max_workers=15) as executor:
            futures = [executor.submit(login_user, user) for user in test_users]
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze results
        success_count = sum(1 for r in results if r["success"])
        token_count = sum(1 for r in results if r["has_token"])
        response_times = [r["response_time"] for r in results if r["success"]]
        
        assert success_count >= num_users * 0.95  # 95% success rate
        assert token_count >= num_users * 0.95   # 95% should have tokens
        assert statistics.mean(response_times) < 1.5  # Average < 1.5s
        
        print(f"✅ Login Load Test Results:")
        print(f"   Success Rate: {success_count}/{num_users} ({success_count/num_users*100:.1f}%)")
        print(f"   Token Rate: {token_count}/{num_users} ({token_count/num_users*100:.1f}%)")
        print(f"   Avg Response Time: {statistics.mean(response_times):.3f}s")
    
    def test_concurrent_ai_chat_requests(self):
        """Test AI chat under load"""
        # Create and authenticate test users
        num_users = 20
        authenticated_users = []
        
        for i in range(num_users):
            email = f"chat{i}.loadtest@uphera.com"
            password = f"ChatTest{i}123!"
            
            # Register
            client.post("/api/auth/graduate/register", json={
                "firstName": f"Chat{i}",
                "lastName": "Test",
                "email": email,
                "password": password,
                "upschoolProgram": "Chat Testing",
                "experienceLevel": "entry"
            })
            
            # Login
            login_response = client.post("/api/auth/login", json={
                "email": email,
                "password": password,
                "user_type": "mezun"
            })
            
            if login_response.status_code == 200:
                token = login_response.json()["access_token"]
                authenticated_users.append({
                    "headers": {"Authorization": f"Bearer {token}"},
                    "user_id": f"chat_user_{i}"
                })
        
        def make_ai_chat_request(user_data):
            with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
                # Mock quick AI response
                async def quick_ai_response():
                    yield "Bu bir "
                    yield "load test "
                    yield "yanıtıdır."
                
                mock_chat.return_value = quick_ai_response()
                
                start_time = time.time()
                
                response = client.post("/ai-coach/chat",
                    headers=user_data["headers"],
                    json={
                        "message": "Load test mesajı",
                        "context": "general"
                    }
                )
                
                end_time = time.time()
                
                return {
                    "user_id": user_data["user_id"],
                    "status_code": response.status_code,
                    "response_time": end_time - start_time,
                    "success": response.status_code == 200
                }
        
        # Concurrent AI chat requests
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_ai_chat_request, user) for user in authenticated_users[:num_users]]
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze results
        success_count = sum(1 for r in results if r["success"])
        response_times = [r["response_time"] for r in results if r["success"]]
        
        assert success_count >= len(authenticated_users) * 0.90  # 90% success rate
        if response_times:
            assert statistics.mean(response_times) < 3.0  # Average < 3s
            assert max(response_times) < 10.0  # Max < 10s
        
        print(f"✅ AI Chat Load Test Results:")
        print(f"   Success Rate: {success_count}/{len(authenticated_users)} ({success_count/len(authenticated_users)*100:.1f}%)")
        if response_times:
            print(f"   Avg Response Time: {statistics.mean(response_times):.3f}s")
            print(f"   Max Response Time: {max(response_times):.3f}s")

class TestWebSocketLoadTesting:
    """Load testing for WebSocket connections"""
    
    @pytest.mark.asyncio
    async def test_many_websocket_connections(self):
        """Test many simultaneous WebSocket connections"""
        num_connections = 100
        connections = []
        
        # Create many mock connections
        for i in range(num_connections):
            mock_websocket = MagicMock()
            user_id = f"load_test_user_{i}"
            
            connection_id = await manager.connect(mock_websocket, user_id, "load_test")
            connections.append((user_id, connection_id, mock_websocket))
        
        # Verify all connections are active
        assert len(manager.active_connections) >= num_connections
        
        # Test broadcasting to all connections
        broadcast_message = {
            "type": "load_test",
            "message": "Testing broadcast to many connections",
            "timestamp": time.time()
        }
        
        start_time = time.time()
        
        # Send personal message to all users
        tasks = []
        for user_id, _, _ in connections:
            task = manager.send_personal_message(user_id, broadcast_message)
            tasks.append(task)
        
        await asyncio.gather(*tasks)
        
        end_time = time.time()
        broadcast_time = end_time - start_time
        
        # Should complete quickly even with many connections
        assert broadcast_time < 2.0  # Should complete within 2 seconds
        
        print(f"✅ WebSocket Load Test Results:")
        print(f"   Connections: {num_connections}")
        print(f"   Broadcast Time: {broadcast_time:.3f}s")
        print(f"   Messages/Second: {num_connections/broadcast_time:.1f}")
        
        # Cleanup
        for user_id, connection_id, _ in connections:
            manager.disconnect(user_id, connection_id)
        
        assert len(manager.active_connections) == 0
    
    @pytest.mark.asyncio
    async def test_room_broadcasting_load(self):
        """Test room broadcasting under load"""
        room_id = "load_test_room"
        num_users = 50
        connections = []
        
        # Setup users in the same room
        for i in range(num_users):
            mock_websocket = MagicMock()
            user_id = f"room_load_user_{i}"
            
            connection_id = await manager.connect(mock_websocket, user_id, "room_load")
            manager.join_room(user_id, room_id)
            connections.append((user_id, connection_id))
        
        # Test multiple room broadcasts
        num_broadcasts = 10
        broadcast_times = []
        
        for broadcast_num in range(num_broadcasts):
            message = {
                "type": "load_test_broadcast",
                "broadcast_number": broadcast_num,
                "content": f"Broadcast {broadcast_num} to {num_users} users"
            }
            
            start_time = time.time()
            await manager.broadcast_to_room(room_id, message)
            end_time = time.time()
            
            broadcast_times.append(end_time - start_time)
        
        # Analyze performance
        avg_broadcast_time = statistics.mean(broadcast_times)
        max_broadcast_time = max(broadcast_times)
        
        assert avg_broadcast_time < 0.5  # Average should be < 0.5s
        assert max_broadcast_time < 1.0  # Max should be < 1s
        
        print(f"✅ Room Broadcasting Load Test:")
        print(f"   Room Size: {num_users} users")
        print(f"   Broadcasts: {num_broadcasts}")
        print(f"   Avg Time: {avg_broadcast_time:.3f}s")
        print(f"   Max Time: {max_broadcast_time:.3f}s")
        
        # Cleanup
        for user_id, connection_id in connections:
            manager.leave_room(user_id, room_id)
            manager.disconnect(user_id, connection_id)

class TestMemoryAndResourceUsage:
    """Test memory and resource usage under load"""
    
    def test_memory_usage_during_load(self):
        """Monitor memory usage during heavy operations"""
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Perform memory-intensive operations
        def memory_intensive_operation(index):
            # Register user
            register_response = client.post("/api/auth/graduate/register", json={
                "firstName": f"Memory{index}",
                "lastName": "Test",
                "email": f"memory{index}.test@uphera.com",
                "password": f"MemTest{index}123!",
                "upschoolProgram": "Memory Testing",
                "experienceLevel": "entry"
            })
            
            if register_response.status_code == 200:
                # Login
                login_response = client.post("/api/auth/login", json={
                    "email": f"memory{index}.test@uphera.com",
                    "password": f"MemTest{index}123!",
                    "user_type": "mezun"
                })
                
                if login_response.status_code == 200:
                    token = login_response.json()["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}
                    
                    # Make multiple API calls
                    client.get("/api/auth/profile", headers=headers)
                    client.get("/api/jobs", headers=headers)
                    
                    # AI Chat (mocked)
                    with patch.object(enhanced_ai_service, 'enhanced_chat') as mock_chat:
                        async def memory_response():
                            # Generate medium-sized response
                            for i in range(100):
                                yield f"Memory test word {i} "
                        
                        mock_chat.return_value = memory_response()
                        client.post("/ai-coach/chat", headers=headers, json={
                            "message": "Memory test message",
                            "context": "general"
                        })
            
            return process.memory_info().rss
        
        # Run memory-intensive operations
        num_operations = 25
        memory_measurements = []
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(memory_intensive_operation, i) for i in range(num_operations)]
            
            for future in as_completed(futures):
                memory_measurements.append(future.result())
        
        final_memory = process.memory_info().rss
        max_memory = max(memory_measurements)
        
        memory_increase = final_memory - initial_memory
        peak_increase = max_memory - initial_memory
        
        # Memory should not increase excessively
        assert memory_increase < 200 * 1024 * 1024  # Less than 200MB increase
        assert peak_increase < 300 * 1024 * 1024    # Peak less than 300MB
        
        print(f"✅ Memory Usage Test:")
        print(f"   Initial Memory: {initial_memory / 1024 / 1024:.1f} MB")
        print(f"   Final Memory: {final_memory / 1024 / 1024:.1f} MB")
        print(f"   Max Memory: {max_memory / 1024 / 1024:.1f} MB")
        print(f"   Memory Increase: {memory_increase / 1024 / 1024:.1f} MB")
        print(f"   Peak Increase: {peak_increase / 1024 / 1024:.1f} MB")
    
    def test_cpu_usage_during_load(self):
        """Monitor CPU usage during operations"""
        def cpu_intensive_operation():
            # Health checks
            for _ in range(10):
                client.get("/health/detailed")
            
            # Job searches
            for _ in range(5):
                client.get("/api/jobs")
        
        # Measure CPU before
        cpu_percent_before = psutil.cpu_percent(interval=1)
        
        # Run CPU-intensive operations
        with ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(cpu_intensive_operation) for _ in range(20)]
            [future.result() for future in as_completed(futures)]
        
        # Measure CPU after
        cpu_percent_after = psutil.cpu_percent(interval=1)
        
        print(f"✅ CPU Usage Test:")
        print(f"   CPU Before: {cpu_percent_before:.1f}%")
        print(f"   CPU After: {cpu_percent_after:.1f}%")
        
        # CPU should not be consistently maxed out
        assert cpu_percent_after < 90.0  # Should not exceed 90%

class TestDatabasePerformanceUnderLoad:
    """Test database performance under load"""
    
    def test_concurrent_database_operations(self):
        """Test database performance with concurrent operations"""
        def database_intensive_operation(user_index):
            times = {}
            
            # Registration (database write)
            start_time = time.time()
            register_response = client.post("/api/auth/graduate/register", json={
                "firstName": f"DB{user_index}",
                "lastName": "Test",
                "email": f"db{user_index}.test@uphera.com",
                "password": f"DBTest{user_index}123!",
                "upschoolProgram": "Database Testing",
                "experienceLevel": "entry"
            })
            times['register'] = time.time() - start_time
            
            if register_response.status_code == 200:
                # Login (database read)
                start_time = time.time()
                login_response = client.post("/api/auth/login", json={
                    "email": f"db{user_index}.test@uphera.com",
                    "password": f"DBTest{user_index}123!",
                    "user_type": "mezun"
                })
                times['login'] = time.time() - start_time
                
                if login_response.status_code == 200:
                    token = login_response.json()["access_token"]
                    headers = {"Authorization": f"Bearer {token}"}
                    
                    # Profile read
                    start_time = time.time()
                    client.get("/api/auth/profile", headers=headers)
                    times['profile_read'] = time.time() - start_time
                    
                    # Profile update (database write)
                    start_time = time.time()
                    client.put("/api/auth/profile", json={
                        "phone": f"+90 555 {user_index:03d} 4567",
                        "location": "Istanbul"
                    }, headers=headers)
                    times['profile_update'] = time.time() - start_time
                    
                    # Jobs read
                    start_time = time.time()
                    client.get("/api/jobs", headers=headers)
                    times['jobs_read'] = time.time() - start_time
            
            return times
        
        # Run concurrent database operations
        num_concurrent = 30
        
        with ThreadPoolExecutor(max_workers=15) as executor:
            futures = [executor.submit(database_intensive_operation, i) for i in range(num_concurrent)]
            results = [future.result() for future in as_completed(futures)]
        
        # Analyze database operation times
        operation_stats = {}
        
        for operation in ['register', 'login', 'profile_read', 'profile_update', 'jobs_read']:
            times = [r[operation] for r in results if operation in r]
            if times:
                operation_stats[operation] = {
                    'count': len(times),
                    'avg': statistics.mean(times),
                    'max': max(times),
                    'min': min(times)
                }
        
        print(f"✅ Database Performance Test ({num_concurrent} concurrent operations):")
        for operation, stats in operation_stats.items():
            print(f"   {operation}:")
            print(f"     Count: {stats['count']}")
            print(f"     Avg: {stats['avg']:.3f}s")
            print(f"     Max: {stats['max']:.3f}s")
            print(f"     Min: {stats['min']:.3f}s")
            
            # Performance assertions
            assert stats['avg'] < 2.0, f"{operation} average time too high: {stats['avg']}s"
            assert stats['max'] < 5.0, f"{operation} max time too high: {stats['max']}s"

class TestStressTestScenarios:
    """Stress test scenarios that push system limits"""
    
    def test_rapid_fire_requests(self):
        """Test system with rapid consecutive requests"""
        def rapid_fire_health_checks(num_requests):
            times = []
            for _ in range(num_requests):
                start = time.time()
                response = client.get("/health/")
                end = time.time()
                
                times.append({
                    'response_time': end - start,
                    'status_code': response.status_code,
                    'success': response.status_code == 200
                })
            return times
        
        # Make 100 rapid requests
        results = rapid_fire_health_checks(100)
        
        success_rate = sum(1 for r in results if r['success']) / len(results)
        avg_response_time = statistics.mean([r['response_time'] for r in results])
        
        assert success_rate >= 0.95  # 95% success rate
        assert avg_response_time < 0.5  # Average < 0.5s
        
        print(f"✅ Rapid Fire Test (100 requests):")
        print(f"   Success Rate: {success_rate*100:.1f}%")
        print(f"   Avg Response Time: {avg_response_time:.3f}s")
    
    @pytest.mark.asyncio
    async def test_websocket_connection_storm(self):
        """Test rapid WebSocket connection creation/destruction"""
        connection_results = []
        
        # Rapidly create and disconnect WebSocket connections
        for i in range(50):
            mock_websocket = MagicMock()
            user_id = f"storm_user_{i}"
            
            start_time = time.time()
            connection_id = await manager.connect(mock_websocket, user_id, "storm_test")
            connect_time = time.time() - start_time
            
            start_time = time.time()
            manager.disconnect(user_id, connection_id)
            disconnect_time = time.time() - start_time
            
            connection_results.append({
                'connect_time': connect_time,
                'disconnect_time': disconnect_time
            })
        
        avg_connect_time = statistics.mean([r['connect_time'] for r in connection_results])
        avg_disconnect_time = statistics.mean([r['disconnect_time'] for r in connection_results])
        
        assert avg_connect_time < 0.1    # Average connect < 0.1s
        assert avg_disconnect_time < 0.05  # Average disconnect < 0.05s
        
        print(f"✅ WebSocket Connection Storm Test:")
        print(f"   Avg Connect Time: {avg_connect_time:.4f}s")
        print(f"   Avg Disconnect Time: {avg_disconnect_time:.4f}s")
        
        # Ensure no connections remain
        assert len(manager.active_connections) == 0

# Test configuration and fixtures
@pytest.fixture(scope="session", autouse=True)
def setup_load_tests():
    """Setup for load tests"""
    # Initialize services with optimized settings for testing
    notification_service.db_path = ":memory:"
    notification_service.init_notifications_db()
    
    yield
    
    # Cleanup
    if hasattr(manager, 'active_connections'):
        manager.active_connections.clear()
    if hasattr(manager, 'rooms'):
        manager.rooms.clear()

# Performance benchmarking
def benchmark_endpoint(endpoint, method="GET", headers=None, json_data=None, num_requests=100):
    """Benchmark an endpoint"""
    times = []
    
    for _ in range(num_requests):
        start = time.time()
        
        if method == "GET":
            response = client.get(endpoint, headers=headers)
        elif method == "POST":
            response = client.post(endpoint, headers=headers, json=json_data)
        
        end = time.time()
        times.append(end - start)
    
    return {
        'avg': statistics.mean(times),
        'min': min(times),
        'max': max(times),
        'median': statistics.median(times),
        'requests_per_second': num_requests / sum(times)
    }

# Run load tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto", "-s"])
