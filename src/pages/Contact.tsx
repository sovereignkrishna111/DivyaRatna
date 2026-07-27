import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, User, MessageSquare, Building, Car, Heart, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ContactSettings = {
  hero_title: string;
  hero_subtitle: string;
  intro_title: string;
  intro_subtitle: string;
  map_title: string;
  map_embed_url: string;
  map_directions_url: string;
  emergency_title: string;
  emergency_text: string;
  emergency_hotline: string;
  emergency_note: string;
  department_section_title: string;
  department_section_subtitle: string;
};

type ContactInfoCard = {
  id?: string;
  icon: React.ReactNode;
  title: string;
  details: string[];
};

type ContactDepartment = {
  id?: string;
  slug: string;
  icon: React.ReactNode;
  name: string;
  contact: string;
  phone: string;
  description: string;
};

const DEFAULT_SETTINGS: ContactSettings = {
  hero_title: 'Contact Us',
  hero_subtitle: 'Get in touch with us for any questions, concerns, or information about DRESS',
  intro_title: 'Get in Touch',
  intro_subtitle: "We're here to help and answer any questions you might have about our school and programs",
  map_title: 'Find Us',
  map_embed_url:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2073.2783493966795!2d87.8873558011278!3d26.628661440644372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e5bd04cff5ea19%3A0x8ec95d0959b8acd7!2sJhapa%20Marigold%20Secondary%20English%20School!5e0!3m2!1sen!2snp!4v1768044637823!5m2!1sen!2snp',
  map_directions_url: 'https://www.google.com/maps/search/?api=1&query=Jhapa%20Marigold%20Secondary%20English%20School',
  emergency_title: 'Emergency Contact',
  emergency_text: 'For urgent matters outside office hours:',
  emergency_hotline: '+977 1-5370484',
  emergency_note: 'Available 24/7 for student emergencies',
  department_section_title: 'Department Contacts',
  department_section_subtitle: 'Connect directly with specific departments for specialized assistance',
};

const DEFAULT_CONTACT_INFO: ContactInfoCard[] = [
  {
    icon: <Phone className="h-8 w-8 text-maroon-600" />,
    title: 'Phone Numbers',
    details: ['Main Office: +977 1-5370482', 'Admissions: +977 1-5370483', 'Emergency: +977 1-5370484'],
  },
  {
    icon: <Mail className="h-8 w-8 text-maroon-600" />,
    title: 'Email Addresses',
    details: ['General: info@divyaratna.edu.np', 'Admissions: admissions@divyaratna.edu.np', 'Careers: careers@divyaratna.edu.np'],
  },
  {
    icon: <MapPin className="h-8 w-8 text-maroon-600" />,
    title: 'Address',
    details: ['Divya Ratna English Secondary School', 'P.O. Box 2673, Rabi Bhawan', 'Kathmandu, Nepal'],
  },
  {
    icon: <Clock className="h-8 w-8 text-maroon-600" />,
    title: 'Office Hours',
    details: ['Monday - Friday: 8:00 AM - 4:00 PM', 'Saturday: 9:00 AM - 1:00 PM', 'Sunday: Closed'],
  },
];

const DEFAULT_DEPARTMENTS: ContactDepartment[] = [
  {
    slug: 'admissions',
    icon: <Building className="h-6 w-6 text-blue-600" />,
    name: 'Admissions Office',
    contact: 'admissions@divyaratna.edu.np',
    phone: '+977 1-5370483',
    description: 'Information about enrollment, applications, and school visits',
  },
  {
    slug: 'academic',
    icon: <User className="h-6 w-6 text-green-600" />,
    name: 'Academic Office',
    contact: 'academic@divyaratna.edu.np',
    phone: '+977 1-5370485',
    description: 'Curriculum inquiries, academic programs, and student progress',
  },
  {
    slug: 'transportation',
    icon: <Car className="h-6 w-6 text-orange-600" />,
    name: 'Transportation',
    contact: 'transport@divyaratna.edu.np',
    phone: '+977 1-5370486',
    description: 'Bus routes, transportation services, and safety protocols',
  },
  {
    slug: 'health',
    icon: <Heart className="h-6 w-6 text-maroon-800" />,
    name: 'Health Services',
    contact: 'health@divyaratna.edu.np',
    phone: '+977 1-5370487',
    description: 'Medical services, health records, and wellness programs',
  },
  {
    slug: 'security',
    icon: <Shield className="h-6 w-6 text-purple-600" />,
    name: 'Security Office',
    contact: 'security@divyaratna.edu.np',
    phone: '+977 1-5370488',
    description: 'Campus security, visitor management, and emergency procedures',
  },
  {
    slug: 'student-services',
    icon: <MessageSquare className="h-6 w-6 text-teal-600" />,
    name: 'Student Services',
    contact: 'services@divyaratna.edu.np',
    phone: '+977 1-5370489',
    description: 'Counseling, extracurricular activities, and student support',
  },
];

function toStringArray(v: unknown) {
  if (!Array.isArray(v)) return [] as string[];
  return v.map((x) => (typeof x === 'string' ? x : '')).filter(Boolean);
}

