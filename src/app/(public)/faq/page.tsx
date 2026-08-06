import type { Metadata } from 'next';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about Tadrebk — accounts, applications, internships, billing, and more.',
};

const groups = [
  {
    icon: 'fa-user-plus',
    title: 'General & Accounts',
    items: [
      { q: 'Is Tadrebk free for students?', a: 'Absolutely! Tadrebk is 100% free for students. You can browse, save, and apply to internships at no cost.' },
      { q: 'Who can use Tadrebk?', a: 'University students in Egypt looking for internships, and companies of all sizes looking to hire fresh talent.' },
      { q: 'How do I delete my account?', a: 'Go to your profile, open Account Settings, and choose Delete Account. You can also contact support and we will handle it for you.' },
    ],
  },
  {
    icon: 'fa-magnifying-glass',
    title: 'Finding & Applying',
    items: [
      { q: 'Can I apply to multiple internships?', a: 'Yes! You can apply to as many internships as you want. Track all your applications from your student dashboard.' },
      { q: 'How do I know if I got accepted?', a: 'Companies review your application and update its status. You\'ll see it change from "Pending" to "Accepted" or "Rejected" in your dashboard.' },
      { q: 'What if I need to cancel an application?', a: 'You can cancel any pending application directly from your My Applications page. Once accepted or rejected, cancellation is not possible.' },
    ],
  },
  {
    icon: 'fa-building',
    title: 'For Companies',
    items: [
      { q: 'How do companies verify their identity?', a: 'Companies submit a legal attachment during registration. Our admin team reviews and approves each company before they can post internships.' },
      { q: 'Can companies post internships for free?', a: 'Yes, posting internships on Tadrebk is completely free for registered and approved companies.' },
      { q: 'How do I post an internship?', a: 'Log in to your company dashboard, click Post an Internship, and fill in the details. Your listing goes live immediately.' },
      { q: 'What is the verification process?', a: 'After registering, your company is reviewed by our admin team. You can start posting once your account is approved.' },
    ],
  },
  {
    icon: 'fa-wallet',
    title: 'Billing & Account Security',
    items: [
      { q: 'How do I change my password?', a: 'Go to Account Settings → Security, then choose Change Password. You will need your current password to continue.' },
      { q: 'How do I change my email?', a: 'Go to Account Settings → Security, then choose Change Email. We will send a confirmation code to your new address.' },
      { q: 'What company plans are available?', a: 'Visit the Plans page to compare available plans and features. Companies can upgrade or downgrade at any time.' },
    ],
  },
  {
    icon: 'fa-triangle-exclamation',
    title: 'Troubleshooting',
    items: [
      { q: 'My certificate file is too large', a: 'Certificate uploads must be 2 MB or smaller and can be an image or PDF. Compress the file and try again.' },
      { q: 'I\'m not receiving notifications', a: 'Check that notifications are enabled in your browser, and verify your email inbox and spam folder. You can also check the notifications page.' },
      { q: 'I can\'t sign in', a: 'Make sure you are using the correct email and password. If you forgot your password, use the "Forgot password" option on the sign in page.' },
    ],
  },
];

export default function FaqPage() {
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
            FAQ
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e35] tracking-tight mb-6">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Quick answers to the questions we hear the most.
          </p>
        </div>
      </section>

      {/* ─── FAQ GROUPS ───────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 space-y-16">
          {groups.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white">
                  <i className={`fas ${group.icon} text-base`} />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1a2e35] tracking-tight">
                  {group.title}
                </h2>
              </div>

              <div className="space-y-4">
                {group.items.map((item) => (
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
          ))}

          {/* CTA */}
          <div className="text-center bg-white rounded-[32px] border border-gray-50 shadow-sm p-10">
            <h3 className="text-2xl font-black text-[#1a2e35] mb-2">Still have questions?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Our support team is happy to help with anything not covered here.
            </p>
            <Link href="/contact" className="inline-block">
              <Button variant="primary">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
