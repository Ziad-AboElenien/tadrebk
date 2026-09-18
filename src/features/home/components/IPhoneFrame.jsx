'use client';

import { phoneLayoutWidth, useScaledScreen } from './useScaledScreen';

/**
 * iPhone mockup showing a section live on a phone display.
 * Used on small screens where the laptop frame doesn't fit.
 */
export default function IPhoneFrame({ children }) {
  const { screenRef, innerRef } = useScaledScreen(phoneLayoutWidth);

  return (
    <div className="relative mx-auto w-[270px] max-w-full">
      {/* ── Body ── */}
      <div className="rounded-[3rem] bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/30 ring-1 ring-slate-700">
        {/* side buttons */}
        <div aria-hidden className="absolute -left-[2px] top-24 h-10 w-[3px] rounded-l-md bg-slate-700" />
        <div aria-hidden className="absolute -left-[2px] top-40 h-14 w-[3px] rounded-l-md bg-slate-700" />
        <div aria-hidden className="absolute -right-[2px] top-32 h-16 w-[3px] rounded-r-md bg-slate-700" />
        {/* ── Screen ── */}
        <div className="relative overflow-hidden rounded-[2.4rem] bg-slate-950">
          <div ref={screenRef} className="w-full overflow-hidden">
            <div ref={innerRef} className="bg-white">
              {children}
            </div>
          </div>
          {/* dynamic island */}
          <div aria-hidden className="absolute left-1/2 top-2.5 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black shadow" />
          {/* home indicator */}
          <div aria-hidden className="absolute bottom-1.5 left-1/2 z-10 h-1 w-28 -translate-x-1/2 rounded-full bg-slate-900/70" />
          {/* glass glare */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[5] bg-gradient-to-br from-white/10 via-transparent to-transparent"
          />
        </div>
      </div>
      {/* ground shadow */}
      <div aria-hidden className="mx-auto mt-3 h-4 w-2/3 rounded-[100%] bg-slate-900/15 blur-lg" />
    </div>
  );
}
