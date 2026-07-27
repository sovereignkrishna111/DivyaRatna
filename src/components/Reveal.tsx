import React, { ElementType, useEffect, useMemo, useRef, useState } from 'react';

type ObserverEntry = {
  observer: IntersectionObserver;
  elements: Map<Element, { setIsInView: (v: boolean) => void; once: boolean }>;
};

const observerCache = new Map<number, ObserverEntry>();

function getObserverEntry(threshold: number): ObserverEntry {
  const existing = observerCache.get(threshold);
  if (existing) return existing;

  const elements = new Map<Element, { setIsInView: (v: boolean) => void; once: boolean }>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const meta = elements.get(entry.target);
        if (!meta) continue;

        if (entry.isIntersecting) {
          meta.setIsInView(true);
          if (meta.once) {
            observer.unobserve(entry.target);
            elements.delete(entry.target);
          }
        } else if (!meta.once) {
          meta.setIsInView(false);
        }
      }
    },
    {
      threshold,
      rootMargin: '0px 0px -10% 0px'
    }
  );

  const created: ObserverEntry = { observer, elements };
  observerCache.set(threshold, created);
  return created;
}

type RevealVariant = 'up' | 'down' | 'left' | 'right' | 'scale' | 'none';

type RevealProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: React.ReactNode;
  delayMs?: number;
  durationMs?: number;
  once?: boolean;
  threshold?: number;
  variant?: RevealVariant;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

function variantClass(variant: RevealVariant) {
  switch (variant) {
    case 'down':
      return 'reveal-down';
    case 'left':
      return 'reveal-left';
    case 'right':
      return 'reveal-right';
    case 'scale':
      return 'reveal-scale';
    case 'none':
      return 'reveal-none';
    case 'up':
    default:
      return 'reveal-up';
  }
}

const Reveal = <T extends ElementType = 'div'>(props: RevealProps<T>) => {
  const {
    as,
    className,
    children,
    delayMs,
    durationMs,
    once = true,
    threshold = 0.15,
    variant = 'up',
    ...rest
  } = props;

  const Tag = (as || 'div') as ElementType;

  const ref = useRef<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  const style = useMemo<React.CSSProperties>(() => {
    const s: React.CSSProperties = {};
    if (typeof delayMs === 'number') s.transitionDelay = `${delayMs}ms`;
    if (typeof durationMs === 'number') s.transitionDuration = `${durationMs}ms`;
    return s;
  }, [delayMs, durationMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    if (typeof window.IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const entry = getObserverEntry(threshold);
    entry.elements.set(el, { setIsInView, once });
    entry.observer.observe(el);

    requestAnimationFrame(() => {
      try {
        const rect = el.getBoundingClientRect();
        const visible = rect.bottom >= 0 && rect.top <= window.innerHeight;
        if (visible) setIsInView(true);
      } catch (e) {
        void e;
      }
    });

    return () => {
      entry.elements.delete(el);
      try {
        entry.observer.unobserve(el);
      } catch (e) {
        void e;
      }
    };
  }, [once, threshold]);

  return (
    <Tag
      {...rest}
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      style={style}
      className={[
        'reveal',
        variantClass(variant),
        isInView ? 'reveal--in' : 'reveal--out',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
