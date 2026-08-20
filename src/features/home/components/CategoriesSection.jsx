'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Parallax from './Parallax';
import { fadeUp, scaleIn } from './animations';

const categories = [
  { icon: 'fa-code', label: 'Software Engineering', count: 42, query: 'software', color: 'from-blue-400 to-blue-600' },
  { icon: 'fa-bullhorn', label: 'Marketing & Sales', count: 28, query: 'marketing', color: 'from-emerald-400 to-teal-600' },
  { icon: 'fa-desktop', label: 'UI/UX Design', count: 19, query: 'design', color: 'from-violet-400 to-purple-600' },
  { icon: 'fa-chart-line', label: 'Digital Marketing', count: 24, query: 'digital', color: 'from-orange-400 to-red-500' },
  { icon: 'fa-chart-bar', label: 'Finance & Accounting', count: 15, query: 'finance', color: 'from-amber-400 to-yellow-600' },
  { icon: 'fa-users', label: 'Human Resources', count: 13, query: 'hr', color: 'from-rose-400 to-pink-600' },
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-emerald-50/40 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <Parallax offset={70}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '50px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              <motion.span variants={fadeUp} custom={0} className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 block">Explore Fields</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Browse by Category
              </motion.h2>
            </motion.div>
          </Parallax>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200/50 hover:scale-[1.02] transition-all duration-300"
            >
              View All Internships
              <i className="fas fa-arrow-right text-xs" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '50px' }}
              variants={scaleIn}
              custom={i}
            >
              <Link
                href={`/internships?title=${cat.query}`}
                className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-emerald-100/50 hover:ring-1 hover:ring-emerald-200 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white group-hover:scale-110 group-hover:rotate-3 shadow-md transition-all duration-300`}>
                  <i className={`fas ${cat.icon} text-lg`} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 group-hover:text-emerald-700 transition-colors">{cat.label}</p>
                  <p className="text-xs text-gray-400">{cat.count} opportunities &rarr;</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
