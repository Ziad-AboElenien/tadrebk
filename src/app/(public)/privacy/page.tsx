import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Tadrebk collects, uses, and protects your personal information.',
};

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'We collect information you provide directly, such as your name, email address, phone number, university, and any information you add to your profile.',
      'We also collect data automatically, including your IP address, browser type, and pages you visit, to help us improve the platform.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To operate and maintain your account, including verifying your identity and sending service-related notifications.',
      'To match students with relevant internship opportunities and allow companies to review applications.',
      'To improve our services, provide customer support, and send you updates you have opted in to.',
    ],
  },
  {
    title: '3. Sharing of Information',
    body: [
      'We share profile and application information with the companies you apply to, solely for evaluating your application.',
      'We never sell your personal data to third parties.',
      'We may share information with trusted service providers who help us run the platform, under strict confidentiality agreements.',
    ],
  },
  {
    title: '4. Data Security',
    body: [
      'We use industry-standard measures such as encryption and secure storage to protect your data.',
      'Access to your information is limited to authorized personnel who need it to perform their duties.',
    ],
  },
  {
    title: '5. Your Rights',
    body: [
      'You can access, update, or correct your personal information at any time from your profile settings.',
      'You may request deletion of your account and associated data by contacting us.',
      'You can opt out of promotional communications at any time.',
    ],
  },
  {
    title: '6. Cookies',
    body: [
      'We use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the platform is used.',
      'You can control cookies through your browser settings, though disabling them may affect some features.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    body: [
      'Tadrebk is intended for users aged 16 and above. We do not knowingly collect personal information from children under 16.',
    ],
  },
  {
    title: '8. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page.',
    ],
  },
  {
    title: '9. Contact Us',
    body: [
      'If you have questions about this Privacy Policy or how we handle your data, reach out at support@tadrebk.com.',
    ],
  },
];

export default function PrivacyPage() {
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
            Legal
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Last updated: August 2026. Your privacy matters to us.
          </p>
        </div>
      </section>

      {/* ─── CONTENT ──────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 space-y-12">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-2xl font-black text-[#1a2e35] tracking-tight mb-4">{s.title}</h2>
              <div className="space-y-3">
                {s.body.map((p) => (
                  <p key={p} className="text-gray-500 leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              Have a question about your data? <Link href="/contact" className="font-semibold text-emerald-600 hover:text-emerald-700">Contact our team</Link> and we will be happy to help.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
