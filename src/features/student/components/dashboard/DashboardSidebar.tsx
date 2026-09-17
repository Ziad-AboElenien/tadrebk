'use client';

import Link from 'next/link';
import { User, Search } from 'lucide-react';

interface DashboardSidebarProps {
  counts?: { applied: number; saved: number; done: number };
  onSignOut?: () => void;
  signingOut?: boolean;
}

export default function DashboardSidebar({
  counts = { applied: 0, saved: 0, done: 0 },
  onSignOut,
  signingOut = false,
}: DashboardSidebarProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="font-semibold text-slate-900">Quick Links</p>
        <div className="mt-4 space-y-3">
          <Link
            href="/profile"
            className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <User size={15} />
            </span>
            View Profile
          </Link>
          <Link
            href="/internships"
            className="flex w-full items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Search size={15} />
            </span>
            Browse Internships
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center">
        {[
          { label: 'APPLIED', value: counts.applied },
          { label: 'SAVED', value: counts.saved },
          { label: 'DONE', value: counts.done },
        ].map((c) => (
          <div key={c.label} className="rounded-xl bg-slate-50 py-3">
            <p className="text-xl font-bold text-slate-900">{c.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onSignOut}
        disabled={signingOut}
        className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-60"
      >
        {signingOut ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  );
}
