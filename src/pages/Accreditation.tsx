import React from 'react';
import { Award, Shield, CheckCircle, Star, Globe, BookOpen, Users, Trophy } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';

const Accreditation: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation', active: true },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const accreditations = [
    {
      icon: <Award className="h-12 w-12 text-gold-600" />,
      title: "Ministry of Education, Nepal",
      description: "Fully accredited by the Government of Nepal's Ministry of Education for secondary education programs.",
      status: "Active",
      year: "1998 - Present",
      details: "Our primary accreditation ensures compliance with national educational standards and curriculum requirements."
    },
    {
      icon: <Globe className="h-12 w-12 text-blue-600" />,
      title: "Cambridge International",
      description: "Authorized Cambridge International School offering IGCSE and A-Level programs.",
      status: "Active",
      year: "2005 - Present",
      details: "Provides international curriculum options for students seeking global educational pathways."
    },
    {
      icon: <Shield className="h-12 w-12 text-green-600" />,
      title: "ISO 9001:2015 Certification",
      description: "Quality management system certification ensuring consistent educational service delivery.",
      status: "Active",
      year: "2018 - Present",
      details: "Demonstrates our commitment to continuous improvement and quality assurance in education."
    },
    {
      icon: <Star className="h-12 w-12 text-purple-600" />,
      title: "NISA Membership",
      description: "Member of Nepal Independent Schools Association, promoting educational excellence.",
      status: "Active",
      year: "2000 - Present",
      details: "Collaborative network of leading independent schools in Nepal sharing best practices."
    }
  ];

  const qualityStandards = [
    { icon: <BookOpen className="h-6 w-6 text-maroon-800" />, title: "Curriculum Excellence", description: "Rigorous academic programs meeting international standards" },
    { icon: <Users className="h-6 w-6 text-maroon-800" />, title: "Qualified Faculty", description: "Highly trained teachers with relevant qualifications and experience" },
    { icon: <Trophy className="h-6 w-6 text-maroon-800" />, title: "Student Achievement", description: "Consistent high performance in national and international assessments" },
    { icon: <Shield className="h-6 w-6 text-maroon-800" />, title: "Safety Standards", description: "Comprehensive safety protocols and secure learning environment" },
    { icon: <CheckCircle className="h-6 w-6 text-maroon-800" />, title: "Quality Assurance", description: "Regular audits and continuous improvement processes" },
    { icon: <Globe className="h-6 w-6 text-maroon-800" />, title: "Global Recognition", description: "International partnerships and recognition programs" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl(
          'accreditation_hero',
          'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        )})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">Accreditation</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-8">
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
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-light text-maroon-800 mb-6">Educational Excellence Through Accreditation</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                DRESS maintains the highest educational standards through comprehensive accreditation and certification 
                from recognized national and international bodies. Our commitment to quality assurance ensures that 
                students receive education that meets global standards while respecting local values and culture.
              </p>
              <p className="text-gray-700 leading-relaxed">
                These accreditations validate our educational programs, teaching methodologies, and institutional 
                practices, providing assurance to students, parents, and the broader community about the quality 
                of education we deliver.
              </p>
            </div>

            {/* Accreditations */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Our Accreditations & Certifications</h3>
              <div className="space-y-8">
                {accreditations.map((accreditation, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-6">
                        {accreditation.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xl font-semibold text-maroon-800">{accreditation.title}</h4>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            {accreditation.status}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{accreditation.description}</p>
                        <p className="text-sm text-gray-600 mb-3">{accreditation.details}</p>
                        <div className="text-sm text-gray-500">
                          <strong>Period:</strong> {accreditation.year}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Standards */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Quality Standards We Maintain</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {qualityStandards.map((standard, index) => (
                  <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mr-4">
                      {standard.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-2">{standard.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{standard.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognition Image */}
            <div className="mb-12">
              <img 
                src={getAssetUrl(
                  'accreditation_feature_image',
                  'https://images.pexels.com/photos/5428836/pexels-photo-5428836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                )}
                alt="Award ceremony"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <p className="text-center text-gray-600 text-sm mt-4">
                DRESS receiving recognition for educational excellence and quality standards
              </p>
            </div>

            {/* Commitment Statement */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Our Commitment to Excellence</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                We continuously strive to exceed accreditation standards and maintain our position as a leading 
                educational institution in Nepal. Our commitment extends beyond compliance to genuine excellence 
                in every aspect of education we provide.
              </p>
              <p className="leading-relaxed opacity-90">
                Regular reviews, continuous professional development, and stakeholder feedback ensure that we 
                not only meet but exceed the expectations set by our accrediting bodies.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Section */}
      <div className="bg-maroon-800 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Registration of Interest</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                Register
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Application of Admission</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                Apply
              </button>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Other Inquiries</h3>
              <button className="bg-white text-maroon-800 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accreditation;