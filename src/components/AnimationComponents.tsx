/**
 * Animation Components & Utilities
 * Makes it easy to add smooth animations to pages and components
 */

import React, { ReactNode, useState, useEffect } from 'react';

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
  animation?: 'fadeIn' | 'slideInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'bounceIn' | 'rotateIn';
  duration?: number;
  className?: string;
}

/**
 * Animated Container Component
 * Wraps content with smooth entrance animation
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  delay = 0,
  animation = 'slideInUp',
  duration = 0.6,
  className = '',
}) => {
  const animationClass = `animate-${animation} animate-stagger-${Math.ceil(delay / 0.1)}`;
  const style = {
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
  } as React.CSSProperties;

  return (
    <div className={`${animationClass} ${className}`} style={style}>
      {children}
    </div>
  );
};

interface StaggeredListProps {
  items: ReactNode[];
  itemClassName?: string;
  containerClassName?: string;
  staggerDelay?: number;
  animation?: 'slideInUp' | 'fadeIn' | 'scaleIn' | 'bounceIn';
}

/**
 * Staggered List Component
 * Animates list items with staggered delay
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({
  items,
  itemClassName = '',
  containerClassName = 'stagger-list',
  staggerDelay = 0.1,
  animation = 'slideInUp',
}) => {
  return (
    <div className={containerClassName}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`animate-${animation} ${itemClassName}`}
          style={{
            animationDelay: `${index * staggerDelay}s`,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'slideInUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  className?: string;
  threshold?: number;
}

/**
 * Scroll Reveal Component
 * Triggers animation when element enters viewport
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'slideInUp',
  className = '',
  threshold = 0.1,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${isVisible ? `animate-${animation}` : 'opacity-0'} ${className}`}
    >
      {children}
    </div>
  );
};

interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  animated?: boolean;
}

/**
 * Animated Button Component
 * Button with smooth hover and click animations
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  animated = true,
  className = '',
  ...props
}) => {
  const baseClasses =
    'px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform';

  const variantClasses = {
    primary: 'bg-maroon-700 text-white hover:bg-maroon-800 active:scale-95',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-95',
    outline:
      'border-2 border-maroon-700 text-maroon-700 hover:bg-maroon-50 active:scale-95',
  };

  const animatedClasses = animated
    ? 'btn-animate hover:shadow-lg'
    : 'hover:shadow-md';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${animatedClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'float' | 'scale' | 'glow' | 'none';
}

/**
 * Animated Card Component
 * Card with smooth hover animations
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  hoverEffect = 'float',
}) => {
  const hoverClasses = {
    float: 'hover-float',
    scale: 'hover-scale',
    glow: 'hover-glow',
    none: '',
  };

  return (
    <div
      className={`card-animate ${hoverClasses[hoverEffect]} rounded-lg shadow-md p-6 bg-white ${className}`}
    >
      {children}
    </div>
  );
};

interface FadeInTextProps {
  children: string;
  className?: string;
  delay?: number;
}

/**
 * Fade In Text Component
 * Text that fades in smoothly
 */
export const FadeInText: React.FC<FadeInTextProps> = ({
  children,
  className = '',
  delay = 0,
}) => {
  return (
    <span
      className={`animate-text-fade-in ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
};

/**
 * Smooth Page Transition Wrapper
 * Wrap entire page content for smooth transitions
 */
export const PageTransition: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <div className="page-transition">{children}</div>;
};

/**
 * Smooth Section Divider
 * Animated divider between sections
 */
export const SectionDivider: React.FC = () => {
  return (
    <div className="relative h-20 flex items-center justify-center overflow-hidden">
      <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="relative bg-white px-4 text-gray-400">
        <span className="animate-pulse">✦</span>
      </div>
    </div>
  );
};
