'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Category } from '@/features/student/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import { internshipService } from '@/features/internship/services/internship.service';
import type { Internship } from '@/features/internship/types';
import Button from '@/components/ui/Button';

const TRACK_ICONS: Record<string, string> = {
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

const CARD_TINTS = [
  'from-emerald-500 to-teal-500',
  'from-blue-500 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
];

interface Props {
  selectedTracks: Category[];
  onBack: () => void;
  onFinish: () => void;
  saving: boolean;
  userName: string;
}

export default function Step3Recommendations({
  selectedTracks,
  onBack,
  onFinish,
  saving,
  userName,
}: Props) {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { internships: all } = await internshipService.listInternships({ limit: 30 });
        if (cancelled) return;
        const matched = all.filter((intern) => {
          const tracks = intern.track || [];
          const cats = intern.categories || [];
          return selectedTracks.some(
            (t) => tracks.includes(t) || cats.includes(t)
          );
        });
        setInternships(matched.length > 0 ? matched.slice(0, 5) : all.slice(0, 5));
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTracks]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-[0_24px_70px_-24px_rgba(16,185,129,0.4)]">
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Celebration */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 px-6 pb-8 pt-8 text-center sm:px-8">
          <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 -right-8 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <motion.div
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 13, delay: 0.1 }}
            className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-emerald-500 shadow-xl shadow-emerald-900/20"
          >
            <i className="fas fa-check text-3xl" />
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1], opacity: [0, 0.6, 0] }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="absolute inset-0 rounded-full border-4 border-white"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-100">
              Step 3 of 3 · All set
            </p>
            <h2 className="mt-1.5 text-2xl font-black text-white sm:text-[28px]">
              Welcome aboard{userName && userName !== 'there' ? `, ${userName}` : ''}!
            </h2>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5">
              {selectedTracks.map((cat, i) => (
                <motion.span
                  key={cat}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white backdrop-blur"
                >
                  <i className={`fas ${TRACK_ICONS[cat] || 'fa-tag'} text-[9px]`} />
                  {CATEGORY_LABELS[cat] || cat}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Matches */}
        <div className="px-4 py-5 sm:px-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-black text-slate-900">
              {loading ? 'Finding your matches…' : 'Top matches for you'}
            </p>
            {!loading && internships.length > 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                {internships.length} found
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex animate-pulse items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-1/2 rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : internships.length > 0 ? (
            <div className="space-y-2.5">
              {internships.map((intern, i) => {
                const company =
                  typeof intern.companyId === 'object'
                    ? intern.companyId
                    : intern.company;
                const companyName =
                  typeof company === 'object' && company?.name
                    ? company.name
                    : 'Company';
                return (
                  <motion.div
                    key={intern._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.07 }}
                  >
                    <Link
                      href={`/internships/${intern._id}`}
                      className="group flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5 shadow-[inset_0_0_0_1.5px_transparent] transition-all duration-200 hover:bg-white hover:shadow-[inset_0_0_0_1.5px_#a7f3d0,0_10px_24px_-12px_rgba(16,185,129,0.5)]"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${CARD_TINTS[i % CARD_TINTS.length]} text-sm text-white shadow-md`}
                      >
                        <i className="fas fa-briefcase" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                          {intern.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {companyName} · {intern.location || 'Remote'}
                        </span>
                      </span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition-all group-hover:bg-emerald-500 group-hover:text-white">
                        <i className="fas fa-arrow-right text-[11px]" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
              <i className="fas fa-magnifying-glass mb-2 block text-xl text-slate-300" />
              <p className="text-xs text-slate-400">No matches yet — new internships land daily.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-slate-100 bg-white/90 px-4 py-3.5 backdrop-blur sm:px-5">
        <Button variant="secondary" onClick={onBack} className="!w-auto px-6" disabled={saving}>
          <i className="fas fa-arrow-left mr-2 text-xs" /> Back
        </Button>
        <Button onClick={onFinish} className="flex-1" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2 text-xs" /> Saving…
            </>
          ) : (
            <>
              Take the tour <i className="fas fa-route ml-2 text-xs" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
