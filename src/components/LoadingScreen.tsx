import React, { useState, useEffect } from 'react';
import { SiteLogoIcon } from './SiteLogo';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onLoadingComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className={`fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full">
            <SiteLogoIcon className="h-16 w-16" alt="Logo" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-maroon-800 mb-2">DRESS</h1>
        <p className="text-lg text-maroon-600">Divya Ratna English Secondary School</p>
        <div className="mt-6">
          <div className="w-32 h-1 bg-maroon-200 rounded-full mx-auto">
            <div className="h-1 bg-maroon-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;