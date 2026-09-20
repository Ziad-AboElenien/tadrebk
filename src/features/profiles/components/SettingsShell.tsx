'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SettingsNavItem {
  key: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
}

interface SettingsShellProps {
  title: string;
  subtitle?: string;
  basePath: string;
  /** Null = no section picked yet (mobile shows the menu page). */
  activeTab: string | null;
  items: SettingsNavItem[];
  headerCard?: ReactNode;
  children: ReactNode;
}

/**
 * Settings page shell: left sidebar nav (top scroll-tabs on mobile),
 * content panel on the right. Tabs are real links (`?tab=`) so every
 * section is deep-linkable.
 */
export default function SettingsShell({
  title,
  subtitle,
  basePath,
  activeTab,
  items,
  headerCard,
  children,
}: SettingsShellProps) {
  // Desktop always shows a panel (falls back to the first item).
  const effectiveTab = activeTab || items[0]?.key;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-[2.5%] py-4 sm:px-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>

        {headerCard}

        {/* ── Mobile menu page (no tab picked yet) ── */}
        {!activeTab && (
          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <Link
                key={item.key}
                href={`${basePath}?tab=${item.key}`}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <item.icon size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-900">{item.label}</span>
                  {item.desc && <span className="block truncate text-xs text-slate-400">{item.desc}</span>}
                </span>
                <i className="fas fa-chevron-right shrink-0 text-xs text-slate-300" />
              </Link>
            ))}
          </div>
        )}

        <div className={`grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr] ${activeTab ? '' : 'hidden lg:grid'}`}>
          {/* Sidebar — desktop only */}
          <nav
            aria-label="Settings sections"
            className="hidden flex-col gap-1 lg:sticky lg:top-6 lg:flex"
          >
            {items.map((item) => {
              const active = item.key === effectiveTab;
              return (
                <Link
                  key={item.key}
                  href={`${basePath}?tab=${item.key}`}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      active ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <item.icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        active ? 'text-emerald-700' : 'text-slate-700'
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.desc && (
                      <span className="block truncate text-xs text-slate-400">{item.desc}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Content */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
            {activeTab && (
              <Link
                href={basePath}
                className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 lg:hidden"
              >
                <i className="fas fa-arrow-left text-xs" /> Back to Settings
              </Link>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