function iconForInfoKey(key: string) {
  if (key === 'phone') return <Phone className="h-8 w-8 text-maroon-600" />;
  if (key === 'mail') return <Mail className="h-8 w-8 text-maroon-600" />;
  if (key === 'map') return <MapPin className="h-8 w-8 text-maroon-600" />;
  if (key === 'clock') return <Clock className="h-8 w-8 text-maroon-600" />;
  return <Phone className="h-8 w-8 text-maroon-600" />;
}

function iconForDeptSlug(slug: string) {
  if (slug === 'admissions') return <Building className="h-6 w-6 text-blue-600" />;
  if (slug === 'academic') return <User className="h-6 w-6 text-green-600" />;
  if (slug === 'transportation') return <Car className="h-6 w-6 text-orange-600" />;
  if (slug === 'health') return <Heart className="h-6 w-6 text-maroon-800" />;
  if (slug === 'security') return <Shield className="h-6 w-6 text-purple-600" />;
  if (slug === 'student-services') return <MessageSquare className="h-6 w-6 text-teal-600" />;
  return <Building className="h-6 w-6 text-blue-600" />;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [faqs, setFaqs] = useState<{ id: string; question: string; answer: string }[]>([]);

  const [settings, setSettings] = useState<ContactSettings>(DEFAULT_SETTINGS);
  const [contactInfo, setContactInfo] = useState<ContactInfoCard[]>(DEFAULT_CONTACT_INFO);
  const [departments, setDepartments] = useState<ContactDepartment[]>(DEFAULT_DEPARTMENTS);

  useEffect(() => {
    const scrollIfNeeded = () => {
      if (window.location.hash !== '#contact-form') return;
      const el = document.getElementById('contact-form');
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const t = window.setTimeout(scrollIfNeeded, 50);
    window.addEventListener('hashchange', scrollIfNeeded);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('hashchange', scrollIfNeeded);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      const [sRes, iRes, dRes] = await Promise.all([
        supabase.from('contact_settings').select('*').eq('id', 'default').maybeSingle(),
        supabase
          .from('contact_info_items')
          .select('id,title,icon_key,details,sort_order')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('updated_at', { ascending: false }),
        supabase
          .from('contact_departments')
          .select('id,slug,name,description,email,phone,sort_order')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('updated_at', { ascending: false }),
      ]);

      if (!mounted) return;

      if (!sRes.error && sRes.data) {
        const row = sRes.data as Record<string, unknown>;
        setSettings({
          hero_title: typeof row.hero_title === 'string' ? row.hero_title : DEFAULT_SETTINGS.hero_title,
          hero_subtitle: typeof row.hero_subtitle === 'string' ? row.hero_subtitle : DEFAULT_SETTINGS.hero_subtitle,
          intro_title: typeof row.intro_title === 'string' ? row.intro_title : DEFAULT_SETTINGS.intro_title,
          intro_subtitle: typeof row.intro_subtitle === 'string' ? row.intro_subtitle : DEFAULT_SETTINGS.intro_subtitle,
          map_title: typeof row.map_title === 'string' ? row.map_title : DEFAULT_SETTINGS.map_title,
          map_embed_url: typeof row.map_embed_url === 'string' ? row.map_embed_url : DEFAULT_SETTINGS.map_embed_url,
          map_directions_url:
            typeof row.map_directions_url === 'string' ? row.map_directions_url : DEFAULT_SETTINGS.map_directions_url,
          emergency_title: typeof row.emergency_title === 'string' ? row.emergency_title : DEFAULT_SETTINGS.emergency_title,
          emergency_text: typeof row.emergency_text === 'string' ? row.emergency_text : DEFAULT_SETTINGS.emergency_text,
          emergency_hotline: typeof row.emergency_hotline === 'string' ? row.emergency_hotline : DEFAULT_SETTINGS.emergency_hotline,
          emergency_note: typeof row.emergency_note === 'string' ? row.emergency_note : DEFAULT_SETTINGS.emergency_note,
          department_section_title:
            typeof row.department_section_title === 'string'
              ? row.department_section_title
              : DEFAULT_SETTINGS.department_section_title,
          department_section_subtitle:
            typeof row.department_section_subtitle === 'string'
              ? row.department_section_subtitle
              : DEFAULT_SETTINGS.department_section_subtitle,
        });
      }

      if (!iRes.error && iRes.data) {
        const next = (iRes.data as Array<Record<string, unknown>>).map((row) => {
          const iconKey = typeof row.icon_key === 'string' ? row.icon_key : 'phone';
          const title = typeof row.title === 'string' ? row.title : '';
          const details = toStringArray(row.details);
          return {
            id: typeof row.id === 'string' ? row.id : undefined,
            icon: iconForInfoKey(iconKey),
            title,
            details,
          };
        });
        const filtered = next.filter((x) => x.title && x.details.length > 0);
        setContactInfo(filtered.length ? filtered : DEFAULT_CONTACT_INFO);
      }

      if (!dRes.error && dRes.data) {
        const next = (dRes.data as Array<Record<string, unknown>>).map((row) => {
          const slug = typeof row.slug === 'string' ? row.slug : '';
          const name = typeof row.name === 'string' ? row.name : '';
          const description = typeof row.description === 'string' ? row.description : '';
          const email = typeof row.email === 'string' ? row.email : '';
          const phone = typeof row.phone === 'string' ? row.phone : '';
          return {
            id: typeof row.id === 'string' ? row.id : undefined,
            slug,
            icon: iconForDeptSlug(slug),
            name,
            description,
            contact: email,
            phone,
          };
        });
        const filtered = next.filter((x) => x.slug && x.name);
        setDepartments(filtered.length ? filtered : DEFAULT_DEPARTMENTS);
      }
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-public-contact')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_settings' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_info_items' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_departments' }, fetchAll)
      .subscribe();

    return () => {
      mounted = false;
      try {
        supabase.removeChannel(ch);
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('updated_at', { ascending: false });
      if (error || !data) {
        setFaqs([]);
        return;
      }
      setFaqs(data as { id: string; question: string; answer: string }[]);
    };

    fetchFaqs();
    const ch = supabase
      .channel('realtime-contact-faqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faqs' }, fetchFaqs)
      .subscribe();
    return () => {
      try {
        supabase.removeChannel(ch);
      } catch {
        // ignore
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is missing');
      }

      const functionUrl = `${supabaseUrl}/functions/v1/send-contact-email`;

      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setResult({ ok: true, message: 'Your message has been sent successfully!' });
      setFormData({ name: '', email: '', phone: '', subject: '', department: '', message: '' });
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
          ? String((err as { message?: unknown }).message)
          : 'Something went wrong. Please try again.';
      setResult({ ok: false, message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">{settings.hero_title}</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              {settings.hero_subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">{settings.intro_title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {settings.intro_subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-6">
                  {info.icon}
                </div>
                <h3 className="text-xl font-semibold text-maroon-800 mb-4">{info.title}</h3>
                <div className="space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600 text-sm">{detail}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section id="contact-form" className="py-20 bg-gray-50 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-maroon-800 mb-6">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors"
                    placeholder="Enter the subject of your message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Enter your message here..."
                  ></textarea>
                </div>

                {result && (
                  <div className={`${result.ok ? 'text-green-700 bg-green-50 border-green-200' : 'text-maroon-800 bg-maroon-50 border-maroon-200'} border rounded px-4 py-3 text-sm`}>
                    {result.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${submitting ? 'bg-gray-400' : 'bg-maroon-700 hover:bg-maroon-800'} text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center`}
                >
                  <Send className="h-5 w-5 mr-2" />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
            {/* Map */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-maroon-800 mb-6">{settings.map_title}</h3>
              <div className="bg-gray-200 h-64 rounded-lg overflow-hidden mb-6">
                <iframe
                  title="Divya Ratna Secondary English School Map"
                  src={settings.map_embed_url || DEFAULT_SETTINGS.map_embed_url}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="text-center">
                <a
                  href={settings.map_directions_url || DEFAULT_SETTINGS.map_directions_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-maroon-700 text-white rounded-lg font-medium hover:bg-maroon-800 transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                  Get Directions
                </a>
              </div>

              <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-red-800 mb-3">{settings.emergency_title}</h4>
                <p className="text-red-700 mb-2">{settings.emergency_text}</p>
                <p className="text-red-800 font-medium">Emergency Hotline: {settings.emergency_hotline}</p>
                <p className="text-red-600 text-sm mt-2">{settings.emergency_note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Department Contacts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">{settings.department_section_title}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{settings.department_section_subtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {dept.icon}
                  <h3 className="text-lg font-semibold text-maroon-800 ml-3">{dept.name}</h3>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{dept.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-maroon-600 mr-2" />
                    <a href={`mailto:${dept.contact}`} className="text-maroon-600 hover:text-maroon-800 transition-colors">
                      {dept.contact}
                    </a>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 text-maroon-600 mr-2" />
                    <a href={`tel:${dept.phone}`} className="text-maroon-600 hover:text-maroon-800 transition-colors">
                      {dept.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-maroon-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find quick answers to common questions about DRESS
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-maroon-800 mb-3">{faq.question}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="text-sm text-gray-500 text-center">No FAQs available right now.</div>
            )}
          </div>
        </div>
      </section>

      {/* Visit Us Section */}
      <section className="py-20 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-light mb-4">Visit Our Campus</h2>
          <p className="text-xl opacity-90 mb-12 max-w-3xl mx-auto">
            Experience DRESS firsthand by scheduling a campus visit. See our facilities, meet our faculty, and discover what makes our school special.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Guided Campus Tours</h3>
              <p className="opacity-90 mb-4">Monday - Friday: 10:00 AM & 2:00 PM</p>
              <p className="text-sm opacity-80">Duration: 45 minutes</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Information Sessions</h3>
              <p className="opacity-90 mb-4">Saturdays: 10:00 AM</p>
              <p className="text-sm opacity-80">Duration: 1 hour</p>
            </div>
          </div>

          <button className="bg-white text-maroon-800 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Schedule a Visit
          </button>
        </div>
      </section>
    </div>
  );
};

export default Contact;