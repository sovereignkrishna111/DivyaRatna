import React from 'react';
import { Award, Users, BookOpen, Globe, Star, Heart, Trophy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';
import { SiteLogoIcon } from '../components/SiteLogo';

const Faculty: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty', active: true },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const facultyMembers = [
    {
      name: "Dr. Sarah Johnson",
      position: "Principal",
      department: "Administration",
      qualifications: "PhD in Educational Leadership, M.Ed in Curriculum Development",
      experience: "15+ years",
      specialization: "Educational Leadership, Curriculum Innovation",
      image: getAssetUrl('faculty_member_1', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      name: "Mr. Rajesh Sharma",
      position: "Head of Mathematics",
      department: "Mathematics",
      qualifications: "M.Sc Mathematics, B.Ed, Advanced Diploma in Educational Technology",
      experience: "12+ years",
      specialization: "Advanced Mathematics, STEM Education",
      image: getAssetUrl('faculty_member_2', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      name: "Ms. Priya Thapa",
      position: "English Department Head",
      department: "Languages",
      qualifications: "M.A English Literature, TESOL Certification, Cambridge CELTA",
      experience: "10+ years",
      specialization: "Literature, Creative Writing, ESL",
      image: getAssetUrl('faculty_member_3', 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      name: "Dr. Michael Chen",
      position: "Science Coordinator",
      department: "Sciences",
      qualifications: "PhD in Chemistry, M.Sc Physics, Science Education Diploma",
      experience: "14+ years",
      specialization: "Chemistry, Physics, Laboratory Sciences",
      image: getAssetUrl('faculty_member_4', 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      name: "Ms. Anita Gurung",
      position: "Social Studies Head",
      department: "Social Sciences",
      qualifications: "M.A History, M.Ed Social Studies, International Relations Certificate",
      experience: "11+ years",
      specialization: "History, Geography, Global Studies",
      image: getAssetUrl('faculty_member_5', 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      name: "Mr. David Wilson",
      position: "Arts & Music Director",
      department: "Creative Arts",
      qualifications: "M.F.A Visual Arts, Music Education Degree, Arts Therapy Certificate",
      experience: "9+ years",
      specialization: "Visual Arts, Music, Creative Expression",
      image: getAssetUrl('faculty_member_6', 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    }
  ];

  const facultyStats = [
    { icon: <Users className="h-8 w-8 text-blue-600" />, number: "87", label: "Total Faculty Members" },
    { icon: <SiteLogoIcon className="h-8 w-8" alt="Logo" />, number: "95%", label: "Advanced Degrees" },
    { icon: <Award className="h-8 w-8 text-purple-600" />, number: "12", label: "Average Years Experience" },
    { icon: <Globe className="h-8 w-8 text-maroon-800" />, number: "15", label: "Countries Represented" }
  ];

  const professionalDevelopment = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-600" />,
      title: "Continuous Learning",
      description: "Regular workshops, seminars, and training programs to stay current with educational best practices",
      programs: ["Monthly professional development sessions", "Summer training institutes", "Online certification courses", "Peer observation and feedback"]
    },
    {
      icon: <Globe className="h-8 w-8 text-green-600" />,
      title: "International Exposure",
      description: "Opportunities for global learning and cultural exchange to bring world-class perspectives",
      programs: ["International conference participation", "Teacher exchange programs", "Global education partnerships", "Cross-cultural training workshops"]
    },
    {
      icon: <Trophy className="h-8 w-8 text-purple-600" />,
      title: "Recognition & Awards",
      description: "Celebrating excellence in teaching and acknowledging outstanding contributions to education",
      programs: ["Teacher of the Year awards", "Innovation in education recognition", "Research publication support", "Professional achievement celebrations"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl('faculty_hero', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">Our Faculty</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
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
            </div>
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
              <h2 className="text-3xl font-light text-maroon-800 mb-6">Excellence in Teaching</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Our faculty represents the heart of DRESS, bringing together passionate educators from diverse 
                backgrounds who are committed to inspiring and nurturing every student. With advanced qualifications, 
                extensive experience, and a dedication to continuous learning, our teachers create an environment 
                where academic excellence and personal growth flourish.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Each faculty member is carefully selected not only for their subject expertise but also for their 
                ability to connect with students, foster critical thinking, and contribute to our vibrant learning community.
              </p>
            </div>

            {/* Faculty Statistics */}
            <div className="mb-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {facultyStats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-maroon-800 mb-2">{stat.number}</div>
                    <div className="text-gray-600 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Faculty */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Meet Our Leadership Team</h3>
              <div className="grid md:grid-cols-2 gap-8">
                {facultyMembers.map((faculty, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start mb-4">
                      <img 
                        src={faculty.image}
                        alt={faculty.name}
                        className="w-20 h-20 rounded-full object-cover mr-4 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-maroon-800 mb-1">{faculty.name}</h4>
                        <p className="text-maroon-800 font-medium mb-1">{faculty.position}</p>
                        <p className="text-gray-600 text-sm mb-2">{faculty.department}</p>
                        <p className="text-gray-500 text-xs">{faculty.experience} experience</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h5 className="font-semibold text-maroon-800 text-sm">Qualifications:</h5>
                        <p className="text-gray-600 text-sm">{faculty.qualifications}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-maroon-800 text-sm">Specialization:</h5>
                        <p className="text-gray-600 text-sm">{faculty.specialization}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Development */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Professional Development</h3>
              <div className="space-y-8">
                {professionalDevelopment.map((program, index) => (
                  <div key={index} className="bg-gray-50 p-8 rounded-lg">
                    <div className="flex items-start mb-6">
                      <div className="flex-shrink-0 mr-6">
                        {program.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-maroon-800 mb-3">{program.title}</h4>
                        <p className="text-gray-700 mb-4 leading-relaxed">{program.description}</p>
                        <div className="grid md:grid-cols-2 gap-3">
                          {program.programs.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center">
                              <Star className="h-4 w-4 text-maroon-800 mr-2 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Image */}
            <div className="mb-12">
              <img 
                src={getAssetUrl('faculty_image', 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')}
                alt="Faculty collaboration"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <p className="text-center text-gray-600 text-sm mt-4">
                Our faculty working together to create innovative learning experiences
              </p>
            </div>

            {/* Faculty Excellence */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Commitment to Excellence</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                Our faculty members are more than teachers – they are mentors, innovators, and lifelong learners 
                who inspire students to reach their full potential. Through their dedication, expertise, and 
                passion for education, they create transformative learning experiences that prepare students 
                for success in an ever-changing world.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Passionate Teaching</h4>
                  <p className="text-sm opacity-80">Dedicated to student success</p>
                </div>
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Continuous Learning</h4>
                  <p className="text-sm opacity-80">Always growing and improving</p>
                </div>
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Collaborative Spirit</h4>
                  <p className="text-sm opacity-80">Working together for excellence</p>
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

export default Faculty;