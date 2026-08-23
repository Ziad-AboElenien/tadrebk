'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/authSlice';
import { clearUser } from '@/store/userSlice';
import { clearCompany } from '@/store/companySlice';
import * as authService from '@/features/auth/server/auth.service';
import Avatar from '@/components/ui/Avatar';
import { getCompanyImgUrl } from '@/features/company/types';
import { getUserImgUrl } from '@/features/student/types';
import NotificationBell from '@/features/notifications/components/NotificationBell';
import { LS_PENDING_ONBOARDING } from '@/lib/constants';

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
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuMobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handler = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Company user stuck in onboarding → lock all navigation
  const pendingOnboarding =
    mounted &&
    typeof window !== 'undefined' &&
    localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const desktop = userMenuRef.current;
      const mobile = userMenuMobileRef.current;
      const inDesktop = desktop && desktop.contains(target);
      const inMobile = mobile && mobile.contains(target);
      if (!inDesktop && !inMobile) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Close menus on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'px-3 pt-2 bg-transparent'
          : 'bg-white border-b border-gray-50',
      ].join(' ')}
    >
      <div
        className={[
          'max-w-7xl mx-auto h-18 flex items-center justify-between gap-6 px-4 sm:px-6 transition-all duration-500',
          scrolled
            ? 'rounded-full bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.10)]'
            : 'border border-transparent',
        ].join(' ')}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/images/logoandfav.png" alt="Tadrebk" width={232} height={193} className="h-12 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        {!pendingOnboarding && (
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: '/internships', label: 'Internships' },
            { href: '/how-it-works', label: 'How it works' },
            { href: '/companies', label: 'Our Partners' },
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
          {isAuthenticated && mounted && (
            <Link
              href={role === 'company' ? '/company/activity' : '/activity'}
              className={[
                'text-sm font-semibold transition-colors',
                pathname === '/activity' || pathname === '/company/activity'
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-dark',
              ].join(' ')}
            >
              Activity
            </Link>
          )}
        </nav>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {pendingOnboarding ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-amber-600">
              <i className="fas fa-circle-exclamation" /> Complete your company profile
            </span>
          ) : !mounted ? (
            <span className="flex items-center gap-3 px-2" aria-hidden="true">
              <span className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" />
              <span className="h-3.5 w-24 rounded-full bg-gray-100 animate-pulse" />
            </span>
          ) : isAuthenticated && mounted ? (
            <>
              {(role === 'student' || role === 'company') && <NotificationBell />}
              <div className="relative" ref={userMenuRef}>
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
                      ? (getCompanyImgUrl(currentCompany?.logo) ?? null)
                      : (getUserImgUrl(currentUser?.profilePicture) ?? null)
                  }
                  name={displayName || 'User'}
                  size="sm"
                  icon={role === 'company' ? 'fa-building' : 'fa-user'}
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
                        href="/activity"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-chart-line w-4 text-center text-gray-400" />
                        Activity
                      </Link>
                    </>
                  )}
                  {role === 'company' && (
                    <>
                      <Link
                        href="/company/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-building w-4 text-center text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/company/activity"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-chart-line w-4 text-center text-gray-400" />
                        Activity
                      </Link>
                      <Link
                        href="/company/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-cog w-4 text-center text-gray-400" />
                        Settings
                      </Link>
                    </>
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
            </>
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

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          {pendingOnboarding ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <i className="fas fa-circle-exclamation" /> Complete profile
            </span>
          ) : !mounted ? (
            <span className="h-9 w-9 rounded-full bg-gray-100 animate-pulse" aria-hidden="true" />
          ) : isAuthenticated && mounted && (
            <>
              {(role === 'student' || role === 'company') && <NotificationBell />}
              <div className="relative" ref={userMenuMobileRef}>
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1 p-1 rounded-xl hover:bg-gray-50 transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <Avatar
                  src={
                    role === 'company'
                      ? (getCompanyImgUrl(currentCompany?.logo) ?? null)
                      : (getUserImgUrl(currentUser?.profilePicture) ?? null)
                  }
                  name={displayName || 'User'}
                  size="sm"
                  icon={role === 'company' ? 'fa-building' : 'fa-user'}
                />
                <i className={`fas fa-chevron-${userMenuOpen ? 'up' : 'down'} text-xs text-gray-400`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <Link
                    href={dashboardHref}
                    onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                  >
                    <i className="fas fa-th-large w-4 text-center text-gray-400" />
                    Dashboard
                  </Link>
                  {role === 'student' && (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-user w-4 text-center text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/activity"
                        onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-chart-line w-4 text-center text-gray-400" />
                        Activity
                      </Link>
                    </>
                  )}
                  {role === 'company' && (
                    <>
                      <Link
                        href="/company/profile"
                        onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-building w-4 text-center text-gray-400" />
                        My Profile
                      </Link>
                      <Link
                        href="/company/activity"
                        onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-chart-line w-4 text-center text-gray-400" />
                        Activity
                      </Link>
                      <Link
                        href="/company/settings"
                        onClick={() => { setUserMenuOpen(false); setMenuOpen(false); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                      >
                        <i className="fas fa-cog w-4 text-center text-gray-400" />
                        Settings
                      </Link>
                    </>
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
            </>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-0.5 bg-dark transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-[100]" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          {/* Panel */}
          <div className={`fixed right-2 w-[min(288px,calc(100vw-1rem))] max-h-[calc(100vh-5rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-grow-from-btn origin-top-right ${scrolled ? 'top-20' : 'top-18'}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-gray-100">
              <Image src="/images/logoandfav.png" alt="Tadrebk" width={232} height={193} className="h-12 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <i className="fas fa-xmark text-lg text-gray-500" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
              {!pendingOnboarding && (<>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Browse</p>
              <Link href="/internships" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                <i className="fas fa-search w-5 text-center text-gray-400" /> Internships
              </Link>
              <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                <i className="fas fa-circle-question w-5 text-center text-gray-400" /> How it works
              </Link>
              <Link href="/companies" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                <i className="fas fa-handshake w-5 text-center text-gray-400" /> Our Partners
              </Link>

              {isAuthenticated && mounted && (
                <>
                  <div className="h-px bg-gray-100 my-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">Account</p>
                  <Link href={dashboardHref} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                    <i className="fas fa-th-large w-5 text-center text-gray-400" /> Dashboard
                  </Link>
                  {role === 'student' && (
                    <>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-user w-5 text-center text-gray-400" /> My Profile
                      </Link>
                      <Link href="/activity" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-chart-line w-5 text-center text-gray-400" /> Activity
                      </Link>
                    </>
                  )}
                  {role === 'company' && (
                    <>
                      <Link href="/company/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-building w-5 text-center text-gray-400" /> Company Profile
                      </Link>
                      <Link href="/company/activity" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-chart-line w-5 text-center text-gray-400" /> Activity
                      </Link>
                      <Link href="/company/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-gear w-5 text-center text-gray-400" /> Settings
                      </Link>
                    </>
                  )}
                  {role === 'admin' && (
                    <>
                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-user w-5 text-center text-gray-400" /> My Profile
                      </Link>
                      <Link href="/change-password" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary transition-all">
                        <i className="fas fa-key w-5 text-center text-gray-400" /> Change Password
                      </Link>
                    </>
                  )}
                </>
              )}
              </>)}
            </div>

            {/* Bottom actions */}
            <div className="border-t border-gray-100 px-5 py-4">
              {pendingOnboarding ? (
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-500 hover:bg-red-100 transition-all">
                  <i className="fas fa-sign-out-alt" /> Sign out
                </button>
              ) : !mounted ? (
                <div className="h-11 rounded-xl bg-gray-100 animate-pulse" aria-hidden="true" />
              ) : isAuthenticated && mounted ? (
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-500 hover:bg-red-100 transition-all">
                  <i className="fas fa-sign-out-alt" /> Sign out
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login/student" onClick={() => setMenuOpen(false)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
                    <i className="fas fa-arrow-right-to-bracket" /> Sign in
                  </Link>
                  <Link href="/get-started" onClick={() => setMenuOpen(false)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm">
                    Get Started <i className="fas fa-arrow-right text-xs" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
