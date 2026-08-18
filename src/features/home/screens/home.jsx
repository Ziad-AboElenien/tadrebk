'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { internshipService } from '@/features/internship/services/internship.service';
import InternshipCard from '@/features/company/components/InternshipCard';
import CompanyMiniDashboard from '@/features/home/components/CompanyMiniDashboard';
import StudentMiniDashboard from '@/features/home/components/StudentMiniDashboard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import CursorFollow from '@/features/home/components/CursorFollow';
import Parallax from '@/features/home/components/Parallax';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({ opacity: 1, scale: 1, transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

function SlideContent({ active, children, className = '' }) {
  return (
    <motion.div
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 24 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const quickTags = ['Software', 'Fintech', 'Design', 'Data'];
const universities = ['Cairo University', 'Ain Shams', 'Alexandria', 'GUC', 'BUE'];

const howItWorks = [
  { step: '01', icon: 'fa-users', title: 'Create Account', desc: "Sign up as a student or a company in seconds — it's completely free.", color: 'from-emerald-400 to-teal-500' },
  { step: '02', icon: 'fa-magnifying-glass', title: 'Explore Opportunities', desc: 'Browse hundreds of internships filtered by field, location, and type.', color: 'from-sky-400 to-blue-500' },
  { step: '03', icon: 'fa-briefcase', title: 'Apply & Get Hired', desc: 'Submit your application with one click and track your progress.', color: 'from-violet-400 to-purple-500' },
];

const categories = [
  { icon: 'fa-code', label: 'Software Engineering', count: 42, query: 'software', color: 'from-blue-400 to-blue-600' },
  { icon: 'fa-bullhorn', label: 'Marketing & Sales', count: 28, query: 'marketing', color: 'from-emerald-400 to-teal-600' },
  { icon: 'fa-desktop', label: 'UI/UX Design', count: 19, query: 'design', color: 'from-violet-400 to-purple-600' },
  { icon: 'fa-chart-line', label: 'Digital Marketing', count: 24, query: 'digital', color: 'from-orange-400 to-red-500' },
  { icon: 'fa-chart-bar', label: 'Finance & Accounting', count: 15, query: 'finance', color: 'from-amber-400 to-yellow-600' },
  { icon: 'fa-users', label: 'Human Resources', count: 13, query: 'hr', color: 'from-rose-400 to-pink-600' },
];

export default function HomeComponent() {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  const role = useAppSelector((s) => s.auth.role);

  useEffect(() => {
    (async () => {
      try {
        const result = await internshipService.listInternships({ limit: 20 });
        setInternships(result.internships);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchLocation) params.set('location', searchLocation);
    router.push(`/internships?${params.toString()}`);
  }

  return (
    <>
      <CursorFollow />

      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative h-[100svh] min-h-[620px] bg-gradient-to-b from-emerald-50/80 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Parallax offset={150} className="absolute -top-40 -right-40">
            <div className="w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-float" />
          </Parallax>
          <Parallax offset={110} className="absolute -bottom-40 -left-40">
            <div className="w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
          </Parallax>
        </div>

        <Swiper
          direction="vertical"
          className="h-full w-full"
          modules={[Mousewheel, Pagination]}
          speed={800}
          slidesPerView={1}
          spaceBetween={0}
          mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
          touchReleaseOnEdges
          threshold={0}
          pagination={{ clickable: true }}
          onSlideChange={(s) => setActiveSlide(s.activeIndex)}
        >
          <SwiperSlide>
            <div className="h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 pt-32 sm:pt-16 pb-10 text-center">
              <SlideContent active={activeSlide === 0} className="max-w-4xl w-full">
                <motion.h1
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6"
                >
                  Find internships that<br />
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    launch your career
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed"
                >
                  Egypt&apos;s first platform connecting university students with top internship opportunities — all in one organized, professional place.
                </motion.p>

                <motion.form
                  onSubmit={handleSearch}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-2xl mx-auto mb-4"
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-lg shadow-emerald-100/50 ring-1 ring-gray-100 overflow-hidden transition-all duration-300">
                    <div className="flex items-center flex-1 gap-3 px-5 py-4">
                      <i className="fas fa-search text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search internships..."
                        className="w-full text-sm sm:text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none ring-0 focus:ring-0 focus:outline-none"
                        style={{ fontSize: 'max(16px, 1rem)' }}
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                      />
                    </div>
                    <div className="hidden sm:block w-px self-stretch bg-gray-100" />
                    <div className="flex items-center flex-1 gap-3 border-t border-gray-100 sm:border-0 px-5 py-4">
                      <i className="fas fa-location-dot text-emerald-500 shrink-0" />
                      <input
                        type="text"
                        placeholder="Location"
                        className="w-full text-sm sm:text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none ring-0 focus:ring-0 focus:outline-none"
                        style={{ fontSize: 'max(16px, 1rem)' }}
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    <div className="p-2">
                      <button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300 active:scale-[0.97]">
                        Search
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Quick search:</span>
                    {quickTags.map((term) => (
                      <motion.button
                        key={term}
                        type="button"
                        whileHover={{ scale: 1.05, y: -1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/internships?title=${encodeURIComponent(term)}`)}
                        className="rounded-full border border-gray-200 bg-white px-4 py-1 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200"
                      >
                        {term}
                      </motion.button>
                    ))}
                  </div>
                </motion.form>

                {/* Universities strip */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-14"
                >
                  <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <i className="fas fa-landmark text-sm" />
                    Trusted by students from
                  </p>
                  <div className="border-y border-gray-100 bg-white/80 py-4 overflow-hidden">
                    <div className="flex items-center justify-center gap-0 overflow-x-auto scrollbar-none min-w-0">
                      {universities.map((u, i) => (
                        <span key={u} className="flex items-center shrink-0">
                          <span className="whitespace-nowrap px-4 sm:px-10 text-xs sm:text-sm font-bold text-gray-800 hover:text-emerald-600 transition-colors cursor-default">{u}</span>
                          {i < universities.length - 1 && <span className="h-4 w-px bg-gray-200 shrink-0" />}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                </motion.div>
              </SlideContent>
            </div>
          </SwiperSlide>
        </Swiper>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-gray-300 pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
          <i className="fas fa-chevron-down text-sm animate-bounce" />
        </div>

        <style>{`
          .swiper-pagination-vertical { right: 16px !important; }
          .swiper-pagination-vertical .swiper-pagination-bullet { width: 8px; height: 8px; background: #10b981; opacity: 0.3; transition: all 0.3s ease; }
          .swiper-pagination-vertical .swiper-pagination-bullet-active { height: 24px; border-radius: 6px; opacity: 1; }
        `}</style>
      </section>

      {/* ─── DASHBOARD PREVIEW (dark section) ──────────────── */}
      {role === 'company' ? <CompanyMiniDashboard /> : <StudentMiniDashboard />}

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <Parallax offset={60} className="text-center mb-14">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                How It Works
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
                Three easy steps to land your next internship.
              </motion.p>
            </motion.div>
          </Parallax>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
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

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-b from-white to-emerald-50/40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <Parallax offset={70}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
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
                viewport={{ once: true, margin: '-40px' }}
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

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
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

      {/* ─── FEATURED INTERNSHIPS ──────────────────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/30 to-emerald-50/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <Parallax offset={60} className="text-center mb-14">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
            >
              <motion.h2 variants={fadeUp} custom={0} className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                How It Works
              </motion.h2>
              <motion.p variants={fadeUp} custom={1} className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
                Three easy steps to land your next internship.
              </motion.p>
            </motion.div>
          </Parallax>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : internships.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-briefcase text-3xl text-gray-300" />
              </div>
              <p className="text-gray-400 font-semibold">No internships available yet.</p>
              <p className="text-gray-300 text-sm mt-1">Check back soon for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {internships.map((intern, i) => (
                <motion.div
                  key={intern._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={scaleIn}
                  custom={i}
                >
                  <InternshipCard internship={intern} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center mt-14">
            <Button
              onClick={() => router.push('/internships')}
              variant="primary"
              size="lg"
              rightIcon={<i className="fas fa-arrow-right text-sm" />}
            >
              Browse All Internships
            </Button>
          </div>
        </div>
      </section>

      {/* ─── FOR STUDENTS / FOR COMPANIES ─────────────────────── */}
      <section className="py-6 px-4 sm:px-8 bg-gradient-to-b from-emerald-50/60 to-white overflow-hidden">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* For Students */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={scaleIn}
            custom={0}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
            className="rounded-3xl bg-gray-900 p-10 relative overflow-hidden group cursor-default"
          >
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/60 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <i className="fas fa-users text-lg" />
            </div>
            <h3 className="text-2xl font-black text-white">For Students</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Create your profile, discover internships that match your skills, and launch your career — all for free.
            </p>
            <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.03]">
              Get Started Free <i className="fas fa-arrow-right text-xs" />
            </Link>
          </motion.div>

          {/* For Companies — mini dashboard */}
          <CompanyMiniDashboard />
        </div>
      </section>
    </>
  );
}
