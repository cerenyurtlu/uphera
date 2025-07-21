import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, MessageCircle, Star, MapPin, Calendar, Clock, Award, Send, UserPlus, CheckCircle } from 'lucide-react';
import HireHerLogo from '../components/HireHerLogo';
import NotificationBell from '../components/NotificationBell';
import ModernCard from '../components/ModernCard';
import ModernButton from '../components/ModernButton';
import { useNavigate } from 'react-router-dom';

interface Mentor {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  specialties: string[];
  location: string;
  isAvailable: boolean;
  profileImage: string;
  bio: string;
  menteeCount: number;
  rating: number;
  availability?: string;
}

const MentorshipScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [messageText, setMessageText] = useState('');
  const [currentUser, setCurrentUser] = useState({
    name: "Yükleniyor...",
    email: "",
    skills: [],
    upschool_batch: "",
    experienceLevel: "entry"
  });

  // Kullanıcı bilgilerini localStorage'dan yükle
  useEffect(() => {
    const userData = localStorage.getItem('hireher_user');
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

  // Senior Mentors Data - Gerçek mentorlar
  const [mentors] = useState<Mentor[]>([
    {
      id: "m1",
      name: "Gizem Aktaş",
      title: "Senior Engineering Manager",
      company: "Meta",
      experience: "8 yıl",
      specialties: ["Career Growth", "Leadership", "System Design", "Team Management"],
      location: "London (Remote)",
      isAvailable: true,
      profileImage: "/api/placeholder/50/50",
      bio: "Tech career'ında kadınlara ücretsiz rehberlik etmek için buradayım. Engineering management ve technical leadership konularında deneyimliyim. 50+ mentee'ye kariyer yolculuklarında yardım ettim.",
      menteeCount: 12,
      rating: 4.9,
      availability: "Hafta içi 18:00-21:00, Hafta sonu 10:00-16:00"
    },
    {
      id: "m2",
      name: "Selin Demirci",
      title: "Principal Frontend Architect",
      company: "Spotify",
      experience: "10 yıl",
      specialties: ["Frontend Architecture", "React", "Performance", "Technical Leadership"],
      location: "Stockholm (Remote)",
      isAvailable: true,
      profileImage: "/api/placeholder/50/50", 
      bio: "Frontend teknolojiler ve large-scale React uygulamaları konusunda uzmanım. Spotify'da 5 yıldır principal architect olarak çalışıyorum. Yeni mezunlara ücretsiz frontend kariyerinde rehberlik ediyorum.",
      menteeCount: 8,
      rating: 4.8,
      availability: "Hafta içi 19:00-22:00, Cumartesi 14:00-18:00"
    },
    {
      id: "m3",
      name: "Aylin Çelik",
      title: "VP Engineering",
      company: "Klarna",
      experience: "12 yıl",
      specialties: ["Technical Strategy", "Team Building", "Product Engineering", "Scaling"],
      location: "Berlin (Remote)",
      isAvailable: false,
      profileImage: "/api/placeholder/50/50",
      bio: "Engineering teams'inin scalable products oluşturması konusunda ücretsiz rehberlik ediyorum. Klarna'da VP Engineering olarak 200+ kişilik ekibi yönetiyorum. Kadın liderlerin yetişmesine odaklanıyorum.",
      menteeCount: 15,
      rating: 5.0,
      availability: "Sadece Cumartesi 10:00-14:00"
    },
    {
      id: "m4",
      name: "Merve Yıldız",
      title: "Senior Data Scientist",
      company: "Netflix",
      experience: "7 yıl",
      specialties: ["Machine Learning", "Data Science", "Python", "Career Transition"],
      location: "Amsterdam (Remote)",
      isAvailable: true,
      profileImage: "/api/placeholder/50/50",
      bio: "Netflix'te recommendation systems üzerinde çalışıyorum. Data Science alanına geçiş yapmak isteyenlere ücretsiz özel rehberlik veriyorum. Bootcamp mezunlarının sektöre girişinde deneyimliyim.",
      menteeCount: 20,
      rating: 4.7,
      availability: "Hafta içi 20:00-23:00, Pazar 15:00-19:00"
    },
    {
      id: "m5",
      name: "Elif Özkan",
      title: "CTO & Co-founder",
      company: "TechStartup",
      experience: "9 yıl",
      specialties: ["Startup Strategy", "Technical Leadership", "Fundraising", "Product Development"],
      location: "İstanbul",
      isAvailable: true,
      profileImage: "/api/placeholder/50/50",
      bio: "Kendi startup'ımı kurduktan sonra 3 yıldır CTO olarak çalışıyorum. Kadın girişimcilere ve startup çalışanlarına ücretsiz mentorluk veriyorum. Technical leadership ve startup kültürü konularında deneyimliyim.",
      menteeCount: 6,
      rating: 4.9,
      availability: "Hafta içi 18:00-21:00, Cumartesi 10:00-16:00"
    }
  ]);

  const handleMentorshipRequest = async () => {
    if (!selectedMentor || !requestMessage.trim()) {
      toast.error('Lütfen bir mesaj yazın');
      return;
    }

    try {
      // API'ye mentorluk isteği gönder
      const userData = localStorage.getItem('hireher_user');
      if (!userData) {
        toast.error('Kullanıcı bilgileri bulunamadı');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      const response = await fetch('http://localhost:8000/api/mentorship/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor_id: selectedMentor.id,
          message: requestMessage,
          mentee_name: currentUser.name,
          mentee_email: currentUser.email,
          mentee_program: currentUser.upschool_batch
        })
      });

      if (response.ok) {
        toast.success(`${selectedMentor.name} mentoruna mentorluk isteği gönderildi!`);
        setShowRequestModal(false);
        setRequestMessage('');
      } else {
        throw new Error('Mentorluk isteği gönderilemedi');
      }
    } catch (error) {
      console.error('Mentorluk isteği hatası:', error);
      toast.error('Mentorluk isteği gönderilirken hata oluştu');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedMentor || !messageText.trim()) {
      toast.error('Lütfen bir mesaj yazın');
      return;
    }

    try {
      // API'ye mesaj gönder
      const userData = localStorage.getItem('hireher_user');
      if (!userData) {
        toast.error('Kullanıcı bilgileri bulunamadı');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      const response = await fetch('http://localhost:8000/api/mentorship/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor_id: selectedMentor.id,
          message: messageText,
          sender_name: currentUser.name,
          sender_email: currentUser.email
        })
      });

      if (response.ok) {
        toast.success(`${selectedMentor.name} mentoruna mesaj gönderildi!`);
        setShowMessageModal(false);
        setMessageText('');
      } else {
        throw new Error('Mesaj gönderilemedi');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      toast.error('Mesaj gönderilirken hata oluştu');
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
                onClick={() => navigate('/jobs')}
                className="flex items-center space-x-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--up-primary)' }}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Geri Dön</span>
              </button>
              <div className="flex items-center space-x-3">
                <HireHerLogo size={64} clickable={true} variant="default" />
                <div>
                  <h1 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                    Mentor Bul
                  </h1>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    Ücretsiz kariyer rehberliği al
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
                  {currentUser.upschool_batch} Mezunu
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="up-container py-8">
        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {mentors.map((mentor) => (
            <ModernCard key={mentor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={mentor.profileImage} 
                    alt={mentor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                      {mentor.name}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: 'var(--up-primary)' }}>
                      {mentor.title}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      {mentor.company}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="h-3 w-3" style={{ color: 'var(--up-primary)' }} />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                    {mentor.menteeCount} mentee
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  <MapPin className="h-3 w-3" />
                  <span>{mentor.location}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  <Award className="h-3 w-3" />
                  <span>{mentor.experience} deneyim</span>
                </div>



                <div className="flex flex-wrap gap-1">
                  {mentor.specialties.slice(0, 3).map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 rounded text-xs"
                      style={{ background: 'var(--up-light-gray)', color: 'var(--up-primary)' }}
                    >
                      {specialty}
                    </span>
                  ))}
                  {mentor.specialties.length > 3 && (
                    <span className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                      +{mentor.specialties.length - 3} more
                    </span>
                  )}
                </div>

                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  {mentor.bio.substring(0, 120)}...
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--up-light-gray)' }}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${mentor.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs" style={{ color: mentor.isAvailable ? 'var(--up-primary)' : 'var(--up-dark-gray)' }}>
                    {mentor.isAvailable ? 'Müsait' : 'Meşgul'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <ModernButton
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowMessageModal(true);
                    }}
                    size="sm"
                    variant="outline"
                    disabled={!mentor.isAvailable}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Mesaj
                  </ModernButton>
                  
                  <ModernButton
                    onClick={() => {
                      setSelectedMentor(mentor);
                      setShowRequestModal(true);
                    }}
                    size="sm"
                    disabled={!mentor.isAvailable}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Mentorluk İste
                  </ModernButton>
                </div>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>

      {/* Mentorluk İsteği Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  Mentorluk İsteği
                </h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={selectedMentor.profileImage} 
                    alt={selectedMentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{selectedMentor.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      {selectedMentor.title} @ {selectedMentor.company}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Mentorluk İsteği Mesajınız
                  </label>
                  <textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Kendinizi tanıtın ve hangi konularda mentorluk almak istediğinizi belirtin..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    style={{ borderColor: 'var(--up-light-gray)' }}
                  />
                </div>

                <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  <p><strong>Müsaitlik:</strong> {selectedMentor.availability}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <ModernButton
                  onClick={() => setShowRequestModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </ModernButton>
                <ModernButton
                  onClick={handleMentorshipRequest}
                  className="flex-1"
                  disabled={!requestMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  İsteği Gönder
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mesaj Gönderme Modal */}
      {showMessageModal && selectedMentor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                  Mesaj Gönder
                </h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img 
                    src={selectedMentor.profileImage} 
                    alt={selectedMentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{selectedMentor.name}</h3>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      {selectedMentor.title} @ {selectedMentor.company}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                    Mesajınız
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Mentorunuza sormak istediğiniz soruları yazın..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                    style={{ borderColor: 'var(--up-light-gray)' }}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <ModernButton
                  onClick={() => setShowMessageModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </ModernButton>
                <ModernButton
                  onClick={handleSendMessage}
                  className="flex-1"
                  disabled={!messageText.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Mesaj Gönder
                </ModernButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipScreen; 