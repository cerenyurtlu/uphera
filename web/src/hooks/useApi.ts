import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService, Candidate, Job, Match, DashboardSummary, MeResponse } from '../services/api'
import toast from 'react-hot-toast'

// Query keys
export const queryKeys = {
  candidates: ['candidates'] as const,
  candidate: (id: string) => ['candidate', id] as const,
  jobs: ['jobs'] as const,
  job: (id: string) => ['job', id] as const,
  matches: (jobId: string) => ['matches', jobId] as const,
  dashboard: ['dashboard'] as const,
  me: ['me'] as const,
  dashboardSummary: ['dashboard-summary'] as const,
}

// Candidate hooks
export const useCandidates = () => {
  return useQuery({
    queryKey: queryKeys.candidates,
    queryFn: apiService.getCandidates,
  })
}

export const useCandidate = (id: string) => {
  return useQuery({
    queryKey: queryKeys.candidate(id),
    queryFn: () => apiService.getCandidate(id),
    enabled: !!id,
  })
}

export const useCreateCandidate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates })
      toast.success('Candidate created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create candidate')
      console.error('Create candidate error:', error)
    },
  })
}

// Job hooks
export const useJobs = () => {
  return useQuery({
    queryKey: queryKeys.jobs,
    queryFn: apiService.getJobs,
  })
}

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => apiService.getJob(id),
    enabled: !!id,
  })
}

export const useCreateJob = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: apiService.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      toast.success('Job created successfully!')
    },
    onError: (error) => {
      toast.error('Failed to create job')
      console.error('Create job error:', error)
    },
  })
}

// Match hooks
export const useMatches = (jobId: string) => {
  return useQuery({
    queryKey: queryKeys.matches(jobId),
    queryFn: () => apiService.getMatches(jobId),
    enabled: !!jobId,
  })
}

export const useSendPitch = () => {
  return useMutation({
    mutationFn: ({ jobId, candidateId, score }: { jobId: string; candidateId: string; score: number }) =>
      apiService.sendPitch(jobId, candidateId, score),
    onSuccess: (data) => {
      toast.success('Pitch email sent successfully!')
      console.log('Pitch content:', data.pitch)
    },
    onError: (error) => {
      toast.error('Failed to send pitch email')
      console.error('Send pitch error:', error)
    },
  })
}

// Dashboard hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: apiService.getDashboardStats,
  })
} 

export const useMe = () => {
  let enabled = false
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('uphera_user') : null
    const parsed = raw ? JSON.parse(raw) : null
    enabled = Boolean(parsed?.token)
  } catch {}
  return useQuery<MeResponse>({
    queryKey: queryKeys.me,
    queryFn: apiService.getMe,
    enabled,
    retry: 1,
  })
}

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary>({
    queryKey: queryKeys.dashboardSummary,
    queryFn: apiService.getDashboardSummary,
  })
}