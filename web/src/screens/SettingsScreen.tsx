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

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Tema değişikliği anında uygula
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
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
            <p className="mt-4 text-gray-600">Ayarlar yükleniyor...</p>
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
              Ayarlar
            </h1>
            <p className="text-gray-600">
              Hesabınızı ve uygulama tercihlerinizi yönetin
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Menu */}
            <div className="lg:col-span-1">
              <ModernCard>
                <div className="p-6">
                  <h3 className="font-semibold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                    Ayar Kategorileri
                  </h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">
                      <Bell className="inline w-4 h-4 mr-2" />
                      Bildirimler
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <Shield className="inline w-4 h-4 mr-2" />
                      Gizlilik
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <User className="inline w-4 h-4 mr-2" />
                      Hesap
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 text-sm">
                      <Globe className="inline w-4 h-4 mr-2" />
                      İş Tercihleri
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
                      Bildirim Ayarları
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                        <p className="text-sm text-gray-500">Önemli güncellemeler e-posta ile gelsin</p>
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
                        <p className="font-medium text-gray-900">İş Fırsatı Uyarıları</p>
                        <p className="text-sm text-gray-500">Size uygun iş ilanları bildirilsin</p>
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
                        <p className="font-medium text-gray-900">Mentorluk Güncellemeleri</p>
                        <p className="text-sm text-gray-500">Mentor eşleşmeleri ve mesajlar</p>
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
                        <p className="font-medium text-gray-900">Topluluk Haberleri</p>
                        <p className="text-sm text-gray-500">Etkinlikler ve topluluk duyuruları</p>
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
                      Gizlilik Ayarları
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Profil Görünürlüğü
                      </label>
                      <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">Herkese Açık</option>
                        <option value="connections">Sadece Bağlantılarım</option>
                        <option value="private">Gizli</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">E-posta Adresini Göster</p>
                        <p className="text-sm text-gray-500">Profilinde e-posta adresi görünsün</p>
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
                        <p className="font-medium text-gray-900">Aranabilir Profil</p>
                        <p className="text-sm text-gray-500">Profilin arama sonuçlarında çıksın</p>
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
                      Hesap Ayarları
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Dil
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
                        Tema
                      </label>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleSettingChange('theme', 'light')}
                          className={`flex items-center px-4 py-2 rounded-lg border ${
                            settings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          <Sun className="w-4 h-4 mr-2" />
                          Açık
                        </button>
                        <button
                          onClick={() => handleSettingChange('theme', 'dark')}
                          className={`flex items-center px-4 py-2 rounded-lg border ${
                            settings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          <Moon className="w-4 h-4 mr-2" />
                          Koyu
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Hesap Bilgileri</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Ad:</strong> {userData.name}</p>
                        <p><strong>E-posta:</strong> {userData.email}</p>
                        <p><strong>Hesap Türü:</strong> UpSchool Mezunu</p>
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
                      İş Tercihleri
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        İş İlanı E-posta Sıklığı
                      </label>
                      <select
                        value={settings.jobEmailFrequency}
                        onChange={(e) => handleSettingChange('jobEmailFrequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="daily">Günlük</option>
                        <option value="weekly">Haftalık</option>
                        <option value="monthly">Aylık</option>
                        <option value="never">Hiçbir Zaman</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Uzaktan Çalışma</p>
                        <p className="text-sm text-gray-500">Remote iş fırsatları gösterilsin</p>
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
                      Tehlikeli Bölge
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h4 className="font-medium text-red-800 mb-2">Hesabı Sil</h4>
                      <p className="text-sm text-red-600 mb-3">
                        Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Hesabı Sil
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
                  İptal
                </ModernButton>
                <ModernButton
                  onClick={handleSaveSettings}
                  variant="primary"
                  className="flex items-center"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
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
