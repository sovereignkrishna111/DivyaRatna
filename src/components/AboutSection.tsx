import React from 'react';
import { Users, Award, Globe, Heart, Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

const AboutSection: React.FC = () => {
  const { getAssetUrl, getSocialUrl } = useSiteSettings();

  const features = [
    {
      icon: <Users className="h-10 w-10 text-brand" />,
      title: 'Expert Faculty',
      description: 'Our dedicated teachers bring years of experience and passion for education'
    },
    {
      icon: <Award className="h-10 w-10 text-brand" />,
      title: 'Academic Excellence',
      description: 'Consistently high academic standards with proven track record of success'
    },
    {
      icon: <Globe className="h-10 w-10 text-brand" />,
      title: 'Global Perspective',
      description: 'Preparing students for success in an interconnected world'
    },
    {
      icon: <Heart className="h-10 w-10 text-brand" />,
      title: 'Holistic Development',
      description: 'Nurturing not just academic growth but character and leadership skills'
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="text-center mb-20" variant="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            About DRESS
          </h2>
          <div className="w-24 h-1 bg-brand mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            Divya Ratna English Secondary School has been a beacon of educational excellence for over two decades, 
            committed to nurturing young minds and preparing them for a bright future.
          </p>

          <div className="mt-6 flex items-center justify-center gap-4">
            {(() => {
              const fb = getSocialUrl('facebook');
              if (!fb) return null;
              return (
                <a href={fb} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const tw = getSocialUrl('twitter');
              if (!tw) return null;
              return (
                <a href={tw} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="X / Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const ig = getSocialUrl('instagram');
              if (!ig) return null;
              return (
                <a href={ig} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const yt = getSocialUrl('youtube');
              if (!yt) return null;
              return (
                <a href={yt} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const li = getSocialUrl('linkedin');
              if (!li) return null;
              return (
                <a href={li} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-red-600 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              );
            })()}
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <Reveal as="div" variant="left">
            <h3 className="text-3xl font-light text-gray-900 mb-6 tracking-wide">Our Mission</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              To provide quality education that empowers students to become confident, creative, and responsible global citizens. 
              We believe in fostering an environment where every child can discover their potential and develop the skills 
              needed for lifelong learning.
            </p>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-brand rounded-full mt-3 mr-4"></div>
                <p className="text-gray-600 text-lg">Excellence in academic achievement</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-brand rounded-full mt-3 mr-4"></div>
                <p className="text-gray-600 text-lg">Character development and moral values</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-brand rounded-full mt-3 mr-4"></div>
                <p className="text-gray-600 text-lg">Innovation and critical thinking</p>
              </div>
            </div>
          </Reveal>
          <Reveal as="div" variant="right" delayMs={100}>
            <img 
              src={getAssetUrl('about_image', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
              alt="Students in classroom"
              className="rounded-lg shadow-xl"
              loading="lazy"
              decoding="async"
            />
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Reveal
              key={index}
              as="div"
              variant="up"
              delayMs={index * 70}
              className="text-center bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
            >
              <div className="flex justify-center mb-6">
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 tracking-wide">
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;