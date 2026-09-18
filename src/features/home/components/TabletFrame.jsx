'use client';

import { tabletLayoutWidth, useScaledScreen } from './useScaledScreen';

/**
 * Tablet mockup (landscape) showing a section live.
 * Used on medium screens — laptop below lg doesn't fit, phone wastes space.
 */
export default function TabletFrame({ children }) {
  const { screenRef, innerRef } = useScaledScreen(tabletLayoutWidth, { lockHeight: true });

  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* ── Body ── */}
      <div className="rounded-[2.5rem] bg-slate-900 p-2.5 shadow-2xl shadow-slate-900/30 ring-1 ring-slate-700">
        {/* side button */}
        <div aria-hidden className="absolute -right-[2px] top-20 h-14 w-[3px] rounded-r-md bg-slate-700" />
        {/* camera */}
        <div aria-hidden className="absolute left-1/2 top-[6px] z-10 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-slate-600 ring-2 ring-slate-700/60" />
        {/* ── Screen: portrait tablet ── */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-slate-950">
          <div ref={screenRef} className="h-full w-full overflow-hidden">
            <div ref={innerRef} className="bg-white">
              {children}
            </div>
          </div>
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
