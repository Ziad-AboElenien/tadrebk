'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

type Role = 'student' | 'company';

const studentSteps = [
  {
    step: '01',
    icon: 'fa-user-plus',
    title: 'Create your account',
    desc: 'Sign up with your email or Google in under 2 minutes. Verify with a one-time OTP and you\'re in.',
    details: [
      'Register as a Student with your university email or Google',
      'Verify your email with a one-time code (OTP)',
      'Set your full name and university — that\'s it',
    ],
  },
  {
    step: '02',
    icon: 'fa-user-graduate',
    title: 'Build your profile',
    desc: 'Tell Tadrebk what you study and where you want to go — so the right opportunities find you.',
    details: [
      'Add your university, field of study and skills',
      'Pick your preferred location (on-site, remote, hybrid)',
      'Choose the tracks that match your career goals',
    ],
  },
  {
    step: '03',
    icon: 'fa-magnifying-glass',
    title: 'Explore internships',
    desc: 'Browse a feed of fresh opportunities posted by verified companies across Egypt.',
    details: [
      'Search by title, skill or company name',
      'Filter by location and working time',
      'Save internships with one tap to apply later',
    ],
  },
  {
    step: '04',
    icon: 'fa-paper-plane',
    title: 'Apply in one click',
    desc: 'Send your application instantly — no cover letters, no long forms.',
    details: [
      'One-click apply on any open internship',
      'The company sees your profile and application instantly',
      'Change your mind? Cancel a pending application anytime',
    ],
  },
  {
    step: '05',
    icon: 'fa-list-check',
    title: 'Track your applications',
    desc: 'Follow every application from your dashboard — you always know where you stand.',
    details: [
      'Pending — your application is under review',
      'Accepted — congratulations, you\'re hired!',
      'Rejected — don\'t worry, more opportunities are coming',
    ],
  },
  {
    step: '06',
    icon: 'fa-bell',
    title: 'Get notified & start',
    desc: 'Never miss a response. Tadrebk notifies you the moment a company makes a decision.',
    details: [
      'Real-time notifications on every status change',
      'Accept the internship and start your journey',
      'Build real experience that counts toward your career',
    ],
  },
];

const companySteps = [
  {
    step: '01',
    icon: 'fa-building-circle-check',
    title: 'Register your company',
    desc: 'Create a company account and verify your identity in minutes.',
    details: [
      'Register with your company work email',
      'Submit a legal attachment for verification',
      'Verify your email with a one-time code (OTP)',
    ],
  },
  {
    step: '02',
    icon: 'fa-shield-halved',
    title: 'Get approved by admin',
    desc: 'Our admin team reviews and approves every company before it can post — so students only see trusted employers.',
    details: [
      'Admin reviews your registration and legal documents',
      'Once approved, posting is fully unlocked',
      'You can prepare your first internship while you wait',
    ],
  },
  {
    step: '03',
    icon: 'fa-plus',
    title: 'Post your internship',
    desc: 'Create a clear, attractive listing that brings you the right talent.',
    details: [
      'Add title, description, industry, location and working time',
      'Pick the tracks and required technical skills',
      'Optional assessment questions (MCQ or written) to screen candidates',
    ],
  },
  {
    step: '04',
    icon: 'fa-users',
    title: 'Receive applications',
    desc: 'Students apply directly and everything lands in one clean dashboard.',
    details: [
      'Live list of applicants for every internship',
      'View each student\'s profile, skills and assessment answers',
      'Filter and compare candidates side by side',
    ],
  },
  {
    step: '05',
    icon: 'fa-user-check',
    title: 'Choose your talent',
    desc: 'Accept or reject applicants with one click — and keep your pipeline healthy.',
    details: [
      'Update status to Accepted or Rejected',
      'Students get notified the moment you decide',
      'Edit or close internships anytime to stop receiving applications',
    ],
  },
];

