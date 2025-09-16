"""
WebSocket Integration Tests for Up Hera
"""

import pytest
import asyncio
import json
import uuid
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Import test dependencies
from api.main import app
from api.services.websocket_service import manager, websocket_service
from api.services.notification_service import notification_service, NotificationType, NotificationPriority

# Test client for HTTP requests
client = TestClient(app)

class TestWebSocketConnections:
    """Test WebSocket connection management"""
    
    @pytest.mark.asyncio
    async def test_websocket_connection_flow(self):
        """Test basic WebSocket connection and disconnection"""
        # Mock WebSocket
        mock_websocket = MagicMock()
        user_id = "test_user_123"
        
        # Test connection
        connection_id = await manager.connect(mock_websocket, user_id, "test")
        
        assert connection_id is not None
        assert user_id in manager.active_connections
        assert connection_id in manager.active_connections[user_id]
        assert len(manager.active_connections[user_id]) == 1
        
        # Test disconnection
        manager.disconnect(user_id, connection_id)
        
        assert user_id not in manager.active_connections
        assert connection_id not in manager.connection_meta
    
    @pytest.mark.asyncio
    async def test_multiple_connections_same_user(self):
        """Test multiple connections for the same user"""
        mock_ws1 = MagicMock()
        mock_ws2 = MagicMock()
        user_id = "test_user_456"
        
        # Connect twice
        conn_id1 = await manager.connect(mock_ws1, user_id, "general")
        conn_id2 = await manager.connect(mock_ws2, user_id, "chat")
        
        assert len(manager.active_connections[user_id]) == 2
        assert manager.get_user_connections_count(user_id) == 2
        
        # Disconnect one
        manager.disconnect(user_id, conn_id1)
        assert len(manager.active_connections[user_id]) == 1
        
        # Disconnect all
        manager.disconnect(user_id, conn_id2)
        assert user_id not in manager.active_connections
    
    @pytest.mark.asyncio
    async def test_room_management(self):
        """Test room join/leave functionality"""
        user_id = "test_user_789"
        room_id = "test_room"
        
        # Test joining room
        manager.join_room(user_id, room_id)
        assert room_id in manager.rooms
        assert user_id in manager.rooms[room_id]
        
        # Test leaving room
        manager.leave_room(user_id, room_id)
        assert room_id not in manager.rooms  # Room should be deleted when empty
    
    @pytest.mark.asyncio
    async def test_personal_message_sending(self):
        """Test sending personal messages"""
        mock_websocket = MagicMock()
        user_id = "test_user_personal"
        
        # Connect user
        connection_id = await manager.connect(mock_websocket, user_id, "test")
        
        # Send message
        test_message = {"type": "test", "content": "Hello World"}
        await manager.send_personal_message(user_id, test_message)
        
        # Verify message was sent
        mock_websocket.send_text.assert_called_once()
        sent_data = mock_websocket.send_text.call_args[0][0]
        parsed_data = json.loads(sent_data)
        
        assert parsed_data["type"] == "test"
        assert parsed_data["content"] == "Hello World"
        
        # Cleanup
        manager.disconnect(user_id, connection_id)

class TestWebSocketService:
    """Test WebSocket service functionality"""
    
    @pytest.mark.asyncio
    async def test_chat_message_handling(self):
        """Test chat message handling"""
        mock_websocket = MagicMock()
        user_id = "test_chat_user"
        room_id = "test_chat_room"
        
        # Setup
        connection_id = await manager.connect(mock_websocket, user_id, "chat")
        manager.join_room(user_id, room_id)
        
        # Test chat message
        message_data = {
            "type": "chat_message",
            "room_id": room_id,
            "content": "Test chat message"
        }
        
        await websocket_service.handle_message(mock_websocket, user_id, message_data)
        
        # Verify message was broadcasted (should at least try to send to sender)
        mock_websocket.send_text.assert_called()
        
        # Cleanup
        manager.leave_room(user_id, room_id)
        manager.disconnect(user_id, connection_id)
    
    @pytest.mark.asyncio
    async def test_room_join_message(self):
        """Test room join message handling"""
        mock_websocket = MagicMock()
        user_id = "test_join_user"
        room_id = "test_join_room"
        
        # Setup
        connection_id = await manager.connect(mock_websocket, user_id, "test")
        
        # Test join room message
        message_data = {
            "type": "join_room",
            "room_id": room_id
        }
        
        await websocket_service.handle_message(mock_websocket, user_id, message_data)
        
        # Verify user joined room
        assert room_id in manager.rooms
        assert user_id in manager.rooms[room_id]
        
        # Verify confirmation was sent
        mock_websocket.send_text.assert_called()
        
        # Cleanup
        manager.leave_room(user_id, room_id)
        manager.disconnect(user_id, connection_id)
    
    @pytest.mark.asyncio
    async def test_online_users_request(self):
        """Test getting online users"""
        mock_websocket = MagicMock()
        user_id = "test_online_user"
        
        # Setup multiple users
        connection_id1 = await manager.connect(mock_websocket, user_id, "test")
        connection_id2 = await manager.connect(MagicMock(), "another_user", "test")
        
        # Test online users request
        message_data = {
            "type": "get_online_users"
        }
        
        await websocket_service.handle_message(mock_websocket, user_id, message_data)
        
        # Verify response was sent
        mock_websocket.send_text.assert_called()
        sent_data = json.loads(mock_websocket.send_text.call_args[0][0])
        
        assert sent_data["type"] == "online_users"
        assert "users" in sent_data
        assert len(sent_data["users"]) == 2
        
        # Cleanup
        manager.disconnect(user_id, connection_id1)
        manager.disconnect("another_user", connection_id2)

