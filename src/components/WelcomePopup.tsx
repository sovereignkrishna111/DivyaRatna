import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface WelcomePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-3 sm:p-4 pt-20 sm:pt-24"
      onClick={onClose}
    >
      <div
        className="w-full relative"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome message"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1134px',
          minHeight: 'auto',
          padding: 'clamp(16px, 5vw, 32px)',
          backgroundColor: 'rgba(255, 251, 239, 1)',
          border: 'clamp(8px, 2vw, 14px) outset var(--color-primary-600)',
          boxShadow: '1px 1px 3px 0px rgba(2, 2, 2, 0.97) inset',
          borderRadius: '0px',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <button 
          onClick={onClose}
          className="text-white hover:opacity-80 transition-opacity"
          style={{
            position: 'absolute',
            top: 'clamp(-16px, -3vw, -20px)',
            right: 'clamp(-16px, -3vw, -20px)',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '0px',
            padding: '0px',
            zIndex: 99999
          }}
          aria-label="Close welcome popup"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div style={{ paddingRight: '0px' }}>
          <p style={{
            color: '#2b2b2b',
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(14px, 3vw, 16px)',
            fontWeight: 400,
            marginTop: '0px',
            marginBottom: 'clamp(8px, 2vw, 12px)',
            lineHeight: '1.65',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            letterSpacing: '0px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}>
            Please visit the school through our{' '}
            <a 
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ 
                color: 'var(--color-primary-600)',
                textDecoration: 'underline',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              className="hover:opacity-80 transition-opacity"
            >
              DRESS Virtual Tour
            </a>{' '}
            video. We are proud to share an introduction to our programs as well as insight into our family experiences through the voices of some of our DRESS parents. This tour also enables our current and prospective families to see our campus and our facilities.
          </p>
          
          <p style={{
            color: '#2b2b2b',
            fontFamily: "'Poppins', sans-serif",
            fontSize: 'clamp(14px, 3vw, 16px)',
            fontWeight: 400,
            marginTop: 'clamp(8px, 2vw, 12px)',
            marginBottom: '0px',
            lineHeight: '1.65',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            letterSpacing: '0px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
          }}>
            The Admissions Office staff is continuing to support families throughout the admissions process. Please contact them at{' '}
            <a 
              href="mailto:dress257819@gmail.com"
              style={{ 
                color: 'var(--color-primary-600)',
                textDecoration: 'underline',
                fontWeight: 600
              }}
              className="hover:opacity-80 transition-opacity"
            >
              dress257819@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePopup;