'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  CheckSquare,
  FolderKanban,
  Layers,
  Trophy,
  Coins,
  ChevronDown,
  MessageSquare,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useAdminShell } from '@/components/tadrebk/admin-shell';

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, href: '/company/admin' },
  { label: 'Interns', icon: Users, href: '/company/admin/interns' },
  { label: 'Programs', icon: Layers, href: '/company/admin/programs' },
  { label: 'Projects', icon: FolderKanban, href: '/company/admin/projects' },
  { label: 'Tasks', icon: CheckSquare, href: '/company/admin/tasks' },
  {
    label: 'Leaderboard',
    icon: Trophy,
    href: '/company/admin/leaderboard',
    children: [{ label: 'Points', href: '/company/admin/points' }],
  },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Reports', icon: BarChart3, href: '/company/admin/reports' },
  { label: 'Settings', icon: Settings, href: '/company/settings' },
];

function subscribeMq(callback: () => void) {
  const mq = window.matchMedia('(max-width: 1023.5px)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

/** True on mobile/tablet — SSR-safe (false on server, corrected after mount). */
function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeMq,
    () => window.matchMedia('(max-width: 1023.5px)').matches,
    () => false,
  );
}

type SidebarProps = {
  active?: string;
  adminName?: string;
  adminRole?: string;
};

export default function Sidebar({ active, adminName, adminRole }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, collapsed, toggleCollapsed } = useAdminShell();
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Icon-only rail on desktop when collapsed; on mobile/tablet the rail is
  // always visible and the toggle opens the full drawer overlay instead.
  // (Page offset is pure CSS via .admin-offset + data-collapsed — no JS writes.)
  const drawer = isMobile && sidebarOpen;
  // The open drawer always shows labels; the rail/icon-only mode applies
  // to the docked sidebar (collapsed desktop, or mobile rail).
  const iconOnly = !drawer && (collapsed || (isMobile && !sidebarOpen));

  // Page offset derives from the SAME state as the sidebar width, written in
  // the same render commit — so the content and the sidebar animate as one
  // unit with zero lag. Skipped while the drawer overlays (it floats).
  if (typeof document !== 'undefined' && !drawer) {
    document.documentElement.style.setProperty('--sbw', isMobile ? '52px' : collapsed ? '76px' : '256px');
  }

  const isActive = (label: string, href?: string) => {
    if (active) return label === active;
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const renderItem = ({ label, icon: Icon, href, children }: NavItem) => {
    const selected = isActive(label, href);
    // Rail mode: no colored box — the icon itself carries the active color.
    const cls = iconOnly
      ? `flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
          selected ? 'font-medium text-emerald-600' : 'text-slate-400 hover:text-slate-600'
        }`
      : `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
          selected ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
        }`;
    const content = (
      <>
        <Icon size={18} className="shrink-0" />
        <span className={iconOnly ? 'hidden' : ''}>{label}</span>
      </>
    );
    const item = href ? (
      <Link
        key={label}
        href={href}
        title={iconOnly ? label : undefined}
        aria-label={label}
        className={cls}
        onClick={() => setSidebarOpen(false)}
      >
        {content}
      </Link>
    ) : (
      <button
        key={label}
        type="button"
        title={iconOnly ? label : undefined}
        aria-label={label}
        className={`${cls} cursor-not-allowed opacity-70`}
      >
        {content}
      </button>
    );
    if (!children || children.length === 0 || iconOnly) return item;
    const childActive = children.some((c) => isActive(c.label, c.href));
    const isOpen = expanded[label] ?? childActive;
    return (
      <div key={label}>
        <div className="flex items-center gap-1">
          <div className="min-w-0 flex-1">{item}</div>
          <button
            type="button"
            onClick={() => setExpanded((prev) => ({ ...prev, [label]: !(prev[label] ?? childActive) }))}
            aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
            aria-expanded={isOpen}
            className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
        <div
          className={`grid transition-all duration-300 ease-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-9 mt-0.5 space-y-0.5 border-l border-slate-100 pl-1">
              {children.map((child) => {
                const childSelected = isActive(child.label, child.href);
                return (
                  <Link
                    key={child.label}
                    href={child.href}
                    aria-label={child.label}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors ${
                      childSelected
                        ? 'bg-emerald-50 font-medium text-emerald-600'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <Coins size={13} className="shrink-0" />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop — mobile drawer only */}
      {drawer && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Flow spacer — reserves the docked sidebar width in every layout,
          so content never slides underneath. Hidden when the drawer overlays. */}
      {!drawer && (
        <div
          aria-hidden="true"
          className={`shrink-0 transition-all duration-200 ${
            iconOnly ? 'w-[60px] lg:w-[76px]' : 'w-[60px] lg:w-64'
          }`}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex h-dvh flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200',
          drawer ? 'w-60 max-w-[75vw]' : 'w-[60px]',
          !drawer && !iconOnly ? 'lg:w-64' : '',
          !drawer && iconOnly ? 'lg:w-[76px]' : '',
        ].join(' ')}
      >
        {/* Edge-attached toggle — opens the drawer on mobile, collapses on desktop */}
        {!drawer && (
          <button
            type="button"
            onClick={() => (isMobile ? setSidebarOpen(true) : toggleCollapsed())}
            aria-label={isMobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isMobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3.5 top-7 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-colors hover:text-emerald-600"
          >
            {collapsed && !isMobile ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>
        )}
        <div className={`flex items-center py-5 ${iconOnly && !drawer ? 'justify-center px-2' : 'justify-between px-4 sm:px-6'}`}>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="Tadrebk home"
              className={
                iconOnly
                  ? 'flex h-9 w-9 items-center justify-center'
                  : 'flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white'
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/favicon2.png" alt="" className="h-6 w-6" />
            </Link>
            <Link href="/" className={`text-lg font-semibold text-slate-900 ${iconOnly && !drawer ? 'hidden' : ''}`}>
              Tadrebk
            </Link>
          </div>
          <div className={`items-center gap-1 ${drawer ? 'flex' : 'hidden'}`}>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              title="Close menu"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto pb-4 ${iconOnly && !drawer ? 'px-2' : 'px-3'}`}>
          {NAV_ITEMS.map(renderItem)}
        </nav>

        <div className={`border-t border-slate-100 py-4 ${iconOnly && !drawer ? 'px-2' : 'px-4'}`}>
          <div className={`flex items-center gap-3 ${iconOnly && !drawer ? 'justify-center' : ''}`}>
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white"
              title={iconOnly && !drawer ? adminName || 'Admin User' : undefined}
            >
              {(adminName || 'Admin User')
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className={`min-w-0 leading-tight ${iconOnly && !drawer ? 'hidden' : ''}`}>
              <p className="truncate text-sm font-medium text-slate-900">{adminName || 'Admin User'}</p>
              <p className="truncate text-xs text-slate-400">{adminRole || 'Company Name'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
