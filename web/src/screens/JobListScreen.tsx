import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Heart, Users, Sparkles, Target, Trophy, BookOpen, MessageCircle, ArrowRight, Star, MapPin, Calendar, TrendingUp, Award, Zap, X, UserCheck, Briefcase, User, Settings, Bell, LogOut } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import NotificationBell from '../components/NotificationBell';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import SuccessStoryCard from '../components/SuccessStoryCard';
import MatchConfidenceBar from '../components/MatchConfidenceBar';
import InterviewPrepModal from '../components/InterviewPrepModal';
import AIChatbot from '../components/AIChatbot';
import UserMenu from '../components/UserMenu';
import { useNavigate } from 'react-router-dom';

const JobListScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSuccessStories, setShowSuccessStories] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [showNetworking, setShowNetworking] = useState(false);
  const [showMentorship, setShowMentorship] = useState(false);
  const [selectedNetworkType, setSelectedNetworkType] = useState<'networking' | 'mentorship' | null>(null);
  const [selectedAlumni, setSelectedAlumni] = useState<any>(null);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  // Kullanıcı bilgilerini state olarak tut
  const [currentUser, setCurrentUser] = useState({
    name: "Yükleniyor...",
    email: "",
    skills: [],
    completionRate: 85,
    profileViews: 234,
    appliedJobs: 0,
    interviews: 0,
    upschool_batch: "",
    graduation_date: "",
    firstName: "",
    lastName: "",
    experienceLevel: "entry"
  });

  // API'den kullanıcı profilini yükle
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = localStorage.getItem('uphera_user');
        if (!userData) {
          // Demo kullanıcı oluştur
          const demoUser = {
            id: 'demo-user-123',
            name: 'Demo Kullanıcı',
            email: 'demo@uphera.com',
            program: 'Frontend Development',
            isLoggedIn: true,
            token: 'demo-token-123',
            loginAt: new Date().toISOString(),
            userType: 'mezun'
          };
          localStorage.setItem('uphera_user', JSON.stringify(demoUser));
          setCurrentUser({
            name: demoUser.name,
            email: demoUser.email,
            skills: ['React', 'JavaScript', 'TypeScript'],
            completionRate: 85,
            profileViews: 234,
            appliedJobs: 5,
            interviews: 2,
            upschool_batch: demoUser.program,
            graduation_date: "2024",
            firstName: "Demo",
            lastName: "Kullanıcı",
            experienceLevel: "entry"
          });
          return;
        }

        const user = JSON.parse(userData);
        const token = user.token;

        // API URL'lerini sırayla dene
        const apiUrls = [
          'http://127.0.0.1:8000/api/me',
          'http://localhost:8000/api/me',
          'http://127.0.0.1:8000/api/auth/profile',
          'http://localhost:8000/api/auth/profile'
        ];

        let response = null;
        let lastError = null;

        for (const apiUrl of apiUrls) {
          try {
            console.log(`🔄 Kullanıcı profili yükleniyor: ${apiUrl}`);
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

        if (response.ok) {
          let firstName = ''
          let lastName = ''
          let email = ''
          let skills: string[] = []
          let bootcamp = ''
          let gradYear = ''
          let experienceLevel = 'entry'

          // Yeni /api/me yapısı
          if (data?.user && (data.user.first_name || data.user.last_name)) {
            firstName = data.user.first_name || ''
            lastName = data.user.last_name || ''
            email = data.user.email || ''
            skills = data?.profile?.skills || []
            bootcamp = data?.profile?.bootcamp_name || ''
            gradYear = data?.profile?.graduation_year ? String(data.profile.graduation_year) : ''
            experienceLevel = data?.profile?.experience_level || 'entry'
          }

          // Eski /api/auth/profile yapısı
          if (data?.success && data?.user && (data.user.firstName || data.user.lastName)) {
            firstName = data.user.firstName || firstName
            lastName = data.user.lastName || lastName
            email = data.user.email || email
            skills = data.user.skills || skills
            bootcamp = data.user.upschoolProgram || bootcamp
            gradYear = data.user.graduationDate || gradYear
            experienceLevel = data.user.experienceLevel || experienceLevel
          }

          const fullName = `${firstName} ${lastName}`.trim()
          setCurrentUser(prev => ({
            ...prev,
            name: fullName || prev.name,
            email: email || prev.email,
            skills,
            upschool_batch: bootcamp,
            graduation_date: gradYear,
            firstName: firstName,
            lastName: lastName,
            experienceLevel,
          }))

          console.log('✅ Kullanıcı profili yüklendi:', data);
        } else {
          toast.error(data.detail || 'Profil yüklenirken hata oluştu');
        }
      } catch (error: any) {
        console.error('Profil yükleme hatası:', error);
        toast.error('Profil yüklenirken hata oluştu');
      }
    };

    loadUserProfile();
  }, []);

  // UpSchool Alumni Network Data - Sadece kullanıcının kendi bilgileri
  const upschoolAlumni = [
    {
      id: "current_user",
      name: currentUser.name,
      batch: `${currentUser.upschool_batch || 'Data Science'}`,
      currentRole: `${currentUser.experienceLevel} Developer`,
      location: "Türkiye",
      skills: currentUser.skills,
      experience: "Yeni mezun",
      isOnline: true,
      profileImage: "/api/placeholder/40/40",
      bio: `${currentUser.upschool_batch || 'Data Science'} mezunu, teknoloji alanında kariyer yapmaya odaklanıyorum.`
    }
  ];

  // Senior Mentors Data - Kullanıcının kendi mentorluk durumu
  const seniorMentors = [
    {
      id: "current_user",
      name: currentUser.name,
      title: `${currentUser.experienceLevel} Developer`,
      company: "UpSchool Mezunu",
      experience: "Yeni mezun",
      specialties: currentUser.skills,
      location: "Türkiye",
      isAvailable: false,
      profileImage: "/api/placeholder/50/50",
      bio: `${currentUser.upschool_batch || 'Data Science'} mezunu, teknoloji alanında kariyer yapmaya odaklanıyorum.`,
      menteeCount: 0,
      rating: 0
    }
  ];

  // Carousel refs
  const jobsCarouselRef = useRef<HTMLDivElement>(null);
  const storiesCarouselRef = useRef<HTMLDivElement>(null);
  const communityCarouselRef = useRef<HTMLDivElement>(null);

  // Jobs data - API'den gelecek
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [matchingAlgorithm, setMatchingAlgorithm] = useState("");

  // API'den jobs verilerini yükle
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const userData = localStorage.getItem('uphera_user');
        if (!userData) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userData);
        const token = user.token;

        // API URL'lerini sırayla dene
        const apiUrls = [
          'http://127.0.0.1:8000/api/jobs',
          'http://localhost:8000/api/jobs'
        ];

        let response = null;
        let lastError = null;

        for (const apiUrl of apiUrls) {
          try {
            console.log(`🔄 Jobs yükleniyor: ${apiUrl}`);
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
          throw lastError || new Error('Jobs API\'lerine ulaşılamadı');
        }

        const data = await response.json();
        
        if (response.ok && data.success) {
          setJobs(data.jobs);
          setMatchingAlgorithm(data.matching_algorithm || "AI Matching");
          console.log(`✅ ${data.jobs.length} iş yüklendi, AI matching kullanıldı`);
        } else {
          throw new Error(data.detail || 'Jobs yüklenirken hata oluştu');
        }
      } catch (error) {
        console.error('❌ Jobs yükleme hatası:', error);
        toast.error('İş ilanları yüklenirken hata oluştu');
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, []);

  const [successStories] = useState([
    {
      id: "1",
      name: "Elif Demir",
      role: "Senior Frontend Developer",
      company: "Google",
      story: "UpSchool'dan mezun olduktan 6 ay sonra Google'da senior pozisyona başladım. Up Hera'nın eşleştirme algoritması sayesinde mükemmel bir fırsat yakaladım!",
      image: "/api/placeholder/100/100",
      upschool_batch: "Frontend Development #42",
      timeline: "6 ay sonra",
      current_salary: "85.000 TL"
    },
    {
      id: "2", 
      name: "Zeynep Akar",
      role: "ML Engineer",
      company: "Microsoft",
      story: "Data Science bootcamp'inin ardından Up Hera ile Microsoft'ta hayallerimin işini buldum. Kadın developer ağının gücü inanılmaz!",
      image: "/api/placeholder/100/100",
      upschool_batch: "Data Science #28",
      timeline: "3 ay sonra",
      current_salary: "75.000 TL"
    },
    {
      id: "3",
      name: "Selin Koç",
      role: "Product Manager",
      company: "Amazon",
      story: "UI/UX bootcamp'i tamamladıktan sonra teknik bilgilerimi Product Management'a evirmek için Up Hera'nın mentorluk programından yararlandım.",
      image: "/api/placeholder/100/100",
      upschool_batch: "UI/UX Design #35",
      timeline: "4 ay sonra",
      current_salary: "70.000 TL"
    },
    {
      id: "4",
      name: "Ayşen Gürel",
      role: "DevOps Engineer",
      company: "Netflix",
      story: "Backend Development bootcamp'inin ardından bulut teknolojilerine odaklandım. Up Hera'nın AI koçu ile interview hazırlığımı yaptım.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Backend Development #31",
      timeline: "8 ay sonra",
      current_salary: "90.000 TL"
    },
    {
      id: "5",
      name: "Cemre Özkan",
      role: "Mobile Developer",
      company: "Spotify",
      story: "React Native bootcamp'i sonrası mobil geliştirme tutkumla Spotify'da harika projeler üretiyorum. UpSchool ailesi hep destekleyici!",
      image: "/api/placeholder/100/100",
      upschool_batch: "Mobile Development #29",
      timeline: "5 ay sonra",
      current_salary: "65.000 TL"
    }
  ]);

  const [communityHighlights] = useState([
    {
      id: "1",
      type: "achievement",
      title: "Bu Ay 47 UpSchool Mezunu İşe Yerleşti!",
      description: "Topluluk olarak birbirimizi desteklemeye devam ediyoruz",
      icon: <Award className="h-6 w-6" />,
      color: "bg-yellow-500",
      action: "Başarı hikayelerni gör"
    },
    {
      id: "2",
      type: "mentorship",
      title: "Mentorship Programımıza Katıl",
      description: "Deneyimli kadın geliştiricilerden 1:1 mentorluk al",
      icon: <Users className="h-6 w-6" />,
      color: "bg-purple-500",
      action: "Mentor bul"
    },
    {
      id: "3",
      type: "event",
      title: "Tech Talk: Women in AI",
      description: "15 Ocak | Online | Konuşmacı: Google'dan Dr. Ayşe Kara",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-blue-500",
      action: "Katıl"
    },
    {
      id: "4",
      type: "networking",
      title: "İstanbul Developer Meetup",
      description: "20 UpSchool mezunu kahve buluşması - 18 Ocak",
      icon: <MapPin className="h-6 w-6" />,
      color: "bg-green-500",
      action: "Kayıt ol"
    },
    {
      id: "5",
      type: "opportunity",
      title: "Freelance Proje Fırsatları",
      description: "Partner şirketlerden özel projeler - deneyim kazan",
      icon: <Zap className="h-6 w-6" />,
      color: "bg-orange-500",
      action: "Projeleri gör"
    }
  ]);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 320;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCommunityAction = (type: string, action: string) => {
    switch (type) {
      case 'achievement':
        // Başarı hikayeleri sayfasına yönlendir
        navigate('/success-stories');
        break;
      case 'mentorship':
        // Mentorship sayfasına yönlendir
        navigate('/mentorship');
        break;
      case 'event':
        // Etkinlik sayfasına yönlendir
        navigate('/events');
        break;
      case 'networking':
        // Network modalını aç
        setSelectedNetworkType('networking');
        setShowNetworking(true);
        break;
      case 'opportunity':
        // Freelance projeler sayfasına yönlendir
        navigate('/freelance-projects');
        break;
      default:
        toast('Bu özellik yakında geliyor!', { icon: <Sparkles className="inline h-4 w-4" /> });
    }
  };

  const testEnhancedMatching = async () => {
    try {
      toast('🤖 Enhanced AI Matching testi başlatılıyor...', { icon: '⚡' });
      
      const response = await fetch('http://localhost:8000/api/jobs/enhanced-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: {
            id: currentUser.email,
            name: currentUser.name,
            skills: currentUser.skills,
            experience_years: 1,
            location: "İstanbul",
            salary_expectation: 35000,
            upschool_batch: currentUser.upschool_batch,
            projects: [
              {
                name: "UpSchool Final Project",
                description: "React ve TypeScript ile geliştirilmiş modern web uygulaması"
              }
            ]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Show enhanced matching results
      toast.success(`🎯 Enhanced AI Matching tamamlandı! ${data.total_matches} eşleşme bulundu.`, {
        duration: 4000
      });
      
      // Log detailed results to console
      console.log('Enhanced Matching Results:', data);
      console.log('Top Match:', data.matches[0]);
      
      // Show top match details
      if (data.matches && data.matches.length > 0) {
        const topMatch = data.matches[0];
        toast.success(
          `🥇 En iyi eşleşme: ${topMatch.company} - ${topMatch.title} (%${topMatch.match_score} uyum)`,
          { duration: 6000 }
        );
      }
      
    } catch (error) {
      console.error('Enhanced Matching Error:', error);
      toast.error('Enhanced matching test hatası: ' + error);
    }
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  const handleApply = async (jobId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Başvurunuz başarıyla gönderildi!');
      setShowModal(false);
    } catch (error) {
      toast.error('Başvuru gönderilirken hata oluştu');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      {/* Modern Header */}
      <div className="up-page-header">
        <div className="up-container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate('/dashboard')} className="flex items-center">
                <BrandLogo size={175} />
              </button>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => navigate('/network')}
                className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: 'var(--up-dark-gray)' }}
              >
                Topluluk
              </button>
              <button 
                onClick={() => navigate('/events')}
                className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: 'var(--up-dark-gray)' }}
              >
                Etkinlikler
              </button>
              <button 
                onClick={() => navigate('/mentorship')}
                className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: 'var(--up-dark-gray)' }}
              >
                Mentorluk
              </button>
              <button 
                onClick={() => navigate('/interview-prep')}
                className="text-sm font-medium transition-colors hover:text-blue-600"
                style={{ color: 'var(--up-dark-gray)' }}
              >
                Ada AI
              </button>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <h1 className="text-xs font-medium" style={{ color: 'var(--up-dark-gray)' }}>
                  {currentUser.firstName || 'Misafir'} Hoş Geldin! 👋
                </h1>
              </div>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <details className="relative">
                  <summary className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer list-none"
                    style={{ 
                      backgroundColor: 'var(--up-primary)', 
                      color: 'white'
                    }}
                  >
                    Profil ▼
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profil Düzenle
                    </button>
                    <button 
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Ayarlar
                    </button>
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b flex items-center"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Bildirimler
                    </button>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('uphera_user');
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                </details>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <details className="relative">
                  <summary className="px-3 py-2 border rounded text-sm cursor-pointer list-none"
                    style={{ color: 'var(--up-dark-gray)' }}
                  >
                    Menü ▼
                  </summary>
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                    <button onClick={() => navigate('/network')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Topluluk</button>
                    <button onClick={() => navigate('/events')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Etkinlikler</button>
                    <button onClick={() => navigate('/mentorship')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Mentorluk</button>
                    <button onClick={() => navigate('/interview-prep')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm">Ada AI</button>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-8">
        
        {/* Hero Section - UpSchool Community Welcome */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-lg font-medium" style={{ color: 'var(--up-primary-dark)' }}>
                  Teknolojide Öncü Kadınlar Topluluğu
                </span>
              </div>
              
              <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                Hoş Geldin, {currentUser.name.split(' ')[0]}! 👋
              </h1>
              
              <p className="text-xl mb-6" style={{ color: 'var(--up-dark-gray)' }}>
                <strong>{currentUser.upschool_batch}</strong> bootcamp'i {currentUser.graduation_date}'te tamamladın, 
                ama <strong>UpSchool'daki iletişimimiz bitmedi!</strong> 
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-blue-600">Kendine İş Bul</span>
                  </div>
                  <p className="text-sm text-gray-600">AI destekli eşleştirme ile hayallerindeki pozisyonu yakala</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="font-medium text-purple-600">Toplulukta Güçlen</span>
                  </div>
                  <p className="text-sm text-gray-600">Diğer teknoloji kadınları ile network kur, deneyim paylaş</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-green-600">Diğerlerini Destekle</span>
                  </div>
                  <p className="text-sm text-gray-600">Mentorluk yap, bilgini paylaş, birlikte büyü</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats - More Personal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <ModernCard className="p-4 text-center bg-gradient-to-b from-blue-50 to-white">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--up-primary)' }}>
              {currentUser.completionRate}%
            </div>
            <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              Profil Gücü
            </div>
          </ModernCard>
          
          <ModernCard className="p-4 text-center bg-gradient-to-b from-purple-50 to-white">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--up-primary)' }}>
              {currentUser.appliedJobs}
            </div>
            <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              Aktif Başvuru
            </div>
          </ModernCard>
          
          <ModernCard className="p-4 text-center bg-gradient-to-b from-green-50 to-white">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--up-primary)' }}>
              {currentUser.interviews}
            </div>
            <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              Mülakat Fırsatı
            </div>
          </ModernCard>
          
          <ModernCard className="p-4 text-center bg-gradient-to-b from-pink-50 to-white">
            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--up-primary)' }}>
              234
            </div>
            <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              Network Bağlantısı
            </div>
          </ModernCard>
        </div>

        {/* Community Highlights Carousel */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                UpSchool Topluluğu 💫
              </h2>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                Birlikte büyüyor, birbirimizi destekliyoruz
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollCarousel(communityCarouselRef, 'left')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
              <button
                onClick={() => scrollCarousel(communityCarouselRef, 'right')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
            </div>
          </div>
          
          <div 
            ref={communityCarouselRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {communityHighlights.map((highlight) => (
              <div 
                key={highlight.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${highlight.color} text-white`}>
                    {highlight.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      {highlight.title}
                    </h3>
                    <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
                      {highlight.description}
                    </p>
                    <button 
                      onClick={() => handleCommunityAction(highlight.type, highlight.action)}
                      className="flex items-center space-x-2 text-sm font-medium transition-colors hover:underline"
                      style={{ color: 'var(--up-primary)' }}
                    >
                      <span>{highlight.action}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories Carousel - Enhanced */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                Başarı Hikayeleri 🌟
              </h2>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                UpSchool mezunlarının ilham verici kariyer yolculukları
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollCarousel(storiesCarouselRef, 'left')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
              <button
                onClick={() => scrollCarousel(storiesCarouselRef, 'right')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
            </div>
          </div>
          
          <div 
            ref={storiesCarouselRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {successStories.map((story) => (
              <div 
                key={story.id}
                className="flex-shrink-0 w-96 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4 mb-4">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                      {story.name}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--up-primary)' }}>
                      {story.role} @ {story.company}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      <span>📚 {story.upschool_batch}</span>
                      <span>⏱️ {story.timeline}</span>
                      <span>💰 {story.current_salary}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed" style={{ color: 'var(--up-dark-gray)' }}>
                  "{story.story}"
                </p>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <button 
                    onClick={() => setSelectedStory(story)}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--up-primary)' }}
                  >
                    Hikayeyi oku
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Opportunities Carousel */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                Sana Özel İş Fırsatları 🎯
              </h2>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                AI algoritması senin becerilerine göre seçti
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollCarousel(jobsCarouselRef, 'left')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronLeft className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
              <button
                onClick={() => scrollCarousel(jobsCarouselRef, 'right')}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--up-light-gray)' }}
              >
                <ChevronRight className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              </button>
            </div>
          </div>
          
          <div 
            ref={jobsCarouselRef}
            className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {jobsLoading ? (
              <div className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-sm text-center">
                <p style={{ color: 'var(--up-dark-gray)' }}>İş ilanı bulunamadı</p>
              </div>
            ) : (
              jobs.map((job) => (
              <div 
                key={job.id}
                className="flex-shrink-0 w-80 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={job.company_logo} 
                      alt={job.company}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                        {job.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                        {job.company}
                      </p>
                    </div>
                  </div>
                                     <div className="text-right">
                     <MatchConfidenceBar matchScore={job.match_score} confidence={job.match_score} />
                     <span className="text-xs font-medium" style={{ color: 'var(--up-primary)' }}>
                       %{job.match_score} uyum
                     </span>
                   </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    <MapPin className="h-3 w-3" />
                    <span>{job.location}</span>
                    {job.remote_friendly && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">Remote OK</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    <TrendingUp className="h-3 w-3" />
                    <span>{job.salary_range}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {job.required_skills.slice(0, 3).map((skill: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 rounded text-xs"
                        style={{ background: 'var(--up-light-gray)', color: 'var(--up-primary)' }}
                      >
                        {skill}
                      </span>
                    ))}
                    {job.required_skills.length > 3 && (
                      <span className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                        +{job.required_skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                  <span 
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{ background: 'var(--up-primary)', color: 'white' }}
                  >
                    {job.urgency}
                  </span>
                  <button 
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'var(--up-primary)' }}
                  >
                    Detayları Gör →
                  </button>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <ModernCard className="p-6 text-center bg-gradient-to-b from-blue-50 to-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              Mülakat Hazırlığı
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              AI koçun ile mülakata hazırlan, kendine güven
            </p>
            <ModernButton
              onClick={() => setShowInterviewPrep(true)}
              className="w-full"
            >
              Hazırlığa Başla
            </ModernButton>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-b from-purple-50 to-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-4 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              Network
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              Diğer UpSchool mezunları ile bağlan
            </p>
            <ModernButton
              onClick={() => window.location.href = '/network'}
              className="w-full"
              variant="outline"
            >
              Ağını Genişlet
            </ModernButton>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-b from-green-50 to-white hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--up-primary-dark)' }}>
              AI Asistan
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
              Kariyer sorularında 7/24 desteğin yanında
            </p>
            <ModernButton
              onClick={() => setShowAIChat(true)}
              className="w-full"
              variant="outline"
            >
              Sohbet Et
            </ModernButton>
          </ModernCard>
        </div>
      </div>

      {/* Modals */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    {selectedJob.title}
                  </h2>
                  <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
                    {selectedJob.company} • {selectedJob.location}
                  </p>
                  <p className="text-lg font-semibold mt-2" style={{ color: 'var(--up-primary)' }}>
                    {selectedJob.salary_range}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
                             <div className="mb-6">
                 <MatchConfidenceBar matchScore={selectedJob.match_score} confidence={selectedJob.match_score} />
               </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Gerekli Beceriler:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.required_skills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm"
                      style={{ background: 'var(--up-light-gray)', color: 'var(--up-primary)' }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">İş Tanımı:</h3>
                <p style={{ color: 'var(--up-dark-gray)' }}>{selectedJob.description}</p>
              </div>
              
              <div className="flex space-x-4">
                <ModernButton
                  onClick={() => handleApply(selectedJob.id)}
                  className="flex-1"
                >
                  Başvur
                </ModernButton>
                <ModernButton
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Daha Sonra
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Networking Modal */}
      {showNetworking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6" style={{ color: 'var(--up-primary)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  UpSchool Alumni Network
                </h2>
              </div>
              <button
                onClick={() => setShowNetworking(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Diğer UpSchool mezunları ile bağlan, deneyim paylaş ve birlikte büyü! 🚀
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {upschoolAlumni.filter(a => a.isOnline).length} kişi aktif
                  </span>
                  <span>{upschoolAlumni.length} toplam mezun</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upschoolAlumni.map((alumni) => (
                  <div key={alumni.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img 
                          src={alumni.profileImage} 
                          alt={alumni.name}
                          className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                          onClick={() => setSelectedAlumni(alumni)}
                        />
                        {alumni.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => setSelectedAlumni(alumni)}
                            >
                              {alumni.name}
                            </h3>
                            <p className="text-sm text-gray-600">{alumni.currentRole}</p>
                            <p className="text-xs text-gray-500">{alumni.batch} • {alumni.location}</p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {alumni.experience}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 mt-2 mb-3">{alumni.bio}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {alumni.skills.slice(0, 3).map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {alumni.skills.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                              +{alumni.skills.length - 3}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              toast.success(`${alumni.name} ile bağlantı isteği gönderildi! 🤝`);
                            }}
                            className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Bağlantı Kur
                          </button>
                          <button
                            onClick={() => {
                              toast.success(`${alumni.name} ile mesajlaşma başlatıldı! 💬`);
                              setShowNetworking(false);
                              // Burada chat sayfasına yönlendirme olacak
                            }}
                            className="flex-1 border border-blue-600 text-blue-600 text-sm py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            Mesaj Gönder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Yaklaşan Network Etkinlikleri</h4>
                    <p className="text-sm text-blue-700">
                      • İstanbul Tech Meetup - 15 Ocak 2025 <br/>
                      • Online Career Panel - 22 Ocak 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mentorship Modal */}
      {showMentorship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="h-6 w-6" style={{ color: 'var(--up-primary)' }} />
                <h2 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  Senior Mentor Network
                </h2>
              </div>
              <button
                onClick={() => setShowMentorship(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Sektördeki deneyimli kadın liderlerden mentorluk al ve kariyerini hızlandır! ⭐
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {seniorMentors.filter(m => m.isAvailable).length} mentor mevcut
                  </span>
                  <span>{seniorMentors.length} toplam mentor</span>
                </div>
              </div>

              <div className="space-y-4">
                {seniorMentors.map((mentor) => (
                  <div key={mentor.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <img 
                          src={mentor.profileImage} 
                          alt={mentor.name}
                          className="w-16 h-16 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all"
                          onClick={() => setSelectedMentor(mentor)}
                        />
                        {mentor.isAvailable && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 
                              className="font-bold text-lg text-gray-900 cursor-pointer hover:text-purple-600 transition-colors"
                              onClick={() => setSelectedMentor(mentor)}
                            >
                              {mentor.name}
                            </h3>
                            <p className="text-blue-600 font-semibold">{mentor.title}</p>
                            <p className="text-gray-600">{mentor.company} • {mentor.location}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-500">{mentor.experience} deneyim</span>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium ml-1">{mentor.rating}</span>
                              </div>
                              <span className="text-sm text-gray-500">{mentor.menteeCount} mentee</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {mentor.isAvailable ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Müsait
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Dolu
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mt-3 mb-4">{mentor.bio}</p>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanları:</p>
                          <div className="flex flex-wrap gap-2">
                            {mentor.specialties.map((specialty, index) => (
                              <span
                                key={index}
                                className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              if (mentor.isAvailable) {
                                toast.success(`${mentor.name} ile mentorluk isteği gönderildi! 🌟`);
                              } else {
                                toast.error('Bu mentor şu anda yeni mentee kabul etmiyor.');
                              }
                            }}
                            disabled={!mentor.isAvailable}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                              mentor.isAvailable 
                                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Mentorluk İste
                          </button>
                          <button
                            onClick={() => {
                              toast.success(`${mentor.name} ile mesajlaşma başlatıldı! 💬`);
                              setShowMentorship(false);
                              // Burada chat sayfasına yönlendirme olacak
                            }}
                            className="flex-1 border border-purple-600 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                          >
                            Mesaj Gönder
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Mentorluk Programı</h4>
                    <p className="text-sm text-purple-700">
                      • 1-on-1 haftalık görüşmeler <br/>
                      • Career roadmap oluşturma <br/>
                      • Technical interview preparation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
              )}

        {/* Alumni Profile Detail Modal */}
        {selectedAlumni && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="relative">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
                  <button
                    onClick={() => setSelectedAlumni(null)}
                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                  
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img 
                        src={selectedAlumni.profileImage} 
                        alt={selectedAlumni.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-white"
                      />
                      {selectedAlumni.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedAlumni.name}</h2>
                      <p className="text-blue-100 text-lg">{selectedAlumni.currentRole}</p>
                      <p className="text-blue-200 text-sm">{selectedAlumni.batch} • {selectedAlumni.location}</p>
                      <div className="flex items-center mt-2">
                        <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                          {selectedAlumni.experience} deneyim
                        </span>
                        {selectedAlumni.isOnline && (
                          <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full ml-2">
                            Aktif
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* Bio */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Hakkında</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedAlumni.bio}</p>
                  </div>
                  
                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teknik Beceriler</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAlumni.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* UpSchool Badge */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Trophy className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">UpSchool Mezunu</h4>
                        <p className="text-sm text-gray-600">{selectedAlumni.batch}</p>
                        <p className="text-xs text-gray-500">Kadın teknoloji liderleri programı</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Career Stats */}
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedAlumni.experience}</div>
                      <div className="text-sm text-gray-600">Deneyim</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedAlumni.skills.length}</div>
                      <div className="text-sm text-gray-600">Teknik Beceri</div>
                    </div>
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        toast.success(`${selectedAlumni.name} ile bağlantı isteği gönderildi! 🤝`);
                        setSelectedAlumni(null);
                      }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      🤝 Bağlantı Kur
                    </button>
                    <button
                      onClick={() => {
                        toast.success(`${selectedAlumni.name} ile mesajlaşma başlatıldı! 💬`);
                        setSelectedAlumni(null);
                        // Burada chat sayfasına yönlendirme olacak
                      }}
                      className="w-full border border-blue-600 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                    >
                      💬 Mesaj Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Profile Detail Modal */}
        {selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="relative">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 rounded-t-xl">
                  <button
                    onClick={() => setSelectedMentor(null)}
                    className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                  
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img 
                        src={selectedMentor.profileImage} 
                        alt={selectedMentor.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white"
                      />
                      {selectedMentor.isAvailable && (
                        <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedMentor.name}</h2>
                      <p className="text-purple-100 text-lg font-semibold">{selectedMentor.title}</p>
                      <p className="text-purple-200">{selectedMentor.company} • {selectedMentor.location}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="bg-white bg-opacity-20 text-white text-sm px-3 py-1 rounded-full">
                          {selectedMentor.experience} deneyim
                        </span>
                        <div className="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          <Star className="h-4 w-4 text-yellow-300 fill-current mr-1" />
                          <span className="text-white text-sm font-medium">{selectedMentor.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  {/* Bio */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mentorluk Yaklaşımı</h3>
                    <p className="text-gray-700 leading-relaxed">{selectedMentor.bio}</p>
                  </div>
                  
                  {/* Specialties */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Uzmanlık Alanları</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMentor.specialties.map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Mentor Stats */}
                  <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">{selectedMentor.menteeCount}</div>
                      <div className="text-sm text-gray-600">Mentee</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">{selectedMentor.rating}</div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedMentor.experience.replace(' yıl', '')}</div>
                      <div className="text-sm text-gray-600">Yıl Deneyim</div>
                    </div>
                  </div>
                  
                  {/* Mentorship Program Info */}
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900">Mentorluk Programı</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Haftalık 1-on-1 görüşmeler</li>
                      <li>• Kişiselleştirilmiş kariyer roadmap</li>
                      <li>• Technical interview hazırlığı</li>
                      <li>• Industry network'üne erişim</li>
                    </ul>
                  </div>
                  
                  {/* Availability Status */}
                  <div className="mb-6">
                    {selectedMentor.isAvailable ? (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-green-800 font-medium">Yeni mentee kabul ediyor</span>
                      </div>
                    ) : (
                      <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-red-800 font-medium">Şu anda dolu - bekleme listesine eklenebilir</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Contact Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (selectedMentor.isAvailable) {
                          toast.success(`${selectedMentor.name} ile mentorluk isteği gönderildi! 🌟`);
                        } else {
                          toast.success(`${selectedMentor.name} bekleme listesine eklendiniz! ⏳`);
                        }
                        setSelectedMentor(null);
                      }}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                        selectedMentor.isAvailable 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      {selectedMentor.isAvailable ? '🌟 Mentorluk İste' : '⏳ Bekleme Listesine Ekle'}
                    </button>
                    <button
                      onClick={() => {
                        toast.success(`${selectedMentor.name} ile mesajlaşma başlatıldı! 💬`);
                        setSelectedMentor(null);
                        // Burada chat sayfasına yönlendirme olacak
                      }}
                      className="w-full border border-purple-600 text-purple-600 py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors font-medium"
                    >
                      💬 Mesaj Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

             {showInterviewPrep && (
         <InterviewPrepModal
           isOpen={showInterviewPrep}
           onClose={() => setShowInterviewPrep(false)}
           jobTitle="Frontend Developer"
           company="Up Hera"
         />
       )}

             {showAIChat && (
         <AIChatbot
           isOpen={showAIChat}
           onClose={() => setShowAIChat(false)}
           context="general"
         />
       )}

       {/* Success Stories Modal */}
       {showSuccessStories && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
             {/* Modal Header */}
             <div className="p-6 border-b" style={{ borderColor: 'var(--up-light-gray)' }}>
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                     UpSchool Başarı Hikayeleri 🌟
                   </h2>
                   <p className="text-sm mt-1" style={{ color: 'var(--up-dark-gray)' }}>
                     Mezunlarımızın ilham verici kariyer yolculukları
                   </p>
                 </div>
                 <button
                   onClick={() => setShowSuccessStories(false)}
                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                 >
                   <span className="text-2xl" style={{ color: 'var(--up-dark-gray)' }}>×</span>
                 </button>
               </div>
             </div>
             
             {/* Modal Content */}
             <div className="p-6 overflow-y-auto max-h-[60vh]">
               <div className="grid gap-6">
                 {successStories.map((story) => (
                   <div 
                     key={story.id}
                     className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6"
                   >
                     <div className="flex items-start space-x-4">
                       <img 
                         src={story.image} 
                         alt={story.name}
                         className="w-20 h-20 rounded-full object-cover"
                       />
                       <div className="flex-1">
                         <div className="flex items-center justify-between mb-2">
                           <h3 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                             {story.name}
                           </h3>
                           <div className="flex items-center space-x-1">
                             {[1,2,3,4,5].map((star) => (
                               <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                             ))}
                           </div>
                         </div>
                         
                         <p className="font-medium text-lg mb-2" style={{ color: 'var(--up-primary)' }}>
                           {story.role} @ {story.company}
                         </p>
                         
                         <div className="flex items-center space-x-6 mb-4 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                           <span>📚 {story.upschool_batch}</span>
                           <span>⏱️ {story.timeline}</span>
                           <span>💰 {story.current_salary}</span>
                         </div>
                         
                         <p className="text-base leading-relaxed" style={{ color: 'var(--up-dark-gray)' }}>
                           "{story.story}"
                         </p>
                         
                         <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                           <button 
                             onClick={() => toast.success(`${story.name} ile LinkedIn'de bağlantı kurabilirsin! 🔗`)}
                             className="px-4 py-2 rounded-lg font-medium transition-colors"
                             style={{ 
                               background: 'var(--up-primary)', 
                               color: 'white' 
                             }}
                           >
                             LinkedIn'de Bağlan
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
         </div>
               )}

       {/* Individual Success Story Modal */}
       {selectedStory && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
             {/* Modal Header */}
             <div className="relative">
               <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                 <button
                   onClick={() => setSelectedStory(null)}
                   className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                 >
                   <span className="text-2xl">×</span>
                 </button>
                 
                 <div className="flex items-start space-x-4">
                   <img 
                     src={selectedStory.image} 
                     alt={selectedStory.name}
                     className="w-20 h-20 rounded-full object-cover border-4 border-white"
                   />
                   <div className="flex-1">
                     <h2 className="text-2xl font-bold mb-2">
                       {selectedStory.name}
                     </h2>
                     <p className="text-lg font-medium opacity-90 mb-2">
                       {selectedStory.role} @ {selectedStory.company}
                     </p>
                     <div className="flex items-center space-x-4 text-sm opacity-80">
                       <span>📚 {selectedStory.upschool_batch}</span>
                       <span>⏱️ {selectedStory.timeline}</span>
                       <span>💰 {selectedStory.current_salary}</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* Modal Content */}
             <div className="p-6 overflow-y-auto max-h-[50vh]">
               <div className="mb-6">
                 <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--up-primary-dark)' }}>
                   Başarı Hikayesi 🌟
                 </h3>
                 <p className="text-base leading-relaxed" style={{ color: 'var(--up-dark-gray)' }}>
                   "{selectedStory.story}"
                 </p>
               </div>
               
               {/* Detailed Info */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                 <div className="bg-blue-50 p-4 rounded-lg">
                   <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--up-primary)' }}>
                     UpSchool Deneyimi
                   </h4>
                   <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                     {selectedStory.upschool_batch} programını tamamladıktan sonra {selectedStory.timeline} içinde başarıyla işe yerleşti.
                   </p>
                 </div>
                 
                 <div className="bg-green-50 p-4 rounded-lg">
                   <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--up-primary)' }}>
                     Kariyer Gelişimi
                   </h4>
                   <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                     Şu anda {selectedStory.company}'de {selectedStory.role} pozisyonunda çalışıyor ve {selectedStory.current_salary} maaş alıyor.
                   </p>
                 </div>
               </div>
               
               {/* Rating */}
               <div className="flex items-center justify-center space-x-2 mb-6">
                 <span className="text-sm font-medium" style={{ color: 'var(--up-dark-gray)' }}>
                   UpSchool Deneyimi:
                 </span>
                 <div className="flex items-center space-x-1">
                   {[1,2,3,4,5].map((star) => (
                     <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                   ))}
                 </div>
                 <span className="text-sm font-medium" style={{ color: 'var(--up-primary)' }}>
                   5.0/5.0
                 </span>
               </div>
               
               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                   onClick={() => {
                     toast.success(`${selectedStory.name} ile LinkedIn'de bağlantı kurabilirsin! 🔗`);
                     setSelectedStory(null);
                   }}
                   className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors"
                   style={{ 
                     background: 'var(--up-primary)', 
                     color: 'white' 
                   }}
                 >
                   LinkedIn'de Bağlan
                 </button>
                 
                 <button 
                   onClick={() => {
                     toast.success('Mesaj gönderildi! Yakında senden haber alacak 💌');
                     setSelectedStory(null);
                   }}
                   className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors border-2"
                   style={{ 
                     borderColor: 'var(--up-primary)',
                     color: 'var(--up-primary)',
                     background: 'white'
                   }}
                 >
                   Mesaj Gönder
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}

        {/* Footer */}
        <footer className="mt-16 py-8 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                 <BrandLogo size={56} />
              </div>
              <div className="mb-3 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                Teknolojide Öncü Kadınlar Topluluğu
              </div>
              <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                <span>© 2025 Up Hera</span>
                <span>•</span>
                <span>UpSchool Partnership</span>
              </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JobListScreen; 