import React from 'react';
import { Calendar, Users, Globe, BookOpen, Star, TrendingUp } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';
import { usePublicPeopleTotals } from '../hooks/usePublicPeopleTotals';

const SchoolProfile: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();
  const peopleTotals = usePublicPeopleTotals();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities' },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile', active: true }
  ];

  const studentsNumber =
    peopleTotals.students.mode === 'count_only' && typeof peopleTotals.students.total_count === 'number'
      ? String(peopleTotals.students.total_count)
      : '1,245';

  const facultyNumber =
    peopleTotals.teachers.mode === 'count_only' && typeof peopleTotals.teachers.total_count === 'number'
      ? String(peopleTotals.teachers.total_count)
      : '87';

  const schoolStats = [
    { icon: <Calendar className="h-8 w-8 text-blue-600" />, number: "1998", label: "Established", description: "27 years of excellence" },
    { icon: <Users className="h-8 w-8 text-green-600" />, number: studentsNumber, label: "Students", description: "Pre-K through Grade 12" },
    { icon: <BookOpen className="h-8 w-8 text-purple-600" />, number: facultyNumber, label: "Faculty", description: "Qualified educators" },
    { icon: <Globe className="h-8 w-8 text-maroon-800" />, number: "25+", label: "Countries", description: "International community" }
  ];

  const achievements = [
    {
      year: "2024",
      title: "National Excellence Award",
      description: "Recognized as one of the top 10 schools in Nepal for academic excellence and innovation in education.",
      category: "Academic"
    },
    {
      year: "2023",
      title: "International School Certification",
      description: "Achieved Cambridge International School status, offering IGCSE and A-Level programs.",
      category: "International"
    },
    {
      year: "2023",
      title: "STEM Education Leadership",
      description: "Awarded for outstanding implementation of STEM curriculum and student achievements in science competitions.",
      category: "Innovation"
    },
    {
      year: "2022",
      title: "Community Service Recognition",
      description: "Honored for exceptional community service programs and social responsibility initiatives.",
      category: "Community"
    },
    {
      year: "2022",
      title: "Environmental Sustainability Award",
      description: "Recognized for green campus initiatives and environmental education programs.",
      category: "Environment"
    }
  ];

  const programs = [
    {
      level: "Pre-Kindergarten",
      ages: "3-4 years",
      focus: "Play-based learning, social skills development, and early literacy",
      enrollment: "45 students"
    },
    {
      level: "Elementary School",
      ages: "5-10 years (Grades K-5)",
      focus: "Foundation skills in literacy, numeracy, science, and creative arts",
      enrollment: "420 students"
    },
    {
      level: "Middle School",
      ages: "11-13 years (Grades 6-8)",
      focus: "Critical thinking, advanced academics, and leadership development",
      enrollment: "380 students"
    },
    {
      level: "High School",
      ages: "14-18 years (Grades 9-12)",
      focus: "College preparation, advanced placement, and career readiness",
      enrollment: "400 students"
    }
  ];

  const partnerships = [
    { name: "Cambridge International", type: "Curriculum Partner", description: "IGCSE and A-Level programs" },
    { name: "British Council", type: "Educational Partner", description: "Teacher training and development" },
    { name: "UNESCO Associated Schools", type: "Global Network", description: "International education initiatives" },
    { name: "Local Universities", type: "Academic Partners", description: "Dual enrollment and research programs" },
    { name: "Community Organizations", type: "Service Partners", description: "Community service and outreach" },
    { name: "International Schools", type: "Exchange Partners", description: "Student and teacher exchanges" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl(
          'school_profile_hero',
          'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        )})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">School Profile</h1>
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
              <h2 className="text-3xl font-light text-maroon-800 mb-6">DRESS at a Glance</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-r-lg mb-8">
                <p className="text-xl text-gray-800 leading-relaxed font-medium">
                  Divya Ratna English Secondary School (DRESS) is a premier educational institution 
                  established in 1998, dedicated to providing world-class education that prepares students 
                  for success in an increasingly interconnected global society.
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Located in the heart of Kathmandu, Nepal, DRESS serves a diverse community of students 
                from Pre-Kindergarten through Grade 12, offering both national and international curricula 
                to meet the varied needs of our student body.
              </p>
            </div>

            {/* School Statistics */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Key Statistics</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {schoolStats.map((stat, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="flex justify-center mb-4">
                      {stat.icon}
                    </div>
                    <div className="text-3xl font-bold text-maroon-800 mb-2">{stat.number}</div>
                    <div className="text-gray-800 font-semibold mb-1">{stat.label}</div>
                    <div className="text-gray-600 text-sm">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic Programs */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Academic Programs</h3>
              <div className="space-y-6">
                {programs.map((program, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <h4 className="text-xl font-semibold text-maroon-800">{program.level}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{program.ages}</span>
                        <span>•</span>
                        <span>{program.enrollment}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{program.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Recent Achievements</h3>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="border-l-4 border-maroon-800 pl-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-maroon-800">{achievement.title}</h4>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          achievement.category === 'Academic' ? 'bg-blue-100 text-blue-800' :
                          achievement.category === 'International' ? 'bg-green-100 text-green-800' :
                          achievement.category === 'Innovation' ? 'bg-purple-100 text-purple-800' :
                          achievement.category === 'Community' ? 'bg-orange-100 text-orange-800' :
                          'bg-teal-100 text-teal-800'
                        }`}>
                          {achievement.category}
                        </span>
                        <span className="text-gray-500 font-medium">{achievement.year}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Partnerships */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Partnerships & Affiliations</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {partnerships.map((partnership, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-maroon-800">{partnership.name}</h4>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">{partnership.type}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{partnership.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* School Image */}
            <div className="mb-12">
              <img 
                src={getAssetUrl(
                  'school_profile_image',
                  'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
                )}
                alt="DRESS Campus"
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
              <p className="text-center text-gray-600 text-sm mt-4">
                DRESS campus providing a modern and inspiring learning environment
              </p>
            </div>

            {/* Future Vision */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Looking Forward</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                As we continue to grow and evolve, DRESS remains committed to our founding principles 
                of academic excellence, character development, and global citizenship. Our strategic 
                vision for the future includes expanding our international programs, enhancing technology 
                integration, and strengthening our community partnerships.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Continuous Growth</h4>
                  <p className="text-sm opacity-80">Expanding programs and opportunities</p>
                </div>
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Excellence</h4>
                  <p className="text-sm opacity-80">Maintaining highest standards</p>
                </div>
                <div className="text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-90" />
                  <h4 className="font-semibold mb-1">Global Impact</h4>
                  <p className="text-sm opacity-80">Preparing world-ready graduates</p>
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

export default SchoolProfile;