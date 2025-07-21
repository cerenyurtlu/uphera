import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, DollarSign, Users, Star, Calendar, MapPin, Bookmark, Share2, Filter, Search, Briefcase, Code, Palette, BarChart, Smartphone, Globe, Award, MessageCircle } from 'lucide-react';
import HireHerLogo from '../components/HireHerLogo';
import NotificationBell from '../components/NotificationBell';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';

const FreelanceProjectsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [savedProjects, setSavedProjects] = useState<string[]>([]);

  // Mock freelance projects data
  const projects = [
    {
      id: "1",
      title: "E-ticaret Sitesi Frontend Geliştirmesi",
      category: "frontend",
      budget: "15.000 - 25.000 TL",
      duration: "4-6 hafta",
      clientName: "TechStartup İstanbul",
      clientRating: 4.8,
      clientProjects: 12,
      description: "Modern bir e-ticaret platformu için React.js ve TypeScript kullanarak responsive frontend geliştirmesi. Ödeme entegrasyonu ve admin paneli dahil.",
      requirements: ["React.js", "TypeScript", "Tailwind CSS", "RESTful API", "Responsive Design"],
      level: "intermediate",
      postedDate: "2 gün önce",
      deadline: "15 Şubat 2025",
      proposalCount: 8,
      isUrgent: true,
      location: "Remote",
      featured: true,
      tags: ["React", "TypeScript", "E-commerce", "API Integration"]
    },
    {
      id: "2", 
      title: "Mobil Uygulama UI/UX Tasarımı",
      category: "design",
      budget: "8.000 - 12.000 TL",
      duration: "3-4 hafta", 
      clientName: "HealthTech Ankara",
      clientRating: 4.9,
      clientProjects: 7,
      description: "Sağlık alanında kullanılacak mobil uygulama için complete UI/UX tasarımı. User research, wireframe, prototyping ve design system dahil.",
      requirements: ["Figma", "User Research", "Prototyping", "Mobile Design", "Design Systems"],
      level: "intermediate",
      postedDate: "5 gün önce",
      deadline: "20 Şubat 2025",
      proposalCount: 15,
      isUrgent: false,
      location: "Hibrit (Ankara)",
      featured: false,
      tags: ["UI/UX", "Mobile", "Healthcare", "Figma"]
    },
    {
      id: "3",
      title: "Python Django API Geliştirmesi", 
      category: "backend",
      budget: "20.000 - 30.000 TL",
      duration: "6-8 hafta",
      clientName: "FinTech Solutions",
      clientRating: 4.7,
      clientProjects: 18,
      description: "Fintech uygulaması için güvenli ve ölçeklenebilir Django REST API geliştirmesi. Payment gateway entegrasyonu ve güvenlik önlemleri kritik.",
      requirements: ["Python", "Django", "REST API", "PostgreSQL", "Redis", "JWT Authentication"],
      level: "advanced",
      postedDate: "1 gün önce",
      deadline: "10 Mart 2025",
      proposalCount: 6,
      isUrgent: true,
      location: "Remote",
      featured: true,
      tags: ["Python", "Django", "API", "FinTech", "Security"]
    },
    {
      id: "4",
      title: "Wordpress E-ticaret Sitesi",
      category: "fullstack",
      budget: "5.000 - 8.000 TL", 
      duration: "2-3 hafta",
      clientName: "Local Business İzmir",
      clientRating: 4.5,
      clientProjects: 3,
      description: "Küçük işletme için WooCommerce ile e-ticaret sitesi kurulumu. Ödeme sistemleri, kargo entegrasyonu ve SEO optimizasyonu.",
      requirements: ["WordPress", "WooCommerce", "PHP", "MySQL", "SEO"],
      level: "beginner",
      postedDate: "3 gün önce",
      deadline: "25 Şubat 2025", 
      proposalCount: 22,
      isUrgent: false,
      location: "Remote",
      featured: false,
      tags: ["WordPress", "WooCommerce", "PHP", "E-commerce"]
    },
    {
      id: "5",
      title: "Data Analytics Dashboard",
      category: "data",
      budget: "12.000 - 18.000 TL",
      duration: "4-5 hafta",
      clientName: "Marketing Agency",
      clientRating: 4.6,
      clientProjects: 9,
      description: "Pazarlama verilerini görselleştiren interaktif dashboard geliştirmesi. Python/Tableau ile veri analizi ve real-time reporting.",
      requirements: ["Python", "Pandas", "Tableau", "Data Visualization", "SQL"],
      level: "intermediate",
      postedDate: "4 gün önce",
      deadline: "5 Mart 2025",
      proposalCount: 11,
      isUrgent: false,
      location: "Remote", 
      featured: false,
      tags: ["Data Science", "Python", "Tableau", "Analytics"]
    },
    {
      id: "6",
      title: "React Native Mobil Uygulama",
      category: "mobile",
      budget: "25.000 - 35.000 TL",
      duration: "8-10 hafta", 
      clientName: "Social Media Startup",
      clientRating: 4.8,
      clientProjects: 5,
      description: "Sosyal medya uygulaması için React Native geliştirmesi. Real-time messaging, photo sharing ve social features.",
      requirements: ["React Native", "JavaScript", "Firebase", "Push Notifications", "Social APIs"],
      level: "advanced",
      postedDate: "1 gün önce",
      deadline: "15 Mart 2025",
      proposalCount: 4,
      isUrgent: true,
      location: "Remote",
      featured: true,
      tags: ["React Native", "Mobile", "Social Media", "Firebase"]
    }
  ];

  const categories = [
    { id: 'all', label: 'Tümü', icon: Briefcase, count: projects.length },
    { id: 'frontend', label: 'Frontend', icon: Code, count: projects.filter(p => p.category === 'frontend').length },
    { id: 'backend', label: 'Backend', icon: Code, count: projects.filter(p => p.category === 'backend').length },
    { id: 'fullstack', label: 'Full Stack', icon: Globe, count: projects.filter(p => p.category === 'fullstack').length },
    { id: 'design', label: 'UI/UX', icon: Palette, count: projects.filter(p => p.category === 'design').length },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, count: projects.filter(p => p.category === 'mobile').length },
    { id: 'data', label: 'Data Science', icon: BarChart, count: projects.filter(p => p.category === 'data').length }
  ];

  const levels = {
    'beginner': { label: 'Başlangıç', color: 'bg-green-100 text-green-700' },
    'intermediate': { label: 'Orta', color: 'bg-yellow-100 text-yellow-700' },
    'advanced': { label: 'İleri', color: 'bg-red-100 text-red-700' }
  };

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedFilter === 'all' || project.category === selectedFilter;
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSaveProject = (projectId: string, projectTitle: string) => {
    if (savedProjects.includes(projectId)) {
      setSavedProjects(savedProjects.filter(id => id !== projectId));
      toast.success('Proje kaydedilenlerden çıkarıldı');
    } else {
      setSavedProjects([...savedProjects, projectId]);
      toast.success(`${projectTitle} kaydedildi! 📋`);
    }
  };

  const handleApplyProject = (projectId: string, projectTitle: string) => {
    toast.success(`${projectTitle} projesine başvurun hazırlanıyor! 🚀`);
    // Burada başvuru modalı açılabilir
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend': return Code;
      case 'backend': return Code;
      case 'fullstack': return Globe;
      case 'design': return Palette;
      case 'mobile': return Smartphone;
      case 'data': return BarChart;
      default: return Briefcase;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'frontend': return 'bg-blue-100 text-blue-700';
      case 'backend': return 'bg-green-100 text-green-700';
      case 'fullstack': return 'bg-purple-100 text-purple-700';
      case 'design': return 'bg-pink-100 text-pink-700';
      case 'mobile': return 'bg-orange-100 text-orange-700';
      case 'data': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
                    Freelance Projeler
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    Yeteneklerini freelance projelerle geliştir
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-8">
        {/* Hero Section */}
        <div className="up-card p-8 mb-8 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
              Freelance Projelerle Deneyim Kazan! 💼
            </h2>
            <p className="text-lg mb-6" style={{ color: 'var(--up-dark-gray)' }}>
              UpSchool mezunları için özel freelance fırsatları. Gerçek projelerle portföyünü güçlendir.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>{projects.length} aktif proje</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span>5K - 35K TL arası</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Güvenli ödeme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Proje ara... (React, Python, UI/UX)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filter Button */}
          <ModernButton variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtrele</span>
          </ModernButton>
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
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const CategoryIcon = getCategoryIcon(project.category);
            const isSaved = savedProjects.includes(project.id);
            const levelInfo = levels[project.level as keyof typeof levels];
            
            return (
              <ModernCard key={project.id} className={`overflow-hidden ${project.featured ? 'ring-2 ring-green-200' : ''}`}>
                {/* Project Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {project.featured && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ Öne Çıkan
                          </span>
                        )}
                        {project.isUrgent && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🔥 Acil
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
                          {levelInfo.label}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                        {project.title}
                      </h3>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{project.budget}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{project.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-red-600" />
                          <span>{project.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleSaveProject(project.id, project.title)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSaved ? 'bg-yellow-100 text-yellow-600' : 'hover:bg-gray-100'
                        }`}
                      >
                        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(project.category)}`}>
                      <CategoryIcon className="h-4 w-4 mr-1" />
                      {project.category === 'frontend' ? 'Frontend' :
                       project.category === 'backend' ? 'Backend' :
                       project.category === 'fullstack' ? 'Full Stack' :
                       project.category === 'design' ? 'UI/UX Design' :
                       project.category === 'mobile' ? 'Mobile Development' :
                       project.category === 'data' ? 'Data Science' : 'Other'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Gerekli Beceriler:</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Client Info */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.clientName}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 fill-current mr-1" />
                          <span>{project.clientRating}</span>
                        </div>
                        <span>•</span>
                        <span>{project.clientProjects} proje</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{project.postedDate}</p>
                      <p className="text-xs text-gray-500">Son: {project.deadline}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{project.proposalCount} başvuru</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Son başvuru: {project.deadline}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <ModernButton
                      onClick={() => handleApplyProject(project.id, project.title)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Başvur
                    </ModernButton>
                    <ModernButton
                      variant="outline"
                      className="px-4"
                      onClick={() => toast('Proje detayları yakında!', { icon: 'ℹ️' })}
                    >
                      Detaylar
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Bu kriterlerde proje bulunamadı
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
        <div className="mt-12 up-card p-8 text-center bg-gradient-to-r from-blue-50 to-green-50">
          <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--up-primary-dark)' }}>
            Proje Arayan mısın? 🚀
          </h3>
          <p className="text-gray-600 mb-6">
            Kendi projen için UpSchool mezunlarından teklif almak istiyorsan proje paylaş.
          </p>
          <ModernButton
            onClick={() => toast.success('Proje paylaşım formu yakında açılacak! 📝')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Proje Paylaş
          </ModernButton>
        </div>
      </div>
    </div>
  );
};

export default FreelanceProjectsScreen; 