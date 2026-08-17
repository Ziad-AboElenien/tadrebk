'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { internshipService } from '@/features/internship/services/internship.service';
import InternshipCard from '@/features/company/components/InternshipCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import CursorFollow from '@/features/home/components/CursorFollow';
import Parallax from '@/features/home/components/Parallax';

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
  { step: '01', icon: 'fa-users', title: 'Create Account', desc: "Sign up as a student or a company in seconds — it's completely free." },
  { step: '02', icon: 'fa-magnifying-glass', title: 'Explore Opportunities', desc: 'Browse hundreds of internships filtered by field, location, and type.' },
  { step: '03', icon: 'fa-briefcase', title: 'Apply & Get Hired', desc: 'Submit your application with one click and track your progress.' },
];

const categories = [
  { icon: 'fa-code', label: 'Software Engineering', count: 42, query: 'software' },
  { icon: 'fa-bullhorn', label: 'Marketing & Sales', count: 28, query: 'marketing' },
  { icon: 'fa-desktop', label: 'UI/UX Design', count: 19, query: 'design' },
  { icon: 'fa-chart-line', label: 'Digital Marketing', count: 24, query: 'digital' },
  { icon: 'fa-chart-bar', label: 'Finance & Accounting', count: 15, query: 'finance' },
  { icon: 'fa-users', label: 'Human Resources', count: 13, query: 'hr' },
];

