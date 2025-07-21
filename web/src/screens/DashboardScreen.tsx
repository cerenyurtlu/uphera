import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { apiService } from '../services/api';

interface Job {
  id: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  required_skills: string[];
  created_at: string;
  match_percentage?: number;
}

interface UserStats {
  totalApplications: number;
  interviewsScheduled: number;
  profileViews: number;
  matchRate: number;
}

const DashboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    totalApplications: 0,
    interviewsScheduled: 0,
    profileViews: 0,
    matchRate: 0
  });
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Kullanıcının iş eşleşmelerini getir
        const jobs = await apiService.getJobs();
        if (jobs) {
          // API'den gelen job'ları dashboard formatına çevir
          const dashboardJobs: Job[] = jobs.slice(0, 5).map(job => ({
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            required_skills: job.required_skills,
            created_at: job.created_at,
            match_percentage: 85 // Mock match percentage
          }));
          setRecentJobs(dashboardJobs);
        }

        // Mock kullanıcı istatistikleri
        setUserStats({
          totalApplications: 12,
          interviewsScheduled: 3,
          profileViews: 28,
          matchRate: 85
        });

        setLoading(false);
      } catch (error) {
        console.error('Dashboard verisi yüklenirken hata:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Kariyer yolculuğunun özeti
              </p>
            </div>
            <div className="flex space-x-3">
              <ModernButton
                onClick={() => navigate('/jobs')}
                variant="primary"
                size="sm"
              >
                İş Ara
              </ModernButton>
              <ModernButton
                onClick={() => navigate('/profile')}
                variant="secondary"
                size="sm"
              >
                Profil
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--up-primary)' }}>
                {userStats.totalApplications}
              </div>
              <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Başvuru
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--up-primary)' }}>
                {userStats.interviewsScheduled}
              </div>
              <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Mülakat
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--up-primary)' }}>
                {userStats.profileViews}
              </div>
              <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Profil Görüntüleme
              </div>
            </div>
          </ModernCard>

          <ModernCard>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: 'var(--up-primary)' }}>
                %{userStats.matchRate}
              </div>
              <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Ortalama Uyum
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Hızlı Erişim */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModernCard onClick={() => navigate('/jobs')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--up-light-gray)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--up-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                  İş Ara
                </h3>
                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  Yeni fırsatları keşfet
                </p>
              </div>
            </div>
          </ModernCard>

          <ModernCard onClick={() => navigate('/mentorship')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--up-light-gray)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--up-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                  Mentor Bul
                </h3>
                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  Ücretsiz rehberlik al
                </p>
              </div>
            </div>
          </ModernCard>

          <ModernCard onClick={() => navigate('/success-stories')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--up-light-gray)' }}>
                <svg className="w-6 h-6" style={{ color: 'var(--up-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                  Başarı Hikayeleri
                </h3>
                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  İlham al
                </p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* Son İş Eşleşmeleri */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
              Son İş Eşleşmeleri
            </h2>
            <ModernButton
              onClick={() => navigate('/jobs')}
              variant="secondary"
              size="sm"
            >
              Tümünü Gör
            </ModernButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentJobs.map((job) => (
              <ModernCard key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                        {job.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--up-primary)' }}>
                        {job.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                        {job.location}
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--up-light-gray)', color: 'var(--up-primary)' }}>
                        Full-time
                      </div>
                    </div>
                  </div>

                  {/* Match percentage bar */}
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium" style={{ color: 'var(--up-primary)' }}>
                        Uyum: %{job.match_percentage}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${job.match_percentage}%`,
                          backgroundColor: 'var(--up-primary)'
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                    {new Date(job.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>

          {recentJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <h3 className="text-lg font-medium" style={{ color: 'var(--up-primary-dark)' }}>
                Henüz iş eşleşmesi yok
              </h3>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Profilini güncelleyerek daha iyi eşleşmeler bulabilirsin
              </p>
              <div className="mt-4">
                <ModernButton
                  onClick={() => navigate('/jobs')}
                  variant="primary"
                  size="sm"
                >
                  İş Ara
                </ModernButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen; 