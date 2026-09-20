'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Measures a wrapper's width (ResizeObserver + window resize) so d3 charts
 * draw AND set their viewBox at the real rendered width. Without this the
 * fixed 560 viewBox shrinks drawings on narrow screens.
 */
export function useChartWidth(fallback = 560) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const w = Math.round(el.clientWidth);
      if (w > 0) setWidth((prev) => (prev === w ? prev : w));
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    const t = window.setTimeout(update, 0);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (ro) ro.observe(el);
    window.addEventListener('resize', schedule);
    return () => {
      window.clearTimeout(t);
      if (ro) ro.disconnect();
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { ref, width };
}
