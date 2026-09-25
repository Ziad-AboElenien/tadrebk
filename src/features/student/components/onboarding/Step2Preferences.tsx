'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface Preferences {
  location?: 'on-site' | 'remote' | 'hybrid';
  type?: 'full-time' | 'part-time';
}

interface Props {
  preferences: Preferences;
  onChange: (p: Preferences) => void;
  onNext: () => void;
  onBack: () => void;
}

const GROUPS: {
  key: 'location' | 'type';
  title: string;
  subtitle: string;
  options: { value: string; label: string; desc: string; icon: string }[];
}[] = [
  {
    key: 'location',
    title: 'Where do you want to work?',
    subtitle: 'Choose the setup that fits your life',
    options: [
      { value: 'on-site', label: 'On-site', desc: 'At the office every day', icon: 'fa-building' },
      { value: 'hybrid', label: 'Hybrid', desc: 'Split office & home', icon: 'fa-arrows-left-right-to-line' },
      { value: 'remote', label: 'Remote', desc: 'Work from anywhere', icon: 'fa-house-laptop' },
    ],
  },
  {
    key: 'type',
    title: 'How much time can you give?',
    subtitle: 'Match internships to your schedule',
    options: [
      { value: 'full-time', label: 'Full-time', desc: 'Around 40 hrs / week', icon: 'fa-briefcase' },
      { value: 'part-time', label: 'Part-time', desc: 'Flexible fewer hours', icon: 'fa-hourglass-half' },
    ],
  },
];

export default function Step2Preferences({ preferences, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_70px_-24px_rgba(59,130,246,0.35)]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2e35] via-slate-800 to-slate-700 px-6 pb-7 pt-7 sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Step 2 of 3 · Preferences</p>
        <h2 className="mt-2 text-2xl font-black text-white sm:text-[28px] sm:leading-snug">
          Fine-tune your matches
        </h2>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-300">
          Optional — skip anything you&apos;re flexible about.
        </p>
      </div>

      {/* Options */}
      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {GROUPS.map((group, gi) => (
          <div key={group.key}>
            <p className="text-sm font-black text-slate-900">{group.title}</p>
            <p className="mb-3 mt-0.5 text-xs text-slate-400">{group.subtitle}</p>
            <div className="space-y-2">
              {group.options.map((opt, i) => {
                const current = preferences[group.key];
                const isSelected = current === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: gi * 0.12 + i * 0.07, duration: 0.3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (group.key === 'location') {
                        const v = opt.value as Preferences['location'];
                        onChange({ ...preferences, location: isSelected ? undefined : v });
                      } else {
                        const v = opt.value as Preferences['type'];
                        onChange({ ...preferences, type: isSelected ? undefined : v });
                      }
                    }}
                    className={`flex w-full items-center gap-3.5 rounded-2xl p-3.5 text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-emerald-500/[0.07] shadow-[inset_0_0_0_2px_#10b981]'
                        : 'bg-slate-50 shadow-[inset_0_0_0_1.5px_#eef2f7] hover:bg-white hover:shadow-[inset_0_0_0_1.5px_#cbd5e1]'
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm transition-colors duration-200 ${
                        isSelected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-white text-slate-400 shadow-sm'
                      }`}
                    >
                      <i className={`fas ${opt.icon}`} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {opt.label}
                      </span>
                      <span className="block truncate text-xs text-slate-400">{opt.desc}</span>
                    </span>
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200 bg-white'
                      }`}
                    >
                      {isSelected && <i className="fas fa-check text-[9px] text-white" />}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-slate-100 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-5">
        <Button variant="secondary" onClick={onBack} className="!w-auto px-6">
          <i className="fas fa-arrow-left mr-2 text-xs" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          See my matches <i className="fas fa-sparkles ml-2 text-xs" />
        </Button>
      </div>
    </div>
  );
}
