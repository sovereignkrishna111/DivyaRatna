import React from 'react';
import { Target, Heart, Star, Globe, Users, BookOpen, Award, Lightbulb } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from '../components/Reveal';

const Mission: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission', active: true },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' },
  ];

  const missionPillars = [
    {
      icon: <Target className="h-8 w-8 text-maroon-800" />,
      title: "Academic Excellence",
      description: "Providing rigorous, innovative education that challenges students to reach their highest potential while developing critical thinking and problem-solving skills."
    },
    {
      icon: <Heart className="h-8 w-8 text-maroon-800" />,
      title: "Character Development",
      description: "Fostering integrity, empathy, and moral courage through daily interactions, community service, and ethical decision-making opportunities."
    },
    {
      icon: <Globe className="h-8 w-8 text-maroon-800" />,
      title: "Global Citizenship",
      description: "Preparing students to be responsible global citizens who understand diverse cultures and can contribute meaningfully to our interconnected world."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-maroon-800" />,
      title: "Innovation & Creativity",
      description: "Encouraging creative thinking, innovation, and entrepreneurial spirit through hands-on learning experiences and collaborative projects."
    }
  ];

  const coreValues = [
    { icon: <Star className="h-6 w-6 text-gold-600" />, title: "Excellence", description: "Striving for the highest standards in all endeavors" },
    { icon: <Heart className="h-6 w-6 text-gold-600" />, title: "Integrity", description: "Acting with honesty, transparency, and moral courage" },
    { icon: <Users className="h-6 w-6 text-gold-600" />, title: "Community", description: "Building strong relationships and collaborative partnerships" },
    { icon: <BookOpen className="h-6 w-6 text-gold-600" />, title: "Learning", description: "Embracing lifelong learning and intellectual curiosity" },
    { icon: <Globe className="h-6 w-6 text-gold-600" />, title: "Diversity", description: "Celebrating and respecting our multicultural community" },
    { icon: <Award className="h-6 w-6 text-gold-600" />, title: "Leadership", description: "Developing confident, ethical leaders for tomorrow" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl('mission_hero', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <Reveal as="h1" variant="up" className="text-5xl font-light text-white tracking-wide">
            Our Mission
          </Reveal>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Reveal as="div" variant="up" className="lg:hidden mb-4">
              <label className="block text-xs font-semibold text-gray-500 mb-2">ABOUT MENU</label>
              <select
                value={location.pathname}
                onChange={(e) => navigate(e.target.value)}
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm bg-white"
              >
                {sidebarItems.map((it) => (
                  <option key={it.id} value={it.path}>
                    {it.label}
                  </option>
                ))}
              </select>
            </Reveal>
            <Reveal as="nav" variant="up" delayMs={80} className="space-y-1 sticky top-8">
              {sidebarItems.map((item) => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`block px-4 py-3 text-sm transition-colors rounded-md ${
                    item.active 
                      ? 'text-maroon-800 border-l-4 border-maroon-800 bg-maroon-50 font-medium'
                      : 'text-gray-700 hover:text-maroon-800 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </Reveal>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Mission Statement */}
            <div className="mb-12">
              <Reveal as="h2" variant="up" className="text-3xl font-light text-maroon-800 mb-6">
                Our Mission Statement
              </Reveal>
              <Reveal as="div" variant="up" delayMs={60} className="bg-maroon-50 border-l-4 border-maroon-800 p-8 rounded-r-lg mb-8 premium-hover">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  At DRESS, our mission is to provide exceptional education that empowers students to become 
                  confident, creative, and responsible global citizens. We foster an inclusive environment where 
                  every child discovers their potential, develops critical thinking skills, and builds the 
                  foundation for lifelong learning and meaningful contribution to society.
                </p>
              </Reveal>
            </div>

            {/* Mission Pillars */}
            <div className="mb-12">
              <Reveal as="h3" variant="up" className="text-2xl font-light text-maroon-800 mb-8">
                Our Mission Pillars
              </Reveal>
              <div className="grid md:grid-cols-2 gap-8">
                {missionPillars.map((pillar, index) => (
                  <Reveal
                    key={index}
                    as="div"
                    variant="up"
                    delayMs={index * 70}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-maroon-800 premium-hover"
                  >
                    <div className="flex items-center mb-4">
                      {pillar.icon}
                      <h4 className="text-xl font-semibold text-maroon-800 ml-3">{pillar.title}</h4>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{pillar.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Core Values */}
            <div className="mb-12">
              <Reveal as="h3" variant="up" className="text-2xl font-light text-maroon-800 mb-8">
                Our Core Values
              </Reveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreValues.map((value, index) => (
                  <Reveal
                    key={index}
                    as="div"
                    variant="up"
                    delayMs={index * 60}
                    className="text-center bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow premium-hover"
                  >
                    <div className="flex justify-center mb-4">
                      {value.icon}
                    </div>
                    <h4 className="text-lg font-semibold text-maroon-800 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Vision Statement */}
            <Reveal as="div" variant="up" className="bg-maroon-800 text-white p-8 rounded-lg premium-hover">
              <h3 className="text-2xl font-light mb-6">Our Vision</h3>
              <p className="text-lg leading-relaxed opacity-90">
                To be recognized as a leading educational institution that nurtures innovative thinkers, 
                compassionate leaders, and responsible global citizens who will shape a better future for 
                our world through their knowledge, skills, and values.
              </p>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="bg-maroon-800 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Registration of Interest</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active">
                Register
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Application of Admission</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active">
                Apply
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Other Inquiries</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mission;