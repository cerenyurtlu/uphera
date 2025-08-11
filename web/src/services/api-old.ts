import axios from 'axios'

const API_BASE = 'http://localhost:8000' // Direct backend connection

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Authorization header if token exists
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('uphera_user')
    if (raw) {
      const parsed = JSON.parse(raw)
      const token = parsed?.token
      if (token) {
        config.headers = config.headers || {}
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
  } catch {}
  return config
})

// Types
export interface Candidate {
  id: string
  name: string
  email: string
  github_url?: string
  location?: string
  salary_expectation?: number
  skills: string[]
  projects: Project[]
  created_at: string
  updated_at?: string
}

export interface Project {
  name: string
  description: string
  github_url?: string
  technologies: string[]
}

export interface Job {
  id: string
  company: string
  title: string
  description?: string
  location?: string
  salary_range?: string
  required_skills: string[]
  hr_email: string
  created_at: string
  updated_at?: string
}

export interface Match {
  id: string
  job_id: string
  candidate_id: string
  score: number
  status: string
  feedback?: string
  created_at: string
  updated_at?: string
  candidate: Candidate
  job: Job
}

export interface DashboardStats {
  total_candidates: number
  total_jobs: number
  total_matches: number
  successful_hires: number
  average_match_score: number
}

export interface MeResponse {
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    role: 'ALUMNI' | 'ADMIN'
  }
  profile: {
    bootcamp_name?: string
    graduation_year?: number | null
    experience_level?: string
    skills?: string[]
    phone?: string
    linkedin_url?: string
    github_url?: string
    portfolio_url?: string
  }
}

export interface DashboardSummary {
  profileStrength: number
  activeApplications: number
  interviews: number
  networkCount: number
}

// API functions
export const apiService = {
  // Candidates
  getCandidates: async (): Promise<Candidate[]> => {
    const response = await api.get('/candidates')
    return response.data
  },

  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await api.get(`/candidates/${id}`)
    return response.data
  },

  createCandidate: async (candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> => {
    const response = await api.post('/candidates', candidate)
    return response.data
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get('/jobs')
    return response.data
  },

  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`)
    return response.data
  },

  createJob: async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> => {
    const response = await api.post('/jobs', job)
    return response.data
  },

  // Matches
  getMatches: async (jobId: string): Promise<Match[]> => {
    const response = await api.post(`/match/${jobId}`)
    return response.data
  },

  sendPitch: async (jobId: string, candidateId: string, score: number): Promise<{ message: string; pitch: string }> => {
    const response = await api.post(`/email/${jobId}/${candidateId}`, { score })
    return response.data
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },

  // Auth/me
  getMe: async (): Promise<MeResponse> => {
    const response = await api.get('/me')
    return response.data
  },

  // Dashboard summary
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/dashboard/summary')
    return response.data
  },

  // Events
  getEvents: async () => {
    const response = await api.get('/api/events')
    return response.data
  },

  registerEvent: async (eventData: { event_id: string; user_name: string; user_email: string }) => {
    const response = await api.post('/api/events/register', eventData)
    return response.data
  },

  // Notifications
  getNotifications: async () => {
    const response = await api.get('/api/notifications')
    return response.data
  },

  markNotificationRead: async (notificationId: string) => {
    const response = await api.put(`/api/notifications/${notificationId}/read`)
    return response.data
  },

  // Network
  getNetworkMembers: async () => {
    const response = await api.get('/api/network/members')
    return response.data
  },

  // Mentorship
  getMentorshipRequests: async () => {
    const response = await api.get('/api/mentorship/requests')
    return response.data
  },

  getMentorshipMessages: async () => {
    const response = await api.get('/api/mentorship/messages')
    return response.data
  },

  sendMentorshipRequest: async (requestData: { mentor_id: string; message: string; mentee_name: string; mentee_email: string; mentee_program: string }) => {
    const response = await api.post('/api/mentorship/request', requestData)
    return response.data
  },

  sendMentorshipMessage: async (messageData: { mentor_id: string; message: string; sender_name: string; sender_email: string }) => {
    const response = await api.post('/api/mentorship/message', messageData)
    return response.data
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/api/settings')
    return response.data
  },

  updateSettings: async (settings: any) => {
    const response = await api.put('/api/settings', { settings })
    return response.data
  },

  // Mentor Profile
  getMentorProfile: async () => {
    const response = await api.get('/api/profile/mentorship')
    return response.data
  },

  updateMentorProfile: async (mentorData: any) => {
    const response = await api.put('/api/profile/mentorship', mentorData)
    return response.data
  },

  getAvailableMentors: async () => {
    const response = await api.get('/api/mentors')
    return response.data
  },

  // Messaging
  getConversation: async (mentorId: string) => {
    const response = await api.get(`/api/conversations/${mentorId}`)
    return response.data
  },

  sendMessage: async (messageData: any) => {
    const response = await api.post('/api/messages/send', messageData)
    return response.data
  },

  getAllConversations: async () => {
    const response = await api.get('/api/conversations')
    return response.data
  },

  markConversationRead: async (conversationId: string) => {
    const response = await api.put(`/api/conversations/${conversationId}/read`)
    return response.data
  },
}

export default apiService 