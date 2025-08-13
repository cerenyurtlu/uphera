import React, { useMemo, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';

type AdminLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('uphera_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const isAdmin = !!(currentUser && (currentUser.userType === 'admin' || currentUser.user?.user_type === 'admin'));
    if (!isAdmin) navigate('/login');
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      <div className="up-page-header">
        <div className="up-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BrandLogo size={150} />
            </div>
            <div className="text-right flex-1">
              <h1 className="text-sm md:text-base font-semibold" style={{ color: 'var(--up-primary-dark)' }}>{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm" style={{ color: 'var(--up-dark-gray)' }}>{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="up-container py-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="md:col-span-3 lg:col-span-2">
          <nav className="up-card p-4 sticky top-4">
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  📊 Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  👤 Kullanıcılar
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/jobs"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  💼 İş İlanları
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-md transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  ⚙️ Ayarlar
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