const studentTips = [
  { icon: 'fa-wand-magic-sparkles', title: 'Complete your profile', text: 'Profiles with skills and a university get far more responses. Spend 2 minutes and finish it.' },
  { icon: 'fa-crosshairs', title: 'Apply to what fits', text: 'Focus on internships matching your tracks and skills — quality beats quantity.' },
  { icon: 'fa-bolt', title: 'Apply early', text: 'Companies review applications as they come in. Early applicants often get noticed first.' },
  { icon: 'fa-clock', title: 'Check your notifications', text: 'A company might respond within hours. Keep an eye on your dashboard to reply quickly.' },
];

const companyTips = [
  { icon: 'fa-file-circle-check', title: 'Describe the role clearly', text: 'Clear titles and descriptions attract better-matched applicants and fewer random clicks.' },
  { icon: 'fa-screwdriver-wrench', title: 'List real skills', text: 'The skills you add power students\' search and filters — accurate skills = better candidates.' },
  { icon: 'fa-question', title: 'Use assessment questions', text: 'A quick MCQ or writing question filters candidates before you even look at profiles.' },
  { icon: 'fa-bolt', title: 'Respond fast', text: 'Fast decisions build a great employer brand — students remember companies that reply.' },
];

const studentFaq = [
  { q: 'Is Tadrebk free for students?', a: 'Absolutely! Tadrebk is 100% free for students. You can browse, save and apply to internships with no cost at all.' },
  { q: 'Can I apply to multiple internships?', a: 'Yes! Apply to as many as you want. Track all of them from your student dashboard in one place.' },
  { q: 'How do I know if I got accepted?', a: 'The status changes from Pending to Accepted or Rejected, and you get a real-time notification the moment the company decides.' },
  { q: 'What if I need to cancel an application?', a: 'You can cancel any pending application from your My Applications page. Once a company accepts or rejects, it\'s final.' },
  { q: 'What do companies see about me?', a: 'Companies see your profile — your name, university, skills and the tracks you\'re interested in. That\'s why a complete profile matters.' },
];

const companyFaq = [
  { q: 'Is posting internships free?', a: 'Yes! Posting internships on Tadrebk is completely free for registered and approved companies.' },
  { q: 'Why do companies need admin approval?', a: 'Every company is verified before posting so students can trust that every opportunity on Tadrebk is legitimate.' },
  { q: 'How do I review applicants?', a: 'Open any internship and click Applicants. You\'ll see every applicant with their profile and answers to your assessment questions.' },
  { q: 'Can I edit or close an internship?', a: 'Yes. You can edit any internship anytime, and close it to stop receiving new applications whenever you want.' },
  { q: 'How do students find my internship?', a: 'Students search by title, skills, location and tracks. Listing accurate skills and choosing the right tracks puts you in front of the right students.' },
];

const glanceStudent = [
  { icon: 'fa-user-plus', label: 'Create account' },
  { icon: 'fa-user-graduate', label: 'Build profile' },
  { icon: 'fa-magnifying-glass', label: 'Find & apply' },
  { icon: 'fa-briefcase', label: 'Get hired' },
];

const glanceCompany = [
  { icon: 'fa-building-circle-check', label: 'Register' },
  { icon: 'fa-shield-halved', label: 'Get approved' },
  { icon: 'fa-plus', label: 'Post internship' },
  { icon: 'fa-user-check', label: 'Hire talent' },
];

