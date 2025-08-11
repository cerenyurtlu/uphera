import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UpHeraLogoProps {
  size?: number;
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'large';
}

const UpHeraLogo: React.FC<UpHeraLogoProps> = ({ 
  size = 48, 
  className = '', 
  clickable = false, 
  onClick,
  variant = 'default'
}) => {
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const logoPath = '/brand/uphera-logo.svg';

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {};

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    } else if (clickable) {
      const currentPath = location.pathname;
      if (currentPath.startsWith('/dashboard')) {
        navigate('/jobs');
      } else if (
        currentPath.startsWith('/jobs') ||
        currentPath.startsWith('/profile') || 
        currentPath.startsWith('/network') || 
        currentPath.startsWith('/interview-prep') ||
        currentPath.startsWith('/events') ||
        currentPath.startsWith('/freelance-projects')
      ) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'rounded-lg shadow-sm';
      case 'large':
        return 'rounded-xl shadow-lg';
      default:
        return 'rounded-lg';
    }
  };

  const containerClass = `inline-flex items-center justify-center uphera-logo ${getVariantStyles()} ${className} ${
    clickable ? 'cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200 ease-in-out' : ''
  }`.trim();

  if (!imageError) {
    return (
      <div 
        className={containerClass} 
        onClick={handleClick}
        title="Up Hera"
        style={{ backgroundColor: 'transparent', background: 'none' }}
      >
        <img
          src={logoPath}
          alt="Up Hera Logo"
          width={size}
          height={size}
          className="object-contain select-none"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ 
            maxWidth: size, 
            maxHeight: size,
            imageRendering: 'crisp-edges',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none'
          }}
          loading="eager"
          decoding="async"
        />
      </div>
    );
  }

  return (
    <div 
      className={containerClass} 
      onClick={handleClick}
      title="Up Hera"
      style={{ backgroundColor: 'transparent', background: 'none' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="select-none"
        style={{ backgroundColor: 'transparent' }}
      >
        <g transform="translate(10, 10)">
          <circle cx="30" cy="20" r="10" fill="var(--up-primary)" />
          <path d="M20 20 Q20 12, 30 12 Q40 12, 40 20 Q40 16, 36 16 Q33 14, 30 14 Q27 14, 24 16 Q20 16, 20 20" fill="var(--up-primary)" opacity="0.9" />
          <path d="M25 30 L25 50 Q25 55, 30 55 L30 55 Q35 55, 35 50 L35 30" fill="var(--up-primary)" />
          <path d="M20 35 Q15 40, 18 45" stroke="var(--up-primary)" strokeWidth="3" strokeLinecap="round" />
          <path d="M40 35 Q45 40, 42 45" stroke="var(--up-primary)" strokeWidth="3" strokeLinecap="round" />
          <g transform="translate(45, 25)">
            <path d="M3 15 L8 10 M8 10 L13 15 M8 10 L8 20" stroke="var(--up-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="6" cy="12" r="1.5" fill="var(--up-primary)" opacity="0.8" />
            <circle cx="10" cy="12" r="1.5" fill="var(--up-primary)" opacity="0.8" />
            <circle cx="8" cy="18" r="1.5" fill="var(--up-primary)" opacity="0.8" />
          </g>
          <g transform="translate(5, 40)">
            <rect x="0" y="0" width="4" height="4" rx="0.5" fill="var(--up-primary)" opacity="0.6" />
            <rect x="0" y="6" width="4" height="4" rx="0.5" fill="var(--up-primary)" opacity="0.4" />
            <rect x="6" y="3" width="4" height="4" rx="0.5" fill="var(--up-primary)" opacity="0.5" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default UpHeraLogo;


