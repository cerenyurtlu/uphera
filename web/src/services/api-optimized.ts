/**
 * Optimized API service with enhanced error handling, caching, and retry logic
 */

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class OptimizedApiService {
  private config: ApiConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private abortControllers: Map<string, AbortController> = new Map();

  constructor() {
    this.config = {
      baseURL: this.getApiBaseUrl(),
      timeout: 30000,
      retries: 3,
      retryDelay: 1000
    };
  }

  private getApiBaseUrl(): string {
    // Try multiple backend URLs in order of preference
    const urls = [
      'http://127.0.0.1:8000',
      'http://localhost:8000'
    ];
    
    // Return first URL for now, can be enhanced with health checks
    return urls[0];
  }

  private getAuthToken(): string | null {
    try {
      const userData = localStorage.getItem('uphera_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.access_token || user.token;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return null;
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body || '';
    return `${method}:${url}:${typeof body === 'string' ? body : JSON.stringify(body)}`;
  }

  private setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });
  }

  private getCache(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {},
    useCache: boolean = false,
    cacheTTL: number = 5 * 60 * 1000
  ): Promise<ApiResponse<T>> {
    const fullUrl = `${this.config.baseURL}${url}`;
    const cacheKey = this.getCacheKey(fullUrl, options);

    // Check cache for GET requests
    if (useCache && options.method === 'GET') {
      const cached = this.getCache(cacheKey);
      if (cached) {
        console.log(`📂 Cache hit: ${url}`);
        return cached;
      }
    }

    // Create abort controller for this request
    const requestId = `${Date.now()}-${Math.random()}`;
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);

    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        console.log(`🔄 API Request (attempt ${attempt + 1}): ${options.method || 'GET'} ${url}`);

        const response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...this.getAuthHeaders(),
            ...options.headers,
          },
          signal: abortController.signal,
          timeout: this.config.timeout,
        });

        // Handle different response types
        let data: any;
        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        // Remove abort controller
        this.abortControllers.delete(requestId);

        if (response.ok) {
          const result: ApiResponse<T> = {
            success: true,
            data: data,
            message: data.message
          };

          // Cache successful GET requests
          if (useCache && options.method === 'GET') {
            this.setCache(cacheKey, result, cacheTTL);
          }

          console.log(`✅ API Success: ${options.method || 'GET'} ${url}`);
          return result;
        } else {
          // Handle HTTP errors
          const errorResult: ApiResponse<T> = {
            success: false,
            error: data.error || `HTTP ${response.status}`,
            message: data.message || data.detail || response.statusText,
            details: data.details
          };

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            console.error(`❌ Client Error: ${response.status} ${url}`, data);
            return errorResult;
          }

          console.warn(`⚠️ Server Error (attempt ${attempt + 1}): ${response.status} ${url}`, data);
          lastError = new Error(`HTTP ${response.status}: ${errorResult.message}`);
        }

      } catch (error: any) {
        lastError = error;
        console.error(`❌ Network Error (attempt ${attempt + 1}): ${url}`, error);

        // Don't retry on abort
        if (error.name === 'AbortError') {
          break;
        }
      }

      // Wait before retry (except on last attempt)
      if (attempt < this.config.retries) {
        const delay = this.config.retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }

    // Remove abort controller
    this.abortControllers.delete(requestId);

    // All attempts failed
    return {
      success: false,
      error: 'Network Error',
      message: lastError?.message || 'Unable to connect to server',
    };
  }

  // Cancel all pending requests
  public cancelAllRequests(): void {
    this.abortControllers.forEach(controller => controller.abort());
    this.abortControllers.clear();
  }

  // Public API methods
  async get<T>(url: string, useCache: boolean = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'GET' }, useCache);
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { method: 'DELETE' });
  }

  // Authentication methods
  async login(email: string, password: string, userType: string = 'mezun'): Promise<ApiResponse> {
    const response = await this.post('/api/auth/login', {
      email,
      password,
      user_type: userType
    });

    if (response.success && response.data) {
      // Store user data and tokens
      localStorage.setItem('uphera_user', JSON.stringify(response.data));
      this.clearCache(); // Clear cache on login
      console.log('✅ Login successful, user data stored');
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.post('/api/auth/logout');
    
    // Clear local storage and cache regardless of response
    localStorage.removeItem('uphera_user');
    localStorage.removeItem('uphera_settings');
    this.clearCache();
    this.cancelAllRequests();
    
    console.log('👋 Logged out, local data cleared');
    return response;
  }

  async register(userData: any): Promise<ApiResponse> {
    return this.post('/api/auth/graduate/register', userData);
  }

  async getProfile(): Promise<ApiResponse> {
    return this.get('/api/auth/profile', false); // Don't cache profile
  }

  async updateProfile(profileData: any): Promise<ApiResponse> {
    const response = await this.put('/api/auth/profile', profileData);
    
    if (response.success) {
      // Update local user data
      try {
        const userData = localStorage.getItem('uphera_user');
        if (userData) {
          const user = JSON.parse(userData);
          const updatedUser = { ...user, ...response.data };
          localStorage.setItem('uphera_user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error updating local user data:', error);
      }
      
      this.clearCache(); // Clear cache after profile update
    }
    
    return response;
  }

  // Job methods
  async getJobs(filters?: any): Promise<ApiResponse> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return this.get(`/api/jobs${queryParams}`, true);
  }

  async getJob(jobId: string): Promise<ApiResponse> {
    return this.get(`/api/jobs/${jobId}`, true);
  }

  async applyToJob(jobId: string, applicationData?: any): Promise<ApiResponse> {
    return this.post(`/api/jobs/${jobId}/apply`, applicationData);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.get('/health', false);
  }

  // Utility methods
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  getCurrentUser(): any | null {
    try {
      const userData = localStorage.getItem('uphera_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Auto-refresh token (can be enhanced)
  async refreshToken(): Promise<boolean> {
    try {
      const userData = this.getCurrentUser();
      if (!userData?.refresh_token) return false;

      const response = await this.post('/api/auth/refresh', {
        refresh_token: userData.refresh_token
      });

      if (response.success) {
        const updatedUser = { ...userData, ...response.data };
        localStorage.setItem('uphera_user', JSON.stringify(updatedUser));
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }
}

// Export singleton instance
export const apiService = new OptimizedApiService();
export default apiService;