class TestNotificationService:
    """Test notification service"""
    
    @pytest.mark.asyncio
    async def test_create_notification(self):
        """Test creating a notification"""
        user_id = "test_notification_user"
        
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            notification_type=NotificationType.JOB_MATCH,
            title="Test Notification",
            message="This is a test notification",
            data={"test_key": "test_value"},
            priority=NotificationPriority.HIGH,
            send_immediately=False  # Don't send via WebSocket in test
        )
        
        # Verify notification was created
        assert notification_id is not None
        
        # Retrieve and verify
        notification = notification_service.get_notification(notification_id)
        assert notification is not None
        assert notification["user_id"] == user_id
        assert notification["title"] == "Test Notification"
        assert notification["type"] == NotificationType.JOB_MATCH.value
        assert notification["priority"] == NotificationPriority.HIGH.value
    
    def test_get_user_notifications(self):
        """Test retrieving user notifications"""
        user_id = "test_user_notifications"
        
        # Create some test notifications (synchronously)
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Create notifications
            loop.run_until_complete(notification_service.create_notification(
                user_id=user_id,
                notification_type=NotificationType.JOB_MATCH,
                title="Notification 1",
                message="Message 1",
                send_immediately=False
            ))
            
            loop.run_until_complete(notification_service.create_notification(
                user_id=user_id,
                notification_type=NotificationType.PROFILE_VIEW,
                title="Notification 2", 
                message="Message 2",
                send_immediately=False
            ))
            
            # Retrieve notifications
            notifications = notification_service.get_user_notifications(user_id)
            
            assert len(notifications) >= 2
            assert all(n["user_id"] == user_id for n in notifications)
            
        finally:
            loop.close()
    
    def test_mark_notification_read(self):
        """Test marking notification as read"""
        user_id = "test_read_user"
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Create notification
            notification_id = loop.run_until_complete(notification_service.create_notification(
                user_id=user_id,
                notification_type=NotificationType.NEW_MESSAGE,
                title="Read Test",
                message="Test read functionality",
                send_immediately=False
            ))
            
            # Mark as read
            success = notification_service.mark_notification_read(notification_id, user_id)
            assert success
            
            # Verify it's marked as read
            notification = notification_service.get_notification(notification_id)
            assert notification["is_read"] == 1  # SQLite stores boolean as integer
            
        finally:
            loop.close()
    
    def test_unread_count(self):
        """Test getting unread notification count"""
        user_id = "test_unread_count"
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            # Initial count should be 0
            initial_count = notification_service.get_unread_count(user_id)
            
            # Create unread notification
            loop.run_until_complete(notification_service.create_notification(
                user_id=user_id,
                notification_type=NotificationType.SYSTEM_UPDATE,
                title="Unread Test",
                message="Test unread count",
                send_immediately=False
            ))
            
            # Count should increase
            new_count = notification_service.get_unread_count(user_id)
            assert new_count == initial_count + 1
            
            # Mark all as read
            marked_count = notification_service.mark_all_read(user_id)
            assert marked_count >= 1
            
            # Count should be 0
            final_count = notification_service.get_unread_count(user_id)
            assert final_count == 0
            
        finally:
            loop.close()

