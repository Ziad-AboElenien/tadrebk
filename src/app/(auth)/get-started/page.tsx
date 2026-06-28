'use client';

import { useRouter } from 'next/navigation';
import { LS_INTENDED_ROLE } from '@/lib/constants';
import type { Metadata } from 'next';

export default function GetStartedPage() {
  const router = useRouter();

  function choose(role: 'student' | 'company') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_INTENDED_ROLE, role);
    }
    router.push(`/signup/${role}`);
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-block bg-emerald-50 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Welcome to Tadrebk
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-dark mb-4 leading-tight">
          Who are you joining as?
        </h1>
        <p className="text-gray-400 text-lg">
          Choose your account type to get started
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Student card */}
        <button
          onClick={() => choose('student')}
          id="get-started-student-btn"
          className="group relative bg-white border-2 border-gray-100 hover:border-primary rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-[0_20px_60px_rgba(16,185,129,0.12)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {/* Icon */}
          <div className="w-14 h-14 bg-emerald-50 group-hover:bg-primary rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
            <i className="fas fa-graduation-cap text-2xl text-primary group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">I'm a Student</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Find internships, build your profile, and launch your career with top Egyptian companies.
          </p>
          <div className="flex items-center gap-2 mt-6 text-primary font-semibold text-sm">
            Get Started
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
          </div>
          {/* Popular badge */}
          <span className="absolute top-4 right-4 bg-emerald-50 text-primary text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            Popular
          </span>
        </button>

        {/* Company card */}
        <button
          onClick={() => choose('company')}
          id="get-started-company-btn"
          className="group relative bg-white border-2 border-gray-100 hover:border-dark rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-[0_20px_60px_rgba(26,46,53,0.08)] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dark"
        >
          {/* Icon */}
          <div className="w-14 h-14 bg-gray-100 group-hover:bg-dark rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
            <i className="fas fa-building text-2xl text-gray-500 group-hover:text-white transition-colors duration-300" />
          </div>
          <h2 className="text-xl font-bold text-dark mb-2">I'm a Company</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Post internships, discover talented students, and grow your team with Egypt's best talent.
          </p>
          <div className="flex items-center gap-2 mt-6 text-dark font-semibold text-sm">
            Get Started
            <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Already have account */}
      <p className="text-center text-gray-400 text-sm mt-8">
        Already have an account?{' '}
        <a href="/login/student" className="text-primary font-semibold hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}
