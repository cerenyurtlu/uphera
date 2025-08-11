import React, { useState } from 'react';
import ModernCard from './ModernCard';
import ModernButton from './ModernButton';
import { FiCpu, FiTool, FiSmartphone, FiBarChart2 } from 'react-icons/fi';

interface UpSchoolProfile {
  id: string;
  name: string;
  email: string;
  bootcamp: 'Frontend' | 'Backend' | 'FullStack' | 'Data Science' | 'Mobile';
  cohort: string;
  graduationDate: string;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
  }>;
  github: string;
  linkedin?: string;
  portfolio?: string;
  location: string;
  salaryExpectation: number;
  status: 'mezun' | 'aktif_ogrenci' | 'son_sinif';
  availability: 'hemen' | '2_hafta' | '1_ay' | 'esnek';
}

interface UpSchoolProfileProps {
  profile?: UpSchoolProfile;
  isEditing?: boolean;
  onSave?: (profile: UpSchoolProfile) => void;
}

const UpSchoolProfile: React.FC<UpSchoolProfileProps> = ({
  profile: initialProfile,
  isEditing = false,
  onSave
}) => {
  const [profile, setProfile] = useState<UpSchoolProfile>(
    initialProfile || {
      id: '',
      name: '',
      email: '',
      bootcamp: 'Frontend',
      cohort: '',
      graduationDate: '',
      skills: [],
      projects: [],
      github: '',
      linkedin: '',
      portfolio: '',
      location: '',
      salaryExpectation: 25000,
      status: 'mezun',
      availability: 'hemen'
    }
  );

  const [isEditMode, setIsEditMode] = useState(isEditing);
  const [newSkill, setNewSkill] = useState('');

  const bootcampColors = {
    'Frontend': 'bg-blue-100 text-blue-800',
    'Backend': 'bg-green-100 text-green-800',
    'FullStack': 'bg-purple-100 text-purple-800',
    'Data Science': 'bg-orange-100 text-orange-800',
    'Mobile': 'bg-pink-100 text-pink-800'
  };

  const bootcampIcons = {
    'Frontend': <FiCpu className="text-blue-600" />,
    'Backend': <FiTool className="text-green-600" />,
    'FullStack': <FiBarChart2 className="text-purple-600" />,
    'Data Science': <FiBarChart2 className="text-orange-600" />,
    'Mobile': <FiSmartphone className="text-pink-600" />
  };

  const handleSave = () => {
    if (onSave) {
      onSave(profile);
    }
    setIsEditMode(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: '',
          description: '',
          technologies: [],
          githubUrl: '',
          liveUrl: ''
        }
      ]
    }));
  };

  const updateProject = (index: number, updatedProject: any) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, ...updatedProject } : project
      )
    }));
  };

  const removeProject = (index: number) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  return (
    <ModernCard className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditMode ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:rounded"
                    placeholder="Adın Soyadın"
                  />
                ) : (
                  profile.name || 'UpSchool Mezunu'
                )}
              </h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${bootcampColors[profile.bootcamp]}`}>
                  {bootcampIcons[profile.bootcamp]} {profile.bootcamp}
                </span>
                <span className="text-sm text-gray-600">
                  🎓 {profile.cohort} Kohortu
                </span>
              </div>
            </div>
          </div>
          <ModernButton
            variant={isEditMode ? 'success' : 'secondary'}
            onClick={isEditMode ? handleSave : () => setIsEditMode(true)}
          >
            {isEditMode ? '💾 Kaydet' : '✏️ Düzenle'}
          </ModernButton>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📧 E-posta
            </label>
            {isEditMode ? (
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <p className="text-gray-900">{profile.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📍 Lokasyon
            </label>
            {isEditMode ? (
              <select
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Şehir Seç</option>
                <option value="İstanbul">İstanbul</option>
                <option value="Ankara">Ankara</option>
                <option value="İzmir">İzmir</option>
                <option value="Bursa">Bursa</option>
                <option value="Antalya">Antalya</option>
                <option value="Uzaktan">Uzaktan Çalışma</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💰 Maaş Beklentisi
            </label>
            {isEditMode ? (
              <input
                type="number"
                value={profile.salaryExpectation}
                onChange={(e) => setProfile(prev => ({ ...prev, salaryExpectation: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="0"
              />
            ) : (
              <p className="text-gray-900">{profile.salaryExpectation.toLocaleString('tr-TR')} TL</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🕐 Müsaitlik
            </label>
            {isEditMode ? (
              <select
                value={profile.availability}
                onChange={(e) => setProfile(prev => ({ ...prev, availability: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="hemen">Hemen başlayabilirim</option>
                <option value="2_hafta">2 hafta içinde</option>
                <option value="1_ay">1 ay içinde</option>
                <option value="esnek">Esnek</option>
              </select>
            ) : (
              <p className="text-gray-900">
                {profile.availability === 'hemen' && 'Hemen başlayabilirim'}
                {profile.availability === '2_hafta' && '2 hafta içinde'}
                {profile.availability === '1_ay' && '1 ay içinde'}
                {profile.availability === 'esnek' && 'Esnek'}
              </p>
            )}
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            🛠️ Yetenekler
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
              >
                <span>{skill}</span>
                {isEditMode && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditMode && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Yeni yetenek ekle"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <ModernButton size="sm" onClick={addSkill}>
                Ekle
              </ModernButton>
            </div>
          )}
        </div>

        {/* Projects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              🏗️ Projeler
            </label>
            {isEditMode && (
              <ModernButton size="sm" onClick={addProject}>
                + Proje Ekle
              </ModernButton>
            )}
          </div>
          <div className="space-y-4">
            {profile.projects.map((project, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, { name: e.target.value })}
                        placeholder="Proje adı"
                        className="font-medium bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:rounded"
                      />
                    ) : (
                      project.name
                    )}
                  </h4>
                  {isEditMode && (
                    <button
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {isEditMode ? (
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(index, { description: e.target.value })}
                      placeholder="Proje açıklaması"
                      className="w-full text-sm bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:rounded resize-none"
                      rows={2}
                    />
                  ) : (
                    project.description
                  )}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
                {(project.githubUrl || project.liveUrl) && (
                  <div className="flex space-x-4 text-sm">
                    {project.githubUrl && (
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                        🔗 GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                        🌐 Canlı Demo
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🐱 GitHub
            </label>
            {isEditMode ? (
              <input
                type="url"
                value={profile.github}
                onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                placeholder="github.com/kullaniciadi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                {profile.github}
              </a>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💼 LinkedIn
            </label>
            {isEditMode ? (
              <input
                type="url"
                value={profile.linkedin}
                onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="linkedin.com/in/kullaniciadi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              profile.linkedin ? (
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                  {profile.linkedin}
                </a>
              ) : (
                <span className="text-gray-400">Belirtilmemiş</span>
              )
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🌐 Portfolio
            </label>
            {isEditMode ? (
              <input
                type="url"
                value={profile.portfolio}
                onChange={(e) => setProfile(prev => ({ ...prev, portfolio: e.target.value }))}
                placeholder="portfolio-site.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              profile.portfolio ? (
                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                  {profile.portfolio}
                </a>
              ) : (
                <span className="text-gray-400">Belirtilmemiş</span>
              )
            )}
          </div>
        </div>

        {/* UpSchool Badge */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
              🎓
            </div>
            <div>
              <h3 className="font-medium text-gray-900">UpSchool Mezunu</h3>
              <p className="text-sm text-gray-600">
                {profile.bootcamp} Bootcamp • {profile.cohort} Kohortu • Mezuniyet: {profile.graduationDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModernCard>
  );
};

export default UpSchoolProfile; 