import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Github, Linkedin, Globe, Mail, Phone, Edit, Calendar, Star } from 'lucide-react';
import Header from '../components/Header';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import toast from 'react-hot-toast';

const ProfileViewScreen: React.FC = () => {
  const navigate = useNavigate();
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
        const userData = localStorage.getItem('uphera_user');
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
            salary_expectation: 35000,
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

  const getExperienceLevelText = (level: string) => {
    switch(level) {
      case 'entry': return 'Giriş Seviyesi';
      case 'junior': return 'Junior (0-2 yıl)';
      case 'mid': return 'Mid (2-5 yıl)';
      case 'senior': return 'Senior (5+ yıl)';
      default: return 'Belirtilmemiş';
    }
  };

  const getWorkPreferenceText = (preference: string) => {
    switch(preference) {
      case 'remote': return 'Uzaktan';
      case 'onsite': return 'Ofiste';
      case 'hybrid': return 'Hibrit';
      default: return 'Belirtilmemiş';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch(availability) {
      case 'immediately': return 'Hemen';
      case '2weeks': return '2 hafta';
      case '1month': return '1 ay';
      case '3months': return '3 ay';
      default: return 'Belirtilmemiş';
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
      <Header />

      {/* Main Content */}
      <div className="up-container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Profilim
            </h2>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              Profil bilgilerinizi görüntüleyin
            </p>
          </div>
          <ModernButton
            variant="primary"
            onClick={() => navigate('/profile/edit')}
          >
            <Edit className="w-4 h-4 mr-2" />
            Profili Düzenle
          </ModernButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <ModernCard>
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" 
                     style={{ background: 'var(--up-primary)' }}>
                  {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'UN'}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    {profileData.name || 'İsim belirtilmemiş'}
                  </h1>
                  
                  <div className="space-y-2 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    {profileData.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {profileData.email}
                      </div>
                    )}
                    
                    {profileData.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {profileData.phone}
                      </div>
                    )}
                    
                    {profileData.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {profileData.location}
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex space-x-4 mt-4">
                    {profileData.github_url && (
                      <a
                        href={profileData.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: 'var(--up-light-gray)', color: 'var(--up-dark-gray)' }}
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    )}
                    
                    {profileData.linkedin_url && (
                      <a
                        href={profileData.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: 'var(--up-light-gray)', color: 'var(--up-dark-gray)' }}
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    )}
                    
                    {profileData.portfolio_url && (
                      <a
                        href={profileData.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{ background: 'var(--up-light-gray)', color: 'var(--up-dark-gray)' }}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Portföy
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* About */}
            {profileData.bio && (
              <ModernCard>
                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                  Hakkında
                </h3>
                <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
              </ModernCard>
            )}

            {/* Skills */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Yetenekler
              </h3>
              
              {profileData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{ 
                        background: 'var(--up-primary)',
                        color: 'white'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Henüz yetenek eklenmemiş</p>
              )}
            </ModernCard>

            {/* Education */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Eğitim
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3" style={{ color: 'var(--up-primary)' }} />
                  <div>
                    <div className="font-medium">{profileData.education.institution}</div>
                    <div className="text-sm text-gray-600">
                      {profileData.education.degree || 'Program belirtilmemiş'}
                      {profileData.education.year && ` • ${profileData.education.year}`}
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>

            {/* Projects */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Projelerim
              </h3>
              
              {profileData.projects.length > 0 ? (
                <div className="space-y-4">
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
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            GitHub
                          </a>
                        )}
                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline"
                          >
                            Canlı Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Henüz proje eklenmemiş</p>
              )}
            </ModernCard>
          </div>

          {/* Right Column - Career Info */}
          <div className="space-y-6">
            {/* Career Preferences */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Kariyer Bilgileri
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Deneyim Seviyesi</span>
                  <p className="font-medium">{getExperienceLevelText(profileData.experience_level)}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Maaş Beklentisi</span>
                  <p className="font-medium">{profileData.salary_expectation?.toLocaleString() || 'Belirtilmemiş'} TL</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Çalışma Tercihi</span>
                  <p className="font-medium">{getWorkPreferenceText(profileData.work_preference)}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Müsaitlik</span>
                  <p className="font-medium">{getAvailabilityText(profileData.availability)}</p>
                </div>
              </div>
            </ModernCard>

            {/* Languages */}
            <ModernCard>
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Diller
              </h3>
              
              <div className="space-y-2">
                {profileData.languages.map((language, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{language}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
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
                  <span className={`font-medium ${profileData.skills.length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {profileData.skills.length > 0 ? '✓ Tamamlandı' : '⚠ Eksik'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Projeler</span>
                  <span className={`font-medium ${profileData.projects.length > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {profileData.projects.length > 0 ? '✓ Tamamlandı' : '⚠ Eksik'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Sosyal Medya</span>
                  <span className={`font-medium ${(profileData.github_url || profileData.linkedin_url) ? 'text-green-600' : 'text-orange-600'}`}>
                    {(profileData.github_url || profileData.linkedin_url) ? '✓ Tamamlandı' : '⚠ Eksik'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Toplam</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--up-primary)' }}>
                    {Math.round(((profileData.skills.length > 0 ? 1 : 0) + 
                                (profileData.projects.length > 0 ? 1 : 0) + 
                                ((profileData.github_url || profileData.linkedin_url) ? 1 : 0) + 1) / 4 * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      background: 'var(--up-primary)', 
                      width: `${Math.round(((profileData.skills.length > 0 ? 1 : 0) + 
                                          (profileData.projects.length > 0 ? 1 : 0) + 
                                          ((profileData.github_url || profileData.linkedin_url) ? 1 : 0) + 1) / 4 * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </ModernCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileViewScreen;
