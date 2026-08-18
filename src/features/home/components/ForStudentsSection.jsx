'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { scaleIn } from './animations';

export default function ForStudentsSection() {
  return (
    <section className="px-6 py-6 sm:px-10">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={scaleIn}
          custom={0}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
          className="rounded-3xl bg-gray-900 p-10"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/60 text-emerald-400">
            <i className="fas fa-users text-lg" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">For Students</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Create your profile, discover internships that match your skills, and launch your career — all for free.
          </p>
          <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600">
            Get Started Free <i className="fas fa-arrow-right text-xs" />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={scaleIn}
          custom={1}
          whileHover={{ y: -6, transition: { duration: 0.3 } }}
          className="rounded-3xl bg-emerald-600 p-10"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
            <i className="fas fa-briefcase text-lg" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">For Companies</h3>
          <p className="mt-3 text-sm leading-relaxed text-emerald-100">
            Post internship opportunities and find the best emerging talent from Egypt&apos;s top universities.
          </p>
          <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50">
            Post an Internship <i className="fas fa-arrow-right text-xs" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
