'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Award, Check, Filter, Loader2 } from 'lucide-react';
import type { Application } from '@/features/student/services/application.service';
import { useAppSelector } from '@/store/store';

export type AppTab = 'All' | 'pending' | 'accepted' | 'rejected' | 'completed';

const TABS: { key: AppTab; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
];

interface MyApplicationsSectionProps {
  applications: Application[];
  loading?: boolean;
  cancellingId?: string | null;
  onCancel?: (app: Application) => void;
  onBrowse?: () => void;
}

function statusOf(app: Application): 'pending' | 'accepted' | 'rejected' | 'completed' {
  if (app.status === 'accepted' && app.completed) return 'completed';
  return app.status;
}

function internshipTitle(app: Application): string {
  if (typeof app.internshipId === 'object' && app.internshipId) return app.internshipId.title;
  return 'Internship';
}

function internshipCompany(app: Application): string {
  if (typeof app.internshipId === 'object' && app.internshipId) {
    const c = (app.internshipId as unknown as { companyId?: { name?: string } }).companyId;
    return c?.name || '';
  }
  return '';
}

const STATUS_CHIP: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  accepted: 'bg-emerald-50 text-emerald-600',
  rejected: 'bg-rose-50 text-rose-500',
  completed: 'bg-blue-50 text-blue-600',
};

const STATUS_DOT: Record<string, string> = {
  pending: 'bg-amber-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  completed: 'bg-blue-500',
};

export default function MyApplicationsSection({
  applications,
  loading = false,
  cancellingId = null,
  onCancel,
  onBrowse,
}: MyApplicationsSectionProps) {
  const [active, setActive] = useState<AppTab>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const user = useAppSelector((s) => s.user.currentUser);
  const visible =
    active === 'All' ? applications : applications.filter((a) => statusOf(a) === active);
  const activeLabel = TABS.find((t) => t.key === active)?.label ?? 'All';

  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900">My Applications</h3>
      <p className="text-sm text-slate-400">Track and manage your internship applications</p>

      {/* Mobile: filter icon + dropdown menu */}
      <div className="relative mt-4 sm:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className={`flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm transition-colors ${
            active !== 'All' ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-600'
          }`}
        >
          <Filter size={15} />
          <span className="font-medium">{activeLabel}</span>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {visible.length}
          </span>
        </button>
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
            <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-200/60">
              {TABS.map((tab) => {
                const count = tab.key === 'All' ? applications.length : applications.filter((a) => statusOf(a) === tab.key).length;
                const selected = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActive(tab.key); setFilterOpen(false); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      selected ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {tab.key !== 'All' && <span className={`h-2 w-2 rounded-full ${STATUS_DOT[tab.key]}`} />}
                    <span className="flex-1">{tab.label}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {count}
                    </span>
                    {selected && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Desktop: tab pills */}
      <div className="mt-4 hidden grid-cols-5 gap-1 rounded-2xl border border-slate-200 bg-white p-2 sm:grid">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
              active === tab.key
                ? 'bg-white font-medium text-emerald-600 shadow-sm ring-1 ring-emerald-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 border-t border-slate-100 px-6 py-6">
            {[0, 1].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="border-t border-slate-100 px-6 py-16 text-center">
            <p className="font-semibold text-slate-900">No applications</p>
            <p className="mt-1 text-sm text-slate-400">
              {active === 'All'
                ? "You haven't applied to any internships yet."
                : `No ${active} applications.`}
            </p>
            <button
              onClick={onBrowse}
              className="mt-5 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Browse Internships
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {visible.map((app) => {
              const st = statusOf(app);
              const internId = typeof app.internshipId === 'string' ? app.internshipId : app.internshipId._id;
              const certCode = (app as unknown as { certificate?: { code?: string } }).certificate?.code;
              const studentName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
              const certHref = certCode
                ? `/certificate?code=${encodeURIComponent(certCode)}`
                : `/certificate?name=${encodeURIComponent(studentName)}&internshipId=${internId}`;
              return (
                <div key={app._id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_DOT[st]} ring-4 ring-slate-50`} />
                  <div className="min-w-0 flex-1 basis-32">
                    <Link
                      href={`/internships/${internId}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-emerald-600"
                    >
                      {internshipTitle(app)}
                    </Link>
                    <p className="truncate text-xs text-slate-400">{internshipCompany(app)}</p>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CHIP[st]}`}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
                    {st === 'completed' && (
                      <Link
                        href={certHref}
                        className="flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                      >
                        <Award size={12} /> Certificate
                      </Link>
                    )}
                    {app.status === 'pending' && onCancel && (
                      <button
                        onClick={() => onCancel(app)}
                        disabled={cancellingId === app._id}
                        className="flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {cancellingId === app._id && <Loader2 size={12} className="animate-spin" />}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
