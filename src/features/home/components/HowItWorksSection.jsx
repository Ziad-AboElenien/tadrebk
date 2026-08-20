'use client';

import { motion } from 'framer-motion';
import Parallax from './Parallax';
import { fadeUp, scaleIn } from './animations';

const howItWorks = [
  { step: '01', icon: 'fa-user-plus', title: 'Create Account', desc: "Sign up as a student or a company in seconds — it's completely free.", color: 'from-emerald-400 to-teal-500' },
  { step: '02', icon: 'fa-id-card', title: 'Build Your Profile', desc: 'Add your skills, education, and preferences to get matched with the best opportunities.', color: 'from-pink-400 to-rose-500' },
  { step: '03', icon: 'fa-magnifying-glass', title: 'Explore Opportunities', desc: 'Browse hundreds of internships filtered by field, location, and type.', color: 'from-sky-400 to-blue-500' },
  { step: '04', icon: 'fa-paper-plane', title: 'Apply & Get Hired', desc: 'Submit your application with one click and track your progress in real time.', color: 'from-violet-400 to-purple-500' },
  { step: '05', icon: 'fa-comments', title: 'Connect & Collaborate', desc: 'Communicate with companies, attend interviews, and land your dream internship.', color: 'from-amber-400 to-orange-500' },
  { step: '06', icon: 'fa-certificate', title: 'Earn Certificate', desc: 'Complete your internship and receive a verified certificate to boost your resume.', color: 'from-red-400 to-rose-500' },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden" id="how-it-works">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        <Parallax offset={60} className="text-center mb-14">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '50px' }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
              Six easy steps to land your next internship.
            </motion.p>
          </motion.div>
        </Parallax>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {howItWorks.map((item, i) => (
            <motion.div
              key={item.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '50px' }}
              variants={scaleIn}
              custom={i}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:shadow-emerald-100/50 hover:border-emerald-100 transition-all duration-300 group cursor-default"
            >
              <span className="absolute right-4 top-4 text-4xl font-black text-gray-100 group-hover:text-emerald-100 transition-colors duration-300">{item.step}</span>
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <i className={`fas ${item.icon} text-lg`} />
              </div>
              <h3 className="text-base font-black text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
