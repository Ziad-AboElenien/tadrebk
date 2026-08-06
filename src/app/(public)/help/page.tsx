import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Help Center',
  description:
    'Get help with using Tadrebk — guides for students, companies, account management, billing, and troubleshooting.',
};

const categories = [
  {
    icon: 'fa-rocket',
    title: 'Getting Started',
    desc: 'Create your account, verify your email, and set up your profile in minutes.',
    articles: [
      'How to create a student account',
      'How to register your company',
      'How email verification works',
    ],
  },
  {
    icon: 'fa-magnifying-glass',
    title: 'Finding & Applying',
    desc: 'Browse internships, use filters, and apply with one click.',
    articles: [
      'How to search for internships',
      'Understanding filters',
      'How to apply for an internship',
    ],
  },
  {
    icon: 'fa-building',
    title: 'For Companies',
    desc: 'Post internships, review applicants, and manage your company profile.',
    articles: [
      'How to post an internship',
      'Reviewing applications',
      'Company verification process',
    ],
  },
  {
    icon: 'fa-wallet',
    title: 'Account & Billing',
    desc: 'Manage your account security, subscriptions, and billing details.',
    articles: [
      'Change your password or email',
      'Understanding company plans',
      'How billing works',
    ],
  },
  {
    icon: 'fa-triangle-exclamation',
    title: 'Troubleshooting',
    desc: 'Fix common issues with uploads, notifications, and sign in.',
    articles: [
      'Certificate file too large',
      'Not receiving notifications',
      'Can\'t sign in',
    ],
  },
];

export default function HelpCenterPage() {
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
            Help Center
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-6">
            How can we help you?
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8">
            Everything you need to make the most of Tadrebk — from your first account to your first internship.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/faq">
              <Button variant="primary" size="lg">Browse FAQ</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg">Contact Support</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
              Popular Topics
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Pick a topic to find the answer you&apos;re looking for.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.title}
                className="bg-white p-8 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  <i className={`fas ${cat.icon} text-xl`} />
                </div>
                <h3 className="text-xl font-black text-[#1a2e35] mb-2">{cat.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{cat.desc}</p>
                <ul className="space-y-2.5">
                  {cat.articles.map((a) => (
                    <li key={a} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <i className="fas fa-circle-check text-emerald-500 mt-0.5 text-xs" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Still need help card */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 text-white flex flex-col justify-center shadow-lg">
              <h3 className="text-xl font-black mb-2">Still need help?</h3>
              <p className="text-emerald-200/80 text-sm leading-relaxed mb-6">
                Our support team is happy to assist you with any questions you have.
              </p>
              <Link href="/contact" className="inline-block">
                <Button variant="primary">Contact Us</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
