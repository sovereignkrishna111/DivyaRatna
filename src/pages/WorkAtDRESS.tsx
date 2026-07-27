import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Heart, Globe, BookOpen, Clock, MapPin, Mail, Phone, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../theme/siteSettings';

type CareersSettingsRow = {
  id: string;
  hero_title: string;
  hero_subtitle: string;
};

type JobOpeningRow = {
  id: string;
  title: string;
  department: string;
  type: string;
  location: string | null;
  experience: string | null;
  deadline: string | null;
  description: string | null;
  requirements: string[] | null;
  responsibilities: string[] | null;
  published: boolean;
  sort_order: number;
};

const WorkAtDRESS: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const { getAssetUrl } = useSiteSettings();
  const heroImage = getAssetUrl('work_at_dress_hero');

  const [settings, setSettings] = useState<CareersSettingsRow | null>(null);
  const [jobs, setJobs] = useState<JobOpeningRow[]>([]);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('careers_settings')
      .select('id, hero_title, hero_subtitle')
      .eq('id', 'default')
      .limit(1);
    if (error) return;
    const row = Array.isArray(data) && data.length ? (data[0] as CareersSettingsRow) : null;
    setSettings(row);
  };

  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from('job_openings')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('deadline', { ascending: true, nullsFirst: false });
    if (error || !data) {
      setJobs([]);
      return;
    }
    setJobs(data as JobOpeningRow[]);
  };

  useEffect(() => {
    fetchSettings();
    fetchJobs();

    const ch = supabase
      .channel('realtime-work-at-dress')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'careers_settings' }, fetchSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_openings' }, fetchJobs)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const benefits = [
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Competitive Compensation",
      description: "Attractive salary packages with performance-based incentives and annual reviews"
    },
    {
      icon: <Heart className="h-8 w-8 text-maroon-800" />,
      title: "Health & Wellness",
      description: "Comprehensive health insurance, wellness programs, and mental health support"
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-600" />,
      title: "Professional Development",
      description: "Continuous learning opportunities, conference attendance, and skill development programs"
    },
    {
      icon: <Clock className="h-8 w-8 text-purple-600" />,
      title: "Work-Life Balance",
      description: "Flexible working arrangements, generous leave policies, and family-friendly environment"
    },
    {
      icon: <Users className="h-8 w-8 text-orange-600" />,
      title: "Collaborative Culture",
      description: "Supportive team environment with opportunities for leadership and innovation"
    },
    {
      icon: <Globe className="h-8 w-8 text-teal-600" />,
      title: "Global Opportunities",
      description: "International exchange programs, global partnerships, and cultural diversity"
    }
  ];

  const departments = useMemo(() => {
    const list = Array.from(new Set(jobs.map((j) => (j.department || '').trim()).filter(Boolean))).sort();
    return [{ id: 'all', label: 'All Departments' }, ...list.map((d) => ({ id: d, label: d }))];
  }, [jobs]);

  const filteredJobs = selectedDepartment === 'all'
    ? jobs
    : jobs.filter(job => job.department === selectedDepartment);

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      position: "Mathematics Teacher",
      quote: "Working at DRESS has been incredibly rewarding. The supportive environment and commitment to excellence make it a wonderful place to grow professionally.",
      image: getAssetUrl(
        'work_at_dress_testimonial_1',
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      ),
      years: "5 years at DRESS"
    },
    {
      name: "Michael Chen",
      position: "Science Department Head",
      quote: "The collaborative culture and focus on innovation allow me to implement creative teaching methods and make a real impact on student learning.",
      image: getAssetUrl(
        'work_at_dress_testimonial_2',
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      ),
      years: "8 years at DRESS"
    },
    {
      name: "Priya Sharma",
      position: "Student Counselor",
      quote: "DRESS truly cares about both student and staff well-being. The professional development opportunities have helped me advance my career significantly.",
      image: getAssetUrl(
        'work_at_dress_testimonial_3',
        'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      ),
      years: "3 years at DRESS"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div
        className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600"
        style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">{settings?.hero_title || 'Work at DRESS'}</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              {settings?.hero_subtitle || 'Join our dedicated team of educators and professionals committed to excellence in education'}
            </p>
          </div>
        </div>
      </div>

      {/* Why Work at DRESS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Why Choose DRESS?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the benefits and opportunities that make DRESS an exceptional place to build your career
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="flex justify-center mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-maroon-800 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Current Openings</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore exciting career opportunities and join our mission to provide exceptional education
            </p>
          </div>

          {/* Department Filter */}
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg p-2 shadow-md">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setSelectedDepartment(dept.id)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    selectedDepartment === dept.id 
                      ? 'bg-maroon-700 text-white' 
                      : 'text-gray-600 hover:text-maroon-700'
                  }`}
                >
                  {dept.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-8">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <h3 className="text-2xl font-semibold text-maroon-800">{job.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {job.department}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {job.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-6 leading-relaxed">{job.description || ''}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-maroon-800 mb-3">Requirements:</h4>
                        <ul className="space-y-2">
                          {(job.requirements || []).map((req, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-maroon-800 mb-3">Responsibilities:</h4>
                        <ul className="space-y-2">
                          {(job.responsibilities || []).map((resp, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-600 text-sm">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="space-y-4 mb-6">
                        <div className="flex items-center">
                          <MapPin className="h-5 w-5 text-maroon-600 mr-3" />
                          <span className="text-gray-700">{job.location || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-maroon-600 mr-3" />
                          <span className="text-gray-700">{job.experience || '-'}</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-5 w-5 text-maroon-600 mr-3" />
                          <span className="text-gray-700">Deadline: {job.deadline || '-'}</span>
                        </div>
                      </div>
                      
                      <Link
                        to="/contact#contact-form"
                        className="block text-center w-full bg-maroon-700 hover:bg-maroon-800 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredJobs.length === 0 && (
              <div className="text-sm text-gray-500 text-center">No openings right now.</div>
            )}
          </div>
        </div>
      </section>

      {/* Employee Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">What Our Team Says</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our dedicated staff members about their experience working at DRESS
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
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
                    <p className="text-gray-600 text-sm">{testimonial.position}</p>
                    <p className="text-gray-500 text-xs">{testimonial.years}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Application Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow these simple steps to join our team
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-maroon-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-maroon-800 mb-2">Browse Positions</h3>
              <p className="text-gray-600 text-sm">Explore our current job openings and find the perfect match for your skills</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-maroon-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-maroon-800 mb-2">Submit Application</h3>
              <p className="text-gray-600 text-sm">Complete the online application form with your resume and cover letter</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-maroon-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-maroon-800 mb-2">Interview Process</h3>
              <p className="text-gray-600 text-sm">Participate in our comprehensive interview process with department heads</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-maroon-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-maroon-800 mb-2">Join Our Team</h3>
              <p className="text-gray-600 text-sm">Welcome to DRESS! Begin your journey with our comprehensive onboarding program</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact HR */}
      <section className="py-20 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Have Questions?</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our Human Resources team is here to help you with any questions about careers at DRESS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="opacity-90">+977 1-5370482</p>
              <p className="opacity-90">Ext: 205 (HR Department)</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="opacity-90">careers@divyaratna.edu.np</p>
              <p className="opacity-90">hr@divyaratna.edu.np</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="opacity-90">HR Department</p>
              <p className="opacity-90">Rabi Bhawan, Kathmandu</p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-white text-maroon-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors mr-4">
              <Upload className="h-5 w-5 inline mr-2" />
              Submit General Application
            </button>
            <button className="border border-white text-white hover:bg-white hover:text-maroon-800 px-8 py-3 rounded-lg font-medium transition-colors">
              Schedule HR Meeting
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkAtDRESS;