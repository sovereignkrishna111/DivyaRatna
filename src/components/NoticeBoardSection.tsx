import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Calendar, Newspaper, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { queryTableWhere } from '../services/optimizedQueries';
import Reveal from './Reveal';

type BoardTab = 'notices' | 'events' | 'news';

type BoardItem = {
  id: string;
  title: string;
  date?: string;
  kind: BoardTab;
};

type NoticeRow = {
  id: string;
  title: string;
  date: string | null;
};

type EventRow = {
  id: string;
  title: string;
  date: string | null;
};

type NewsRow = {
  id: string;
  title: string;
  date: string | null;
};

const ROW_HEIGHT_PX = 46;
const VISIBLE_ROWS = 5;

const NoticeBoardSection: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<BoardTab>('notices');
  const [paused, setPaused] = useState(false);

  const [notices, setNotices] = useState<BoardItem[]>([]);
  const [events, setEvents] = useState<BoardItem[]>([]);
  const [news, setNews] = useState<BoardItem[]>([]);

  const listRef = useRef<HTMLDivElement | null>(null);

  const items = useMemo(() => {
    if (tab === 'events') return events;
    if (tab === 'news') return news;
    return notices;
  }, [events, news, notices, tab]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = 0;
  }, [tab]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const data = await queryTableWhere<NoticeRow>(
          'notices',
          'published',
          true,
          { select: 'id,title,date', limit: 12 }
        );
        setNotices(
          data.map((n) => ({
            id: String(n.id),
            title: String(n.title),
            date: n.date || undefined,
            kind: 'notice'
          }))
        );
      } catch (error) {
        setNotices([]);
      }
    };

    const fetchEvents = async () => {
      try {
        const data = await queryTableWhere<EventRow>(
          'events',
          'status',
          'published',
          { select: 'id,title,date', limit: 12 }
        );
        setEvents(
          data.map((e) => ({
            id: String(e.id),
            title: String(e.title),
            date: e.date || undefined,
            kind: 'event'
          }))
        );
      } catch (error) {
        setEvents([]);
      }
    };

    const fetchNews = async () => {
      try {
        const data = await queryTableWhere<NewsRow>(
          'news',
          'published',
          true,
          { select: 'id,title,date', limit: 12 }
        );
        setNews(
          data.map((n) => ({
            id: String(n.id),
            title: String(n.title),
            date: n.date || undefined,
            kind: 'news'
          }))
        );
      } catch (error) {
        setNews([]);
      }
    };

    fetchNotices();
    fetchEvents();
    fetchNews();

    const eventsChannel = supabase
      .channel('realtime-home-events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe();

    const noticesChannel = supabase
      .channel('realtime-home-notices')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => fetchNotices())
      .subscribe();

    const newsChannel = supabase
      .channel('realtime-home-news')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => fetchNews())
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(eventsChannel);
      } catch { void 0; }
      try {
        supabase.removeChannel(noticesChannel);
      } catch { void 0; }
      try {
        supabase.removeChannel(newsChannel);
      } catch { void 0; }
    };
  }, []);

  const goTab = (t: BoardTab) => {
    setTab(t);
    navigate(`/bulletins/${t}`);
  };

  const openTab = (t: BoardTab) => navigate(`/bulletins/${t}`);

  const title = tab === 'notices' ? 'Notice Board' : tab === 'events' ? 'Upcoming Events' : 'News & Updates';

  return (
    <section className="py-12 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          <Reveal as="div" variant="left" className="h-full">
            <div className="h-full relative overflow-hidden rounded-2xl border border-maroon-100 bg-gradient-to-br from-white via-white to-maroon-50 shadow-[0_18px_45px_-30px_rgba(88,21,28,0.45)]">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-maroon-700 via-amber-500 to-maroon-700" />

              <div className="p-5 sm:p-6 h-full flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-maroon-700 text-white flex items-center justify-center shadow">
                        {tab === 'notices' ? <Bell className="h-5 w-5" /> : tab === 'events' ? <Calendar className="h-5 w-5" /> : <Newspaper className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-maroon-900 tracking-wide">{title}</h3>
                        <p className="text-sm text-gray-600">Auto scrolling live updates • click any title to open Bulletins</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openTab(tab)}
                    className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-maroon-700 hover:text-maroon-900"
                  >
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTab('notices')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tab === 'notices' ? 'bg-maroon-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Notices
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('events')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tab === 'events' ? 'bg-maroon-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('news')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      tab === 'news' ? 'bg-maroon-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    News
                  </button>
                </div>

                <div
                  className="mt-5 rounded-xl border border-gray-200 bg-white overflow-hidden flex-1 flex flex-col"
                  onMouseEnter={() => setPaused(true)}
                  onMouseLeave={() => setPaused(false)}
                >
                  <div className="relative z-10 px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-800">Highlights</div>
                    <div className="text-xs text-gray-500">Pause on hover</div>
                  </div>

                  <div
                    ref={listRef}
                    className="relative overflow-y-auto"
                    style={{ height: `${ROW_HEIGHT_PX * VISIBLE_ROWS}px` }}
                  >
                    {items.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-500">
                        No updates available.
                      </div>
                    ) : (
                      <div>
                        {items.map((it) => (
                          <button
                            key={`${it.kind}-${it.id}`}
                            type="button"
                            onClick={() => goTab(it.kind)}
                            className="w-full text-left px-4 flex items-center justify-between gap-4 border-b border-gray-100 hover:bg-maroon-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-maroon-500"
                            style={{ height: `${ROW_HEIGHT_PX}px` }}
                          >
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 truncate whitespace-nowrap">{it.title}</div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                className={`text-[11px] px-2 py-1 rounded-full border ${
                                  it.kind === 'notices'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : it.kind === 'events'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {it.kind.toUpperCase()}
                              </span>
                              <ArrowRight className="h-4 w-4 text-maroon-700" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:hidden px-4 py-3 bg-white">
                    <button
                      type="button"
                      onClick={() => openTab(tab)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-maroon-700 text-white px-4 py-2 text-sm font-semibold hover:bg-maroon-800"
                    >
                      View all Bulletins
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal as="div" variant="right" delayMs={120} className="h-full">
            <div className="h-full rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)] flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-light text-maroon-900 tracking-wide mb-3">Never miss an update</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Important announcements, upcoming programs, exam schedules, celebrations, and news are published in Bulletins.
                This Notice Board automatically displays the latest titles.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => openTab('notices')}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="text-sm text-gray-500">Notices</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{notices.length}</div>
                  <div className="mt-1 text-sm font-medium text-maroon-700">Open notices</div>
                </button>
                <button
                  type="button"
                  onClick={() => openTab('events')}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="text-sm text-gray-500">Events</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{events.length}</div>
                  <div className="mt-1 text-sm font-medium text-maroon-700">Open events</div>
                </button>
                <button
                  type="button"
                  onClick={() => openTab('news')}
                  className="rounded-xl border border-gray-200 bg-white p-4 text-left hover:shadow-md transition-shadow"
                >
                  <div className="text-sm text-gray-500">News</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900">{news.length}</div>
                  <div className="mt-1 text-sm font-medium text-maroon-700">Open news</div>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openTab('notices')}
                  className="inline-flex items-center gap-2 rounded-full bg-maroon-700 text-white px-5 py-2 text-sm font-semibold hover:bg-maroon-800"
                >
                  Open Bulletins
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('notices');
                    document.getElementById('home-notice-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  See highlights
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>

        <div id="home-notice-board" className="sr-only">Notice Board</div>
      </div>
    </section>
  );
};

export default NoticeBoardSection;
