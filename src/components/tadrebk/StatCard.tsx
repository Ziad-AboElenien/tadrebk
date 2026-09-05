import type { LucideIcon } from 'lucide-react';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down';
  deltaLabel?: string;
  badge?: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-600',
  delta,
  deltaDirection = 'up',
  deltaLabel,
  badge,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {Icon && (
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>
            <Icon size={18} />
          </span>
        )}
        {badge && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {badge}
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>

      {delta && (
        <p className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 font-medium ${
              deltaDirection === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
            }`}
          >
            {deltaDirection === 'up' ? '↗' : '↘'} {delta}
          </span>
          {deltaLabel && <span className="text-slate-400">{deltaLabel}</span>}
        </p>
      )}
    </div>
  );
}