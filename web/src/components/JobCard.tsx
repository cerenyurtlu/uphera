import { Link } from 'react-router-dom'
import { MapPin, Building, DollarSign, Calendar } from 'lucide-react'

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

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="card hover:shadow-lg transition-shadow cursor-pointer">
      <Link to={`/jobs/${job.id}`}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.company}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-gray-600 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(job.created_at)}</span>
            </div>
          </div>
        </div>

        {job.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {job.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location || 'Remote'}</span>
          </div>
          {job.salary_range && (
            <div className="flex items-center text-gray-600">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>{job.salary_range}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {job.required_skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {skill}
            </span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              +{job.required_skills.length - 3} more
            </span>
          )}
        </div>
      </Link>
    </div>
  )
} 