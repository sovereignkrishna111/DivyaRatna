import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

type HeroSlideRow = {
  id: string;
  asset_key: string;
  image_url: string;
  title: string;
  subtitle: string;
  cta_text: string;
  sort_order: number;
  published: boolean;
};

type HeroSlide = {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
};

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState<HeroSlide[]>([]);

  const { getAssetUrl } = useSiteSettings();
  
  const fallbackSlides: HeroSlide[] = useMemo(() => {
    return [
      {
        image: getAssetUrl('hero_1', 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        title: 'Excellence in Education',
        subtitle: 'Nurturing minds, building futures at DRESS',
        cta: 'Discover Our Programs'
      },
      {
        image: getAssetUrl('hero_2', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        title: 'A passion for learning',
        subtitle: 'Where every student is encouraged to reach their full potential',
        cta: 'Virtual Tour'
      },
      {
        image: getAssetUrl('hero_3', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        title: 'The commitment to serve as a compassionate global citizen and leader',
        subtitle: 'Preparing students for success in an interconnected world',
        cta: 'Learn More'
      }
    ];
  }, [getAssetUrl]);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('home_hero_slides')
        .select('id,asset_key,image_url,title,subtitle,cta_text,sort_order,published')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });

      if (!mounted) return;

      if (error || !data) {
        console.warn('[HeroSection] Failed to load home_hero_slides', error);
        setSlides(fallbackSlides);
        return;
      }

      const hero1Fallback = getAssetUrl(
        'hero_1',
        'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      );

      const mapped = (data as unknown as HeroSlideRow[])
        .map((r) => {
          const assetKey = String(r.asset_key);
          const dbImage = (r.image_url || '').trim();
          return {
            image: dbImage || getAssetUrl(assetKey, hero1Fallback),
            title: String(r.title || ''),
            subtitle: String(r.subtitle || ''),
            cta: String(r.cta_text || ''),
          };
        });

      setSlides(mapped.length ? mapped : fallbackSlides);
      setCurrentSlide(0);
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-home-hero')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_hero_slides' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, [fallbackSlides, getAssetUrl]);

  useEffect(() => {
    if (!slides.length) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative h-[calc(100svh-72px)] md:h-[calc(100vh-96px)] lg:h-[calc(100vh-112px)] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="h-full relative">
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_40%,rgba(0,0,0,0.18)_70%,rgba(0,0,0,0.28)_100%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.08)_22%,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.08)_78%,rgba(0,0,0,0.18)_100%)]"></div>
            <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
              <div className="max-w-5xl mx-auto px-6">
                {index === currentSlide && (
                  <>
                    <Reveal as="h1" variant="up" durationMs={650} className="site-hero-heading text-3xl md:text-5xl lg:text-[4.5rem] font-medium mb-6 leading-[0.9] tracking-[-0.035em]">
                      {slide.title}
                    </Reveal>
                    <Reveal as="p" variant="up" delayMs={120} durationMs={650} className="text-lg md:text-xl lg:text-2xl mb-12 max-w-4xl mx-auto font-light leading-relaxed text-white/95">
                      {slide.subtitle}
                    </Reveal>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 bottom-24 md:bottom-auto top-auto md:top-1/2 md:-translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-2.5 md:p-3 rounded-full transition-all z-20 backdrop-blur-sm hover-float"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 bottom-24 md:bottom-auto top-auto md:top-1/2 md:-translate-y-1/2 bg-black/20 hover:bg-black/30 text-white p-2.5 md:p-3 rounded-full transition-all z-20 backdrop-blur-sm hover-float"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3 px-4 py-2 rounded-full bg-black/20 backdrop-blur-sm">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
          />
        ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;