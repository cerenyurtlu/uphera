import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Github, DollarSign, Mail, Edit, Save, X, Plus, Trash2 } from 'lucide-react'

// Mock candidate data
const mockCandidate = {
  id: '1',
  name: 'Zeynep Kaya',
  email: 'zeynep.kaya@example.com',
  github_url: 'https://github.com/zeynepkaya',
  location: 'İstanbul',
  salary_expectation: 35000,
  skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js', 'Git'],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'A full-stack e-commerce platform built with React and Node.js. Features include user authentication, product catalog, shopping cart, and payment integration.',
      github_url: 'https://github.com/zeynepkaya/ecommerce',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      name: 'Task Management App',
      description: 'A collaborative task management application with real-time updates and team collaboration features.',
      github_url: 'https://github.com/zeynepkaya/taskapp',
      technologies: ['React', 'Firebase', 'Material-UI']
    },
    {
      name: 'Portfolio Website',
      description: 'Personal portfolio website with modern design and responsive layout.',
      github_url: 'https://github.com/zeynepkaya/portfolio',
      technologies: ['HTML', 'CSS', 'JavaScript', 'GSAP']
    }
  ]
}

export default function CandidateProfileScreen() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(mockCandidate)
  const [newSkill, setNewSkill] = useState('')
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    github_url: '',
    technologies: []
  })

  const handleSave = () => {
    // In real app, this would call the API
    console.log('Saving profile:', formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(mockCandidate)
    setIsEditing(false)
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const addProject = () => {
    if (newProject.name.trim() && newProject.description.trim()) {
      setFormData({
        ...formData,
        projects: [...formData.projects, { ...newProject }]
      })
      setNewProject({ name: '', description: '', github_url: '', technologies: [] })
    }
  }

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back to Dashboard
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your candidate profile</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button onClick={handleCancel} className="btn-secondary">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="btn-primary">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center text-gray-900">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{formData.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{formData.location}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.github_url}
                      onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                      className="input-field"
                      placeholder="https://github.com/username"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Github className="h-4 w-4 mr-2" />
                      <a 
                        href={formData.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.salary_expectation}
                      onChange={(e) => setFormData({ ...formData, salary_expectation: parseInt(e.target.value) || 0 })}
                      className="input-field"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>{formData.salary_expectation.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="input-field flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button onClick={addSkill} className="btn-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Projects</h2>
              
              <div className="space-y-4 mb-4">
                {formData.projects.map((project, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      {isEditing && (
                        <button
                          onClick={() => removeProject(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{project.description}</p>
                    {project.github_url && (
                      <a 
                        href={project.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        View on GitHub
                      </a>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
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

              {isEditing && (
                <div className="space-y-3 p-4 border border-dashed border-gray-300 rounded-lg">
                  <h3 className="font-medium text-gray-900">Add New Project</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                      placeholder="Project name"
                      className="input-field"
                    />
                    <input
                      type="url"
                      value={newProject.github_url}
                      onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                      placeholder="GitHub URL (optional)"
                      className="input-field"
                    />
                  </div>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Project description"
                    rows={3}
                    className="input-field"
                  />
                  <div className="flex justify-end">
                    <button onClick={addProject} className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 