import React, { useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ModernButton from '../components/ModernButton';
import toast from 'react-hot-toast';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'mezun';
  status: 'active' | 'inactive';
};

const initialUsers: AdminUser[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@gmail.com', role: 'admin', status: 'active' },
  { id: 'u2', name: 'Elif Demir', email: 'elif@example.com', role: 'mezun', status: 'active' },
  { id: 'u3', name: 'Zeynep Akar', email: 'zeynep@example.com', role: 'mezun', status: 'inactive' },
  { id: 'u4', name: 'Ceren Yurtlu', email: 'cerennyurtlu@gmail.com', role: 'mezun', status: 'active' },
];

const AdminUsersScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<'all' | 'admin' | 'mezun'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const matchesQuery = query
        ? u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesRole = role === 'all' ? true : u.role === role;
      const matchesStatus = status === 'all' ? true : u.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, role, status]);

  const handlePromote = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: 'admin' } : u));
    toast.success('Kullanıcı admin yapıldı');
  };

  const handleDeactivate = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    toast.success('Kullanıcı durumu güncellendi');
  };

  return (
    <AdminLayout title="Kullanıcı Yönetimi" subtitle="Arama, filtreleme ve rol yönetimi">
      <div className="up-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="up-input"
            placeholder="İsim veya e-posta ile ara"
          />
          <select className="up-form-select" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="all">Tüm roller</option>
            <option value="mezun">Mezun</option>
            <option value="admin">Admin</option>
          </select>
          <select className="up-form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">Tüm durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
          <ModernButton variant="secondary">Dışa Aktar (CSV)</ModernButton>
        </div>
      </div>

      <div className="up-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-3">Ad Soyad</th>
              <th className="p-3">E-posta</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Durum</th>
              <th className="p-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium text-slate-700">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.status}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end space-x-2">
                    {u.role !== 'admin' && (
                      <ModernButton size="sm" variant="secondary" onClick={() => handlePromote(u.id)}>Admin Yap</ModernButton>
                    )}
                    <ModernButton size="sm" onClick={() => handleDeactivate(u.id)}>{u.status === 'active' ? 'Devre Dışı' : 'Aktifleştir'}</ModernButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersScreen;


