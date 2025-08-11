import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import BrandLogo from '../components/BrandLogo';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { FiCheckCircle, FiUserCheck, FiUsers, FiFileText, FiMessageCircle, FiMail, FiSettings, FiTarget, FiAward } from 'react-icons/fi';
import { apiService } from '../services/api';

interface Notification {
  id: string;
  type: 'match' | 'application' | 'interview' | 'success' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionText?: string;
}

const NotificationListScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'match' | 'application' | 'interview'>('all');
  const [loading, setLoading] = useState(true);
  const [currentUser] = useState({
    name: "Ayşe Yılmaz",
    email: "ayse.yilmaz@email.com"
  });

  // API'den bildirimleri yükle
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await apiService.getNotifications();
        if (response.success) {
          // API'den gelen timestamp'leri Date objesine çevir
          const processedNotifications = response.notifications.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp)
          }));
          setNotifications(processedNotifications);
        } else {
          toast.error('Bildirimler yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Bildirim yükleme hatası:', error);
        toast.error('Bildirimler yüklenirken hata oluştu');
        
        // Fallback: Mock data kullan
        const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'match',
        title: 'Yeni Eşleşme! 🎯',
        message: 'TechCorp İstanbul\'dan Frontend Developer pozisyonu ile %94 eşleşme! Bu fırsat tam senin profiline uygun.',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: false,
        priority: 'high',
        actionUrl: '/jobs/1',
        actionText: 'Detayları Gör'
      },
      {
        id: '2',
        type: 'application',
        title: 'Başvuru Durumu Güncellendi 📄',
        message: 'StartupX\'e yaptığınız başvuru "İnceleme" aşamasından "Mülakat" aşamasına geçti.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        read: false,
        priority: 'high',
        actionUrl: '/dashboard',
        actionText: 'Başvuruları Gör'
      },
      {
        id: '3',
        type: 'interview',
        title: 'Mülakat Daveti 🎉',
        message: 'DataFlow\'dan Python Developer pozisyonu için mülakat daveti aldınız. Mülakat tarihi: 25 Ocak 2025, 14:00.',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        priority: 'high',
        actionUrl: '/interview-prep',
        actionText: 'Hazırlığa Başla'
      },
      {
        id: '4',
        type: 'success',
        title: 'Başvuru Onaylandı ✅',
        message: 'CloudMasters\'a yaptığınız DevOps Engineer başvurunuz onaylandı ve değerlendirme aşamasında.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: true,
        priority: 'high'
      },
      {
        id: '5',
        type: 'system',
        title: 'Profil Tamamlanma Önerisi 💪',
        message: 'Profiliniz %87 tamamlanmış. LinkedIn hesabınızı bağlayarak %95\'e çıkarabilirsiniz.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: false,
        priority: 'medium',
        actionUrl: '/profile',
        actionText: 'Profili Güçlendir'
      },
      {
        id: '6',
        type: 'message',
        title: 'UpSchool Network Davetiyesi 👥',
        message: 'Aynı bootcamp\'ten mezun olan Zeynep Kaya seni UpSchool Network\'te takip etmeye başladı.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        read: true,
        priority: 'low',
        actionUrl: '/network',
        actionText: 'Network\'ü Gör'
      },
      {
        id: '7',
        type: 'application',
        title: 'InnovateSoft Başvuru Durumu Güncellendi 📄',
        message: 'InnovateSoft\'a yaptığınız Python Backend Developer başvurunuz "Değerlendirme" aşamasından "Mülakat" aşamasına geçti.',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        read: true,
        priority: 'medium'
      }
    ];

        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return <FiTarget />;
      case 'application': return <FiFileText />;
      case 'interview': return <FiAward />;
      case 'success': return <FiCheckCircle />;
      case 'system': return <FiSettings />;
      case 'message': return <FiMessageCircle />;
      default: return <FiMail />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'var(--up-primary)';
      case 'application': return '#10B981';
      case 'interview': return '#F59E0B';
      case 'success': return '#059669';
      case 'system': return '#6B7280';
      case 'message': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { color: '#DC2626', text: 'Yüksek' };
      case 'medium': return { color: '#F59E0B', text: 'Orta' };
      case 'low': return { color: '#6B7280', text: 'Düşük' };
      default: return { color: '#6B7280', text: 'Normal' };
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} dakika önce`;
    } else if (hours < 24) {
      return `${hours} saat önce`;
    } else {
      return `${days} gün önce`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const markAsRead = async (id: string) => {
    try {
      const response = await apiService.markNotificationRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      } else {
        toast.error('Bildirim işaretlenirken hata oluştu');
      }
    } catch (error) {
      console.error('Bildirim işaretleme hatası:', error);
      // Fallback: Sadece local state'i güncelle
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Her bildirimi tek tek işaretle
      const unreadNotifications = notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await apiService.markNotificationRead(notification.id);
      }
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      console.error('Toplu işaretleme hatası:', error);
      // Fallback: Sadece local state'i güncelle
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    }
  };

  const handleAction = (notification: Notification) => {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    markAsRead(notification.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
        <Header />
        <div className="up-container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Bildirimler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      <Header />
      
      {/* Main Content */}
      <div className="up-container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Bildirimler 🔔
            </h1>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              {unreadCount > 0 ? `${unreadCount} okunmamış bildiriminiz var` : 'Tüm bildirimler okundu'}
            </p>
          </div>
          <ModernButton
            onClick={markAllAsRead}
            variant="secondary"
          >
            Tümünü Okundu İşaretle
          </ModernButton>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Filtreler
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'Tüm Bildirimler', count: notifications.length },
                  { key: 'unread', label: 'Okunmamış', count: unreadCount },
                  { key: 'match', label: 'Eşleşmeler', count: notifications.filter(n => n.type === 'match').length },
                  { key: 'application', label: 'Başvurular', count: notifications.filter(n => n.type === 'application').length },
                  { key: 'interview', label: 'Görüşmeler', count: notifications.filter(n => n.type === 'interview').length }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filter === filterOption.key
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{filterOption.label}</span>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                        {filterOption.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </ModernCard>
          </div>

          {/* Notifications List */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <ModernCard className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Bildirim Bulunamadı
                  </h3>
                  <p style={{ color: 'var(--up-dark-gray)' }}>
                    Seçili filtreye uygun bildirim bulunmuyor.
                  </p>
                </ModernCard>
              ) : (
                filteredNotifications.map((notification) => (
                  <ModernCard 
                    key={notification.id} 
                    className={`relative ${!notification.read ? 'border-l-4 border-blue-500 bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: getTypeColor(notification.type) }}
                      >
                        {getTypeIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg mb-1" style={{ color: 'var(--up-primary-dark)' }}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: getPriorityBadge(notification.priority).color + '20',
                                  color: getPriorityBadge(notification.priority).color
                                }}
                              >
                                {getPriorityBadge(notification.priority).text}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">
                          {notification.message}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center space-x-3">
                          {notification.actionUrl && (
                            <ModernButton
                              variant="primary"
                              size="sm"
                              onClick={() => handleAction(notification)}
                            >
                              {notification.actionText || 'İncele'}
                            </ModernButton>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Okundu İşaretle
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BrandLogo size={56} />
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              <span>© 2025 Up Hera</span>
              <span>•</span>
              <span>UpSchool Partnership</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotificationListScreen; 