export default function HomeComponent() {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const result = await internshipService.listInternships({ limit: 6 });
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

      {/* ─── HERO — vertical swiper slider ──────────────────── */}
      <section className="relative h-[100svh] min-h-[620px] bg-gradient-to-b from-emerald-50/80 to-white overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <Parallax offset={150} className="absolute -top-40 -right-40">
            <div className="w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
          </Parallax>
          <Parallax offset={110} className="absolute -bottom-40 -left-40">
            <div className="w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
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
            <div className="h-full w-full flex flex-col items-center justify-center px-4 sm:px-8 pt-16 pb-10 text-center">
              <SlideContent active={activeSlide === 0} className="max-w-4xl w-full">
                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur border border-emerald-200 rounded-full px-5 py-1.5 mb-8 shadow-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-700 text-xs font-bold tracking-wider uppercase">Now over 500+ active internships</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight mb-6">
                  Find internships that<br />
                  <span className="text-emerald-500">launch your career</span>
                </h1>

                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
                  Egypt&apos;s first platform connecting university students with top internship opportunities — all in one organized, professional place.
                </p>

                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center flex-1 gap-3 px-5 py-4">
                      <i className="fas fa-search text-gray-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search internships..."
                        className="w-full text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
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
                        className="w-full text-sm text-gray-800 placeholder:text-gray-400 bg-transparent outline-none"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                      />
                    </div>
                    <div className="p-2">
                      <button type="submit" className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all active:scale-[0.97]">
                        Search
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-gray-400">Quick search:</span>
                    {quickTags.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => router.push(`/internships?title=${encodeURIComponent(term)}`)}
                        className="rounded-full border border-gray-200 bg-white px-4 py-1 text-sm text-gray-600 hover:border-emerald-300 hover:text-emerald-600 transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Universities strip */}
                <div className="mt-14">
                  <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                    <i className="fas fa-landmark text-sm" />
                    Trusted by students from
                  </p>
                  <div className="border-y border-gray-100 bg-white/80 py-4">
                    <div className="flex items-center justify-center gap-0">
                      {universities.map((u, i) => (
                        <span key={u} className="flex items-center">
                          <span className="whitespace-nowrap px-6 sm:px-12 text-sm font-bold text-gray-800">{u}</span>
                          {i < universities.length - 1 && <span className="h-4 w-px bg-gray-200" />}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                </div>
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
      <section className="bg-gray-900 px-6 sm:px-10 py-16">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/40 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Your career dashboard
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
              Manage your <span className="text-emerald-400">internship journey</span> in one place
            </h2>
            <p className="mt-4 text-base leading-relaxed text-gray-400">
              Discover opportunities, track applications and never miss an important update. Join thousands of students launching their careers today.
            </p>
            <div className="mt-8 space-y-5">
              {[
                { icon: 'fa-table-columns', title: 'Stay Organized', desc: 'All your applications and updates in one central, easy-to-use dashboard.' },
                { icon: 'fa-chart-line', title: 'Find Better Matches', desc: 'Personalised recommendations based on your student profile and skills.' },
                { icon: 'fa-bell', title: 'Never Miss a Deadline', desc: 'Get timely reminders and stay ahead of every single opportunity.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-400">
                    <i className={`fas ${item.icon} text-sm`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="/get-started" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600">
                Start Your Journey <i className="fas fa-arrow-right text-xs" />
              </Link>
              <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-gray-500">
                Learn More
              </Link>
            </div>
          </div>

          {/* Mini dashboard mockup */}
          <div className="mt-12 lg:mt-0">
            <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between bg-gray-50 px-5 py-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Good morning, Emad <span role="img" aria-label="wave">👋</span></p>
                  <p className="text-xs text-gray-400">You have 3 pending updates today.</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">E</div>
              </div>
              <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-5 py-4">
                {[{ label: 'Applications Sent', value: '08' }, { label: 'Active Interviews', value: '12' }].map((s) => (
                  <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-2xl font-black text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-gray-700">Recent Applications</p>
                  <Link href="/dashboard" className="text-xs text-emerald-500 hover:underline">View All</Link>
                </div>
                <div className="space-y-3">
                  {[
                    { role: 'Frontend Developer Intern', co: 'Swvl', status: 'Interviewing', color: 'text-emerald-600 bg-emerald-50' },
                    { role: 'UI/UX Design Intern', co: 'Robosta', status: 'Applied', color: 'text-gray-600 bg-gray-100' },
                    { role: 'Marketing Intern', co: 'Jumia', status: 'Applied', color: 'text-gray-600 bg-gray-100' },
                  ].map((a) => (
                    <div key={a.role} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100" />
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{a.role}</p>
                          <p className="text-[10px] text-gray-400">{a.co}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${a.color}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <Parallax offset={90} className="text-center mb-14">
            <span className="inline-block bg-emerald-50 text-emerald-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-emerald-200 mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 text-sm mt-3 max-w-md mx-auto">
              Three easy steps to land your next internship.
            </p>
          </Parallax>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <span className="absolute right-4 top-4 text-4xl font-black text-gray-100">{item.step}</span>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <i className={`fas ${item.icon} text-lg`} />
                </div>
                <h3 className="text-base font-black text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1 block">Explore Fields</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Browse by Category
              </h2>
            </div>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-sm hover:bg-gray-800 transition-all"
            >
              View All Internships
              <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/internships?title=${cat.query}`}
                className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:ring-1 hover:ring-emerald-200 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                  <i className={`fas ${cat.icon} text-lg`} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-400">{cat.count} opportunities &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ──────────────────────────────────────── */}
      <section className="py-6 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-emerald-600 p-10 sm:p-14">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
                Ready to accelerate your career?
              </h2>
              <p className="mt-3 max-w-md text-base text-emerald-100">
                Join Tadrebk today and get access to exclusive internship opportunities tailored for your growth.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/get-started" className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-600 shadow-sm transition hover:bg-emerald-50">
                Get Started Free
              </Link>
              <Link href="/internships" className="inline-flex items-center justify-center rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                View Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED INTERNSHIPS (keep as is) ────────────────── */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-white via-emerald-50/50 to-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/3 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <Parallax offset={60} className="text-center mb-14">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Handpicked Opportunities
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
              Featured Internships
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Top companies are actively seeking talent. Don&apos;t miss your chance.
            </p>
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
                <div key={intern._id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <InternshipCard internship={intern} />
                </div>
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
      <section className="py-6 px-4 sm:px-8">
        <div className="mx-auto max-w-5xl grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-3xl bg-gray-900 p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/60 text-emerald-400">
              <i className="fas fa-users text-lg" />
            </div>
            <h3 className="text-2xl font-black text-white">For Students</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              Create your profile, discover internships that match your skills, and launch your career — all for free.
            </p>
            <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600">
              Get Started Free <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>
          <div className="rounded-3xl bg-emerald-600 p-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-white">
              <i className="fas fa-briefcase text-lg" />
            </div>
            <h3 className="text-2xl font-black text-white">For Companies</h3>
            <p className="mt-3 text-sm leading-relaxed text-emerald-100">
              Post internship opportunities and find the best emerging talent from Egypt&apos;s top universities.
            </p>
            <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-50">
              Post an Internship <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
