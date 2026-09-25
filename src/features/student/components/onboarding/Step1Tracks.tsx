'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Category } from '@/features/student/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import Button from '@/components/ui/Button';

const TRACK_META: Record<Category, { icon: string; gradient: string }> = {
  frontend: { icon: 'fa-code', gradient: 'from-blue-500 to-indigo-600' },
  backend: { icon: 'fa-server', gradient: 'from-emerald-500 to-teal-600' },
  fullstack: { icon: 'fa-layer-group', gradient: 'from-violet-500 to-purple-600' },
  mobile: { icon: 'fa-mobile-screen', gradient: 'from-orange-400 to-amber-600' },
  uiux: { icon: 'fa-palette', gradient: 'from-pink-400 to-rose-600' },
  devops: { icon: 'fa-gears', gradient: 'from-slate-500 to-zinc-700' },
  data_science: { icon: 'fa-chart-line', gradient: 'from-cyan-500 to-blue-600' },
  ai_ml: { icon: 'fa-brain', gradient: 'from-fuchsia-500 to-pink-600' },
  cybersecurity: { icon: 'fa-shield-halved', gradient: 'from-red-500 to-rose-700' },
  qa_testing: { icon: 'fa-bug', gradient: 'from-lime-500 to-green-600' },
  marketing: { icon: 'fa-bullhorn', gradient: 'from-amber-400 to-orange-600' },
  sales: { icon: 'fa-handshake', gradient: 'from-teal-400 to-cyan-600' },
  hr: { icon: 'fa-users', gradient: 'from-indigo-400 to-blue-600' },
  finance: { icon: 'fa-coins', gradient: 'from-emerald-400 to-green-600' },
  design: { icon: 'fa-pen-ruler', gradient: 'from-purple-400 to-violet-600' },
  content_writing: { icon: 'fa-pen-fancy', gradient: 'from-rose-400 to-pink-600' },
  project_management: { icon: 'fa-list-check', gradient: 'from-sky-400 to-blue-600' },
  other: { icon: 'fa-ellipsis', gradient: 'from-gray-400 to-gray-600' },
};

interface Props {
  selected: Category[];
  onToggle: (cat: Category) => void;
  onNext: () => void;
}

export default function Step1Tracks({ selected, onToggle, onNext }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const cats = (Object.keys(CATEGORY_LABELS) as Category[]).filter(
    (c) => !q || CATEGORY_LABELS[c].toLowerCase().includes(q),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_70px_-24px_rgba(16,185,129,0.35)]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-6 pb-8 pt-7 sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-10 h-28 w-28 rounded-full bg-white/10 blur-xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100">Step 1 of 3 · Interests</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-[28px] sm:leading-snug">
          What do you want to explore?
        </h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-emerald-50/90">
          Pick at least one track — we&apos;ll shape your feed around it.
        </p>
        <div className="relative mt-4">
          <i className="fas fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks… (e.g. design, data)"
            aria-label="Search tracks"
            className="w-full rounded-2xl border-0 bg-white/95 py-3 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-lg shadow-emerald-900/10 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/70"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cats.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No tracks match “{query}”. Try another word.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {cats.map((cat, i) => {
              const isSelected = selected.includes(cat);
              const meta = TRACK_META[cat];
              return (
                <motion.button
                  key={cat}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.4), duration: 0.3 }}
                  onClick={() => onToggle(cat)}
                  whileTap={{ scale: 0.94 }}
                  className={`group relative flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-500/[0.07] shadow-[inset_0_0_0_2px_#10b981]'
                      : 'bg-slate-50 shadow-[inset_0_0_0_1.5px_#eef2f7] hover:bg-white hover:shadow-[inset_0_0_0_1.5px_#cbd5e1,0_8px_20px_-10px_rgba(15,23,42,0.25)]'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-base text-white shadow-md transition-transform duration-200 ${
                      isSelected ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  >
                    <i className={`fas ${meta.icon}`} />
                  </span>
                  <span className={`text-[11px] font-bold leading-tight ${isSelected ? 'text-emerald-800' : 'text-slate-600'}`}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span
                    className={`absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-300 transition-all duration-200 ${
                      isSelected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                    }`}
                  >
                    <i className="fas fa-check text-[9px]" />
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-slate-100 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-5">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-400">
          {selected.length === 0 ? (
            'Select at least one track'
          ) : (
            <span className="text-emerald-600">{selected.length} track{selected.length > 1 ? 's' : ''} selected</span>
          )}
        </p>
        <Button onClick={onNext} disabled={selected.length === 0} className="!w-auto px-7">
          Continue <i className="fas fa-arrow-right ml-2 text-xs" />
        </Button>
      </div>
    </div>
  );
}
