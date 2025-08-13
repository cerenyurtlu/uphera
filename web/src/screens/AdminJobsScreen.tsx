import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ModernButton from '../components/ModernButton';
import toast from 'react-hot-toast';
import apiService from '../services/api';

type AdminJob = {
  id: string;
  title: string;
  company: string;
  location?: string;
  remote?: boolean;
  approved?: boolean;
  featured?: boolean;
};

const AdminJobsScreen: React.FC = () => {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchJobs = async () => {
      setLoading(true);
      const resp = await apiService.getJobs();
      if (!mounted) return;
      if (resp.success) {
        const normalized = ((resp as any).jobs || []).map((j: any) => ({
          id: String(j.id || j.job_id || Math.random()),
          title: j.title || 'İlan',
          company: j.company || 'Şirket',
          location: j.location || '',
          remote: !!j.remote,
          approved: !!j.approved,
          featured: !!j.featured,
        }));
        setJobs(normalized);
      } else {
        // Minimal mock fallback
        setJobs([
          { id: 'J-1001', title: 'Frontend Developer', company: 'TechCorp', location: 'İstanbul', approved: false, featured: false },
          { id: 'J-1002', title: 'Data Analyst', company: 'DataWorks', location: 'Remote', approved: true, featured: true },
          { id: 'J-1003', title: 'UI/UX Designer', company: 'Designify', location: 'Ankara', approved: false, featured: false },
        ]);
      }
      setLoading(false);
    };
    fetchJobs();
    return () => { mounted = false };
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const matches = query ? (j.title + ' ' + j.company).toLowerCase().includes(query.toLowerCase()) : true;
      const pending = onlyPending ? !j.approved : true;
      return matches && pending;
    });
  }, [jobs, query, onlyPending]);

  const toggleApprove = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, approved: !j.approved } : j));
    toast.success('İlan onay durumu güncellendi');
  };

  const toggleFeature = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, featured: !j.featured } : j));
    toast.success('İlan öne çıkarma durumu güncellendi');
  };

  return (
    <AdminLayout title="İş İlanları Yönetimi" subtitle="Onay bekleyenler, arama ve öne çıkarma">
      <div className="up-card p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="up-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="İlan veya şirket ara" />
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} />
            <span>Sadece onay bekleyenler</span>
          </label>
          <ModernButton variant="secondary">Yeni İlan Ekle</ModernButton>
        </div>
      </div>

      <div className="up-card overflow-x-auto">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Yükleniyor...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="p-3">İlan</th>
                <th className="p-3">Şirket</th>
                <th className="p-3">Konum</th>
                <th className="p-3">Durum</th>
                <th className="p-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-slate-700">{j.title}</td>
                  <td className="p-3 text-gray-600">{j.company}</td>
                  <td className="p-3 text-gray-600">{j.location || '-'}</td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${j.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {j.approved ? 'Onaylı' : 'Onay bekliyor'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${j.featured ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {j.featured ? 'Öne çıkarılmış' : 'Normal'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end space-x-2">
                      <ModernButton size="sm" variant="secondary" onClick={() => toggleFeature(j.id)}>
                        {j.featured ? 'Öne Çıkarmayı Kaldır' : 'Öne Çıkar'}
                      </ModernButton>
                      <ModernButton size="sm" onClick={() => toggleApprove(j.id)}>
                        {j.approved ? 'Onayı Kaldır' : 'Onayla'}
                      </ModernButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJobsScreen;


