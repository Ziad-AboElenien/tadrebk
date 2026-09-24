'use client';

import { useState } from 'react';
import { Clock, Search, FileText, Flame, Check } from 'lucide-react';

export type CheckInVariant = 'prompt' | 'completed' | 'streak-broken';

export interface CheckInStreak {
  current: number;
  beforeBreak: number;
  recoveryHours: number;
  todayStatus: string;
  pointsToday: number;
  weeklyProgress: boolean[];
}

interface CheckInCardProps {
  variant?: CheckInVariant;
  firstName?: string;
  streak?: Partial<CheckInStreak>;
  result?: string;
  checkedAt?: string;
  onCheckIn?: (answer?: string) => void;
  onRecover?: () => void;
  onFreshStart?: () => void;
}

const DEFAULT_STREAK: CheckInStreak = {
  current: 0,
  beforeBreak: 0,
  recoveryHours: 48,
  todayStatus: 'Not checked in',
  pointsToday: 0,
  weeklyProgress: [false, false, false, false, false, false, false],
};

export default function CheckInCard({
  variant = 'prompt',
  firstName = 'there',
  streak = {},
  result = 'Looking for internships',
  checkedAt,
  onCheckIn,
  onRecover,
  onFreshStart,
}: CheckInCardProps) {
  const s: CheckInStreak = { ...DEFAULT_STREAK, ...streak };
  const [open, setOpen] = useState(false);
  const weekDone = s.weeklyProgress.filter(Boolean).length;

  const mobileTitle =
    variant === 'completed' ? 'Checked in' : variant === 'streak-broken' ? 'Streak broken' : 'Daily check-in';
  const mobileStatus =
    variant === 'completed'
      ? `Today at ${checkedAt || ''}`.trim() || result
      : variant === 'streak-broken'
        ? `${s.beforeBreak}-day streak at risk`
        : s.todayStatus;

  return (
    <>
      {/* ── Mobile: floating streak circle ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle streak details"
            className={`relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white shadow-lg transition-transform duration-500 ease-out ${
              variant === 'streak-broken'
                ? 'bg-gradient-to-br from-slate-400 to-slate-500 shadow-slate-200'
                : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-orange-200'
            } ${open ? 'rotate-[360deg] scale-105' : ''}`}
          >
            <Flame size={18} />
            <span className="text-lg font-bold leading-none">{variant === 'streak-broken' ? s.beforeBreak : s.current}</span>
            <span className="text-[9px] font-medium uppercase leading-none opacity-90">days</span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{mobileTitle}</p>
            <p className="truncate text-xs text-slate-400">{mobileStatus}</p>
          </div>
          {variant === 'completed' ? (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              <Check size={13} /> Done
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
              Tap the circle
            </span>
          )}
        </div>

        {/* Satellite stats — spin open around the circle */}
        <div
          className={`grid transition-all duration-500 ease-out ${
            open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Today</p>
                <p className="mt-0.5 truncate text-xs font-bold text-slate-900">
                  {variant === 'completed' ? 'Present' : variant === 'streak-broken' ? 'Missed' : 'Pending'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">This week</p>
                <p className="mt-0.5 text-xs font-bold text-slate-900">{weekDone}/7 days</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {variant === 'streak-broken' ? 'Recovery' : 'Streak'}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-900">
                  {variant === 'streak-broken' ? `${s.recoveryHours}h left` : `${s.current} days`}
                </p>
              </div>
            </div>

            {variant === 'prompt' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => onCheckIn?.('Looking for internships')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  <Search size={13} /> Looking
                </button>
                <button
                  onClick={() => onCheckIn?.('Applying for internships')}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  <FileText size={13} /> Applying
                </button>
              </div>
            )}
            {variant === 'streak-broken' && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={onRecover}
                  className="flex-1 rounded-xl bg-emerald-500 px-3 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  Recover Streak
                </button>
                <button
                  onClick={onFreshStart}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Start new
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Desktop / tablet: full card ── */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
      <div className="h-1 bg-emerald-500" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
        <div className="p-6">
          {variant === 'streak-broken' && (
            <>
              <h3 className="text-xl font-bold text-slate-900">Streak broken — recover your streak</h3>
              <p className="mt-1 max-w-lg text-sm text-slate-500">
                You missed a day. Recover your {s.beforeBreak}-day streak within {s.recoveryHours} hours —
                otherwise it resets to 0. Saved on this device only.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={onRecover}
                  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Recover Streak
                </button>
                <button
                  onClick={onFreshStart}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Start a new streak
                </button>
              </div>
            </>
          )}

          {variant === 'prompt' && (
            <>
              <h3 className="text-xl font-bold text-slate-900">Good morning, {firstName}</h3>
              <p className="mt-1 text-sm text-slate-500">Check in today and keep your streak going!</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">What are you working on today?</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  onClick={() => onCheckIn?.('Looking for internships')}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <Search size={15} /> Looking for internships
                </button>
                <button
                  onClick={() => onCheckIn?.('Applying for internships')}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <FileText size={15} /> Applying for internships
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">1 check-in per day · streak syncs to your account</p>
            </>
          )}

          {variant === 'completed' && (
            <>
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                Career check-in completed <Flame size={18} className="text-emerald-500" />
              </h3>
              <p className="mt-1 text-sm text-slate-500">Result: {result}</p>
              <div className="mt-4 flex items-center gap-4">
                <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600">
                  Checked in
                </span>
                {checkedAt && <span className="text-sm text-slate-400">at {checkedAt}</span>}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-slate-100 p-6 lg:w-64 lg:border-l lg:border-t-0">
          {variant === 'streak-broken' ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Streak before break</p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-slate-900">
                <Flame size={17} className="text-amber-500" /> {s.beforeBreak} days
              </p>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Recovery window</p>
              <p className="mt-1 flex items-center gap-1.5 font-semibold text-emerald-600">
                <Clock size={15} /> {s.recoveryHours} hours left
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Current streak</p>
              <p className="mt-1 flex items-center gap-1.5 text-xl font-bold text-slate-900">
                <Flame size={17} className="text-amber-500" /> {s.current} days
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Today&apos;s status</p>
              <p className={`mt-1 font-semibold ${variant === 'completed' ? 'text-emerald-600' : 'text-slate-900'}`}>
                {variant === 'completed' ? `Checked at ${checkedAt || ''}`.trim() : s.todayStatus}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Weekly progress</p>
              <div className="mt-2 flex gap-1.5">
                {s.weeklyProgress.map((done, i) => (
                  <span key={i} className={`h-2.5 w-2.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
