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
  const isVercelHost = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const disableStreamEnv = ((import.meta as any).env?.VITE_DISABLE_STREAM === 'true');
  const defaultStreaming = disableStreamEnv ? false : !(isVercelHost || isIOS || isSafari || isMobile);
  const [useStreaming, setUseStreaming] = useState(defaultStreaming);
  const [useEnhanced, setUseEnhanced] = useState(true);
  const [, setCvFile] = useState<File | null>(null);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [, setHasCVInsights] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assistantContentRef = useRef<string>("");

  // Context-specific welcome messages (daha geniş kapsam: Ada AI = Kariyer Yoldaşı)
  const getWelcomeMessage = () => {
    let baseMessage: { content: string | JSX.Element; suggestions: string[] } = {
      content: '',
      suggestions: [
        "Kariyer planımı birlikte çıkaralım",
        "Öğrenme yol haritası öner",
        "CV'imi değerlendir ve iyileştir",
        "Mülakat hazırlığı için pratik yapalım"
      ]
    };
    if (context === 'general') {
      baseMessage.content = (
        <span>
          Merhaba! <FiSmile style={{ display: 'inline', verticalAlign: 'middle' }} /> Ben Ada AI — <b>Teknolojide Öncü Kadınları Güçlendirme Asistanı</b>
          <br /><br />
          Up Hera deneyimini baştan sona kolaylaştırmak için buradayım: <b>profilini optimize etmekten</b>, <b>CV ve LinkedIn iyileştirmeye</b>, <b>iş arama ve başvuru stratejilerinden</b>, <b>mülakat pratiği</b> ve <b>öğrenme planına</b> kadar.
          <br /><br />
          {useEnhanced ? <><FiBarChart2 style={{ display: 'inline', verticalAlign: 'middle' }} /> <b>Gelişmiş Mod</b>: İçgörü odaklı, kapsamlı yanıtlar</> : <><FiZap style={{ display: 'inline', verticalAlign: 'middle' }} /> <b>Hızlı Mod</b>: Kısa ve net yanıtlar</>}
          <br /><br />
          <b>Sana nasıl yardım edebilirim:</b>
          <ul style={{ marginLeft: 16 }}>
            <li><FiBriefcase style={{ display: 'inline', verticalAlign: 'middle' }} /> Kariyer planlama ve iş arama stratejileri</li>
            <li><FiBarChart2 style={{ display: 'inline', verticalAlign: 'middle' }} /> Öğrenme yol haritası ve beceri gelişimi</li>
            <li><FiFileText style={{ display: 'inline', verticalAlign: 'middle' }} /> CV/LinkedIn inceleme ve iyileştirme</li>
            <li><FiTarget style={{ display: 'inline', verticalAlign: 'middle' }} /> Mülakat pratiği ve özgüven artırma</li>
            <li><FiGlobe style={{ display: 'inline', verticalAlign: 'middle' }} /> Network ve topluluk içinde görünürlük</li>
          </ul>
          <br />
          <div style={{ background: '#f0f9ff', padding: '8px', borderRadius: '6px', marginTop: '8px' }}>
            <FiZap style={{ display: 'inline', verticalAlign: 'middle', color: '#3b82f6' }} /> <b>Hızlı Destek:</b> Bağlantı yavaşsa kısa, aksiyon odaklı öneriler sunarım.
          </div>
          <br />
          Bugün hangi konuda ilerleyelim? <FiMessageCircle style={{ display: 'inline', verticalAlign: 'middle' }} />
        </span>
      );
    } else if (context === 'profile') {
      baseMessage.content = `Merhaba! Ben Ada AI — kariyer yolculuğunun her adımında yanındayım.\n\n${useEnhanced ? 'Enhanced Mode: CV yükle, içeriğini inceleyip somut öneriler sunayım.' : 'Hızlı Mod: Kısa ve net öneriler sunarım.'}\n\nBirlikte yapabileceklerimiz:\n• Profilini ve özetini daha etkili hâle getirmek\n• Eksik becerileri tespit edip öğrenme planı hazırlamak\n• Portföy/proje önerileri geliştirmek\n• CV ve LinkedIn için metin iyileştirmek`;
      baseMessage.suggestions = [
        "CV'mi yükleyip analiz et",
        "GitHub profilimi nasıl güçlendirebilirim?",
        "Hangi projeleri portföyüme eklemeliyim?",
        "Profilimi hangi alanlarda güçlendirebilirim?"
      ];
    } else if (context === 'interview') {
      baseMessage.content = `Selam! Ben Ada AI 💪 Sadece mülakat koçu değilim; başvuru öncesinden teklif aşamasına kadar seninle beraberim.\n\n${useEnhanced ? '🧠 CV bazlı hazırlık: CV\'ni yükle, kişiselleştirilmiş soru ve cevap stratejileri üretelim.' : ''}\n\n**Birlikte odaklanabileceklerimiz:**\n• Teknik ve behavioral soru pratiği\n• STAR tekniği ile güçlü hikâyeler\n• Şirket/pozisyon araştırması\n• Teklif değerlendirme ve müzakere`;
      baseMessage.suggestions = [
        "Bu önerileri nasıl uygularım?",
        "Hangi projeleri eklemeliyim?",
        "CV formatımı değiştirmeliyim?",
        "LinkedIn profilimi güncelle"
      ];
    } else if (context === 'network') {
      baseMessage.content = `Merhaba! Ben Ada AI — topluluk ve network tarafında da yanındayım.\n\n${useEnhanced ? 'Enhanced Mode: Profilini ve bağlantılarını analiz edip kişiselleştirilmiş öneriler sunarım.' : ''}\n\nBeraber şunlara odaklanabiliriz:\n• Doğru kişilerle bağlantı kurma\n• Etkileşim ve görünürlük artırma\n• Güçlü LinkedIn profili oluşturma`;
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

  // Basit markdown -> JSX dönüştürücü (bold ve listeleri destekler)
  const renderInline = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    const boldRegex = /\*\*(.+?)\*\*/g; // **bold**
    let match: RegExpExecArray | null;
    while ((match = boldRegex.exec(text)) !== null) {
      const [full, inner] = match;
      const start = match.index;
      if (start > lastIndex) parts.push(text.slice(lastIndex, start));
      parts.push(<strong key={`b-${start}`}>{inner}</strong>);
      lastIndex = start + full.length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts;
  };

  const renderMessageContent = (content: string): JSX.Element => {
    if (!content) return <></>;
    const blocks = content.split(/\n\n+/);
    return (
      <div className="space-y-2">
        {blocks.map((block, idx) => {
          const lines = block.split(/\n/);
          const bulletLines = lines.filter(l => /^\s*[-•]\s+/.test(l));
          if (bulletLines.length === lines.length && lines.length > 0) {
            return (
              <ul key={`ul-${idx}`} className="list-disc pl-5">
                {lines.map((l, i) => (
                  <li key={`li-${idx}-${i}`}>{renderInline(l.replace(/^\s*[-•]\s+/, ''))}</li>
                ))}
              </ul>
            );
          }
          // Basit başlık desteği: satır tamamen kalınsa strong uygula
          if (/^\s*#{1,3}\s+/.test(block)) {
            const headingText = block.replace(/^\s*#{1,3}\s+/, '');
            return (
              <p key={`p-${idx}`} className="font-semibold">{renderInline(headingText)}</p>
            );
          }
          return (
            <p key={`p-${idx}`}>{renderInline(block)}</p>
          );
        })}
      </div>
    );
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
      // Prod (Vercel) için gövde limiti nedeniyle daha küçük limit uygula
      const isProdVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
      const maxSize = isProdVercel ? Math.floor(2.5 * 1024 * 1024) : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(isProdVercel ? 'Prod ortamda dosya boyutu 2.5MB sınırını aşıyor' : 'Dosya boyutu 10MB sınırını aşıyor');
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

📄 **Dosya:** ${result.filename || file.name}

**🔍 Analiz (Özet):**
${result.analysis?.analysis || 'Analiz üretilemedi.'}

${result.cv_excerpt ? `**📄 İncelenen Metin Örneği:**\n${(result.cv_excerpt as string).slice(0, 500)}...\n` : ''}

"CV analizi yap" yazarak detaylı raporu alabilirsin.`,
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
    assistantContentRef.current = '';

    try {
      // Sadece LLM akışı: local/mock hızlı yanıtları tamamen kaldırıldı

              // Try online API with timeout
        const apiBases = isVercelHost ? [apiService.getBaseUrl()] : apiService.getBaseUrls();
        let lastError: any = null;
        let success = false;

        const shouldStream = useStreaming;
        if (shouldStream) {
          // Streaming API call with extended timeout and SSE accept header
          const STREAM_TIMEOUT_MS = 55000;

          // iOS/Safari/Mobil için EventSource + GET SSE kullan
          if (isVercelHost || isMobile || isSafari) {
            try {
              const base = apiService.getBaseUrl();
              const params = new URLSearchParams({
                message: text,
                context,
                response_mode: 'auto'
              });
              const esUrl = `${base}/ai-coach/chat/stream-get?${params.toString()}`;
              await new Promise<void>((resolve, reject) => {
                try {
                  const es = new EventSource(esUrl);
                  eventSourceRef.current = es;
                  let accumulatedContent = '';
                  let suggestions: string[] = [];

                  const timeoutId = setTimeout(() => {
                    try { es.close(); } catch {}
                    reject(new Error('EventSource timeout'));
                  }, STREAM_TIMEOUT_MS);

                  es.onmessage = (ev) => {
                    try {
                      const parsed = JSON.parse(ev.data);
                      if (parsed.type === 'content') {
                        accumulatedContent += parsed.content || '';
                        assistantContentRef.current = accumulatedContent;
                        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg));
                      } else if (parsed.type === 'done') {
                        suggestions = parsed.suggestions || [];
                        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, isStreaming: false, suggestions, enhanced: parsed.enhanced } : msg));
                        clearTimeout(timeoutId);
                        try { es.close(); } catch {}
                        resolve();
                      }
                    } catch {}
                  };

                  es.onerror = () => {
                    clearTimeout(timeoutId);
                    try { es.close(); } catch {}
                    // Kısmi içerik varsa bunu başarı sayalım
                    if (assistantContentRef.current && assistantContentRef.current.trim()) {
                      setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg));
                      resolve();
                    } else {
                      reject(new Error('EventSource error'));
                    }
                  };
                } catch (e) {
                  reject(e as any);
                }
              });
              success = true;
            } catch (err) {
              lastError = err;
            }
          } else {
            for (const base of apiBases) {
            const apiEndpoint = `${base}/ai-coach/chat/stream`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
            try {
              const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                  ...apiService.getJsonHeaders(),
                  'Accept': 'text/event-stream'
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
                          assistantContentRef.current = accumulatedContent;
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
          }
          // Non-streaming fallback if streaming failed on all bases
          if (!success) {
            try {
              // Try non-streaming on all bases with extended timeout
              const NON_STREAM_TIMEOUT_MS = 55000;
              let nonStreamOk = false;
                             for (const base of apiBases) {
                 const controller = new AbortController();
                 const timeoutId = setTimeout(() => controller.abort(), NON_STREAM_TIMEOUT_MS);
                 try {
                   const fallbackResp = await fetch(`${base}/ai-coach/chat`, {
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
                      use_streaming: false
                    }),
                    signal: controller.signal
                  });
                  clearTimeout(timeoutId);
                  const data = await fallbackResp.json().catch(() => null);
                  if (fallbackResp.ok && data?.response) {
                    setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: data.response, isStreaming: false, enhanced: true, suggestions: data.suggestions || [] } : msg));
                    nonStreamOk = true;
                    break;
                  }
                } catch (err) {
                  clearTimeout(timeoutId);
                  continue;
                }
              }
              if (!nonStreamOk) {
                throw new Error('Bağlantı hatası');
              }
            } catch (e) {
              throw lastError || e || new Error('Bağlantı hatası');
            }
          }
        } else {
        // Non-streaming mod: tüm base URL'lerde uzun zaman aşımı ile dene
        try {
          const NON_STREAM_TIMEOUT_MS = 45000;
          let nonStreamOk = false;
          const apiBases = isVercelHost ? [apiService.getBaseUrl()] : apiService.getBaseUrls();
          for (const base of apiBases) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), NON_STREAM_TIMEOUT_MS);
            try {
               const localEdge = '/api/ai-coach/chat';
               const targetUrl = (base.includes('localhost') || base.includes('127.0.0.1')) ? `${base}/ai-coach/chat` : localEdge;
               const resp = await fetch(targetUrl, {
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
                  use_streaming: false
                }),
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              const data = await resp.json().catch(() => null);
              if (resp.ok && data?.response) {
                setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: data.response, isStreaming: false, enhanced: true, suggestions: data.suggestions || [] } : msg));
                nonStreamOk = true;
                break;
              }
            } catch (err) {
              clearTimeout(timeoutId);
              continue;
            }
          }
          if (!nonStreamOk) {
            throw new Error('Bağlantı hatası');
          }
        } catch (e) {
          throw e;
        }
      }

    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Eğer kısmi içerik geldiyse onu koru, sadece streaming'i kapat
      if (assistantContentRef.current && assistantContentRef.current.trim().length > 0) {
        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, isStreaming: false } : msg));
      } else {
        // Hiç içerik yoksa offline fallback yanıtı göster
        const fallback = getOfflineResponse(text, context);
        setMessages(prev => prev.map(msg => msg.id === assistantMessage.id ? { ...msg, content: fallback.content, isStreaming: false, suggestions: fallback.suggestions, enhanced: false } : msg));
      }
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
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      setCvFile(file);
      handleCVUpload(file);
      // Aynı dosyayı peş peşe seçebilmek için temizle
      try { input.value = ''; } catch {}
    } else {
      toast.error('Dosya seçilemedi. Lütfen tekrar deneyin.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-xl ring-1 ring-black/5 border border-gray-100 overflow-hidden ${isMinimized ? 'w-80 h-16' : 'w-full max-w-2xl h-[640px]'} transition-all duration-300`}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b" style={{
          background: 'linear-gradient(90deg, rgba(59,130,246,0.10) 0%, rgba(14,165,233,0.08) 100%)',
          backdropFilter: 'blur(6px)'
        }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: 'var(--up-primary-dark)' }}>
                Ada AI
              </h3>
              <p className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
                Teknolojide öncü kadınları güçlendirmek için burada.
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
                <div className="flex items-center space-x-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
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
                    <div className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'text-white'
                        : message.enhanced
                          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 text-gray-800'
                          : message.enhanced === false
                            ? 'bg-blue-50 border border-blue-200 text-gray-800'
                            : 'bg-gray-100 text-gray-800'
                    }`} style={message.type === 'user' ? { background: 'var(--up-primary)' } : {}}>
                      <div className="text-sm">
                        {renderMessageContent(message.content)}
                        {message.isStreaming && (
                          <span className="inline-block w-2 h-4 bg-gray-400 ml-1 animate-pulse">|</span>
                        )}
                      </div>
                      
                      {message.enhanced && message.type === 'assistant' && (
                        <div className="mt-2 text-xs text-blue-600 flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>Enhanced AI yanıtı</span>
                        </div>
                      )}
                      {/* Offline etiketi kaldırıldı */}
                      
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs text-gray-600 font-medium flex items-center gap-1 mb-1"><FiZap /> Öneriler:</div>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-white border hover:bg-gray-50 transition-colors"
                                style={{ color: 'var(--up-primary)' }}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
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
              {/* CV Upload Section (her bağlamda göster) */}
              {useEnhanced && (
                <div className="mb-3 p-3 rounded-lg border" style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.3)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium" style={{ color: '#1d4ed8' }}>CV Yükle & Analiz Et</span>
                    </div>
                    <label
                      htmlFor="ai-cv-file-input"
                      className={`flex items-center space-x-2 px-3 py-1 rounded text-sm text-white ${isUploadingCV ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-700'}`}
                      style={{ background: '#2563eb' }}
                      onClick={(e) => {
                        if (isUploadingCV) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        // Bazı tarayıcılarda htmlFor tetiklenmezse programatik tetikle
                        try { fileInputRef.current?.click(); } catch {}
                      }}
                    >
                      <Upload className="h-3 w-3" />
                      <span>{isUploadingCV ? 'Yükleniyor...' : 'CV Seç'}</span>
                    </label>
                  </div>
                  <p className="mt-2 text-xs" style={{ color: '#1d4ed8' }}>PDF/DOCX/TXT desteklenir. İçerik gerçek analiz için işlenecektir.</p>
                   <input
                    id="ai-cv-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                  />
                </div>
              )}
              
              <div className="flex space-x-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ada AI ile sohbet et... (Enter ile gönder)"
                  className="flex-1 p-3 border rounded-xl resize-none focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--up-primary)' }}
                  rows={2}
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  className="p-3 rounded-xl text-white transition-colors disabled:opacity-50 shadow"
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