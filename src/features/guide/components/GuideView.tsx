'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  studentSteps,
  companySteps,
  studentTips,
  companyTips,
  studentFaq,
  companyFaq,
  glanceStudent,
  glanceCompany,
} from '@/features/guide/content';

export type GuideRole = 'student' | 'company';

interface GuideViewProps {
  role: GuideRole;
  /** Shown right after signup/onboarding — drops the create-account step and ends with a "Got it" button. */
  welcome?: boolean;
  onGotIt?: () => void;
}

export default function GuideView({ role, welcome = false, onGotIt }: GuideViewProps) {
  const isStudent = role === 'student';
  // In welcome mode the account already exists — skip the create-account step and renumber.
  const rawSteps = isStudent ? studentSteps : companySteps;
  const steps = (welcome ? rawSteps.slice(1) : rawSteps).map((s, i) => ({
    ...s,
    step: String(i + 1).padStart(2, '0'),
  }));
  const tips = isStudent ? studentTips : companyTips;
  const faq = isStudent ? studentFaq : companyFaq;
  const glance = welcome
    ? (isStudent ? glanceStudent : glanceCompany).slice(1)
    : isStudent
      ? glanceStudent
      : glanceCompany;

  const accentGradient = isStudent
    ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
    : 'bg-gradient-to-br from-[#1a2e35] to-slate-700';

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] pt-20 md:pt-24 pb-14">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-teal-100/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-6">
            Guide
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1a2e35] tracking-tight mb-5">
            {welcome
              ? isStudent
                ? 'You\'re in! Here\'s how it works'
                : 'Welcome aboard! Here\'s how it works'
              : 'How Tadrebk Works'}
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {welcome
              ? isStudent
                ? 'Your account is ready and your preferences are saved. A quick tour before you dive in.'
                : 'Your company profile is ready. A quick tour before you start hiring.'
              : isStudent
                ? 'Everything a student needs — from signing up to the first day on the job.'
                : 'Everything a company needs — from registration to signing great talent.'}
          </p>

          {!welcome && (
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-100 rounded-full px-6 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-sm font-bold">
              <i className={`fas ${isStudent ? 'fa-graduation-cap text-emerald-500' : 'fa-building text-slate-700'}`} />
              <span className="text-slate-700">{isStudent ? 'For Students' : 'For Companies'}</span>
              <Link
                href={isStudent ? '/guide/company' : '/guide/student'}
                className="text-emerald-600 hover:underline font-semibold"
              >
                {isStudent ? 'Are you a company?' : 'Are you a student?'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── JOURNEY AT A GLANCE ──────────────────────── */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 inset-x-16 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200" />
            <div className={`grid grid-cols-2 gap-4 md:gap-6 ${glance.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {glance.map((g, i) => (
                <div key={g.label} className="relative flex flex-col items-center text-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3 ${
                      isStudent
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200/60'
                        : 'bg-gradient-to-br from-[#1a2e35] to-slate-700 shadow-slate-300/60'
                    }`}
                  >
                    <i className={`fas ${g.icon} text-lg`} />
                  </div>
                  <span className="text-xs font-bold text-[#1a2e35] uppercase tracking-wider">{g.label}</span>
                  <span className="text-[10px] font-bold text-emerald-600/70 mt-0.5">Step {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STEPS TIMELINE ───────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a2e35] tracking-tight mb-4">
              {isStudent ? 'Your Journey, Step by Step' : 'From Registration to Hiring'}
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {isStudent
                ? 'Everything that happens from your first sign-up to your first day on the job.'
                : 'Everything that happens from verifying your company to signing great talent.'}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 via-teal-200 to-transparent" />
            <div className="space-y-8 md:space-y-10">
              {steps.map((item, i) => (
                <div key={item.step} className="relative md:grid md:grid-cols-[1fr_auto_1fr] md:items-center gap-6 md:gap-14">
                  {/* Number bubble on the line */}
                  <div className="absolute left-6 md:left-8 -translate-x-1/2 top-8 md:top-1/2 md:-translate-y-1/2 z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-xl ring-4 ring-white ${
                      isStudent
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-300/50'
                        : 'bg-gradient-to-br from-[#1a2e35] to-slate-700 shadow-slate-300/50'
                    }`}>
                      {item.step}
                    </div>
                  </div>

                  {/* Icon card (opposite side on desktop) */}
                  <div className={`hidden md:flex items-center justify-center ${i % 2 === 0 ? 'md:order-1' : 'md:order-3'}`}>
                    <div className="w-24 h-24 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${accentGradient}`}>
                        <i className={`fas ${item.icon} text-2xl`} />
                      </div>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className={`ml-16 md:ml-0 ${i % 2 === 0 ? 'md:order-3' : 'md:order-1'} ${i % 2 === 0 ? '' : 'md:text-right'}`}>
                    <div className="bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3 md:hidden">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${accentGradient}`}>
                          <i className={`fas ${item.icon} text-sm`} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider">Step {item.step}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1a2e35] mb-2">{item.title}</h3>
                      <p className="text-slate-400 mb-4 leading-relaxed">{item.desc}</p>
                      <ul className="space-y-2.5">
                        {item.details.map((d) => (
                          <li key={d} className="flex items-start gap-3 text-slate-600 text-sm">
                            <i className={`fas fa-circle-check mt-0.5 text-sm ${isStudent ? 'text-emerald-500' : 'text-teal-600'}`} />
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRO TIPS ─────────────────────────────────── */}
      <section className="py-14 md:py-20 bg-slate-50/60">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Pro Tips
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1a2e35] tracking-tight">
              {isStudent ? 'Make the Most of Tadrebk' : 'Hire Better, Faster'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((t) => (
              <div key={t.title} className="bg-white rounded-3xl border border-gray-50 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 ${accentGradient}`}>
                  <i className={`fas ${t.icon} text-sm`} />
                </div>
                <h3 className="font-bold text-[#1a2e35] mb-2 text-sm">{t.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────── */}
      <section className="py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a2e35] tracking-tight">
              {isStudent ? 'Students Ask Us' : 'Companies Ask Us'}
            </h2>
          </div>

          <div className="space-y-4" key={role}>
            {faq.map((item, i) => (
              <details
                key={item.q}
                className="group bg-white rounded-2xl border border-gray-50 shadow-sm open:shadow-md transition-all"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none text-[#1a2e35] font-bold text-sm">
                  {item.q}
                  <i className={`fas fa-chevron-down text-slate-300 group-open:rotate-180 transition-transform ${isStudent ? 'group-open:text-emerald-500' : 'group-open:text-teal-600'}`} />
                </summary>
                <div className="px-6 pb-5 pt-0 text-slate-500 text-sm leading-relaxed border-t border-gray-50">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className={`py-16 ${isStudent ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900' : 'bg-gradient-to-r from-slate-900 via-[#1a2e35] to-slate-900'}`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          {welcome ? (
            <>
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {isStudent ? 'Ready to land your internship?' : 'Ready to build your team?'}
              </h2>
              <p className="text-emerald-200/80 mb-8 max-w-xl mx-auto">
                {isStudent
                  ? 'Your tour is done — your dashboard is waiting.'
                  : 'Your tour is done — your admin dashboard is waiting.'}
              </p>
              <Button variant="primary" size="lg" onClick={onGotIt}>
                Got it
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                {isStudent ? 'Ready to Land Your Internship?' : 'Ready to Build Your Team?'}
              </h2>
              <p className="text-emerald-200/80 mb-8 max-w-xl mx-auto">
                {isStudent
                  ? 'Join thousands of Egyptian students already finding opportunities on Tadrebk.'
                  : 'Join the verified companies hiring the best university talent in Egypt.'}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isStudent ? '/signup/student' : '/signup/company'}>
                  <Button variant="primary" size="lg">
                    {isStudent ? 'Create Student Account' : 'Register Your Company'}
                  </Button>
                </Link>
                <Link href={isStudent ? '/internships' : '/companies'}>
                  <Button variant="outline" size="lg">
                    {isStudent ? 'Browse Internships' : 'View Companies'}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

