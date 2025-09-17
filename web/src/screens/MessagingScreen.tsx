import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Paperclip,
  Smile,
  Info
} from 'lucide-react';
import Header from '../components/Header';
import ModernButton from '../components/ModernButton';
import ModernCard from '../components/ModernCard';
import AIChatbot from '../components/AIChatbot';
import BrandLogo from '../components/BrandLogo';
import { apiService } from '../services/api';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

interface MentorInfo {
  id: string;
  name: string;
  title: string;
  company: string;
  profileImage?: string;
  isOnline: boolean;
  lastSeen?: string;
}

const MessagingScreen: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [mentorInfo, setMentorInfo] = useState<MentorInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
    loadCurrentUser();
  }, [mentorId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCurrentUser = () => {
    const userData = localStorage.getItem('uphera_user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id || 'current_user');
    }
  };

  const loadConversation = async () => {
    try {
      if (!mentorId) return;
      
      // Mentor bilgilerini ve mesajları paralel olarak yükle
      const [mentorResponse, messagesResponse] = await Promise.all([
        getMentorInfo(mentorId),
        apiService.getConversation(mentorId)
      ]);

      if (mentorResponse) {
        setMentorInfo(mentorResponse);
      }

      if (messagesResponse.success) {
        setMessages(messagesResponse.messages);
      }
    } catch (error) {
      console.error('Konuşma yükleme hatası:', error);
      toast.error('Mesajlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getMentorInfo = async (id: string): Promise<MentorInfo | null> => {
    // Mock mentor info - gerçek uygulamada API'den gelir
    const mentors: Record<string, MentorInfo> = {
      'm1': {
        id: 'm1',
        name: 'Gizem Aktaş',
        title: 'Senior Engineering Manager',
        company: 'Meta',
        profileImage: '/api/placeholder/50/50',
        isOnline: true
      },
      'm2': {
        id: 'm2',
        name: 'Ayşe Demir',
        title: 'Senior Frontend Developer',
        company: 'Spotify',
        profileImage: '/api/placeholder/50/50',
        isOnline: false,
        lastSeen: '2 saat önce'
      }
    };

    return mentors[id] || null;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !mentorId || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      // Önce UI'ı güncelle (optimistic update)
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        senderId: currentUserId,
        receiverId: mentorId,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };
      
      setMessages(prev => [...prev, tempMessage]);

      // API'ye gönder
      const response = await apiService.sendMessage({
        receiverId: mentorId,
        content: messageContent,
        type: 'text'
      });

      if (response.success) {
        // Temp mesajı gerçek mesaj ile değiştir
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempMessage.id 
              ? { ...response.message, id: response.message.id }
              : msg
          )
        );
        toast.success('Mesaj gönderildi');
      } else {
        // Hata durumunda temp mesajı kaldır
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
        toast.error('Mesaj gönderilemedi');
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      setMessages(prev => prev.filter(msg => msg.id.startsWith('temp_')));
      toast.error('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', { 
        day: 'numeric', 
        month: 'long' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          showAIChat={showAIChat}
          setShowAIChat={setShowAIChat}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--up-primary)' }}></div>
        </div>
      </div>
    );
  }

  if (!mentorInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          showAIChat={showAIChat}
          setShowAIChat={setShowAIChat}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />
        <div className="max-w-4xl mx-auto p-6">
          <ModernCard className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Mentor bulunamadı</h2>
            <ModernButton onClick={() => navigate('/mentorship')} variant="primary">
              Mentorship Sayfasına Dön
            </ModernButton>
          </ModernCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header 
        showAIChat={showAIChat}
        setShowAIChat={setShowAIChat}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
      />

      {/* Chat Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/mentorship')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={mentorInfo.profileImage || '/api/placeholder/40/40'}
                    alt={mentorInfo.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {mentorInfo.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--up-primary-dark)' }}>
                    {mentorInfo.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                    {mentorInfo.isOnline ? 'Çevrimiçi' : mentorInfo.lastSeen || 'Çevrimdışı'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Info className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--up-primary-dark)' }}>
                  Konuşma başlatın
                </h3>
                <p className="text-sm" style={{ color: 'var(--up-dark-gray)' }}>
                  {mentorInfo.name} ile ilk mesajınızı gönderin
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isOwnMessage = message.senderId === currentUserId;
                const showDateHeader = index === 0 || 
                  formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

                return (
                  <div key={message.id}>
                    {showDateHeader && (
                      <div className="text-center py-2">
                        <span className="text-xs px-3 py-1 bg-gray-200 rounded-full" style={{ color: 'var(--up-dark-gray)' }}>
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        isOwnMessage 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 bg-white border-t">
            <div className="flex items-end space-x-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Paperclip className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>
              
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`${mentorInfo.name} ile mesajlaş...`}
                  className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile className="h-5 w-5" style={{ color: 'var(--up-primary)' }} />
              </button>

              <ModernButton
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                variant="primary"
                className="px-4 py-2"
              >
                {sending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </ModernButton>
            </div>
          </div>
        </div>
      </div>

      {showAIChat && (
        <AIChatbot onClose={() => setShowAIChat(false)} />
      )}
      <BrandLogo />
    </div>
  );
};

export default MessagingScreen;
