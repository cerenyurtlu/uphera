import React from 'react';

type BrandLogoProps = {
  size?: number;
  ariaLabel?: string;
  className?: string;
};

const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 28,
  ariaLabel = 'UpHera',
  className = ''
}) => {
  return (
    <img
      src="/brand/uphera-logo.svg"
      alt={ariaLabel}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`.trim()}
      loading="eager"
      decoding="async"
    />
  );
};

export default BrandLogo;


