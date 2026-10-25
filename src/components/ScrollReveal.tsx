import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  distancePx?: number;
  threshold?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delayMs = 0,
  className = '',
  distancePx = 24,
  threshold = 0.12,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distancePx}px, 0)`,
        transitionProperty: 'opacity, transform',
        transitionDuration: '850ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};
