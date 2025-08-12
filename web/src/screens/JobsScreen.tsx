import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import toast from 'react-hot-toast';
import { Search, MapPin, Clock, DollarSign, Briefcase, Star, Filter, SlidersHorizontal } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  description: string;
  match: number;
  posted: string;
  urgent: boolean;
  remote: boolean;
  logo: string;
}

const JobsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      // Mock job data
      const mockJobs: Job[] = [
        {
          id: 1,
          title: "Senior Frontend Developer",
          company: "Google",
          location: "İstanbul",
          salary: "35.000 - 50.000 TL",
          type: "Full-time",
          experience: "5+ yıl",
          skills: ["React", "TypeScript", "Next.js", "GraphQL"],
          description: "Modern web uygulamaları geliştiren deneyimli frontend developer arıyoruz.",
          match: 95,
          posted: "2 gün önce",
          urgent: true,
          remote: false,
          logo: "/api/placeholder/50/50"
        },
        {
          id: 2,
          title: "React Developer",
          company: "Microsoft",
          location: "Remote",
          salary: "25.000 - 35.000 TL",
          type: "Full-time",
          experience: "3+ yıl",
          skills: ["React", "JavaScript", "Redux", "CSS"],
          description: "Kullanıcı dostu React uygulamaları geliştirmek istiyoruz.",
          match: 88,
          posted: "1 gün önce",
          urgent: false,
          remote: true,
          logo: "/api/placeholder/50/50"
        },
        {
          id: 3,
          title: "UI/UX Designer",
          company: "Spotify",
          location: "Ankara",
          salary: "20.000 - 30.000 TL",
          type: "Full-time",
          experience: "2+ yıl",
          skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
          description: "Yaratıcı ve kullanıcı odaklı tasarımlar oluşturacak designer arıyoruz.",
          match: 82,
          posted: "3 gün önce",
          urgent: false,
          remote: false,
          logo: "/api/placeholder/50/50"
        },
        {
          id: 4,
          title: "Full Stack Developer",
          company: "Netflix",
          location: "İstanbul",
          salary: "30.000 - 45.000 TL",
          type: "Full-time",
          experience: "4+ yıl",
          skills: ["Node.js", "React", "MongoDB", "Docker"],
          description: "Backend ve frontend geliştirmede deneyimli developer aranıyor.",
          match: 91,
          posted: "1 hafta önce",
          urgent: false,
          remote: true,
          logo: "/api/placeholder/50/50"
        },
        {
          id: 5,
          title: "Data Scientist",
          company: "Amazon",
          location: "İzmir",
          salary: "40.000 - 55.000 TL",
          type: "Full-time",
          experience: "3+ yıl",
          skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
          description: "Büyük veri analizi ve makine öğrenmesi projeleri için uzman arıyoruz.",
          match: 78,
          posted: "5 gün önce",
          urgent: true,
          remote: false,
          logo: "/api/placeholder/50/50"
        },
        {
          id: 6,
          title: "Mobile Developer",
          company: "Uber",
          location: "Remote",
          salary: "28.000 - 40.000 TL",
          type: "Part-time",
          experience: "2+ yıl",
          skills: ["React Native", "Swift", "Kotlin", "Firebase"],
          description: "iOS ve Android uygulamaları geliştiren mobile developer arıyoruz.",
          match: 85,
          posted: "4 gün önce",
          urgent: false,
          remote: true,
          logo: "/api/placeholder/50/50"
        }
      ];
      
      setJobs(mockJobs);
      setLoading(false);
    };

    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = locationFilter === '' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesType = typeFilter === '' || job.type === typeFilter;
    const matchesExperience = experienceFilter === '' || job.experience === experienceFilter;
    
    return matchesSearch && matchesLocation && matchesType && matchesExperience;
  });

  const handleApply = (job: Job) => {
    toast.success(`${job.title} pozisyonuna başvurunuz alındı! 🎉`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocationFilter('');
    setTypeFilter('');
    setExperienceFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">İş Fırsatları 🎯</h1>
          <p className="text-gray-600">AI algoritması ile size özel seçilmiş {filteredJobs.length} iş fırsatı</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="İş ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Konum"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Tipler</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>

            {/* Experience */}
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tüm Seviyeler</option>
              <option value="0-2 yıl">0-2 yıl</option>
              <option value="2+ yıl">2+ yıl</option>
              <option value="3+ yıl">3+ yıl</option>
              <option value="5+ yıl">5+ yıl</option>
            </select>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex space-x-2">
              <ModernButton 
                size="sm" 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Daha Fazla Filtre</span>
              </ModernButton>
            </div>
            <ModernButton size="sm" variant="outline" onClick={clearFilters}>
              Filtreleri Temizle
            </ModernButton>
          </div>
        </div>

        {/* Job Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">İş ilanları yükleniyor...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <ModernCard key={job.id} hover className="bg-white border-gray-100 shadow-sm">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <img 
                        src={job.logo} 
                        alt={job.company}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </span>
                          {job.remote && (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                              Remote OK
                            </span>
                          )}
                          {job.urgent && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                              Acil
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium text-gray-700">%{job.match} Uyum</span>
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${job.match}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Salary & Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Maaş:</span>
                      <p className="font-medium text-gray-900">{job.salary}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Deneyim:</span>
                      <p className="font-medium text-gray-900">{job.experience}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>

                  {/* Skills */}
                  <div>
                    <span className="text-xs font-medium text-gray-500 mb-2 block">Aranan Beceriler:</span>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{job.posted}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>
                    <div className="flex space-x-2">
                      <ModernButton size="sm" variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>
                        Detaylar
                      </ModernButton>
                      <ModernButton size="sm" onClick={() => handleApply(job)}>
                        Başvur
                      </ModernButton>
                    </div>
                  </div>
                </div>
              </ModernCard>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !loading && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bu kriterlerde iş bulunamadı
            </h3>
            <p className="text-gray-600 mb-4">
              Farklı anahtar kelimeler veya filtreler deneyin.
            </p>
            <ModernButton onClick={clearFilters}>
              Filtreleri Temizle
            </ModernButton>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default JobsScreen;
