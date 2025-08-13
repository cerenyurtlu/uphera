import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, LogOut } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useI18n } from '../i18n/I18nProvider';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // Kullanıcı bilgilerini al (güvenli parse ve normalize)
  const { firstName } = (() => {
    try {
      const raw = localStorage.getItem('uphera_user');
      const parsed = raw ? JSON.parse(raw) : null;
      const u = parsed?.user || parsed || {};

      const fullName = [u.firstName, u.lastName]
        .filter(Boolean)
        .join(' ')
        || u.name
        || (typeof u.email === 'string' ? u.email.split('@')[0] : 'Misafir');

      const safeFirst = (fullName || 'Misafir').split(' ')[0] || 'Misafir';
      return { firstName: safeFirst };
    } catch {
      try { localStorage.removeItem('uphera_user'); } catch {}
      return { firstName: 'Misafir' };
    }
  })();

  return (
    <div className="up-page-header">
      <div className="up-container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="flex items-center">
              <BrandLogo size={175} />
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/network')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              {t('nav.community')}
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              {t('nav.events')}
            </button>
            <button 
              onClick={() => navigate('/mentorship')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              {t('nav.mentorship')}
            </button>
            <button 
              onClick={() => navigate('/interview-prep')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              {t('nav.adaAI')}
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <h1 className="text-xs font-medium" style={{ color: 'var(--up-dark-gray)' }}>
                {firstName} {t('nav.welcome')}
              </h1>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <details className="relative">
                <summary className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer list-none"
                  style={{ 
                    backgroundColor: 'var(--up-primary)', 
                    color: 'white'
                  }}
                >
                  {t('nav.profile')} ▼
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <button 
                    onClick={() => navigate('/profile/view')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('nav.myProfile')}
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </button>
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    {t('nav.notifications')}
                  </button>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('uphera_user');
                      localStorage.removeItem('uphera_settings');
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('nav.logout')}
                  </button>
                </div>
              </details>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <details className="relative">
                <summary className="px-3 py-2 border rounded text-sm cursor-pointer list-none"
                  style={{ color: 'var(--up-dark-gray)' }}
                >
                  Menü ▼
                </summary>
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                  <button onClick={() => navigate('/network')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Topluluk</button>
                  <button onClick={() => navigate('/events')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Etkinlikler</button>
                  <button onClick={() => navigate('/mentorship')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Mentorluk</button>
                  <button onClick={() => navigate('/interview-prep')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Ada AI</button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
