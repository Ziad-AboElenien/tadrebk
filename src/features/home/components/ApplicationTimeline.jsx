'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Award,
  CalendarDays,
  ClipboardCheck,
  Rocket,
  Send,
} from 'lucide-react';

const steps = [
  {
    title: 'Apply in One Click',
    description: 'Send your application with screening answers in minutes — no cover-letter gymnastics.',
    icon: Send,
  },
  {
    title: 'Company Reviews',
    description: 'Real humans review every application and shortlist the best fits.',
    icon: ClipboardCheck,
  },
  {
    title: 'Get Accepted',
    description: 'Receive your acceptance email with everything you need to prepare.',
    icon: Award,
  },
  {
    title: 'Get Started',
    description: 'Meet the team, onboard in days, and ship your first real task.',
    icon: Rocket,
  },
];

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut', duration: 0.55 } },
};

export default function ApplicationTimeline() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-8 shadow-xl shadow-slate-900/[0.07] backdrop-blur-2xl sm:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent" />
          <div className="relative">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-500 backdrop-blur">
              <CalendarDays size={14} className="text-emerald-500" />
              application timeline
            </span>

            <div className="space-y-5">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                From apply to offer, fully transparent
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-slate-500 md:text-lg">
                No black boxes. You always know exactly where your application
                stands — and what happens next.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/internships"
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-bold uppercase tracking-[0.15em] text-white shadow-lg shadow-emerald-500/30 transition-all hover:bg-emerald-600 active:scale-[0.98]"
              >
                Start applying
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '80px' }}
          className="relative flex flex-col gap-4"
        >
          <div className="pointer-events-none absolute bottom-4 left-[22px] top-4 hidden w-px bg-gradient-to-b from-emerald-300/60 via-emerald-200/40 to-transparent lg:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                variants={item}
                className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-6 shadow-lg shadow-slate-900/[0.06] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                    <Icon size={16} />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold tracking-tight text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
    </section>
  );
}
