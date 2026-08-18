'use client';

import { motion } from 'framer-motion';
import type { Category } from '@/features/student/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import Button from '@/components/ui/Button';

const TRACK_ICONS: Record<Category, string> = {
  frontend: 'fa-code',
  backend: 'fa-server',
  fullstack: 'fa-layer-group',
  mobile: 'fa-mobile-screen',
  uiux: 'fa-palette',
  devops: 'fa-gears',
  data_science: 'fa-chart-line',
  ai_ml: 'fa-brain',
  cybersecurity: 'fa-shield-halved',
  qa_testing: 'fa-bug',
  marketing: 'fa-bullhorn',
  sales: 'fa-handshake',
  hr: 'fa-users',
  finance: 'fa-coins',
  design: 'fa-pen-ruler',
  content_writing: 'fa-pen-fancy',
  project_management: 'fa-list-check',
  other: 'fa-ellipsis',
};

const TRACK_COLORS: Record<Category, string> = {
  frontend: 'from-blue-500 to-indigo-500',
  backend: 'from-emerald-500 to-teal-500',
  fullstack: 'from-violet-500 to-purple-500',
  mobile: 'from-orange-400 to-amber-500',
  uiux: 'from-pink-400 to-rose-500',
  devops: 'from-slate-500 to-zinc-600',
  data_science: 'from-cyan-500 to-blue-500',
  ai_ml: 'from-fuchsia-500 to-pink-500',
  cybersecurity: 'from-red-500 to-rose-600',
  qa_testing: 'from-lime-500 to-green-500',
  marketing: 'from-amber-400 to-orange-500',
  sales: 'from-teal-400 to-cyan-500',
  hr: 'from-indigo-400 to-blue-500',
  finance: 'from-emerald-400 to-green-500',
  design: 'from-purple-400 to-violet-500',
  content_writing: 'from-rose-400 to-pink-500',
  project_management: 'from-sky-400 to-blue-500',
  other: 'from-gray-400 to-gray-500',
};

interface Props {
  selected: Category[];
  onToggle: (cat: Category) => void;
  onNext: () => void;
}

export default function Step1Tracks({ selected, onToggle, onNext }: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 h-full flex flex-col">
      <div className="mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
        >
          <i className="fas fa-layer-group text-lg" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">
          What are you interested in?
        </h2>
        <p className="mt-2 text-sm text-gray-400 leading-relaxed">
          Pick the tracks that excite you. We&apos;ll recommend internships that match.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-2 scrollbar-none">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat, i) => {
            const isSelected = selected.includes(cat);
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => onToggle(cat)}
                className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-center transition-all duration-300 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="track-check"
                    className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  >
                    <i className="fas fa-check text-[8px]" />
                  </motion.div>
                )}
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${
                    TRACK_COLORS[cat]
                  } text-white text-sm shadow-sm`}
                >
                  <i className={`fas ${TRACK_ICONS[cat]}`} />
                </div>
                <span className="text-[11px] font-bold text-gray-700 leading-tight">
                  {CATEGORY_LABELS[cat]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <Button
          onClick={onNext}
          disabled={selected.length === 0}
          className="w-full"
        >
          Continue ({selected.length} selected)
          <i className="fas fa-arrow-right text-xs ml-2" />
        </Button>
      </div>
    </div>
  );
}
