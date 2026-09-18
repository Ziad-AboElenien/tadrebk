'use client';

import { useEffect, useRef } from 'react';

/**
 * Measures the screen box and scales the inner layout to fit it exactly.
 * `getLayoutWidth` decides the virtual width the content is laid out at.
 */
export function useScaledScreen(getLayoutWidth, options) {
  const lockHeight = options && options.lockHeight;
  const screenRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const screen = screenRef.current;
    const inner = innerRef.current;
    if (!screen || !inner) return;
    let raf = 0;
    let lastW = 0;
    let lastH = 0;
    const fit = () => {
      const availW = screen.clientWidth;
      if (!availW) return;
      const contentH = inner.scrollHeight;
      const lw = getLayoutWidth();
      const s = availW / lw;
      if (Math.abs(availW - lastW) < 0.5 && Math.abs(contentH * s - lastH) < 1) return;
      lastW = availW;
      inner.style.width = `${lw}px`;
      inner.style.transform = `scale(${s})`;
      inner.style.transformOrigin = 'top left';
      if (!lockHeight) {
        const h = Math.ceil(contentH * s);
        lastH = h;
        screen.style.height = `${h}px`;
      }
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    schedule();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    if (ro) ro.observe(inner);
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('resize', schedule);
      if (ro) ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [getLayoutWidth, lockHeight]);

  return { screenRef, innerRef };
}

export function laptopLayoutWidth() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  if (vw < 640) return 720;
  if (vw < 1024) return 1100;
  return 1400;
}

export function phoneLayoutWidth() {
  return 430;
}
