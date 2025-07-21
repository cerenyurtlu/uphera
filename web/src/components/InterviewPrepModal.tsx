import React, { useState } from 'react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import AIChatbot from './AIChatbot';

interface InterviewPrepModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  company: string;
}

const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  company
}) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'practice' | 'ai-coach'>('questions');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);

  if (!isOpen) return null;

  const mockQuestions = [
    {
      id: 1,
      question: `${jobTitle} pozisyonu için React konusunda deneyiminizi anlatır mısınız?`,
      tips: [
        'Konkret projelerden örnekler verin',
        'State management yaklaşımınızı açıklayın',
        'Performans optimizasyonu deneyimlerinizi paylaşın'
      ]
    },
    {
      id: 2,
      question: `${company} şirketinde neden çalışmak istiyorsunuz?`,
      tips: [
        'Şirketin değerleri ile kendi değerlerinizi eşleştirin',
        'Kariyerinize nasıl katkı sağlayacağını belirtin',
        'Şirketin teknoloji stack\'ini araştırdığınızı gösterin'
      ]
    },
    {
      id: 3,
      question: 'Zor bir teknik problemle karşılaştığınızda nasıl yaklaşıyorsunuz?',
      tips: [
        'Problem çözme sürecinizi adım adım açıklayın',
        'Araştırma metodlarınızı belirtin',
        'Takım çalışması ve yardım alma yaklaşımınızı vurgulayın'
      ]
    }
  ];

  const handlePracticeAnswer = () => {
    // Mock AI feedback
    const mockFeedback = `
      Güzel bir yanıt! İşte geliştirme önerilerim:
      
      ✓ Teknik detayları iyi açıkladınız
      ✓ Somut örnekler verdiniz
      
      💡 Geliştirme alanları:
      - Daha spesifik metrikler ekleyebilirsiniz
      - Problem çözme sürecinizi daha detaylandırabilirsiniz
      - UpSchool deneyiminizi daha vurgulayabilirsiniz
    `;
    setFeedback(mockFeedback);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <ModernCard padding="lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                Mülakat Hazırlığı
              </h2>
              <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                {jobTitle} - {company}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('questions')}
              className={`up-nav-link ${activeTab === 'questions' ? 'active' : ''}`}
            >
              Mülakat Soruları
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`up-nav-link ${activeTab === 'practice' ? 'active' : ''}`}
            >
              Simüle Mülakat
            </button>
            <button
              onClick={() => setActiveTab('ai-coach')}
              className={`up-nav-link ${activeTab === 'ai-coach' ? 'active' : ''}`}
            >
              🤖 AI Mülakat Koçu
            </button>
          </div>

          {/* Questions Tab */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                Bu pozisyon için tipik sorular:
              </h3>
              {mockQuestions.map((q, index) => (
                <ModernCard key={q.id} padding="md" className="border">
                  <h4 className="font-medium mb-3" style={{ color: 'var(--up-primary-dark)' }}>
                    {index + 1}. {q.question}
                  </h4>
                  <div className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    <strong>İpuçları:</strong>
                    <ul className="mt-2 space-y-1">
                      {q.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start gap-2">
                          <span style={{ color: 'var(--up-primary)' }}>•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ModernCard>
              ))}
            </div>
          )}

          {/* Practice Tab */}
          {activeTab === 'practice' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                  Simüle Mülakat Pratiği
                </h3>
                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  Soru {currentQuestion + 1} / {mockQuestions.length}
                </p>
              </div>

              <ModernCard padding="md" className="border-l-4" style={{ borderLeftColor: 'var(--up-primary)' }}>
                <h4 className="font-medium mb-4" style={{ color: 'var(--up-primary-dark)' }}>
                  {mockQuestions[currentQuestion].question}
                </h4>
                
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Yanıtınızı buraya yazın..."
                  className="up-input min-h-[120px] mb-4"
                  rows={5}
                />

                <div className="flex gap-2">
                  <ModernButton
                    variant="primary"
                    size="sm"
                    onClick={handlePracticeAnswer}
                    disabled={!answer.trim()}
                  >
                    AI Değerlendirmesi Al
                  </ModernButton>
                  
                  {currentQuestion < mockQuestions.length - 1 && (
                    <ModernButton
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCurrentQuestion(currentQuestion + 1);
                        setAnswer('');
                        setFeedback('');
                      }}
                    >
                      Sonraki Soru
                    </ModernButton>
                  )}
                </div>
              </ModernCard>

              {/* AI Feedback */}
              {feedback && (
                <ModernCard padding="md" style={{ background: 'var(--up-light-gray)' }}>
                  <h4 className="font-medium mb-3" style={{ color: 'var(--up-primary-dark)' }}>
                    AI Geri Bildirimi
                  </h4>
                  <div className="text-sm whitespace-pre-line" style={{ color: 'var(--up-dark-gray)' }}>
                    {feedback}
                  </div>
                </ModernCard>
              )}
            </div>
          )}

          {/* AI Coach Tab */}
          {activeTab === 'ai-coach' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
                     style={{ background: 'linear-gradient(135deg, var(--up-primary) 0%, var(--up-primary-dark) 100%)' }}>
                  🤖
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                  UpSchool AI Mülakat Koçu
                </h3>
                <p className="text-sm mb-6" style={{ color: 'var(--up-dark-gray)' }}>
                  Kişiselleştirilmiş mülakat hazırlığı için AI koçunuzla konuşun
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <ModernCard padding="md" className="text-left">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      🎯 Pozisyona Özel Hazırlık
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      {jobTitle} pozisyonu için özel sorular ve tavsiyeler
                    </p>
                  </ModernCard>
                  
                  <ModernCard padding="md" className="text-left">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      💬 Gerçek Zamanlı Destek
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      Anlık soru-cevap ve kişisel geri bildirim
                    </p>
                  </ModernCard>
                  
                  <ModernCard padding="md" className="text-left">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      🌟 STAR Tekniği
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      Etkili cevap verme tekniklerini öğrenin
                    </p>
                  </ModernCard>
                  
                  <ModernCard padding="md" className="text-left">
                    <h4 className="font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                      😌 Stres Yönetimi
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                      Mülakat heyecanını kontrol etme ipuçları
                    </p>
                  </ModernCard>
                </div>

                <ModernButton
                  variant="primary"
                  size="lg"
                  onClick={() => setShowAIChat(true)}
                  className="w-full md:w-auto"
                >
                  AI Koçla Konuşmaya Başla 🚀
                </ModernButton>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t flex justify-between">
            <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
              UpSchool AI destekli mülakat hazırlığı
            </div>
            <ModernButton variant="secondary" size="sm" onClick={onClose}>
              Kapat
            </ModernButton>
          </div>
        </ModernCard>
      </div>

      {/* AI Chatbot */}
      <AIChatbot 
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        context="interview"
        userProfile={{ jobTitle, company }}
      />
    </div>
  );
};

export default InterviewPrepModal; 