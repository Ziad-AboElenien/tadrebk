'use client';

import { motion, useInView } from 'framer-motion';
import {
  Award,
  ClipboardCheck,
  Compass,
  FileCheck,
  MessagesSquare,
  Send,
  UserPlus,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

const VARIANTS = {
  guest: {
    title: 'From sign-up to hired',
    subtitle: 'Five steps. Zero confusion.',
    steps: [
      {
        badge: 'Step 1',
        title: 'Create Account',
        description: 'Free sign-up as a student or a company — under a minute.',
        icon: UserPlus,
      },
      {
        badge: 'Step 2',
        title: 'Build Your Profile',
        description: 'Skills, education and preferences unlock better matches.',
        icon: ClipboardCheck,
      },
      {
        badge: 'Step 3',
        title: 'Explore & Apply',
        description: 'Filter hundreds of verified roles and apply in one click.',
        icon: Send,
      },
      {
        badge: 'Step 4',
        title: 'Track & Connect',
        description: 'Follow every status live, interview, and get accepted.',
        icon: MessagesSquare,
      },
      {
        badge: 'Step 5',
        title: 'Get Hired & Certified',
        description: 'Finish strong and earn verified feedback for your resume.',
        icon: Award,
      },
    ],
  },
  student: {
    title: 'Your Path Forward',
    subtitle: 'Where you are — and what to do next.',
    steps: [
      {
        badge: 'Step 1',
        title: 'Complete Your Profile',
        description: 'Skills, education and resume — complete profiles get shortlisted faster.',
        icon: ClipboardCheck,
      },
      {
        badge: 'Step 2',
        title: 'Discover Matches',
        description: 'Browse internships matched to your tracks, or explore every field.',
        icon: Compass,
      },
      {
        badge: 'Step 3',
        title: 'Apply in One Click',
        description: 'Answer screening questions and send your application in minutes.',
        icon: Send,
      },
      {
        badge: 'Step 4',
        title: 'Track Applications',
        description: 'Follow every status change from your dashboard — pending, accepted, done.',
        icon: FileCheck,
      },
      {
        badge: 'Step 5',
        title: 'Finish & Get Rated',
        description: 'Complete the internship, earn company feedback and grow your record.',
        icon: Award,
      },
    ],
  },
  company: {
    title: 'Hiring, Simplified',
    subtitle: 'From posting to pipeline in five steps.',
    steps: [
      {
        badge: 'Step 1',
        title: 'Set Up Company Profile',
        description: 'Logo, description and industry so students trust your brand.',
        icon: ClipboardCheck,
      },
      {
        badge: 'Step 2',
        title: 'Post a Role',
        description: 'Publish with skills, tracks and screening questions.',
        icon: Send,
      },
      {
        badge: 'Step 3',
        title: 'Review Applicants',
        description: 'Filter by department and university, accept in one click.',
        icon: Compass,
      },
      {
        badge: 'Step 4',
        title: 'Onboard with Email',
        description: 'Acceptance emails with pre-knowledge so interns arrive ready.',
        icon: MessagesSquare,
      },
      {
        badge: 'Step 5',
        title: 'Manage & Evaluate',
        description: 'Tasks, attendance and shared performance evaluations.',
        icon: Award,
      },
    ],
  },
};

export default function HowItWorksSection({ variant = 'guest' }) {
  const { title, subtitle, steps } = VARIANTS[variant] || VARIANTS.guest;
  const ref = useRef(null);
  const lineRef = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });

  // Scroll-linked line: draws as you scroll, finishing slightly ahead of it.
  useEffect(() => {
    const line = lineRef.current;
    const container = ref.current;
    if (!line || !container) return;
    let raf = 0;
    const update = () => {
      const vh = window.innerHeight || 1;
      const rect = container.getBoundingClientRect();
      const traveled = vh - rect.top;
      const total = rect.height + vh * 0.65;
      const p = Math.min(1, Math.max(0, traveled / total));
      line.style.transform = `scaleY(${p.toFixed(3)})`;
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={ref} id="how-it-works" className="bg-transparent overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <Compass size={13} /> How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line — drawn by scroll */}
          <div
            ref={lineRef}
            className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-500/50 to-emerald-500/20 md:left-1/2 md:-translate-x-1/2"
            style={{ transform: 'scaleY(0)', transformOrigin: 'top', willChange: 'transform' }}
          />

          <div className="space-y-10 md:space-y-14">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: index * 0.15, duration: 0.5, ease: 'easeOut' }}
                  className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline node */}
                  <div className="absolute left-4 flex h-8 w-8 items-center justify-center md:left-1/2 md:-translate-x-1/2">
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-200"
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : { scale: 0 }}
                      transition={{ delay: index * 0.15 + 0.25, type: 'spring' }}
                    >
                      <Icon size={15} className="text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute h-8 w-8 rounded-full bg-emerald-400/30"
                      animate={{ scale: [1, 1.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
                    />
                  </div>

                  {/* Content card */}
                  <div className={`ml-16 w-full md:ml-0 md:w-5/12 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100/60 md:p-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative z-10">
                        <span className="mb-3 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                          {step.badge}
                        </span>
                        <h3 className="mb-2 text-lg font-bold text-slate-900 md:text-xl">
                          {step.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500 md:text-base">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden w-5/12 md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Future indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: steps.length * 0.15 + 0.4 }}
          className="mt-12 text-center md:mt-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 shadow-sm">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-emerald-500"
            />
            <span className="text-sm font-medium text-slate-600">
              Your career starts with one click
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
