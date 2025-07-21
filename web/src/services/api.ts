import axios from 'axios'

const API_BASE = '/api' // Vite proxy kullanıyoruz

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
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
}

export default apiService 