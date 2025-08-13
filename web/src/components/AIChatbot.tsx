import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Send, X, Minimize2, Maximize2, Sparkles, Brain, Upload, FileText, Zap } from 'lucide-react';
import { FiSmile, FiZap, FiBriefcase, FiBarChart2, FiTarget, FiGlobe, FiUserCheck, FiFileText, FiMessageCircle } from 'react-icons/fi';
import { apiService } from '../services/api';

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
  userProfile 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [, setHasCVInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Context-specific welcome messages
  const getWelcomeMessage = () => {
    let baseMessage: { content: string | JSX.Element; suggestions: string[] } = {
      content: '',
      suggestions: [
        "Kariyerimde nasıl ilerleyebilirim?",
        "Hangi teknolojileri öğrenmeliyim?",
        "İş arama sürecim için tavsiye ver",
        "CV'mi yükleyip analiz et"
      ]
    };
    if (context === 'general') {
      baseMessage.content = (
        <span>
          Merhaba! <FiSmile style={{ display: 'inline', verticalAlign: 'middle' }} /> Ben Ada AI - Up Hera topluluğunun yapay zeka mentoru!
          <br /><br />
           Ada Lovelace'den ilham alarak, senin teknoloji yolculuğunda yanındayım. Up Hera'da başlayan hikayeni şimdi kariyer seviyesine taşıyalım! <FiZap style={{ display: 'inline', verticalAlign: 'middle' }} />
          <br /><br />
          {useEnhanced ? <><FiBarChart2 style={{ display: 'inline', verticalAlign: 'middle' }} /> <b>Enhanced Mode Aktif!</b> - ChromaDB + LangChain ile güçlendirilmiş yanıtlar</> : <><FiZap style={{ display: 'inline', verticalAlign: 'middle' }} /> <b>Basic Mode</b> - Hızlı yanıtlar</>}
          <br /><br />
          <b>Sana nasıl yardım edebilirim:</b>
          <ul style={{ marginLeft: 16 }}>
            <li><FiBriefcase style={{ display: 'inline', verticalAlign: 'middle' }} /> Kariyer planlama ve iş arama stratejileri</li>
            <li><FiBarChart2 style={{ display: 'inline', verticalAlign: 'middle' }} /> Beceri geliştirme ve öğrenme yol haritaları</li>
            <li><FiTarget style={{ display: 'inline', verticalAlign: 'middle' }} /> Mülakat hazırlığı ve özgüven artırma</li>
            <li><FiGlobe style={{ display: 'inline', verticalAlign: 'middle' }} /> Network kurma ve topluluk içinde yer alma</li>
            <li><FiUserCheck style={{ display: 'inline', verticalAlign: 'middle' }} /> Teknoloji sektöründe kadın olarak güçlenme</li>
            <li><FiFileText style={{ display: 'inline', verticalAlign: 'middle' }} /> CV yükleme ve analiz (Enhanced Mode)</li>
          </ul>
          <br />
          <div style={{ background: '#f0f9ff', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
            <FiZap style={{ display: 'inline', verticalAlign: 'middle', color: '#3b82f6' }} /> <b>Offline Mode:</b> Backend bağlantısı olmasa bile size yardım edebilirim!
          </div>
          <br />
          Bugün hangi konuda sohbet edelim? <FiMessageCircle style={{ display: 'inline', verticalAlign: 'middle' }} />
        </span>
      );
    } else if (context === 'profile') {
      baseMessage.content = `Merhaba! Ben Ada AI - senin Up Hera AI mentor'un!\n\nUp Hera'daki topluluk desteğiyle, şimdi asıl yolculuk başlıyor!\n\n${useEnhanced ? 'Enhanced Mode: CV yükle, kişiselleştirilmiş analiz al!' : ''}\n\nBirlikte yapabileceklerimiz:\n• Deneyimlerini güçlü bir hikayeye dönüştürmek\n• Eksik olan yetenekleri belirleyip öğrenme planı yapmak\n• Profilini doğru şekilde optimize etmek\n• Portfolio projelerini geliştirecek fikirler üretmek\n• Özgüvenini artıracak başarı stratejileri\n\nCV'ni yükleyerek kişiselleştirilmiş analiz alabilirsin!`;
      baseMessage.suggestions = [
        "CV'mi yükleyip analiz et",
        "GitHub profilimi nasıl güçlendirebilirim?",
        "Hangi projeleri portföyüme eklemeliyim?",
        "Profilimi hangi alanlarda güçlendirebilirim?"
      ];
    } else if (context === 'interview') {
      baseMessage.content = `Selam! Ben Ada AI 💪 Mülakat hazırlığı zamanı geldi!

Up Hera topluluğunun desteğiyle şimdi o güçlü kadın enerjinle mülakatı başarıyla geçeceksin! 

${useEnhanced ? '🧠 **CV bazlı mülakat hazırlığı**: CV\'ni yükle, kişiselleştirilmiş sorular al!' : ''}

**Mülakat hazırlık planın:**
• 🎯 Teknik sorulara stratejik hazırlık
• 💭 Behavioral sorular için STAR tekniği
• 🏢 Şirket araştırması ve kültür uyumu
• 💪 Özgüven artırma teknikleri
• 💰 Maaş müzakeresi stratejileri`;
      baseMessage.suggestions = [
        "Bu önerileri nasıl uygularım?",
        "Hangi projeleri eklemeliyim?",
        "CV formatımı değiştirmeliyim?",
        "LinkedIn profilimi güncelle"
      ];
    } else if (context === 'network') {
      baseMessage.content = `Merhaba! Ben Ada AI - senin Up Hera Network mentor'un!

Topluluk desteğiyle network'ünü büyütme zamanı!

${useEnhanced ? 'Enhanced Mode: Network kurma ve kişiselleştirilmiş öneriler al!' : ''}

Birlikte yapabileceklerimiz:
• Network kurma ve topluluk içinde yer alma
• LinkedIn profilini güçlendirme
• Teknoloji sektöründe kadın olarak güçlenme
• Özgüvenini artıracak başarı stratejileri`;
      baseMessage.suggestions = [
        "LinkedIn profilimi nasıl güçlendirebilirim?",
        "Hangi topluluklarla etkileşime girebilirim?",
        "Network'ümü nasıl büyütürüm?",
        "Profilimi hangi alanlarda güçlendirebilirim?"
      ];
    }
    return baseMessage;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = getWelcomeMessage();
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          content: typeof welcome.content === 'string' ? welcome.content : '', // JSX ise boş string koy
          timestamp: new Date(),
          suggestions: welcome.suggestions
        }
      ]);
    }
  }, [isOpen]);

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
      // 10MB istemci tarafı boyut kontrolü
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Dosya boyutu 10MB sınırını aşıyor');
        return;
      }

      const userId = userProfile?.id || 'demo_user';
      const result = await apiService.uploadCV(file, userId);
      
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
        const msg = (result as any).message || (result as any).detail || (result as any).error || 'CV yükleme başarısız';
        toast.error(msg);
        return;
      }
      
    } catch (error: any) {
      console.error('CV Upload Error:', error);
      const msg = error?.message || 'CV yüklenirken hata oluştu';
      toast.error(msg);
    } finally {
      setIsUploadingCV(false);
      setCvFile(null);
    }
  };

  const getCVInsights = async () => {
    try {
      const userId = userProfile?.id || 'demo_user';
      const resp = await apiService.getCVInsights(userId);
      const insights = resp.success ? resp : resp; // shape uyumu için direkt kullan
      
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
      
    } catch (error: any) {
      console.error('CV Insights Error:', error);
      toast.error(error?.message || 'CV analizi alınırken hata oluştu');
    }
  };

  // Offline AI responses
  const getOfflineResponse = (message: string, context: string): { content: string; suggestions: string[] } => {
    const lowerMessage = message.toLowerCase();
    
    // Context-specific responses
    if (context === 'interview') {
      if (lowerMessage.includes('mülakat') || lowerMessage.includes('interview')) {
        return {
          content: `🎯 **Mülakat Hazırlık Rehberi**

**Teknik Mülakat İçin:**
• STAR tekniği ile projelerini anlat
• Kod yazarken düşüncelerini sesli ifade et
• Time complexity ve space complexity'yi belirt
• Test case'ler düşün

**Behavioral Sorular İçin:**
• "En zor proje" sorusu için UpSchool projelerini kullan
• "Takım çalışması" için grup projelerini anlat
• "Hata yönetimi" için debugging deneyimlerini paylaş

**Özgüven İçin:**
• Her gün 15 dakika ayna karşısında pratik yap
• Pozitif self-talk geliştir
• Nefes teknikleri öğren

**Hangi konuda daha detaylı bilgi istiyorsun?**`,
          suggestions: [
            "STAR tekniği nasıl kullanılır?",
            "Teknik sorulara nasıl hazırlanırım?",
            "Özgüvenimi nasıl artırırım?",
            "Mülakat öncesi ne yapmalıyım?"
          ]
        };
      }
    }
    
    if (context === 'profile') {
      if (lowerMessage.includes('cv') || lowerMessage.includes('özgeçmiş')) {
        return {
          content: `📄 **CV Optimizasyon Rehberi**

**Güçlü CV İçin:**
• Action verbs kullan (Geliştirdim, Yönettim, Optimize ettim)
• Sayısal sonuçlar ekle (Kullanıcı deneyimini %40 artırdım)
• UpSchool projelerini öne çıkar
• GitHub linkini ekle

**Teknik CV Formatı:**
• Contact bilgileri
• Professional Summary (2-3 cümle)
• Skills (Frontend, Backend, Tools)
• Projects (En güçlü 3-4 proje)
• Education (UpSchool vurgusu)

**Önerilen Projeler:**
• E-commerce platform
• Task management app
• Data visualization dashboard
• Portfolio website

**CV'ni göndermek ister misin?**`,
          suggestions: [
            "CV formatı nasıl olmalı?",
            "Hangi projeleri eklemeliyim?",
            "Skills bölümü nasıl yazılır?",
            "GitHub profilimi nasıl güçlendiririm?"
          ]
        };
      }
    }

    // General responses
    if (lowerMessage.includes('merhaba') || lowerMessage.includes('selam') || lowerMessage.includes('hello')) {
      return {
        content: `Merhaba! 👋 Ben Ada AI - Up Hera topluluğunun AI mentoru!

Senin teknoloji yolculuğunda yanındayım. UpSchool'dan mezun olduktan sonra kariyer hedeflerine ulaşmana yardım edeceğim.

**Size nasıl yardım edebilirim:**
• 🎯 Mülakat hazırlığı
• 📄 CV optimizasyonu  
• 💼 İş arama stratejileri
• 🚀 Kariyer planlama
• 💻 Teknik beceri geliştirme

Hangi konuda sohbet etmek istiyorsun?`,
        suggestions: [
          "Mülakat hazırlığı yapalım",
          "CV'mi optimize edelim",
          "Kariyer planımı konuşalım",
          "Teknik becerilerimi geliştirelim"
        ]
      };
    }

    if (lowerMessage.includes('kariyer') || lowerMessage.includes('iş') || lowerMessage.includes('job')) {
      return {
        content: `💼 **Kariyer Rehberi**

**İş Arama Stratejileri:**
• LinkedIn profilini güncelle ve aktif ol
• GitHub'da projelerini paylaş
• Networking etkinliklerine katıl
• UpSchool topluluğunu kullan

**Popüler Pozisyonlar:**
• Frontend Developer (React, Vue.js)
• Backend Developer (Node.js, Python)
• Full Stack Developer
• Data Scientist
• UI/UX Designer

**Maaş Beklentileri (Türkiye):**
• Junior: 15.000-25.000 TL
• Mid-level: 25.000-40.000 TL
• Senior: 40.000-60.000 TL+

**Hangi alanda çalışmak istiyorsun?**`,
        suggestions: [
          "Frontend developer olmak istiyorum",
          "Backend developer pozisyonları",
          "Maaş müzakeresi nasıl yapılır?",
          "Remote iş fırsatları neler?"
        ]
      };
    }

    if (lowerMessage.includes('react') || lowerMessage.includes('javascript') || lowerMessage.includes('frontend')) {
      return {
        content: `⚛️ **Frontend Development Rehberi**

**Öğrenme Yolu:**
1. **HTML/CSS** (2-3 hafta)
2. **JavaScript** (4-6 hafta)
3. **React** (6-8 hafta)
4. **TypeScript** (2-3 hafta)
5. **State Management** (Redux/Zustand)

**Önerilen Projeler:**
• Todo App (React + LocalStorage)
• Weather App (API integration)
• E-commerce (Full stack)
• Portfolio Website

**Önemli Konular:**
• Component lifecycle
• Hooks (useState, useEffect)
• Props ve state yönetimi
• API calls (fetch/axios)
• Error handling

**Hangi konuda yardım istiyorsun?**`,
        suggestions: [
          "React hooks nasıl kullanılır?",
          "API entegrasyonu yapalım",
          "State management öğrenelim",
          "Proje fikirleri ver"
        ]
      };
    }

    if (lowerMessage.includes('python') || lowerMessage.includes('data') || lowerMessage.includes('machine learning')) {
      return {
        content: `🐍 **Data Science & Python Rehberi**

**Öğrenme Yolu:**
1. **Python Temelleri** (3-4 hafta)
2. **Pandas & NumPy** (2-3 hafta)
3. **Data Visualization** (Matplotlib, Seaborn)
4. **Machine Learning** (Scikit-learn)
5. **Deep Learning** (TensorFlow/PyTorch)

**Önerilen Projeler:**
• Data Analysis Dashboard
• ML Model (Classification/Regression)
• Web Scraping Tool
• Data Visualization App

**Önemli Kütüphaneler:**
• pandas, numpy, matplotlib
• scikit-learn, tensorflow
• jupyter notebook
• streamlit (web apps)

**Hangi konuda yardım istiyorsun?**`,
        suggestions: [
          "Python temellerini öğrenelim",
          "Pandas kullanımı",
          "ML modeli geliştirelim",
          "Data visualization yapalım"
        ]
      };
    }

    // Default response
    return {
      content: `🤖 **Ada AI Yanıtı**

Merhaba! Senin sorunla ilgili yardım etmek istiyorum. UpSchool mezunu olarak teknoloji sektöründe başarılı olman için rehberlik edebilirim.

**Genel Öneriler:**
• Sürekli öğrenmeye devam et
• Projeler geliştir ve GitHub'da paylaş
• Networking yap ve topluluklara katıl
• Mentorluk al ve mentorluk ver

**Hangi konuda daha detaylı bilgi istiyorsun?**
• Mülakat hazırlığı
• CV optimizasyonu
• Teknik beceri geliştirme
• Kariyer planlama`,
      suggestions: [
        "Mülakat hazırlığı yapalım",
        "CV optimizasyonu",
        "Teknik beceri geliştirme",
        "Kariyer planlama"
      ]
    };
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
      // Sadece LLM akışı: local/mock hızlı yanıtları tamamen kaldırıldı

              // Try online API with timeout
        const apiBases = apiService.getBaseUrls();
        let lastError: any = null;
        let success = false;

        if (useStreaming) {
          // Streaming API call with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for faster Gemini

        for (const base of apiBases) {
          const apiEndpoint = `${base}/ai-coach/chat/stream`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: apiService.getJsonHeaders(),
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
              }),
              signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok || !response.body) {
              lastError = new Error(`HTTP ${response.status}`);
              continue;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

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
                        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg));
                      } else if (parsed.type === 'suggestions') {
                        suggestions = parsed.suggestions || [];
                      } else if (parsed.type === 'done') {
                        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, isStreaming: false, suggestions, enhanced: parsed.enhanced } : msg));
                        success = true;
                        break;
                      }
                    } catch (e) {
                      console.log('Parse error:', e);
                    }
                  }
                }
              }
            }

            if (success) break;
          } catch (error: any) {
            clearTimeout(timeoutId);
            lastError = error;
            continue;
          }
        }
        if (!success) {
          throw lastError || new Error('Bağlantı hatası');
        }
      } else {
        // Non-streaming mod devre dışı: her zaman streaming kullan
        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: 'Lütfen streaming açık kullanın.', isStreaming: false } : msg));
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Offline/Local fallback devre dışı: hata durumunda direkt hata göster
      setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: '❌ Bağlantı hatası veya zaman aşımı. Lütfen tekrar deneyin.', isStreaming: false, enhanced: false } : msg));
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
                          : message.enhanced === false
                            ? 'bg-blue-50 border border-blue-200 text-gray-800'
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
                      {message.enhanced === false && message.type === 'assistant' && (
                        <div className="mt-2 text-xs text-blue-600 flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Offline AI yanıtı</span>
                        </div>
                      )}
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs text-gray-600 font-medium flex items-center gap-1"><FiZap /> Öneriler:</div>
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