'use client';

import { useState, useEffect } from 'react';
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

const CARD_GRADIENTS = [
  'from-emerald-500 to-teal-400',
  'from-blue-500 to-indigo-400',
  'from-amber-400 to-orange-400',
  'from-pink-400 to-rose-400',
  'from-violet-500 to-purple-400',
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
        setInternships(matched.length > 0 ? matched.slice(0, 6) : all.slice(0, 6));
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTracks]);

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none -mx-2 px-2">
        {/* Success Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-200"
          >
            <i className="fas fa-check text-2xl" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl sm:text-2xl font-black text-gray-900"
          >
            You&apos;re all set, {userName}!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-gray-400"
          >
            Here are tracks we recommend for you
          </motion.p>
        </div>

        {/* Recommended Tracks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {selectedTracks.map((cat, i) => (
            <motion.span
              key={cat}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700"
            >
              <i className={`fas ${TRACK_ICONS[cat] || 'fa-tag'} text-[10px]`} />
              {CATEGORY_LABELS[cat] || cat}
            </motion.span>
          ))}
        </motion.div>

        {/* Matching Internships */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">
            {loading ? 'Finding matches...' : 'Matching internships for you'}
          </p>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="h-12 w-12 rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-2.5 bg-gray-200 rounded w-1/2" />
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
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.06 }}
                  >
                    <Link
                      href={`/internships/${intern._id}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
                          CARD_GRADIENTS[i % CARD_GRADIENTS.length]
                        } text-white text-xs shadow-sm`}
                      >
                        <i className="fas fa-briefcase" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                          {intern.title}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {companyName} &middot; {intern.location || 'Remote'}
                        </p>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">
              No matching internships found right now. Check back later!
            </p>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
        <Button variant="secondary" onClick={onBack} className="flex-1" disabled={saving}>
          <i className="fas fa-arrow-left text-xs mr-2" />
          Back
        </Button>
        <Button onClick={onFinish} className="flex-1" disabled={saving}>
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin text-xs mr-2" />
              Saving...
            </>
          ) : (
            <>
              Go to Dashboard
              <i className="fas fa-arrow-right text-xs ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
