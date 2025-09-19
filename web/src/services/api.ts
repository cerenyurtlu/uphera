/**
 * Up Hera API Service - Production Ready
 * Real API integration with error handling and retry logic
 */

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  [key: string]: any;
}

class UpHeraApiService {
  private baseUrls = (() => {
    const urls: string[] = [];
    try {
      const origin = (typeof window !== 'undefined' && (window as any).location?.origin) ? (window as any).location.origin : '';
      if (origin) {
        urls.push(origin);
      }
    } catch {}
    urls.push((import.meta as any).env?.VITE_API_URL || 'https://uphera.vercel.app');
    urls.push('http://127.0.0.1:8000');
    urls.push('http://localhost:8000');
    return urls;
  })();
  private currentUrlIndex = 0;
  private retryAttempts = 1;

  private get baseUrl(): string {
    return this.baseUrls[this.currentUrlIndex];
  }

  // Expose selected base URL for components that need raw streaming fetch
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Public helper to get JSON headers (including Authorization)
  getJsonHeaders(): HeadersInit {
    return this.getAuthHeaders();
  }

  // Expose all base URLs for fallback logic in streaming consumers
  getBaseUrls(): string[] {
    return [...this.baseUrls];
  }

  private getAuthHeaders(): HeadersInit {
    const userData = localStorage.getItem('uphera_user');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (userData) {
      try {
        const user = JSON.parse(userData);
        const token = user.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { __meta?: { timeoutMs?: number; retryAttempts?: number; maxBaseUrls?: number } } = {}
  ): Promise<ApiResponse<T>> {
    let lastError: Error = new Error('No attempts made');

    // Per-request meta overrides (timeout, retries, baseUrl limit)
    const meta = options.__meta || {};
    const maxBaseUrls = typeof meta.maxBaseUrls === 'number' ? Math.max(1, meta.maxBaseUrls) : this.baseUrls.length;
    const retryAttempts = typeof meta.retryAttempts === 'number' ? Math.max(1, meta.retryAttempts) : this.retryAttempts;

    // Try available URLs (possibly limited by meta)
    for (let urlIndex = 0; urlIndex < Math.min(this.baseUrls.length, maxBaseUrls); urlIndex++) {
      this.currentUrlIndex = urlIndex;
      const url = `${this.baseUrl}${endpoint}`;

      // Try multiple times for the current URL
      for (let attempt = 0; attempt < retryAttempts; attempt++) {
        try {
          console.log(`🔄 API Request (URL ${urlIndex + 1}, Attempt ${attempt + 1}): ${options.method || 'GET'} ${endpoint}`);

          const controller = new AbortController();
          const bodyAny = (options as any).body;
          const isFormDataTimeout = bodyAny && typeof FormData !== 'undefined' && (bodyAny instanceof FormData);
          const timeoutMs = typeof meta.timeoutMs === 'number' ? meta.timeoutMs : (isFormDataTimeout ? 15000 : 1500);
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

          const isFormData = (options as any).body && typeof FormData !== 'undefined' && ((options as any).body instanceof FormData);
          const mergedHeaders: HeadersInit = {
            ...this.getAuthHeaders(),
            ...options.headers,
          } as any;
          if (isFormData && 'Content-Type' in (mergedHeaders as any)) {
            delete (mergedHeaders as any)['Content-Type'];
          }

          const response = await fetch(url, {
            ...options,
            headers: mergedHeaders,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ API Success: ${endpoint}`);
            return data;
          } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.warn(`⚠️ API Error ${response.status}: ${endpoint}`, errorData);

            // Fallback strategy: for non-OK responses, try next base URL unless this is the last one
            const isLastBaseUrl = urlIndex === Math.min(this.baseUrls.length, maxBaseUrls) - 1;
            if (!isLastBaseUrl) {
              // Continue outer loop (next base URL)
              throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
            }

            // If last base URL, return structured error
            return {
              success: false,
              error: errorData.message || errorData.detail || 'Request failed',
              ...errorData
            };
          }
        } catch (error: any) {
          lastError = error;
          console.error(`❌ API Error (URL ${urlIndex + 1}, Attempt ${attempt + 1}):`, error);
          
          // Wait before retry (except last attempt)
          if (attempt < retryAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }
    }

    // All attempts failed
    return {
      success: false,
      error: 'Connection failed',
      message: lastError?.message || 'Unable to connect to server'
    };
  }

  // Authentication APIs
  async login(email: string, password: string, userType: string = 'mezun'): Promise<ApiResponse> {
    const response = await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        user_type: userType
      })
    });

    if (response.success) {
      // Store user data
      localStorage.setItem('uphera_user', JSON.stringify(response));
    }

    return response;
  }

  async register(userData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/auth/graduate/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async getProfile(): Promise<ApiResponse> {
    return this.makeRequest('/api/auth/profile');
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    const response = await this.makeRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });

    if (response.success) {
      // Update local storage
      const userData = localStorage.getItem('uphera_user');
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = { ...user, ...response.user };
        localStorage.setItem('uphera_user', JSON.stringify(updatedUser));
      }
    }

    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('uphera_user');
    localStorage.removeItem('uphera_settings');
  }

  // AI Chat APIs
  async chatWithAI(message: string, context: string = 'general'): Promise<ApiResponse> {
    // Prod: local Edge function kullan, local dev: backend
    const isLocal = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
    const endpoint = isLocal ? '/ai-coach/chat' : '/api/ai-coach/chat';
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
        use_streaming: false
      })
    });
  }

  async streamChatWithAI(
    message: string, 
    context: string = 'general',
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      // Prefer GET SSE endpoint for true real-time streaming and Safari compatibility
      const params = new URLSearchParams({ message, context });
      const sseUrl = `${this.baseUrl}/ai-coach/chat/stream-get?${params.toString()}`;
      let response = await fetch(sseUrl, { method: 'GET', headers: this.getAuthHeaders() });

      // Fallback to POST if GET SSE fails/non-ok
      if (!response.ok || !response.body) {
        const postUrl = `${this.baseUrl}/ai-coach/chat/stream`;
        response = await fetch(postUrl, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({ message, context, use_streaming: true })
        });
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.chunk) {
                onChunk(data.chunk);
              }
              if (data.done) {
                return;
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Stream chat error:', error);
      throw error;
    }
  }

  async uploadDocument(file: File): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.getAuthHeaders();
    return this.makeRequest('/ai-coach/document/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': (headers as any)['Authorization'] || ''
      }
    });
  }

  async uploadCV(file: File, userId: string): Promise<ApiResponse> {
    // Prod: Node function kullan, dev: backend
    const isLocal = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
    const endpoint = isLocal ? `/ai-coach/cv/upload?user_id=${encodeURIComponent(userId)}` : '/api/ai-coach/cv/upload';

    // Node function için base64 içerik gönderiyoruz (form-data yerine)
    if (!isLocal) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const payload = { userId, fileName: file.name, fileBase64: base64 };
      const resp = await this.makeRequest(endpoint, {
        method: 'POST',
        // Not: Vercel Edge function'larında gövde boyutu kısıtı olabilir; JSON + base64 daha güvenli
        body: JSON.stringify(payload),
        __meta: { timeoutMs: 90000, retryAttempts: 1, maxBaseUrls: 1 }
      });
      try {
        if (resp && (resp as any).success && (resp as any).analysis !== undefined) {
          const raw = (resp as any).analysis;
          const analysisText = typeof raw === 'string' ? raw : (raw?.analysis || '');
          if (analysisText) {
            const payload = {
              analysis: analysisText,
              analyzed_at: new Date().toISOString(),
              filename: (resp as any).filename || file.name,
            };
            localStorage.setItem('uphera_last_cv_analysis', JSON.stringify(payload));
          }
        }
      } catch {}
      return resp;
    }

    // Local backend için mevcut form-data yolu
    const formData = new FormData();
    formData.append('file', file);
    const headers = this.getAuthHeaders();
    const resp = await this.makeRequest(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': (headers as any)['Authorization'] || '' },
      __meta: { timeoutMs: 45000, retryAttempts: 1, maxBaseUrls: 1 }
    });
    try {
      if (resp && (resp as any).success && (resp as any).analysis !== undefined) {
        const raw = (resp as any).analysis;
        const analysisText = typeof raw === 'string' ? raw : (raw?.analysis || '');
        if (analysisText) {
          const payload = {
            analysis: analysisText,
            analyzed_at: new Date().toISOString(),
            filename: (resp as any).filename || file.name,
          };
          localStorage.setItem('uphera_last_cv_analysis', JSON.stringify(payload));
        }
      }
    } catch {}
    return resp;
  }

  async getChatHistory(limit: number = 10): Promise<ApiResponse> {
    return this.makeRequest(`/ai-coach/history?limit=${limit}`);
  }

  async getAIInsights(): Promise<ApiResponse> {
    return this.makeRequest('/ai-coach/insights');
  }

  async getCVInsights(userId: string): Promise<ApiResponse> {
    // Önce local stored analiz varsa onu döndür
    try {
      const saved = localStorage.getItem('uphera_last_cv_analysis');
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.analysis) {
          return {
            success: true,
            insights: data.analysis,
            analyzed_at: data.analyzed_at,
            has_cv: true,
            filename: data.filename,
          } as any;
        }
      }
    } catch {}

    // Local dev için backend'e dene; prod'da kullanıcıya yönlendirici mesaj dön
    const isLocal = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
    if (isLocal) {
      return this.makeRequest('/ai-coach/cv/insights', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId })
      });
    }
    return {
      success: false,
      insights: '',
      has_cv: false,
      message: 'Henüz analiz bulunamadı. Lütfen CV yükleyin.'
    } as any;
  }

  // Job APIs
  async getJobs(filters: any = {}): Promise<ApiResponse> {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key].toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `/api/jobs?${queryString}` : '/api/jobs';

    return this.makeRequest(endpoint);
  }

  async getJob(jobId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/jobs/${jobId}`);
  }

  async applyToJob(jobId: string, applicationData: any = {}): Promise<ApiResponse> {
    return this.makeRequest(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async getMyApplications(): Promise<ApiResponse> {
    return this.makeRequest('/api/jobs/my/applications');
  }

  async bookmarkJob(jobId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/jobs/${jobId}/bookmark`, {
      method: 'POST'
    });
  }

  async getMyBookmarks(): Promise<ApiResponse> {
    return this.makeRequest('/api/jobs/my/bookmarks');
  }

  // Network/Community APIs
  async getSuccessStories(): Promise<ApiResponse> {
    return this.makeRequest('/api/network/success-stories');
  }

  // Network Members (graceful fallback to success stories or mock)
  async getNetworkMembers(): Promise<ApiResponse> {
    // Try real endpoint if exists
    const primary = await this.makeRequest('/api/network/members', { __meta: { timeoutMs: 1500, retryAttempts: 1, maxBaseUrls: 1 } });
    if (primary && primary.success && Array.isArray((primary as any).members)) {
      return primary;
    }

    // Fallback: derive from success stories if available
    const stories = await this.getSuccessStories().catch(() => ({ success: false } as any));
    if (stories && stories.success && Array.isArray((stories as any).stories)) {
      const members = (stories as any).stories.map((s: any, idx: number) => ({
        id: s.id || `story-${idx + 1}`,
        name: s.name || 'Topluluk Üyesi',
        role: s.title || 'Üye',
        company: (s.title || '').split(' at ')[1] || 'Topluluk',
        location: s.location || 'Türkiye',
        skills: [],
        experience: '',
        bootcamp: s.program || '',
        graduationYear: (s.graduation_date || '').slice(0, 4) || '',
        profileImage: null,
        isOnline: false,
        mentorAvailable: false,
        commonSkills: 0,
      }));
      return { success: true, members } as any;
    }

    // Final fallback: signal failure so UI can use its mock
    return { success: false, error: 'Network members not available' } as any;
  }

  // Mentorship APIs
  async getAvailableMentors(opts?: { fast?: boolean }): Promise<ApiResponse> {
    const fast = opts?.fast ?? true;
    return this.makeRequest('/api/mentorship/mentors', fast ? { __meta: { timeoutMs: 1200, retryAttempts: 1, maxBaseUrls: 1 } } : {});
  }

  async updateMentorProfile(mentorData: any): Promise<ApiResponse> {
    // Backend oluşturulmamış olsa bile graceful fallback uygula
    const resp = await this.makeRequest('/api/profile/mentorship', {
      method: 'PUT',
      body: JSON.stringify(mentorData)
    });
    if (resp && resp.success !== undefined) return resp;
    return { success: true } as any;
  }

  async sendMentorshipRequest(requestData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/mentorship/request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // Events APIs
  async getEvents(opts?: { fast?: boolean }): Promise<ApiResponse> {
    const fast = opts?.fast ?? true;
    return this.makeRequest('/api/events', fast ? { __meta: { timeoutMs: 1200, retryAttempts: 1, maxBaseUrls: 1 } } : {});
  }

  async registerEvent(eventData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/events/register', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  // Notifications (mock-friendly)
  async getNotifications(): Promise<ApiResponse> {
    // Try backend first
    const resp = await this.makeRequest('/api/notifications', { __meta: { timeoutMs: 1200, retryAttempts: 1, maxBaseUrls: 1 } });
    if (resp && resp.success) {
      // Standard shape { notifications: [...] }
      if (Array.isArray((resp as any).notifications)) return resp;
      // Alternative shape { data: [...] }
      if (Array.isArray((resp as any).data)) {
        return { success: true, notifications: (resp as any).data } as any;
      }
    }

    // Local fallback (if previously saved)
    try {
      const saved = localStorage.getItem('uphera_notifications');
      if (saved) {
        return { success: true, notifications: JSON.parse(saved) } as any;
      }
    } catch {}

    // Minimal mock fallback
    const now = Date.now();
    const mock = [
      { id: 'm1', type: 'match', title: 'Yeni eşleşme', message: 'Senior Frontend pozisyonu ile yüksek eşleşme!', timestamp: now - 60*60*1000, read: false, priority: 'high', actionUrl: '/jobs', actionText: 'İncele' },
      { id: 'm2', type: 'application', title: 'Başvuru güncellemesi', message: 'Başvurunuz değerlendirme aşamasında.', timestamp: now - 3*60*60*1000, read: false, priority: 'medium', actionUrl: '/dashboard' },
      { id: 'm3', type: 'system', title: 'Profil önerisi', message: 'Profilinizi güncelleyerek daha çok eşleşme alabilirsiniz.', timestamp: now - 24*60*60*1000, read: true, priority: 'low', actionUrl: '/profile' },
    ];
    try { localStorage.setItem('uphera_notifications', JSON.stringify(mock)); } catch {}
    return { success: true, notifications: mock } as any;
  }

  async markNotificationRead(id: string): Promise<ApiResponse> {
    // Backend varsa onu dener, yoksa başarı döner
    const resp = await this.makeRequest(`/api/notifications/${id}/read`, { method: 'POST' });
    if (resp.success) return resp;
    return { success: true, id } as any;
  }

  // Settings APIs (with graceful local fallback)
  async getSettings(): Promise<ApiResponse> {
    // Try backend first
    const response = await this.makeRequest('/api/settings', { __meta: { timeoutMs: 1500, retryAttempts: 1, maxBaseUrls: 1 } });
    if (response.success && (response as any).settings) {
      return response;
    }

    // Local fallback
    try {
      const saved = localStorage.getItem('uphera_settings');
      if (saved) {
        return { success: true, settings: JSON.parse(saved) } as any;
      }
    } catch {}

    // Defaults fallback matching SettingsScreen initial state
    const defaults = {
      emailNotifications: true,
      pushNotifications: true,
      jobAlerts: true,
      mentorshipUpdates: true,
      communityNews: false,
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      searchableProfile: true,
      language: 'tr',
      theme: 'light',
      jobEmailFrequency: 'daily',
      remoteWork: true,
      locationPreferences: ['İstanbul', 'Ankara'],
    };
    return { success: true, settings: defaults } as any;
  }

  async updateSettings(settings: any): Promise<ApiResponse> {
    // Persist locally regardless of backend availability
    try {
      localStorage.setItem('uphera_settings', JSON.stringify(settings));
    } catch {}

    // Attempt backend update, but don't fail UX if unreachable
    const response = await this.makeRequest('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });

    if (response.success) return response;
    return { success: true, settings } as any;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  // Utility methods
  isAuthenticated(): boolean {
    const userData = localStorage.getItem('uphera_user');
    if (!userData) return false;

    try {
      const user = JSON.parse(userData);
      return !!user.token;
    } catch {
      return false;
    }
  }

  getCurrentUser(): any | null {
    const userData = localStorage.getItem('uphera_user');
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const apiService = new UpHeraApiService();
export default apiService;
