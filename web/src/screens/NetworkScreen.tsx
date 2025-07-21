import React, { useState } from 'react';
import toast from 'react-hot-toast';
import HireHerLogo from '../components/HireHerLogo';
import NotificationBell from '../components/NotificationBell';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import AIChatbot from '../components/AIChatbot';

interface NetworkMember {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  skills: string[];
  experience: string;
  bootcamp: string;
  graduationYear: string;
  profileImage: string;
  linkedinUrl?: string;
  isOnline: boolean;
  mentorAvailable: boolean;
  commonSkills: number;
}

const NetworkScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Yükleniyor...",
    email: "",
    skills: [],
    upschool_batch: "",
    graduation_date: "",
    experienceLevel: "entry"
  });

  // Kullanıcı bilgilerini localStorage'dan yükle
  React.useEffect(() => {
    const userData = localStorage.getItem('hireher_user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name,
        email: user.email,
        skills: user.skills || [],
        upschool_batch: user.program || "Data Science",
        graduation_date: "",
        experienceLevel: "entry"
      });
    }
  }, []);

  // Network data - Sadece kullanıcının kendi bilgileri
  const [networkMembers] = useState<NetworkMember[]>([
    {
      id: 'current_user',
      name: currentUser.name,
      role: `${currentUser.experienceLevel} Developer`,
      company: 'UpSchool Mezunu',
      location: 'Türkiye',
      skills: currentUser.skills,
      experience: 'Yeni mezun',
      bootcamp: currentUser.upschool_batch,
      graduationYear: currentUser.graduation_date || '2024',
      profileImage: '👩‍💻',
      isOnline: true,
      mentorAvailable: false,
      commonSkills: currentUser.skills.length
    }
  ]);

  const filteredMembers = networkMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = filterSkill === '' || member.skills.some(skill => 
                        skill.toLowerCase().includes(filterSkill.toLowerCase()));
    const matchesLocation = filterLocation === '' || member.location === filterLocation;
    const matchesRole = filterRole === '' || member.role.toLowerCase().includes(filterRole.toLowerCase());
    
    return matchesSearch && matchesSkill && matchesLocation && matchesRole;
  });

  const uniqueSkills = Array.from(new Set(networkMembers.flatMap(m => m.skills))).slice(0, 10);
  const uniqueLocations = Array.from(new Set(networkMembers.map(m => m.location)));

  const handleConnect = (member: NetworkMember) => {
    toast.success(`${member.name} ile bağlantı isteği gönderildi!`);
  };

  const handleMentorRequest = (member: NetworkMember) => {
    toast.success(`${member.name}'a mentörlük isteği gönderildi!`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSkill('');
    setFilterLocation('');
    setFilterRole('');
  };

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
                    UpSchool Network
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    Teknoloji kadınları topluluğu
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="text-sm text-right">
                <div className="font-medium" style={{ color: 'var(--up-primary-dark)' }}>
                  {currentUser.name}
                </div>
                <div style={{ color: 'var(--up-dark-gray)' }}>
                  UpSchool Mezunu
                </div>
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
              Teknoloji Kadınları Network'ü 👥
            </h2>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              {networkMembers.length} UpSchool mezunu ile bağlantı kur, mentor bul, deneyim paylaş
            </p>
          </div>
          <div className="flex space-x-4">
            <ModernButton
              variant="secondary"
              onClick={() => window.history.back()}
            >
              ← Geri Dön
            </ModernButton>
            <ModernButton
              variant="primary"
              onClick={() => setShowAIChat(true)}
            >
              🤖 Network AI Asistanı
            </ModernButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ModernCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  Filtreler
                </h3>
                {(searchTerm || filterSkill || filterLocation || filterRole) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Temizle
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium mb-2">İsim / Şirket Ara</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Ara..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Yetenek</label>
                  <select
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Yetenekler</option>
                    {uniqueSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Konum</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tüm Konumlar</option>
                    {uniqueLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Pozisyon</label>
                  <input
                    type="text"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    placeholder="Developer, Designer..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--up-primary-dark)' }}>
                  Network İstatistikleri
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Toplam Mezun:</span>
                    <span className="font-medium">{networkMembers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Çevrimiçi:</span>
                    <span className="font-medium text-green-600">
                      {networkMembers.filter(m => m.isOnline).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mentor:</span>
                    <span className="font-medium text-purple-600">
                      {networkMembers.filter(m => m.mentorAvailable).length}
                    </span>
                  </div>
                </div>
              </div>
            </ModernCard>
          </div>

          {/* Members Grid */}
          <div className="lg:col-span-3">
            {filteredMembers.length === 0 ? (
              <ModernCard className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                  Sonuç Bulunamadı
                </h3>
                <p style={{ color: 'var(--up-dark-gray)' }}>
                  Arama kriterlerinize uygun mezun bulunamadı. Filtreleri değiştirmeyi deneyin.
                </p>
                <ModernButton
                  variant="secondary"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Filtreleri Temizle
                </ModernButton>
              </ModernCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <ModernCard key={member.id} className="relative">
                    {/* Online Indicator */}
                    {member.isOnline && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}

                    {/* Profile Section */}
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl bg-gray-100">
                        {member.profileImage}
                      </div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                        {member.name}
                      </h3>
                      <p className="text-sm font-medium" style={{ color: 'var(--up-primary)' }}>
                        {member.role}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                        {member.company} • {member.location}
                      </p>
                    </div>

                    {/* Bootcamp Info */}
                    <div className="mb-4">
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block">
                        {member.bootcamp} - {member.graduationYear}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {member.experience} deneyim
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {member.skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 text-xs rounded-lg"
                            style={{ 
                              background: 'var(--up-light-gray)',
                              color: 'var(--up-dark-gray)'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{member.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Common Skills Badge */}
                    {member.commonSkills > 0 && (
                      <div className="mb-4">
                        <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full inline-block">
                          🎯 {member.commonSkills} ortak yetenek
                        </div>
                      </div>
                    )}

                    {/* Mentor Badge */}
                    {member.mentorAvailable && (
                      <div className="mb-4">
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                          👩‍🏫 Mentor mevcut
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                      <ModernButton
                        variant="primary"
                        size="sm"
                        onClick={() => handleConnect(member)}
                        className="w-full"
                      >
                        🤝 Bağlantı Kur
                      </ModernButton>
                      
                      {member.mentorAvailable && (
                        <ModernButton
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMentorRequest(member)}
                          className="w-full"
                        >
                          👩‍🏫 Mentörlük İste
                        </ModernButton>
                      )}

                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <ModernButton
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            📎 LinkedIn Profili
                          </ModernButton>
                        </a>
                      )}
                    </div>
                  </ModernCard>
                ))}
              </div>
            )}
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
                UpSchool Network
              </span>
            </div>
            
            <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              Teknolojideki kadınların güçlendiği, paylaştığı ve büyüdüğü topluluk
            </p>
            
            <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              <span>© 2025 UpSchool Network</span>
              <span>•</span>
              <span>Teknolojideki Kadınlar Topluluğu</span>
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
        context="network"
        userProfile={currentUser}
      />
    </div>
  );
};

export default NetworkScreen; 