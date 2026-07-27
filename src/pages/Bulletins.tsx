import React, { useEffect, useState } from 'react';
import { Calendar, Bell, Newspaper, Download, Search, Filter, Clock, MapPin, Users, Eye, Award, ClipboardList } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import BulletinDocumentsSection from '../components/BulletinDocumentsSection';
import { SiteLogoIcon } from '../components/SiteLogo';

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: string;
  attachment?: string;
  fileDataUrl?: string;
  author: string;
  views: number;
  linkUrl?: string;
  published: boolean;
};

type NewsItem = {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content?: string;
  image?: string;
  imageUrl?: string;
  linkUrl?: string;
  author: string;
  readTime?: string;
  published: boolean;
};

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image?: string;
  imageUrl?: string;
  linkUrl?: string;
  category: string;
  registrationRequired: boolean;
  capacity: string;
};

type AchievementActivityItem = {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  kind: 'achievement' | 'activity';
  category?: string;
  imageUrl?: string;
  linkUrl?: string;
  author: string;
  published: boolean;
};

const Bulletins: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('notices');
  const [searchTerm, setSearchTerm] = useState('');

  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const [events, setEvents] = useState<EventItem[]>([]);

  const [news, setNews] = useState<NewsItem[]>([]);

  const [achievements, setAchievements] = useState<AchievementActivityItem[]>([]);

  const loadAll = () => {};

  useEffect(() => {
    const p = location.pathname;
    if (p.endsWith('/events')) setActiveTab('events');
    else if (p.endsWith('/news')) setActiveTab('news');
    else if (p.endsWith('/notices')) setActiveTab('notices');
    else if (p.endsWith('/achievements')) setActiveTab('achievements');
    else if (p.endsWith('/routine')) setActiveTab('routine');
    else if (p.endsWith('/results')) setActiveTab('results');
  }, [location.pathname]);

  useEffect(() => {
    loadAll();
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['admin_bulletins_news_v1', 'admin_bulletins_achievements_activities_v1'].includes(e.key)) loadAll();
    };
    window.addEventListener('storage', onStorage);

    const toTime = (s?: string, e?: string) => s && e ? `${s} - ${e}` : (s || e || 'All Day');
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });
      if (error || !data) { setNotices([]); return; }
      setNotices((data as unknown as Array<Record<string, unknown>>).map((n) => ({
        id: String(n.id),
        title: String(n.title),
        content: String(n.content),
        date: String(n.date),
        category: String(n.category),
        priority: String(n.priority),
        attachment: n.attachment ? String(n.attachment) : undefined,
        fileDataUrl: n.file_data_url ? String(n.file_data_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        views: typeof n.views === 'number' ? n.views : 0,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        published: !!n.published,
      })));
    };
    fetchNotices();

    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });
      if (error || !data) { setNews([]); return; }
      setNews((data as unknown as Array<Record<string, unknown>>).map((n) => ({
        id: String(n.id),
        title: String(n.title),
        date: String(n.date),
        category: String(n.category),
        excerpt: String(n.excerpt),
        content: n.content ? String(n.content) : undefined,
        image: n.image_url ? String(n.image_url) : undefined,
        imageUrl: n.image_url ? String(n.image_url) : undefined,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        readTime: n.read_time ? String(n.read_time) : undefined,
        published: !!n.published,
      })));
    };
    fetchNews();

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status','published')
        .order('date', { ascending: true });
      if (error || !data) { setEvents([]); return; }
      setEvents((data as unknown as Array<Record<string, unknown>>).map((e) => ({
        id: String(e.id),
        title: String(e.title),
        date: String(e.date),
        time: toTime(e.start_time ? String(e.start_time) : undefined, e.end_time ? String(e.end_time) : undefined),
        location: e.location ? String(e.location) : '',
        description: e.description ? String(e.description) : '',
        image: e.image ? String(e.image) : undefined,
        imageUrl: e.image_url ? String(e.image_url) : undefined,
        linkUrl: e.link_url ? String(e.link_url) : undefined,
        category: e.category ? String(e.category) : 'Events',
        registrationRequired: false,
        capacity: ''
      })));
    };
    fetchEvents();

    const fetchAchievements = async () => {
      const { data, error } = await supabase
        .from('achievements_activities')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false });
      if (error || !data) { setAchievements([]); return; }
      setAchievements((data as unknown as Array<Record<string, unknown>>).map((n) => ({
        id: String(n.id),
        title: String(n.title),
        excerpt: String(n.excerpt),
        content: n.content ? String(n.content) : undefined,
        date: String(n.date),
        kind: (String(n.kind) as 'achievement' | 'activity') || 'achievement',
        category: n.category ? String(n.category) : undefined,
        imageUrl: n.image_url ? String(n.image_url) : undefined,
        linkUrl: n.link_url ? String(n.link_url) : undefined,
        author: n.author ? String(n.author) : 'Admin',
        published: !!n.published,
      })));
    };
    fetchAchievements();

    const channel = supabase
      .channel('realtime-bulletins-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe();

    const noticesChannel = supabase
      .channel('realtime-bulletins-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => fetchNotices())
      .subscribe();

    const newsChannel = supabase
      .channel('realtime-bulletins-news')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchNews())
      .subscribe();

    const achievementsChannel = supabase
      .channel('realtime-bulletins-achievements-activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements_activities' }, () => fetchAchievements())
      .subscribe();

    return () => {
      window.removeEventListener('storage', onStorage);
      try { supabase.removeChannel(channel); } catch (e) { void e; }
      try { supabase.removeChannel(noticesChannel); } catch (e) { void e; }
      try { supabase.removeChannel(newsChannel); } catch (e) { void e; }
      try { supabase.removeChannel(achievementsChannel); } catch (e) { void e; }
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Academic': 'bg-blue-100 text-blue-800',
      'Administrative': 'bg-purple-100 text-purple-800',
      'Health': 'bg-green-100 text-green-800',
      'Sports': 'bg-orange-100 text-orange-800',
      'Cultural': 'bg-pink-100 text-pink-800',
      'Career': 'bg-indigo-100 text-indigo-800',
      'Achievement': 'bg-yellow-100 text-yellow-800',
      'Facilities': 'bg-teal-100 text-teal-800',
      'International': 'bg-maroon-100 text-maroon-800',
      'Recognition': 'bg-green-100 text-green-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">Bulletins</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              Stay updated with the latest notices, events, news, and achievements from DRESS community
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            <button
              onClick={() => setActiveTab('notices')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'notices' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notices
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'events' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Events
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'news' 
                  ? 'bg-maroon-700 text-white' 
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <Newspaper className="h-5 w-5 mr-2" />
              News & Media
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-maroon-700 text-white'
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('routine')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'routine'
                  ? 'bg-maroon-700 text-white'
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              Routine
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`flex items-center justify-center text-center px-4 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'results'
                  ? 'bg-maroon-700 text-white'
                  : 'text-gray-600 hover:text-maroon-700'
              }`}
            >
              <SiteLogoIcon className="h-5 w-5 mr-2" alt="Logo" />
              Results
            </button>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Notices Tab */}
          {activeTab === 'notices' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h2 className="text-3xl font-light text-maroon-800">School Notices</h2>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                    />
                  </div>
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Filter className="h-5 w-5 mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {notices.map((notice) => (
                  <div key={notice.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold text-maroon-800">{notice.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notice.priority)}`}>
                            {notice.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center text-sm text-gray-600 mb-3 gap-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{notice.date}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(notice.category)}`}>
                            {notice.category}
                          </span>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{notice.views} views</span>
                          </div>
                          <span className="text-gray-500">By {notice.author}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{notice.content}</p>
                        {notice.linkUrl && (
                          <div className="mt-3">
                            <a href={notice.linkUrl} target="_blank" rel="noopener noreferrer" className="text-maroon-700 hover:text-maroon-900 font-medium">Read more →</a>
                          </div>
                        )}
                      </div>
                    </div>
                    {notice.attachment && (
                      <div className="flex items-center mt-4 pt-4 border-t border-gray-200">
                        <Download className="h-4 w-4 text-maroon-600 mr-2" />
                        <a href={notice.fileDataUrl || notice.linkUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-maroon-600 hover:text-maroon-800 font-medium">
                          Download {notice.attachment}
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h2 className="text-3xl font-light text-maroon-800 mb-8">Upcoming Events</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                {events.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img 
                        src={event.image || event.imageUrl}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                          {event.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-maroon-800 mb-3">{event.title}</h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{event.capacity}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{event.description}</p>
                      <div className="flex items-center justify-between">
                        {event.registrationRequired && (
                          <span className="text-sm text-orange-600 font-medium">Registration Required</span>
                        )}
                        {event.linkUrl ? (
                          <a href={event.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Learn More
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No link</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              <h2 className="text-3xl font-light text-maroon-800 mb-8">Latest News & Media</h2>
              <div className="space-y-8">
                {news.map((article) => (
                  <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <img 
                          src={article.image}
                          alt={article.title}
                          className="w-full h-48 lg:h-full object-cover"
                        />
                      </div>
                      <div className="lg:col-span-2 p-6">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                            {article.category}
                          </span>
                          <span className="text-gray-600 text-sm">{article.date}</span>
                          <span className="text-gray-500 text-sm">{article.readTime}</span>
                        </div>
                        <h3 className="text-2xl font-semibold text-maroon-800 mb-3">{article.title}</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">By {article.author}</span>
                          <button className="text-maroon-600 font-medium hover:text-maroon-800 transition-colors">
                            Read More →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div>
              <h2 className="text-3xl font-light text-maroon-800 mb-8">Achievements</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {achievements.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-56 object-cover"
                        />
                      ) : (
                        <div className="w-full h-56 bg-gray-100" />
                      )}
                    </div>
                    <div className="p-7">
                      <div className="text-sm text-gray-600 mb-2">{item.date} • {item.author}</div>
                      <h3 className="text-xl font-semibold text-maroon-800 mb-3">{item.title}</h3>
                      <p className="text-gray-700 leading-relaxed mb-4">{item.excerpt}</p>
                      <div className="flex items-center justify-between">
                        {item.linkUrl ? (
                          <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="bg-maroon-700 hover:bg-maroon-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Read More
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">No link</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {achievements.length === 0 && (
                <div className="text-sm text-gray-500">No achievements yet.</div>
              )}
            </div>
          )}

          {/* Routine Tab */}
          {activeTab === 'routine' && (
            <BulletinDocumentsSection kind="routine" />
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <BulletinDocumentsSection kind="result" />
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">Stay Updated</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter to receive the latest updates, notices, and news directly in your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-maroon-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Bulletins;