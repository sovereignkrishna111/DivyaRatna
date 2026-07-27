import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, FileText, Users, CheckCircle, Clock, Award, Phone, Mail, MapPin, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type GradeKey = 'elementary' | 'middle' | 'high';

type AdmissionsGradeRequirementRow = {
  id: string;
  grade_key: GradeKey;
  title: string;
  requirements: string[];
  annual_tuition: string | null;
  application_deadline: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type AdmissionsImportantDateRow = {
  id: string;
  event: string;
  date: string;
  type: 'info' | 'deadline' | 'success' | 'important';
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const Admission: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('elementary');
  const [reqLoading, setReqLoading] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [gradeRows, setGradeRows] = useState<AdmissionsGradeRequirementRow[]>([]);
  const [dateRows, setDateRows] = useState<AdmissionsImportantDateRow[]>([]);

  const admissionProcess = [
    {
      step: 1,
      title: "Submit Application",
      description: "Complete and submit the online application form with required documents",
      timeline: "Rolling admissions",
      icon: <FileText className="h-8 w-8 text-blue-600" />
    },
    {
      step: 2,
      title: "Document Review",
      description: "Our admissions team reviews all submitted documents and transcripts",
      timeline: "1-2 weeks",
      icon: <CheckCircle className="h-8 w-8 text-green-600" />
    },
    {
      step: 3,
      title: "Assessment & Interview",
      description: "Student assessment and family interview with admissions committee",
      timeline: "2-3 weeks",
      icon: <Users className="h-8 w-8 text-purple-600" />
    },
    {
      step: 4,
      title: "Admission Decision",
      description: "Receive admission decision and enrollment information",
      timeline: "1 week",
      icon: <Award className="h-8 w-8 text-maroon-800" />
    }
  ];

  const fetchGradeRequirements = async () => {
    setReqLoading(true);
    try {
      const { data, error } = await supabase
        .from('admissions_grade_requirements')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error || !data) {
        setGradeRows([]);
        return;
      }
      setGradeRows(data as AdmissionsGradeRequirementRow[]);
    } finally {
      setReqLoading(false);
    }
  };

  const fetchImportantDates = async () => {
    setDateLoading(true);
    try {
      const { data, error } = await supabase
        .from('admissions_important_dates')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('date', { ascending: true });
      if (error || !data) {
        setDateRows([]);
        return;
      }
      setDateRows(data as AdmissionsImportantDateRow[]);
    } finally {
      setDateLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeRequirements();
    fetchImportantDates();

    const ch = supabase
      .channel('realtime-public-admissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admissions_grade_requirements' }, fetchGradeRequirements)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admissions_important_dates' }, fetchImportantDates)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const gradeRequirements = useMemo(() => {
    const byKey = new Map<GradeKey, AdmissionsGradeRequirementRow>();
    (gradeRows || []).forEach((r) => {
      if (r?.grade_key) byKey.set(r.grade_key, r);
    });
    return {
      elementary: byKey.get('elementary'),
      middle: byKey.get('middle'),
      high: byKey.get('high'),
    } as const;
  }, [gradeRows]);

  const selectedRequirement = gradeRequirements[selectedGrade as GradeKey];

  const formatLongDate = (value: string | null | undefined) => {
    if (!value) return '';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const importantDates = useMemo(() => {
    return (dateRows || []).map((r) => ({
      id: r.id,
      date: formatLongDate(r.date),
      event: r.event,
      type: r.type,
    }));
  }, [dateRows]);

  const scholarships = [
    {
      name: "Academic Excellence Scholarship",
      amount: "Up to 50% tuition",
      criteria: "Outstanding academic performance and leadership potential",
      deadline: "February 15, 2025"
    },
    {
      name: "Need-Based Financial Aid",
      amount: "Varies based on need",
      criteria: "Demonstrated financial need and academic merit",
      deadline: "March 1, 2025"
    },
    {
      name: "Sibling Discount",
      amount: "10% for second child",
      criteria: "Multiple children enrolled simultaneously",
      deadline: "Ongoing"
    },
    {
      name: "Alumni Legacy Scholarship",
      amount: "15% tuition discount",
      criteria: "Children of DRESS alumni",
      deadline: "Ongoing"
    }
  ];

  const getDateTypeColor = (type: string) => {
    switch (type) {
      case 'deadline': return 'bg-maroon-100 text-maroon-800 border-maroon-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'important': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">Admissions</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              Join the DRESS community and embark on an exceptional educational journey
            </p>
          </div>
        </div>
      </div>

      {/* Admission Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Admission Process</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined admission process is designed to identify students who will thrive in our academic environment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {admissionProcess.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-gray-200 transition-colors">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-maroon-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-maroon-800 mb-3">{step.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{step.description}</p>
                <div className="text-sm text-maroon-600 font-medium">{step.timeline}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grade-Specific Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Admission Requirements</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Requirements vary by grade level to ensure age-appropriate assessment and preparation
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <button
                onClick={() => setSelectedGrade('elementary')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedGrade === 'elementary' 
                    ? 'bg-maroon-700 text-white' 
                    : 'text-gray-600 hover:text-maroon-700'
                }`}
              >
                Elementary
              </button>
              <button
                onClick={() => setSelectedGrade('middle')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedGrade === 'middle' 
                    ? 'bg-maroon-700 text-white' 
                    : 'text-gray-600 hover:text-maroon-700'
                }`}
              >
                Middle School
              </button>
              <button
                onClick={() => setSelectedGrade('high')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedGrade === 'high' 
                    ? 'bg-maroon-700 text-white' 
                    : 'text-gray-600 hover:text-maroon-700'
                }`}
              >
                High School
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            {reqLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : !selectedRequirement ? (
              <div className="text-sm text-gray-500">No requirements configured yet.</div>
            ) : (
              <>
                <h3 className="text-2xl font-semibold text-maroon-800 mb-6">{selectedRequirement.title}</h3>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-maroon-800 mb-4">Required Documents:</h4>
                <ul className="space-y-3">
                  {(selectedRequirement.requirements || []).map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-maroon-800 mb-2">Annual Tuition</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedRequirement.annual_tuition || '-'}
                  </p>
                </div>
                
                <div className="bg-maroon-50 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-maroon-800 mb-2">Application Deadline</h4>
                  <p className="text-xl font-bold text-maroon-800">
                    {formatLongDate(selectedRequirement.application_deadline) || '-'}
                  </p>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Important Dates</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mark your calendar with these key admission dates and deadlines
            </p>
          </div>

          {dateLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : importantDates.length === 0 ? (
            <div className="text-sm text-gray-500">No dates configured yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {importantDates.map((item) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <Calendar className="h-6 w-6 text-maroon-600" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDateTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-maroon-800 mb-2">{item.event}</h3>
                <p className="text-gray-600 font-medium">{item.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Scholarships */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Scholarships & Financial Aid</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe exceptional education should be accessible to deserving students regardless of financial circumstances
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {scholarships.map((scholarship, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-gold-600 mr-3" />
                  <h3 className="text-xl font-semibold text-maroon-800">{scholarship.name}</h3>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-green-600">{scholarship.amount}</span>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">{scholarship.criteria}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Deadline: {scholarship.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">Admissions Office</h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our admissions team is here to guide you through every step of the application process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="opacity-90">+977 1-5370482</p>
              <p className="opacity-90">+977 1-5370483</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="opacity-90">admissions@divyaratna.edu.np</p>
              <p className="opacity-90">info@divyaratna.edu.np</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full p-6 w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="opacity-90">Rabi Bhawan, Kathmandu</p>
              <p className="opacity-90">Nepal</p>
            </div>
          </div>

          <div className="text-center">
            <button className="bg-white text-maroon-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors mr-4">
              <Download className="h-5 w-5 inline mr-2" />
              Download Application Form
            </button>
            <button
              onClick={() => navigate('/contact#contact-form')}
              className="border border-white text-white hover:bg-white hover:text-maroon-800 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Schedule Campus Visit
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Admission;