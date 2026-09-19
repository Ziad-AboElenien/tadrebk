'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Parallax from './Parallax';

const quickTags = ['Software', 'Fintech', 'Design', 'Data'];
const universities = ['Cairo University', 'Ain Shams', 'Alexandria', 'GUC', 'BUE'];

export default function HeroSection() {
  const router = useRouter();
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (searchLocation) params.set('location', searchLocation);
    router.push(`/internships?${params.toString()}`);
  }

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-transparent px-4 py-28 sm:px-8">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <Parallax offset={150} className="absolute -top-40 -right-40">
          <div className="w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-float" />
        </Parallax>
        <Parallax offset={110} className="absolute -bottom-40 -left-40">
          <div className="w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </Parallax>
      </div>

      <div className="relative w-full max-w-4xl text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
          Find internships that<br />
          <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
            launch your career
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
          Egypt&apos;s first platform connecting university students with top internship opportunities — all in one organized, professional place.
        </p>

        <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-4">
          <div className="rounded-[1.5rem] sm:rounded-full bg-white/75 backdrop-blur-xl ring-1 ring-white shadow-[0_8px_24px_rgba(16,185,129,0.10)] p-1 transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
              <div className="flex items-center flex-1 gap-2.5 pl-1.5 pr-2 py-1.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <i className="fas fa-search text-emerald-600 text-xs" />
                </span>
                <input
                  type="text"
                  placeholder="Try 'Frontend Intern'..."
                  className="w-full text-[13px] text-slate-800 placeholder:text-slate-400 bg-transparent outline-none border-0 ring-0 focus:ring-0 focus:outline-none focus:border-0"
                  style={{ fontSize: 'max(16px, 1rem)' }}
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                />
              </div>
              <div className="hidden sm:block w-px self-stretch my-2 bg-slate-200/70" />
              <div className="flex items-center flex-1 gap-2.5 pl-1.5 pr-2 py-1.5 border-t border-slate-100 sm:border-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <i className="fas fa-location-dot text-emerald-600 text-xs" />
                </span>
                <input
                  type="text"
                  placeholder="Where? e.g. Cairo"
                  className="w-full text-[13px] text-slate-800 placeholder:text-slate-400 bg-transparent outline-none border-0 ring-0 focus:ring-0 focus:outline-none focus:border-0"
                  style={{ fontSize: 'max(16px, 1rem)' }}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                aria-label="Search internships"
                className="group flex items-center justify-center gap-2 rounded-xl sm:rounded-full bg-emerald-500 px-5 py-2.5 sm:h-10 sm:w-10 sm:p-0 text-[13px] font-bold text-white shadow-md shadow-emerald-500/25 outline-none transition-all duration-300 hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-95"
              >
                <i className="fas fa-arrow-right text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="sm:hidden">Search</span>
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-semibold text-slate-400">Quick search:</span>
            {quickTags.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => router.push(`/internships?title=${encodeURIComponent(term)}`)}
                className="rounded-full border border-slate-200 bg-white px-4 py-1 text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200"
              >
                {term}
              </button>
            ))}
          </div>
        </form>

        <div className="mt-14">
          <p className="mb-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            <i className="fas fa-landmark text-sm" />
            Trusted by students from
          </p>
          <div className="border-y border-slate-100 bg-white/80 py-4 overflow-hidden">
            <div className="flex items-center justify-center gap-0 overflow-x-auto scrollbar-none min-w-0">
              {universities.map((u, i) => (
                <span key={u} className="flex items-center shrink-0">
                  <span className="whitespace-nowrap px-4 sm:px-10 text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors cursor-default">{u}</span>
                  {i < universities.length - 1 && <span className="h-4 w-px bg-slate-200 shrink-0" />}
                </span>
              ))}
            </div>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-300 pointer-events-none">
        <span className="text-[10px] font-semibold uppercase tracking-widest">Scroll</span>
        <i className="fas fa-chevron-down text-sm animate-bounce" />
      </div>
    </section>
  );
}
