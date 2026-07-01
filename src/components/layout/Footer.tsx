import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
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

          {/* For Students */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Students</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Browse Internships', href: '/internships' },
                { label: 'How It Works', href: '/how-it-works' },
                { label: 'Student Dashboard', href: '/dashboard' },
                { label: 'My Profile', href: '/profile' },
                { label: 'My Applications', href: '/my-applications' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Companies</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Post an Internship', href: '/company/post-internship' },
                { label: 'Company Dashboard', href: '/company/dashboard' },
                { label: 'Company Profile', href: '/company/profile' },
                { label: 'Company Settings', href: '/company/settings' },
                { label: 'View All Companies', href: '/companies' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-5 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'FAQ', href: '#' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
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
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">|</span>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
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
