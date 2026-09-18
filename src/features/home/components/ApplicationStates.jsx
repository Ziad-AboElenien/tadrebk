'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  CheckCircle2,
  Clock,
  Flag,
  Send,
  XCircle,
} from 'lucide-react';

const states = [
  {
    status: 'Applied',
    icon: Send,
    desc: 'Sent with your answers and CV in one click.',
    tone: 'bg-sky-500',
    chip: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    status: 'Pending',
    icon: Clock,
    desc: 'Under review — most companies reply within days.',
    tone: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    status: 'Accepted',
    icon: CheckCircle2,
    desc: 'Acceptance email arrives with pre-knowledge to prepare.',
    tone: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    status: 'In Progress',
    icon: Briefcase,
    desc: 'Tasks, attendance and real shipped work.',
    tone: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    status: 'Completed',
    icon: Flag,
    desc: 'Marked complete — your record is updated.',
    tone: 'bg-violet-500',
    chip: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  {
    status: 'Certified',
    icon: Award,
    desc: 'Exchange ratings — proof lands on your profile.',
    tone: 'bg-slate-900',
    chip: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

export default function ApplicationStates() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '80px' }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="mx-auto mb-10 max-w-xl text-center"
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <Flag size={13} /> Application states
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Know exactly where you stand
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400 sm:text-base">
            Every application moves through the same transparent pipeline — live from your dashboard.
          </p>
        </motion.div>

        <div className="relative">
          {/* connector (desktop) */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-transparent via-emerald-200 to-transparent lg:block"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-3">
            {states.map((s, i) => (
              <motion.div
                key={s.status}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '60px' }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                className="group relative rounded-3xl border border-white/70 bg-white/55 p-5 text-center shadow-lg shadow-slate-900/[0.06] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="absolute right-4 top-3 text-[11px] font-black text-slate-300">
                  0{i + 1}
                </span>
                <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg ${s.tone}`}>
                  <s.icon size={22} />
                </div>
                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${s.chip}`}>
                  {s.status}
                </span>
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/60 px-6 py-5 text-center backdrop-blur-xl sm:flex-row sm:text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <XCircle size={19} />
          </span>
          <p className="flex-1 text-sm text-slate-500">
            <span className="font-bold text-slate-700">Rejected?</span> It happens — feedback stays
            with you, and the next role is one click away.
          </p>
          <Link
            href="/internships"
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
          >
            Keep Applying
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
