"""
Modern WebSocket Service for Up Hera
- Real-time chat
- Live notifications
- Job updates
- Connection management
"""

import json
import asyncio
import logging
import inspect
from typing import Dict, List, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime
import uuid

logger = logging.getLogger(__name__)

class ConnectionManager:
    """WebSocket connection manager"""
    
    def __init__(self):
        # Active connections: {user_id: {connection_id: websocket}}
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # User rooms: {room_id: {user_ids}}
        self.rooms: Dict[str, Set[str]] = {}
        # Connection metadata
        self.connection_meta: Dict[str, Dict] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str, connection_type: str = "general") -> str:
        """Accept WebSocket connection and register user"""
        # Accept if awaitable; tolerate non-async mocks in tests
        try:
            accept_result = websocket.accept()
            if inspect.isawaitable(accept_result):
                await accept_result
        except TypeError:
            pass
        
        connection_id = str(uuid.uuid4())
        
        # Initialize user connections if not exists
        if user_id not in self.active_connections:
            self.active_connections[user_id] = {}
        
        # Store connection
        self.active_connections[user_id][connection_id] = websocket
        
        # Store metadata
        self.connection_meta[connection_id] = {
            "user_id": user_id,
            "type": connection_type,
            "connected_at": datetime.now(),
            "last_activity": datetime.now()
        }
        
        logger.info(f"🔗 User {user_id} connected via WebSocket ({connection_type})")
        
        # Notify other connections about user being online
        await self.broadcast_user_status(user_id, "online")
        
        return connection_id
    
    def disconnect(self, user_id: str, connection_id: str):
        """Remove connection"""
        try:
            if user_id in self.active_connections:
                if connection_id in self.active_connections[user_id]:
                    del self.active_connections[user_id][connection_id]
                
                # Remove user if no active connections
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remove metadata
            if connection_id in self.connection_meta:
                del self.connection_meta[connection_id]
            
            logger.info(f"🔌 User {user_id} disconnected")
            
            # Notify about user going offline if no active connections
            if user_id not in self.active_connections:
                asyncio.create_task(self.broadcast_user_status(user_id, "offline"))
                
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")
    
    async def send_personal_message(self, user_id: str, message: dict):
        """Send message to specific user (all their connections)"""
        if user_id in self.active_connections:
            message_str = json.dumps(message)
            
            # Send to all user's connections
            for connection_id, websocket in self.active_connections[user_id].items():
                try:
                    send_result = websocket.send_text(message_str)
                    if inspect.isawaitable(send_result):
                        await send_result
                    # Update activity
                    if connection_id in self.connection_meta:
                        self.connection_meta[connection_id]["last_activity"] = datetime.now()
                except Exception as e:
                    logger.error(f"Error sending to {user_id}: {e}")
                    # Connection is dead, remove it
                    self.disconnect(user_id, connection_id)
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: Optional[str] = None):
        """Broadcast message to all users in a room"""
        if room_id in self.rooms:
            message_str = json.dumps(message)
            
            for user_id in self.rooms[room_id]:
                if exclude_user and user_id == exclude_user:
                    continue
                
                await self.send_personal_message(user_id, message)
    
    async def broadcast_user_status(self, user_id: str, status: str):
        """Broadcast user online/offline status"""
        message = {
            "type": "user_status",
            "user_id": user_id,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        # Broadcast to all connected users
        for active_user_id in self.active_connections.keys():
            if active_user_id != user_id:
                await self.send_personal_message(active_user_id, message)
    
    def join_room(self, user_id: str, room_id: str):
        """Add user to a room"""
        if room_id not in self.rooms:
            self.rooms[room_id] = set()
        
        self.rooms[room_id].add(user_id)
        logger.info(f"👥 User {user_id} joined room {room_id}")
    
    def leave_room(self, user_id: str, room_id: str):
        """Remove user from room"""
        if room_id in self.rooms:
            self.rooms[room_id].discard(user_id)
            
            # Remove empty rooms
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        
        logger.info(f"👋 User {user_id} left room {room_id}")
    
    def get_online_users(self) -> List[str]:
        """Get list of online users"""
        return list(self.active_connections.keys())
    
    def get_user_connections_count(self, user_id: str) -> int:
        """Get number of active connections for user"""
        return len(self.active_connections.get(user_id, {}))
    
    async def ping_all_connections(self):
        """Send ping to all connections to check if alive"""
        ping_message = json.dumps({"type": "ping", "timestamp": datetime.now().isoformat()})
        
        dead_connections = []
        
        for user_id, connections in self.active_connections.items():
            for connection_id, websocket in connections.items():
                try:
                    send_result = websocket.send_text(ping_message)
                    if inspect.isawaitable(send_result):
                        await send_result
                except:
                    dead_connections.append((user_id, connection_id))
        
        # Remove dead connections
        for user_id, connection_id in dead_connections:
            self.disconnect(user_id, connection_id)

# Global connection manager
manager = ConnectionManager()

class WebSocketService:
    """WebSocket service for real-time features"""
    
    def __init__(self):
        self.manager = manager
    
    async def handle_message(self, websocket: WebSocket, user_id: str, message_data: dict):
        """Handle incoming WebSocket message"""
        message_type = message_data.get("type")
        
        try:
            if message_type == "chat_message":
                await self._handle_chat_message(user_id, message_data)
            
            elif message_type == "join_room":
                room_id = message_data.get("room_id")
                if room_id:
                    self.manager.join_room(user_id, room_id)
                    await self._send_room_joined(websocket, room_id)
            
            elif message_type == "leave_room":
                room_id = message_data.get("room_id")
                if room_id:
                    self.manager.leave_room(user_id, room_id)
            
            elif message_type == "get_online_users":
                online_users = self.manager.get_online_users()
                msg = json.dumps({
                    "type": "online_users",
                    "users": online_users
                })
                send_result = websocket.send_text(msg)
                if inspect.isawaitable(send_result):
                    await send_result
            
            elif message_type == "pong":
                # Response to ping, update activity
                pass
            
            else:
                msg = json.dumps({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })
                send_result = websocket.send_text(msg)
                if inspect.isawaitable(send_result):
                    await send_result
                
        except Exception as e:
            logger.error(f"Error handling message: {e}")
            msg = json.dumps({
                "type": "error",
                "message": "Internal server error"
            })
            send_result = websocket.send_text(msg)
            if inspect.isawaitable(send_result):
                await send_result
    
    async def _handle_chat_message(self, user_id: str, message_data: dict):
        """Handle real-time chat message"""
        room_id = message_data.get("room_id", "general")
        content = message_data.get("content", "")
        
        if not content.strip():
            return
        
        # Create chat message
        chat_message = {
            "type": "chat_message",
            "user_id": user_id,
            "content": content,
            "room_id": room_id,
            "timestamp": datetime.now().isoformat(),
            "message_id": str(uuid.uuid4())
        }
        
        # Broadcast to room
        await self.manager.broadcast_to_room(room_id, chat_message)
        
        # TODO: Save to database
        logger.info(f"💬 Chat message from {user_id} in room {room_id}")
    
    async def _send_room_joined(self, websocket: WebSocket, room_id: str):
        """Send room joined confirmation"""
        msg = json.dumps({
            "type": "room_joined",
            "room_id": room_id,
            "timestamp": datetime.now().isoformat()
        })
        send_result = websocket.send_text(msg)
        if inspect.isawaitable(send_result):
            await send_result
    
    async def send_notification(self, user_id: str, notification: dict):
        """Send real-time notification to user"""
        message = {
            "type": "notification",
            "notification": notification,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.manager.send_personal_message(user_id, message)
    
    async def send_job_update(self, job_data: dict):
        """Send job update to all online users"""
        message = {
            "type": "job_update",
            "job": job_data,
            "timestamp": datetime.now().isoformat()
        }
        
        # Broadcast to all users
        for user_id in self.manager.get_online_users():
            await self.manager.send_personal_message(user_id, message)

# Global WebSocket service
websocket_service = WebSocketService()

async def start_connection_monitor():
    """Start background task to monitor connections"""
    while True:
        try:
            await manager.ping_all_connections()
            await asyncio.sleep(30)  # Ping every 30 seconds
        except Exception as e:
            logger.error(f"Connection monitor error: {e}")
            await asyncio.sleep(60)
