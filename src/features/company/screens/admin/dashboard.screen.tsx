'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Briefcase,
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
import { projectService } from '@/features/company/services/project.service';
import { internshipService } from '@/features/internship/services/internship.service';
import {
  Program,
  Project,
  Intern,
  Task,
  TaskStatus,
} from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatDeadline(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));
  if (mins < 1) return 'JUST NOW';
  if (mins < 60) return `${mins}M AGO`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}H AGO`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}D AGO`;
  return `${Math.floor(days / 7)}W AGO`;
}

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'TO DO',
  in_progress: 'IN PROGRESS',
  in_review: 'IN REVIEW',
  complete: 'COMPLETED',
  archived: 'ARCHIVED',
};

const TASK_STATUS_CHIP: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-amber-50 text-amber-600',
  in_review: 'bg-blue-50 text-blue-600',
  complete: 'bg-emerald-50 text-emerald-600',
  archived: 'bg-slate-100 text-slate-400',
};

const TASK_STATUS_ICON: Record<TaskStatus, string> = {
  todo: 'bg-emerald-100',
  in_progress: 'bg-amber-100',
  in_review: 'bg-blue-100',
  complete: 'bg-emerald-100',
  archived: 'bg-slate-100',
};

interface DashboardData {
  totalInterns: number;
  activeInterns: number;
  alumniInterns: number;
  pendingInterns: number;
  activeInternships: number;
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  programs: Program[];
  projects: Project[];
  topPerformers: Intern[];
  deadlines: Task[];
  recentActivity: { key: string; title: string; detail: string; time: string; chip: string }[];
}

