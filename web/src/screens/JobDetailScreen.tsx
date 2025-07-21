import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Building, DollarSign, Mail, Users, Star } from 'lucide-react'
import CandidateCard from '../components/CandidateCard'

// Mock data
const mockJob = {
  id: '1',
  company: 'TechCorp',
  title: 'Frontend Developer',
  description: 'We are looking for a talented Frontend Developer to join our team. You will be responsible for building user-friendly web applications using modern technologies like React, TypeScript, and Next.js. The ideal candidate should have experience with responsive design, state management, and API integration.',
  location: 'İstanbul',
  salary_range: '25000-45000',
  required_skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Git'],
  hr_email: 'hr@techcorp.com',
  created_at: '2024-01-15T10:00:00Z',
}

const mockCandidates = [
  {
    id: '1',
    name: 'Zeynep Kaya',
    email: 'zeynep.kaya@example.com',
    github_url: 'https://github.com/zeynepkaya',
    location: 'İstanbul',
    salary_expectation: 35000,
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'A full-stack e-commerce platform built with React and Node.js',
        github_url: 'https://github.com/zeynepkaya/ecommerce',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ],
    score: 0.92
  },
  {
    id: '2',
    name: 'Ayşe Demir',
    email: 'ayse.demir@example.com',
    github_url: 'https://github.com/aysedemir',
    location: 'İstanbul',
    salary_expectation: 40000,
    skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
    projects: [
      {
        name: 'Task Management App',
        description: 'A collaborative task management application',
        github_url: 'https://github.com/aysedemir/taskapp',
        technologies: ['Vue.js', 'Firebase', 'Vuex']
      }
    ],
    score: 0.87
  },
  {
    id: '3',
    name: 'Fatma Özkan',
    email: 'fatma.ozkan@example.com',
    github_url: 'https://github.com/fatmaozkan',
    location: 'Ankara',
    salary_expectation: 30000,
    skills: ['React', 'JavaScript', 'CSS', 'Bootstrap', 'jQuery'],
    projects: [
      {
        name: 'Portfolio Website',
        description: 'Personal portfolio website with modern design',
        github_url: 'https://github.com/fatmaozkan/portfolio',
        technologies: ['HTML', 'CSS', 'JavaScript']
      }
    ],
    score: 0.78
  }
]

export default function JobDetailScreen() {
  const { jobId } = useParams<{ jobId: string }>()
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)

  const handleSendPitch = (candidateId: string) => {
    setSelectedCandidate(candidateId)
    // In real app, this would call the API
    console.log(`Sending pitch for candidate ${candidateId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/jobs" className="text-primary-600 hover:text-primary-700">
                ← Back to Jobs
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{mockJob.title}</h1>
                <p className="text-gray-600 mt-1">{mockJob.company}</p>
              </div>
            </div>
            <Link to="/dashboard" className="btn-primary">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Building className="h-5 w-5 mr-2" />
                  <span>{mockJob.company}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{mockJob.location}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span>{mockJob.salary_range}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>{mockJob.hr_email}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {mockJob.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Candidates */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Top Matches</h2>
                  <p className="text-gray-600 mt-1">AI-powered candidate recommendations</p>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{mockCandidates.length} candidates</span>
                </div>
              </div>

              <div className="space-y-6">
                {mockCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    job={mockJob}
                    onSendPitch={() => handleSendPitch(candidate.id)}
                    isSelected={selectedCandidate === candidate.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 