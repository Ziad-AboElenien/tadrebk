'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Check, ChevronDown, Loader2, Save, PenLine, Users2, X } from 'lucide-react';
import { attendanceService } from '@/features/company/services/attendance.service';
import Select from '@/components/ui/Select';
import InternAvatar from '@/components/ui/InternAvatar';
import {
  AttendanceStatus,
  AttendanceDayRule,
  Intern,
  Program,
} from '@/features/company/types/management';

type AttendanceDayKey = AttendanceDayRule['day'];
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_META: Record<AttendanceStatus, { label: string; chip: string }> = {
  attended: { label: 'Attended', chip: 'bg-emerald-50 text-emerald-600' },
  missed: { label: 'Missed', chip: 'bg-rose-50 text-rose-500' },
  late: { label: 'Late', chip: 'bg-amber-50 text-amber-600' },
  excused: { label: 'Excused', chip: 'bg-blue-50 text-blue-600' },
};

const STATUS_KEYS: AttendanceStatus[] = ['attended', 'missed', 'late', 'excused'];

const DAY_ORDER: AttendanceDayKey[] = [
  'saturday',
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
];

const DAY_OPTIONS: { key: AttendanceDayKey; label: string }[] = DAY_ORDER.map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
}));

function todayStr(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayKeyOfDate(dateStr: string): AttendanceDayKey {
  const d = new Date(`${dateStr}T00:00:00`);
  return DAY_ORDER[d.getDay() === 6 ? 0 : d.getDay() + 1];
}

function formatLocal(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Most recent occurrence of a weekday (today or going back), always within the 7-day window.
function mostRecentDateOfDay(day: AttendanceDayKey): string {
  const target = (DAY_ORDER.indexOf(day) + 6) % 7; // JS getDay number
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const c = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i);
    if (c.getDay() === target) return formatLocal(c);
  }
  return formatLocal(d);
}

function prettyDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ProgramAttendanceSectionProps {
  companyId?: string;
  programId: string;
  program: Program;
  interns: Intern[];
}

type ScheduleMode = 'view' | 'edit';

function defaultRules(): Record<AttendanceDayKey, AttendanceDayRule> {
  const obj = {} as Record<AttendanceDayKey, AttendanceDayRule>;
  DAY_ORDER.forEach((day) => {
    obj[day] = { day, startTime: '09:00', endTime: '17:00', workday: false };
  });
  return obj;
}

