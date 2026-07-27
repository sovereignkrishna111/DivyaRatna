import React from 'react';
import { Building, BookOpen, Microscope, Palette, Music, Trophy, Utensils, Heart, Shield } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../theme/siteSettings';

const Facilities: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAssetUrl } = useSiteSettings();

  const sidebarItems = [
    { id: 'about-us', label: 'About Us', path: '/about' },
    { id: 'mission', label: 'Our Mission', path: '/mission' },
    { id: 'accreditation', label: 'Accreditation', path: '/accreditation' },
    { id: 'strategic-framework', label: 'Strategic Framework', path: '/strategic-framework' },
    { id: 'governance', label: 'Governance', path: '/governance' },
    { id: 'faculty', label: 'Faculty', path: '/faculty' },
    { id: 'facilities', label: 'Facilities', path: '/facilities', active: true },
    { id: 'school-profile', label: 'School Profile', path: '/school-profile' }
  ];

  const facilities = [
    {
      icon: <BookOpen className="h-12 w-12 text-blue-600" />,
      title: "Modern Library & Learning Center",
      description: "State-of-the-art library with over 25,000 books, digital resources, and collaborative study spaces",
      features: ["25,000+ books and periodicals", "Digital database access", "Quiet study areas", "Group collaboration spaces", "Research assistance", "E-learning resources"],
      image: getAssetUrl('facilities_1', 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Microscope className="h-12 w-12 text-green-600" />,
      title: "Advanced Science Laboratories",
      description: "Fully equipped laboratories for Physics, Chemistry, Biology, and Computer Science",
      features: ["Modern equipment and instruments", "Safety protocols and systems", "Individual workstations", "Digital microscopes", "Chemical storage systems", "Interactive whiteboards"],
      image: getAssetUrl('facilities_2', 'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Palette className="h-12 w-12 text-purple-600" />,
      title: "Creative Arts Studios",
      description: "Dedicated spaces for visual arts, crafts, and creative expression with professional equipment",
      features: ["Art supplies and materials", "Pottery and ceramics studio", "Digital art workstations", "Exhibition spaces", "Storage for student work", "Natural lighting"],
      image: getAssetUrl('facilities_3', 'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Music className="h-12 w-12 text-maroon-800" />,
      title: "Music & Performance Hall",
      description: "Professional-grade music rooms and auditorium for performances and cultural events",
      features: ["Concert grand piano", "Sound recording equipment", "Individual practice rooms", "Orchestra and band instruments", "Performance stage", "Acoustic treatment"],
      image: getAssetUrl('facilities_4', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Trophy className="h-12 w-12 text-orange-600" />,
      title: "Sports & Recreation Complex",
      description: "Comprehensive sports facilities including gymnasium, outdoor courts, and fitness center",
      features: ["Multi-purpose gymnasium", "Outdoor basketball courts", "Football field", "Track and field area", "Fitness equipment", "Changing rooms"],
      image: getAssetUrl('facilities_5', 'https://images.pexels.com/photos/163403/box-sport-men-training-163403.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Building className="h-12 w-12 text-teal-600" />,
      title: "Smart Classrooms",
      description: "Technology-integrated classrooms with interactive displays and modern learning tools",
      features: ["Interactive smart boards", "High-speed internet", "Audio-visual systems", "Flexible seating arrangements", "Climate control", "Natural lighting"],
      image: getAssetUrl('facilities_6', 'https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Utensils className="h-12 w-12 text-yellow-600" />,
      title: "Cafeteria & Dining Hall",
      description: "Spacious dining facility serving nutritious meals with modern kitchen equipment",
      features: ["Healthy meal options", "Modern kitchen facilities", "Comfortable seating", "Dietary accommodations", "Food safety standards", "Outdoor dining area"],
      image: getAssetUrl('facilities_7', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    },
    {
      icon: <Heart className="h-12 w-12 text-pink-600" />,
      title: "Health & Wellness Center",
      description: "Comprehensive health facility with qualified medical staff and modern equipment",
      features: ["Full-time school nurse", "Medical examination rooms", "First aid stations", "Health screening equipment", "Counseling services", "Emergency protocols"],
      image: getAssetUrl('facilities_8', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')
    }
  ];

  const campusStats = [
    { number: "15", label: "Acres Campus", description: "Spacious and green environment" },
    { number: "45", label: "Classrooms", description: "Modern and well-equipped" },
    { number: "8", label: "Science Labs", description: "State-of-the-art facilities" },
    { number: "100%", label: "Wi-Fi Coverage", description: "High-speed internet access" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-cover bg-center" style={{ 
        backgroundImage: `url(${getAssetUrl('facilities_hero', 'https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')})` 
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-light text-white tracking-wide">Our Facilities</h1>
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
              <h2 className="text-3xl font-light text-maroon-800 mb-6">World-Class Learning Environment</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                DRESS provides state-of-the-art facilities designed to support comprehensive education and 
                holistic development. Our modern campus features cutting-edge technology, specialized learning 
                spaces, and recreational facilities that create an optimal environment for academic excellence 
                and personal growth.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Every facility is thoughtfully designed with student safety, comfort, and learning effectiveness 
                in mind, ensuring that our students have access to the best resources and environments to 
                support their educational journey.
              </p>
            </div>

            {/* Campus Statistics */}
            <div className="mb-12">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {campusStats.map((stat, index) => (
                  <div key={index} className="bg-maroon-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow">
                    <div className="text-3xl font-bold text-maroon-800 mb-2">{stat.number}</div>
                    <div className="text-maroon-800 font-semibold mb-1">{stat.label}</div>
                    <div className="text-gray-600 text-sm">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Grid */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-maroon-800 mb-8">Our Facilities</h3>
              <div className="space-y-12">
                {facilities.map((facility, index) => (
                  <div key={index} className={`grid lg:grid-cols-2 gap-8 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                    <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                      <div className="relative group">
                        <img 
                          src={facility.image}
                          alt={facility.title}
                          className="rounded-lg shadow-lg w-full h-64 object-cover group-hover:shadow-xl transition-shadow duration-300"
                        />
                        <div className="absolute top-4 left-4 bg-white rounded-full p-3 shadow-lg">
                          {facility.icon}
                        </div>
                      </div>
                    </div>
                    <div className={index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                      <h4 className="text-2xl font-semibold text-maroon-800 mb-4">{facility.title}</h4>
                      <p className="text-gray-700 leading-relaxed mb-6">{facility.description}</p>
                      <div className="space-y-2">
                        <h5 className="font-semibold text-maroon-800 mb-3">Key Features:</h5>
                        <div className="grid md:grid-cols-2 gap-2">
                          {facility.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center">
                              <div className="w-2 h-2 bg-maroon-800 rounded-full mr-3 flex-shrink-0"></div>
                              <span className="text-gray-600 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety and Security */}
            <div className="mb-12">
              <div className="bg-gray-50 p-8 rounded-lg">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-maroon-800 mr-4" />
                  <h3 className="text-2xl font-light text-maroon-800">Safety & Security</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The safety and security of our students is our top priority. Our campus is equipped with 
                  comprehensive security systems and safety protocols to ensure a secure learning environment.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">24/7 Security</h4>
                      <p className="text-gray-600 text-sm">Round-the-clock security personnel and monitoring</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">CCTV Surveillance</h4>
                      <p className="text-gray-600 text-sm">Comprehensive camera coverage throughout campus</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">Access Control</h4>
                      <p className="text-gray-600 text-sm">Controlled entry and visitor management systems</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">Emergency Protocols</h4>
                      <p className="text-gray-600 text-sm">Comprehensive emergency response procedures</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">Fire Safety</h4>
                      <p className="text-gray-600 text-sm">Advanced fire detection and suppression systems</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-maroon-800 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-maroon-800 mb-1">Health Protocols</h4>
                      <p className="text-gray-600 text-sm">Comprehensive health and safety measures</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Development */}
            <div className="bg-maroon-800 text-white p-8 rounded-lg">
              <h3 className="text-2xl font-light mb-6">Continuous Development</h3>
              <p className="text-lg leading-relaxed opacity-90 mb-4">
                We are committed to continuously improving and expanding our facilities to meet the evolving 
                needs of modern education. Our ongoing development plans include new technology integration, 
                sustainable building practices, and enhanced learning environments.
              </p>
              <p className="leading-relaxed opacity-90">
                Future projects include a new STEM center, expanded library facilities, additional sports 
                complexes, and green building initiatives that will further enhance our students' educational experience.
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

export default Facilities;