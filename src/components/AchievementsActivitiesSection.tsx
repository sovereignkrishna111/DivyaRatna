import React, { useEffect, useState } from 'react';
import { ArrowRight, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Reveal from './Reveal';

type AchievementActivityItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  kind: 'achievement' | 'activity';
  category?: string;
  imageUrl?: string;
  linkUrl?: string;
  author?: string;
};

const AchievementsActivitiesSection: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AchievementActivityItem[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      const { data, error } = await supabase
        .from('achievements_activities')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })
        .limit(3);

      if (error || !data) {
        setItems([]);
        return;
      }

      setItems(
        (data as unknown as Array<Record<string, unknown>>).map((n) => ({
          id: String(n.id),
          title: String(n.title),
          excerpt: String(n.excerpt),
          date: String(n.date),
          kind: (String(n.kind) as 'achievement' | 'activity') || 'achievement',
          category: n.category ? String(n.category) : undefined,
          imageUrl: n.image_url ? String(n.image_url) : undefined,
          linkUrl: n.link_url ? String(n.link_url) : undefined,
          author: n.author ? String(n.author) : undefined,
        }))
      );
    };

    fetchLatest();

    const channel = supabase
      .channel('realtime-home-achievements-activities')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements_activities' }, fetchLatest)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        void 0;
      }
    };
  }, []);

  return (
    <section className="py-20 bg-gray-50 section-animate">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12" variant="up">
          <div className="inline-flex items-center gap-2 text-maroon-700 bg-white border border-maroon-100 px-4 py-2 rounded-full shadow-sm">
            <Award className="h-4 w-4" />
            {/* <span className="text-sm font-semibold">Highlights</span> */}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-maroon-800 mt-4 mb-3">Achievements</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Celebrating student wins and showcasing the moments that shape our community.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <Reveal key={item.id} as="article" variant="up" delayMs={index * 90} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden group">
              <div className="relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-56 object-cover group-hover:scale-[1.02] transition-transform"
                  />
                ) : (
                  <div className="w-full h-56 bg-gray-100" />
                )}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.kind === 'achievement' ? 'bg-gold-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {item.kind === 'achievement' ? 'Achievement' : 'Activity'}
                  </span>
                  {item.category && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-7">
                <div className="text-sm text-gray-500 mb-2">{item.date}{item.author ? ` • ${item.author}` : ''}</div>
                <h3 className="text-xl font-bold text-maroon-800 mb-3 line-clamp-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed line-clamp-3">{item.excerpt}</p>

                <div className="mt-5 flex items-center justify-between">
                  <button
                    className="inline-flex items-center text-maroon-700 font-semibold hover:text-maroon-800 transition-colors"
                    onClick={() => navigate('/bulletins/achievements')}
                  >
                    View
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}

          {items.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center text-gray-500">
              No achievements/activities yet.
            </div>
          )}
        </div>

        <Reveal as="div" variant="up" delayMs={120} className="text-center mt-12">
          <button
            className="bg-maroon-700 hover:bg-maroon-800 text-white px-10 py-3 rounded-full font-semibold transition-colors"
            onClick={() => navigate('/bulletins/achievements')}
          >
            See More
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default AchievementsActivitiesSection;