export default function ProgramAttendanceSection({
  companyId,
  programId,
  program,
  interns,
}: ProgramAttendanceSectionProps) {
  const [date, setDate] = useState(todayStr());
  const [selectedDay, setSelectedDay] = useState<AttendanceDayKey | ''>('');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('edit');
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [rules, setRules] = useState<Record<AttendanceDayKey, AttendanceDayRule>>(defaultRules);

  const [isMarkingId, setIsMarkingId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulking, setBulking] = useState(false);
  const [rowMenu, setRowMenu] = useState('');

  const workdays = useMemo<AttendanceDayKey[]>(
    () => DAY_ORDER.filter((k) => rules[k]?.workday),
    [rules],
  );

  const fetchSchedule = useCallback(async () => {
    if (!companyId) return;
    setScheduleLoading(true);
    try {
      const res = await attendanceService.getSchedule(companyId, { programId });
      if (res.timezone) setTimezone(res.timezone);
      const next = { ...rules };
      res.rules.forEach((r) => {
        next[r.day] = { day: r.day, startTime: r.startTime, endTime: r.endTime, workday: r.workday };
      });
      setRules(next);
      const days = DAY_ORDER.filter((k) => next[k]?.workday);
      const hasWorkdays = days.length > 0;
      setScheduleMode(hasWorkdays ? 'view' : 'edit');
      if (hasWorkdays) {
        // Priority: today if it's a scheduled day, else the most recently passed scheduled day.
        const todayKey = dayKeyOfDate(todayStr());
        const initial = days.includes(todayKey)
          ? todayKey
          : days.reduce((a, b) => (mostRecentDateOfDay(a) >= mostRecentDateOfDay(b) ? a : b));
        setSelectedDay(initial);
        // NOTE: no setRecords({}) here — fetchRecords (re)loads for the date;
        // clearing here would wipe rows if this resolves after the records fetch.
        setDate(mostRecentDateOfDay(initial));
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setScheduleLoading(false);
    }
  }, [companyId, programId, rules]);

  useEffect(() => {
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSchedule = useCallback(async () => {
    if (!companyId) return;
    if (!DAY_ORDER.some((d) => rules[d]?.workday)) {
      toastHelper.error('Select at least one required day.');
      return;
    }
    setSavingSchedule(true);
    try {
      await attendanceService.updateSchedule(companyId, {
        programId,
        timezone,
        rules: DAY_ORDER.map((d) => ({
          day: d,
          startTime: rules[d].workday ? rules[d].startTime : '09:00',
          endTime: rules[d].workday ? rules[d].endTime : null,
          workday: rules[d].workday,
        })),
      });
      setScheduleMode('view');
      toastHelper.success('Schedule saved');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingSchedule(false);
    }
  }, [companyId, programId, timezone, rules]);

  const enrolledIds = useMemo(() => new Set(interns.map((i) => i._id)), [interns]);

  const fetchRecords = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      // NOTE: mark endpoints don't store programId, so filtering by programId
      // server-side would hide just-saved rows. Fetch by date and filter locally.
      const map: Record<string, AttendanceStatus> = {};
      let page = 1;
      for (;;) {
        const res = await attendanceService.listAttendance(companyId, {
          date,
          page,
          limit: 100,
        });
        res.data.forEach((r) => {
          if (enrolledIds.has(r.internId)) map[r.internId] = r.status;
        });
        if (page >= (res.pagination.pages || 1)) break;
        page += 1;
      }
      setRecords(map);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, date, enrolledIds]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleMark = async (internId: string, status: AttendanceStatus) => {
    if (!companyId) return;
    setIsMarkingId(internId);
    try {
      await attendanceService.markAttendance(companyId, { internId, date, status });
      setRecords((prev) => ({ ...prev, [internId]: status }));
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setIsMarkingId('');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (prev.size === interns.length && interns.length > 0) return new Set<string>();
      return new Set(interns.map((i) => i._id));
    });
  };

  const handleBulk = async (status: AttendanceStatus) => {
    if (!companyId) return;
    if (selected.size === 0) {
      toastHelper.error('Select at least one intern first.');
      return;
    }
    setBulking(true);
    try {
      const res = await attendanceService.bulkMark(companyId, {
        rows: Array.from(selected).map((internId) => ({ internId, date, status })),
      });
      const skippedIds = new Set(res.skipped.map((s) => s.internId));
      setRecords((prev) => {
        const next = { ...prev };
        selected.forEach((id) => {
          if (!skippedIds.has(id)) next[id] = status;
        });
        return next;
      });
      toastHelper.success(
        res.skipped.length > 0
          ? `${res.modified} updated · ${res.skipped.length} skipped`
          : `Marked ${res.modified} intern(s) ${STATUS_META[status].label}`,
      );
      setSelected(new Set());
      setBulkOpen(false);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setBulking(false);
    }
  };

  return (
    <section className="space-y-6">
      {(bulkOpen || rowMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setBulkOpen(false);
            setRowMenu('');
          }}
        />
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <CalendarDays size={18} className="text-emerald-500" /> Schedule
          </h3>
          {scheduleMode === 'view' ? (
            <button
              onClick={() => setScheduleMode('edit')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <PenLine size={13} /> Edit
            </button>
          ) : (
            <button
              onClick={saveSchedule}
              disabled={savingSchedule}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {savingSchedule ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              {savingSchedule ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        {scheduleLoading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : scheduleMode === 'view' ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {workdays.length === 0 ? (
              <p className="text-sm text-slate-400">No workdays configured yet.</p>
            ) : (
              workdays.map((k) => (
                <span
                  key={k}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600"
                >
                  {DAY_OPTIONS.find((d) => d.key === k)?.label}
                  {k === dayKeyOfDate(date) && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-600">
                      Today
                    </span>
                  )}
                </span>
              ))
            )}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {DAY_OPTIONS.map((d) => (
              <label
                key={d.key}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={rules[d.key]?.workday ?? false}
                  onChange={(e) =>
                    setRules((prev) => ({
                      ...prev,
                      [d.key]: { ...prev[d.key], workday: e.target.checked },
                    }))
                  }
                  className="h-3.5 w-3.5 accent-emerald-500"
                />
                {d.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Users2 size={18} className="text-emerald-500" /> Attendance · {prettyDate(date)}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setSelectMode((m) => {
                  if (m) {
                    setSelected(new Set());
                    setBulkOpen(false);
                  }
                  return !m;
                });
              }}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition-colors ${
                selectMode
                  ? 'border-slate-300 bg-slate-800 text-white hover:bg-slate-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {selectMode ? <X size={13} /> : <Check size={13} />}
              {selectMode ? 'Cancel' : 'Select'}
            </button>
            {selectMode && interns.length > 0 && (
              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50" title="Select all">
                <input
                  type="checkbox"
                  checked={selected.size === interns.length}
                  onChange={toggleSelectAll}
                  className="h-3.5 w-3.5 accent-emerald-500"
                />
                {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
              </label>
            )}
            {workdays.length > 0 ? (
              <div className="relative">
                <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                <Select
                  value={selectedDay}
                  onChange={(e) => {
                    const day = e.target.value as AttendanceDayKey;
                    setSelectedDay(day);
                    setDate(mostRecentDateOfDay(day));
                    setRecords({});
                    setSelected(new Set());
                    setSelectMode(false);
                    setBulkOpen(false);
                  }}
                  className="w-52 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-700 shadow-sm focus:border-emerald-400"
                  aria-label="Attendance day"
                >
                  {workdays.map((k) => (
                    <option key={k} value={k}>
                      {DAY_OPTIONS.find((d) => d.key === k)?.label} · {prettyDate(mostRecentDateOfDay(k))}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Set the schedule days first</span>
            )}
            {selectMode && interns.length > 0 && (
              <div className={`relative ${bulkOpen ? 'z-50' : ''}`}>
                <button
                  onClick={() => setBulkOpen((o) => !o)}
                  disabled={selected.size === 0 || bulking}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title={selected.size === 0 ? 'Select interns first' : `Mark ${selected.size} intern(s)`}
                >
                  {bulking ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  Mark{selected.size > 0 ? ` (${selected.size})` : ''}
                  <ChevronDown size={13} className={`transition-transform ${bulkOpen ? 'rotate-180' : ''}`} />
                </button>
                {bulkOpen && (
                  <div className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                    {STATUS_KEYS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleBulk(s)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <span className={`rounded-full px-2 py-0.5 text-[10px] ${STATUS_META[s].chip}`}>
                          {STATUS_META[s].label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : interns.length === 0 ? (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
            No interns assigned to this program yet.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {interns.map((intern) => {
              const status = records[intern._id];
              const marking = isMarkingId === intern._id;
              const menuOpen = rowMenu === intern._id;
              return (
                <div
                  key={intern._id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={selected.has(intern._id)}
                      onChange={() => toggleSelect(intern._id)}
                      className="h-4 w-4 shrink-0 accent-emerald-500"
                      aria-label={`Select ${intern.firstName}`}
                    />
                  )}
<Link href={`/company/admin/interns/${intern._id}`} title="View profile">
                    <InternAvatar
                      src={intern.profilePicture?.secure_url}
                      firstName={intern.firstName}
                      lastName={intern.lastName}
                      email={intern.email}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {`${intern.firstName} ${intern.lastName}`.trim()}
                    </p>
                    <p className="truncate text-xs text-slate-400">{intern.email}</p>
                  </div>
                  <div className={`relative ${menuOpen ? 'z-50' : ''}`}>
                    <button
                      onClick={() => setRowMenu(menuOpen ? '' : intern._id)}
                      disabled={marking}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
                        status ? STATUS_META[status].chip : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {marking ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          {status ? STATUS_META[status].label : 'Not marked'}
                          <ChevronDown size={12} className={`transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    {menuOpen && !marking && (
                      <div className="absolute right-0 z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                        {STATUS_KEYS.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setRowMenu('');
                              handleMark(intern._id, s);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            {STATUS_META[s].label}
                            {status === s && <Check size={13} className="text-emerald-500" />}
                          </button>
                        ))}
                      </div>
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
