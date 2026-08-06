import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Tadrebk team. We are happy to answer any question.',
};

const channels = [
  { icon: 'fa-envelope', title: 'Email', value: 'support@tadrebk.com' },
  { icon: 'fa-location-dot', title: 'Headquarters', value: 'Cairo, Egypt' },
  { icon: 'fa-clock', title: 'Response Time', value: 'Within 24 hours' },
];

export default function ContactPage() {
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
            Contact Us
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-6">
            We&apos;d Love to Hear From You
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Questions about internships, companies, or your account? Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      {/* ─── CONTACT ──────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          {/* Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {channels.map((c) => (
              <div key={c.title} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white mb-4">
                  <i className={`fas ${c.icon} text-lg`} />
                </div>
                <h3 className="text-base font-black text-[#1a2e35]">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
