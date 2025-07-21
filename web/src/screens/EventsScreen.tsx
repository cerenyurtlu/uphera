import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  CheckCircle, 
  ExternalLink, 
  Filter, 
  Search, 
  Plus,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  CalendarCheck,
  Building,
  Award
} from 'lucide-react';
import HireHerLogo from '../components/HireHerLogo';
import NotificationBell from '../components/NotificationBell';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';

const EventsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Expanded events data with more realistic information
  const events = [
    {
      id: "1",
      title: "Frontend Developer Network Meetup",
      category: "networking",
      date: "2025-02-15",
      time: "19:00",
      duration: "3 saat",
      location: "TechHub İstanbul, Maslak",
      type: "Yüz Yüze",
      organizer: "UpSchool Alumni Network",
      description: "Frontend teknolojileri ve kariyer fırsatları üzerine networking etkinliği. React, TypeScript ve modern web teknolojileri konuşulacak.",
      maxParticipants: 50,
      currentParticipants: 23,
      tags: ["React", "TypeScript", "Networking", "Career"],
      level: "Tüm Seviyeler",
      featured: true,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "19:00", title: "Karşılama ve Networking" },
        { time: "19:30", title: "Frontend Trends 2025 - Panel" },
        { time: "20:30", title: "Serbest Networking & Kahve" },
        { time: "21:30", title: "Grup Fotoğrafı" }
      ],
      speakers: [
        { name: "Ayşe Demir", role: "Senior Frontend Dev @ Trendyol", avatar: "/api/placeholder/40/40" },
        { name: "Mehmet Kaya", role: "Tech Lead @ Getir", avatar: "/api/placeholder/40/40" }
      ],
      requirements: ["Laptop (isteğe bağlı)", "Networking Card"],
      benefits: ["Sertifika", "Networking", "Goodies"]
    },
    {
      id: "2",
      title: "UI/UX Workshop: Figma'dan Prototype'a",
      category: "workshop",
      date: "2025-02-20",
      time: "14:00",
      duration: "4 saat",
      location: "Online (Zoom)",
      type: "Online",
      organizer: "UpSchool Design Team",
      description: "Figma ile profesyonel tasarım süreçleri ve interaktif prototip oluşturma workshop'u. Hands-on proje ile öğrenin.",
      maxParticipants: 30,
      currentParticipants: 18,
      tags: ["Figma", "UI/UX", "Prototyping", "Design"],
      level: "Başlangıç-Orta",
      featured: false,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "14:00", title: "Figma Temelleri" },
        { time: "15:00", title: "Design System Oluşturma" },
        { time: "16:00", title: "Mola" },
        { time: "16:15", title: "Interactive Prototyping" },
        { time: "17:30", title: "Proje Sunumları" }
      ],
      speakers: [
        { name: "Zeynep Özkan", role: "Senior UX Designer @ Hepsiburada", avatar: "/api/placeholder/40/40" }
      ],
      requirements: ["Figma Account (Free)", "Stable Internet"],
      benefits: ["Certificate", "Workshop Materials", "1-1 Feedback"]
    },
    {
      id: "3",
      title: "Tech Career Panel: Startup vs Corporate",
      category: "panel",
      date: "2025-02-25",
      time: "18:30",
      duration: "2 saat",
      location: "Impact Hub Ankara",
      type: "Hibrit",
      organizer: "UpSchool Career Center",
      description: "Startup ve corporate dünyasında kariyer fırsatları, avantajlar ve zorluklar üzerine deneyimli profesyonellerle panel.",
      maxParticipants: 80,
      currentParticipants: 45,
      tags: ["Career", "Startup", "Corporate", "Panel"],
      level: "Tüm Seviyeler",
      featured: true,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "18:30", title: "Açılış ve Tanışma" },
        { time: "18:45", title: "Startup Deneyimleri" },
        { time: "19:15", title: "Corporate Dünya" },
        { time: "19:45", title: "Q&A Oturumu" },
        { time: "20:15", title: "Networking" }
      ],
      speakers: [
        { name: "Emre Acar", role: "CTO @ Peak Games", avatar: "/api/placeholder/40/40" },
        { name: "Selin Yıldız", role: "Engineering Manager @ Microsoft", avatar: "/api/placeholder/40/40" },
        { name: "Can Mutlu", role: "Founder @ StartupX", avatar: "/api/placeholder/40/40" }
      ],
      requirements: ["Kalem & Kağıt"],
      benefits: ["Career Guide", "Networking", "Q&A"]
    },
    {
      id: "4",
      title: "Casual Friday: Alumni Coffee Chat",
      category: "casual",
      date: "2025-02-28",
      time: "17:00",
      duration: "2 saat",
      location: "Starbucks Nişantaşı",
      type: "Yüz Yüze",
      organizer: "UpSchool Community",
      description: "Rahat ortamda mezunlarla buluşma, deneyim paylaşımı ve sohbet. Her cumartesi düzenlenen geleneksel buluşma.",
      maxParticipants: 25,
      currentParticipants: 12,
      tags: ["Coffee", "Casual", "Alumni", "Networking"],
      level: "Tüm Seviyeler",
      featured: false,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "17:00", title: "Karşılama & Kahve" },
        { time: "17:30", title: "Serbest Sohbet" },
        { time: "18:30", title: "Grup Aktivitesi" }
      ],
      speakers: [],
      requirements: ["Sadece güler yüz 😊"],
      benefits: ["New Friends", "Relax", "Fun"]
    },
    {
      id: "5",
      title: "Backend Mastery: Node.js & MongoDB",
      category: "workshop",
      date: "2025-03-05",
      time: "10:00",
      duration: "6 saat",
      location: "UpSchool Campus İzmir",
      type: "Yüz Yüze",
      organizer: "UpSchool Backend Team",
      description: "Node.js ve MongoDB ile backend geliştirme deep-dive workshop'u. RESTful API, authentication ve deployment konuları.",
      maxParticipants: 20,
      currentParticipants: 8,
      tags: ["Node.js", "MongoDB", "Backend", "API"],
      level: "Orta-İleri",
      featured: true,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "10:00", title: "Node.js Temelleri" },
        { time: "11:30", title: "MongoDB & Mongoose" },
        { time: "12:30", title: "Öğle Yemeği" },
        { time: "13:30", title: "RESTful API Geliştirme" },
        { time: "15:00", title: "Authentication & Security" },
        { time: "16:00", title: "Deployment & Best Practices" }
      ],
      speakers: [
        { name: "Ahmet Yıldırım", role: "Senior Backend Engineer @ GittiGidiyor", avatar: "/api/placeholder/40/40" }
      ],
      requirements: ["Laptop", "Node.js Installed", "Basic JS Knowledge"],
      benefits: ["Certificate", "Code Repository", "Lunch"]
    },
    {
      id: "6",
      title: "Women in Tech: Inspiration Talk",
      category: "panel",
      date: "2025-03-08",
      time: "19:00",
      duration: "2.5 saat",
      location: "Online (YouTube Live)",
      type: "Online",
      organizer: "UpSchool Women Leadership",
      description: "8 Mart Dünya Kadınlar Günü özel etkinliği. Teknoloji sektöründe lider kadınlarla ilham verici konuşmalar.",
      maxParticipants: 500,
      currentParticipants: 234,
      tags: ["Women", "Leadership", "Inspiration", "Tech"],
      level: "Tüm Seviyeler",
      featured: true,
      image: "/api/placeholder/400/200",
      agenda: [
        { time: "19:00", title: "Açılış ve Hoşgeldin" },
        { time: "19:15", title: "Keynote: Tech'te Kadın Olmak" },
        { time: "19:45", title: "Success Stories Panel" },
        { time: "20:30", title: "Live Q&A" },
        { time: "21:15", title: "Networking Rooms" }
      ],
      speakers: [
        { name: "Dr. Esra Karakaş", role: "AI Director @ Google", avatar: "/api/placeholder/40/40" },
        { name: "Aylin Pekcanlar", role: "VP Engineering @ Spotify", avatar: "/api/placeholder/40/40" }
      ],
      requirements: ["Internet Connection"],
      benefits: ["Inspiration", "Networking", "Recording Access"]
    }
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: Calendar, count: events.length, color: 'bg-gray-100 text-gray-700' },
    { id: 'networking', label: 'Networking', icon: Users, count: events.filter(e => e.category === 'networking').length, color: 'bg-blue-100 text-blue-700' },
    { id: 'workshop', label: 'Workshop', icon: Building, count: events.filter(e => e.category === 'workshop').length, color: 'bg-green-100 text-green-700' },
    { id: 'panel', label: 'Panel', icon: Award, count: events.filter(e => e.category === 'panel').length, color: 'bg-purple-100 text-purple-700' },
    { id: 'casual', label: 'Casual', icon: Star, count: events.filter(e => e.category === 'casual').length, color: 'bg-yellow-100 text-yellow-700' }
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedFilter === 'all' || event.category === selectedFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleEventRegistration = (eventId: string, eventTitle: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    if (registeredEvents.includes(eventId)) {
      setRegisteredEvents(registeredEvents.filter(id => id !== eventId));
      toast.success(`${eventTitle} etkinliğinden kaydınız iptal edildi`);
    } else {
      if (event.currentParticipants >= event.maxParticipants) {
        toast.error('Bu etkinlik için kontenjan dolmuş');
        return;
      }
      
      // Show registration modal for important events
      if (event.featured || event.maxParticipants <= 30) {
        setSelectedEvent(event);
        setShowRegistrationModal(true);
      } else {
        // Quick registration for larger events
        setRegisteredEvents([...registeredEvents, eventId]);
        toast.success(`${eventTitle} etkinliğine başarıyla kaydoldunuz! 🎉`);
      }
    }
  };

  const confirmRegistration = () => {
    if (selectedEvent) {
      setRegisteredEvents([...registeredEvents, selectedEvent.id]);
      toast.success(`${selectedEvent.title} etkinliğine başarıyla kaydoldunuz! 🎉`, {
        icon: '🎯'
      });
      setShowRegistrationModal(false);
      setSelectedEvent(null);
    }
  };

  // Calendar view helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      {/* Header */}
      <div className="up-page-header">
        <div className="up-container">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
              
              <div className="flex items-center space-x-3">
                <HireHerLogo size={60} clickable={true} variant="default" />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                    Etkinlikler
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    UpSchool topluluğu etkinlikleri ve buluşmaları
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ModernButton
                onClick={() => toast.success('Etkinlik oluşturma formu yakında! 📝')}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Etkinlik Oluştur
              </ModernButton>
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-900">{events.length}</h3>
            <p className="text-blue-700">Aktif Etkinlik</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-900">{events.reduce((acc, e) => acc + e.currentParticipants, 0)}</h3>
            <p className="text-green-700">Kayıtlı Katılımcı</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-purple-900">{registeredEvents.length}</h3>
            <p className="text-purple-700">Kayıtlı Olduğunuz</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-yellow-900">3</h3>
            <p className="text-yellow-700">Bu Hafta</p>
          </ModernCard>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Etkinlik ara... (React, networking, workshop)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-white shadow-sm' : 'text-gray-600'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Takvim</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedFilter(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === category.id
                    ? 'bg-blue-600 text-white'
                    : `${category.color} hover:opacity-80 border`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
                <span className="bg-white bg-opacity-20 text-current px-2 py-1 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => {
              const isRegistered = registeredEvents.includes(event.id);
              const spotsLeft = event.maxParticipants - event.currentParticipants;
              const registrationOpen = spotsLeft > 0;
              
              return (
                <ModernCard key={event.id} className={`overflow-hidden ${event.featured ? 'ring-2 ring-yellow-200' : ''}`}>
                  {/* Event Image */}
                  <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute top-4 left-4 flex space-x-2">
                      {event.featured && (
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ⭐ Öne Çıkan
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                        event.type === 'Online' ? 'bg-green-500' : 
                        event.type === 'Hibrit' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                      <p className="text-sm opacity-90">{event.organizer}</p>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-6">
                    {/* Date and Time */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{new Date(event.date).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span className="truncate max-w-32">{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{event.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Speakers */}
                    {event.speakers.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Konuşmacılar:</p>
                        <div className="flex -space-x-2">
                          {event.speakers.slice(0, 3).map((speaker, index) => (
                            <div
                              key={index}
                              className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600"
                              title={speaker.name}
                            >
                              {speaker.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                          {event.speakers.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
                              +{event.speakers.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Participants */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{event.currentParticipants}/{event.maxParticipants} katılımcı</span>
                        {spotsLeft <= 5 && spotsLeft > 0 && (
                          <span className="text-red-600 font-medium">
                            ({spotsLeft} yer kaldı!)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.level}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                      ></div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <ModernButton
                        onClick={() => handleEventRegistration(event.id, event.title)}
                        disabled={!registrationOpen && !isRegistered}
                        className={`flex-1 ${
                          isRegistered 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : registrationOpen 
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {isRegistered ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Kayıtlı
                          </>
                        ) : !registrationOpen ? (
                          'Dolu'
                        ) : (
                          <>
                            <Calendar className="h-4 w-4 mr-1" />
                            Kayıt Ol
                          </>
                        )}
                      </ModernButton>
                      
                      <ModernButton
                        variant="outline"
                        className="px-4"
                        onClick={() => {
                          setSelectedEvent(event);
                          // Open event details modal instead of registration
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </ModernButton>
                    </div>
                  </div>
                </ModernCard>
              );
            })}
          </div>
        ) : (
          /* Calendar View */
          <ModernCard className="p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex space-x-2">
                <ModernButton 
                  variant="outline" 
                  onClick={() => navigateMonth('prev')}
                  className="p-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                </ModernButton>
                <ModernButton 
                  variant="outline" 
                  onClick={() => navigateMonth('next')}
                  className="p-2"
                >
                  <ChevronRight className="h-4 w-4" />
                </ModernButton>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Days of week header */}
              {['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getEventsForDay(day);
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-1 border border-gray-100 ${
                      day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 truncate"
                              onClick={() => setSelectedEvent(event)}
                              title={event.title}
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </ModernCard>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Bu kriterlerde etkinlik bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Farklı bir kategori deneyin veya arama terimini değiştirin.
            </p>
            <ModernButton
              onClick={() => {
                setSelectedFilter('all');
                setSearchTerm('');
              }}
              variant="outline"
            >
              Filtreleri Temizle
            </ModernButton>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 up-card p-8 text-center bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
            Kendi Etkinliğini Düzenle! 🎯
          </h3>
          <p className="text-gray-600 mb-6">
            UpSchool topluluğu için etkinlik oluşturmak istiyorsan hemen başla.
          </p>
          <ModernButton
            onClick={() => toast.success('Etkinlik oluşturma formu yakında açılacak! 📝')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Etkinlik Öner
          </ModernButton>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ModernCard className="max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Etkinlik Kaydı</h3>
              <p className="text-gray-600 mb-4">
                <strong>{selectedEvent.title}</strong> etkinliğine kaydolmak istediğinizden emin misiniz?
              </p>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{new Date(selectedEvent.date).toLocaleDateString('tr-TR')} - {selectedEvent.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span>{selectedEvent.duration}</span>
                </div>
              </div>

              {selectedEvent.requirements.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Gereksinimler:</h4>
                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                         {selectedEvent.requirements.map((req: string, index: number) => (
                       <li key={index}>{req}</li>
                     ))}
                  </ul>
                </div>
              )}

              <div className="flex space-x-3">
                <ModernButton
                  onClick={() => setShowRegistrationModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </ModernButton>
                <ModernButton
                  onClick={confirmRegistration}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <CalendarCheck className="h-4 w-4 mr-2" />
                  Kaydol
                </ModernButton>
              </div>
            </div>
          </ModernCard>
        </div>
      )}
    </div>
  );
};

export default EventsScreen; 