import React, { useEffect, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import ModernButton from '../components/ModernButton';
import toast from 'react-hot-toast';

type AdminSettings = {
  maintenanceMode: boolean;
  adminEmail: string;
  emailNotifications: boolean;
  jobApprovalRequired: boolean;
};

const AdminSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    adminEmail: 'admin@uphera.com',
    emailNotifications: true,
    jobApprovalRequired: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uphera_admin_settings');
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem('uphera_admin_settings', JSON.stringify(settings));
      toast.success('Ayarlar kaydedildi');
    } catch {
      toast.error('Ayarlar kaydedilemedi');
    }
  };

  return (
    <AdminLayout title="Sistem Ayarları" subtitle="Bakım modu, bildirim ve onay politikaları">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="up-card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">Genel</h3>
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between">
              <span>Bakım Modu</span>
              <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))} />
            </label>
            <label className="block">
              <span className="block mb-1">Admin E-posta</span>
              <input className="up-input" value={settings.adminEmail} onChange={(e) => setSettings(s => ({ ...s, adminEmail: e.target.value }))} />
            </label>
          </div>
        </div>

        <div className="up-card p-6">
          <h3 className="font-semibold text-slate-700 mb-4">İlan Politikaları</h3>
          <div className="space-y-4 text-sm">
            <label className="flex items-center justify-between">
              <span>E-posta Bildirimleri</span>
              <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => setSettings(s => ({ ...s, emailNotifications: e.target.checked }))} />
            </label>
            <label className="flex items-center justify-between">
              <span>İlan Yayını İçin Onay Zorunlu</span>
              <input type="checkbox" checked={settings.jobApprovalRequired} onChange={(e) => setSettings(s => ({ ...s, jobApprovalRequired: e.target.checked }))} />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ModernButton onClick={save}>Kaydet</ModernButton>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsScreen;


