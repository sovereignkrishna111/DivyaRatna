import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, Users, Palette, Trophy, Music, Globe, Heart, Star, Microscope, Calculator, Camera, Gamepad2 } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from './Reveal';

const ExploreSection: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [entering, setEntering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { getAssetUrl } = useSiteSettings();

  const exploreItems = [
    {
      id: 1,
      icon: <BookOpen className="h-6 w-6 text-white" />,
      title: "Academic Excellence",
      description: "Our rigorous academic programs prepare students for success in higher education and beyond.",
      details: "We offer comprehensive curricula across all subjects with advanced placement courses, honors programs, and individualized learning paths. Our experienced faculty ensures every student reaches their full potential through innovative teaching methods and personalized attention.",
      color: "bg-blue-600",
      position: { top: '20%', left: '15%' }
    },
    {
      id: 2,
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Extracurricular Activities",
      description: "Students can participate in various clubs, societies, and leadership programs.",
      details: "Our school emphasizes holistic development by offering a variety of co-curricular and extracurricular activities. Students can participate in debate clubs, student government, community service projects, art and craft programs. These activities help build confidence, communication skills, and creativity, allowing students to explore their passions beyond academics.",
      color: "bg-green-600",
      position: { top: '35%', left: '12%' }
    },
    {
      id: 3,
      icon: <Palette className="h-6 w-6 text-white" />,
      title: "Arts & Creativity",
      description: "Fostering creativity through visual arts, music, drama, and creative writing programs.",
      details: "Our comprehensive arts program includes visual arts, music, drama, and creative writing. Students have access to well-equipped art studios, music rooms, and performance spaces where they can explore their creative talents under expert guidance.",
      color: "bg-purple-600",
      position: { top: '50%', left: '10%' }
    },
    {
      id: 4,
      icon: <Trophy className="h-6 w-6 text-white" />,
      title: "Sports & Athletics",
      description: "Comprehensive sports programs promoting physical fitness and team spirit.",
      details: "Our athletics program includes basketball, football, volleyball, track and field, and more. We have modern sports facilities and experienced coaches who help students develop athletic skills while promoting teamwork, discipline, and healthy competition.",
      color: "bg-orange-600",
      position: { top: '65%', left: '13%' }
    },
    {
      id: 5,
      icon: <Music className="h-6 w-6 text-white" />,
      title: "Music & Performance",
      description: "Developing musical talents through choir, band, and individual instruction.",
      details: "Our music program offers choir, instrumental music, and individual lessons. Students can participate in school concerts, competitions, and community performances, developing their musical abilities and stage presence.",
      color: "bg-pink-600",
      position: { top: '80%', left: '16%' }
    },
    {
      id: 6,
      icon: <Globe className="h-6 w-6 text-white" />,
      title: "Global Perspective",
      description: "Preparing students for success in an interconnected world.",
      details: "We emphasize global citizenship through international exchange programs, multicultural events, and world language instruction. Students develop cultural awareness and communication skills essential for success in our globalized world.",
      color: "bg-teal-600",
      position: { top: '25%', left: '85%' }
    },
    {
      id: 7,
      icon: <Heart className="h-6 w-6 text-white" />,
      title: "Character Development",
      description: "Building strong moral values and ethical leadership skills.",
      details: "Our character education program focuses on developing integrity, empathy, and social responsibility. Through community service projects and ethical discussions, students learn to become compassionate leaders and responsible citizens.",
      color: "bg-red-600",
      position: { top: '40%', left: '87%' }
    },
    {
      id: 8,
      icon: <Microscope className="h-6 w-6 text-white" />,
      title: "Science & Innovation",
      description: "State-of-the-art laboratories and hands-on scientific exploration.",
      details: "Our modern science facilities include fully equipped laboratories for physics, chemistry, and biology. Students engage in hands-on experiments, research projects, and science fairs that foster scientific thinking and innovation.",
      color: "bg-indigo-600",
      position: { top: '55%', left: '89%' }
    },
    {
      id: 9,
      icon: <Calculator className="h-6 w-6 text-white" />,
      title: "Mathematics Excellence",
      description: "Advanced mathematics programs from basic arithmetic to calculus.",
      details: "Our mathematics curriculum progresses from foundational concepts to advanced topics including calculus and statistics. We use innovative teaching methods and technology to make mathematics engaging and accessible to all students.",
      color: "bg-yellow-600",
      position: { top: '70%', left: '86%' }
    },
    {
      id: 10,
      icon: <Camera className="h-6 w-6 text-white" />,
      title: "Digital Media",
      description: "Photography, videography, and digital design programs.",
      details: "Students learn digital photography, video production, and graphic design using professional software and equipment. Our media lab provides hands-on experience in creating digital content for school publications and projects.",
      color: "bg-cyan-600",
      position: { top: '15%', left: '50%' }
    },
    {
      id: 11,
      icon: <Star className="h-6 w-6 text-white" />,
      title: "Leadership Programs",
      description: "Developing future leaders through student government and mentorship.",
      details: "Our leadership development programs include student government, peer mentoring, and leadership workshops. Students learn essential skills in communication, decision-making, and team management while serving their school community.",
      color: "bg-amber-600",
      position: { top: '30%', left: '52%' }
    },
    {
      id: 12,
      icon: <Gamepad2 className="h-6 w-6 text-white" />,
      title: "Technology Integration",
      description: "Modern technology tools enhancing learning across all subjects.",
      details: "We integrate cutting-edge technology throughout our curriculum, including computer programming, robotics, and digital literacy. Students develop 21st-century skills essential for future academic and career success.",
      color: "bg-violet-600",
      position: { top: '45%', left: '48%' }
    },
    {
      id: 13,
      icon: <BookOpen className="h-6 w-6 text-white" />,
      title: "Library & Research",
      description: "State-of-the-art library with extensive digital and physical resources.",
      details: "Our modern library features thousands of books, digital databases, and quiet study spaces. Students learn research skills and develop a love for reading through our comprehensive literacy programs.",
      color: "bg-emerald-600",
      position: { top: '60%', left: '50%' }
    },
    {
      id: 14,
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Community Service",
      description: "Building compassionate citizens through service learning.",
      details: "Our community service programs connect students with local organizations and global causes. Through volunteer work and service projects, students develop empathy and social responsibility.",
      color: "bg-rose-600",
      position: { top: '75%', left: '52%' }
    },
    {
      id: 15,
      icon: <Trophy className="h-6 w-6 text-white" />,
      title: "Student Achievements",
      description: "Celebrating excellence in academics, arts, and athletics.",
      details: "Our students consistently achieve outstanding results in national competitions, university admissions, and scholarship awards. We celebrate every achievement and milestone in our students' journeys.",
      color: "bg-gold-600",
      position: { top: '90%', left: '88%' }
    }
  ];

  const handleCircleClick = (id: number) => {
    setSelectedItem(selectedItem === id ? null : id);
  };

  const selectedItemData = exploreItems.find(item => item.id === selectedItem);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (selectedItem !== null) {
      setEntering(false);
      const t = setTimeout(() => setEntering(true), 10);
      return () => clearTimeout(t);
    }
    setEntering(false);
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItemData || !isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [selectedItemData, isMobile]);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden min-h-screen">
      {/* Background Image */}
      <img
        src={getAssetUrl('explore_bg', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        loading="lazy"
        decoding="async"
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center mb-16" variant="up">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border-l-8 border-maroon-700 relative">
            <div className="absolute -left-2 top-8 w-4 h-4 bg-maroon-700 rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-bold text-maroon-800 mb-4">
              Explore what our school has to offer
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Paving path for a great future with bright vision
            </p>
          </div>
        </Reveal>

        <div className="relative h-96 md:h-[600px] hidden md:block">
          {exploreItems.map((item) => (
            <div
              key={item.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
              style={{ 
                top: item.position.top, 
                left: item.position.left,
                zIndex: selectedItem === item.id ? 50 : 10
              }}
            >
              {/* Circle or Expanded Card */}
              {selectedItem === item.id ? (
                <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 max-w-[28rem] max-h-[70vh] overflow-auto transform transition-all duration-500 ease-out animate-scale-in">
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-2 hover:bg-gray-200 btn-animate"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-maroon-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {item.details}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`w-12 h-12 md:w-16 md:h-16 ${item.color} rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-110 transform hover-float`}
                  onClick={() => handleCircleClick(item.id)}
                >
                  {item.icon}

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs px-3 py-1 rounded-lg whitespace-nowrap">
                      {item.title}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="md:hidden">
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {exploreItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`w-14 h-14 ${item.color} rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform btn-animate`}
                onClick={() => handleCircleClick(item.id)}
                aria-label={item.title}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </div>

        {selectedItemData && isMobile && typeof document !== 'undefined' && (
          createPortal(
            <div className="fixed inset-0 z-[70] md:hidden flex items-end justify-center">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={() => setSelectedItem(null)}
                style={{
                  opacity: entering ? 1 : 0,
                  transition: 'opacity 260ms ease-out'
                }}
              />

              <div
                className="relative z-[75] bg-white shadow-2xl w-full max-w-[640px] max-h-[80vh] overflow-auto p-5 sm:p-6 rounded-t-2xl"
                style={{
                  transform: `translateY(${entering ? '0%' : '100%'})`,
                  transition: 'transform 440ms cubic-bezier(0.22, 1, 0.36, 1)',
                  willChange: 'transform'
                }}
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 rounded-full p-2 hover:bg-gray-200"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center mb-4 pr-10">
                  <div className={`w-10 h-10 ${selectedItemData.color} rounded-full flex items-center justify-center mr-3 flex-shrink-0`}>
                    {selectedItemData.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-maroon-800 mb-0.5">
                      {selectedItemData.title}
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium">
                      {selectedItemData.description}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {selectedItemData.details}
                  </p>
                </div>
              </div>
            </div>,
            document.body
          )
        )}

        {/* Instructions */}
        <Reveal as="div" variant="up" delayMs={140} className="text-center mt-16">
          <p className="text-gray-600 text-lg">
            Click on any circle to explore our programs and facilities
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default ExploreSection;