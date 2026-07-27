import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Users, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Array<{ id: string | number; title: string; date: string; time: string; location?: string; category: string; description: string; attendees?: string }>>([]);

  const mapCategory = (c: string) => {
    const lc = (c || '').toLowerCase();
    if (lc.startsWith('exam')) return 'examinations';
    if (lc.startsWith('holiday')) return 'holiday';
    if (lc.startsWith('meet')) return 'meetings';
    if (lc.startsWith('sport')) return 'sports';
    if (lc.startsWith('cultur')) return 'cultural';
    if (lc.startsWith('academ')) return 'academic';
    return 'other';
  };

  const toTime = (s?: string, e?: string) => {
    if (s && e) return `${s} - ${e}`;
    if (s) return s;
    if (e) return e;
    return 'All Day';
  };

  const loadEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: true });
    if (error || !data) { setEvents([]); return; }
    const mapped = (data as any[]).map(e => ({
      id: e.id,
      title: e.title,
      date: e.date,
      time: toTime(e.start_time, e.end_time),
      location: e.location,
      category: mapCategory(e.category),
      description: e.description || '',
      attendees: e.audience || 'Everyone',
    }));
    setEvents(mapped);
  };

  useEffect(() => {
    loadEvents();
    const channel = supabase
      .channel('realtime-public-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => loadEvents())
      .subscribe();
    return () => { try { supabase.removeChannel(channel); } catch {} };
  }, []);

  const categories = [
    { id: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-800' },
    { id: 'academic', label: 'Academic', color: 'bg-blue-100 text-blue-800' },
    { id: 'cultural', label: 'Cultural', color: 'bg-purple-100 text-purple-800' },
    { id: 'sports', label: 'Sports', color: 'bg-orange-100 text-orange-800' },
    { id: 'holiday', label: 'Holidays', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'meetings', label: 'Meetings', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'examinations', label: 'Examinations', color: 'bg-maroon-100 text-maroon-800' },
    { id: 'other', label: 'Other', color: 'bg-green-100 text-green-800' }
  ];

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800';
  };

  const filteredEvents = events.filter(event => {
    const matchesFilter = selectedFilter === 'all' || event.category === selectedFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-light mb-4 tracking-wide">School Calendar</h1>
            <p className="text-xl font-light max-w-2xl mx-auto">
              Stay updated with important dates, events, and academic schedules
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-semibold text-maroon-800">
                {getMonthName(currentDate)}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-maroon-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Events List */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold text-maroon-800 mb-8">All Events</h3>
              <div className="space-y-6">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-semibold text-maroon-800">{event.title}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                            {categories.find(c => c.id === event.category)?.label}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-maroon-600" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-maroon-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-maroon-600" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-maroon-600" />
                        <span className="text-sm text-gray-600">For: {event.attendees}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-maroon-800 mb-6">Upcoming Events</h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-maroon-600 pl-4 py-2">
                      <h4 className="font-semibold text-maroon-800 text-sm">{event.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} • {event.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-semibold text-maroon-800 mb-6">Event Categories</h3>
                <div className="space-y-2">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedFilter(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedFilter === category.id 
                          ? 'bg-maroon-100 text-maroon-800' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span className={`inline-block w-3 h-3 rounded-full mr-3 ${category.color.split(' ')[0]}`}></span>
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-maroon-800 mb-6">Quick Links</h3>
                <div className="space-y-3">
                  <a href="#" className="block text-maroon-600 hover:text-maroon-800 transition-colors">
                    Academic Calendar PDF
                  </a>
                  <a href="#" className="block text-maroon-600 hover:text-maroon-800 transition-colors">
                    Exam Schedule
                  </a>
                  <a href="#" className="block text-maroon-600 hover:text-maroon-800 transition-colors">
                    Holiday List
                  </a>
                  <a href="#" className="block text-maroon-600 hover:text-maroon-800 transition-colors">
                    Event Registration
                  </a>
                  <a href="#" className="block text-maroon-600 hover:text-maroon-800 transition-colors">
                    Subscribe to Calendar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-maroon-800 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">Stay Updated</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Subscribe to our calendar to receive notifications about important events and deadlines
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

export default Calendar;