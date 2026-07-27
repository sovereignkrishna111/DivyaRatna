import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Users, Trophy, Palette, Microscope, Calculator, Globe, Music, Award, Star, Menu } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import { supabase } from '../lib/supabase';
import { queryTableWhere } from '../services/optimizedQueries';
import Reveal from '../components/Reveal';

type AcademicsItemRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  details: string | null;
  category: string | null;
  icon_key: string | null;
  image_key: string | null;
  color: string | null;
  features: string[] | null;
  link_url: string | null;
  published: boolean;
  sort_order: number;
};

const Academics: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const [dbPrograms, setDbPrograms] = useState<AcademicsItemRow[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarItems = [
    { id: 'academics', label: 'Academics', path: '/academics', active: true },
  ];
  const programs = useMemo(() => {
    return [
      {
        icon: <BookOpen className="h-12 w-12 text-white" />,
        title: "Elementary School",
        grades: "Grades 1-5",
        description: "Building strong foundations in literacy, numeracy, and social skills through engaging, hands-on learning experiences that spark curiosity and love for learning.",
        features: ["Play-based learning approach", "Phonics and reading program", "Math manipulatives", "Science exploration labs", "Art and creativity sessions"],
        image: getAssetUrl(
          'academics_program_1',
          'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
        color: "bg-blue-600"
      },
      {
        icon: <Users className="h-12 w-12 text-white" />,
        title: "Middle School",
        grades: "Grades 6-8",
        description: "Developing critical thinking and preparing students for advanced academic challenges with personalized attention and comprehensive support systems.",
        features: ["Project-based learning", "Advanced mathematics", "Science laboratories", "Language arts program", "Leadership development"],
        image: getAssetUrl(
          'academics_program_2',
          'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
        color: "bg-green-600"
      },
      {
        icon: <Trophy className="h-12 w-12 text-white" />,
        title: "High School",
        grades: "Grades 9-12",
        description: "Comprehensive preparation for higher education and career success with advanced placement courses, college counseling, and leadership opportunities.",
        features: ["AP and honors courses", "College counseling", "Research projects", "Internship programs", "University partnerships"],
        image: getAssetUrl(
          'academics_program_3',
          'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        ),
        color: "bg-purple-600"
      }
    ];
  }, [getAssetUrl]);

  const iconForKey = (key?: string | null) => {
    const k = (key || '').trim().toLowerCase();
    const Icon =
      k === 'book-open' || k === 'book' ? BookOpen :
      k === 'users' ? Users :
      k === 'trophy' ? Trophy :
      k === 'palette' ? Palette :
      k === 'calculator' ? Calculator :
      k === 'microscope' ? Microscope :
      k === 'globe' ? Globe :
      k === 'music' ? Music :
      null;
    return Icon ? <Icon className="h-12 w-12 text-white" /> : <BookOpen className="h-12 w-12 text-white" />;
  };

  useEffect(() => {
    let mounted = true;
    const fetchPrograms = async () => {
      setDbLoading(true);
      try {
        const data = await queryTableWhere<AcademicsItemRow>(
          'academics_items',
          'published',
          true,
          { select: 'id,title,subtitle,description,details,category,icon_key,image_key,color,features,link_url,sort_order', cacheTtl: 600000 }
        );

        if (!mounted) return;
        setDbPrograms(data);
      } catch (error) {
        if (!mounted) return;
        setDbPrograms([]);
      } finally {
        if (mounted) setDbLoading(false);
      }
    };

    fetchPrograms();
    const ch = supabase
      .channel('realtime-public-academics-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'academics_items' }, fetchPrograms)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch {
        void 0;
      }
    };
  }, []);

  const programsToRender = useMemo(() => {
    if (dbPrograms.length === 0) return programs;
    return dbPrograms.map((r, idx) => {
      const fallbackKey = `academics_program_${idx + 1}`;
      const image = getAssetUrl(r.image_key || fallbackKey, programs[Math.min(idx, programs.length - 1)]?.image || '');
      const grades = r.subtitle || '';
      const features = (r.features || []).filter(Boolean);
      return {
        icon: iconForKey(r.icon_key),
        title: r.title,
        grades,
        description: r.description || '',
        features,
        image,
        color: r.color || programs[Math.min(idx, programs.length - 1)]?.color || 'bg-maroon-700',
      };
    });
  }, [dbPrograms, getAssetUrl, programs]);

  const subjects = [
    {
      icon: <Calculator className="h-8 w-8 text-maroon-800" />,
      title: "Mathematics",
      description: "From basic arithmetic to advanced calculus, statistics, and mathematical modeling",
      details: "Our mathematics program emphasizes problem-solving, logical reasoning, and real-world applications."
    },
    {
      icon: <Microscope className="h-8 w-8 text-maroon-800" />,
      title: "Sciences",
      description: "Physics, Chemistry, Biology with hands-on laboratory work and research projects",
      details: "State-of-the-art laboratories provide students with practical experience in scientific inquiry."
    },
    {
      icon: <Globe className="h-8 w-8 text-maroon-800" />,
      title: "Social Studies",
      description: "History, Geography, Civics, Economics, and Global Studies",
      details: "Developing global citizens with understanding of diverse cultures and historical perspectives."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-maroon-800" />,
      title: "Languages",
      description: "English, Nepali, and optional third language programs",
      details: "Comprehensive language arts program focusing on communication, literature, and cultural understanding."
    },
    {
      icon: <Palette className="h-8 w-8 text-maroon-800" />,
      title: "Arts",
      description: "Visual arts, drama, creative writing, and design thinking",
      details: "Fostering creativity and self-expression through various artistic mediums and techniques."
    },
    {
      icon: <Music className="h-8 w-8 text-maroon-800" />,
      title: "Music",
      description: "Instrumental music, choir, music theory, and composition",
      details: "Comprehensive music education program with performance opportunities and music technology."
    }
  ];

  const achievements = [
    { icon: <Award className="h-8 w-8 text-gold-600" />, title: "Academic Excellence Awards", count: "50+" },
    { icon: <Star className="h-8 w-8 text-gold-600" />, title: "National Competition Winners", count: "25+" },
    { icon: <Trophy className="h-8 w-8 text-gold-600" />, title: "University Scholarships", count: "100+" },
    { icon: <Globe className="h-8 w-8 text-gold-600" />, title: "International Recognition", count: "15+" }
  ];

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const academicsSubmenu = useMemo(() => {
    return [
      { label: 'Elementary School', path: '/academics/elementary', id: 'elementary-school' },
      { label: 'Middle School', path: '/academics/middle', id: 'middle-school' },
      { label: 'High School', path: '/academics/high', id: 'high-school' },
      { label: 'Arts, Athletics, Activities', path: '/academics/activities', id: 'activities' },
      { label: 'Curriculum', path: '/academics/curriculum', id: 'curriculum' },
    ];
  }, []);

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const section = parts[1];
    if (!section) return;
    const map: Record<string, string> = {
      elementary: 'elementary-school',
      middle: 'middle-school',
      high: 'high-school',
      curriculum: 'curriculum',
      activities: 'activities',
    };
    const target = map[section];
    if (target) {
      setTimeout(() => scrollToId(target), 50);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    if (!id) return;
    setTimeout(() => scrollToId(id), 50);
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url(${getAssetUrl(
              'academics_hero',
              'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            )})`,
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Reveal as="h1" variant="up" className="text-5xl font-light mb-4 tracking-wide">
              Academic Excellence
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl font-light max-w-2xl mx-auto">
              Comprehensive educational programs designed to inspire and challenge every student
            </Reveal>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <button
        type="button"
        aria-label="Toggle academics menu"
        onClick={() => setDrawerOpen((v) => !v)}
        className="fixed left-4 top-24 z-40 inline-flex items-center justify-center h-11 w-11 rounded-full bg-white shadow-lg ring-1 ring-black/10 hover:bg-gray-50"
      >
        <Menu className="h-5 w-5 text-maroon-800" />
      </button>

      <div className={`fixed inset-0 z-40 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/35" onClick={() => setDrawerOpen(false)} />
      </div>

      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl ring-1 ring-black/10 transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-maroon-800">Academics</div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(item.path);
                }}
                className={`w-full text-left block px-4 py-3 text-sm transition-colors rounded-md ${
                  item.active
                    ? 'text-maroon-800 border-l-4 border-maroon-800 bg-maroon-50 font-medium'
                    : 'text-gray-700 hover:text-maroon-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>

              {item.id === 'academics' && (
                <div className="pl-4 mt-1">
                  <div className="space-y-1">
                    {academicsSubmenu.map((s) => (
                      <button
                        key={s.path}
                        type="button"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate(s.path);
                          setTimeout(() => scrollToId(s.id), 60);
                        }}
                        className={`w-full text-left block px-3 py-2 text-sm rounded-md transition-colors ${
                          location.pathname === s.path
                            ? 'text-maroon-800 bg-maroon-50'
                            : 'text-gray-600 hover:text-maroon-800 hover:bg-gray-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-4">
        {/* Academic Programs */}
        <section className="py-20 bg-white">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Our Academic Programs
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              From early childhood through high school graduation, we provide a seamless educational journey
              that prepares students for success in higher education and beyond.
            </Reveal>
          </div>

          <div className="space-y-20">
            {(dbLoading && programsToRender.length === 0 ? [] : programsToRender).map((program, index) => (
              <div
                key={index}
                id={program.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
              >
                <Reveal as="div" variant={index % 2 === 1 ? 'right' : 'left'} delayMs={index * 40} className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="relative group premium-hover">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="rounded-lg shadow-xl w-full h-80 object-cover group-hover:shadow-2xl transition-shadow duration-300"
                    />
                    <div className={`absolute top-6 left-6 ${program.color} rounded-full p-4 shadow-lg`}>
                      {program.icon}
                    </div>
                  </div>
                </Reveal>
                <Reveal as="div" variant={index % 2 === 1 ? 'left' : 'right'} delayMs={index * 40 + 60} className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <h3 className="text-3xl font-light text-maroon-800 mb-2">{program.title}</h3>
                  {program.grades ? (
                    <p className="text-lg font-medium text-maroon-800 mb-4">{program.grades}</p>
                  ) : null}
                  <p className="text-lg text-gray-700 mb-6 leading-relaxed">{program.description}</p>
                  <div className="space-y-3">
                    {(program.features || []).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-maroon-800 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            ))}

            {dbLoading && programsToRender.length === 0 ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : null}
          </div>
        </section>

        <section id="curriculum" className="py-20 bg-gray-50">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Comprehensive Curriculum
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our curriculum is designed to provide a well-rounded education that prepares students for success
              in an ever-changing global landscape.
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, index) => (
              <Reveal
                key={index}
                as="div"
                variant="up"
                delayMs={index * 60}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group premium-hover"
              >
                <div className="flex items-center mb-4">
                  <div className="group-hover:scale-110 transition-transform duration-300">{subject.icon}</div>
                  <h3 className="text-xl font-semibold text-maroon-800 ml-3">{subject.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">{subject.description}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{subject.details}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="achievements" className="py-20 bg-white">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Academic Achievements
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our students consistently excel in academics, competitions, and university admissions
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <Reveal
                key={index}
                as="div"
                variant="up"
                delayMs={index * 60}
                className="text-center bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow premium-hover"
              >
                <div className="flex justify-center mb-4">{achievement.icon}</div>
                <div className="text-3xl font-bold text-maroon-800 mb-2">{achievement.count}</div>
                <h3 className="text-lg font-medium text-gray-700">{achievement.title}</h3>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="activities" className="py-20 bg-gray-50">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Arts & Activities
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enriching opportunities in music, drama, visual arts, and athletics to develop well-rounded individuals.
            </Reveal>
          </div>
        </section>

        <section className="py-20 bg-maroon-800 text-white rounded-lg">
          <div className="grid lg:grid-cols-2 gap-16 items-center px-6">
            <div>
              <h2 className="text-4xl font-light mb-8">Academic Excellence & Innovation</h2>
              <p className="text-lg mb-6 leading-relaxed opacity-90">
                Our commitment to academic excellence is reflected in our innovative teaching methods,
                state-of-the-art facilities, and dedicated faculty who inspire students to reach their full potential.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                  <span>Small class sizes for personalized attention</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                  <span>Technology-integrated learning environments</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                  <span>Regular assessment and progress monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                  <span>College and career counseling services</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-4"></div>
                  <span>International curriculum standards</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl font-light mb-2">98%</div>
                <div className="opacity-90">University Acceptance Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light mb-2">15:1</div>
                <div className="opacity-90">Student-Teacher Ratio</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light mb-2">25+</div>
                <div className="opacity-90">Advanced Courses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-light mb-2">100%</div>
                <div className="opacity-90">Graduation Rate</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50 rounded-lg">
          <div className="text-center">
            <Reveal as="h2" variant="up" className="text-3xl font-light text-maroon-800 mb-4">
              Ready to Join Our Academic Community?
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover how DRESS can help your child achieve academic excellence and personal growth
            </Reveal>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-maroon-700 hover:bg-maroon-800 text-white px-8 py-3 rounded-lg font-medium transition-colors premium-hover premium-active">
                Schedule a Visit
              </button>
              <button className="border border-maroon-700 text-maroon-700 hover:bg-maroon-700 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors premium-hover premium-active">
                Download Brochure
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
    </div>
  );
};

export default Academics;