'use client';

import { useLayoutEffect, useRef, useState } from 'react';

interface GlassFilterOption {
  key: string;
  label: string;
}

interface GlassFilterProps {
  options: GlassFilterOption[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
}

export default function GlassFilter({ options, value, onChange, ariaLabel }: GlassFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [bubble, setBubble] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const btn = btnRefs.current[value];
      if (!container || !btn) return;
      setBubble({
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        ready: true,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      className="relative flex items-center gap-1 overflow-x-auto rounded-full border border-white/70 bg-white/40 p-1.5 shadow-[0_8px_24px_rgba(148,163,184,0.25),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-1.5 top-1.5 rounded-full border border-white/80 bg-gradient-to-b from-white/95 to-white/60 shadow-[0_4px_16px_rgba(148,163,184,0.35),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: bubble.left,
          width: bubble.width,
          opacity: bubble.ready ? 1 : 0,
        }}
      />
      {options.map((o) => (
        <button
          key={o.key}
          ref={(el) => {
            btnRefs.current[o.key] = el;
          }}
          role="tab"
          aria-selected={value === o.key}
          onClick={() => onChange(o.key)}
          className={`relative z-10 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-all duration-300 ${
            value === o.key ? 'font-semibold text-slate-900' : 'font-medium text-slate-500 hover:text-slate-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
