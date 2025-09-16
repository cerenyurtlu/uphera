import { useState } from 'react'
import { MapPin, Github, DollarSign, Star, Mail, ExternalLink } from 'lucide-react'

interface Project {
  name: string
  description: string
  github_url?: string
  technologies: string[]
}

interface Candidate {
  id: string
  name: string
  email: string
  github_url?: string
  location?: string
  salary_expectation?: number
  skills: string[]
  projects: Project[]
  score: number
}

interface Job {
  id: string
  company: string
  title: string
  description?: string
  location?: string
  salary_range?: string
  required_skills: string[]
  hr_email: string
  created_at: string
}

interface CandidateCardProps {
  candidate: Candidate
  job: Job
  onSendPitch: () => void
  isSelected?: boolean
}

export default function CandidateCard({ candidate, job, onSendPitch, isSelected }: CandidateCardProps) {
  const [showProjects, setShowProjects] = useState(false)

  const skillMatchCount = candidate.skills.filter(skill => 
    job.required_skills.includes(skill)
  ).length

  const skillMatchPercentage = Math.round((skillMatchCount / job.required_skills.length) * 100)

  return (
    <div className={`card ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {candidate.name}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{candidate.location || 'Remote'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-yellow-600">
            <Star className="h-4 w-4 mr-1 fill-current" />
            <span className="font-semibold">{candidate.score.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500">
            {skillMatchPercentage}% match
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>{candidate.email}</span>
            </div>
            {candidate.github_url && (
              <div className="flex items-center">
                <Github className="h-4 w-4 mr-2" />
                <a 
                  href={candidate.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 flex items-center"
                >
                  GitHub Profile
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Details</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {candidate.salary_expectation && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Expected: {candidate.salary_expectation.toLocaleString()}</span>
              </div>
            )}
            <div>
              <span className="font-medium">Skills:</span> {candidate.skills.slice(0, 3).join(', ')}
              {candidate.skills.length > 3 && ` +${candidate.skills.length - 3} more`}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Match */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Skills Match</h4>
        <div className="flex flex-wrap gap-2">
          {job.required_skills.map((skill) => (
            <span
              key={skill}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                candidate.skills.includes(skill)
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {skill}
              {candidate.skills.includes(skill) && (
                <span className="ml-1">✓</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Projects */}
      {candidate.projects.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowProjects(!showProjects)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {showProjects ? 'Hide' : 'Show'} Projects ({candidate.projects.length})
          </button>
          
          {showProjects && (
            <div className="mt-3 space-y-3">
              {candidate.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <h5 className="font-medium text-gray-900 mb-1">{project.name}</h5>
                  <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={onSendPitch}
          className="btn-primary"
        >
          Send Pitch Email
        </button>
      </div>
    </div>
  )
} 