'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardCheck,
  CalendarDays,
  Trophy,
  TrendingUp,
  Search,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  X,
  Loader2,
  Share2,
  PenLine,
  Save,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import GroupedBarChart from '@/features/company/components/GroupedBarChart';
import Select from '@/components/ui/Select';
import { evaluationService, Evaluation, EvaluationDashboard, EvaluationAlerts } from '@/features/company/services/evaluation.service';
import { programService } from '@/features/company/services/program.service';
import { internService } from '@/features/company/services/intern.service';
import { Intern, Program } from '@/features/company/types/management';
import { getErrorMessage, getErrorStatus } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const TREND_COLORS = { attendance: '#10b981' };

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(value) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function internName(m: Map<string, Intern>, id: string): string {
  const i = m.get(id);
  if (!i) return id.slice(-6).toUpperCase();
  return `${i.firstName} ${i.lastName}`.trim() || i.email;
}

const PAGE_SIZE = 20;

export default function EvaluationsDashboardScreen() {
  const searchParams = useSearchParams();
  const programId = searchParams.get('programId') || '';
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [dashboard, setDashboard] = useState<EvaluationDashboard | null>(null);
  const [alerts, setAlerts] = useState<EvaluationAlerts>({ lowAttendance: [], evaluationOverdue: [] });
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<Program | null>(null);
  const [internMap, setInternMap] = useState<Map<string, Intern>>(new Map());
  const [notDeployed, setNotDeployed] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [createInternId, setCreateInternId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [skill, setSkill] = useState('4');
  const [teamwork, setTeamwork] = useState('4');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [detail, setDetail] = useState<Evaluation | null>(null);
  const [editing, setEditing] = useState(false);
  const [editSkill, setEditSkill] = useState('');
  const [editTeamwork, setEditTeamwork] = useState('');
  const [editStrengths, setEditStrengths] = useState('');
  const [editImprovements, setEditImprovements] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [dash, al, internRes] = await Promise.all([
        evaluationService.getDashboard(companyId).catch(() => null),
        evaluationService.getAlerts(companyId).catch(() => ({ lowAttendance: [], evaluationOverdue: [] })),
        internService.listAllInterns(companyId),
      ]);
      setDashboard(dash);
      setAlerts(al);
      setInternMap(new Map(internRes.map((i) => [i._id, i])));
      let prog: Program | null = null;
      if (programId) {
        prog = await programService.getProgram(companyId, programId).catch(() => null);
        setProgram(prog);
      } else {
        setProgram(null);
      }
      const ev = await evaluationService.listEvaluations(companyId, { page, limit: PAGE_SIZE });
      let list = ev.evaluations;
      if (prog) {
        const ids = new Set(prog.internIds);
        list = list.filter((e) => ids.has(e.internId));
      }
      setEvaluations(list);
      setTotal(ev.pagination.total ?? list.length);
      setTotalPages(ev.pagination.pages || 1);
      setNotDeployed(false);
    } catch (err) {
      if (getErrorStatus(err) === 404) {
        // Evaluations module not deployed on this backend version.
        setNotDeployed(true);
        setEvaluations([]);
      } else {
        toastHelper.error(getErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, programId, page]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evaluations;
    return evaluations.filter((e) => internName(internMap, e.internId).toLowerCase().includes(q));
  }, [evaluations, search, internMap]);

  const programInterns = useMemo(() => {
    if (!program) return Array.from(internMap.values());
    return program.internIds
      .map((id) => internMap.get(id))
      .filter((i): i is Intern => !!i);
  }, [program, internMap]);

  const openDetail = (e: Evaluation) => {
    setDetail(e);
    setEditing(false);
    setEditSkill(String(e.skillRating));
    setEditTeamwork(String(e.teamworkRating));
    setEditStrengths(e.strengths || '');
    setEditImprovements(e.improvements || '');
    setEditNotes(e.privateNotes || '');
  };

  const handleCreate = async () => {
    if (!companyId) return;
    setCreateError('');
    if (!createInternId) {
      setCreateError('Choose an intern.');
      return;
    }
    if (!periodStart || !periodEnd) {
      setCreateError('Period start and end are required.');
      return;
    }
    if (new Date(periodEnd) < new Date(periodStart)) {
      setCreateError('Period end must be after start.');
      return;
    }
    setCreating(true);
    try {
      await evaluationService.createEvaluation(companyId, createInternId, {
        internId: createInternId,
        period: { start: new Date(periodStart).toISOString(), end: new Date(periodEnd).toISOString() },
        skillRating: Number(skill),
        teamworkRating: Number(teamwork),
        strengths: strengths.trim() || undefined,
        improvements: improvements.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
      });
      toastHelper.success('Evaluation created');
      setShowCreate(false);
      setCreateInternId('');
      setStrengths('');
      setImprovements('');
      setPrivateNotes('');
      fetchAll();
    } catch (err) {
      if (getErrorStatus(err) === 404) {
        setCreateError('Creating evaluations is not available on the server yet.');
      } else {
        setCreateError(getErrorMessage(err));
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!companyId || !detail) return;
    setSaving(true);
    try {
      const updated = await evaluationService.updateEvaluation(companyId, detail._id, {
        skillRating: Number(editSkill),
        teamworkRating: Number(editTeamwork),
        strengths: editStrengths.trim() || undefined,
        improvements: editImprovements.trim() || undefined,
        privateNotes: editNotes.trim() || undefined,
      });
      setDetail(updated);
      setEvaluations((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
      setEditing(false);
      toastHelper.success('Evaluation updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!companyId || !detail) return;
    setSharing(true);
    try {
      const updated = await evaluationService.shareEvaluation(companyId, detail._id);
      setDetail(updated);
      setEvaluations((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
      toastHelper.success('Evaluation shared with intern');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  const k = dashboard?.kpis;
  const stats = [
    { label: 'Evaluations This Month', value: k ? String(k.evaluationsThisMonth) : '—', icon: ClipboardCheck, sub: 'Written by this company' },
    { label: 'Avg. Attendance', value: k ? `${k.avgAttendance}%` : '—', icon: CalendarDays, sub: 'Last 30 days' },
    { label: 'Avg. Skill Rating', value: k ? `${k.avgSkillRating}/5.0` : '—', icon: Trophy, sub: 'All-time mean' },
    { label: 'Avg. Overall Score', value: k ? `${k.avgOverallScore}` : '—', icon: TrendingUp, sub: 'All-time mean' },
  ];

  const trends = (dashboard?.chart || []).map((c) => ({ label: c.month, values: { attendance: c.rate } }));

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Evaluations" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title={program ? `Evaluations · ${program.name}` : 'Evaluations Dashboard'} />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {program && (
            <Link href={`/company/admin/programs/${program._id}`} className="text-sm font-medium text-emerald-600 hover:underline">
              ← Back to {program.name}
            </Link>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <s.icon size={18} />
                </span>
                <p className="mt-3 text-sm text-slate-500">{s.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{loading ? '…' : s.value}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
              <h3 className="font-semibold text-slate-900">Attendance Trend</h3>
              <p className="text-sm text-slate-400">Monthly attendance rate · last 6 months</p>
              <div className="mt-6">
                {loading ? (
                  <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
                ) : trends.length > 0 ? (
                  <GroupedBarChart data={trends} colors={TREND_COLORS} height={224} />
                ) : (
                  <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">No chart data yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">At-Risk Interns</h3>
              <p className="text-sm text-slate-400">Low attendance + overdue reviews</p>
              <div className="mt-4 max-h-72 space-y-3 overflow-y-auto">
                {loading ? (
                  <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
                ) : alerts.lowAttendance.length === 0 && alerts.evaluationOverdue.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No alerts right now.</p>
                ) : (
                  <>
                    {alerts.lowAttendance.map((a) => (
                      <div key={a.intern._id} className="rounded-xl bg-rose-50 p-4">
                        <div className="flex gap-2">
                          <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-rose-600">
                              {a.intern.firstName} {a.intern.lastName} · {a.attendanceRate}%
                            </p>
                            <p className="text-xs text-slate-500">Low attendance ({a.windowDays}d window)</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {alerts.evaluationOverdue.map((a) => (
                      <div key={a.intern._id} className="rounded-xl bg-amber-50 p-4">
                        <div className="flex gap-2">
                          <Clock3 size={16} className="shrink-0 text-amber-600" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-amber-700">
                              {a.intern.firstName} {a.intern.lastName}
                            </p>
                            <p className="text-xs text-slate-500">
                              Review overdue{a.lastEvaluatedAt ? ` · last ${formatDate(a.lastEvaluatedAt)}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {program ? `Evaluations · ${program.name}` : 'Intern Evaluations'}
                </h3>
                <p className="text-sm text-slate-400">
                  {program ? `${visible.length} evaluation(s) for this program.` : 'Manage and view performance metrics.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Search interns..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button
                  onClick={() => setShowCreate(true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  <Plus size={15} /> New Evaluation
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {!loading && notDeployed ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center text-sm text-amber-700">
                  Evaluations are not available on the server yet — ask the backend team to deploy the latest version.
                </p>
              ) : loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
                  No evaluations found. Create the first one with “New Evaluation”.
                </p>
              ) : (
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 font-medium">Intern</th>
                      <th className="py-3 font-medium">Period</th>
                      <th className="py-3 font-medium">Overall</th>
                      <th className="py-3 font-medium">Skills</th>
                      <th className="py-3 font-medium">Teamwork</th>
                      <th className="py-3 font-medium">Shared</th>
                      <th className="py-3 text-right font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((e) => (
                      <tr key={e._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="py-3.5">
                          <p className="font-medium text-slate-900">{internName(internMap, e.internId)}</p>
                          <p className="text-xs text-slate-400">{formatDate(e.evaluatedAt)}</p>
                        </td>
                        <td className="whitespace-nowrap py-3.5 text-slate-600">
                          {formatDate(e.period.start)} → {formatDate(e.period.end)}
                        </td>
                        <td className="py-3.5 font-semibold text-slate-900">{e.overallScore}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{e.skillRating}</span>
                            <Stars value={e.skillRating} />
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{e.teamworkRating}</span>
                            <Stars value={e.teamworkRating} />
                          </div>
                        </td>
                        <td className="py-3.5">
                          {e.sharedWithIntern ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2 size={12} /> Shared
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Draft</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => openDetail(e)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-400">
              <span>Page {page} of {totalPages} · {total} total</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 font-medium text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showCreate && (
        <>
          <div className="fixed inset-0 z-30 bg-slate-900/40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">New Evaluation</h3>
                <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {program && (
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm text-emerald-700">
                    For interns of <span className="font-semibold">{program.name}</span> ({programInterns.length})
                  </p>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-700">Intern</label>
                  <Select value={createInternId} onChange={(e) => setCreateInternId(e.target.value)} placeholder="Select intern..." className="mt-2">
                    {programInterns.map((i) => (
                      <option key={i._id} value={i._id}>{`${i.firstName} ${i.lastName}`.trim() || i.email}</option>
                    ))}
                  </Select>
                  {program && programInterns.length === 0 && (
                    <p className="mt-1 text-xs text-slate-400">No interns enrolled in this program yet.</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Period start</label>
                    <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Period end</label>
                    <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Skill (0–5, step 0.5)</label>
                    <input type="number" min={0} max={5} step={0.5} value={skill} onChange={(e) => setSkill(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Teamwork (0–5, step 0.5)</label>
                    <input type="number" min={0} max={5} step={0.5} value={teamwork} onChange={(e) => setTeamwork(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Strengths</label>
                  <textarea rows={2} value={strengths} onChange={(e) => setStrengths(e.target.value)} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Areas to improve</label>
                  <textarea rows={2} value={improvements} onChange={(e) => setImprovements(e.target.value)} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Private notes (admin only)</label>
                  <textarea rows={2} value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                </div>
                {createError && <p className="text-xs font-medium text-rose-500">{createError}</p>}
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  {creating ? 'Creating...' : 'Create Evaluation'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {detail && (
        <>
          <div className="fixed inset-0 z-30 bg-slate-900/40" onClick={() => setDetail(null)} />
          <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Evaluation · {internName(internMap, detail.internId)}</h3>
                <button onClick={() => setDetail(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Period</dt>
                  <dd className="font-medium text-slate-900">{formatDate(detail.period.start)} → {formatDate(detail.period.end)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Attendance rate</dt>
                  <dd className="font-medium text-slate-900">{detail.attendanceRate}%</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Overall score</dt>
                  <dd className="font-semibold text-slate-900">{detail.overallScore}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Status</dt>
                  <dd>
                    {detail.sharedWithIntern ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        Shared{detail.sharedAt ? ` · ${formatDate(detail.sharedAt)}` : ''}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">Draft</span>
                    )}
                  </dd>
                </div>
                {editing ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Skill</label>
                        <input type="number" min={0} max={5} step={0.5} value={editSkill} onChange={(e) => setEditSkill(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Teamwork</label>
                        <input type="number" min={0} max={5} step={0.5} value={editTeamwork} onChange={(e) => setEditTeamwork(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Strengths</label>
                      <textarea rows={2} value={editStrengths} onChange={(e) => setEditStrengths(e.target.value)} className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Areas to improve</label>
                      <textarea rows={2} value={editImprovements} onChange={(e) => setEditImprovements(e.target.value)} className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Private notes</label>
                      <textarea rows={2} value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="mt-1 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                    </div>
                  </>
                ) : (
                  <>
                    {detail.strengths && (
                      <div>
                        <dt className="text-slate-500">Strengths</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{detail.strengths}</dd>
                      </div>
                    )}
                    {detail.improvements && (
                      <div>
                        <dt className="text-slate-500">Areas to improve</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{detail.improvements}</dd>
                      </div>
                    )}
                    {detail.privateNotes && (
                      <div>
                        <dt className="text-slate-500">Private notes (admin only)</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{detail.privateNotes}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                {!detail.sharedWithIntern && !editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <PenLine size={14} /> Edit
                  </button>
                )}
                {editing && (
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                  </button>
                )}
                {!detail.sharedWithIntern && (
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Share with intern
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
