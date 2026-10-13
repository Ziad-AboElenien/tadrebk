'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Mounts heavy below-the-fold sections only when the visitor scrolls near
 * them — their JS chunks, effects and API calls never run on initial load.
 * Reserves vertical space to avoid layout shift.
 */
export default function LazySection({
  children,
  minHeight = 420,
  rootMargin = '600px',
  label,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} aria-label={label} style={visible ? undefined : { minHeight }}>
      {visible ? (
        children
      ) : (
        <div aria-hidden="true" className="mx-auto max-w-5xl px-4 sm:px-8">
          <div className="animate-pulse space-y-4 py-10">
            <div className="mx-auto h-8 w-64 rounded-xl bg-slate-100" />
            <div className="mx-auto h-4 w-96 max-w-full rounded-full bg-slate-100" />
            <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
