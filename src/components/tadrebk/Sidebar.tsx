'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  CheckSquare,
  FolderKanban,
  ClipboardCheck,
  Trophy,
  MessageSquare,
  BarChart3,
  Settings,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminShell } from '@/components/tadrebk/admin-shell';

const NAV_ITEMS: { label: string; icon: LucideIcon; href?: string }[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/company/admin' },
  { label: 'Interns', icon: Users, href: '/company/admin/interns' },
  { label: 'Tasks', icon: CheckSquare, href: '/company/admin/tasks' },
  { label: 'Projects', icon: FolderKanban },
  { label: 'Evaluations', icon: ClipboardCheck, href: '/company/admin/evaluations' },
  { label: 'Leaderboard', icon: Trophy, href: '/company/admin/leaderboard' },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Reports', icon: BarChart3, href: '/company/admin/reports' },
  { label: 'Settings', icon: Settings, href: '/company/settings' },
];

type SidebarProps = {
  active?: string;
  adminName?: string;
  adminRole?: string;
};

export default function Sidebar({ active, adminName, adminRole }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminShell();

  const isActive = (label: string, href?: string) => {
    if (active) return label === active;
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Backdrop — mobile only */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'z-50 flex w-72 max-w-[85vw] flex-shrink-0 flex-col border-r border-slate-200 bg-white',
          'fixed inset-y-0 left-0 transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 lg:transition-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/favicon2.png" alt="" className="h-6 w-6" />
            </Link>
            <Link href="/" className="text-lg font-semibold text-slate-900">Tadrebk</Link>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const selected = isActive(label, href);
            const content = (
              <>
                <Icon size={18} />
                {label}
              </>
            );
            const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
              selected ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
            }`;
            return href ? (
              <Link key={label} href={href} className={cls} onClick={() => setSidebarOpen(false)}>
                {content}
              </Link>
            ) : (
              <button key={label} type="button" className={`${cls} cursor-not-allowed opacity-70`}>
                {content}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
              {(adminName || 'Admin User')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium text-slate-900">{adminName || 'Admin User'}</p>
              <p className="truncate text-xs text-slate-400">{adminRole || 'Company Name'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}