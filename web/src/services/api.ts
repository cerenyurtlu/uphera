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
  private baseUrls = [
    'http://127.0.0.1:8000',
    'http://localhost:8000'
  ];
  private currentUrlIndex = 0;
  private retryAttempts = 3;

  private get baseUrl(): string {
    return this.baseUrls[this.currentUrlIndex];
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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    let lastError: Error = new Error('No attempts made');

    // Try all available URLs
    for (let urlIndex = 0; urlIndex < this.baseUrls.length; urlIndex++) {
      this.currentUrlIndex = urlIndex;
      const url = `${this.baseUrl}${endpoint}`;

      // Try multiple times for the current URL
      for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
        try {
          console.log(`🔄 API Request (URL ${urlIndex + 1}, Attempt ${attempt + 1}): ${options.method || 'GET'} ${endpoint}`);

          const response = await fetch(url, {
            ...options,
            headers: {
              ...this.getAuthHeaders(),
              ...options.headers,
            },
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ API Success: ${endpoint}`);
            return data;
          } else {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.warn(`⚠️ API Error ${response.status}: ${endpoint}`, errorData);
            
            if (response.status >= 400 && response.status < 500) {
              // Client error, don't retry
              return {
                success: false,
                error: errorData.message || errorData.detail || 'Client error',
                ...errorData
              };
            }
            
            throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
          }
        } catch (error: any) {
          lastError = error;
          console.error(`❌ API Error (URL ${urlIndex + 1}, Attempt ${attempt + 1}):`, error);
          
          // Wait before retry (except last attempt)
          if (attempt < this.retryAttempts - 1) {
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
    return this.makeRequest('/ai-coach/chat', {
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
      const url = `${this.baseUrl}/ai-coach/chat/stream`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          message,
          context,
          use_streaming: true
        })
      });

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

  async getChatHistory(limit: number = 10): Promise<ApiResponse> {
    return this.makeRequest(`/ai-coach/history?limit=${limit}`);
  }

  async getAIInsights(): Promise<ApiResponse> {
    return this.makeRequest('/ai-coach/insights');
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

  // Mentorship APIs
  async getAvailableMentors(): Promise<ApiResponse> {
    return this.makeRequest('/api/mentorship/mentors');
  }

  async sendMentorshipRequest(requestData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/mentorship/request', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
  }

  // Events APIs
  async getEvents(): Promise<ApiResponse> {
    return this.makeRequest('/api/events');
  }

  async registerEvent(eventData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/events/register', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  }

  // Notifications (mock-friendly)
  async getNotifications(): Promise<ApiResponse> {
    // Backend'de /api/notifications varsa kullanır; yoksa graceful error döner
    return this.makeRequest('/api/notifications');
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
