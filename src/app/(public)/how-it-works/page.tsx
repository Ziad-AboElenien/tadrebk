'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

const steps = [
  {
    step: '01',
    icon: 'fa-user-plus',
    title: 'Create Your Account',
    desc: 'Sign up in under 2 minutes as a student or a company. All you need is your email or Google account.',
    details: [
      'Choose your role — Student or Company',
      'Fill in your basic info or sign in with Google',
      'Verify your email (one-time OTP)',
      'You\'re ready to go!',
    ],
  },
  {
    step: '02',
    icon: 'fa-search',
    title: 'Find the Right Internship',
    desc: 'Browse hundreds of listings from top companies across Egypt, filtered by your field, location, and preferences.',
    details: [
      'Search by title, skill, or company name',
      'Filter by location (on-site, remote, hybrid)',
      'Filter by working time (full-time, part-time)',
      'Save internships to revisit later',
    ],
  },
  {
    step: '03',
    icon: 'fa-paper-plane',
    title: 'Apply with One Click',
    desc: 'Submit your application instantly. Track every application from your dashboard and get notified when companies respond.',
    details: [
      'Apply directly through the platform',
      'Track application status (pending, accepted, rejected)',
      'Cancel applications if your plans change',
      'Get accepted and start your journey!',
    ],
  },
];

const faq = [
  { q: 'Is Tadrebk free for students?', a: 'Absolutely! Tadrebk is 100% free for students. You can browse, save, and apply to internships at no cost.' },
  { q: 'How do companies verify their identity?', a: 'Companies submit a legal attachment during registration. Our admin team reviews and approves each company before they can post internships.' },
  { q: 'Can I apply to multiple internships?', a: 'Yes! You can apply to as many internships as you want. Track all your applications from your student dashboard.' },
  { q: 'How do I know if I got accepted?', a: 'Companies will review your application and update the status. You\'ll see it change from "Pending" to "Accepted" or "Rejected" in your dashboard.' },
  { q: 'What if I need to cancel an application?', a: 'You can cancel any pending application directly from your My Applications page. Once accepted or rejected, cancellation is not possible.' },
  { q: 'Can companies post internships for free?', a: 'Yes, posting internships on Tadrebk is completely free for registered and approved companies.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-6">
            Guide
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-6">
            How Tadrebk Works
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re a student looking for your next opportunity or a company seeking fresh talent — we&apos;ve got you covered.
          </p>
        </div>
      </section>

      {/* ─── STEPS ─────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4 space-y-24">
          {steps.map((item, i) => (
            <div
              key={item.step}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
            >
              <div className={`${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-2xl font-black mb-6 shadow-lg">
                  {item.step}
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-[#1a2e35] tracking-tight mb-4">
                  {item.title}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {item.desc}
                </p>
                <ul className="space-y-3">
                  {item.details.map((d) => (
                    <li key={d} className="flex items-start gap-3 text-gray-600">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5 text-sm" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-[32px] p-10 md:p-14 shadow-sm border border-green-100 flex items-center justify-center min-h-[280px]">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-200/50">
                    <i className={`fas ${item.icon} text-4xl md:text-5xl`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FOR STUDENTS VS COMPANIES ────────────────── */}
      <section className="py-20 bg-gray-50/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
              Two Ways to Use Tadrebk
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Whether you&apos;re starting your career or building your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6">
                <i className="fas fa-graduation-cap text-xl" />
              </div>
              <h3 className="text-2xl font-black text-[#1a2e35] mb-3">For Students</h3>
              <ul className="space-y-3 text-gray-500">
                {['Browse and search internships', 'Apply with one click', 'Track your applications', 'Build your professional profile'].map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <i className="fas fa-check text-emerald-500 text-sm" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/get-started" className="mt-8 inline-block">
                <Button variant="primary">Get Started as a Student</Button>
              </Link>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-gray-50 shadow-sm">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1a2e35] to-slate-700 rounded-2xl flex items-center justify-center text-white mb-6">
                <i className="fas fa-building text-xl" />
              </div>
              <h3 className="text-2xl font-black text-[#1a2e35] mb-3">For Companies</h3>
              <ul className="space-y-3 text-gray-500">
                {['Register and get verified', 'Post internship opportunities', 'Review and manage applications', 'Find top student talent'].map((text) => (
                  <li key={text} className="flex items-center gap-3">
                    <i className="fas fa-check text-emerald-500 text-sm" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link href="/get-started" className="mt-8 inline-block">
                <Button variant="secondary">Register Your Company</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="group bg-white rounded-2xl border border-gray-50 shadow-sm open:shadow-md transition-all">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none text-[#1a2e35] font-bold text-sm">
                  {item.q}
                  <i className="fas fa-chevron-down text-gray-300 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-5 pt-0 text-gray-500 text-sm leading-relaxed border-t border-gray-50 mt-0">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-white text-3xl md:text-4xl font-black mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-emerald-200/80 mb-8 max-w-xl mx-auto">
            Join thousands of Egyptian students and companies already on Tadrebk.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/get-started">
              <Button variant="primary" size="lg">
                Create Free Account
              </Button>
            </Link>
            <Link href="/internships">
              <Button variant="outline" size="lg">
                Browse Internships
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
