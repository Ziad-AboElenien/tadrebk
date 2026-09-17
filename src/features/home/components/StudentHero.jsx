'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import Parallax from './Parallax';

export default function StudentHero() {
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);
  const [saved, setSaved] = useState(0);
  const [applied, setApplied] = useState(0);
  const [accepted, setAccepted] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([
          internshipService.getSavedInternships(1, 1).catch(() => ({ pagination: { total: 0 } })),
          userId
            ? applicationService.getUserApplications(userId, { page: 1, limit: 1 }).catch(() => ({ pagination: { total: 0 }, applications: [] }))
            : Promise.resolve({ pagination: { total: 0 }, applications: [] }),
        ]);
        setSaved(s.pagination?.total ?? 0);
        setApplied(a.pagination?.total ?? 0);
        setAccepted((a.applications || []).filter((x) => x.status === 'accepted').length);
      } catch {
        // silent — hero stays generic
      }
    })();
  }, [userId]);

  const firstName = user?.firstName || 'there';
  const stats = [
    { value: saved, label: 'Saved' },
    { value: applied, label: 'Applied' },
    { value: accepted, label: 'Accepted' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/80 to-white">
      <div className="pointer-events-none absolute inset-0">
        <Parallax offset={120} className="absolute -top-32 right-0">
          <div className="h-80 w-80 rounded-full bg-green-200/30 blur-3xl" />
        </Parallax>
        <Parallax offset={90} className="absolute -bottom-32 -left-24">
          <div className="h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        </Parallax>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-8 sm:pt-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-emerald-600"
        >
          Your journey continues
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-2 max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-5xl"
        >
          Ready for what&apos;s next, {firstName}?
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-3 max-w-xl text-base font-medium text-slate-500 sm:text-lg"
        >
          Pick up where you left off — saved roles, pending applications and new matches.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            href="/internships"
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all hover:from-emerald-600 hover:to-teal-600 active:scale-[0.97]"
          >
            Continue Exploring
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            My Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-8 grid max-w-lg grid-cols-3 gap-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/60 bg-white/70 px-4 py-4 text-center shadow-lg shadow-slate-200/50 backdrop-blur-xl">
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
