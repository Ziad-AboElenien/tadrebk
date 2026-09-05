'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Users,
  CheckSquare,
  CheckCircle2,
  ClipboardList,
  MoreHorizontal,
  Trophy,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import StatCard from '@/components/tadrebk/StatCard';
import { internService } from '@/features/company/services/intern.service';
import { taskService } from '@/features/company/services/task.service';
import { programService } from '@/features/company/services/program.service';
import { Program } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import Spinner from '@/components/ui/Spinner';

const DEADLINES = [
  { date: '24 OCT', title: 'Mid-Term Evaluation', tag: 'EVALUATION', chip: 'bg-rose-50 text-rose-500' },
  { date: '28 OCT', title: 'Q3 Project Submission', tag: 'TASK', chip: 'bg-amber-50 text-amber-600' },
  { date: '01 NOV', title: 'Monthly Attendance Report', tag: 'ADMIN', chip: 'bg-blue-50 text-blue-600' },
];

const ACTIVITY = [
  { title: 'Task Completed', time: '2M AGO', detail: 'Ahmed Hassan completed "Refactor Login"' },
  { title: 'Evaluation Submitted', time: '15M AGO', detail: 'Laila Mahmoud received a 4.8/5 score' },
  { title: 'Attendance Alert', time: '1H AGO', detail: 'Youssef Zaki clocked in 15 mins late today' },
  { title: 'New Internship', time: '3H AGO', detail: 'Backend track started with 12 new recruits' },
];

export default function AdminDashboardScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [internsCount, setInternsCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?._id) return;
    (async () => {
      try {
        const [interns, inProgress, completed, progRes] = await Promise.all([
          internService.listInterns(company._id, { status: 'active', limit: 1 }),
          taskService.listTasks(company._id, { status: 'in_progress', limit: 1 }),
          taskService.listTasks(company._id, { status: 'complete', limit: 1 }),
          programService.listPrograms(company._id, { limit: 100 }),
        ]);
        setInternsCount(interns.pagination.total);
        setInProgressCount(inProgress.pagination.total);
        setCompletedCount(completed.pagination.total);
        setPrograms(progRes.data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [company?._id]);

  const stats = [
    { label: 'Active Interns', value: String(internsCount), icon: Users, delta: '+12%', deltaLabel: 'vs last month' },
    { label: 'Tasks in Progress', value: String(inProgressCount), icon: CheckSquare, delta: '+5%', deltaLabel: 'vs last month' },
    { label: 'Completed Tasks', value: String(completedCount), icon: CheckCircle2, delta: '+18%', deltaLabel: 'vs last month' },
    { label: 'Pending Evaluations', value: '24', icon: ClipboardList, delta: '-2%', deltaDirection: 'down' as const, deltaLabel: 'vs last month' },
  ];

  const topPerformers = internsCount
    ? [
        { rank: 1, name: 'Emad Abd Elaaty', role: 'UX Designer', points: '2840 pts' },
        { rank: 2, name: 'Ali Elz3ery', role: 'ZABAL', points: '2610 pts' },
        { rank: 3, name: 'ziad elsayed', role: 'frontend', points: '2495 pts' },
      ]
    : [];

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Dashboard" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Dashboard Overview"
          actions={
            <button className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
              <Plus size={16} /> New Internship
            </button>
          }
        />

        <main className="flex-1 space-y-6 p-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Welcome back, Admin</h2>
            <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your internship programs today.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Internship Performance</h3>
                      <p className="text-sm text-slate-500">Visual overview of active vs completed metrics</p>
                    </div>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
                      <button className="rounded-md px-3 py-1.5 text-slate-500">Weekly</button>
                      <button className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white">Monthly</button>
                    </div>
                  </div>

                  <div className="mt-6 flex h-64 items-end gap-2 border-b border-slate-100 px-2">
                    {[60, 75, 82, 70, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-100 to-emerald-300" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-slate-400">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active Interns</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-800" /> Completed Tasks</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
                  <div className="mt-4 space-y-3">
                    {DEADLINES.map((d) => (
                      <div key={d.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className={`flex h-11 w-11 flex-col items-center justify-center rounded-lg text-[10px] font-semibold ${d.chip}`}>
                          {d.date.split(' ')[0]}
                          <span className="text-[9px] font-normal">{d.date.split(' ')[1]}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{d.title}</p>
                          <p className="text-xs text-slate-400">{d.tag}</p>
                        </div>
                        <MoreHorizontal size={16} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Current Programs</h3>
                    <Link href="/company/admin/projects" className="text-sm font-medium text-emerald-600">View All</Link>
                  </div>
                  <div className="mt-4 space-y-5">
                    {programs.length === 0 ? (
                      <p className="text-sm text-slate-400">No programs yet. Create one to get started.</p>
                    ) : (
                      programs.slice(0, 4).map((p) => (
                        <div key={p._id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.internIds.length} Interns</p>
                            </div>
                            <p className="text-sm font-medium text-emerald-600 capitalize">{p.status}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
                  <div className="mt-4 space-y-3">
                    {topPerformers.length === 0 ? (
                      <p className="text-sm text-slate-400">No ranked interns yet.</p>
                    ) : (
                      topPerformers.map((p) => (
                        <div key={p.rank} className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{p.rank}</span>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                            {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.role}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="flex items-center gap-1 font-semibold text-emerald-600">
                              <Trophy size={12} /> {p.points}
                            </p>
                            <p className="text-slate-400">Top 5%</p>
                          </div>
                        </div>
                      ))
                    )}
                    <button className="mt-2 w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                      View Full Leaderboard
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <div className="mt-4 divide-y divide-slate-100">
                  {ACTIVITY.map((a) => (
                    <div key={a.detail} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{a.title}</p>
                        <p className="text-xs text-slate-400">{a.detail}</p>
                      </div>
                      <span className="text-xs text-slate-400">{a.time}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-2 text-sm font-medium text-slate-500 hover:text-slate-700">
                  Show older activity
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}