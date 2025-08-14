import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import Header from '../components/Header';
import Footer from '../components/Footer';


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
    profileViews: 85,
    matchRate: 85
  });
  const [loading, setLoading] = useState(false);

  // Kullanıcı bilgilerini al ve normalize et
  const [userData] = useState(() => {
    const stored = localStorage.getItem('uphera_user');
    const raw = stored ? JSON.parse(stored) : null;
    const nestedUser = raw?.user || raw;

    // İsimleri birleştir (öncelik: API user, ardından düz alanlar)
    const fullName = [nestedUser?.firstName, nestedUser?.lastName]
      .filter(Boolean)
      .join(' ')
      || nestedUser?.name
      || (nestedUser?.email ? nestedUser.email.split('@')[0] : 'Misafir');

    // Program/bootcamp adı
    const program = nestedUser?.upschoolProgram
      || nestedUser?.program
      || nestedUser?.bootcamp
      || 'UpSchool';

    return {
      name: fullName,
      upschoolProgram: program,
    };
  });

  const firstName = (userData.name || 'Misafir').split(' ')[0];
  const bootcampName = userData.upschoolProgram || 'UpSchool';

  const getBootcampDisplayName = (program: string) => {
    const programLower = program.toLowerCase();
    if (programLower.includes('frontend')) return 'Frontend Development';
    if (programLower.includes('backend')) return 'Backend Development';
    if (programLower.includes('fullstack') || programLower.includes('full-stack')) return 'Full Stack Development';
    if (programLower.includes('data')) return 'Data Science';
    if (programLower.includes('mobile')) return 'Mobile Development';
    if (programLower.includes('ui') || programLower.includes('ux')) return 'UI/UX Design';
    if (programLower.includes('devops')) return 'DevOps';
    if (programLower.includes('cyber')) return 'Cybersecurity';
    return program || 'UpSchool';
  };

  useEffect(() => {
    // Hızlı başlangıç - anında yükle
    setUserStats({ totalApplications: 0, interviewsScheduled: 0, profileViews: 85, matchRate: 85 });
    setLoading(false);
  }, []);

  const communityCards = [
    {
      id: 'success',
      title: 'Bu Ay 47 UpSchool Mezunu İşe Yerleşti! 🎉',
      description: 'Topluluk olarak birbirimizi desteklemeye devam ediyoruz',
      action: 'Başarı hikayelerini gör',
      icon: '🏆',
      bg: 'bg-white border-gray-100 hover:bg-gray-50',
      iconBg: 'bg-gray-100',
      textColor: 'text-gray-700',
      actionColor: 'text-gray-500',
      onClick: () => navigate('/success-stories')
    },
    {
      id: 'mentorship',
      title: 'Mentorship Programımıza Katıl 👥',
      description: 'Deneyimli kadın geliştiricilerden 1:1 mentorluk al',
      action: 'Mentor bul',
      icon: '👩‍💼',
      bg: 'bg-white border-gray-100 hover:bg-slate-50',
      iconBg: 'bg-slate-100',
      textColor: 'text-slate-700',
      actionColor: 'text-slate-500',
      onClick: () => navigate('/mentorship')
    },
    {
      id: 'event',
      title: 'Tech Talk: Women in AI 🚀',
      description: '15 Ocak | Online | Konuşmacı: Google\'dan Dr. Ayşe Kara',
      action: 'Katıl',
      icon: '📅',
      bg: 'bg-white border-gray-100 hover:bg-stone-50',
      iconBg: 'bg-stone-100',
      textColor: 'text-stone-700',
      actionColor: 'text-stone-500',
      onClick: () => navigate('/events')
    },
    {
      id: 'meetup',
      title: 'İstanbul Devel Meetup 🏢',
      description: '20 UpSchool mezunu buluşması - 18 Ocak',
      action: 'Kayıt ol',
      icon: '🎯',
      bg: 'bg-white border-gray-100 hover:bg-zinc-50',
      iconBg: 'bg-zinc-100',
      textColor: 'text-zinc-700',
      actionColor: 'text-zinc-500',
      onClick: () => navigate('/events')
    }
  ];

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
      <Header />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: 'var(--up-primary-dark)' }}>
              Hoş Geldin, {firstName}! 👋
            </h1>
            <p className="text-base md:text-lg mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              <span className="font-semibold" style={{ color: 'var(--up-primary)' }}>
                {getBootcampDisplayName(bootcampName)}
              </span> bootcamp'ini tamamladın ama UpSchool'daki yolculuğumuz daha yeni başlıyor!
            </p>

            {/* Günün İlhamı */}
            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
              <p className="text-sm font-medium text-gray-500 mb-2">💡 Günün İlhamı</p>
              <p className="text-base italic leading-relaxed" style={{ color: 'var(--up-primary-dark)' }}>
                "Başarı, küçük çabaların günlük tekrarının sonucudur. Her yeni gün, kariyerinde bir adım daha ilerlemek için yeni bir fırsat!"
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Üst Hızlı Erişim Kartları - İş Arama Burada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModernCard hover className="bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors" onClick={() => navigate('/jobs')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 rounded-full">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-700">Sana Özel İş Fırsatları</h3>
                <p className="text-sm text-slate-500">AI algoritması ile eşleşen işler burada</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard hover className="bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors" onClick={() => navigate('/network')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <span className="text-xl">👥</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-700">Toplulukta Güçlen</h3>
                <p className="text-sm text-gray-500">Diğer teknolojide öncü kadınlar ile network kur, deneyim paylaş</p>
              </div>
            </div>
          </ModernCard>

          <ModernCard hover className="bg-stone-50 border-stone-200 hover:bg-stone-100 transition-colors" onClick={() => navigate('/mentorship')}>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-stone-100 rounded-full">
                <span className="text-xl">🌟</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-stone-700">Diğerlerini Destekle</h3>
                <p className="text-sm text-stone-500">Mentorluk yap, bilgini paylaş, birlikte büyü</p>
              </div>
            </div>
          </ModernCard>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ModernCard className="text-center bg-white border-gray-100">
            <div className="text-3xl font-bold text-slate-600">{userStats.matchRate}%</div>
            <div className="text-sm text-gray-500">Profil Gücü</div>
          </ModernCard>
          
          <ModernCard className="text-center bg-white border-gray-100">
            <div className="text-3xl font-bold text-slate-600">{userStats.totalApplications}</div>
            <div className="text-sm text-gray-500">Aktif Başvuru</div>
          </ModernCard>
          
          <ModernCard className="text-center bg-white border-gray-100">
            <div className="text-3xl font-bold text-slate-600">{userStats.interviewsScheduled}</div>
            <div className="text-sm text-gray-500">Mülakat Fırsatı</div>
          </ModernCard>
          
          <ModernCard className="text-center bg-white border-gray-100">
            <div className="text-3xl font-bold text-slate-600">234</div>
            <div className="text-sm text-gray-500">Network Bağlantısı</div>
          </ModernCard>
        </div>

        {/* UpSchool Topluluğu */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>UpSchool Topluluğu 💪</h2>
              <p className="text-gray-600">Birlikte büyüyor, birbirimizi destekliyoruz</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <span className="text-gray-600">←</span>
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <span className="text-gray-600">→</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityCards.map((card) => (
              <ModernCard key={card.id} hover className={`relative ${card.bg} transition-colors shadow-sm`} onClick={card.onClick}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${card.iconBg}`}>
                      <span className="text-2xl">{card.icon}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className={`font-semibold text-base mb-2 ${card.textColor}`}>
                      {card.title}
                    </h3>
                    <p className={`text-sm mb-4 leading-relaxed ${card.actionColor}`}>
                      {card.description}
                    </p>
                  </div>
                  
                                      <ModernButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        card.onClick();
                      }}
                      className="w-full text-sm"
                    >
                    {card.action} →
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Sana Özel İş Fırsatları */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>Sana Özel İş Fırsatları 🎯</h2>
              <p className="text-gray-600">AI algoritması senin becerilerine göre seçti</p>
            </div>
            <ModernButton size="sm" variant="secondary" onClick={() => navigate('/jobs')}>Tümünü Gör</ModernButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: 1,
                title: "Frontend Developer",
                company: "TechCorp İstanbul",
                location: "İstanbul",
                salary: "25.000 - 35.000 TL",
                match: 94,
                type: "Full-time",
                skills: ["React", "TypeScript", "CSS"],
                urgent: true
              },
              {
                id: 2,
                title: "Junior React Developer", 
                company: "StartupX",
                location: "Remote",
                salary: "18.000 - 25.000 TL",
                match: 87,
                type: "Full-time",
                skills: ["React", "JavaScript", "Git"],
                urgent: false
              },
              {
                id: 3,
                title: "UI/UX Designer",
                company: "DesignStudio",
                location: "Ankara",
                salary: "20.000 - 28.000 TL", 
                match: 82,
                type: "Hybrid",
                skills: ["Figma", "Adobe XD", "Prototyping"],
                urgent: false
              }
            ].map((job) => (
              <ModernCard key={job.id} hover className="bg-white border-gray-100 shadow-sm transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.company}</p>
                      <p className="text-sm text-gray-500">{job.location} • {job.type}</p>
                    </div>
                    {job.urgent && (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">Acil</span>
                    )}
                  </div>
                  
                  <div className="text-sm font-medium text-gray-600">{job.salary}</div>
                  
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uyum:</span>
                      <span className="font-medium text-slate-600">%{job.match}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-slate-400 transition-all duration-300"
                        style={{ width: `${job.match}%` }}
                      />
                    </div>
                  </div>
                  
                  <ModernButton size="sm" className="w-full" onClick={() => navigate('/jobs')}>
                    Başvur →
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Başarı Hikayeleri */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>Başarı Hikayeleri 🌟</h2>
              <p className="text-gray-600">UpSchool mezunlarının ilham verici yolculukları</p>
            </div>
            <ModernButton size="sm" variant="secondary" onClick={() => navigate('/success-stories')}>Tümünü Gör</ModernButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Elif Demir",
                role: "Senior Frontend Developer",
                company: "Google",
                batch: "Frontend Development #42",
                timeline: "6 ay sonra",
                image: "/api/placeholder/60/60"
              },
              {
                name: "Zeynep Akar", 
                role: "ML Engineer",
                company: "Microsoft",
                batch: "Data Science #28",
                timeline: "3 ay sonra",
                image: "/api/placeholder/60/60"
              },
              {
                name: "Selin Koç",
                role: "Product Manager", 
                company: "Amazon",
                batch: "UI/UX Design #35",
                timeline: "4 ay sonra",
                image: "/api/placeholder/60/60"
              }
            ].map((story) => (
              <ModernCard key={story.name} hover className="bg-white border-gray-100 shadow-sm transition-colors">
                <div className="flex items-start space-x-4">
                  <img src={story.image} alt={story.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">{story.name}</h3>
                    <p className="text-sm font-medium text-slate-600">{story.role}</p>
                    <p className="text-sm text-gray-500">{story.company}</p>
                    <p className="text-xs text-gray-400 mt-2">{story.batch} • {story.timeline}</p>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

        {/* Freelance Proje Fırsatları */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>Freelance Proje Fırsatları 💼</h2>
              <p className="text-gray-600">Deneyim kazan, portföyünü güçlendir</p>
            </div>
            <ModernButton size="sm" variant="secondary" onClick={() => navigate('/freelance-projects')}>Tümünü Gör</ModernButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                id: 1,
                title: "E-ticaret Sitesi Frontend Geliştirmesi",
                client: "TechStartup İstanbul",
                budget: "15.000 - 25.000 TL",
                duration: "4-6 hafta",
                skills: ["React.js", "TypeScript", "Tailwind CSS"],
                level: "Orta",
                urgent: true,
                proposals: 8
              },
              {
                id: 2,
                title: "Mobil Uygulama UI/UX Tasarımı",
                client: "HealthTech Ankara", 
                budget: "8.000 - 12.000 TL",
                duration: "3-4 hafta",
                skills: ["Figma", "User Research", "Prototyping"],
                level: "Orta",
                urgent: false,
                proposals: 15
              }
            ].map((project) => (
              <ModernCard key={project.id} hover className="bg-white border-gray-100 shadow-sm transition-colors">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-700">{project.title}</h3>
                      <p className="text-sm text-gray-500">{project.client}</p>
                    </div>
                    {project.urgent && (
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-medium">Acil</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Bütçe:</span>
                      <p>{project.budget}</p>
                    </div>
                    <div>
                      <span className="font-medium">Süre:</span>
                      <p>{project.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs">{skill}</span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">{project.level} Seviye</span>
                    <span>{project.proposals} başvuru</span>
                  </div>
                  
                  <ModernButton size="sm" variant="secondary" className="w-full" onClick={() => navigate('/freelance-projects')}>
                    Başvur →
                  </ModernButton>
                </div>
              </ModernCard>
            ))}
          </div>
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default DashboardScreen;