export default function HowItWorksPage() {
  const [role, setRole] = useState<Role>('student');
  const isStudent = role === 'student';
  const steps = isStudent ? studentSteps : companySteps;
  const tips = isStudent ? studentTips : companyTips;
  const faq = isStudent ? studentFaq : companyFaq;
  const glance = isStudent ? glanceStudent : glanceCompany;

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
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-5">
            How Tadrebk Works
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Choose your side — students and companies follow different paths. Pick yours and we&apos;ll walk you through every step.
          </p>

          {/* Role toggle */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur border border-gray-100 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <button
              onClick={() => setRole('student')}
              className={`flex items-center gap-2 px-6 sm:px-9 py-3 rounded-full text-sm font-bold transition-all ${
                isStudent
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-graduation-cap" />
              For Students
            </button>
            <button
              onClick={() => setRole('company')}
              className={`flex items-center gap-2 px-6 sm:px-9 py-3 rounded-full text-sm font-bold transition-all ${
                !isStudent
                  ? 'bg-gradient-to-r from-[#1a2e35] to-slate-700 text-white shadow-lg shadow-slate-500/25'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <i className="fas fa-building" />
              For Companies
            </button>
          </div>
        </div>
      </section>

      {/* ─── JOURNEY AT A GLANCE ──────────────────────── */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 inset-x-16 h-0.5 bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-200" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  <span className="text-xs font-black text-[#1a2e35] uppercase tracking-wider">{g.label}</span>
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
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
              {isStudent ? 'Your Journey, Step by Step' : 'From Registration to Hiring'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl ring-4 ring-white ${
                      isStudent
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-300/50'
                        : 'bg-gradient-to-br from-[#1a2e35] to-slate-700 shadow-slate-300/50'
                    }`}>
                      {item.step}
                    </div>
                  </div>

                  {/* Icon card (opposite side on desktop) */}
                  <div className={`hidden md:flex items-center justify-center ${i % 2 === 0 ? 'md:order-1' : 'md:order-3'}`}>
                    <div className="w-24 h-24 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white ${
                        isStudent
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                          : 'bg-gradient-to-br from-[#1a2e35] to-slate-700'
                      }`}>
                        <i className={`fas ${item.icon} text-2xl`} />
                      </div>
                    </div>
                  </div>

                  {/* Content card */}
                  <div className={`ml-16 md:ml-0 ${i % 2 === 0 ? 'md:order-3' : 'md:order-1'} ${i % 2 === 0 ? '' : 'md:text-right'}`}>
                    <div className="bg-white rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-3 md:hidden">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${
                          isStudent
                            ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                            : 'bg-gradient-to-br from-[#1a2e35] to-slate-700'
                        }`}>
                          <i className={`fas ${item.icon} text-sm`} />
                        </div>
                        <span className="text-xs font-black text-emerald-600/70 uppercase tracking-wider">Step {item.step}</span>
                      </div>
                      <h3 className="text-2xl font-black text-[#1a2e35] mb-2">{item.title}</h3>
                      <p className="text-gray-400 mb-4 leading-relaxed">{item.desc}</p>
                      <ul className="space-y-2.5">
                        {item.details.map((d) => (
                          <li key={d} className="flex items-start gap-3 text-gray-600 text-sm">
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
      <section className="py-14 md:py-20 bg-gray-50/60">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              Pro Tips
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1a2e35] tracking-tight">
              {isStudent ? 'Make the Most of Tadrebk' : 'Hire Better, Faster'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((t) => (
              <div key={t.title} className="bg-white rounded-3xl border border-gray-50 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4 ${
                  isStudent
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                    : 'bg-gradient-to-br from-[#1a2e35] to-slate-700'
                }`}>
                  <i className={`fas ${t.icon} text-sm`} />
                </div>
                <h3 className="font-bold text-[#1a2e35] mb-2 text-sm">{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t.text}</p>
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
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight">
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
                  <i className={`fas fa-chevron-down text-gray-300 group-open:rotate-180 transition-transform ${isStudent ? 'group-open:text-emerald-500' : 'group-open:text-teal-600'}`} />
                </summary>
                <div className="px-6 pb-5 pt-0 text-gray-500 text-sm leading-relaxed border-t border-gray-50">
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
          <h2 className="text-white text-3xl md:text-4xl font-black mb-4 tracking-tight">
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
        </div>
      </section>
    </div>
  );
}
