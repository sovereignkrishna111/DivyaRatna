import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../theme/siteSettings';

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  sortOrder: number;
};

type GalleryRow = {
  id: string;
  title: string;
  type: string;
  image_url: string;
  sort_order: number;
  published: boolean;
};

const Gallery: React.FC = () => {
  const { getAssetUrl } = useSiteSettings();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('id,title,type,image_url,sort_order,published')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data) {
        setItems([]);
        return;
      }

      const mapped = (data as unknown as GalleryRow[])
        .filter((r) => !!r.image_url)
        .map((r) => ({
          id: String(r.id),
          title: String(r.title),
          category: String(r.type),
          imageUrl: String(r.image_url),
          sortOrder: typeof r.sort_order === 'number' ? r.sort_order : 0,
        }));

      setItems(mapped);
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-public-gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_items' }, fetchAll)
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        void e;
      }
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ['All', ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return items;
    return items.filter((i) => i.category === activeCategory);
  }, [activeCategory, items]);

  const current = activeIndex === null ? null : filtered[activeIndex];

  const close = () => setActiveIndex(null);
  const prev = () => setActiveIndex((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
  const next = () => setActiveIndex((i) => (i === null ? null : (i + 1) % filtered.length));

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-gradient-to-r from-maroon-800 to-maroon-600">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${getAssetUrl('gallery_hero', '')})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-4xl md:text-5xl font-light tracking-wide">Gallery</h1>
            <div className="w-24 h-1 bg-brand mx-auto mt-5 mb-6"></div>
            <p className="text-lg md:text-xl font-light max-w-2xl mx-auto opacity-95">
              Moments from school life — events, achievements, and memories.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <section className="py-12">
          <div className="mb-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-wide">
                Photo Highlights
              </h2>
              <div className="w-24 h-1 bg-brand mx-auto"></div>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setActiveCategory(c);
                    setActiveIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === c
                      ? 'bg-maroon-700 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((it, idx) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className="group text-left rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="w-full h-64 sm:h-72 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" />
                  <div className="absolute left-4 bottom-4 right-4">
                    <div className="inline-flex text-[11px] px-2 py-1 rounded-full bg-white/90 text-gray-800 border border-white/60">
                      {it.category}
                    </div>
                    <div className="mt-2 text-white font-semibold text-base leading-snug">{it.title}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {current && createPortal(
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
          <div className="relative z-[95] h-full w-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden bg-black shadow-2xl">
              <button
                type="button"
                onClick={close}
                className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <img src={current.imageUrl} alt={current.title} className="w-full max-h-[78vh] object-contain bg-black" />
              <div className="bg-gradient-to-r from-black to-black/80 text-white px-5 py-4">
                <div className="text-sm opacity-80">{current.category}</div>
                <div className="text-lg font-semibold">{current.title}</div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Gallery;
