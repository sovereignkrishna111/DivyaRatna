import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePublicBirthdays } from '../hooks/usePublicBirthdays';
import Reveal from './Reveal';
import { Facebook } from 'lucide-react';
import { useSiteSettings } from '../theme/siteSettings';

const fallbackImage =
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=900&h=900&dpr=1';

function labelFor(p: { role?: string; className?: string; section?: string }) {
  const parts: string[] = [];
  if (p.role) parts.push(p.role);
  if (p.className) parts.push(`Class ${p.className}${p.section ? ` • ${p.section}` : ''}`);
  return parts.join(' • ');
}

function dot(n: number) {
  return String(n).padStart(2, '0');
}

function formatUntil(iso: string) {
  try {
    const d = new Date(iso);
    return `${dot(d.getHours())}:${dot(d.getMinutes())}`;
  } catch {
    return '';
  }
}

const BirthdayCelebrationsSection: React.FC = () => {
  const { items, loading } = usePublicBirthdays();
  const { getSocialUrl } = useSiteSettings();

  const show = (items.length > 0 || loading) && (loading || items.length > 0);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const confetti = useMemo(() => {
    const colors = ['bg-gold-400', 'bg-gold-300', 'bg-maroon-600', 'bg-maroon-400', 'bg-rose-400'];
    return Array.from({ length: 26 }).map((_, i) => {
      const left = (i * 29) % 100;
      const top = (i * 17) % 100;
      const size = 5 + ((i * 7) % 10);
      const delay = (i % 10) * 0.12;
      const color = colors[i % colors.length];
      const shape = i % 3;
      return { left, top, size, delay, color, shape };
    });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      const center = el.scrollLeft + el.clientWidth / 2;

      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      for (let i = 0; i < children.length; i++) {
        const c = children[i];
        const cCenter = c.offsetLeft + c.clientWidth / 2;
        const dist = Math.abs(cCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      setActiveIndex(best);
    };

    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (loading) return;
    if (items.length <= 1) return;

    let paused = false;

    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchstart', onEnter, { passive: true });
    el.addEventListener('touchend', onLeave);

    const id = window.setInterval(() => {
      if (paused) return;
      const children = Array.from(el.children) as HTMLElement[];
      if (!children.length) return;
      const next = (activeIndex + 1) % children.length;
      const target = children[next];
      el.scrollTo({ left: target.offsetLeft - 16, behavior: 'smooth' });
    }, 4500);

    return () => {
      window.clearInterval(id);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchstart', onEnter);
      el.removeEventListener('touchend', onLeave);
    };
  }, [activeIndex, items, loading]);

  if (!show) return null;

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div className="absolute inset-0 bg-white" />

      {confetti.map((c, idx) => (
        <div
          key={idx}
          className={`pointer-events-none absolute opacity-30 ${c.color} ${c.shape === 0 ? 'rounded-full' : c.shape === 1 ? 'rounded-[4px]' : 'rounded-full'}`}
          style={{
            left: `${c.left}%`,
            top: `${c.top}%`,
            width: `${c.size}px`,
            height: `${c.shape === 1 ? c.size * 1.6 : c.size}px`,
            transform: c.shape === 1 ? 'rotate(18deg)' : undefined,
            animation: `cta-breathe-sm 1.9s ease-in-out ${c.delay}s infinite`,
            filter: 'blur(0.15px)'
          }}
        />
      ))}

      <div className="relative w-full px-3 sm:px-5 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-col items-center text-center">
            <Reveal as="h2" variant="up" className="mt-4 text-3xl sm:text-4xl lg:text-[44px] font-light tracking-wide text-maroon-900">
              Happy Birthday
            </Reveal>
            <Reveal as="p" variant="up" delayMs={120} className="mt-2 text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed">
              Wishing everyone a day filled with smiles, love, and beautiful moments of celebration.
            </Reveal>
          </div>

          <Reveal as="div" variant="up" delayMs={180} className="mt-7 sm:mt-9 relative">
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-gold-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-maroon-700/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-6 -bottom-8 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />

            <div className="pointer-events-none absolute right-6 bottom-6 opacity-70">
              <div className="relative">
                <div className="absolute -inset-8 rounded-full bg-gold-400/10 blur-2xl" />
                <div className="grid grid-cols-3 gap-3">
                  <span className="h-3 w-3 rounded-full bg-maroon-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gold-300/80" />
                  <span className="h-3 w-3 rounded-full bg-rose-300/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-gold-300/70" />
                  <span className="h-3 w-3 rounded-full bg-maroon-300/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-300/60" />
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-gray-200 bg-white shadow-[0_22px_70px_-45px_rgba(17,24,39,0.25)] overflow-hidden">
              <div className="px-5 sm:px-7 lg:px-10 py-4 sm:py-5 bg-gradient-to-r from-white via-maroon-50/60 to-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-maroon-900">
                  <div className="text-lg sm:text-xl font-semibold tracking-wide">Today’s Birthday Wishes</div>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const fb = getSocialUrl('facebook');
                    if (!fb) return null;
                    return (
                      <a
                        href={fb}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs font-semibold text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors"
                        aria-label="View on Facebook"
                        title="View on Facebook"
                      >
                        <Facebook className="h-4 w-4" />
                        Facebook
                      </a>
                    );
                  })()}
                  <div className="text-xs font-semibold text-maroon-700">
                    {items[0]?.endAt ? `Active until ${formatUntil(items[0].endAt)}` : ''}
                  </div>
                </div>
              </div>

              <div className="px-3 sm:px-6 lg:px-10 py-6 sm:py-8">
                {loading ? (
                  <div className="flex gap-4 overflow-hidden">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="min-w-[88%] sm:min-w-[64%] lg:min-w-[44%] rounded-[22px] border border-gray-200 bg-white p-6">
                        <div className="mx-auto h-48 w-48 sm:h-56 sm:w-56 rounded-full bg-gray-100 animate-pulse" />
                        <div className="mt-6 h-5 w-2/3 mx-auto bg-gray-100 rounded animate-pulse" />
                        <div className="mt-2 h-4 w-1/2 mx-auto bg-gray-100 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      ref={scrollerRef}
                      className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 sm:px-2 pb-4"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {items.map((p) => (
                        <div
                          key={p.id}
                          className="snap-center min-w-[92%] sm:min-w-[70%] lg:min-w-[48%] xl:min-w-[calc((100%-3rem)/3)]"
                        >
                          <Reveal as="div" variant="up" className="relative overflow-hidden rounded-[24px] border border-gray-200 bg-gradient-to-br from-white via-maroon-50/30 to-white shadow-[0_18px_55px_-40px_rgba(17,24,39,0.22)]">
                            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold-400/10 blur-3xl" />
                            <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-maroon-700/10 blur-3xl" />

                            <div className="px-5 sm:px-7 pt-6 pb-6">
                              <div className="flex flex-col items-center text-center">
                                <div className="relative">
                                  <div className="absolute -inset-4 rounded-[999px] bg-gradient-to-r from-gold-400/30 via-white/30 to-maroon-500/20 blur-md" />
                                  <div className="absolute -inset-7 rounded-[999px] bg-gradient-to-r from-gold-400/10 via-transparent to-maroon-500/10 blur-2xl" />
                                  <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-[conic-gradient(from_180deg,rgba(245,158,11,0.65),rgba(255,255,255,0.45),rgba(153,27,27,0.45),rgba(245,158,11,0.65))]" />
                                    <div className="absolute inset-[5px] rounded-full overflow-hidden bg-black/10">
                                      <img
                                        src={p.imageUrl || fallbackImage}
                                        alt={p.name}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                    </div>
                                  </div>
                                  <div className="pointer-events-none absolute -right-3 top-2 h-10 w-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <span className="text-lg">🎉</span>
                                  </div>
                                  <div className="pointer-events-none absolute -left-3 bottom-2 h-10 w-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                                    <span className="text-lg">🎂</span>
                                  </div>
                                </div>

                                <div className="mt-7">
                                  <div className="text-2xl sm:text-3xl font-semibold tracking-wide text-maroon-900">
                                    {p.name}
                                  </div>
                                  <div className="mt-2 inline-flex flex-col items-center gap-1">
                                    <div className="text-sm sm:text-base font-semibold text-maroon-700">
                                      {p.role || 'School Family'}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      {p.className ? `Class ${p.className}` : ''}{p.section ? ` • Section ${p.section}` : ''}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-6 w-full">
                                  <div className="mx-auto max-w-sm rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-800">
                                    {labelFor(p) ? labelFor(p) : 'Wishing you a wonderful year ahead!'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Reveal>
                        </div>
                      ))}
                    </div>

                    {items.length > 1 && (
                      <div className="mt-4 flex items-center justify-center gap-2">
                        {items.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              const el = scrollerRef.current;
                              if (!el) return;
                              const child = el.children[i] as HTMLElement | undefined;
                              if (!child) return;
                              el.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' });
                            }}
                            className={`h-2.5 rounded-full transition-all ${i === activeIndex ? 'w-8 bg-maroon-700' : 'w-2.5 bg-gray-300 hover:bg-gray-400'}`}
                            aria-label={`Go to birthday ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default BirthdayCelebrationsSection;
