import React from 'react';
import { Users, Shield, Scale, FileText, Award, CheckCircle, UserCheck, Building } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';

const Governance: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance', active: true },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const boardMembers = [
    {
      name: "Dr. Rajesh Sharma",
      position: "Chairman, Board of Directors",
      background: "Former Education Secretary, 25+ years in educational administration",
      image: getAssetUrl(
        'governance_member_1',
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      )
    },
    {
      name: "Ms. Priya Thapa",
      position: "Vice Chairman",
      background: "Educational consultant and former principal with international experience",
      image: getAssetUrl(
        'governance_member_2',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      )
    },
    {
      name: "Mr. Suresh Karki",
      position: "Treasurer",
      background: "Chartered Accountant with expertise in educational finance management",
      image: getAssetUrl(
        'governance_member_3',
        'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      )
    },
    {
      name: "Dr. Anita Gurung",
      position: "Academic Director",
      background: "PhD in Education, curriculum development specialist",
      image: getAssetUrl(
        'governance_member_4',
        'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      )
    }
  ];

  const governanceStructure = [
    {
      icon: <Building className="h-8 w-8 text-blue-600" />,
      title: "Board of Directors",
      description: "Strategic oversight and policy development",
      responsibilities: [
        "Strategic planning and vision setting",
        "Policy formulation and approval",
        "Financial oversight and budget approval",
        "Principal appointment and evaluation"
      ]
    },
    {
      icon: <UserCheck className="h-8 w-8 text-green-600" />,
      title: "Executive Leadership",
      description: "Day-to-day operational management",
      responsibilities: [
        "Implementation of board policies",
        "Academic program management",
        "Staff supervision and development",
        "Student affairs and discipline"
      ]
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Academic Council",
      description: "Curriculum and academic standards",
      responsibilities: [
        "Curriculum development and review",
        "Academic policy recommendations",
        "Faculty development programs",
        "Student assessment standards"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-maroon-800" />,
      title: "Advisory Committees",
      description: "Specialized guidance and expertise",
      responsibilities: [
        "Parent and community input",
        "Alumni engagement and support",
        "Industry partnerships",
        "Special program oversight"
      ]
    }
  ];

  const policies = [
    { icon: <FileText className="h-6 w-6 text-maroon-800" />, title: "Academic Policies", description: "Curriculum standards, assessment, and grading" },
    { icon: <Users className="h-6 w-6 text-maroon-800" />, title: "Student Conduct", description: "Behavior expectations and disciplinary procedures" },
    { icon: <Shield className="h-6 w-6 text-maroon-800" />, title: "Safety & Security", description: "Campus safety protocols and emergency procedures" },
    { icon: <Scale className="h-6 w-6 text-maroon-800" />, title: "Anti-Discrimination", description: "Equal opportunity and harassment prevention" },
    { icon: <CheckCircle className="h-6 w-6 text-maroon-800" />, title: "Quality Assurance", description: "Continuous improvement and evaluation" },
    { icon: <Award className="h-6 w-6 text-maroon-800" />, title: "Ethics & Integrity", description: "Professional conduct and ethical standards" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl(
          'governance_hero',
          'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        )})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">Governance</h1>
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
              <h2 className="text-3xl font-light text-maroon-800 mb-6">Governance Structure</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                DRESS operates under a comprehensive governance framework that ensures transparency, 
                accountability, and effective decision-making. Our governance structure involves multiple 
                stakeholders working collaboratively to maintain the highest standards of educational excellence.
              </p>
              <p className="text-gray-700 leading-relaxed">
                The school's governance model promotes shared responsibility, ethical leadership, and 
                continuous improvement while maintaining focus on our core mission of providing exceptional 
                education to our students.
              </p>
            </div>

            {/* Board of Directors */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Board of Directors</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {boardMembers.map((member, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start">
                      <img 
                        src={member.image}
                        alt={member.name}
                        className="w-20 h-20 rounded-full object-cover mr-4 flex-shrink-0"
                      />
                      <div>
                        <h4 className="text-xl font-semibold text-maroon-800 mb-1">{member.name}</h4>
                        <p className="text-maroon-800 font-medium mb-3">{member.position}</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{member.background}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governance Structure */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Organizational Structure</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {governanceStructure.map((structure, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-4">
                      {structure.icon}
                      <h4 className="text-xl font-semibold text-maroon-800 ml-3">{structure.title}</h4>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{structure.description}</p>
                    <div>
                      <h5 className="font-semibold text-maroon-800 mb-2">Key Responsibilities:</h5>
                      <ul className="space-y-1">
                        {structure.responsibilities.map((responsibility, respIndex) => (
                          <li key={respIndex} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-gray-600 text-sm">{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies and Procedures */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Policies & Procedures</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map((policy, index) => (
                  <div key={index} className="flex items-start p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 mr-4">
                      {policy.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-2">{policy.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{policy.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transparency and Accountability */}
            <div className="mb-12">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-lg">
                <h3 className="text-2xl font-light text-maroon-800 mb-6">Transparency & Accountability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  DRESS is committed to maintaining the highest standards of transparency and accountability 
                  in all our operations. We regularly publish annual reports, financial statements, and 
                  performance metrics to keep our stakeholders informed.
                </p>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-maroon-800 mb-2">Regular Reporting</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Annual performance reports</li>
                      <li>• Financial transparency statements</li>
                      <li>• Board meeting minutes (public portions)</li>
                      <li>• Policy updates and changes</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-maroon-800 mb-2">Stakeholder Engagement</h4>
                    <ul className="space-y-1 text-gray-600 text-sm">
                      <li>• Parent feedback sessions</li>
                      <li>• Student voice committees</li>
                      <li>• Community advisory meetings</li>
                      <li>• Alumni input opportunities</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Commitment Statement */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Our Governance Commitment</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                We are committed to maintaining the highest standards of governance, ensuring that every 
                decision is made in the best interest of our students and the broader school community. 
                Our governance framework promotes ethical leadership, fiscal responsibility, and educational excellence.
              </p>
              <p className="leading-relaxed opacity-90">
                Through transparent processes, stakeholder engagement, and continuous improvement, we strive 
                to be a model of effective educational governance that serves as an example for other institutions.
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

export default Governance;