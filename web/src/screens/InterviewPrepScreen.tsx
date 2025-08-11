import React, { useState } from 'react';
import { ChevronLeft, Target, MessageCircle, BookOpen, Clock, Award, CheckCircle, Star, Zap, Brain, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import AIChatbot from '../components/AIChatbot';

const InterviewPrepScreen: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showAICoach, setShowAICoach] = useState(false);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const prepModules = [
    {
      id: 'self-intro',
      title: 'Kendini Etkili Tanıtma',
      description: 'AI ile birlikte güçlü bir tanıtım hikayesi oluştur',
      icon: <MessageCircle className="h-6 w-6" />,
      duration: '15-20 dk',
      difficulty: 'Başlangıç',
      color: 'bg-blue-500',
      tasks: [
        'Kişisel hikayeni yapılandır',
        'Güçlü yanlarını vurgula',
        'UpSchool deneyimini hikayeleştir',
        'AI ile pratik yap'
      ]
    },
    {
      id: 'technical-skills',
      title: 'Teknik Yetkinlik Sunumu',
      description: 'Projelerini etkileyici hikayeler haline getir',
      icon: <Brain className="h-6 w-6" />,
      duration: '25-30 dk',
      difficulty: 'Orta',
      color: 'bg-purple-500',
      tasks: [
        'STAR tekniği ile proje anlatımı',
        'Teknik challenge çözümlerini yapılandır',
        'Code review simülasyonu',
        'Problem çözme yaklaşımını göster'
      ]
    },
    {
      id: 'company-research',
      title: 'Şirket Araştırması & Uyum',
      description: 'Hedef şirket için özel hazırlık',
      icon: <Target className="h-6 w-6" />,
      duration: '20-25 dk',
      difficulty: 'Orta',
      color: 'bg-green-500',
      tasks: [
        'Şirket kültürü analizi',
        'Soru hazırlığı stratejisi',
        'Değer uyumu gösterimi',
        'Kariyer hedefi uyumlaması'
      ]
    },
    {
      id: 'confidence-building',
      title: 'Özgüven & Stres Yönetimi',
      description: 'Heyecanını pozitif enerjiye dönüştür',
      icon: <Heart className="h-6 w-6" />,
      duration: '15-20 dk',
      difficulty: 'Başlangıç',
      color: 'bg-pink-500',
      tasks: [
        'Nefes teknikleri ve gevşeme',
        'Pozitif iç konuşma geliştirme',
        'Beden dili farkındalığı',
        'Başarı senaryosu görselleştirme'
      ]
    },
    {
      id: 'mock-interview',
      title: 'AI Destekli Mock Mülakat',
      description: 'Gerçekçi mülakat simülasyonu ile pratik',
      icon: <Zap className="h-6 w-6" />,
      duration: '30-45 dk',
      difficulty: 'İleri',
      color: 'bg-red-500',
      tasks: [
        'Frontend developer sorularına hazırlık',
        'Behavioral questions pratiği',
        'Anlık feedback alma',
        'Performans analizi'
      ]
    }
  ];

  const handleModuleComplete = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const progressPercentage = (completedModules.length / prepModules.length) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--up-light-gray)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
              <BrandLogo size={72} />
            </div>
            
            <button
              onClick={() => setShowAICoach(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{ 
                background: 'var(--up-primary)', 
                color: 'white' 
              }}
            >
              <Brain className="h-4 w-4" />
              <span>AI Koç</span>
            </button>
          </div>
        </div>
      </header>

      <div className="up-container py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                Hazırlık İlerlemeniz
              </h2>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                {completedModules.length} / {prepModules.length} modül tamamlandı
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              <span className="font-medium" style={{ color: 'var(--up-primary)' }}>
                %{Math.round(progressPercentage)} Hazır
              </span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                background: 'var(--up-primary)',
                width: `${progressPercentage}%` 
              }}
            ></div>
          </div>
          
          {progressPercentage === 100 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Tebrikler! Mülakat hazırlığınız tamamlandı! 🎉</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Artık mülakata girmeye hazırsınız. Başarılar!
              </p>
            </div>
          )}
        </div>

        {/* Preparation Modules */}
        <div className="grid gap-6">
          {prepModules.map((module) => {
            const isCompleted = completedModules.includes(module.id);
            
            return (
              <div 
                key={module.id} 
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div 
                      className={`p-3 rounded-lg ${module.color} text-white`}
                    >
                      {module.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg" style={{ color: 'var(--up-primary-dark)' }}>
                          {module.title}
                        </h3>
                        {isCompleted && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      
                      <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
                        {module.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs mb-4" style={{ color: 'var(--up-dark-gray)' }}>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{module.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3" />
                          <span>{module.difficulty}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {module.tasks.map((task, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--up-primary)' }}></div>
                            <span style={{ color: 'var(--up-dark-gray)' }}>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedModule(module.id)}
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{ 
                        background: isCompleted ? 'var(--up-light-gray)' : 'var(--up-primary)', 
                        color: isCompleted ? 'var(--up-dark-gray)' : 'white' 
                      }}
                    >
                      {isCompleted ? 'Tekrar Et' : 'Başla'}
                    </button>
                    
                    {!isCompleted && (
                      <button
                        onClick={() => handleModuleComplete(module.id)}
                        className="px-4 py-2 rounded-lg text-xs border transition-colors"
                        style={{ 
                          borderColor: 'var(--up-primary)', 
                          color: 'var(--up-primary)' 
                        }}
                      >
                        Tamamlandı İşaretle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Coach Motivational Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <Brain className="h-6 w-6" style={{ color: 'var(--up-primary)' }} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                AI Koçunuz Her Adımda Yanınızda! 🚀
              </h3>
              <p className="text-sm mb-4" style={{ color: 'var(--up-dark-gray)' }}>
                UpSchool'da aldığın eğitim seni buraya getirdi, şimdi o güçlü kadın enerjinle mülakatı da başarıyla geçeceksin! 
                AI koçun her sorunla birlikte düşünüyor, her cevabını geliştiriyorsun.
              </p>
              <button
                onClick={() => setShowAICoach(true)}
                className="px-6 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  background: 'var(--up-primary)', 
                  color: 'white' 
                }}
              >
                AI Koç ile Konuş
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      {showAICoach && (
        <AIChatbot
          isOpen={showAICoach}
          onClose={() => setShowAICoach(false)}
          context="interview"
          contextData={{ selectedModule, completedModules, progressPercentage }}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 py-8 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'var(--up-light-gray)' }}>
        <div className="up-container">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BrandLogo size={56} />
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

export default InterviewPrepScreen; 