class TestWebSocketIntegration:
    """Integration tests combining WebSocket and notifications"""
    
    @pytest.mark.asyncio
    async def test_notification_via_websocket(self):
        """Test sending notification via WebSocket"""
        mock_websocket = MagicMock()
        user_id = "test_integration_user"
        
        # Setup WebSocket connection
        connection_id = await manager.connect(mock_websocket, user_id, "notifications")
        
        # Create and send notification
        notification_id = await notification_service.create_notification(
            user_id=user_id,
            notification_type=NotificationType.JOB_MATCH,
            title="Integration Test",
            message="Testing WebSocket integration",
            data={"integration": True},
            send_immediately=True  # This should trigger WebSocket send
        )
        
        # Verify WebSocket was called
        mock_websocket.send_text.assert_called()
        
        # Verify notification was marked as sent
        notification = notification_service.get_notification(notification_id)
        assert notification["is_sent"] == 1
        
        # Cleanup
        manager.disconnect(user_id, connection_id)
    
    @pytest.mark.asyncio
    async def test_real_time_job_update(self):
        """Test real-time job update broadcasting"""
        # Setup multiple users
        mock_ws1 = MagicMock()
        mock_ws2 = MagicMock()
        
        user1 = "job_update_user1"
        user2 = "job_update_user2"
        
        conn1 = await manager.connect(mock_ws1, user1, "general")
        conn2 = await manager.connect(mock_ws2, user2, "general")
        
        # Send job update
        job_data = {
            "id": "job_123",
            "title": "Senior Developer",
            "company": "Tech Corp",
            "status": "new"
        }
        
        await websocket_service.send_job_update(job_data)
        
        # Verify both users received the update
        mock_ws1.send_text.assert_called()
        mock_ws2.send_text.assert_called()
        
        # Verify message content
        sent_message1 = json.loads(mock_ws1.send_text.call_args[0][0])
        assert sent_message1["type"] == "job_update"
        assert sent_message1["job"]["title"] == "Senior Developer"
        
        # Cleanup
        manager.disconnect(user1, conn1)
        manager.disconnect(user2, conn2)

class TestWebSocketPerformance:
    """Performance tests for WebSocket functionality"""
    
    @pytest.mark.asyncio
    async def test_multiple_concurrent_connections(self):
        """Test handling multiple concurrent connections"""
        connections = []
        user_count = 50
        
        # Create multiple connections
        for i in range(user_count):
            mock_ws = MagicMock()
            user_id = f"perf_user_{i}"
            connection_id = await manager.connect(mock_ws, user_id, "performance_test")
            connections.append((user_id, connection_id))
        
        # Verify all connections are active
        assert len(manager.active_connections) == user_count
        
        # Test broadcasting to all
        broadcast_message = {
            "type": "performance_test",
            "message": "Testing performance with 50 users"
        }
        
        # Send message to all users
        tasks = []
        for user_id, _ in connections:
            task = manager.send_personal_message(user_id, broadcast_message)
            tasks.append(task)
        
        # Wait for all sends to complete
        await asyncio.gather(*tasks)
        
        # Cleanup all connections
        for user_id, connection_id in connections:
            manager.disconnect(user_id, connection_id)
        
        assert len(manager.active_connections) == 0
    
    @pytest.mark.asyncio
    async def test_room_broadcasting_performance(self):
        """Test performance of room broadcasting"""
        room_id = "performance_room"
        user_count = 30
        connections = []
        
        # Setup users in the same room
        for i in range(user_count):
            mock_ws = MagicMock()
            user_id = f"room_user_{i}"
            connection_id = await manager.connect(mock_ws, user_id, "room_test")
            manager.join_room(user_id, room_id)
            connections.append((user_id, connection_id))
        
        # Test room broadcast
        room_message = {
            "type": "room_broadcast",
            "content": "Message to all room members"
        }
        
        import time
        start_time = time.time()
        
        await manager.broadcast_to_room(room_id, room_message)
        
        end_time = time.time()
        broadcast_time = end_time - start_time
        
        # Should complete quickly (< 1 second for 30 users)
        assert broadcast_time < 1.0
        
        # Cleanup
        for user_id, connection_id in connections:
            manager.leave_room(user_id, room_id)
            manager.disconnect(user_id, connection_id)

# Pytest configuration
@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Setup test environment"""
    # Use in-memory database for tests
    notification_service.db_path = ":memory:"
    notification_service.init_notifications_db()
    
    yield
    
    # Cleanup
    manager.disconnectAll() if hasattr(manager, 'disconnectAll') else None

# Run specific tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--asyncio-mode=auto"])
