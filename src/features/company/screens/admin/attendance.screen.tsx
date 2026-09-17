'use client';

import { useCallback, useEffect, useState, useMemo } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Save,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import {
  attendanceService,
  BULK_MARK_MAX_ROWS,
} from '@/features/company/services/attendance.service';
import { internService } from '@/features/company/services/intern.service';
import { programService } from '@/features/company/services/program.service';
import Select from '@/components/ui/Select';
import {
  AttendanceStatus,
  AttendanceDayRule,
  Intern,
  Program,
} from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_META: Record<AttendanceStatus, { label: string; chip: string }> = {
  attended: { label: 'Attended', chip: 'bg-emerald-50 text-emerald-600' },
  missed: { label: 'Missed', chip: 'bg-rose-50 text-rose-500' },
  late: { label: 'Late', chip: 'bg-amber-50 text-amber-600' },
  excused: { label: 'Excused', chip: 'bg-blue-50 text-blue-600' },
};

const STATUSES: AttendanceStatus[] = ['attended', 'missed', 'late', 'excused'];

const DAY_OPTIONS: { key: string; label: string }[] = [
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AttendanceScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [date, setDate] = useState(todayStr());
  const [programId, setProgramId] = useState('');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [interns, setInterns] = useState<Intern[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<AttendanceStatus | ''>('');
  const [bulking, setBulking] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [markingId, setMarkingId] = useState('');

  const [scheduleProgram, setScheduleProgram] = useState('');
  const [rules, setRules] = useState<Record<string, { startTime: string; endTime: string; workday: boolean }>>({});
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);

  const fetchData = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [attRes, internRes, progRes] = await Promise.all([
        attendanceService.listAttendance(companyId, { date, programId: programId || undefined, limit: 100 }),
        internService.listAllInterns(companyId, { status: 'active' }),
        programService.listPrograms(companyId, { limit: 100 }),
      ]);
      setInterns(internRes);
      setPrograms(progRes.data);
      const map: Record<string, AttendanceStatus> = {};
      attRes.data.forEach((r) => {
        map[r.internId] = r.status;
      });
      setRecords((prev) => ({ ...prev, ...map }));
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, date, programId]);

  const fetchSchedule = useCallback(async () => {
    if (!companyId) return;
    setScheduleLoading(true);
    try {
      const res = await attendanceService.getSchedule(companyId, {
        programId: scheduleProgram || undefined,
      });
      setTimezone(res.timezone || 'Africa/Cairo');
      const map: Record<string, { startTime: string; endTime: string; workday: boolean }> = {};
      DAY_OPTIONS.forEach((d) => {
        const rule = res.rules.find((r) => r.day === d.key);
        map[d.key] = rule
          ? { startTime: rule.startTime, endTime: rule.endTime ?? '', workday: rule.workday }
          : { startTime: '09:00', endTime: '17:00', workday: true };
      });
      setRules(map);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setScheduleLoading(false);
    }
  }, [companyId, scheduleProgram]);

  useEffect(() => {
    const t = setTimeout(fetchData, 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  useEffect(() => {
    const t = setTimeout(fetchSchedule, 0);
    return () => clearTimeout(t);
  }, [fetchSchedule]);

  const visibleInterns = useMemo(() => {
    if (!programId) return interns;
    return interns.filter((i) => i.enrollmentProgramId === programId || i.programId === programId);
  }, [interns, programId]);

  const toggleRow = (internId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(internId)) next.delete(internId);
      else next.add(internId);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.size === visibleInterns.length) next.clear();
      else visibleInterns.forEach((i) => next.add(i._id));
      return next;
    });
  };

  const handleMark = async (internId: string, status: AttendanceStatus) => {
    if (!companyId) return;
    setMarkingId(internId);
    try {
      const updated = await attendanceService.markAttendance(companyId, {
        internId,
        date,
        status,
      });
      setRecords((prev) => ({ ...prev, [internId]: updated.status }));
      toastHelper.success(`${STATUS_META[status].label} recorded`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setMarkingId('');
    }
  };

  const handleBulk = async () => {
    if (!companyId) return;
    if (!bulkStatus) {
      setBulkError('Choose a status to apply.');
      return;
    }
    if (selected.size === 0) {
      setBulkError('Select at least one intern.');
      return;
    }
    if (selected.size > BULK_MARK_MAX_ROWS) {
      setBulkError(`Bulk mark supports up to ${BULK_MARK_MAX_ROWS} interns at once.`);
      return;
    }
    setBulkError('');
    setBulking(true);
    try {
      const res = await attendanceService.bulkMark(companyId, {
        rows: Array.from(selected).map((internId) => ({ internId, date, status: bulkStatus as AttendanceStatus })),
      });
      selected.forEach((internId) => {
        if (!res.skipped.some((s) => s.internId === internId)) {
          setRecords((prev) => ({ ...prev, [internId]: bulkStatus as AttendanceStatus }));
        }
      });
      const done = res.modified;
      toastHelper.success(res.skipped.length
        ? `${done} updated · ${res.skipped.length} skipped`
        : `Marked ${done} intern(s)`);
      setSelected(new Set());
      setBulkStatus('');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setBulking(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!companyId) return;
    setSavingSchedule(true);
    try {
      await attendanceService.updateSchedule(companyId, {
        programId: scheduleProgram || undefined,
        timezone,
        rules: DAY_OPTIONS.map((d) => ({
          day: d.key as AttendanceDayRule['day'],
          workday: rules[d.key].workday,
          startTime: rules[d.key].workday ? rules[d.key].startTime : '09:00',
          endTime: rules[d.key].workday ? rules[d.key].endTime || null : null,
        })),
      });
      toastHelper.success('Schedule saved');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Reports" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Attendance" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Daily Attendance</h2>
              <p className="text-sm text-slate-500">Mark attendances per day, in one place.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <Select
                value={programId}
                onChange={(e) => {
                  setProgramId(e.target.value);
                  setSelected(new Set());
                }}
                className="w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
              >
                <option value="">All programs</option>
                {programs.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users size={18} className="text-emerald-500" /> Interns · {visibleInterns.length}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleAll}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {selected.size === visibleInterns.length && visibleInterns.length > 0 ? 'Deselect all' : 'Select all'}
                    </button>
                    <Select
                      value={bulkStatus}
                      onChange={(e) => {
                        setBulkStatus(e.target.value as AttendanceStatus | '');
                        setBulkError('');
                      }}
                      placeholder="Bulk status..."
                      className="rounded-lg border bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </Select>
                    <button
                      onClick={handleBulk}
                      disabled={bulking}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {bulking ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      Apply to {selected.size}
                    </button>
                  </div>
                  {bulkError && <p className="mt-2 text-xs font-medium text-rose-500">{bulkError}</p>}
                </div>

                {loading ? (
                  <div className="mt-5 space-y-2 animate-pulse">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                          <th className="pb-2 font-medium">
                            <Search size={12} className="inline" /> Intern
                          </th>
                          <th className="pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleInterns.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-sm text-slate-400">
                              No interns match the current program.
                            </td>
                          </tr>
                        ) : (
                          visibleInterns.map((i) => {
                            const status = records[i._id];
                            const isMarking = markingId === i._id;
                            return (
                              <tr key={i._id} className="border-b border-slate-50">
                                <td className="py-2.5">
                                  <label className="flex cursor-pointer items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={selected.has(i._id)}
                                      onChange={() => toggleRow(i._id)}
                                      className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                                    />
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                                      {`${i.firstName} ${i.lastName}`.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="truncate font-medium text-slate-900">
                                        {`${i.firstName} ${i.lastName}`.trim() || i.email}
                                      </p>
                                      <p className="truncate text-xs text-slate-400">{i.email}</p>
                                    </div>
                                  </label>
                                </td>
                                <td className="py-2.5">
                                  {isMarking ? (
                                    <Loader2 size={15} className="animate-spin text-slate-400" />
                                  ) : status ? (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_META[status].chip}`}>
                                      {STATUS_META[status].label}
                                      <button onClick={() => handleMark(i._id, 'attended')} aria-label="Re-open" className="text-slate-400 hover:text-slate-600">
                                        <ChevronDown size={12} />
                                      </button>
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">Unmarked</span>
                                  )}
                                  <div className="mt-1 flex gap-1">
                                    {STATUSES.map((s) => (
                                      <button
                                        key={s}
                                        onClick={() => handleMark(i._id, s)}
                                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                                          status === s
                                            ? STATUS_META[s].chip
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                      >
                                        {STATUS_META[s].label}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <CalendarDays size={18} className="text-emerald-500" /> Week Schedule
                  </h3>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <Save size={14} /> {savingSchedule ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <Select
                  value={scheduleProgram}
                  onChange={(e) => setScheduleProgram(e.target.value)}
                  placeholder="Default (all interns)"
                  className="mt-3"
                >
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </Select>

                {scheduleLoading ? (
                  <div className="mt-4 space-y-2 animate-pulse">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-9 rounded-lg bg-slate-100" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 space-y-2">
                    {DAY_OPTIONS.map((d) => (
                      <div key={d.key} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2">
                        <label className="flex w-24 items-center gap-2 text-xs font-medium text-slate-600">
                          <input
                            type="checkbox"
                            checked={rules[d.key]?.workday}
                            onChange={(e) =>
                              setRules((prev) => ({ ...prev, [d.key]: { ...prev[d.key], workday: e.target.checked } }))
                            }
                            className="h-3.5 w-3.5 rounded accent-emerald-500"
                          />
                          {d.label}
                        </label>
                        <input
                          type="time"
                          disabled={!rules[d.key]?.workday}
                          value={rules[d.key]?.startTime ?? ''}
                          onChange={(e) =>
                            setRules((prev) => ({ ...prev, [d.key]: { ...prev[d.key], startTime: e.target.value } }))
                          }
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs disabled:opacity-40"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          type="time"
                          disabled={!rules[d.key]?.workday}
                          value={rules[d.key]?.endTime ?? ''}
                          onChange={(e) =>
                            setRules((prev) => ({ ...prev, [d.key]: { ...prev[d.key], endTime: e.target.value } }))
                          }
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs disabled:opacity-40"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <label className="text-xs font-medium text-slate-600">Timezone</label>
                  <Select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="mt-1.5"
                  >
                    <option value="Africa/Cairo">Africa/Cairo (Cairo)</option>
                    <option value="Africa/Algiers">Africa/Algiers</option>
                    <option value="Africa/Casablanca">Africa/Casablanca</option>
                    <option value="Africa/Tunis">Africa/Tunis</option>
                    <option value="Asia/Riyadh">Asia/Riyadh</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                  </Select>
                </div>
              </section>

              <section className="rounded-2xl flex gap-3 border border-amber-100 bg-amber-50/60 p-5">
                <XCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-amber-800">
                  Attendance is managed by admins only — interns see a read-only view.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}