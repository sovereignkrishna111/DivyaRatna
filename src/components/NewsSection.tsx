import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Reveal from './Reveal';

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  excerpt: string;
  image?: string;
  category: string;
};

const NewsSection: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [brokenImages, setBrokenImages] = useState<Record<string, true>>({});

  useEffect(() => {
    const toTime = (s?: string, e?: string) => (s && e ? `${s} - ${e}` : (s || e || 'All Day'));

    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published');

      if (error || !data) {
        setEvents([]);
        return;
      }

      setEvents(
        (data as unknown as Array<Record<string, unknown>>).map((e) => ({
          id: String(e.id),
          title: String(e.title),
          date: String(e.date),
          time: toTime(
            e.start_time ? String(e.start_time) : undefined,
            e.end_time ? String(e.end_time) : undefined
          ),
          excerpt: e.description ? String(e.description) : '',
          image: e.image ? String(e.image) : (e.image_url ? String(e.image_url) : undefined),
          category: e.category ? String(e.category) : 'Events',
        }))
      );
    };

    fetchEvents();
  }, []);

  const eventItems = useMemo(() => {
    const parseDay = (s: string) => {
      const d = new Date(s);
      if (!Number.isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return null;
    };

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const upcoming: EventItem[] = [];
    const past: EventItem[] = [];

    for (const e of events) {
      const day = parseDay(e.date);
      if (!day) continue;
      if (day.getTime() >= todayStart.getTime()) upcoming.push(e);
      else past.push(e);
    }

    upcoming.sort((a, b) => {
      const ad = parseDay(a.date)!.getTime();
      const bd = parseDay(b.date)!.getTime();
      return ad - bd;
    });
    past.sort((a, b) => {
      const ad = parseDay(a.date)!.getTime();
      const bd = parseDay(b.date)!.getTime();
      return bd - ad;
    });

    const top = upcoming.slice(0, 3);
    if (top.length < 3) top.push(...past.slice(0, 3 - top.length));
    return top;
  }, [events]);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12" variant="up">
          <h2 className="text-3xl md:text-4xl font-bold text-maroon-800 mb-4">
            Latest News & Events
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest happenings at DRESS
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventItems.map((item) => (
            <Reveal key={item.id} as="article" variant="up" className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="relative">
                {item.image && item.image.trim() && !brokenImages[item.id] ? (
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={() => setBrokenImages((p) => ({ ...p, [item.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100" />
                )}
                <div className="absolute top-4 left-4">
                  <span className="bg-maroon-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="mr-4">{item.date}</span>
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{item.time}</span>
                </div>
                
                <h3 className="text-xl font-bold text-maroon-800 mb-3 hover:text-maroon-700 transition-colors">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {item.excerpt}
                </p>
                
                <button
                  className="flex items-center text-maroon-700 font-semibold hover:text-maroon-800 transition-colors"
                  onClick={() => navigate('/bulletins/events')}
                >
                  Read More
                  <ArrowRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="div" variant="up" delayMs={120} className="text-center mt-12">
          <button
            className="bg-maroon-700 hover:bg-maroon-800 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            onClick={() => navigate('/bulletins/events')}
          >
            View All News
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default NewsSection;