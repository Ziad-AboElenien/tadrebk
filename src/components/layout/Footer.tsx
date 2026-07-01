import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <h2 className="text-primary text-2xl font-black mb-4">Tadrebk</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
              Connecting Egypt's brightest university students with the future of work. Your career starts here.
            </p>
            <div className="flex gap-3">
              {[
                { icon: 'fab fa-linkedin-in', href: '#', label: 'LinkedIn' },
                { icon: 'fab fa-twitter', href: '#', label: 'Twitter' },
                { icon: 'fab fa-instagram', href: '#', label: 'Instagram' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-100 hover:bg-primary hover:text-white text-gray-500 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* For Students */}
          <div>
            <h4 className="text-dark font-bold mb-5 text-sm">For Students</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Browse Internships', href: '/internships' },
                { label: 'Student Dashboard', href: '/dashboard' },
                { label: 'My Profile', href: '/profile' },
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
            <h4 className="text-dark font-bold mb-5 text-sm">For Companies</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Post an Internship', href: '/company/internships/new' },
                { label: 'Company Dashboard', href: '/company/dashboard' },
                { label: 'Company Settings', href: '/company/settings' },
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
            <h4 className="text-dark font-bold mb-5 text-sm">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
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

        <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-xs">
            © {year} Tadrebk. All rights reserved. Built for students in Egypt.
          </p>
          <p className="text-gray-300 text-xs">
            <i className="fas fa-heart text-red-400 mx-1" /> Made with <i className="fas fa-heart text-red-400 mx-1" /> in Egypt
          </p>
        </div>
      </div>
    </footer>
  );
}
