'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { internshipService } from '@/features/internship/services/internship.service';
import InternshipCard from '@/features/company/components/InternshipCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        const duration = 2000;
        const steps = 60;
        const increment = end / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const categories = [
  { icon: 'fa-code', label: 'Software Engineering', from: 'from-blue-400', to: 'to-blue-600', query: 'software' },
  { icon: 'fa-chart-line', label: 'Marketing & Sales', from: 'from-emerald-400', to: 'to-teal-600', query: 'marketing' },
  { icon: 'fa-palette', label: 'UI/UX Design', from: 'from-violet-400', to: 'to-purple-600', query: 'design' },
  { icon: 'fa-bullhorn', label: 'Digital Marketing', from: 'from-orange-400', to: 'to-red-500', query: 'digital' },
  { icon: 'fa-coins', label: 'Finance & Accounting', from: 'from-amber-400', to: 'to-yellow-600', query: 'finance' },
  { icon: 'fa-users', label: 'Human Resources', from: 'from-rose-400', to: 'to-pink-600', query: 'hr' },
];

const howItWorks = [
  { icon: 'fa-user-plus', step: '01', title: 'Create Account', desc: 'Sign up as a student or company in under 2 minutes — it\'s completely free.' },
  { icon: 'fa-search', step: '02', title: 'Explore Opportunities', desc: 'Browse hundreds of internships and filter by field, location, and type.' },
  { icon: 'fa-paper-plane', step: '03', title: 'Apply & Get Hired', desc: 'Submit your application with one click and track your progress.' },
];

const testimonials = [
  { name: 'Nour Ahmed', role: 'Software Intern at ITWORX', initials: 'NA', quote: 'Tadrebk made finding my first internship so easy. I applied to 3 positions and got accepted within a week!' },
  { name: 'Karim Youssef', role: 'Marketing Intern at PepsiCo', initials: 'KY', quote: 'Before Tadrebk, I was applying everywhere with no luck. This platform connected me with the perfect opportunity.' },
  { name: 'Salma Hassan', role: 'UI/UX Intern at Ejada', initials: 'SH', quote: 'The best part is how organized everything is. I could track my applications and hear back seamlessly.' },
];

