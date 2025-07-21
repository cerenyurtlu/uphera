import React from 'react';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false,
  style = {},
  onClick
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = `up-card ${paddingClasses[padding]} ${hover ? 'transition-all duration-200 hover:shadow-lg hover:-translate-y-1' : ''}`;

  return (
    <div className={`${baseClasses} ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

export default ModernCard; 