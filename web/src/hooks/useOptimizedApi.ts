/**
 * Optimized React hooks for API interactions with caching and error handling
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api-optimized';
import toast from 'react-hot-toast';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  showToast?: boolean;
  retries?: number;
  cacheTime?: number;
}

// Generic API hook
export function useOptimizedApi<T = any>(
  apiCall: () => Promise<any>,
  options: UseApiOptions = {}
) {
  const {
    immediate = true,
    showToast = true,
    retries = 3,
    cacheTime = 5 * 60 * 1000
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: immediate,
    error: null,
    success: false
  });

  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const response = await apiCall();

      if (response.success) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          success: true
        });

        if (showToast && response.message) {
          toast.success(response.message);
        }
      } else {
        const errorMessage = response.message || response.error || 'An error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false
        });

        if (showToast) {
          toast.error(errorMessage);
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false
      });

      if (showToast) {
        toast.error(errorMessage);
      }
    }
  }, [apiCall, showToast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch: execute
  };
}

// Specialized hooks for common operations

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: apiService.isAuthenticated(),
    user: apiService.getCurrentUser(),
    loading: false
  });

  const login = useCallback(async (email: string, password: string, userType: string = 'mezun') => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const response = await apiService.login(email, password, userType);

      if (response.success) {
        setAuthState({
          isAuthenticated: true,
          user: response.data,
          loading: false
        });
        toast.success(response.message || 'Login successful!');
        return { success: true, data: response.data };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error(response.message || 'Login failed');
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Login error occurred');
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      await apiService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false
      });
      toast.success('Logged out successfully');
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Logout error occurred');
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const response = await apiService.register(userData);

      if (response.success) {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.success(response.message || 'Registration successful!');
        return { success: true, data: response.data };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        toast.error(response.message || 'Registration failed');
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Registration error occurred');
      return { success: false, error: error.message };
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    register
  };
}

export function useProfile() {
  const {
    data: profile,
    loading,
    error,
    execute: fetchProfile,
    refetch
  } = useOptimizedApi(
    () => apiService.getProfile(),
    { immediate: true, showToast: false }
  );

  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const response = await apiService.updateProfile(profileData);

      if (response.success) {
        toast.success('Profile updated successfully!');
        refetch(); // Refresh profile data
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Profile update failed');
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      toast.error('Profile update error occurred');
      return { success: false, error: error.message };
    }
  }, [refetch]);

  return {
    profile: profile?.user,
    loading,
    error,
    updateProfile,
    refetchProfile: refetch
  };
}

export function useJobs(filters?: any) {
  const {
    data: jobs,
    loading,
    error,
    execute: fetchJobs,
    refetch
  } = useOptimizedApi(
    () => apiService.getJobs(filters),
    { immediate: true, showToast: false }
  );

  const applyToJob = useCallback(async (jobId: string, applicationData?: any) => {
    try {
      const response = await apiService.applyToJob(jobId, applicationData);

      if (response.success) {
        toast.success('Application submitted successfully!');
        refetch(); // Refresh jobs data
        return { success: true, data: response.data };
      } else {
        toast.error(response.message || 'Application failed');
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      toast.error('Application error occurred');
      return { success: false, error: error.message };
    }
  }, [refetch]);

  return {
    jobs: jobs?.jobs || [],
    loading,
    error,
    applyToJob,
    refetchJobs: refetch
  };
}

export function useJob(jobId: string) {
  const {
    data: jobData,
    loading,
    error,
    refetch
  } = useOptimizedApi(
    () => apiService.getJob(jobId),
    { immediate: !!jobId, showToast: false }
  );

  return {
    job: jobData?.job,
    loading,
    error,
    refetchJob: refetch
  };
}

// Health check hook
export function useHealthCheck() {
  const [health, setHealth] = useState({
    status: 'unknown',
    lastChecked: null as Date | null,
    checking: false
  });

  const checkHealth = useCallback(async () => {
    setHealth(prev => ({ ...prev, checking: true }));

    try {
      const response = await apiService.healthCheck();
      setHealth({
        status: response.success ? 'healthy' : 'unhealthy',
        lastChecked: new Date(),
        checking: false
      });
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        lastChecked: new Date(),
        checking: false
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...health,
    checkHealth
  };
}

// Connection status hook
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
