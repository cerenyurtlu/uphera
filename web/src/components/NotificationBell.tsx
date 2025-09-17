import React, { useState, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiTarget, FiEye, FiAward } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'match' | 'application' | 'interview' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notification data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'match',
        title: 'Yeni Eşleşme! 🎯',
        message: 'TechCorp İstanbul\'dan Frontend Developer pozisyonu ile %94 eşleşme!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: '2',
        type: 'application',
        title: 'Başvuru Onaylandı ✅',
        message: 'StartupX\'e yaptığınız başvuru onaylandı ve değerlendirme aşamasında.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false
      },
      {
        id: '3',
        type: 'interview',
        title: 'Mülakat Davet Edildi 🎉',
        message: 'DataFlow\'dan Python Developer pozisyonu için mülakat daveti aldınız.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return <FiTarget className="text-purple-600" />;
      case 'application': return <FiEye className="text-blue-600" />;
      case 'interview': return <FiAward className="text-green-600" />;
      case 'success': return <FiCheckCircle className="text-emerald-600" />;
      default: return <FiBell className="text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-purple-100 text-purple-800';
      case 'application': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'success': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 bg-white/50 rounded-xl hover:bg-white/70 transition-colors"
      >
        <FiBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Bildirimler</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <div className="text-4xl mb-2"><FiBell /></div>
                <p>Henüz bildirim yok</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-200/30 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-purple-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)}`}>
                          {notification.type === 'match' && 'Eşleşme'}
                          {notification.type === 'application' && 'Başvuru'}
                          {notification.type === 'interview' && 'Görüşme'}
                          {notification.type === 'success' && 'Başarı'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200/50">
            <button 
              className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/notifications';
              }}
            >
              Tüm Bildirimleri Görüntüle
            </button>
          </div>
        </div>
      )}

      {/* Background overlay when dropdown is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell; 