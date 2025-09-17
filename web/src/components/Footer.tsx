import React from 'react';
import BrandLogo from './BrandLogo';
import { useI18n } from '../i18n/I18nProvider';

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="py-12 border-t" style={{ borderColor: 'var(--up-light-gray)', background: 'white' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BrandLogo size={100} />
          </div>
          <div className="mb-4 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
            {t('footer.tagline')}
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs" style={{ color: 'var(--up-dark-gray)' }}>
            <span>© 2025 Up Hera</span>
            <span>•</span>
            <span>{t('footer.partnership')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
