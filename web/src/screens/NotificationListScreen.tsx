import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BrandLogo from '../components/BrandLogo';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { FiCheckCircle, FiUserCheck, FiUsers, FiFileText, FiMessageCircle, FiMail, FiSettings, FiTarget, FiAward } from 'react-icons/fi';
import { apiService } from '../services/api';
import { useI18n } from '../i18n/I18nProvider';

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
  const { t } = useI18n();
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
          const list: any[] = (response as any).notifications || (response as any).data || [];
          const processedNotifications = list.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp || notification.created_at || Date.now())
          }));
          setNotifications(processedNotifications);
          try { localStorage.setItem('uphera_notifications', JSON.stringify(list)); } catch {}
        } else {
          toast.error(t('notifications.loading'));
        }
      } catch (error) {
        console.error('Bildirim yükleme hatası:', error);
        // Fallback: Local cache varsa kullan
        const saved = localStorage.getItem('uphera_notifications');
        if (saved) {
          const list = JSON.parse(saved);
          const processedNotifications = list.map((notification: any) => ({
            ...notification,
            timestamp: new Date(notification.timestamp || notification.created_at || Date.now())
          }));
          setNotifications(processedNotifications);
        } else {
          toast.error(t('notifications.loading'));
        }
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
      case 'high': return { color: '#DC2626', text: t('notifications.priority.high') };
      case 'medium': return { color: '#F59E0B', text: t('notifications.priority.medium') };
      case 'low': return { color: '#6B7280', text: t('notifications.priority.low') };
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
        toast.error(t('notifications.action.markRead'));
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
      toast.success(t('notifications.markAllRead'));
    } catch (error) {
      console.error('Toplu işaretleme hatası:', error);
      // Fallback: Sadece local state'i güncelle
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      toast.success(t('notifications.markAllRead'));
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
            <p className="mt-4 text-gray-600">{t('notifications.loading')}</p>
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
              {t('notifications.title')}
            </h1>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              {unreadCount > 0 ? t('notifications.unreadCount', { count: unreadCount }) : t('notifications.allRead')}
            </p>
          </div>
          <ModernButton
            onClick={markAllAsRead}
            variant="secondary"
          >
            {t('notifications.markAllRead')}
          </ModernButton>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard>
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                {t('notifications.filters')}
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: t('notifications.filter.all'), count: notifications.length },
                  { key: 'unread', label: t('notifications.filter.unread'), count: unreadCount },
                  { key: 'match', label: t('notifications.filter.match'), count: notifications.filter(n => n.type === 'match').length },
                  { key: 'application', label: t('notifications.filter.application'), count: notifications.filter(n => n.type === 'application').length },
                  { key: 'interview', label: t('notifications.filter.interview'), count: notifications.filter(n => n.type === 'interview').length }
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
                    {t('notifications.empty.title')}
                  </h3>
                  <p style={{ color: 'var(--up-dark-gray)' }}>
                    {t('notifications.empty.desc')}
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
                              {notification.actionText || t('notifications.action.view')}
                            </ModernButton>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              {t('notifications.action.markRead')}
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

      <Footer />
    </div>
  );
};

export default NotificationListScreen; 