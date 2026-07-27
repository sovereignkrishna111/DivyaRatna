import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';
import Reveal from '../components/Reveal';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';

const AboutUs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl, getSocialUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', active: true, path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const achievements = [
    { number: '98%', label: 'University Acceptance Rate' },
    { number: '15:1', label: 'Student-Teacher Ratio' },
    { number: '25+', label: 'Years of Excellence' },
    { number: '1200+', label: 'Proud Alumni' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <div className="relative h-80 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl('about_hero', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <Reveal as="h1" variant="up" className="text-5xl font-light text-white tracking-wide">
            About Us
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-6 relative z-10">
        <Reveal as="div" variant="up" className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-700 font-medium">Connect with us</div>
          <div className="flex items-center gap-4">
            {(() => {
              const fb = getSocialUrl('facebook');
              if (!fb) return null;
              return (
                <a href={fb} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-maroon-800 transition-colors" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const tw = getSocialUrl('twitter');
              if (!tw) return null;
              return (
                <a href={tw} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-maroon-800 transition-colors" aria-label="X / Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const ig = getSocialUrl('instagram');
              if (!ig) return null;
              return (
                <a href={ig} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-maroon-800 transition-colors" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const yt = getSocialUrl('youtube');
              if (!yt) return null;
              return (
                <a href={yt} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-maroon-800 transition-colors" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              );
            })()}
            {(() => {
              const li = getSocialUrl('linkedin');
              if (!li) return null;
              return (
                <a href={li} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-maroon-800 transition-colors" aria-label="LinkedIn">
                  <Linkedin className="h-5 w-5" />
                </a>
              );
            })()}
          </div>
        </Reveal>
      </div>
 
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Reveal as="div" variant="up" className="lg:hidden mb-4">
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
            {/* Introduction */}
            <div className="mb-12">
              <Reveal as="p" variant="up" className="text-lg text-gray-700 leading-relaxed mb-6">
                DRESS offers a Pre-K to 12 college preparatory program that helps students to become independent,
                self-aware thinkers possessing deep understandings and powerful learning skills.
              </Reveal>

              <Reveal as="p" variant="up" delayMs={70} className="text-gray-700 leading-relaxed mb-6">
                DRESS provides a dynamic, engaging, academic curriculum based on inquiry and responsive to the
                needs of our students. Cross-disciplinary learning is an important focus at DRESS, and our core
                curriculum is enriched at every level with learning opportunities in theater, music and fine arts,
                technology, service learning, physical education and athletics.
              </Reveal>

              <Reveal as="p" variant="up" delayMs={120} className="text-gray-700 leading-relaxed">
                The DRESS community is fully international, with students and faculty from over thirty countries.
                Our program places special value upon cross-cultural and community-building skills and teamwork.
              </Reveal>
            </div>

            {/* Featured Content with Image */}
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <Reveal as="div" variant="left">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-maroon-800 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-maroon-800 rounded-full"></div>
                    </div>
                  </div>
                </div>

                <div className="text-maroon-800 font-medium text-lg leading-relaxed">
                  <p className="mb-4">
                    Established in 1998, DRESS is a non-profit, independent, co-educational day school,
                    providing an enriched Nepalese college-preparatory curriculum for students Pre-K – Grade 12.
                  </p>
                </div>
              </Reveal>

              <Reveal as="div" variant="right" delayMs={100}>
                <img
                  src={getAssetUrl('about_feature_image', 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
                  alt="Students engaged in learning"
                  className="rounded-lg shadow-lg w-full h-80 object-cover premium-hover"
                />
              </Reveal>
            </div>

            {/* Achievements Section */}
            <Reveal as="div" variant="up" className="bg-gray-50 rounded-lg p-8 mb-12 premium-hover">
              <h3 className="text-2xl font-semibold text-maroon-800 mb-8 text-center">Our Achievements</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-maroon-800 mb-2">{achievement.number}</div>
                    <div className="text-gray-700 text-sm">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Bottom Description */}
            <Reveal as="div" variant="up" className="text-center bg-white p-6 rounded-lg shadow-sm premium-hover">
              <p className="text-gray-700 leading-relaxed text-lg">
                DRESS offers small class sizes, an outstanding international faculty and support staff,
                and a community-oriented learning environment that fosters the well-being of the whole student.
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
              <button
                onClick={() => navigate('/contact#contact-form')}
                className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active"
              >
                Register
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Application of Admission</h3>
              <button
                onClick={() => navigate('/contact#contact-form')}
                className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active"
              >
                Apply
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Other Inquiries</h3>
              <button
                onClick={() => navigate('/contact#contact-form')}
                className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors premium-hover premium-active"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;