export default function HomeComponent() {
  const router = useRouter();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

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
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-float" />
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-teal-300 rounded-full animate-float" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-16 md:pt-24 md:pb-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-5 py-1.5 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 text-xs font-bold tracking-wider uppercase">Now over 500+ active internships</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#1a2e35] leading-[1.05] tracking-tight mb-6 animate-slide-up">
              Find internships that<br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                launch your career
              </span>
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-10 font-medium leading-relaxed animate-slide-up animate-delay-200">
              Egypt&apos;s first platform connecting university students with top internship opportunities — all in one organized, professional place.
            </p>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto animate-slide-up animate-delay-400">
              <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-green-200/40">
                <div className="flex items-center flex-1 min-w-0 px-4">
                  <i className="fas fa-search text-gray-300 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search internships..."
                    className="w-full py-4 px-3 text-sm text-gray-600 placeholder:text-gray-300 bg-transparent"
                    style={{ outline: 'none', outlineOffset: 0, boxShadow: 'none', caretColor: '#333' }}
                    value={searchTitle}
                    onChange={(e) => setSearchTitle(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 pr-2">
                  <input
                    type="text"
                    placeholder="Location"
                    className="hidden sm:inline-block w-28 py-4 text-sm text-gray-600 placeholder:text-gray-300 bg-transparent"
                    style={{ outline: 'none', outlineOffset: 0, boxShadow: 'none', caretColor: '#333' }}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                  <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-[0.97] shrink-0">
                    Search
                  </button>
                </div>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-fade-in animate-delay-600">
              <span className="text-xs text-gray-400 font-medium">Quick search:</span>
              {['Software', 'Marketing', 'Design', 'Data'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => router.push(`/internships?title=${encodeURIComponent(term)}`)}
                  className="text-xs px-3 py-1.5 bg-white border border-gray-100 rounded-full text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Trusted by */}
            <div className="mt-14 animate-fade-in animate-delay-600">
              <p className="text-gray-300 text-xs tracking-widest uppercase mb-4 font-medium">Trusted by students from</p>
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {['Cairo University', 'Ain Shams', 'Alexandria', 'GUC', 'BUE'].map((u) => (
                  <span key={u} className="text-gray-400/50 font-bold tracking-tight text-sm hover:text-gray-600 transition-colors">{u}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { end: 500, suffix: '+', label: 'Active Listings' },
              { end: 200, suffix: '+', label: 'Hiring Partners' },
              { end: 12, suffix: 'k+', label: 'Student Users' },
              { end: 85, suffix: '%', label: 'Success Rate' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="flex flex-col items-center animate-slide-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="text-4xl md:text-5xl font-black text-white mb-2 tabular-nums">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </span>
                <span className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 bg-white" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg mt-4 max-w-2xl mx-auto">
              Three easy steps to land your next internship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {howItWorks.map((item, i) => (
              <div
                key={item.step}
                className="relative bg-white rounded-3xl border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.04)] p-10 text-center hover:shadow-[0_20px_60px_rgba(16,185,129,0.1)] hover:-translate-y-2 transition-all duration-500 group animate-slide-up"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {item.step}
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 mx-auto group-hover:scale-110 group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white transition-all duration-500">
                  <i className={`fas ${item.icon} text-3xl`} />
                </div>
                <h3 className="text-xl font-bold text-[#1a2e35] mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
                Explore Fields
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight">
                Browse by Category
              </h2>
            </div>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#1a2e35] text-white font-bold rounded-full text-sm hover:bg-black transition-all shadow-md hover:shadow-xl active:scale-[0.97]"
            >
              View All Internships
              <i className="fas fa-arrow-right text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={cat.label}
                href={`/internships?title=${cat.query}`}
                className="group bg-white p-8 rounded-2xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${cat.from} ${cat.to} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <i className={`fas ${cat.icon} text-xl`} />
                </div>
                <h3 className="text-lg font-bold text-[#1a2e35] group-hover:text-emerald-600 transition-colors">{cat.label}</h3>
                <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  Browse opportunities <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED INTERNSHIPS ─────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Handpicked Opportunities
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
              Featured Internships
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Top companies are actively seeking talent. Don&apos;t miss your chance.
            </p>
          </div>

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

      {/* ─── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Student Stories
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight">
              What Students Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 text-emerald-400 mb-6">
                  {[...Array(5)].map((_, i2) => (
                    <i key={i2} className="fas fa-star text-sm" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 italic">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1a2e35]">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 rounded-[32px] p-10 md:p-14 shadow-2xl group">
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500 opacity-10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur rounded-2xl flex items-center justify-center text-emerald-300 mb-8">
                <i className="fas fa-graduation-cap text-2xl" />
              </div>
              <h3 className="text-white text-3xl md:text-4xl font-black mb-4 tracking-tight">For Students</h3>
              <p className="text-emerald-200/80 mb-8 max-w-md leading-relaxed">
                Create your profile, discover internships that match your skills, and launch your career — all for free.
              </p>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 bg-white text-emerald-900 font-black px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-xl active:scale-[0.98]"
              >
                Get Started Free
                <i className="fas fa-arrow-right text-sm" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a2e35] via-slate-800 to-[#1a2e35] rounded-[32px] p-10 md:p-14 shadow-2xl group">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-emerald-300 mb-8">
                <i className="fas fa-building text-2xl" />
              </div>
              <h3 className="text-white text-3xl md:text-4xl font-black mb-4 tracking-tight">For Companies</h3>
              <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
                Post internship opportunities and find the best emerging talent from Egypt&apos;s top universities.
              </p>
              <Link
                href="/get-started"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-xl active:scale-[0.98]"
              >
                Post an Internship
                <i className="fas fa-arrow-right text-sm" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
