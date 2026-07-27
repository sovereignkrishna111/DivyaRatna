import React from 'react';
import { BookOpen, Palette, Users, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

const ProgramsSection: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();
  const navigate = useNavigate();

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const programs = [
    {
      icon: <BookOpen className="h-12 w-12 text-white" />,
      title: 'Elementary School',
      grade: 'Grades 1-5',
      description: 'Building strong foundations in literacy, numeracy, and social skills through engaging, hands-on learning experiences.',
      image: getAssetUrl('program_1', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Users className="h-12 w-12 text-white" />,
      title: 'Middle School',
      grade: 'Grades 6-8',
      description: 'Developing critical thinking and preparing students for advanced academic challenges with personalized attention.',
      image: getAssetUrl('program_2', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Trophy className="h-12 w-12 text-white" />,
      title: 'High School',
      grade: 'Grades 9-12',
      description: 'Comprehensive preparation for higher education and career success with advanced placement courses and leadership opportunities.',
      image: getAssetUrl('program_3', 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Palette className="h-12 w-12 text-white" />,
      title: 'Arts & Activities',
      grade: 'All Grades',
      description: 'Enriching programs in music, drama, visual arts, and athletics to develop well-rounded individuals.',
      image: getAssetUrl('program_4', 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    }
  ];

  return (
    <section className="py-20 bg-white animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12" variant="up">
          <h2 className="text-3xl md:text-4xl font-bold text-maroon-800 mb-4">
            Our Academic Programs
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive educational programs designed to meet the diverse needs of our students at every level
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-8">
          {programs.map((program, index) => (
            <Reveal
              key={index}
              as="div"
              variant="up"
              delayMs={index * 90}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="h-64 relative overflow-hidden">
                <img
                  src={program.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  decoding="async"
                />
                <div 
                  className="absolute inset-0 group-hover:bg-opacity-35 transition-all duration-500"
                  style={{
                    backgroundColor: 'rgba(30, 58, 138, 0.50)'
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="flex justify-center mb-4">
                      {program.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{program.title}</h3>
                    <p className="text-lg font-semibold mb-4">{program.grade}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600">{program.description}</p>
                <button
                  type="button"
                  className="mt-4 text-maroon-700 font-semibold hover:text-maroon-800 transition-colors"
                  onClick={() => {
                    const sectionId = program.title === 'Arts & Activities' ? 'activities' : slugify(program.title);
                    navigate(`/academics#${sectionId}`);
                  }}
                >
                  Learn More →
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramsSection;