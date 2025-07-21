import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import HireHerLogo from '../components/HireHerLogo';
import NotificationBell from '../components/NotificationBell';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import AIChatbot from '../components/AIChatbot';

const ProfileScreen: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    github_url: "",
    linkedin_url: "",
    portfolio_url: "",
    bio: "",
    skills: [] as string[],
    experience_level: "entry",
    salary_expectation: 0,
    work_preference: "hybrid",
    availability: "immediately",
    languages: ["Türkçe (Ana dil)", "İngilizce (Orta seviye)"],
    education: {
      degree: "",
      year: "",
      institution: "UpSchool"
    },
    projects: [] as Array<{
      name: string;
      description: string;
      technologies: string[];
      github_url: string;
      live_url: string;
    }>
  });

  // Load user profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = localStorage.getItem('hireher_user');
        if (!userData) {
          toast.error('Kullanıcı bilgileri bulunamadı');
          return;
        }

        const user = JSON.parse(userData);
        const token = user.token;

        // API URL'lerini sırayla dene
        const apiUrls = [
          'http://127.0.0.1:8000/api/auth/profile',
          'http://localhost:8000/api/auth/profile'
        ];

        let response = null;
        let lastError = null;

        for (const apiUrl of apiUrls) {
          try {
            console.log(`🔄 Profil yükleniyor: ${apiUrl}`);
            response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              mode: 'cors'
            });
            
            if (response.ok) {
              break;
            }
          } catch (error) {
            console.error(`❌ API hatası (${apiUrl}):`, error);
            lastError = error;
          }
        }

        if (!response) {
          throw lastError || new Error('Profil API\'lerine ulaşılamadı');
        }

        const data = await response.json();
        
        if (response.ok && data.success) {
          const userProfile = data.user;
          
          setProfileData({
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            phone: userProfile.phone || "",
            location: userProfile.location || "",
            github_url: userProfile.githubUrl || "",
            linkedin_url: userProfile.linkedinUrl || "",
            portfolio_url: userProfile.portfolioUrl || "",
            bio: userProfile.aboutMe || "",
            skills: userProfile.skills || [],
            experience_level: userProfile.experienceLevel || "entry",
            salary_expectation: 35000, // Default value
            work_preference: "hybrid",
            availability: "immediately",
            languages: ["Türkçe (Ana dil)", "İngilizce (Orta seviye)"],
            education: {
              degree: userProfile.upschoolProgram || "",
              year: userProfile.graduationDate || "",
              institution: "UpSchool"
            },
            projects: []
          });
          
          console.log('✅ Profil yüklendi:', userProfile);
        } else {
          toast.error(data.detail || 'Profil yüklenirken hata oluştu');
        }
      } catch (error: any) {
        console.error('Profil yükleme hatası:', error);
        toast.error('Profil yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !profileData.skills.includes(skill)) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleSave = async () => {
    try {
      const userData = localStorage.getItem('hireher_user');
      if (!userData) {
        toast.error('Kullanıcı bilgileri bulunamadı');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      // API'ye gönderilecek veriyi hazırla
      const updateData = {
        firstName: profileData.name.split(' ')[0] || "",
        lastName: profileData.name.split(' ').slice(1).join(' ') || "",
        phone: profileData.phone,
        upschoolProgram: profileData.education.degree,
        graduationDate: profileData.education.year,
        skills: profileData.skills,
        experienceLevel: profileData.experience_level,
        location: profileData.location,
        portfolioUrl: profileData.portfolio_url,
        githubUrl: profileData.github_url,
        linkedinUrl: profileData.linkedin_url,
        aboutMe: profileData.bio
      };

      // API URL'lerini sırayla dene
      const apiUrls = [
        'http://127.0.0.1:8000/api/auth/profile',
        'http://localhost:8000/api/auth/profile'
      ];

      let response = null;
      let lastError = null;

      for (const apiUrl of apiUrls) {
        try {
          console.log(`🔄 Profil güncelleniyor: ${apiUrl}`);
          response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updateData),
            mode: 'cors'
          });
          
          if (response.ok) {
            break;
          }
        } catch (error) {
          console.error(`❌ API hatası (${apiUrl}):`, error);
          lastError = error;
        }
      }

      if (!response) {
        throw lastError || new Error('Profil API\'lerine ulaşılamadı');
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Profil bilgilerin güncellendi!');
        setIsEditing(false);
        console.log('✅ Profil güncellendi:', data);
      } else {
        toast.error(data.detail || 'Profil güncellenirken hata oluştu');
      }
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--up-light-gray)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      {/* Header */}
      <div className="up-page-header">
        <div className="up-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <HireHerLogo size={64} clickable={true} variant="default" />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                    HireHer AI
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    Profil Yönetimi
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="relative">
                <div 
                  className="text-sm text-right cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="font-medium" style={{ color: 'var(--up-primary-dark)' }}>
                    {profileData.name} ▼
                  </div>
                  <div style={{ color: 'var(--up-dark-gray)' }}>
                    UpSchool Mezunu
                  </div>
                </div>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                          {profileData.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                            {profileData.name}
                          </div>
                          <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                            {profileData.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = '/dashboard';
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-lg">🏠</span>
                        <span>Ana Sayfa</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = '/notifications';
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-lg">🔔</span>
                        <span>Bildirimler</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          window.location.href = '/network';
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-lg">👥</span>
                        <span>UpSchool Network</span>
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowAIChat(true);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-lg">🤖</span>
                        <span>AI Asistan</span>
                      </button>

                      <div className="border-t border-gray-200 my-2"></div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
                            window.location.href = '/login';
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-lg">🚪</span>
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Profil Yönetimi
            </h2>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              Profilini güncel tutarak daha fazla fırsat yakala
            </p>
          </div>
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <ModernButton
                  variant="secondary"
                  onClick={() => setIsEditing(false)}
                >
                  İptal
                </ModernButton>
                <ModernButton
                  variant="primary"
                  onClick={handleSave}
                >
                  Kaydet
                </ModernButton>
              </>
            ) : (
              <ModernButton
                variant="primary"
                onClick={() => setIsEditing(true)}
              >
                Düzenle
              </ModernButton>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--up-primary-dark)' }}>
                Kişisel Bilgiler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="up-form-label">Ad Soyad</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">E-posta</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">Telefon</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">Konum</label>
                  <select
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="up-form-select"
                  >
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Bursa">Bursa</option>
                    <option value="Uzaktan">Uzaktan Çalışma</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="up-form-label">Hakkında</label>
                  <button
                    onClick={() => setShowAIChat(true)}
                    className="flex items-center space-x-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <span>🤖</span>
                    <span>AI ile Düzenle</span>
                  </button>
                </div>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="up-input"
                  placeholder="Kendin hakkında kısa bir açıklama yaz..."
                />
              </div>
            </ModernCard>

            {/* Skills */}
            <ModernCard>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  Yetenekler
                </h3>
                <button
                  onClick={() => setShowAIChat(true)}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <span>🎯</span>
                  <span>Skill Önerisi Al</span>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                    style={{ 
                      background: 'var(--up-primary)',
                      color: 'white'
                    }}
                  >
                    <span>{skill}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleSkillRemove(skill)}
                        className="hover:text-red-200"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Yeni yetenek ekle..."
                    className="up-input flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSkillAdd((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                                     <ModernButton
                     variant="secondary"
                     size="sm"
                     onClick={() => {
                       const inputs = document.querySelectorAll('input[placeholder="Yeni yetenek ekle..."]');
                       const input = inputs[inputs.length - 1] as HTMLInputElement;
                       if (input) {
                         handleSkillAdd(input.value);
                         input.value = '';
                       }
                     }}
                   >
                    Ekle
                  </ModernButton>
                </div>
              )}
            </ModernCard>

            {/* Projects */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--up-primary-dark)' }}>
                Projelerim
              </h3>
              
              <div className="space-y-6">
                {profileData.projects.map((project, index) => (
                  <div key={index} className="border rounded-lg p-4" style={{ borderColor: 'var(--up-light-gray)' }}>
                    <h4 className="font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      {project.name}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: 'var(--up-dark-gray)' }}>
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'var(--up-light-gray)', color: 'var(--up-dark-gray)' }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4 text-sm">
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub
                      </a>
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        Canlı Demo
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </ModernCard>
          </div>

          {/* Right Column - Career Preferences */}
          <div className="space-y-6">
            {/* Career Preferences */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--up-primary-dark)' }}>
                Kariyer Tercihleri
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="up-form-label">Deneyim Seviyesi</label>
                  <select
                    value={profileData.experience_level}
                    onChange={(e) => handleInputChange('experience_level', e.target.value)}
                    disabled={!isEditing}
                    className="up-form-select"
                  >
                    <option value="entry">Giriş Seviyesi</option>
                    <option value="junior">Junior (0-2 yıl)</option>
                    <option value="mid">Mid (2-5 yıl)</option>
                    <option value="senior">Senior (5+ yıl)</option>
                  </select>
                </div>
                
                <div>
                  <label className="up-form-label">Maaş Beklentisi (TL)</label>
                  <input
                    type="number"
                    value={profileData.salary_expectation}
                    onChange={(e) => handleInputChange('salary_expectation', parseInt(e.target.value))}
                    disabled={!isEditing}
                    className="up-input"
                    min="20000"
                    max="100000"
                    step="1000"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">Çalışma Tercihi</label>
                  <select
                    value={profileData.work_preference}
                    onChange={(e) => handleInputChange('work_preference', e.target.value)}
                    disabled={!isEditing}
                    className="up-form-select"
                  >
                    <option value="remote">Uzaktan</option>
                    <option value="onsite">Ofiste</option>
                    <option value="hybrid">Hibrit</option>
                  </select>
                </div>
                
                <div>
                  <label className="up-form-label">Müsaitlik</label>
                  <select
                    value={profileData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    disabled={!isEditing}
                    className="up-form-select"
                  >
                    <option value="immediately">Hemen</option>
                    <option value="2weeks">2 hafta</option>
                    <option value="1month">1 ay</option>
                    <option value="3months">3 ay</option>
                  </select>
                </div>
              </div>
            </ModernCard>

            {/* Links */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--up-primary-dark)' }}>
                Sosyal Medya & Portföy
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="up-form-label">GitHub</label>
                  <input
                    type="url"
                    value={profileData.github_url}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                    placeholder="https://github.com/kullaniciadi"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">LinkedIn</label>
                  <input
                    type="url"
                    value={profileData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                    placeholder="https://linkedin.com/in/kullaniciadi"
                  />
                </div>
                
                <div>
                  <label className="up-form-label">Portföy Website</label>
                  <input
                    type="url"
                    value={profileData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    disabled={!isEditing}
                    className="up-input"
                    placeholder="https://portföysite.com"
                  />
                </div>
              </div>
            </ModernCard>

            {/* Profile Completion */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Profil Tamamlanma
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Temel Bilgiler</span>
                  <span className="text-green-600 font-medium">✓ Tamamlandı</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Yetenekler</span>
                  <span className="text-green-600 font-medium">✓ Tamamlandı</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Projeler</span>
                  <span className="text-green-600 font-medium">✓ Tamamlandı</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sosyal Medya</span>
                  <span className="text-green-600 font-medium">✓ Tamamlandı</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Toplam</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--up-primary)' }}>87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ background: 'var(--up-primary)', width: '87%' }}
                  ></div>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <HireHerLogo size={40} clickable={true} variant="compact" />
              <span className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                HireHer AI
              </span>
            </div>
            
            <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              UpSchool mezunu teknolojideki kadınlar için AI destekli işe yerleştirme platformu
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              <span>© 2025 HireHer AI</span>
              <span>•</span>
              <span>UpSchool Partnership</span>
              <span>•</span>
              <span>Teknolojideki kadınların gücüyle</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AIChatbot 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        context="profile"
        userProfile={profileData}
      />
    </div>
  );
};

export default ProfileScreen; 