import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Palette, Trophy, Utensils, Bus, Heart, Shield, Wind, Users, Clock, CheckCircle, Star, Award, Handshake, Menu } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import { supabase } from '../lib/supabase';
import Reveal from '../components/Reveal';

type ServicesItemRow = {
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

const Services: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const [dbServices, setDbServices] = useState<ServicesItemRow[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const servicesSubmenu = useMemo(() => {
    return [
      { label: 'Arts, Athletics, Activities', path: '/services/activities' },
      { label: 'Student Services', path: '/services/student' },
      { label: 'Food and Nutrition', path: '/services/nutrition' },
      { label: 'Transportation', path: '/services/transportation' },
      { label: 'Health Services', path: '/services/health' },
      { label: 'Air Quality Management', path: '/services/air-quality' },
      { label: 'Child Protection', path: '/services/protection' },
      { label: 'Safety and Security', path: '/services/security' },
    ];
  }, []);

  const sidebarItems = [
    { id: 'services', label: 'Services', path: '/services', active: true },
  ];

  const services = useMemo(() => {
    return [
      {
        icon: <Palette className="h-12 w-12 text-white" />,
        title: "Arts, Athletics, Activities",
        description: "Comprehensive programs in visual arts, music, drama, and sports to develop well-rounded individuals with diverse talents and interests.",
        features: ["Visual Arts Studio", "Music Room & Instruments", "Drama Theater", "Sports Facilities", "Art Exhibitions", "Performance Opportunities"],
        image: getAssetUrl('services_1', 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-purple-600",
        details: "Our arts and athletics programs provide students with opportunities to explore their creative and physical potential through expert instruction and state-of-the-art facilities."
      },
      {
        icon: <Users className="h-12 w-12 text-white" />,
        title: "Student Services",
        description: "Comprehensive support services to ensure every student's academic and personal success through individualized attention and guidance.",
        features: ["Academic Counseling", "Career Guidance", "Mental Health Support", "Tutoring Programs", "Study Skills Training", "Peer Mentoring"],
        image: getAssetUrl('services_2', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-blue-600",
        details: "Our student services team works closely with students, parents, and teachers to provide comprehensive support for academic achievement and personal development."
      },
      {
        icon: <Utensils className="h-12 w-12 text-white" />,
        title: "Food and Nutrition",
        description: "Healthy, nutritious meals prepared with fresh ingredients to fuel learning and growth, promoting healthy eating habits for life.",
        features: ["Balanced Meal Plans", "Fresh Local Ingredients", "Dietary Accommodations", "Nutrition Education", "Organic Options", "Cultural Cuisine"],
        image: getAssetUrl('services_3', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-green-600",
        details: "Our nutrition program emphasizes healthy eating habits with meals prepared by certified nutritionists and chefs using locally sourced, organic ingredients."
      },
      {
        icon: <Bus className="h-12 w-12 text-white" />,
        title: "Transportation",
        description: "Safe, reliable transportation services connecting students from various parts of the city with modern, well-maintained vehicles.",
        features: ["GPS Tracking System", "Trained Professional Drivers", "Safety Protocols", "Multiple Route Options", "Air-Conditioned Buses", "Emergency Communication"],
        image: getAssetUrl('services_4', 'https://images.pexels.com/photos/159658/school-bus-vehicle-yellow-159658.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-yellow-600",
        details: "Our transportation service ensures safe and comfortable travel for students with modern buses equipped with safety features and experienced drivers."
      },
      {
        icon: <Heart className="h-12 w-12 text-white" />,
        title: "Health Services",
        description: "Comprehensive healthcare services to maintain student health and well-being with qualified medical professionals on campus.",
        features: ["Full-time School Nurse", "First Aid & Emergency Care", "Health Screenings", "Medication Management", "Health Education", "Wellness Programs"],
        image: getAssetUrl('services_5', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-maroon-800",
        details: "Our health services provide comprehensive medical care with qualified nurses and partnerships with local healthcare providers for student wellness."
      },
      {
        icon: <Wind className="h-12 w-12 text-white" />,
        title: "Air Quality Management",
        description: "Maintaining clean, healthy air quality throughout our campus for optimal learning conditions and student health.",
        features: ["Air Purification Systems", "Regular Quality Monitoring", "Green Campus Initiatives", "Pollution Control Measures", "Indoor Plant Programs", "HVAC Maintenance"],
        image: getAssetUrl('services_6', 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-teal-600",
        details: "We maintain excellent air quality through advanced filtration systems, regular monitoring, and sustainable practices to ensure a healthy learning environment."
      },
      {
        icon: <Shield className="h-12 w-12 text-white" />,
        title: "Child Protection",
        description: "Comprehensive child protection policies ensuring a safe and secure environment for all students with trained staff and clear protocols.",
        features: ["Background Verification", "Safety Training Programs", "Reporting Systems", "Counseling Support", "Anti-Bullying Policies", "Emergency Procedures"],
        image: getAssetUrl('services_7', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-indigo-600",
        details: "Our child protection framework includes comprehensive policies, trained staff, and support systems to ensure every student feels safe and protected."
      },
      {
        icon: <Trophy className="h-12 w-12 text-white" />,
        title: "Safety and Security",
        description: "24/7 security measures and safety protocols to ensure a protected learning environment with modern security systems.",
        features: ["CCTV Monitoring", "Trained Security Personnel", "Emergency Response Plans", "Access Control Systems", "Visitor Management", "Safety Drills"],
        image: getAssetUrl('services_8', 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
        color: "bg-gray-600",
        details: "Our comprehensive security system includes 24/7 monitoring, trained personnel, and advanced technology to maintain a safe learning environment."
      }
    ];
  }, [getAssetUrl]);

  const iconForKey = (key?: string | null) => {
    const k = (key || '').trim().toLowerCase();
    const Icon =
      k === 'palette' ? Palette :
      k === 'users' ? Users :
      k === 'utensils' ? Utensils :
      k === 'bus' ? Bus :
      k === 'heart' ? Heart :
      k === 'wind' ? Wind :
      k === 'shield' ? Shield :
      k === 'trophy' ? Trophy :
      null;
    return Icon ? <Icon className="h-12 w-12 text-white" /> : <Handshake className="h-12 w-12 text-white" />;
  };

  useEffect(() => {
    let mounted = true;
    const fetchServices = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from('services_items')
          .select('id,title,subtitle,description,details,category,icon_key,image_key,color,features,link_url,published,sort_order')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!mounted) return;
        if (error || !data) {
          setDbServices([]);
          return;
        }
        setDbServices(data as ServicesItemRow[]);
      } finally {
        if (mounted) setDbLoading(false);
      }
    };

    fetchServices();
    const ch = supabase
      .channel('realtime-public-services-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services_items' }, fetchServices)
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

  const servicesToRender = useMemo(() => {
    if (dbServices.length === 0) return services;
    return dbServices.map((r, idx) => {
      const fallbackKey = `services_${idx + 1}`;
      const image = getAssetUrl(r.image_key || fallbackKey, services[Math.min(idx, services.length - 1)]?.image || '');
      return {
        icon: iconForKey(r.icon_key),
        title: r.title,
        description: r.description || '',
        features: (r.features || []).filter(Boolean),
        image,
        color: r.color || services[Math.min(idx, services.length - 1)]?.color || 'bg-maroon-700',
        details: r.details || r.subtitle || '',
      };
    });
  }, [dbServices, getAssetUrl, services]);

  const serviceStats = [
    { icon: <Clock className="h-8 w-8 text-blue-600" />, number: "24/7", label: "Support Available" },
    { icon: <CheckCircle className="h-8 w-8 text-green-600" />, number: "100%", label: "Safety Compliance" },
    { icon: <Star className="h-8 w-8 text-yellow-600" />, number: "95%", label: "Parent Satisfaction" },
    { icon: <Award className="h-8 w-8 text-purple-600" />, number: "15+", label: "Service Categories" }
  ];

  // Smooth scroll helper with sticky nav offset
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const submenuIdForPath = useMemo(() => {
    return {
      '/services/activities': 'arts-athletics-activities',
      '/services/student': 'student-services',
      '/services/nutrition': 'food-and-nutrition',
      '/services/transportation': 'transportation',
      '/services/health': 'health-services',
      '/services/air-quality': 'air-quality-management',
      '/services/protection': 'child-protection',
      '/services/security': 'safety-and-security',
    } as Record<string, string>;
  }, []);

  useEffect(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    // Expecting /services/<section>
    const section = parts[1];
    if (!section) return;
    const map: Record<string, string> = {
      activities: 'arts-athletics-activities',
      student: 'student-services',
      nutrition: 'food-and-nutrition',
      transportation: 'transportation',
      health: 'health-services',
      'air-quality': 'air-quality-management',
      protection: 'child-protection',
      security: 'safety-and-security',
    };
    const target = map[section];
    if (target) {
      setTimeout(() => scrollToId(target), 50);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url(${getAssetUrl(
              'services_hero',
              'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            )})`,
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Reveal as="h1" variant="up" className="text-5xl font-light mb-4 tracking-wide">
              Our Services
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl font-light max-w-2xl mx-auto">
              Comprehensive support services designed to enhance the educational experience and ensure student success
            </Reveal>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <button
          type="button"
          aria-label="Toggle services menu"
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
            <div className="font-semibold text-maroon-800">Services</div>
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

                {item.id === 'services' && (
                  <div className="pl-4 mt-1">
                    <div className="space-y-1">
                      {servicesSubmenu.map((s) => (
                        <button
                          key={s.path}
                          type="button"
                          onClick={() => {
                            setDrawerOpen(false);
                            navigate(s.path);
                            const id = submenuIdForPath[s.path];
                            if (id) setTimeout(() => scrollToId(id), 60);
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

        <div>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Supporting Student Success
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive range of services ensures that every aspect of student life is supported, 
              from academics to health, safety, and personal development.
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {(dbLoading && servicesToRender.length === 0 ? [] : servicesToRender).map((service, index) => (
              <Reveal
                key={index}
                as="div"
                variant="up"
                delayMs={index * 60}
                id={service.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group premium-hover"
              >
                <div className="relative">
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute top-6 left-6 ${service.color} rounded-full p-4 shadow-lg`}>
                    {service.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold text-maroon-800 mb-4">{service.title}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>
                  {service.details ? (
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{service.details}</p>
                  ) : null}
                  <div className="grid grid-cols-2 gap-3">
                    {(service.features || []).map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-maroon-800 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}

            {dbLoading && servicesToRender.length === 0 ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Service Statistics */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Service Excellence by Numbers
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our commitment to excellence is reflected in our service quality and student satisfaction
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceStats.map((stat, index) => (
              <Reveal
                key={index}
                as="div"
                variant="up"
                delayMs={index * 60}
                className="bg-white p-8 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow premium-hover"
              >
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-maroon-800 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Service Excellence */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-light text-maroon-800 mb-8">Excellence in Every Service</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                At DRESS, we believe that exceptional education extends beyond the classroom. Our comprehensive 
                range of services is designed to support every aspect of student development and well-being.
              </p>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                From nutritious meals and safe transportation to health services and extracurricular activities, 
                we ensure that our students have everything they need to thrive in a supportive environment.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-maroon-800 rounded-full mr-4"></div>
                  <span className="text-gray-700">24/7 support and monitoring systems</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-maroon-800 rounded-full mr-4"></div>
                  <span className="text-gray-700">Qualified and trained professional staff</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-maroon-800 rounded-full mr-4"></div>
                  <span className="text-gray-700">Regular quality assessments and improvements</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-maroon-800 rounded-full mr-4"></div>
                  <span className="text-gray-700">Continuous innovation and enhancement</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-maroon-800 rounded-full mr-4"></div>
                  <span className="text-gray-700">Parent and student feedback integration</span>
                </div>
              </div>
            </div>
            <div>
              <img 
                src={getAssetUrl('services_image', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
                alt="Students and services"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact for Services */}
      <section className="py-20 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light mb-8">Need More Information About Our Services?</h2>
          <p className="text-xl opacity-90 mb-12 max-w-3xl mx-auto">
            Our dedicated staff is here to answer any questions about our services and how they support your child's education and development
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">General Services</h3>
              <p className="opacity-90 mb-4">Information about all our services</p>
              <p className="text-sm">services@divyaratna.edu.np</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Transportation</h3>
              <p className="opacity-90 mb-4">Bus routes and transportation services</p>
              <p className="text-sm">transport@divyaratna.edu.np</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Health Services</h3>
              <p className="opacity-90 mb-4">Medical and wellness support</p>
              <p className="text-sm">health@divyaratna.edu.np</p>
            </div>
          </div>
          <button className="bg-white text-maroon-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors premium-hover premium-active">
            Contact Our Services Team
          </button>
        </div>
      </section>

        </div>
      </div>
    </div>
  );
};

export default Services;