import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Reveal from './Reveal';

type GalleryRow = {
  id: string;
  title: string;
  type: string;
  image_url: string;
  sort_order: number;
  published: boolean;
};

type AlbumItem = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  sortOrder: number;
};

const HomeImageAlbumSection: React.FC = () => {
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ dragging: boolean; moved: boolean; startX: number; startScrollLeft: number } | null>(null);

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
      setActiveIndex(0);
    };

    fetchAll();

    const ch = supabase
      .channel('realtime-home-album')
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

  const canSlide = items.length > 1;

  const slides = useMemo(() => {
    // Requirement: "sequence. each. faculty one. one." -> show one slide at a time.
    // We still keep it responsive; each slide snaps to center.
    return items;
  }, [items]);

  const scrollToIndex = useCallback((idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    if (slides.length === 0) return;

    const safe = ((idx % slides.length) + slides.length) % slides.length;
    const child = el.children.item(safe) as HTMLElement | null;
    if (!child) return;

    const childCenter = child.offsetLeft + child.clientWidth / 2;
    const containerCenter = el.clientWidth / 2;
    const targetLeft = Math.max(0, childCenter - containerCenter);

    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setActiveIndex(safe);
  }, [slides.length]);

  const prev = () => {
    if (!canSlide) return;
    scrollToIndex(activeIndex - 1);
  };

  const next = () => {
    if (!canSlide) return;
    scrollToIndex(activeIndex + 1);
  };

  useEffect(() => {
    if (!canSlide) return;

    const t = window.setInterval(() => {
      // Avoid auto-advancing while dragging
      if (dragRef.current?.dragging) return;
      scrollToIndex(activeIndex + 1);
    }, 5000);

    return () => window.clearInterval(t);
  }, [activeIndex, canSlide, scrollToIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;

      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      let bestIdx = 0;
      let bestDist = Number.POSITIVE_INFINITY;

      for (let i = 0; i < children.length; i += 1) {
        const c = children[i];
        const cCenter = c.offsetLeft + c.clientWidth / 2;
        const dist = Math.abs(cCenter - containerCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = i;
        }
      }

      setActiveIndex(bestIdx);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [slides.length]);

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = scrollerRef.current;
    if (!el) return;

    dragRef.current = {
      dragging: true,
      moved: false,
      startX: e.pageX,
      startScrollLeft: el.scrollLeft,
    };

    el.classList.add('cursor-grabbing');
  };

  const onMouseLeaveOrUp = () => {
    const el = scrollerRef.current;
    if (!el) return;

    if (dragRef.current) {
      dragRef.current.dragging = false;
    }

    el.classList.remove('cursor-grabbing');
  };

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = scrollerRef.current;
    const d = dragRef.current;
    if (!el || !d?.dragging) return;

    e.preventDefault();
    const dx = e.pageX - d.startX;
    if (Math.abs(dx) > 6) d.moved = true;
    el.scrollLeft = d.startScrollLeft - dx;
  };

  const openViewer = (idx: number) => {
    const moved = dragRef.current?.moved;
    if (moved) return;
    setViewerIndex(idx);
  };

  const closeViewer = () => setViewerIndex(null);

  const viewerPrev = () => {
    setViewerIndex((i) => {
      if (i === null) return null;
      return (i - 1 + slides.length) % slides.length;
    });
  };

  const viewerNext = () => {
    setViewerIndex((i) => {
      if (i === null) return null;
      return (i + 1) % slides.length;
    });
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10" variant="up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-6 tracking-wide">
            Image Album
          </h2>
          <div className="w-24 h-1 bg-brand mx-auto mb-8"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            A quick look at our latest moments — slide through one by one.
          </p>

          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={!canSlide}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow disabled:opacity-40"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!canSlide}
              className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white shadow-sm hover:shadow disabled:opacity-40"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </Reveal>

        <Reveal as="div" variant="up" delayMs={120} className="relative">
          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 snap-x snap-mandatory scroll-smooth cursor-grab select-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseLeaveOrUp}
            onMouseLeave={onMouseLeaveOrUp}
            onMouseMove={onMouseMove}
          >
            {slides.map((it, idx) => (
              <div
                key={it.id}
                className="snap-center flex-[0_0_86%] sm:flex-[0_0_70%] lg:flex-[0_0_56%]"
              >
                <button
                  type="button"
                  onClick={() => openViewer(idx)}
                  className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-shadow w-full text-left"
                >
                  <div className="relative">
                    <img
                      src={it.imageUrl}
                      alt={it.title}
                      className="w-full h-[320px] sm:h-[420px] lg:h-[460px] object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute left-5 right-5 bottom-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="inline-flex text-[11px] px-2.5 py-1 rounded-full bg-white/90 text-gray-800 border border-white/60">
                            {it.category}
                          </div>
                          <div className="mt-2 text-white font-semibold text-lg sm:text-xl leading-snug truncate">
                            {it.title}
                          </div>
                        </div>
                        <div className="hidden sm:block text-white/80 text-xs">
                          {activeIndex + 1}/{slides.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}

            {slides.length === 0 && (
              <div className="w-full rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                No images yet.
              </div>
            )}
          </div>

          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-2">
              {slides.slice(0, Math.min(10, slides.length)).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => scrollToIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activeIndex ? 'w-8 bg-maroon-700' : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </Reveal>
      </div>

      {viewerIndex !== null && slides[viewerIndex] && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeViewer} />
          <div className="relative z-50 w-full max-w-5xl rounded-2xl overflow-hidden bg-black shadow-2xl">
            <button
              type="button"
              onClick={closeViewer}
              className="absolute top-3 right-3 z-10 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={viewerPrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={viewerNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <img
              src={slides[viewerIndex].imageUrl}
              alt={slides[viewerIndex].title}
              className="w-full max-h-[78vh] object-contain bg-black"
              loading="eager"
              decoding="async"
            />
            <div className="bg-gradient-to-r from-black to-black/80 text-white px-5 py-4">
              <div className="text-sm opacity-80">{slides[viewerIndex].category}</div>
              <div className="text-lg font-semibold">{slides[viewerIndex].title}</div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};

export default HomeImageAlbumSection;
