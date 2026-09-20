'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  Trophy,
  TrendingUp,
  Search,
  Download,
  Crown,
  Medal,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import InternAvatar from '@/components/ui/InternAvatar';
import { internService } from '@/features/company/services/intern.service';
import { taskService } from '@/features/company/services/task.service';
import { evaluationService, Evaluation } from '@/features/company/services/evaluation.service';
import { Intern, Task } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

interface RankedIntern {
  intern: Intern;
  tasksDone: number;
  overallScore: number | null;
  attendanceRate: number | null;
}

function idOf(v: unknown): string {
  return typeof v === 'string' ? v : ((v as { _id?: unknown } | null)?._id as string) || '';
}

export default function LeaderboardScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [interns, setInterns] = useState<Intern[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [iRes, tRes, eRes] = await Promise.all([
        internService.listAllInterns(companyId),
        taskService.listTasks(companyId, { limit: 100 }),
        evaluationService.listEvaluations(companyId, { page: 1, limit: 100 }).catch(() => ({ evaluations: [], pagination: { page: 1, limit: 0, pages: 1, total: 0 } })),
      ]);
      setInterns(iRes);
      setTasks(tRes.tasks);
      setEvaluations(eRes.evaluations);
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

  const ranked: RankedIntern[] = useMemo(() => {
    const doneBy: Record<string, number> = {};
    tasks.forEach((t) => {
      if (t.status === 'complete') {
        const id = idOf(t.internId);
        doneBy[id] = (doneBy[id] || 0) + 1;
      }
    });
    const latestEval: Record<string, Evaluation> = {};
    evaluations.forEach((e) => {
      const cur = latestEval[e.internId];
      if (!cur || new Date(e.evaluatedAt) > new Date(cur.evaluatedAt)) latestEval[e.internId] = e;
    });
    return interns
      .map((intern) => ({
        intern,
        tasksDone: doneBy[intern._id] || 0,
        overallScore: latestEval[intern._id]?.overallScore ?? null,
        attendanceRate: latestEval[intern._id]?.attendanceRate ?? null,
      }))
      .sort((a, b) => (b.intern.totalPoints ?? 0) - (a.intern.totalPoints ?? 0));
  }, [interns, tasks, evaluations]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter((r) =>
      `${r.intern.firstName} ${r.intern.lastName} ${r.intern.email}`.toLowerCase().includes(q),
    );
  }, [ranked, search]);

  const totalPoints = ranked.reduce((s, r) => s + (r.intern.totalPoints ?? 0), 0);
  const avgPoints = ranked.length > 0 ? Math.round(totalPoints / ranked.length) : 0;
  const completedTotal = tasks.filter((t) => t.status === 'complete').length;
  const topScore = ranked.length > 0 ? (ranked[0].intern.totalPoints ?? 0) : 0;

  const summary = [
    { label: 'TOTAL INTERNS', value: String(ranked.length), icon: Users, color: 'text-blue-500' },
    { label: 'AVG. POINTS', value: avgPoints.toLocaleString(), icon: Target, color: 'text-emerald-500' },
    { label: 'COMPLETED TASKS', value: String(completedTotal), icon: Trophy, color: 'text-amber-500' },
    { label: 'TOP SCORE', value: topScore.toLocaleString(), icon: TrendingUp, color: 'text-fuchsia-500' },
  ];

  const podium = visible.slice(0, 3);
  const podiumOrder = [podium[1], podium[0], podium[2]].filter(Boolean);

  const exportCsv = () => {
    if (visible.length === 0) return;
    const head = ['Rank', 'Name', 'Email', 'Points', 'Tasks Done', 'Overall Score', 'Attendance %'];
    const rows = visible.map((r, i) => [
      String(i + 1),
      `${r.intern.firstName} ${r.intern.lastName}`.trim(),
      r.intern.email,
      String(r.intern.totalPoints ?? 0),
      String(r.tasksDone),
      r.overallScore != null ? String(r.overallScore) : '',
      r.attendanceRate != null ? String(r.attendanceRate) : '',
    ].map((c) => `"${c.replace(/"/g, '""')}"`));
    const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leaderboard.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const internLabel = (r: RankedIntern) => `${r.intern.firstName} ${r.intern.lastName}`.trim() || r.intern.email;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Leaderboard" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Internship Leaderboard" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="break-words text-2xl font-semibold text-slate-900">Top Talent Ranking</h2>
              <p className="text-sm text-slate-500">
                Ranked by points earned through task completion and evaluations.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <button
                onClick={exportCsv}
                disabled={visible.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                <Download size={15} /> Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {summary.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                <s.icon size={20} className={`shrink-0 ${s.color}`} />
                <div className="min-w-0">
                  <p className="truncate text-xs uppercase tracking-wide text-slate-400">{s.label}</p>
                  <p className="text-xl font-semibold text-slate-900">{loading ? '…' : s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-56 animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          ) : podium.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              No interns to rank yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {podiumOrder.map((r) => {
                if (!r) return null;
                const place = visible.indexOf(r) + 1;
                return (
                  <div
                    key={r.intern._id}
                    className={`relative min-w-0 rounded-2xl border p-6 text-center ${
                      place === 1
                        ? 'order-first border-emerald-200 bg-emerald-50 sm:order-none sm:-translate-y-2'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="absolute right-4 top-4">
                      {place === 1 ? (
                        <Crown size={18} className="text-amber-500" />
                      ) : (
                        <Medal size={18} className={place === 2 ? 'text-slate-400' : 'text-orange-400'} />
                      )}
                    </span>
                    <div className="flex justify-center">
                      <InternAvatar
                        src={r.intern.profilePicture?.secure_url}
                        firstName={r.intern.firstName}
                        lastName={r.intern.lastName}
                        email={r.intern.email}
                        className={`h-11 w-11 text-sm ${place === 1 ? 'ring-4 ring-emerald-200' : ''}`}
                      />
                    </div>
                    <p className="mt-3 truncate font-semibold text-slate-900">{internLabel(r)}</p>
                    <p className="truncate text-xs text-slate-400">{r.intern.headline || r.intern.email}</p>
                    <p className="mt-3 text-2xl font-bold text-emerald-600">{(r.intern.totalPoints ?? 0).toLocaleString()}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Points</p>
                    <div className="mt-4 flex justify-around border-t border-slate-200/70 pt-3 text-xs">
                      <div>
                        <p className="text-slate-400">TASKS</p>
                        <p className="font-semibold text-slate-900">{r.tasksDone}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">SCORE</p>
                        <p className="font-semibold text-slate-900">{r.overallScore ?? '—'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Performance Ranking</h3>
                <p className="text-sm text-slate-400">Detailed breakdown of all participating interns</p>
              </div>
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:w-56"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : visible.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">No interns found.</p>
              ) : (
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 font-medium">Rank</th>
                      <th className="py-3 font-medium">Intern Name</th>
                      <th className="py-3 font-medium">Points</th>
                      <th className="py-3 font-medium">Overall Score</th>
                      <th className="py-3 font-medium">Tasks Done</th>
                      <th className="py-3 font-medium">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((r, i) => (
                      <tr key={r.intern._id}>
                        <td className="py-3">
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                              i < 3 ? 'bg-amber-100 text-amber-700' : 'text-slate-500'
                            }`}
                          >
                            {i < 3 ? i + 1 : `#${i + 1}`}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <InternAvatar
                              src={r.intern.profilePicture?.secure_url}
                              firstName={r.intern.firstName}
                              lastName={r.intern.lastName}
                              email={r.intern.email}
                            />
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/company/admin/interns/${r.intern._id}`}
                                className="block truncate font-medium text-slate-900 hover:text-emerald-600 hover:underline"
                              >
                                {internLabel(r)}
                              </Link>
                              <p className="truncate text-xs text-slate-400">{r.intern.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-slate-900">{(r.intern.totalPoints ?? 0).toLocaleString()}</td>
                        <td className="py-3">
                          {r.overallScore != null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{r.overallScore}</span>
                              <div className="h-1.5 w-16 rounded-full bg-slate-100">
                                <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, r.overallScore)}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 text-slate-600">{r.tasksDone}</td>
                        <td className="py-3">
                          {r.attendanceRate != null ? (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                              {r.attendanceRate}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
