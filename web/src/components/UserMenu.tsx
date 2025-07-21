import React, { useState, useEffect } from 'react';

interface UserMenuProps {
  userName: string;
  userEmail: string;
  currentPage?: string;
  onAIAssistantClick?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ 
  userName, 
  userEmail, 
  currentPage = '',
  onAIAssistantClick
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      window.location.href = '/login';
    }
  };

  const handleAIAssistant = () => {
    setShowUserMenu(false);
    if (onAIAssistantClick) {
      onAIAssistantClick();
    }
  };

  const menuItems = [
    { 
      icon: '📊', 
      label: 'Dashboard', 
      href: '/dashboard',
      active: currentPage === 'dashboard'
    },
    { 
      icon: '💼', 
      label: 'İş İlanları', 
      href: '/jobs',
      active: currentPage === 'jobs'
    },
    { 
      icon: '👤', 
      label: 'Profil Düzenle', 
      href: '/profile',
      active: currentPage === 'profile'
    },
    { 
      icon: '🔔', 
      label: 'Bildirimler', 
      href: '/notifications',
      active: currentPage === 'notifications'
    },
    { 
      icon: '👥', 
      label: 'UpSchool Network', 
      href: '/network',
      active: currentPage === 'network'
    }
  ];

  return (
    <div className="relative user-menu-container">
      <div 
        className="text-sm text-right cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
        onClick={() => setShowUserMenu(!showUserMenu)}
      >
        <div className="font-medium" style={{ color: 'var(--up-primary-dark)' }}>
          {userName} ▼
        </div>
        <div style={{ color: 'var(--up-dark-gray)' }}>
          UpSchool Mezunu
        </div>
      </div>

      {/* User Dropdown Menu */}
      {showUserMenu && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                  {userName}
                </div>
                <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  {userEmail}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  setShowUserMenu(false);
                  window.location.href = item.href;
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-3 ${
                  item.active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {item.active && <span className="ml-auto text-xs">●</span>}
              </button>
            ))}

            <div className="border-t border-gray-200 my-2"></div>

            {/* AI Assistant */}
            <button
              onClick={handleAIAssistant}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
            >
              <span className="text-lg">🤖</span>
              <span>AI Asistan</span>
            </button>

            <div className="border-t border-gray-200 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-3"
            >
              <span className="text-lg">🚪</span>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 