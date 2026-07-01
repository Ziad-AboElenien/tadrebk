'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/authSlice';
import { clearUser } from '@/store/userSlice';
import { clearCompany } from '@/store/companySlice';
import * as authService from '@/features/auth/server/auth.service';
import Avatar from '@/components/ui/Avatar';
import { getImgUrl } from '@/types/company';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, role } = useAppSelector((s) => s.auth);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const currentCompany = useAppSelector((s) => s.company.currentCompany);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  async function handleLogout() {
    await authService.logout();
    dispatch(logout());
    dispatch(clearUser());
    dispatch(clearCompany());
    // Clear cookies too
    document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
    document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
    router.push('/');
  }

  const dashboardHref = role === 'company' ? '/company/dashboard' : role === 'admin' ? '/admin/dashboard' : '/dashboard';
  const displayName = role === 'company'
    ? currentCompany?.name
    : `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim();

  return (
    <header
      className={[
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-50',
      ].join(' ')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black text-primary tracking-tight">Tadrebk</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '/internships', label: 'Internships' },
            { href: '/how-it-works', label: 'How it works' },
            { href: '/companies', label: 'For Companies' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={[
                'text-sm font-semibold transition-colors',
                pathname === link.href
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-dark',
              ].join(' ')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && mounted ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                id="user-menu-btn"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <Avatar
                  src={
                    role === 'company'
                      ? (getImgUrl(currentCompany?.logo) ?? null)
                      : (currentUser?.profilePicture || null)
                  }
                  name={displayName || 'User'}
                  size="sm"
                />
                <span className="text-sm font-semibold text-dark max-w-[120px] truncate">
                  {displayName || 'My Account'}
                </span>
                <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'} text-xs text-gray-400`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href={dashboardHref}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <i className="fas fa-th-large w-4 text-center text-gray-400" />
                    Dashboard
                  </Link>
                  {role === 'admin' && (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-user w-4 text-center text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/change-password"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-key w-4 text-center text-gray-400" />
                        Change Password
                      </Link>
                    </>
                  )}
                  {role === 'student' && (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-user w-4 text-center text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-paper-plane w-4 text-center text-gray-400" />
                        My Applications
                      </Link>
                    </>
                  )}
                  {role === 'company' && (
                    <Link
                      href="/company/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <i className="fas fa-cog w-4 text-center text-gray-400" />
                      Settings
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-sign-out-alt w-4 text-center" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login/student"
                className="text-sm font-semibold text-gray-600 hover:text-dark transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/get-started"
                className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-2">
          <Link href="/internships" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-600">Internships</Link>
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-600">How it works</Link>
          {isAuthenticated && mounted ? (
            <>
              <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold text-primary">Dashboard</Link>
              <button onClick={handleLogout} className="py-2 text-sm font-semibold text-red-500 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login/student" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-semibold text-gray-600">Sign in</Link>
              <Link href="/get-started" onClick={() => setMenuOpen(false)} className="py-2 text-sm font-bold text-primary">Get Started →</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
