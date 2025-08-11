import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Bell, LogOut } from 'lucide-react';
import BrandLogo from './BrandLogo';

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  // Kullanıcı bilgilerini al
  const userData = (() => {
    const userData = localStorage.getItem('uphera_user');
    return userData ? JSON.parse(userData) : { name: 'Demo Kullanıcı' };
  })();

  const firstName = userData.name?.split(' ')[0] || 'Misafir';

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
              Topluluk
            </button>
            <button 
              onClick={() => navigate('/events')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              Etkinlikler
            </button>
            <button 
              onClick={() => navigate('/mentorship')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              Mentorluk
            </button>
            <button 
              onClick={() => navigate('/interview-prep')}
              className="text-sm font-medium transition-colors hover:text-blue-600"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              Ada AI
            </button>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <h1 className="text-xs font-medium" style={{ color: 'var(--up-dark-gray)' }}>
                {firstName} Hoş Geldin! 👋
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
                  Profil ▼
                </summary>
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                  <button 
                    onClick={() => navigate('/profile/view')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profilim
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Ayarlar
                  </button>
                  <button 
                    onClick={() => navigate('/notifications')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Bildirimler
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
                    Çıkış Yap
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
