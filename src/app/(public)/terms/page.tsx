import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms and conditions that govern your use of the Tadrebk platform.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By creating an account or using Tadrebk, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
    ],
  },
  {
    title: '2. Eligibility',
    body: [
      'You must be at least 16 years old to use Tadrebk.',
      'Companies registering on the platform must have the legal authority to post internships and represent their organization.',
    ],
  },
  {
    title: '3. Your Account',
    body: [
      'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.',
      'You agree to provide accurate information when creating your profile and to keep it up to date.',
    ],
  },
  {
    title: '4. Acceptable Use',
    body: [
      'You agree not to post false, misleading, or unlawful content, impersonate others, or attempt to gain unauthorized access to the platform.',
      'Students must be honest in their profiles and applications. Companies must provide accurate internship details.',
      'We reserve the right to suspend or terminate accounts that violate these rules.',
    ],
  },
  {
    title: '5. Applications & Hiring',
    body: [
      'Tadrebk is a connecting platform. Companies are solely responsible for their hiring decisions, and students are solely responsible for their applications.',
      'We do not guarantee placement, acceptance, or employment outcomes.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'All content on Tadrebk — including the logo, design, and platform code — is the property of Tadrebk and protected by applicable laws.',
      'By uploading content to the platform, you grant Tadrebk a limited license to host and display it for the purpose of providing our services.',
    ],
  },
  {
    title: '7. Paid Services',
    body: [
      'Some company features may be subject to fees. By subscribing, you agree to the pricing displayed at the time of purchase.',
      'Refunds are handled in accordance with our billing terms. Contact us for billing questions.',
    ],
  },
  {
    title: '8. Limitation of Liability',
    body: [
      'To the maximum extent permitted by law, Tadrebk is not liable for indirect, incidental, or consequential damages arising from your use of the platform.',
      'Our total liability for any claim shall not exceed the amount you paid to us in the six months preceding the claim.',
    ],
  },
  {
    title: '9. Termination',
    body: [
      'You may delete your account at any time from your account settings.',
      'We may suspend or terminate access if you violate these terms, without prejudice to any other rights.',
    ],
  },
  {
    title: '10. Changes to These Terms',
    body: [
      'We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.',
    ],
  },
  {
    title: '11. Contact Us',
    body: [
      'Questions about these Terms of Service? Reach us at support@tadrebk.com.',
    ],
  },
];

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Last updated: August 2026. Please read these terms carefully before using Tadrebk.
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
              Questions about these terms? <Link href="/contact" className="font-semibold text-emerald-600 hover:text-emerald-700">Contact our team</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
