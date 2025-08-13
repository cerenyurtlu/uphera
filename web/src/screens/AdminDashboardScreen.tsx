import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';

const AdminDashboardScreen: React.FC = () => {
  return (
    <AdminLayout title="Yönetim Paneli" subtitle="Genel görünüm ve hızlı aksiyonlar">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ModernCard className="bg-white border-gray-100">
          <div className="text-sm text-gray-500">Toplam Kullanıcı</div>
          <div className="text-3xl font-bold text-slate-700 mt-2">1.284</div>
          <div className="text-xs text-green-600 mt-1">+37 bu hafta</div>
        </ModernCard>
        <ModernCard className="bg-white border-gray-100">
          <div className="text-sm text-gray-500">Aktif İlan</div>
          <div className="text-3xl font-bold text-slate-700 mt-2">73</div>
          <div className="text-xs text-blue-600 mt-1">+5 bugün</div>
        </ModernCard>
        <ModernCard className="bg-white border-gray-100">
          <div className="text-sm text-gray-500">Bekleyen Onay</div>
          <div className="text-3xl font-bold text-slate-700 mt-2">12</div>
          <div className="text-xs text-orange-600 mt-1">İnceleme gerekli</div>
        </ModernCard>
        <ModernCard className="bg-white border-gray-100">
          <div className="text-sm text-gray-500">Başvurular (24s)</div>
          <div className="text-3xl font-bold text-slate-700 mt-2">89</div>
          <div className="text-xs text-gray-500 mt-1">Son 24 saat</div>
        </ModernCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="up-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Son Kayıt Olan Kullanıcılar</h3>
            <Link to="/admin/users" className="text-sm" style={{ color: 'var(--up-primary)' }}>Tümü</Link>
          </div>
          <div className="divide-y">
            {[
              { name: 'Elif Demir', email: 'elif@example.com', role: 'mezun' },
              { name: 'Zeynep Akar', email: 'zeynep@example.com', role: 'mezun' },
              { name: 'Admin User', email: 'admin@gmail.com', role: 'admin' },
            ].map((u) => (
              <div key={u.email} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="up-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Onay Bekleyen İlanlar</h3>
            <Link to="/admin/jobs" className="text-sm" style={{ color: 'var(--up-primary)' }}>Tümü</Link>
          </div>
          <div className="space-y-3">
            {[
              { id: 'J-1024', title: 'Frontend Developer', company: 'TechCorp' },
              { id: 'J-1025', title: 'Data Analyst', company: 'DataWorks' },
              { id: 'J-1026', title: 'UI/UX Designer', company: 'Designify' },
            ].map((j) => (
              <div key={j.id} className="flex items-center justify-between p-3 rounded border border-gray-100">
                <div>
                  <div className="text-sm font-medium text-slate-700">{j.title}</div>
                  <div className="text-xs text-gray-500">{j.company} • {j.id}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <ModernButton size="sm" variant="secondary">İncele</ModernButton>
                  <ModernButton size="sm">Onayla</ModernButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="up-card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700">Sistem Sağlık Durumu</h3>
          <Link to="/admin/settings" className="text-sm" style={{ color: 'var(--up-primary)' }}>Ayarlar</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded bg-green-50 text-green-700">API: Aktif</div>
          <div className="p-3 rounded bg-yellow-50 text-yellow-700">AI Servisi: Sınırlı</div>
          <div className="p-3 rounded bg-green-50 text-green-700">DB: Bağlı</div>
          <div className="p-3 rounded bg-green-50 text-green-700">WebSocket: Aktif</div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardScreen;


