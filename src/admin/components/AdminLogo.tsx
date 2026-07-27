import React from 'react';
import { useSiteSettings } from '../../theme/siteSettings';

type Props = {
  className?: string;
  alt?: string;
};

export const AdminLogoIcon: React.FC<Props> = ({ className = 'h-5 w-5', alt = 'Logo' }) => {
  const { getAssetUrl } = useSiteSettings();
  const src = getAssetUrl('logo');

  if (!src) {
    return <span className={`inline-block rounded-full bg-maroon-700 ${className}`} aria-label={alt} />;
  }

  return <img src={src} alt={alt} className={`inline-block rounded-full object-cover ${className}`} />;
};
