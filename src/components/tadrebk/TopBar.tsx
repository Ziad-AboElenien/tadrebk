'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/authSlice';
import { clearUser } from '@/store/userSlice';
import { clearCompany } from '@/store/companySlice';
import * as authService from '@/features/auth/server/auth.service';
import Avatar from '@/components/ui/Avatar';
import { getCompanyImgUrl } from '@/features/company/types';
import { useAdminShell } from '@/components/tadrebk/admin-shell';

type TopBarProps = {
  title: string;
  actions?: React.ReactNode;
};

export default function TopBar({
  title,
  actions,
}: TopBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toggleSidebar } = useAdminShell();
  const currentCompany = useAppSelector((s) => s.company.currentCompany);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  async function handleLogout() {
    await authService.logout();
    dispatch(logout());
    dispatch(clearUser());
    dispatch(clearCompany());
    document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
    document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
    router.push('/');
  }

  const links = [
    { href: '/company/admin', label: 'Dashboard', icon: 'fa-th-large' },
    { href: '/company/profile', label: 'My Profile', icon: 'fa-building' },
    { href: '/company/activity', label: 'Activity', icon: 'fa-chart-line' },
    { href: '/company/settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg lg:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Actions inline on tablet+ */}
          {actions && <div className="hidden sm:block">{actions}</div>}

          <div className="relative hidden md:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search interns, tasks..."
              className="w-48 rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 lg:w-64"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
          >
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-slate-50" />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-1 hover:bg-slate-100 sm:pr-2"
            >
              <Avatar
                src={getCompanyImgUrl(currentCompany?.logo) ?? null}
                name={currentCompany?.name || 'Company'}
                size="sm"
                icon="fa-building"
              />
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-[120px] truncate text-sm font-medium text-slate-900 lg:max-w-[140px]">
                  {currentCompany?.name || 'Company'}
                </p>
                <p className="truncate text-xs text-slate-400">{currentCompany?.industry || 'Admin'}</p>
              </div>
              <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
            </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <i className={`fas ${l.icon} w-4 text-center text-slate-400`} />
                  {l.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <i className="fas fa-sign-out-alt w-4 text-center" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Actions on mobile — full-width second row below the icons */}
      {actions && <div className="mt-3 flex w-full items-center gap-3 sm:hidden">{actions}</div>}
    </header>
  );
}