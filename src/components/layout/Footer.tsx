'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import type { UserRole } from '@/features/auth/types';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const explore: FooterColumn = {
  title: 'Explore',
  links: [
    { label: 'Browse Internships', href: '/internships' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Companies', href: '/companies' },
    { label: 'About Us', href: '/about' },
  ],
};

const studentColumns: FooterColumn[] = [
  {
    title: 'Student',
    links: [
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'My Profile', href: '/profile' },
      { label: 'My Applications', href: '/my-applications' },
      { label: 'Notifications', href: '/notifications' },
      { label: 'Change Password', href: '/change-password' },
    ],
  },
  explore,
];

const companyColumns: FooterColumn[] = [
  {
    title: 'Company',
    links: [
      { label: 'Dashboard', href: '/company/dashboard' },
      { label: 'Post an Internship', href: '/company/post-internship' },
      { label: 'Company Profile', href: '/company/profile' },
      { label: 'Billing', href: '/company/billing' },
      { label: 'Settings', href: '/company/settings' },
    ],
  },
  explore,
];

const adminColumns: FooterColumn[] = [
  {
    title: 'Admin',
    links: [
      { label: 'Dashboard', href: '/admin/dashboard' },
      { label: 'My Profile', href: '/profile' },
      { label: 'Change Password', href: '/change-password' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Browse Internships', href: '/internships' },
      { label: 'For Companies', href: '/companies' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'About Us', href: '/about' },
    ],
  },
];

const guestColumns: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Internships', href: '/internships' },
      { label: 'How It Works', href: '/how-it-works' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: 'Students',
    links: [
      { label: 'Get Started', href: '/get-started' },
      { label: 'Create Account', href: '/signup/student' },
      { label: 'Sign In', href: '/login/student' },
    ],
  },
  {
    title: 'Companies',
    links: [
      { label: 'Register Your Company', href: '/signup/company' },
      { label: 'Company Sign In', href: '/login/company' },
      { label: 'View All Companies', href: '/companies' },
    ],
  },
];

const support: FooterColumn = {
  title: 'Support',
  links: [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'FAQ', href: '/faq' },
  ],
};

function columnsFor(role: UserRole | 'guest'): FooterColumn[] {
  if (role === 'student') return [...studentColumns, support];
  if (role === 'company') return [...companyColumns, support];
  if (role === 'admin') return [...adminColumns, support];
  return [...guestColumns, support];
}

export default function Footer() {
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);
  const [mounted, setMounted] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  const current: UserRole | 'guest' =
    mounted && isAuthenticated ? role : 'guest';
  const columns = columnsFor(current);
  const gridClass =
    current === 'guest'
      ? 'lg:grid-cols-6'
      : 'lg:grid-cols-5';

  return (
    <footer className="bg-gray-900 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridClass} gap-10 mb-14`}>
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-white text-2xl font-black mb-4">Tadrebk</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              Connecting Egypt&apos;s brightest university students with the future of work. Your career starts here.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'fab fa-linkedin-in', href: '#', label: 'LinkedIn' },
                { icon: 'fab fa-twitter', href: '#', label: 'Twitter' },
                { icon: 'fab fa-instagram', href: '#', label: 'Instagram' },
                { icon: 'fab fa-facebook-f', href: '#', label: 'Facebook' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary hover:text-white text-gray-400 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">{col.title}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-10 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold text-base">Stay updated</h4>
              <p className="text-gray-400 text-sm mt-1">Get notified about new internships and opportunities.</p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-64 px-4 py-2.5 rounded-l-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-r-xl transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © {year} Tadrebk. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1">
              Made with <i className="fas fa-heart text-red-400" /> in Egypt
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
