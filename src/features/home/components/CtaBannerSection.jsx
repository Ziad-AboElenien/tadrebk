'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';

export default function CtaBannerSection() {
  return (
    <section className="py-6 px-4 sm:px-8 bg-gradient-to-b from-emerald-50/40 to-white">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-10 sm:p-14 relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-white/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Ready to accelerate your career?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 max-w-md text-base text-emerald-100">
              Join Tadrebk today and get access to exclusive internship opportunities tailored for your growth.
            </motion.p>
          </div>
          <motion.div variants={fadeUp} custom={2} className="flex flex-col gap-3 sm:flex-row">
            <Link href="/get-started" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-600 shadow-sm hover:bg-emerald-50 hover:shadow-lg hover:scale-[1.03] transition-all duration-300">
              Get Started Free
            </Link>
            <Link href="/internships" className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/50 hover:scale-[1.03]">
              View Opportunities
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
