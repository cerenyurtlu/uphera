import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Bell, Shield, User, Mail, Moon, Sun, Globe, Trash2 } from 'lucide-react';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import Header from '../components/Header';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    jobAlerts: true,
    mentorshipUpdates: true,
    communityNews: false,
    
    // Privacy Settings
    profileVisibility: 'public', // public, private, connections
    showEmail: false,
    showPhone: false,
    searchableProfile: true,
    
    // Account Settings
    language: 'tr',
    theme: 'light', // light, dark, auto
    
    // Job Preferences
    jobEmailFrequency: 'daily', // daily, weekly, monthly, never
    remoteWork: true,
    locationPreferences: ['İstanbul', 'Ankara'],
  });

  // API'den ayarları yükle
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await apiService.getSettings();
        if (response.success) {
          setSettings(response.settings);
        } else {
          toast.error('Ayarlar yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Ayarlar yükleme hatası:', error);
        // Fallback: localStorage'dan yükle
        const savedSettings = localStorage.getItem('uphera_settings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const [userData] = useState(() => {
    const userData = localStorage.getItem('uphera_user');
    return userData ? JSON.parse(userData) : { name: 'Demo Kullanıcı', email: 'demo@uphera.com' };
  });

  // Basit çeviri desteği (Settings sayfası için)
  const translations: Record<string, Record<string, string>> = {
    tr: {
      settings: 'Ayarlar',
      settingsSubtitle: 'Hesabınızı ve uygulama tercihlerinizi yönetin',
      categories: 'Ayar Kategorileri',
      notifications: 'Bildirimler',
      privacy: 'Gizlilik',
      account: 'Hesap',
      jobPrefs: 'İş Tercihleri',
      notificationSettings: 'Bildirim Ayarları',
      emailNotifications: 'E-posta Bildirimleri',
      emailNotificationsDesc: 'Önemli güncellemeler e-posta ile gelsin',
      jobAlerts: 'İş Fırsatı Uyarıları',
      jobAlertsDesc: 'Size uygun iş ilanları bildirilsin',
      mentorshipUpdates: 'Mentorluk Güncellemeleri',
      mentorshipUpdatesDesc: 'Mentor eşleşmeleri ve mesajlar',
      communityNews: 'Topluluk Haberleri',
      communityNewsDesc: 'Etkinlikler ve topluluk duyuruları',
      privacySettings: 'Gizlilik Ayarları',
      profileVisibility: 'Profil Görünürlüğü',
      public: 'Herkese Açık',
      connections: 'Sadece Bağlantılarım',
      private: 'Gizli',
      showEmail: 'E-posta Adresini Göster',
      showEmailDesc: 'Profilinde e-posta adresi görünsün',
      searchableProfile: 'Aranabilir Profil',
      searchableProfileDesc: 'Profilin arama sonuçlarında çıksın',
      accountSettings: 'Hesap Ayarları',
      language: 'Dil',
      theme: 'Tema',
      light: 'Açık',
      dark: 'Koyu',
      accountInfo: 'Hesap Bilgileri',
      name: 'Ad',
      email: 'E-posta',
      accountType: 'Hesap Türü',
      jobPreferences: 'İş Tercihleri',
      jobEmailFrequency: 'İş İlanı E-posta Sıklığı',
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      never: 'Hiçbir Zaman',
      remoteWork: 'Uzaktan Çalışma',
      remoteWorkDesc: 'Remote iş fırsatları gösterilsin',
      dangerZone: 'Tehlikeli Bölge',
      deleteAccount: 'Hesabı Sil',
      deleteWarning: 'Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.',
      cancel: 'İptal',
      saveChanges: 'Değişiklikleri Kaydet',
      saving: 'Kaydediliyor...',
      loadingSettings: 'Ayarlar yükleniyor...'
    },
    en: {
      settings: 'Settings',
      settingsSubtitle: 'Manage your account and app preferences',
      categories: 'Categories',
      notifications: 'Notifications',
      privacy: 'Privacy',
      account: 'Account',
      jobPrefs: 'Job Preferences',
      notificationSettings: 'Notification Settings',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Get important updates via email',
      jobAlerts: 'Job Alerts',
      jobAlertsDesc: 'Get notified about relevant jobs',
      mentorshipUpdates: 'Mentorship Updates',
      mentorshipUpdatesDesc: 'Mentor matches and messages',
      communityNews: 'Community News',
      communityNewsDesc: 'Events and announcements',
      privacySettings: 'Privacy Settings',
      profileVisibility: 'Profile Visibility',
      public: 'Public',
      connections: 'Connections Only',
      private: 'Private',
      showEmail: 'Show Email Address',
      showEmailDesc: 'Display your email on your profile',
      searchableProfile: 'Searchable Profile',
      searchableProfileDesc: 'Show up in search results',
      accountSettings: 'Account Settings',
      language: 'Language',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      accountInfo: 'Account Information',
      name: 'Name',
      email: 'Email',
      accountType: 'Account Type',
      jobPreferences: 'Job Preferences',
      jobEmailFrequency: 'Job Email Frequency',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      never: 'Never',
      remoteWork: 'Remote Work',
      remoteWorkDesc: 'Show remote opportunities',
      dangerZone: 'Danger Zone',
      deleteAccount: 'Delete Account',
      deleteWarning: 'Deleting your account is irreversible and removes all your data.',
      cancel: 'Cancel',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      loadingSettings: 'Loading settings...'
    }
  };

  const t = (key: string) => {
    const lang = settings.language === 'en' ? 'en' : 'tr';
    return translations[lang][key] ?? translations.tr[key] ?? key;
  };

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Tema değişikliği anında uygula
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
    }
    // Dil değişikliği anında uygula
    if (key === 'language') {
      document.documentElement.setAttribute('lang', value);
    }
    
    // Anında localStorage'a kaydet
    localStorage.setItem('uphera_settings', JSON.stringify(newSettings));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await apiService.updateSettings(settings);
      
      if (response.success) {
        // Başarılı olduğunda localStorage'a da kaydet
        localStorage.setItem('uphera_settings', JSON.stringify(settings));
        toast.success('Ayarlar başarıyla kaydedildi! ✅');
      } else {
        toast.error(response.message || 'Ayarlar kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Ayarlar kaydetme hatası:', error);
      // Fallback: Sadece localStorage'a kaydet
      localStorage.setItem('uphera_settings', JSON.stringify(settings));
      toast.success('Ayarlar yerel olarak kaydedildi! ✅');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      localStorage.removeItem('uphera_user');
      localStorage.removeItem('uphera_settings');
      navigate('/login');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
        <Header />
        <div className="up-container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('loadingSettings')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      <Header />

      <div className="up-container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              {t('settings')}
            </h1>
            <p className="text-gray-600">
              {t('settingsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Menu */}
            <div className="lg:col-span-1">
              <ModernCard>
                <div className="p-6">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                    {t('categories')}
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                      <Bell className="inline w-4 h-4 mr-2" />
                      {t('notifications')}
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <Shield className="inline w-4 h-4 mr-2" />
                      {t('privacy')}
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <User className="inline w-4 h-4 mr-2" />
                      {t('account')}
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <Globe className="inline w-4 h-4 mr-2" />
                      {t('jobPrefs')}
                    </button>
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Notification Settings */}
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Bell className="w-5 h-5 mr-2" style={{ color: 'var(--up-primary)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                      {t('notificationSettings')}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('emailNotifications')}</p>
                        <p className="text-sm text-gray-500">{t('emailNotificationsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.emailNotifications}
                          onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('jobAlerts')}</p>
                        <p className="text-sm text-gray-500">{t('jobAlertsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.jobAlerts}
                          onChange={(e) => handleSettingChange('jobAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('mentorshipUpdates')}</p>
                        <p className="text-sm text-gray-500">{t('mentorshipUpdatesDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.mentorshipUpdates}
                          onChange={(e) => handleSettingChange('mentorshipUpdates', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('communityNews')}</p>
                        <p className="text-sm text-gray-500">{t('communityNewsDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.communityNews}
                          onChange={(e) => handleSettingChange('communityNews', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Privacy Settings */}
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-5 h-5 mr-2" style={{ color: 'var(--up-primary)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                      {t('privacySettings')}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {t('profileVisibility')}
                      </label>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">{t('public')}</option>
                        <option value="connections">{t('connections')}</option>
                        <option value="private">{t('private')}</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('showEmail')}</p>
                        <p className="text-sm text-gray-500">{t('showEmailDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.showEmail}
                          onChange={(e) => handleSettingChange('showEmail', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('searchableProfile')}</p>
                        <p className="text-sm text-gray-500">{t('searchableProfileDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.searchableProfile}
                          onChange={(e) => handleSettingChange('searchableProfile', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Account Settings */}
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <User className="w-5 h-5 mr-2" style={{ color: 'var(--up-primary)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                      {t('accountSettings')}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {t('language')}
                      </label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {t('theme')}
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleSettingChange('theme', 'light')}
                          className={`flex items-center px-4 py-2 rounded-lg border ${
                            settings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          {t('light')}
                        </button>
                        <button
                          onClick={() => handleSettingChange('theme', 'dark')}
                          className={`flex items-center px-4 py-2 rounded-lg border ${
                            settings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          {t('dark')}
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">{t('accountInfo')}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>{t('name')}:</strong> {userData.name}</p>
                        <p><strong>{t('email')}:</strong> {userData.email}</p>
                        <p><strong>{t('accountType')}:</strong> UpSchool Graduate</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Job Preferences */}
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Globe className="w-5 h-5 mr-2" style={{ color: 'var(--up-primary)' }} />
                    <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                      {t('jobPreferences')}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        {t('jobEmailFrequency')}
                      </label>
                      <select
                        value={settings.jobEmailFrequency}
                        onChange={(e) => handleSettingChange('jobEmailFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">{t('daily')}</option>
                        <option value="weekly">{t('weekly')}</option>
                        <option value="monthly">{t('monthly')}</option>
                        <option value="never">{t('never')}</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{t('remoteWork')}</p>
                        <p className="text-sm text-gray-500">{t('remoteWorkDesc')}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.remoteWork}
                          onChange={(e) => handleSettingChange('remoteWork', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Danger Zone */}
              <ModernCard>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                    <h3 className="font-semibold text-red-600">
                      {t('dangerZone')}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-red-800 mb-2">{t('deleteAccount')}</h4>
                      <p className="text-sm text-red-600 mb-3">
                        {t('deleteWarning')}
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        {t('deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </ModernCard>

              {/* Save Button */}
              <div className="flex justify-end space-x-4">
                <ModernButton
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                >
                  {t('cancel')}
                </ModernButton>
                <ModernButton
                  onClick={handleSaveSettings}
                  variant="primary"
                  className="flex items-center"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t('saving') : t('saveChanges')}
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
