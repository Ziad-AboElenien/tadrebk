'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { Application } from '@/features/student/services/application.service';

export type AppTab = 'All' | 'pending' | 'accepted' | 'rejected' | 'completed';

const TABS: { key: AppTab; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'completed', label: 'Completed' },
];

export interface ActivityItem {
  title: string;
  source: string;
  points?: string;
  time: string;
}

interface MyApplicationsSectionProps {
  applications: Application[];
  loading?: boolean;
  activity?: ActivityItem[];
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

export default function MyApplicationsSection({
  applications,
  loading = false,
  activity = [],
  cancellingId = null,
  onCancel,
  onBrowse,
}: MyApplicationsSectionProps) {
  const [active, setActive] = useState<AppTab>('All');
  const visible =
    active === 'All' ? applications : applications.filter((a) => statusOf(a) === active);

  return (
    <section>
      <h3 className="text-lg font-bold text-slate-900">My Applications</h3>
      <p className="text-sm text-slate-400">Track and manage your internship applications</p>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-2 sm:grid-cols-5">
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
        {activity.length > 0 && (
          <div className="divide-y divide-slate-100">
            {activity.map((a) => (
              <div key={a.title} className="flex items-center gap-3 px-6 py-4">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{a.title}</p>
                  <p className="text-xs text-slate-400">{a.source}</p>
                </div>
                {a.points && <span className="shrink-0 text-sm font-semibold text-emerald-600">{a.points}</span>}
                <span className="w-12 shrink-0 text-right text-sm text-slate-400">{a.time}</span>
              </div>
            ))}
          </div>
        )}

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
              return (
                <div key={app._id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <div className="min-w-0">
                    <Link
                      href={`/internships/${internId}`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:text-emerald-600"
                    >
                      {internshipTitle(app)}
                    </Link>
                    <p className="truncate text-xs text-slate-400">{internshipCompany(app)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CHIP[st]}`}>
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </span>
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
