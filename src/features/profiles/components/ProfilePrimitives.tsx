'use client';

import type { ReactNode } from 'react';
import { Pencil, Plus, Star, type LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Rating                                                              */
/* ------------------------------------------------------------------ */

interface RatingStarsProps {
  ratingSum?: number | null;
  ratingCount?: number | null;
  size?: number;
  showCount?: boolean;
}

/**
 * Derives the average from ratingSum / ratingCount.
 * Renders a muted "No ratings yet" when ratingCount is 0.
 */
export function RatingStars({ ratingSum = 0, ratingCount = 0, size = 15, showCount = true }: RatingStarsProps) {
  if (!ratingCount) {
    return <span className="text-sm text-slate-400">No ratings yet</span>;
  }
  const avg = (ratingSum || 0) / ratingCount;
  return (
    <span className="flex items-center gap-2">
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
          />
        ))}
      </span>
      <span className="text-sm font-semibold text-slate-900">{avg.toFixed(1)}</span>
      {showCount && <span className="text-sm text-slate-400">({ratingCount} reviews)</span>}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section card                                                        */
/* ------------------------------------------------------------------ */

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  editable?: boolean;
  addLabel?: string;
  onEdit?: () => void;
  onAdd?: () => void;
  action?: ReactNode;
  children: ReactNode;
}

/** The white card every profile section sits in. Edit controls render on own-side only. */
export function SectionCard({ title, subtitle, editable, addLabel, onEdit, onAdd, action, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      {(title || action || editable) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {title && <h3 className="font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          </div>
          {action ??
            (editable &&
              (addLabel ? (
                <button
                  type="button"
                  onClick={onAdd ?? onEdit}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus size={14} /> {addLabel}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label={title ? `Edit ${title}` : 'Edit'}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                >
                  <Pencil size={15} />
                </button>
              )))}
        </div>
      )}
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Misc primitives                                                     */
/* ------------------------------------------------------------------ */

const PILL_TONES: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-700',
};

/** Pill — skills, categories, industries. */
export function Pill({ children, tone = 'emerald' }: { children: ReactNode; tone?: keyof typeof PILL_TONES | string }) {
  return (
    <span className={`break-words rounded-full px-3 py-1.5 text-xs font-medium ${PILL_TONES[tone] ?? PILL_TONES.emerald}`}>
      {children}
    </span>
  );
}

interface MetaRowProps {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
}

/** Icon + label + value row, used for private/contact blocks. Renders nothing when empty. */
export function MetaRow({ icon: Icon, label, value }: MetaRowProps) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

interface ProfileEmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Dashed empty block for sections with no data yet. */
export function ProfileEmptyState({ message, actionLabel, onAction }: ProfileEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
      <p className="px-4 text-sm text-slate-400">{message}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 text-sm font-semibold text-emerald-600 hover:underline"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/** "Sep 2026" — "" for falsy input. */
export function formatMonthYear(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/** "Sep 17, 2026" — "" for falsy input. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
