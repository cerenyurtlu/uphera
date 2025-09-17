import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, Quote, Sparkles, Target, Trophy } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModernCard from '../components/ModernCard';
import { useNavigate } from 'react-router-dom';

interface SuccessStory {
  id: string;
  name: string;
  role: string;
  company: string;
  story: string;
  image: string;
  upschool_batch: string;
  timeline: string;
  current_salary: string;
  previous_background?: string;
  key_achievements: string[];
  advice: string;
  location: string;
  rating: number;
  is_featured?: boolean;
}

// SuccessStoryCard Component
const SuccessStoryCard: React.FC<{
  story: SuccessStory;
  onClick: () => void;
}> = ({ story, onClick }) => {
  return (
    <ModernCard className="cursor-pointer hover:scale-[1.02] transition-transform duration-200">
      <div className="p-6" onClick={onClick}>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {story.name.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
              {story.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
              {story.role} @ {story.company}
            </p>
          </div>
        </div>
        
        <p className="text-sm mb-3 line-clamp-3" style={{ color: 'var(--up-dark-gray)' }}>
          {story.story}
        </p>
        
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--up-dark-gray)' }}>
          <span>{story.upschool_batch} Mezunu</span>
          <div className="flex items-center">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span>{story.rating}</span>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

const SuccessStoriesScreen: React.FC = () => {
  const _navigate = useNavigate();
  const [selectedStory, setSelectedStory] = useState<SuccessStory | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [_currentUser, setCurrentUser] = useState({
    name: "Yükleniyor...",
    email: "",
    skills: [],
    upschool_batch: "",
    experienceLevel: "entry"
  });

  // Kullanıcı bilgilerini localStorage'dan yükle
  useEffect(() => {
    const userData = localStorage.getItem('uphera_user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser({
        name: user.name,
        email: user.email,
        skills: user.skills || [],
        upschool_batch: user.program || "Data Science",
        experienceLevel: "entry"
      });
    }
  }, []);

  // Başarı Hikayeleri Data
  const [successStories] = useState<SuccessStory[]>([
    {
      id: "1",
      name: "Elif Demir",
      role: "Senior Frontend Developer",
      company: "Google",
      story: "UpSchool'dan mezun olduktan 6 ay sonra Google'da senior pozisyona başladım. Up Hera'nın eşleştirme algoritması sayesinde mükemmel bir fırsat yakaladım! Frontend development konusunda tutkuluydum ve UpSchool'da öğrendiklerimle kendimi geliştirdim. Şimdi Google'da 200+ kişilik ekibin frontend mimarisini yönetiyorum.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Frontend Development #42",
      timeline: "6 ay sonra",
      current_salary: "85.000 TL",
      previous_background: "İngilizce Öğretmeni",
      key_achievements: [
        "Google'da senior pozisyona yükseldi",
        "200+ kişilik ekibi yönetiyor",
        "Frontend mimarisi tasarlıyor",
        "Mentorluk programında aktif"
      ],
      advice: "Asla pes etmeyin! Her gün kod yazın, projeler geliştirin ve network'ünüzü genişletin. UpSchool topluluğunun gücünü kullanın.",
      location: "İstanbul",
      rating: 5.0,
      is_featured: true
    },
    {
      id: "2", 
      name: "Zeynep Akar",
      role: "ML Engineer",
      company: "Microsoft",
      story: "Data Science bootcamp'inin ardından Up Hera ile Microsoft'ta hayallerimin işini buldum. Kadın developer ağının gücü inanılmaz! Önceden finans sektöründe çalışıyordum ama teknolojiye olan tutkum beni UpSchool'a yönlendirdi. Şimdi Microsoft'ta AI projeleri geliştiriyorum.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Data Science #28",
      timeline: "3 ay sonra",
      current_salary: "75.000 TL",
      previous_background: "Finans Uzmanı",
      key_achievements: [
        "Microsoft'ta ML Engineer oldu",
        "AI projeleri geliştiriyor",
        "Kadın teknoloji topluluğunda aktif",
        "Konferanslarda konuşmacı"
      ],
      advice: "Kariyer değişikliği yapmak korkutucu olabilir ama doğru adımlarla mümkün. UpSchool'daki mentorlarınızın deneyimlerinden faydalanın.",
      location: "Ankara",
      rating: 4.9,
      is_featured: true
    },
    {
      id: "3",
      name: "Selin Koç",
      role: "Product Manager",
      company: "Spotify",
      story: "UpSchool'dan mezun olduktan sonra 8 ay içinde Spotify'da Product Manager oldum. Frontend development öğrenmek bana ürün geliştirme süreçlerini anlamada büyük avantaj sağladı. Şimdi milyonlarca kullanıcının kullandığı özellikleri yönetiyorum.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Frontend Development #40",
      timeline: "8 ay sonra",
      current_salary: "90.000 TL",
      previous_background: "Pazarlama Uzmanı",
      key_achievements: [
        "Spotify'da Product Manager oldu",
        "Milyonlarca kullanıcılı ürünler yönetiyor",
        "Cross-functional ekipleri yönetiyor",
        "Product strategy geliştiriyor"
      ],
      advice: "Teknik bilgi + iş anlayışı = güçlü kombinasyon. UpSchool'da öğrendiklerinizi iş dünyasıyla birleştirin.",
      location: "Stockholm",
      rating: 4.8
    },
    {
      id: "4",
      name: "Merve Yıldız",
      role: "DevOps Engineer",
      company: "Netflix",
      story: "Backend development bootcamp'inden sonra DevOps alanına yöneldim. Netflix'te çalışmak hayal gibi geliyordu ama şimdi gerçek! CI/CD pipeline'ları kuruyorum ve cloud infrastructure yönetiyorum. UpSchool'daki projelerim sayesinde pratik deneyim kazandım.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Backend Development #35",
      timeline: "5 ay sonra",
      current_salary: "80.000 TL",
      previous_background: "Sistem Yöneticisi",
      key_achievements: [
        "Netflix'te DevOps Engineer oldu",
        "CI/CD pipeline'ları kuruyor",
        "Cloud infrastructure yönetiyor",
        "Global ekiplerle çalışıyor"
      ],
      advice: "DevOps alanı sürekli gelişiyor. Kendinizi güncel tutun ve hands-on projeler yapın. UpSchool'daki grup projeleri çok değerli.",
      location: "Amsterdam",
      rating: 4.7
    },
    {
      id: "5",
      name: "Ayşe Özkan",
      role: "UX Designer",
      company: "Figma",
      story: "Frontend development öğrenirken UX tasarımına olan ilgimi keşfettim. UpSchool'daki mentorlarım beni bu alana yönlendirdi. Şimdi Figma'da çalışıyorum ve tasarım sistemleri geliştiriyorum. Teknik bilgim UX tasarımında büyük avantaj sağlıyor.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Frontend Development #41",
      timeline: "7 ay sonra",
      current_salary: "70.000 TL",
      previous_background: "Grafik Tasarımcı",
      key_achievements: [
        "Figma'da UX Designer oldu",
        "Tasarım sistemleri geliştiriyor",
                        "Kullanıcı deneyimi araştırmaları yapıyor",
        "Design thinking workshop'ları veriyor"
      ],
      advice: "Teknik bilginizi farklı alanlarla birleştirin. UX tasarımı + frontend development mükemmel bir kombinasyon.",
      location: "San Francisco",
      rating: 4.6
    },
    {
      id: "6",
      name: "Fatma Çelik",
      role: "Data Scientist",
      company: "Amazon",
      story: "Data Science bootcamp'inden mezun olduktan sonra Amazon'da çalışmaya başladım. Makine öğrenmesi modelleri geliştiriyorum ve büyük veri setleriyle çalışıyorum. UpSchool'daki projelerim sayesinde pratik deneyim kazandım.",
      image: "/api/placeholder/100/100",
      upschool_batch: "Data Science #30",
      timeline: "4 ay sonra",
      current_salary: "95.000 TL",
      previous_background: "İstatistik Uzmanı",
      key_achievements: [
        "Amazon'da Data Scientist oldu",
        "ML modelleri geliştiriyor",
        "Büyük veri setleriyle çalışıyor",
        "AI ethics konularında uzman"
      ],
      advice: "Data Science alanında sürekli öğrenmeye devam edin. UpSchool'daki matematik temelinizi güçlü tutun.",
      location: "Seattle",
      rating: 4.9
    }
  ]);

  const handleStoryClick = (story: SuccessStory) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      <Header />
      
      {/* Main Content */}
      <div className="up-container py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Başarı Hikayeleri 🌟
            </h1>
            <p className="text-lg" style={{ color: 'var(--up-dark-gray)' }}>
              UpSchool mezunlarının ilham veren kariyer yolculukları
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ModernCard className="p-6 text-center bg-gradient-to-br from-yellow-50 to-yellow-100">
            <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-yellow-900">{successStories.length}</h3>
            <p className="text-yellow-700">Başarı Hikayesi</p>
          </ModernCard>
          
          <ModernCard className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-blue-900">92%</h3>
            <p className="text-blue-700">İş Bulma Oranı</p>
          </ModernCard>

          <ModernCard className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100">
            <Star className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-green-900">4.9</h3>
            <p className="text-green-700">Ortalama Memnuniyet</p>
          </ModernCard>
        </div>

        {/* Success Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {successStories.map((story) => (
            <SuccessStoryCard
              key={story.id}
              story={story}
              onClick={() => handleStoryClick(story)}
            />
          ))}
        </div>

        {/* Motivation Section - Başarı hikayelerinin altında */}
        <ModernCard className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 mr-3" style={{ color: 'var(--up-primary)' }} />
            <h2 className="text-2xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
              Sen de Burada Olabilirsin! ✨
            </h2>
          </div>
          <p className="text-lg mb-4" style={{ color: 'var(--up-dark-gray)' }}>
            Bu başarı hikayeleri sadece başkalarının değil, <strong>senin de hikayen</strong> olabilir. 
            UpSchool mezunları Google, Microsoft, Spotify, Netflix gibi dünya devlerinde çalışıyor.
          </p>
          <p className="text-base mb-6" style={{ color: 'var(--up-dark-gray)' }}>
            <strong>Ortak noktalarımız:</strong> Aynı eğitimi aldık, aynı zorlukları yaşadık, 
            aynı hayalleri kurduk. Şimdi sıra sende! 🚀
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              <span style={{ color: 'var(--up-primary-dark)' }}>Hedef Belirle</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              <span style={{ color: 'var(--up-primary-dark)' }}>Sürekli Öğren</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4" style={{ color: 'var(--up-primary)' }} />
              <span style={{ color: 'var(--up-primary-dark)' }}>Başarıya Ulaş</span>
            </div>
          </div>
        </ModernCard>
      </div>

      {/* Story Detail Modal */}
      {showStoryModal && selectedStory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={selectedStory.image} 
                    alt={selectedStory.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--up-primary-dark)' }}>
                      {selectedStory.name}
                    </h2>
                    <p className="text-lg font-medium" style={{ color: 'var(--up-primary)' }}>
                      {selectedStory.role} @ {selectedStory.company}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      {selectedStory.upschool_batch} • {selectedStory.timeline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Previous Background */}
                {selectedStory.previous_background && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      Önceki Kariyer
                    </h3>
                    <p style={{ color: 'var(--up-dark-gray)' }}>
                      {selectedStory.previous_background}
                    </p>
                  </div>
                )}

                {/* Full Story */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Başarı Hikayesi
                  </h3>
                  <p style={{ color: 'var(--up-dark-gray)' }}>
                    {selectedStory.story}
                  </p>
                </div>

                {/* Key Achievements */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Başarıları
                  </h3>
                  <ul className="space-y-1">
                    {selectedStory.key_achievements.map((achievement, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Trophy className="h-3 w-3" style={{ color: 'var(--up-primary)' }} />
                        <span style={{ color: 'var(--up-dark-gray)' }}>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Advice */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Tavsiyesi
                  </h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Quote className="h-5 w-5 mb-2" style={{ color: 'var(--up-primary)' }} />
                    <p style={{ color: 'var(--up-dark-gray)' }}>
                      "{selectedStory.advice}"
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: 'var(--up-primary)' }}>
                      {selectedStory.current_salary}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      Maaş
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: 'var(--up-primary)' }}>
                      {selectedStory.rating}/5
                    </div>
                    <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      Değerlendirme
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: 'var(--up-primary)' }}>
                      {selectedStory.location}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      Konum
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SuccessStoriesScreen; 