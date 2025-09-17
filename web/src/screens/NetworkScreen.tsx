import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import BrandLogo from '../components/BrandLogo';
import AIChatbot from '../components/AIChatbot';
import { apiService } from '../services/api';
import { FiUser } from 'react-icons/fi';

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
  profileImage: React.ReactNode;
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
  const [loading, setLoading] = useState(true);
  const [networkMembers, setNetworkMembers] = useState<NetworkMember[]>([]);
  const [currentUser, setCurrentUser] = useState({
    name: "Yükleniyor...",
    email: "",
    skills: [],
    upschool_batch: "",
    graduation_date: "",
    experienceLevel: "entry"
  });

  // Kullanıcı bilgilerini ve network üyelerini yükle
  useEffect(() => {
    const fetchNetworkData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini localStorage'dan yükle
        const userData = localStorage.getItem('uphera_user');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUser({
            name: user.name || `${user.firstName} ${user.lastName}` || 'Kullanıcı',
            email: user.email,
            skills: user.skills || [],
            upschool_batch: user.program || user.upschoolProgram || "Data Science",
            graduation_date: user.graduationDate || '',
            experienceLevel: user.experienceLevel || 'entry'
          });
        }

        // API'den network üyelerini getir
        try {
          const response = await apiService.getNetworkMembers();
          if (response.success) {
            const processedMembers = response.members.map((member: any) => ({
              ...member,
              role: member.currentRole || member.role,
              profileImage: <FiUser className="text-3xl text-purple-600" />,
              mentorAvailable: member.connectionStatus === 'connected'
            }));
            setNetworkMembers(processedMembers);
          } else {
            throw new Error('API response failed');
          }
        } catch (apiError) {
          console.log('API failed, using mock data');
          // Fallback to mock data
          const mockMembers: NetworkMember[] = [
            {
              id: "member-1",
              name: "Elif Demir",
              role: "Senior Frontend Developer",
              company: "Google",
              location: "İstanbul",
              skills: ["React", "TypeScript", "Next.js", "GraphQL"],
              experience: "5 yıl",
              bootcamp: "Frontend Development #42",
              graduationYear: "2019",
              profileImage: <FiUser className="w-10 h-10 text-blue-400" />,
              isOnline: true,
              mentorAvailable: true,
              commonSkills: 3
            },
            {
              id: "member-2", 
              name: "Zeynep Akar",
              role: "ML Engineer", 
              company: "Microsoft",
              location: "Ankara",
              skills: ["Python", "TensorFlow", "PyTorch", "Docker"],
              experience: "4 yıl",
              bootcamp: "Data Science #28",
              graduationYear: "2020",
              profileImage: <FiUser className="w-10 h-10 text-purple-400" />,
              isOnline: false,
              mentorAvailable: true,
              commonSkills: 2
            },
            {
              id: "member-3",
              name: "Selin Koç",
              role: "UI/UX Designer",
              company: "Amazon",
              location: "İzmir", 
              skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
              experience: "3 yıl",
              bootcamp: "UI/UX Design #35",
              graduationYear: "2021",
              profileImage: <FiUser className="w-10 h-10 text-pink-400" />,
              isOnline: true,
              mentorAvailable: false,
              commonSkills: 1
            },
            {
              id: "member-4",
              name: "Ayşe Gürel",
              role: "DevOps Engineer",
              company: "Netflix",
              location: "İstanbul",
              skills: ["AWS", "Kubernetes", "Docker", "Terraform"],
              experience: "6 yıl", 
              bootcamp: "Backend Development #31",
              graduationYear: "2018",
              profileImage: <FiUser className="w-10 h-10 text-green-400" />,
              isOnline: true,
              mentorAvailable: true,
              commonSkills: 2
            },
            {
              id: "member-5",
              name: "Cemre Özkan", 
              role: "Mobile Developer",
              company: "Spotify",
              location: "Bursa",
              skills: ["React Native", "Swift", "Kotlin", "Firebase"],
              experience: "4 yıl",
              bootcamp: "Mobile Development #29",
              graduationYear: "2020",
              profileImage: <FiUser className="w-10 h-10 text-orange-400" />,
              isOnline: false,
              mentorAvailable: true,
              commonSkills: 2
            },
            {
              id: "member-6",
              name: "Derin Yılmaz",
              role: "Full Stack Developer",
              company: "Airbnb",
              location: "Antalya",
              skills: ["Node.js", "React", "PostgreSQL", "Redis"],
              experience: "5 yıl",
              bootcamp: "Full Stack Development #38",
              graduationYear: "2019",
              profileImage: <FiUser className="w-10 h-10 text-indigo-400" />,
              isOnline: true,
              mentorAvailable: false,
              commonSkills: 3
            },
            {
              id: "member-7",
              name: "Gül Sarı",
              role: "Product Manager",
              company: "Uber",
              location: "İstanbul",
              skills: ["Product Strategy", "Analytics", "SQL", "Roadmapping"],
              experience: "7 yıl",
              bootcamp: "Product Management #25",
              graduationYear: "2017",
              profileImage: <FiUser className="w-10 h-10 text-yellow-400" />,
              isOnline: true,
              mentorAvailable: true,
              commonSkills: 1
            },
            {
              id: "member-8",
              name: "Beste Kara",
              role: "QA Engineer",
              company: "Tesla",
              location: "Adana",
              skills: ["Selenium", "Cypress", "Jest", "Test Automation"],
              experience: "3 yıl",
              bootcamp: "QA Automation #22",
              graduationYear: "2021",
              profileImage: <FiUser className="w-10 h-10 text-teal-400" />,
              isOnline: false,
              mentorAvailable: false,
              commonSkills: 2
            },
            {
              id: "member-9",
              name: "İrem Beyaz",
              role: "Blockchain Developer",
              company: "Coinbase",
              location: "İstanbul",
              skills: ["Solidity", "Web3.js", "Ethereum", "Smart Contracts"],
              experience: "2 yıl",
              bootcamp: "Blockchain Development #15",
              graduationYear: "2022",
              profileImage: <FiUser className="w-10 h-10 text-amber-400" />,
              isOnline: true,
              mentorAvailable: false,
              commonSkills: 1
            },
            {
              id: "member-10",
              name: "Nihan Kırmızı",
              role: "Data Scientist",
              company: "LinkedIn",
              location: "Ankara",
              skills: ["R", "Python", "Tableau", "Machine Learning"],
              experience: "4 yıl",
              bootcamp: "Data Science #26",
              graduationYear: "2020",
              profileImage: <FiUser className="w-10 h-10 text-cyan-400" />,
              isOnline: true,
              mentorAvailable: true,
              commonSkills: 2
            }
          ];
          setNetworkMembers(mockMembers);
        }
      } catch (error) {
        console.error('Network verisi yükleme hatası:', error);
        toast.error('Network verisi yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkData();
  }, []);

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
        <Header />
        <div className="up-container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Network yükleniyor...</p>
          </div>
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
              Teknolojide Öncü Kadınlar Network'ü 👥
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

      {/* AI Chatbot */}
      <AIChatbot 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        context="network"
        userProfile={currentUser}
      />

      <Footer />
    </div>
  );
};

export default NetworkScreen; 