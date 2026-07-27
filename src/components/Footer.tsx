import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Linkedin, Music2 } from 'lucide-react';
import { SiteLogoIcon } from './SiteLogo';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

const Footer: React.FC = () => {
  const { getSocialUrl, getPrimarySocialUrl } = useSiteSettings();

  const renderSocial = (key: string, label: string, icon: React.ReactNode) => {
    const url = getSocialUrl(key);
    if (!url) {
      return (
        <span className="text-gray-400 opacity-60 cursor-not-allowed" aria-label={label} title={label}>
          {icon}
        </span>
      );
    }
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="text-gray-600 hover:text-red-600 transition-colors"
        aria-label={label}
        title={label}
      >
        {icon}
      </a>
    );
  };

  const linkToMap: Record<string, string> = {
    'About Us': '/about',
    'Mission': '/mission',
    'Accreditation': '/accreditation',
    'Strategic Framework': '/strategic-framework',
    'Governance': '/governance',
    'Faculty': '/faculty',
    'Facilities': '/facilities',
    'School Profile': '/school-profile',

    'Services': '/services',
    'Food and Nutrition': '/services/nutrition',
    'Transportation': '/services/transportation',
    'Health Services': '/services/health',
    'Air Quality': '/services/air-quality',
    'Child Protection': '/services/protection',
    'Safety and Security': '/services/security',

    'Calendar': '/calendar',
    'News & Media': '/news-media',
    'Work at DRESS': '/work-at-dress',
    'Contact Us': '/contact',

    'Parent Association': '/community/parents',
    'Alumni': '/community/alumni',
    'Community Voices': '/community/voices',
  };

  const footerSections = [
    {
      title: 'DRESS',
      titleColor: 'text-maroon-700',
      links: [
        'About Us',
        'Mission',
        'Accreditation',
        'Strategic Framework',
        'Governance',
        'Faculty',
        'Facilities',
        'School Profile'
      ]
    },
    {
      title: 'Resources',
      titleColor: 'text-maroon-700',
      links: [
        'Services',
        'Food and Nutrition',
        'Transportation',
        'Health Services',
        'Air Quality',
        'Child Protection',
        'Safety and Security'
      ]
    },
    {
      title: 'Administration',
      titleColor: 'text-maroon-700',
      links: [
        'Calendar',
        'News & Media',
        'Work at DRESS',
        'Contact Us',
        'Parent Association',
        'Alumni',
        'Community Voices'
      ]
    }
  ];

  return (
    <footer className="bg-gray-100 text-gray-800 border-t-4 border-maroon-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <Reveal key={index} as="div" variant="up" delayMs={index * 70}>
              <h4 className={`text-lg font-semibold mb-6 ${section.titleColor}`}>
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={linkToMap[link] || '/'}
                      className="text-gray-700 hover:text-maroon-700 transition-colors text-sm leading-relaxed"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}

          {/* Logo and Contact Info */}
          <Reveal as="div" variant="up" delayMs={240} className="lg:col-span-1">
            <div className="flex items-center mb-6">
              {(() => {
                const url = getPrimarySocialUrl();
                const logo = (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mr-4 overflow-hidden" style={{ backgroundColor: 'var(--color-primary-800)' }}>
                    <SiteLogoIcon className="h-20 w-20" alt="Logo" />
                  </div>
                );
                if (!url) return logo;
                return (
                  <a href={url} target="_blank" rel="noreferrer" className="hover:opacity-80 transition-opacity">
                    {logo}
                  </a>
                );
              })()}
              <div>
                <div className="text-2xl font-bold text-gray-900">Divya Ratna</div>
                <div className="text-sm text-gray-600 -mt-1">English Secondary School</div>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">DRESS</h5>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-maroon-700" />
                    <div>
                      <div>P.O. Box 10234</div>
                      <div>Kankai-4, Surunga , Jhapa</div>
                      <div>Nepal</div>
                    </div>
                  </div>
                  <div className="flex items-center mt-3">
                    <Phone className="h-4 w-4 mr-2 text-maroon-700" />
                    <span>Tel: +977 9815916524</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <span className="text-sm text-gray-600">Follow us</span>
              <div className="flex items-center space-x-6">
                {renderSocial('facebook', 'Facebook', <Facebook className="h-5 w-5" />)}
                {renderSocial('twitter', 'X / Twitter', <Twitter className="h-5 w-5" />)}
                {renderSocial('instagram', 'Instagram', <Instagram className="h-5 w-5" />)}
                {renderSocial('youtube', 'YouTube', <Youtube className="h-5 w-5" />)}
                {renderSocial('linkedin', 'LinkedIn', <Linkedin className="h-5 w-5" />)}
                {renderSocial('tiktok', 'TikTok', <Music2 className="h-5 w-5" />)}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm">
              Copyright © 2025 Divya Ratna English Secondary School • All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;