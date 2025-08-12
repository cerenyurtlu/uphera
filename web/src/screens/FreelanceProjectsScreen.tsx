import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { 
  Clock, 
  DollarSign, 
  Users, 
  Star, 
  CheckCircle, 
  ExternalLink, 
  Filter, 
  Search, 
  Plus,
  Building,
  Award,
  Target,
  Briefcase
} from 'lucide-react';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';

interface FreelanceProject {
  id: string;
  title: string;
  client: string;
  description: string;
  budget: string;
  timeline: string;
  skills: string[];
  difficulty: string;
  type: 'Fixed Price' | 'Hourly' | 'Long-term';
  proposals: number;
  maxProposals: number;
  postedDate: string;
  isUrgent: boolean;
  isRemote: boolean;
  clientRating: number;
  clientReviews: number;
  projectCategory: string;
  estimatedHours?: string;
  experience: string;
}

const FreelanceProjectsScreen: React.FC = () => {
  const _navigate = useNavigate();
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [appliedProjects, setAppliedProjects] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'Tümü', count: 12 },
    { id: 'web-development', label: 'Web Development', count: 5 },
    { id: 'mobile-development', label: 'Mobile Development', count: 3 },
    { id: 'data-science', label: 'Data Science', count: 2 },
    { id: 'ui-ux', label: 'UI/UX Design', count: 2 }
  ];

  // Mock freelance projects data
  const mockProjects: FreelanceProject[] = [
    {
      id: "1",
      title: "E-ticaret Web Sitesi Geliştirilmesi",
      client: "TechStart Şirketi",
      description: "Modern bir e-ticaret web sitesi geliştirilmesi. React.js ve Node.js kullanılacak. Ödeme entegrasyonu, admin paneli ve kullanıcı yönetimi dahil.",
      budget: "15.000 - 25.000 TL",
      timeline: "6 hafta",
      skills: ["React", "Node.js", "MongoDB", "Payment Integration"],
      difficulty: "Orta",
      type: "Fixed Price",
      proposals: 8,
      maxProposals: 15,
      postedDate: "2 gün önce",
      isUrgent: true,
      isRemote: true,
      clientRating: 4.8,
      clientReviews: 23,
      projectCategory: "web-development",
      estimatedHours: "200-300 saat",
      experience: "3+ yıl"
    },
    {
      id: "2",
      title: "Data Analysis Dashboard",
      client: "Analytics Pro",
      description: "Satış verilerini analiz eden ve görselleştiren dashboard uygulaması. Python, Pandas ve Streamlit kullanılacak.",
      budget: "8.000 - 12.000 TL",
      timeline: "4 hafta",
      skills: ["Python", "Pandas", "Streamlit", "Data Visualization"],
      difficulty: "Orta",
      type: "Fixed Price",
      proposals: 5,
      maxProposals: 10,
      postedDate: "1 gün önce",
      isUrgent: false,
      isRemote: true,
      clientRating: 4.9,
      clientReviews: 15,
      projectCategory: "data-science",
      estimatedHours: "120-180 saat",
      experience: "2+ yıl"
    },
    {
      id: "3",
      title: "Mobile App UI/UX Tasarımı",
      client: "StartupCo",
      description: "Fitness tracking mobile app için complete UI/UX tasarımı. Figma kullanılarak protip hazırlanacak.",
      budget: "5.000 - 8.000 TL",
      timeline: "3 hafta",
      skills: ["Figma", "UI/UX Design", "Mobile Design", "Prototyping"],
      difficulty: "Başlangıç",
      type: "Fixed Price",
      proposals: 12,
      maxProposals: 20,
      postedDate: "3 gün önce",
      isUrgent: false,
      isRemote: true,
      clientRating: 4.6,
      clientReviews: 8,
      projectCategory: "ui-ux",
      estimatedHours: "80-120 saat",
      experience: "1+ yıl"
    },
    {
      id: "4",
      title: "React Native Mobile App Development",
      client: "Mobile Innovations",
      description: "Cross-platform mobile app development using React Native. iOS ve Android için delivery tracking app.",
      budget: "20.000 - 30.000 TL",
      timeline: "8 hafta",
      skills: ["React Native", "JavaScript", "Firebase", "Redux"],
      difficulty: "İleri",
      type: "Fixed Price",
      proposals: 6,
      maxProposals: 12,
      postedDate: "1 hafta önce",
      isUrgent: true,
      isRemote: true,
      clientRating: 5.0,
      clientReviews: 31,
      projectCategory: "mobile-development",
      estimatedHours: "300-400 saat",
      experience: "4+ yıl"
    },
    {
      id: "5",
      title: "Machine Learning Model Development",
      client: "AI Solutions Ltd",
      description: "Customer behavior prediction için machine learning modeli geliştirilmesi. Python, scikit-learn ve TensorFlow kullanılacak.",
      budget: "12.000 - 18.000 TL",
      timeline: "5 hafta",
      skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
      difficulty: "İleri",
      type: "Fixed Price",
      proposals: 4,
      maxProposals: 8,
      postedDate: "4 gün önce",
      isUrgent: false,
      isRemote: true,
      clientRating: 4.7,
      clientReviews: 19,
      projectCategory: "data-science",
      estimatedHours: "180-250 saat",
      experience: "3+ yıl"
    },
    {
      id: "6",
      title: "WordPress Blog Site Geliştirme",
      client: "Content Creator",
      description: "Kişisel blog sitesi WordPress ile geliştirilecek. Custom theme ve plugin entegrasyonu dahil.",
      budget: "3.000 - 5.000 TL",
      timeline: "2 hafta",
      skills: ["WordPress", "PHP", "CSS", "JavaScript"],
      difficulty: "Başlangıç",
      type: "Fixed Price",
      proposals: 15,
      maxProposals: 25,
      postedDate: "5 gün önce",
      isUrgent: false,
      isRemote: true,
      clientRating: 4.5,
      clientReviews: 12,
      projectCategory: "web-development",
      estimatedHours: "40-80 saat",
      experience: "1+ yıl"
    }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        // API'den projeleri yükle (mock data kullan)
        setProjects(mockProjects);
      } catch (error) {
        console.error('Projeler yüklenirken hata:', error);
        toast.error('Projeler yüklenirken hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || project.projectCategory === categoryFilter;
    const matchesType = typeFilter === 'all' || project.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleProjectApplication = async (projectId: string, projectTitle: string) => {
    if (appliedProjects.includes(projectId)) {
      toast.error('Bu projeye zaten başvurdunuz');
      return;
    }

    try {
      // Burada API'ye başvuru gönderilir
      // await apiService.applyToFreelanceProject(projectId, applicationData);
      
      setAppliedProjects([...appliedProjects, projectId]);
      toast.success(`${projectTitle} projesine başvurunuz gönderildi! 🎉`);
    } catch (error) {
      console.error('Başvuru hatası:', error);
      toast.error('Başvuru gönderilirken hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
        <Header />
        <div className="up-container py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Freelance projeler yükleniyor...</p>
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
            <h1 className="text-3xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Freelance Projeler 💼
            </h1>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              UpSchool mezunları için özel freelance iş fırsatları
            </p>
          </div>
          <ModernButton
            onClick={() => toast.success('Proje ekleme formu yakında açılacak! 📝')}
            variant="primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Proje Ekle
          </ModernButton>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <ModernCard className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-900">{projects.length}</h3>
            <p className="text-blue-700">Aktif Proje</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-900">₺68K</h3>
            <p className="text-green-700">Toplam Bütçe</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-purple-900">{appliedProjects.length}</h3>
            <p className="text-purple-700">Başvurun</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
            <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-yellow-900">3</h3>
            <p className="text-yellow-700">Yeni Proje</p>
          </ModernCard>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
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
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filtreler</span>
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <ModernCard className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label} ({category.count})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Proje Tipi</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">Tümü</option>
                  <option value="Fixed Price">Sabit Fiyat</option>
                  <option value="Hourly">Saatlik</option>
                  <option value="Long-term">Uzun Vadeli</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Bütçe</label>
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">Tümü</option>
                  <option value="low">0-5.000 TL</option>
                  <option value="medium">5.000-15.000 TL</option>
                  <option value="high">15.000+ TL</option>
                </select>
              </div>
            </div>
          </ModernCard>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const isApplied = appliedProjects.includes(project.id);
            const spotsLeft = project.maxProposals - project.proposals;
            
            return (
              <ModernCard key={project.id} className={`overflow-hidden ${project.isUrgent ? 'ring-2 ring-orange-200' : ''}`}>
                {/* Project Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                          {project.title}
                        </h3>
                        {project.isUrgent && (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            Acil
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{project.client}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{project.clientRating} ({project.clientReviews} değerlendirme)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{project.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{project.timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      <span>{project.proposals}/{project.maxProposals} başvuru</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-orange-600" />
                      <span>{project.difficulty} seviye</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {project.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{project.skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Progress and Meta */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">{project.postedDate}</span>
                    {spotsLeft <= 3 && spotsLeft > 0 && (
                      <span className="text-red-600 font-medium">
                        {spotsLeft} slot kaldı!
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(project.proposals / project.maxProposals) * 100}%` }}
                    ></div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <ModernButton
                      onClick={() => handleProjectApplication(project.id, project.title)}
                      disabled={isApplied || project.proposals >= project.maxProposals}
                      className={`flex-1 ${
                        isApplied 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : project.proposals >= project.maxProposals
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Başvuruldu
                        </>
                      ) : project.proposals >= project.maxProposals ? (
                        'Dolu'
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-1" />
                          Başvur
                        </>
                      )}
                    </ModernButton>
                    
                    <ModernButton
                      variant="outline"
                      className="px-4"
                      onClick={() => toast.success('Proje detayları yakında açılacak!')}
                    >
                      <ExternalLink className="h-4 w-4" />
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
              Farklı filtreler deneyin veya arama terimini değiştirin.
            </p>
            <ModernButton
              onClick={() => {
                setCategoryFilter('all');
                setTypeFilter('all');
                setBudgetFilter('all');
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
            Kendi Freelance Projenizi Paylaşın! 🚀
          </h3>
          <p className="text-gray-600 mb-6">
            UpSchool mezunları ile çalışmak istiyorsanız projenizi paylaşın.
          </p>
          <ModernButton
            onClick={() => toast.success('Proje paylaşma formu yakında açılacak! 📝')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Proje Paylaş
          </ModernButton>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default FreelanceProjectsScreen;
