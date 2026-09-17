'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { programService } from '@/features/company/services/program.service';
import { internService } from '@/features/company/services/intern.service';
import { syncInternshipsClosedState } from '@/features/internship/utils/closedInternshipState';
import Parallax from './Parallax';

export default function CompanyHero() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [openRoles, setOpenRoles] = useState(0);
  const [programs, setPrograms] = useState(0);
  const [interns, setInterns] = useState(0);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const [postings, progRes] = await Promise.all([
          internshipService.listInternships({ companyId, limit: 50 }),
          programService.listPrograms(companyId, { limit: 100 }).catch(() => ({ data: [] })),
          internService.listInterns(companyId, { limit: 1 }).catch(() => null),
        ]);
        setOpenRoles(syncInternshipsClosedState(postings.internships).filter((i) => !i.closed).length);
        setPrograms(progRes.data.length);
        try {
          const full = await internService.listAllInterns(companyId);
          setInterns(full.length);
        } catch {
          setInterns(0);
        }
      } catch {
        // silent — hero stays generic
      }
    })();
  }, [companyId]);

  const stats = [
    { value: openRoles, label: 'Open roles' },
    { value: programs, label: 'Programs' },
    { value: interns, label: 'Interns' },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-8 sm:pt-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold text-emerald-400"
        >
          {company?.name || 'Company workspace'}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mt-2 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl"
        >
          Hire Egypt&apos;s brightest,{' '}
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
            faster
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-3 max-w-xl text-base font-medium text-slate-400 sm:text-lg"
        >
          Post roles, track applicants and grow your intern pipeline — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            href="/company/post-internship"
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.97]"
          >
            Post a Role
          </Link>
          <Link
            href="/company/admin"
            className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
          >
            Open Dashboard
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="mt-8 grid max-w-lg grid-cols-3 gap-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-4 text-center backdrop-blur-xl">
              <p className="text-2xl font-black text-white">{s.value}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
