import React from 'react';
import { Target, TrendingUp, Users, Lightbulb, Globe, BookOpen, Award, Heart } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';

const StrategicFramework: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework', active: true },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const strategicPillars = [
    {
      icon: <BookOpen className="h-12 w-12 text-blue-600" />,
      title: "Academic Excellence",
      description: "Delivering world-class education through innovative curriculum and teaching methodologies",
      objectives: [
        "Implement cutting-edge pedagogical approaches",
        "Achieve 98% university acceptance rate",
        "Maintain top 5% ranking in national assessments",
        "Expand Advanced Placement and honors programs"
      ],
      timeline: "2024-2027"
    },
    {
      icon: <Users className="h-12 w-12 text-green-600" />,
      title: "Community Engagement",
      description: "Building strong partnerships with families, alumni, and local community",
      objectives: [
        "Increase parent participation by 40%",
        "Establish 10 new community partnerships",
        "Launch comprehensive alumni network",
        "Implement community service requirements"
      ],
      timeline: "2024-2026"
    },
    {
      icon: <Globe className="h-12 w-12 text-purple-600" />,
      title: "Global Citizenship",
      description: "Preparing students for success in an interconnected world",
      objectives: [
        "Establish international exchange programs",
        "Integrate global perspectives in curriculum",
        "Achieve international school certification",
        "Develop multilingual competencies"
      ],
      timeline: "2024-2028"
    },
    {
      icon: <Lightbulb className="h-12 w-12 text-orange-600" />,
      title: "Innovation & Technology",
      description: "Leveraging technology to enhance learning and operational efficiency",
      objectives: [
        "Implement 1:1 device program",
        "Upgrade digital infrastructure",
        "Integrate AI and emerging technologies",
        "Develop digital literacy programs"
      ],
      timeline: "2024-2025"
    }
  ];

  const keyMetrics = [
    { metric: "Student Achievement", target: "Top 5% Nationally", current: "Top 10%", progress: 75 },
    { metric: "University Acceptance", target: "98%", current: "95%", progress: 90 },
    { metric: "Faculty Retention", target: "95%", current: "88%", progress: 85 },
    { metric: "Parent Satisfaction", target: "98%", current: "92%", progress: 88 },
    { metric: "Community Partnerships", target: "25", current: "15", progress: 60 },
    { metric: "Technology Integration", target: "100%", current: "70%", progress: 70 }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl(
          'strategic_framework_hero',
          'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        )})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">Strategic Framework</h1>
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
              <h2 className="text-3xl font-light text-maroon-800 mb-6">Strategic Vision 2024-2028</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-lg mb-8">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  Our strategic framework guides DRESS toward becoming a world-class educational institution 
                  that prepares students for success in the 21st century while maintaining our commitment 
                  to academic excellence, character development, and global citizenship.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                This comprehensive plan outlines our priorities, objectives, and measurable outcomes for the 
                next five years, ensuring sustainable growth and continuous improvement in all aspects of 
                our educational mission.
              </p>
            </div>

            {/* Strategic Pillars */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Strategic Pillars</h3>
              <div className="space-y-8">
                {strategicPillars.map((pillar, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow">
                    <div className="flex items-start mb-6">
                      <div className="flex-shrink-0 mr-6">
                        {pillar.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-2xl font-semibold text-maroon-800">{pillar.title}</h4>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                            {pillar.timeline}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed text-lg">{pillar.description}</p>
                        <div>
                          <h5 className="font-semibold text-maroon-800 mb-3">Key Objectives:</h5>
                          <ul className="space-y-2">
                            {pillar.objectives.map((objective, objIndex) => (
                              <li key={objIndex} className="flex items-start">
                                <Target className="h-4 w-4 text-maroon-800 mt-1 mr-3 flex-shrink-0" />
                                <span className="text-gray-700">{objective}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Key Performance Metrics</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-maroon-800">{metric.metric}</h4>
                      <span className="text-sm text-gray-600">{metric.progress}%</span>
                    </div>
                    <div className="mb-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-maroon-800 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metric.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current: {metric.current}</span>
                      <span className="text-gray-800 font-medium">Target: {metric.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Timeline */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Implementation Timeline</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-maroon-800 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800">Phase 1: Foundation (2024-2025)</h4>
                      <p className="text-gray-700">Infrastructure development, technology integration, and curriculum enhancement</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800">Phase 2: Expansion (2025-2026)</h4>
                      <p className="text-gray-700">Community partnerships, international programs, and faculty development</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded-full mr-4"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800">Phase 3: Excellence (2026-2028)</h4>
                      <p className="text-gray-700">Global recognition, innovation leadership, and sustainable growth</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Measures */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Measuring Success</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                Our strategic framework success will be measured through comprehensive assessment of student 
                outcomes, stakeholder satisfaction, and institutional recognition. Regular reviews and 
                adjustments ensure we remain on track to achieve our ambitious goals.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Continuous Improvement</h4>
                  <p className="text-sm opacity-80">Regular assessment and refinement</p>
                </div>
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Recognition</h4>
                  <p className="text-sm opacity-80">National and international awards</p>
                </div>
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Stakeholder Satisfaction</h4>
                  <p className="text-sm opacity-80">Students, parents, and community</p>
                </div>
              </div>
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

export default StrategicFramework;