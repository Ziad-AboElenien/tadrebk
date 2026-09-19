'use client';

import { useEffect, useRef, useState } from 'react';
import IPhoneFrame from './IPhoneFrame';
import TabletFrame from './TabletFrame';
import { laptopLayoutWidth, useScaledScreen } from './useScaledScreen';

const MIN_SCALE = 0.82;
const MAX_SCALE = 1;

function useDeviceKind() {
  const getKind = () => {
    if (typeof window === 'undefined') return 'laptop';
    if (window.matchMedia('(max-width: 639px)').matches) return 'phone';
    if (window.matchMedia('(max-width: 1023px)').matches) return 'tablet';
    return 'laptop';
  };
  const [kind, setKind] = useState(getKind);
  useEffect(() => {
    const onChange = () => setKind(getKind());
    window.addEventListener('resize', onChange);
    return () => window.removeEventListener('resize', onChange);
  }, []);
  return kind;
}

function LaptopVisual({ children }) {
  const { screenRef, innerRef } = useScaledScreen(laptopLayoutWidth);

  return (
    <div className="mx-auto max-w-4xl">
      {/* ── Lid / screen (narrower than the base) ── */}
      <div className="mx-5 rounded-t-2xl bg-gradient-to-b from-slate-800 to-slate-950 p-2 pb-2.5 shadow-2xl shadow-slate-900/30 sm:mx-10 sm:rounded-t-[1.4rem] sm:p-2.5 sm:pb-3">
        <div className="mb-2 flex justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-600 ring-2 ring-slate-700/60" />
        </div>
        <div
          ref={screenRef}
          className="relative overflow-hidden rounded-lg bg-slate-950 sm:rounded-xl"
          style={{ minHeight: 220 }}
        >
          <div ref={innerRef} className="bg-white">
            {children}
          </div>
          {/* glass glare */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent"
          />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/40" />
        </div>
      </div>
      {/* ── Base / keyboard deck (wider = closer to viewer) ── */}
      <div className="relative">
        <div className="h-1 rounded-t-sm bg-slate-700/60" />
        <div className="relative h-3.5 rounded-b-xl bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 shadow-xl shadow-slate-900/20 sm:h-4">
          <div className="absolute left-1/2 top-0 h-1.5 w-28 -translate-x-1/2 rounded-b-lg bg-slate-500/50" />
          <div aria-hidden className="absolute inset-x-6 bottom-0.5 h-px bg-white/70" />
        </div>
          {/* ground shadow */}
          <div aria-hidden className="mx-auto mt-3 h-5 w-3/4 rounded-[100%] bg-slate-900/15 blur-xl" />
      </div>
    </div>
  );
}

/**
 * Device showcase: iPhone frame on small screens, open laptop on larger ones.
 * The whole device starts small and smoothly scales up while traveling
 * through the viewport.
 */
export default function LaptopShowcase({ children, phoneContent }) {
  const sectionRef = useRef(null);
  const deviceRef = useRef(null);
  // Render only the matching device — one mount, one data fetch, one fit loop.
  const device = useDeviceKind();

  // Scroll-linked grow (one block, from the center).
  useEffect(() => {
    const section = sectionRef.current;
    const device = deviceRef.current;
    if (!section || !device) return;
    let raf = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = Math.min(1, Math.max(0, 1 - rect.top / vh));
      const progress = raw * raw * (3 - 2 * raw);
      const scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress;
      device.style.transform = `scale(${scale.toFixed(3)})`;
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-transparent px-4 py-10 sm:px-8">
      <div
        ref={deviceRef}
        style={{ willChange: 'transform', transformOrigin: 'center center' }}
      >
        {/* Phone on small screens */}
        {device === 'phone' && (
          <IPhoneFrame>{phoneContent || children}</IPhoneFrame>
        )}
        {/* Tablet on medium screens */}
        {device === 'tablet' && (
          <TabletFrame>{children}</TabletFrame>
        )}
        {/* Laptop on larger screens */}
        {device === 'laptop' && (
          <LaptopVisual>{children}</LaptopVisual>
        )}
      </div>
    </section>
  );
}