export default function AdminDashboardScreen() {
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);
  const companyName = useAppSelector((s) => s.company.currentCompany?.name);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [internsAll, internsActive, internsAlumni, tasksRes, progRes, projRes, performers, activeInternshipRes] =
        await Promise.all([
          internService.listInterns(companyId, { limit: 1 }),
          internService.listInterns(companyId, { status: 'active', limit: 1 }),
          internService.listInterns(companyId, { status: 'alumni', limit: 1 }),
          taskService.listTasks(companyId, { limit: 100 }),
          programService.listPrograms(companyId, { limit: 100 }),
          projectService.listProjects(companyId, { limit: 100 }),
          internService.listInterns(companyId, { sort: 'points', limit: 3 }),
          internshipService.listInternships({ companyId, closed: false, limit: 1 }),
        ]);

      const totalInterns = internsAll.pagination?.total ?? internsAll.data.length;
      const activeInterns = internsActive.pagination?.total ?? internsActive.data.length;
      const alumniInterns = internsAlumni.pagination?.total ?? internsAlumni.data.length;

      const tasksByStatus: Record<TaskStatus, number> = {
        todo: 0,
        in_progress: 0,
        in_review: 0,
        complete: 0,
        archived: 0,
      };
      tasksRes.tasks.forEach((t) => {
        if (tasksByStatus[t.status] !== undefined) tasksByStatus[t.status] += 1;
      });

      const deadlines = tasksRes.tasks
        .filter(
          (t) =>
            t.status !== 'complete' &&
            t.status !== 'archived' &&
            t.dueDate &&
            new Date(t.dueDate).getTime() >= Date.now() - 86400000,
        )
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);

      const recentActivity = tasksRes.tasks
        .slice()
        .filter((t) => t.createdAt || t.updatedAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.updatedAt).getTime() -
            new Date(a.createdAt || a.updatedAt).getTime(),
        )
        .slice(0, 4)
        .map((t) => ({
          key: t._id,
          title: `Task ${TASK_STATUS_LABEL[t.status].toLowerCase().replace(/^./, (c) => c.toUpperCase())}`,
          detail: t.title,
          time: timeAgo(t.createdAt || t.updatedAt),
          chip: TASK_STATUS_ICON[t.status],
        }));

      setData({
        totalInterns,
        activeInterns,
        alumniInterns,
        pendingInterns: Math.max(0, totalInterns - activeInterns - alumniInterns),
        activeInternships: activeInternshipRes.pagination?.total ?? activeInternshipRes.internships.length,
        totalTasks: tasksRes.pagination?.total ?? tasksRes.tasks.length,
        tasksByStatus,
        programs: progRes.data,
        projects: projRes.data,
        topPerformers: performers.data,
        deadlines,
        recentActivity,
      });
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchDashboard, 0);
    return () => clearTimeout(t);
  }, [fetchDashboard]);

  const stats = [
    {
      label: 'Active Internships',
      value: String(data?.activeInternships ?? 0),
      icon: Briefcase,
      badge: data ? `${data.activeInterns} active interns` : undefined,
      delta: data ? `${data.totalInterns} total interns` : undefined,
      deltaLabel: 'enrolled',
    },
    {
      label: 'Tasks in Progress',
      value: String(data?.tasksByStatus.in_progress ?? 0),
      icon: CheckSquare,
      badge: data ? `${data.tasksByStatus.todo} todo` : undefined,
      delta: data ? `${data.totalTasks} total` : undefined,
      deltaLabel: 'tasks',
    },
    {
      label: 'Completed Tasks',
      value: String(data?.tasksByStatus.complete ?? 0),
      icon: CheckCircle2,
      badge: data ? `${data.tasksByStatus.in_review} in review` : undefined,
      delta: data ? `${Math.round((data.tasksByStatus.complete / Math.max(1, data.totalTasks)) * 100)}%` : undefined,
      deltaLabel: 'completion rate',
    },
    {
      label: 'Pending Evaluations',
      value: String(data?.tasksByStatus.in_review ?? 0),
      icon: ClipboardList,
      badge: data ? `${data.projects.length} projects` : undefined,
      delta: data ? `${data.programs.length} programs` : undefined,
      deltaLabel: 'running',
    },
  ];

  const chartBars: { label: string; value: number; color: string }[] = [
    { label: 'To Do', value: data?.tasksByStatus.todo ?? 0, color: 'bg-slate-300' },
    { label: 'In Progress', value: data?.tasksByStatus.in_progress ?? 0, color: 'bg-amber-300' },
    { label: 'In Review', value: data?.tasksByStatus.in_review ?? 0, color: 'bg-blue-300' },
    { label: 'Completed', value: data?.tasksByStatus.complete ?? 0, color: 'bg-emerald-300' },
  ];
  const chartMax = Math.max(1, ...chartBars.map((b) => b.value));

  const deadlines = data?.deadlines ?? [];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Dashboard" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          title="Dashboard Overview"
          actions={
            <Link
              href="/company/post-internship"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 sm:w-auto"
            >
              <Plus size={16} /> New Internship
            </Link>
          }
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Welcome back, {companyName || 'Admin'}
            </h2>
            <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your internship programs today.</p>
          </div>

          {loading || !data ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-col items-start">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="mt-4 h-7 w-16 rounded-full bg-slate-200" />
                      <div className="mt-3 h-2.5 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="h-5 w-48 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-64 rounded-full bg-slate-200" />
                  <div className="mt-6 flex h-64 items-end gap-2 border-b border-slate-100 px-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-slate-200" style={{ height: `${50 + i * 8}%` }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="h-5 w-44 rounded-full bg-slate-200" />
                  <div className="mt-5 space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="h-11 w-11 rounded-lg bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-40 rounded-full bg-slate-200" />
                          <div className="h-2.5 w-16 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="h-5 w-40 rounded-full bg-slate-200" />
                  <div className="mt-5 space-y-5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i}>
                        <div className="h-3.5 w-52 rounded-full bg-slate-200" />
                        <div className="mt-2 h-2.5 w-20 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="h-5 w-36 rounded-full bg-slate-200" />
                  <div className="mt-5 space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-slate-200" />
                        <div className="h-9 w-9 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-28 rounded-full bg-slate-200" />
                          <div className="h-2.5 w-16 rounded-full bg-slate-200" />
                        </div>
                        <div className="h-6 w-12 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
                      <h3 className="text-lg font-semibold text-slate-900">Tasks by Status</h3>
                      <p className="text-sm text-slate-500">Distribution across {data.totalTasks} tasks</p>
                    </div>
                    <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs">
                      <span className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white">Overview</span>
                    </div>
                  </div>

                  <div className="mt-6 flex h-64 items-end gap-2 border-b border-slate-100 px-2">
                    {chartBars.map((b) => (
                      <div key={b.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                        <span className="text-sm font-semibold text-slate-700">{b.value}</span>
                        <div
                          className={`w-full max-w-16 rounded-t-md ${b.color}`}
                          style={{ height: `${Math.max(8, (b.value / chartMax) * 100)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between px-2 text-xs text-slate-400">
                    {chartBars.map((b) => (
                      <span key={b.label} className="flex-1 text-center">{b.label}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" /> To Do</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-300" /> In Progress</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-300" /> In Review</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Completed</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
                  <div className="mt-4 space-y-3">
                    {deadlines.length === 0 ? (
                      <p className="text-sm text-slate-400">No upcoming deadlines.</p>
                    ) : (
                      deadlines.map((d) => (
                        <div key={d._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                          <div className={`flex h-11 w-11 flex-col items-center justify-center rounded-lg text-[10px] font-semibold ${TASK_STATUS_CHIP[d.status]}`}>
                            {formatDeadline(d.dueDate).split(' ')[0]}
                            <span className="text-[9px] font-normal">{formatDeadline(d.dueDate).split(' ')[1]}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{d.title}</p>
                            <p className="text-xs text-slate-400">{TASK_STATUS_LABEL[d.status]}</p>
                          </div>
                          <MoreHorizontal size={16} className="text-slate-300" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Current Programs</h3>
                    <span className="text-sm font-medium text-emerald-600">{data.programs.length} total</span>
                  </div>
                  <div className="mt-4 space-y-5">
                    {data.programs.length === 0 ? (
                      <p className="text-sm text-slate-400">No programs yet. Create one to get started.</p>
                    ) : (
                      data.programs.slice(0, 4).map((p) => (
                        <div key={p._id}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-400">
                                {p.internIds?.length ?? 0} Interns{p.maxInterns ? ` / ${p.maxInterns} max` : ''} ·{' '}
                                {p.startDate ? new Date(p.startDate).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <p className="text-sm font-medium capitalize text-emerald-600">{p.status}</p>
                          </div>
                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.min(100, ((p.internIds?.length ?? 0) / Math.max(1, p.maxInterns ?? 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Top Performers</h3>
                  <div className="mt-4 space-y-3">
                    {data.topPerformers.length === 0 ? (
                      <p className="text-sm text-slate-400">No ranked interns yet.</p>
                    ) : (
                      data.topPerformers.map((p, rank) => (
                        <div key={p._id} className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                            {rank + 1}
                          </span>
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                            {`${p.firstName || ''} ${p.lastName || ''}`.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">{`${p.firstName || ''} ${p.lastName || ''}`.trim()}</p>
                            <p className="truncate text-xs text-slate-400">{p.headline || p.skills?.[0] || 'Intern'}</p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="flex items-center gap-1 font-semibold text-emerald-600">
                              <Trophy size={12} /> {p.totalPoints ?? 0} pts
                            </p>
                            <p className="text-slate-400">Top 5%</p>
                          </div>
                        </div>
                      ))
                    )}
                    <Link
                      href="/company/admin/leaderboard"
                      className="mt-2 block w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      View Full Leaderboard
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <div className="mt-4 divide-y divide-slate-100">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-slate-400">No activity yet.</p>
                  ) : (
                    recentActivity.map((a) => (
                      <div key={a.key} className="flex items-center gap-3 py-3">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${a.chip}`} />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                          <p className="truncate text-xs text-slate-400">{a.detail}</p>
                        </div>
                        <span className="text-xs text-slate-400">{a.time}</span>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/company/activity" className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                  View all activity
                </Link>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}