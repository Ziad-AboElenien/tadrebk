'use client';

import { CalendarCheck } from 'lucide-react';
import type { InternAttendance } from '@/features/intern/types';

const DOT: Record<string, string> = {
  attended: 'bg-emerald-500',
  late: 'bg-amber-500',
  excused: 'bg-blue-500',
  missed: 'bg-rose-400',
};

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function StudentAttendanceSection({
  records,
  loading = false,
}: {
  records: InternAttendance[];
  loading?: boolean;
}) {
  const total = records.length;
  const present = records.filter((r) => r.status === 'attended' || r.status === 'late').length;
  const pct = total === 0 ? 0 : Math.round((present / total) * 100);
  const recent = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <CalendarCheck size={18} className="text-emerald-500" /> My Attendance
      </h3>
      {loading ? (
        <div className="mt-4 flex items-center gap-4">
          <div className="h-14 w-14 animate-pulse rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      ) : total === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No attendance records yet.</p>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-50">
            <span
              className="absolute inset-0 rounded-full"
              style={{ background: `conic-gradient(#10b981 ${pct * 3.6}deg, #e2e8f0 0deg)` }}
            />
            <span className="absolute inset-[5px] flex items-center justify-center rounded-full bg-white text-sm font-bold text-slate-900">
              {pct}%
            </span>
          </div>
          <div className="min-w-0 flex-1 basis-48">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">{present}</span> of {total} days present
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {recent.map((r) => (
                <span key={r._id} className="flex items-center gap-1.5 text-xs text-slate-500" title={r.status}>
                  <span className={`h-2 w-2 rounded-full ${DOT[r.status] || 'bg-slate-300'}`} />
                  {dayLabel(r.date)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
