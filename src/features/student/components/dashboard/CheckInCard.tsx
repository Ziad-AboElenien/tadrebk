'use client';

import { Clock, Search, FileText, Flame } from 'lucide-react';

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

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
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
              <p className="mt-3 text-xs text-slate-400">1 check-in per day · tracked on this device</p>
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
  );
}
