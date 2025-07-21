import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, X, Minimize2, Maximize2, Sparkles, Brain, MessageCircle, Upload, FileText, Zap } from 'lucide-react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  isStreaming?: boolean;
  enhanced?: boolean;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  context?: 'profile' | 'interview' | 'general' | 'network';
  contextData?: any;
  userProfile?: any;
}

const AIChatbot: React.FC<AIChatbotProps> = ({ 
  isOpen, 
  onClose, 
  context = 'general',
  contextData,
  userProfile 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [hasCVInsights, setHasCVInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context-specific welcome messages
  const getWelcomeMessage = () => {
    const baseMessage = {
      content: `Merhaba! 👋 Ben Ada AI - UpSchool mezunu teknoloji kadınlarının yapay zeka mentoru!

Ada Lovelace'den ilham alarak, senin teknoloji yolculuğunda yanındayım. UpSchool'da başlayan hikayeni şimdi kariyer seviyesine taşıyalım! 🚀

${useEnhanced ? '🧠 **Enhanced Mode Aktif!** - ChromaDB + LangChain ile güçlendirilmiş yanıtlar' : '⚡ **Basic Mode** - Hızlı yanıtlar'}

**Sana nasıl yardım edebilirim:**
• 💼 Kariyer planlama ve iş arama stratejileri
• 📈 Beceri geliştirme ve öğrenme yol haritaları  
• 🎯 Mülakat hazırlığı ve özgüven artırma
• 🌐 Network kurma ve topluluk içinde yer alma
• 💪 Teknoloji sektöründe kadın olarak güçlenme
• 📄 CV yükleme ve analiz (Enhanced Mode)

Bugün hangi konuda sohbet edelim? 💭`,
      suggestions: [
        "Kariyerimde nasıl ilerleyebilirim?",
        "Hangi teknolojileri öğrenmeliyim?",
        "İş arama sürecim için tavsiye ver",
        "CV'mi yükleyip analiz et"
      ]
    };

    // Context specific modifications
    switch (context) {
      case 'profile':
        baseMessage.content = `Merhaba! 👋 Ben Ada AI - senin UpSchool AI mentor'un! 

UpSchool'da aldığın eğitim sadece bir başlangıçtı - şimdi asıl yolculuk başlıyor! 🚀

${useEnhanced ? '🧠 **Enhanced Mode**: CV yükle, kişiselleştirilmiş analiz al!' : ''}

**Birlikte yapabileceğimiz:**
• 📝 Deneyimlerini güçlü bir hikayeye dönüştürmek
• 🎯 Eksik olan yetenekleri belirleyip öğrenme planı yapmak
• 📊 Profilini işverenlerin aradığı şekilde optimize etmek
• 💼 Portfolio projelerini geliştirecek fikirler üretmek
• 🌟 Özgüvenini artıracak başarı stratejileri

CV'ni yükleyerek kişiselleştirilmiş analiz alabilirsin! 📄`;
        baseMessage.suggestions = [
          "CV'mi yükleyip analiz et",
          "GitHub profilimi nasıl güçlendirebilirim?",
          "Hangi projeleri portföyüme eklemeliyim?",
          "Profilimi hangi alanlarda güçlendirebilirim?"
        ];
        break;
      
      case 'interview':
        baseMessage.content = `Selam! Ben Ada AI 💪 Mülakat hazırlığı zamanı geldi!

UpSchool'da aldığın eğitim seni buraya kadar getirdi, şimdi o güçlü kadın enerjinle mülakatı da başarıyla geçeceksin! 

${useEnhanced ? '🧠 **CV bazlı mülakat hazırlığı**: CV\'ni yükle, kişiselleştirilmiş sorular al!' : ''}

**Mülakat hazırlık planın:**
• 🎯 Teknik sorulara stratejik hazırlık
• 💭 Behavioral sorular için STAR tekniği
• 🏢 Şirket araştırması ve kültür uyumu
• 💪 Özgüven artırma teknikleri
• 💰 Maaş müzakeresi stratejileri`;
        break;
    }

    return baseMessage;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage();
      setMessages([{
        id: 'welcome',
        type: 'assistant',
        content: welcomeMessage.content,
        timestamp: new Date(),
        suggestions: welcomeMessage.suggestions,
        enhanced: useEnhanced
      }]);
    }
  }, [isOpen, context, useEnhanced]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const closeStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const handleCVUpload = async (file: File) => {
    setIsUploadingCV(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const userId = userProfile?.id || 'demo_user';
      
      const response = await fetch(`http://localhost:8000/ai-coach/cv/upload?user_id=${userId}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('CV başarıyla yüklendi ve analiz edildi!');
        setHasCVInsights(true);
        
        // Add CV upload message to chat
        const uploadMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: `✅ **CV Başarıyla Yüklendi!**

📄 **Dosya:** ${result.filename}
📊 **İşlenen chunks:** ${result.chunks_processed}

**🔍 Hızlı Analiz:**
${result.analysis?.analysis || 'CV analizi tamamlandı!'}

Artık sana CV'ne özel tavsiyeler verebilirim! "CV analizi yap" diyerek detaylı insights alabilirsin.`,
          timestamp: new Date(),
          suggestions: [
            "CV analizi yap",
            "CV'mdeki güçlü yanları göster",
            "Hangi becerileri geliştirmeliyim?",
            "CV'mde eksik olan neler?"
          ],
          enhanced: true
        };
        
        setMessages(prev => [...prev, uploadMessage]);
      } else {
        throw new Error(result.message || 'CV yükleme başarısız');
      }
      
    } catch (error) {
      console.error('CV Upload Error:', error);
      toast.error('CV yüklenirken hata oluştu');
    } finally {
      setIsUploadingCV(false);
      setCvFile(null);
    }
  };

  const getCVInsights = async () => {
    try {
      const userId = userProfile?.id || 'demo_user';
      const response = await fetch('http://localhost:8000/ai-coach/cv/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      
      const insights = await response.json();
      
      const insightsMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `📊 **CV Analiz Raporu**

${insights.insights}

${insights.has_cv ? `📈 **Analiz Tarihi:** ${new Date(insights.analyzed_at).toLocaleString('tr-TR')}` : ''}`,
        timestamp: new Date(),
        suggestions: [
          "Bu önerileri nasıl uygularım?",
          "Hangi projeleri eklemeliyim?",
          "CV formatımı değiştirmeliyim?",
          "LinkedIn profilimi güncelle"
        ],
        enhanced: true
      };
      
      setMessages(prev => [...prev, insightsMessage]);
      
    } catch (error) {
      console.error('CV Insights Error:', error);
      toast.error('CV analizi alınırken hata oluştu');
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text || isTyping) return;

    // Handle special commands
    if (text.toLowerCase().includes('cv analizi') || text.toLowerCase().includes('cv insights')) {
      await getCVInsights();
      setInputValue('');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Streaming response başlat
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      enhanced: useEnhanced
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const apiEndpoint = useEnhanced ? 
        'http://localhost:8000/ai-coach/chat/enhanced/stream' : 
        'http://localhost:8000/ai-coach/chat/stream';

      if (useStreaming) {
        // Streaming API call
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            context: context,
            user_data: userProfile ? {
              id: userProfile.id || 'demo_user',
              name: userProfile.name,
              upschool_batch: userProfile.upschoolProgram || userProfile.upschool_batch || 'Data Science',
              skills: userProfile.skills || ['Python', 'Machine Learning', 'Data Analysis'],
              career_goal: userProfile.career_goal || 'Data Scientist pozisyonu'
            } : null,
            conversation_history: messages.slice(-6).map(msg => ({
              type: msg.type,
              content: msg.content
            })),
            stream: true,
            use_enhanced: useEnhanced
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let accumulatedContent = '';
          let suggestions: string[] = [];
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data.trim()) {
                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.type === 'content') {
                      accumulatedContent += parsed.content;
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === assistantMessage.id 
                            ? { ...msg, content: accumulatedContent }
                            : msg
                        )
                      );
                    } else if (parsed.type === 'suggestions') {
                      suggestions = parsed.suggestions || [];
                    } else if (parsed.type === 'done') {
                      // Finalize message with suggestions
                      setMessages(prev => 
                        prev.map(msg => 
                          msg.id === assistantMessage.id 
                            ? { 
                                ...msg, 
                                isStreaming: false,
                                suggestions: suggestions,
                                enhanced: parsed.enhanced
                              }
                            : msg
                        )
                      );
                      break;
                    }
                  } catch (e) {
                    console.log('Parse error:', e);
                  }
                }
              }
            }
          }
        }
      } else {
        // Non-streaming fallback
        const response = await fetch('http://localhost:8000/ai-coach/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            context: context,
            user_data: userProfile,
            conversation_history: messages.slice(-6).map(msg => ({
              type: msg.type,
              content: msg.content
            }))
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { 
                  ...msg, 
                  content: data.response,
                  suggestions: data.suggestions,
                  isStreaming: false
                }
              : msg
          )
        );
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                content: `❌ Üzgünüm, şu anda teknik bir sorun yaşıyorum. ${useEnhanced ? 'Enhanced mode hata:' : 'Hata:'} ${error}`,
                isStreaming: false
              }
            : msg
        )
      );
      toast.error('AI asistan bağlantı hatası');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      handleCVUpload(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-xl shadow-2xl ${isMinimized ? 'w-80 h-16' : 'w-full max-w-2xl h-[600px]'} transition-all duration-300`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                Ada AI 🤖
              </h3>
              <p className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                {context === 'profile' && 'Profil Optimizasyon Uzmanı'}
                {context === 'interview' && 'Mülakat Hazırlık Koçu'}
                {context === 'network' && 'Network Geliştirme Rehberi'}
                {context === 'general' && 'UpSchool AI Mentoru'}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {useStreaming && (
                <div className="flex items-center space-x-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  <Sparkles className="h-3 w-3" />
                  <span>Live</span>
                </div>
              )}
              {useEnhanced && (
                <div className="flex items-center space-x-1 text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                  <Zap className="h-3 w-3" />
                  <span>Enhanced</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUseEnhanced(!useEnhanced)}
              className="p-1 rounded text-xs"
              style={{ color: 'var(--up-primary)' }}
              title={useEnhanced ? 'Enhanced Mode (Vector DB + Memory)' : 'Basic Mode'}
            >
              {useEnhanced ? '🧠' : '⚡'}
            </button>
            <button
              onClick={() => setUseStreaming(!useStreaming)}
              className="p-1 rounded text-xs"
              style={{ color: 'var(--up-primary)' }}
              title={useStreaming ? 'Streaming Açık' : 'Streaming Kapalı'}
            >
              {useStreaming ? '🔴' : '⚪'}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-gray-100"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                closeStreaming();
                onClose();
              }}
              className="p-1 rounded hover:bg-gray-100"
              style={{ color: 'var(--up-dark-gray)' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 h-96">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : message.enhanced 
                          ? 'bg-purple-50 border border-purple-200 text-gray-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse">|</span>
                        )}
                      </div>
                      
                      {message.enhanced && message.type === 'assistant' && (
                        <div className="mt-2 text-xs text-purple-600 flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Enhanced AI yanıtı</span>
                        </div>
                      )}
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-gray-600 font-medium">💡 Öneriler:</div>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left text-xs p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                              style={{ color: 'var(--up-primary)' }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className={`p-3 rounded-lg ${useEnhanced ? 'bg-purple-50 border border-purple-200' : 'bg-gray-100'} text-gray-800`}>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4">
              {/* CV Upload Section */}
              {useEnhanced && context === 'profile' && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">CV Yükle & Analiz Et</span>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCV}
                      className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Upload className="h-3 w-3" />
                      <span>{isUploadingCV ? 'Yükleniyor...' : 'CV Seç'}</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ada AI ile sohbet et... (Enter ile gönder)"
                  className="flex-1 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--up-primary)' }}
                  rows={2}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ background: 'var(--up-primary)' }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatbot; 