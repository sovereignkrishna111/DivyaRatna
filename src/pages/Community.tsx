import React, { useEffect, useMemo, useState } from 'react';
import { Users, Heart, Calendar, Award, Globe, Coffee, Handshake, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';
import { supabase } from '../lib/supabase';
import Reveal from '../components/Reveal';

type CommunityItemRow = {
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

const Community: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const [dbGroups, setDbGroups] = useState<CommunityItemRow[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [recentAchievements, setRecentAchievements] = useState<
    Array<{
      id: string;
      title: string;
      excerpt: string;
      date: string;
      category?: string;
      imageUrl?: string;
    }>
  >([]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      if (id) setTimeout(() => scrollToId(id), 50);
      return;
    }

    const parts = location.pathname.split('/').filter(Boolean);
    const section = parts[1];
    if (!section) return;

    const map: Record<string, string> = {
      parents: 'parent-association',
      alumni: 'alumni-network',
      voices: 'community-voices',
      recent: 'recent-events',
    };

    const target = map[section];
    if (target) setTimeout(() => scrollToId(target), 50);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const fetchRecentAchievements = async () => {
      const { data, error } = await supabase
        .from('achievements_activities')
        .select('*')
        .eq('published', true)
        .eq('kind', 'achievement')
        .order('date', { ascending: false })
        .limit(3);

      if (error || !data) {
        setRecentAchievements([]);
        return;
      }

      setRecentAchievements(
        (data as unknown as Array<Record<string, unknown>>).map((n) => ({
          id: String(n.id),
          title: String(n.title),
          excerpt: String(n.excerpt),
          date: String(n.date),
          category: n.category ? String(n.category) : undefined,
          imageUrl: n.image_url ? String(n.image_url) : undefined,
        }))
      );
    };

    fetchRecentAchievements();

    const channel = supabase
      .channel('realtime-community-recent-achievements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements_activities' }, fetchRecentAchievements)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        void 0;
      }
    };
  }, []);

  const communitySubmenu = useMemo(() => {
    return [
      { label: 'Community Groups', hash: '#community-groups' },
      { label: 'Recently at DRESS', hash: '#recent-events' },
      { label: 'Community Voices', hash: '#community-testimonials' },
      { label: 'Get Involved', hash: '#get-involved' },
    ];
  }, []);

  const sidebarItems = [
    { id: 'community', label: 'Community', path: '/community', active: true },
  ];

  const communityGroups = useMemo(() => {
    return [
      {
        icon: <Users className="h-12 w-12 text-white" />,
        title: 'Parent Association',
        description:
          'Active parent community supporting school initiatives and student success through collaborative engagement and volunteer programs.',
        features: [
          'Monthly Parent Meetings',
          'Volunteer Opportunities',
          'Fundraising Events',
          'Parent Education Workshops',
          'School Policy Input',
          'Community Building Activities',
        ],
        color: 'bg-blue-600',
        details:
          'Our Parent Association plays a vital role in school governance and community building, providing valuable input on policies and organizing events that strengthen our school community.',
      },
      {
        icon: <Award className="h-12 w-12 text-white" />,
        title: 'Alumni Network',
        description:
          'Proud graduates making a difference in the world and supporting current students through mentorship and career guidance programs.',
        features: [
          'Mentorship Programs',
          'Career Guidance Sessions',
          'Scholarship Support',
          'Annual Reunions',
          'Professional Networking',
          'Guest Speaker Series',
        ],
        color: 'bg-green-600',
        details:
          'Our alumni network spans across various industries and countries, providing current students with valuable insights, mentorship, and career opportunities.',
      },
      {
        icon: <Heart className="h-12 w-12 text-white" />,
        title: 'Community Voices',
        description:
          "Local community members sharing their expertise and cultural knowledge to enrich our students' educational experience.",
        features: [
          'Expert Guest Speakers',
          'Cultural Exchange Programs',
          'Community Service Projects',
          'Local Business Partnerships',
          'Cultural Celebrations',
          'Skill-sharing Workshops',
        ],
        color: 'bg-purple-600',
        details:
          'Community Voices brings together local experts, artists, and professionals who share their knowledge and experiences with our students, creating meaningful connections.',
      },
    ];
  }, []);

  const iconForKey = (key?: string | null) => {
    const k = (key || '').trim().toLowerCase();
    const Icon =
      k === 'users'
        ? Users
        : k === 'award'
          ? Award
          : k === 'heart'
            ? Heart
            : k === 'globe'
              ? Globe
              : k === 'calendar'
                ? Calendar
                : null;
    return Icon ? <Icon className="h-12 w-12 text-white" /> : <Users className="h-12 w-12 text-white" />;
  };

  useEffect(() => {
    let mounted = true;
    const fetchGroups = async () => {
      setDbLoading(true);
      try {
        const { data, error } = await supabase
          .from('community_items')
          .select('id,title,subtitle,description,details,category,icon_key,image_key,color,features,link_url,published,sort_order')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        if (!mounted) return;
        if (error || !data) {
          setDbGroups([]);
          return;
        }
        setDbGroups(data as CommunityItemRow[]);
      } finally {
        if (mounted) setDbLoading(false);
      }
    };

    fetchGroups();
    const ch = supabase
      .channel('realtime-public-community-items')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_items' }, fetchGroups)
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

  const groupsToRender = useMemo(() => {
    if (dbGroups.length === 0) return communityGroups;
    return dbGroups.map((r, idx) => {
      const fallbackColor = communityGroups[Math.min(idx, communityGroups.length - 1)]?.color || 'bg-maroon-700';
      return {
        icon: iconForKey(r.icon_key),
        title: r.title,
        description: r.description || '',
        features: (r.features || []).filter(Boolean),
        color: r.color || fallbackColor,
        details: r.details || r.subtitle || '',
      };
    });
  }, [communityGroups, dbGroups]);

  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "Parent Association President",
      quote: "The sense of community at DRESS is extraordinary. Parents, teachers, and students work together to create an environment where every child can thrive and reach their full potential.",
      image: getAssetUrl('community_testimonial_1', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      years: "Parent for 5 years"
    },
    {
      name: "Priya Thapa",
      role: "Alumni, Class of 2015",
      quote: "DRESS gave me the foundation I needed to succeed in university and beyond. I'm proud to give back to the school that shaped my future and continue supporting current students.",
      image: getAssetUrl('community_testimonial_2', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      years: "Graduate, now Software Engineer"
    },
    {
      name: "Dr. Suman Karki",
      role: "Community Volunteer",
      quote: "Being part of the DRESS community as a volunteer has been incredibly rewarding. The school's commitment to excellence and community engagement is truly inspiring.",
      image: getAssetUrl('community_testimonial_3', 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
      years: "Volunteer for 3 years"
    }
  ];

  const communityStats = [
    { icon: <Users className="h-8 w-8 text-blue-600" />, number: "500+", label: "Active Parents" },
    { icon: <Award className="h-8 w-8 text-green-600" />, number: "1200+", label: "Alumni Network" },
    { icon: <Heart className="h-8 w-8 text-maroon-800" />, number: "50+", label: "Community Partners" },
    { icon: <Calendar className="h-8 w-8 text-purple-600" />, number: "100+", label: "Annual Events" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage: `url(${getAssetUrl(
              'community_hero',
              'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            )})`,
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <Reveal as="h1" variant="up" className="text-5xl font-light mb-4 tracking-wide">
              Our Community
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl font-light max-w-2xl mx-auto">
              Building strong connections between students, families, and the broader community to create a supportive learning environment
            </Reveal>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <button
          type="button"
          aria-label="Toggle community menu"
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
            <div className="font-semibold text-maroon-800">Community</div>
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

                {item.id === 'community' && (
                  <div className="pl-4 mt-1">
                    <div className="space-y-1">
                      {communitySubmenu.map((s) => (
                        <button
                          key={s.hash}
                          type="button"
                          onClick={() => {
                            setDrawerOpen(false);
                            navigate(`/community${s.hash}`);
                            const id = s.hash.replace('#', '');
                            if (id) setTimeout(() => scrollToId(id), 60);
                          }}
                          className="w-full text-left block px-3 py-2 text-sm rounded-md transition-colors text-gray-600 hover:text-maroon-800 hover:bg-gray-50"
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

      {/* Community Statistics */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {communityStats.map((stat, index) => (
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

      {/* Community Groups */}
      <section id="community-groups" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Community Groups
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our vibrant community is made up of dedicated individuals who contribute to the DRESS experience and support student success
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {(dbLoading && groupsToRender.length === 0 ? [] : groupsToRender).map((group, index) => (
              <Reveal
                key={index}
                as="div"
                variant="up"
                delayMs={index * 70}
                id={group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group premium-hover"
              >
                <div className={`${group.color} p-8 text-center`}>
                  <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    {group.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{group.title}</h3>
                </div>
                <div className="p-8">
                  <p className="text-gray-700 mb-6 leading-relaxed">{group.description}</p>
                  {group.details ? (
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">{group.details}</p>
                  ) : null}
                  <ul className="space-y-3">
                    {(group.features || []).map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-maroon-800 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}

            {dbLoading && groupsToRender.length === 0 ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section id="recent-events" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Recently at DRESS
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Celebrating our community through memorable events and achievements that bring us together
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {recentAchievements.map((item) => (
              <Reveal key={item.id} as="div" variant="up" className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group premium-hover">
                <div className="relative">
                  <img
                    src={getAssetUrl(`achievement_${item.id}`, item.imageUrl || '')}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {item.category && (
                    <div className="absolute top-4 left-4 bg-maroon-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.category}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 text-maroon-800 px-3 py-1 rounded-full text-sm font-medium">
                    {item.date}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-maroon-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">{item.excerpt}</p>
                  <button
                    onClick={() => navigate('/bulletins/achievements')}
                    className="inline-flex items-center text-sm font-medium text-maroon-700 hover:text-maroon-800 transition-colors"
                  >
                    View
                  </button>
                </div>
              </Reveal>
            ))}

            {recentAchievements.length === 0 && (
              <div className="lg:col-span-2 text-center text-gray-500">
                No achievements yet.
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <button
              className="bg-maroon-700 hover:bg-maroon-800 text-white px-10 py-3 rounded-full font-semibold transition-colors premium-hover premium-active"
              onClick={() => navigate('/bulletins/achievements')}
            >
              See More
            </button>
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section id="community-testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light text-maroon-800 mb-4">
              Community Voices
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our community members about their DRESS experience and the impact of our collaborative approach
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Reveal key={index} as="div" variant="up" delayMs={index * 70} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow premium-hover">
                <p className="text-lg text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-semibold text-maroon-800">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-gray-500 text-xs">{testimonial.years}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved */}
      <section id="get-involved" className="py-20 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal as="h2" variant="up" className="text-4xl font-light mb-4">
              Get Involved in Our Community
            </Reveal>
            <Reveal as="p" variant="up" delayMs={70} className="text-xl opacity-90 max-w-3xl mx-auto">
              There are many ways to be part of the DRESS community and support our students' educational journey
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                <Coffee className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Volunteer</h3>
              <p className="opacity-90 text-sm">Join our volunteer programs and make a meaningful difference in students' lives</p>
            </div>
            <div className="text-center group">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                <Handshake className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Partner</h3>
              <p className="opacity-90 text-sm">Collaborate with us on educational initiatives and community projects</p>
            </div>
            <div className="text-center group">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Support</h3>
              <p className="opacity-90 text-sm">Support our students and programs through various contribution opportunities</p>
            </div>
            <div className="text-center group">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                <Globe className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="opacity-90 text-sm">Stay connected through our alumni network and community events</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button className="bg-white text-maroon-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors mr-4 premium-hover premium-active">
              Join Our Community
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-maroon-800 px-8 py-3 rounded-lg font-medium transition-colors premium-hover premium-active">
              Learn More
            </button>
          </div>
        </div>
      </section>

        </div>
      </div>
    </div>
  );
};

export default Community;