import React from 'react';
import ModernCard from './ModernCard';

interface SuccessStory {
  id: string;
  name: string;
  photo?: string;
  company: string;
  position: string;
  bootcamp: string;
  graduationYear: number;
  startingSalary: string;
  currentSalary: string;
  story: string;
  technologies: string[];
  achievements: string[];
  linkedinUrl?: string;
  videoUrl?: string;
}

interface SuccessStoryCardProps {
  story: SuccessStory;
  featured?: boolean;
}

const SuccessStoryCard: React.FC<SuccessStoryCardProps> = ({ story, featured = false }) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <ModernCard 
      className={`${featured ? 'border-2' : ''}`} 
      hover
      padding={featured ? 'lg' : 'md'}
      style={featured ? { borderColor: 'var(--up-primary)' } : {}}
    >
      {featured && (
        <div 
          className="text-xs font-medium px-3 py-1 rounded-full mb-4 inline-block"
          style={{ 
            background: 'rgba(58, 78, 255, 0.1)', 
            color: 'var(--up-primary)' 
          }}
        >
          Bu Hafta Öne Çıkan Mezun
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ background: 'var(--up-gradient)' }}
        >
          {story.photo ? (
            <img 
              src={story.photo} 
              alt={story.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(story.name)
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--up-primary-dark)' }}>
            {story.name}
          </h3>
          <div className="text-sm mb-1" style={{ color: 'var(--up-dark-gray)' }}>
            <strong>{story.position}</strong> @ {story.company}
          </div>
          <div className="text-xs" style={{ color: 'var(--up-dark-gray)' }}>
            {story.bootcamp} mezunu • {story.graduationYear}
          </div>
        </div>

        {story.videoUrl && (
          <button 
            className="text-sm px-3 py-1 rounded border hover:bg-gray-50"
            onClick={() => window.open(story.videoUrl, '_blank')}
          >
            Video İzle
          </button>
        )}
      </div>

      <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--up-light-gray)' }}>
        <p className="text-sm italic" style={{ color: 'var(--up-dark-gray)' }}>
          "{story.story}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--up-dark-gray)' }}>
            Başlangıç Maaşı
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--up-primary)' }}>
            {story.startingSalary}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: 'var(--up-dark-gray)' }}>
            Mevcut Maaşı
          </div>
          <div className="text-sm font-semibold" style={{ color: 'var(--up-primary)' }}>
            {story.currentSalary}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs font-medium mb-2" style={{ color: 'var(--up-dark-gray)' }}>
          Kullandığı Teknolojiler
        </div>
        <div className="flex flex-wrap gap-1">
          {story.technologies.map((tech) => (
            <span key={tech} className="up-badge up-badge-primary">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {story.achievements.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium mb-2" style={{ color: 'var(--up-dark-gray)' }}>
            Başarıları
          </div>
          <ul className="text-sm space-y-1" style={{ color: 'var(--up-dark-gray)' }}>
            {story.achievements.map((achievement, index) => (
              <li key={index} className="flex items-start gap-2">
                <span style={{ color: 'var(--up-primary)' }}>•</span>
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        {story.linkedinUrl && (
          <button 
            className="up-button-secondary text-xs"
            onClick={() => window.open(story.linkedinUrl, '_blank')}
          >
            LinkedIn Profili
          </button>
        )}
        <button className="up-button-primary text-xs">
          Bağlantı Kur
        </button>
      </div>
    </ModernCard>
  );
};

export default SuccessStoryCard; 