'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckCircle2,
  Star,
  Clock,
  Download,
  TrendingUp,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import StatCard from '@/components/tadrebk/StatCard';
import GroupedBarChart from '@/features/company/components/GroupedBarChart';
import DonutGauge from '@/features/company/components/DonutGauge';
import InternAvatar from '@/components/ui/InternAvatar';
import { internService } from '@/features/company/services/intern.service';
import { taskService } from '@/features/company/services/task.service';
import { evaluationService, Evaluation, EvaluationDashboard } from '@/features/company/services/evaluation.service';
import { Intern, Task } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function PerformanceReportsScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [interns, setInterns] = useState<Intern[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [dashboard, setDashboard] = useState<EvaluationDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [iRes, tRes, eRes, dash] = await Promise.all([
        internService.listAllInterns(companyId),
        taskService.listTasks(companyId, { limit: 100 }),
        evaluationService.listEvaluations(companyId, { page: 1, limit: 100 }).catch(() => ({ evaluations: [], pagination: { page: 1, limit: 0, pages: 1, total: 0 } })),
        evaluationService.getDashboard(companyId).catch(() => null),
      ]);
      setInterns(iRes);
      setTasks(tRes.tasks);
      setEvaluations(eRes.evaluations);
      setDashboard(dash);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const activeTasks = useMemo(() => tasks.filter((t) => t.status !== 'archived'), [tasks]);
  const doneTasks = useMemo(() => activeTasks.filter((t) => t.status === 'complete'), [activeTasks]);
  const completionRate = activeTasks.length > 0 ? Math.round((doneTasks.length / activeTasks.length) * 100) : 0;

  const skillStats = useMemo(() => {
    if (evaluations.length === 0) return null;
    const avg = (f: (e: Evaluation) => number) =>
      evaluations.reduce((s, e) => s + f(e), 0) / evaluations.length;
    return {
      skill: avg((e) => e.skillRating),
      teamwork: avg((e) => e.teamworkRating),
      overall: avg((e) => e.overallScore),
    };
  }, [evaluations]);

  const topInterns = useMemo(
    () => [...interns].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0)).slice(0, 4),
    [interns],
  );

  const trends = useMemo(
    () => (dashboard?.chart || []).map((c) => ({ label: c.month, values: { attendance: c.rate } })),
    [dashboard],
  );

  const stats = [
    {
      label: 'Avg. Attendance',
      value: dashboard ? `${dashboard.kpis.avgAttendance}%` : '—',
      icon: Users,
      deltaLabel: 'last 30 days',
    },
    {
      label: 'Task Completion',
      value: `${completionRate}%`,
      icon: CheckCircle2,
      deltaLabel: `${doneTasks.length} of ${activeTasks.length} tasks`,
    },
    {
      label: 'Avg. Overall Score',
      value: dashboard ? String(dashboard.kpis.avgOverallScore) : '—',
      icon: Star,
      deltaLabel: 'all-time mean',
    },
    {
      label: 'Evaluations This Month',
      value: dashboard ? String(dashboard.kpis.evaluationsThisMonth) : '—',
      icon: Clock,
      deltaLabel: 'written by company',
    },
  ];

  const exportCsv = () => {
    const head = ['Name', 'Email', 'Points', 'Overall Score', 'Skill', 'Teamwork'];
    const latest: Record<string, Evaluation> = {};
    evaluations.forEach((e) => {
      const cur = latest[e.internId];
      if (!cur || new Date(e.evaluatedAt) > new Date(cur.evaluatedAt)) latest[e.internId] = e;
    });
    const rows = interns.map((i) => {
      const e = latest[i._id];
      return [
        `${i.firstName} ${i.lastName}`.trim(),
        i.email,
        String(i.totalPoints ?? 0),
        e ? String(e.overallScore) : '',
        e ? String(e.skillRating) : '',
        e ? String(e.teamworkRating) : '',
      ].map((c) => `"${c.replace(/"/g, '""')}"`);
    });
    const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Reports" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Performance Reports" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-semibold text-slate-900">Program Analytics</h2>
              <p className="text-sm text-slate-500">
                Live overview of intern performance and engagement metrics.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={exportCsv}
                disabled={interns.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                <Download size={15} /> Export Data
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? [0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
                ))
              : stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Attendance Trend</h3>
              <p className="text-sm text-slate-400">Monthly attendance rate · last 6 months.</p>
              <div className="mt-6">
                {loading ? (
                  <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
                ) : trends.length > 0 ? (
                  <GroupedBarChart data={trends} colors={{ attendance: '#10b981' }} height={224} />
                ) : (
                  <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">No chart data yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Task Completion</h3>
              <p className="text-sm text-slate-400">Share of non-archived tasks marked complete.</p>
              <div className="mt-6 flex justify-center">
                {loading ? (
                  <div className="h-40 w-40 animate-pulse rounded-full bg-slate-100" />
                ) : (
                  <DonutGauge value={completionRate} />
                )}
              </div>
              <p className="mt-4 text-center text-sm text-slate-500">
                {doneTasks.length} of {activeTasks.length} tasks complete
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Skill Evaluation Metrics</h3>
              <p className="text-sm text-slate-400">Mean scores across all evaluations.</p>
              <div className="mt-5 space-y-4">
                {loading ? (
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                ) : !skillStats ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                    No evaluations yet — metrics appear after the first review.
                  </p>
                ) : (
                  [
                    { label: 'Skill Rating (/5)', pct: Math.round((skillStats.skill / 5) * 100), val: skillStats.skill.toFixed(1) },
                    { label: 'Teamwork (/5)', pct: Math.round((skillStats.teamwork / 5) * 100), val: skillStats.teamwork.toFixed(1) },
                    { label: 'Overall Score (/100)', pct: Math.round(skillStats.overall), val: skillStats.overall.toFixed(0) },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{s.label}</span>
                        <span className="font-medium text-slate-900">{s.val}</span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">Top Performing Interns</h3>
                  <p className="truncate text-sm text-slate-400">Ranked by cumulative points.</p>
                </div>
                <Link href="/company/admin/leaderboard" className="shrink-0 text-sm font-medium text-emerald-600 hover:underline">
                  View Leaderboard
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                ) : topInterns.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No interns yet.</p>
                ) : (
                  topInterns.map((i, idx) => (
                    <Link key={i._id} href={`/company/admin/interns/${i._id}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-slate-50">
                      <span className="w-5 shrink-0 text-sm font-semibold text-slate-400">{idx + 1}</span>
                      <InternAvatar
                        src={i.profilePicture?.secure_url}
                        firstName={i.firstName}
                        lastName={i.lastName}
                        email={i.email}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {`${i.firstName} ${i.lastName}`.trim() || i.email}
                        </p>
                        <p className="truncate text-xs text-slate-400">{(i.totalPoints ?? 0).toLocaleString()} pts</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
