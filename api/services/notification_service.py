"""
Real-time Notification Service for Up Hera
"""

import asyncio
import json
import logging
import sqlite3
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

from api.services.websocket_service import websocket_service

logger = logging.getLogger(__name__)

class NotificationType(str, Enum):
    JOB_MATCH = "job_match"
    APPLICATION_UPDATE = "application_update" 
    NEW_MESSAGE = "new_message"
    INTERVIEW_REMINDER = "interview_reminder"
    PROFILE_VIEW = "profile_view"
    SYSTEM_UPDATE = "system_update"
    MENTOR_REQUEST = "mentor_request"
    EVENT_REMINDER = "event_reminder"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationService:
    """Service for managing real-time notifications"""
    
    def __init__(self, db_path: str = "uphera.db"):
        self.db_path = db_path
        self.init_notifications_db()
    
    def init_notifications_db(self):
        """Initialize notifications database table"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    data TEXT, -- JSON data
                    priority TEXT DEFAULT 'medium',
                    is_read BOOLEAN DEFAULT FALSE,
                    is_sent BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    read_at TIMESTAMP,
                    expires_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Index for performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
                ON notifications (user_id)
            ''')
            
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
                ON notifications (created_at)
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Notifications database initialized")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize notifications DB: {e}")
    
    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        data: Optional[Dict] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        expires_in_hours: Optional[int] = None,
        send_immediately: bool = True
    ) -> str:
        """Create and optionally send a notification"""
        
        notification_id = str(uuid.uuid4())
        expires_at = None
        
        if expires_in_hours:
            expires_at = datetime.now() + timedelta(hours=expires_in_hours)
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO notifications 
                (id, user_id, type, title, message, data, priority, expires_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                notification_id,
                user_id,
                notification_type.value,
                title,
                message,
                json.dumps(data) if data else None,
                priority.value,
                expires_at.isoformat() if expires_at else None
            ))
            
            conn.commit()
            conn.close()
            
            logger.info(f"📬 Created notification {notification_id} for user {user_id}")
            
            # Send immediately if requested
            if send_immediately:
                await self.send_notification(notification_id)
            
            return notification_id
            
        except Exception as e:
            logger.error(f"❌ Failed to create notification: {e}")
            raise
    
    async def send_notification(self, notification_id: str) -> bool:
        """Send notification via WebSocket"""
        try:
            notification = self.get_notification(notification_id)
            if not notification:
                logger.warning(f"Notification {notification_id} not found")
                return False
            
            # Check if already sent
            if notification['is_sent']:
                logger.info(f"Notification {notification_id} already sent")
                return True
            
            # Check if expired
            if notification['expires_at']:
                expires_at = datetime.fromisoformat(notification['expires_at'])
                if datetime.now() > expires_at:
                    logger.info(f"Notification {notification_id} expired")
                    return False
            
            # Prepare WebSocket message
            ws_message = {
                "id": notification['id'],
                "type": notification['type'],
                "title": notification['title'],
                "message": notification['message'],
                "priority": notification['priority'],
                "created_at": notification['created_at'],
                "data": json.loads(notification['data']) if notification['data'] else None
            }
            
            # Send via WebSocket
            await websocket_service.send_notification(notification['user_id'], ws_message)
            
            # Mark as sent
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE notifications SET is_sent = TRUE WHERE id = ?
            ''', (notification_id,))
            conn.commit()
            conn.close()
            
            logger.info(f"📤 Sent notification {notification_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to send notification {notification_id}: {e}")
            return False
    
    def get_notification(self, notification_id: str) -> Optional[Dict]:
        """Get notification by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM notifications WHERE id = ?
            ''', (notification_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                columns = [desc[0] for desc in cursor.description]
                return dict(zip(columns, row))
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Failed to get notification {notification_id}: {e}")
            return None
    
    def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        include_read: bool = True,
        only_unread: bool = False
    ) -> List[Dict]:
        """Get notifications for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            query = '''
                SELECT * FROM notifications 
                WHERE user_id = ?
            '''
            params = [user_id]
            
            if only_unread:
                query += ' AND is_read = FALSE'
            elif not include_read:
                query += ' AND is_read = FALSE'
            
            query += ' ORDER BY created_at DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            columns = [desc[0] for desc in cursor.description]
            notifications = [dict(zip(columns, row)) for row in rows]
            
            # Parse JSON data
            for notification in notifications:
                if notification['data']:
                    try:
                        notification['data'] = json.loads(notification['data'])
                    except:
                        notification['data'] = None
            
            conn.close()
            
            return notifications
            
        except Exception as e:
            logger.error(f"❌ Failed to get notifications for user {user_id}: {e}")
            return []
    
    def mark_notification_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            ''', (notification_id, user_id))
            
            success = cursor.rowcount > 0
            conn.commit()
            conn.close()
            
            if success:
                logger.info(f"📖 Marked notification {notification_id} as read")
            
            return success
            
        except Exception as e:
            logger.error(f"❌ Failed to mark notification {notification_id} as read: {e}")
            return False
    
    def mark_all_read(self, user_id: str) -> int:
        """Mark all notifications as read for a user"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE notifications 
                SET is_read = TRUE, read_at = CURRENT_TIMESTAMP
                WHERE user_id = ? AND is_read = FALSE
            ''', (user_id,))
            
            count = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"📖 Marked {count} notifications as read for user {user_id}")
            return count
            
        except Exception as e:
            logger.error(f"❌ Failed to mark all notifications as read for user {user_id}: {e}")
            return 0
    
    def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM notifications 
                WHERE user_id = ? AND is_read = FALSE
            ''', (user_id,))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count
            
        except Exception as e:
            logger.error(f"❌ Failed to get unread count for user {user_id}: {e}")
            return 0
    
    async def cleanup_expired_notifications(self):
        """Clean up expired notifications"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                DELETE FROM notifications 
                WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
            ''')
            
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            if deleted_count > 0:
                logger.info(f"🗑️ Cleaned up {deleted_count} expired notifications")
            
        except Exception as e:
            logger.error(f"❌ Failed to cleanup expired notifications: {e}")
    
    # Predefined notification templates
    async def notify_job_match(self, user_id: str, job_title: str, company: str, match_score: int):
        """Send job match notification"""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.JOB_MATCH,
            title="🎯 Yeni İş Eşleşmesi!",
            message=f"{company} şirketinden {job_title} pozisyonu sizinle %{match_score} eşleşiyor!",
            data={"job_title": job_title, "company": company, "match_score": match_score},
            priority=NotificationPriority.HIGH,
            expires_in_hours=72
        )
    
    async def notify_application_update(self, user_id: str, job_title: str, status: str):
        """Send application status update"""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.APPLICATION_UPDATE,
            title="📝 Başvuru Durumu Güncellendi",
            message=f"{job_title} pozisyonu için başvurunuz: {status}",
            data={"job_title": job_title, "status": status},
            priority=NotificationPriority.MEDIUM,
            expires_in_hours=168  # 1 week
        )
    
    async def notify_profile_view(self, user_id: str, viewer_name: str, viewer_company: str):
        """Send profile view notification"""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.PROFILE_VIEW,
            title="👀 Profiliniz Görüntülendi",
            message=f"{viewer_company} şirketinden {viewer_name} profilinizi görüntüledi",
            data={"viewer_name": viewer_name, "viewer_company": viewer_company},
            priority=NotificationPriority.LOW,
            expires_in_hours=48
        )
    
    async def notify_interview_reminder(self, user_id: str, job_title: str, interview_date: str):
        """Send interview reminder"""
        await self.create_notification(
            user_id=user_id,
            notification_type=NotificationType.INTERVIEW_REMINDER,
            title="📅 Mülakat Hatırlatması",
            message=f"{job_title} pozisyonu için mülakat yarın: {interview_date}",
            data={"job_title": job_title, "interview_date": interview_date},
            priority=NotificationPriority.URGENT,
            expires_in_hours=24
        )

# Global notification service instance
notification_service = NotificationService()

async def start_notification_cleanup_task():
    """Background task to cleanup expired notifications"""
    while True:
        try:
            await notification_service.cleanup_expired_notifications()
            await asyncio.sleep(3600)  # Run every hour
        except Exception as e:
            logger.error(f"Notification cleanup task error: {e}")
            await asyncio.sleep(3600)
