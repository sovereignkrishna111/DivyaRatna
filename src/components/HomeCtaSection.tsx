import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

const HomeCtaSection: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();

  const bg = getAssetUrl(
    'home_cta_bg',
    'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&dpr=1'
  );

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
    >
      <div
        className="absolute inset-0 w-full h-full bg-fixed bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <Reveal as="div" variant="up">
                <div className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-white/90 bg-white/10 border border-white/15 rounded-full px-3 py-1">
                  <Sparkles className="h-4 w-4" />
                   BOOK YOUR SEAT
                </div>
              </Reveal>
              <Reveal as="h3" variant="up" delayMs={90} className="mt-4 text-2xl sm:text-3xl md:text-4xl font-light tracking-wide text-white">
                ONLINE ADMISSION AT DRESS 
              </Reveal>
              <Reveal as="p" variant="up" delayMs={140} className="mt-3 text-white/90 text-base sm:text-lg font-light">
                Apply your form to further process. Our team will contact you quickly.
              </Reveal>
            </div>

            <Reveal as="div" variant="up" delayMs={170} className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-3 sm:justify-center lg:justify-start">
              <Link
                to="/contact#contact-form"
                style={{
                  backgroundColor: 'var(--color-button-primary-bg)',
                  color: 'var(--color-button-primary-text)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-button-primary-bg)'}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 border border-white/10 transition-colors"
              >
                Admission Online
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact#contact-form"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--color-primary-900)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg shadow-black/20 transition-colors"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeCtaSection;
