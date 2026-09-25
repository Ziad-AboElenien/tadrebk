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
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { LS_PENDING_ONBOARDING } from '@/lib/constants';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import StatCard from '@/components/tadrebk/StatCard';
import { internshipService } from '@/features/internship/services/internship.service';
import { syncInternshipsClosedState } from '@/features/internship/utils/closedInternshipState';
import PerformanceChart from '@/features/company/components/PerformanceChart';
import InternAvatar from '@/components/ui/InternAvatar';
import { taskService, BroadcastCard } from '@/features/company/services/task.service';
import { internService } from '@/features/company/services/intern.service';
import { evaluationService, Evaluation } from '@/features/company/services/evaluation.service';
import { Intern, Task } from '@/features/company/types/management';
import { programService } from '@/features/company/services/program.service';
import { Program } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';



function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const authStatus = useAppSelector((s) => s.auth.status);
  const backendRole = useAppSelector((s) => s.user.currentUser as { role?: string } | null)?.role || '';
  const isPendingCompany = /company/i.test(backendRole);
  // Fresh company signup still holding its onboarding flag — the ONLY case
  // allowed to see (and open) the company onboarding form.
  const freshSignup =
    typeof window !== 'undefined' && localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';
  const [internsCount, setInternsCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingEvals, setPendingEvals] = useState(0);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentEvals, setRecentEvals] = useState<Evaluation[]>([]);
  const [monthlyDone, setMonthlyDone] = useState<{ label: string; value: number }[]>([]);
  const [upcoming, setUpcoming] = useState<BroadcastCard[]>([]);
  const [openingId, setOpeningId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?._id) return;
    (async () => {
      try {
        const [postingsRes, internList, tasksRes, progRes, evalRes, bcRes] = await Promise.all([
          internshipService.listInternships({ companyId: company._id, limit: 50 }),
          internService.listAllInterns(company._id),
          taskService.listTasks(company._id, { limit: 100 }),
          programService.listPrograms(company._id, { limit: 100 }),
          evaluationService.listEvaluations(company._id, { page: 1, limit: 100 }).catch(() => ({ evaluations: [] })),
          taskService.listBroadcasts(company._id, { limit: 100 }).catch(() => ({ broadcasts: [] })),
        ]);
        const tasks = tasksRes.tasks.filter((t) => t.status !== 'archived');
        setInternsCount(syncInternshipsClosedState(postingsRes.internships).filter((i) => !i.closed).length);
        setInterns(internList);
        setInProgressCount(tasks.filter((t) => t.status === 'in_progress').length);
        setCompletedCount(tasks.filter((t) => t.status === 'complete').length);
        setPendingEvals(evalRes.evaluations.filter((e) => !e.sharedWithIntern).length);
        setPrograms(progRes.data);
        setRecentTasks(
          [...tasks]
            .sort((a, b) => +new Date(b.updatedAt || b.createdAt) - +new Date(a.updatedAt || a.createdAt))
            .slice(0, 20),
        );
        setRecentEvals(
          [...evalRes.evaluations]
            .sort((a, b) => +new Date(b.evaluatedAt) - +new Date(a.evaluatedAt))
            .slice(0, 20),
        );
        const months: { label: string; value: number }[] = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const count = tasks.filter((t) => {
            const doneAt = t.reviewedAt || (t.status === 'complete' ? t.updatedAt : null);
            if (!doneAt) return false;
            const dd = new Date(doneAt);
            return dd.getFullYear() === d.getFullYear() && dd.getMonth() === d.getMonth() && `${dd.getFullYear()}-${dd.getMonth()}` === key;
          }).length;
          months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), value: count });
        }
        setMonthlyDone(months);
        setUpcoming(
          bcRes.broadcasts
            .filter((b) => b.dueDate)
            .sort((a, b) => +new Date(a.dueDate as string) - +new Date(b.dueDate as string))
            .slice(0, 4),
        );
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [company?._id]);

  const stats = [
    { label: 'Active Internships', value: String(internsCount), icon: Users, delta: `${internsCount} open`, deltaLabel: 'active postings' },
    { label: 'Tasks in Progress', value: String(inProgressCount), icon: CheckSquare, delta: `${completedCount} done`, deltaLabel: 'completed total' },
    { label: 'Completed Tasks', value: String(completedCount), icon: CheckCircle2, delta: 'all time', deltaLabel: 'non-archived' },
    { label: 'Pending Evaluations', value: String(pendingEvals), icon: ClipboardList, delta: 'draft', deltaLabel: 'not shared yet' },
  ];

  const internNameOf = (id: string): string => {
    const f = interns.find((i) => i._id === id);
    return f ? `${f.firstName} ${f.lastName}`.trim() || f.email : id.slice(-6).toUpperCase();
  };

  const openBroadcast = async (groupId: string) => {
    if (!company?._id) return;
    setOpeningId(groupId);
    try {
      const res = await taskService.listByGroup(company._id, groupId);
      const rows = res.tasks;
      if (rows.length === 0) {
        toastHelper.error('No tasks in this group yet');
        return;
      }
      const first = rows[0];
      const iid = typeof first.internId === 'string' ? first.internId : '';
      router.push(`/company/admin/tasks/${first._id}?groupId=${groupId}&internId=${iid}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setOpeningId('');
    }
  };

  const topPerformers = [...interns]
    .sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0))
    .slice(0, 3)
    .map((i, idx) => ({
      rank: idx + 1,
      _id: i._id,
      name: `${i.firstName} ${i.lastName}`.trim() || i.email,
      email: i.email,
      role: i.headline || 'Intern',
      points: `${(i.totalPoints ?? 0).toLocaleString()} pts`,
      src: i.profilePicture?.secure_url,
      firstName: i.firstName,
      lastName: i.lastName,
    }));

  const activityFeed = [
    ...recentTasks
      .filter((t) => t.status === 'complete')
      .slice(0, 4)
      .map((t) => ({
        key: `t-${t._id}`,
        title: 'Task Completed',
        time: timeAgo(t.reviewedAt || t.updatedAt),
        detail: `${internNameOf(typeof t.internId === 'string' ? t.internId : '')} completed "${t.title}"`,
        ts: +new Date(t.reviewedAt || t.updatedAt || t.createdAt),
      })),
    ...recentEvals.slice(0, 4).map((e) => ({
      key: `e-${e._id}`,
      title: e.sharedWithIntern ? 'Evaluation Shared' : 'Evaluation Submitted',
      time: timeAgo(e.sharedAt || e.evaluatedAt),
      detail: `${internNameOf(e.internId)} received ${e.overallScore}/100`,
      ts: +new Date(e.sharedAt || e.evaluatedAt),
    })),
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 6);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Dashboard" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar
          title="Dashboard Overview"
          actions={
            <>
              {/* Desktop / tablet: full button */}
              <Link
                href="/company/post-internship"
                className="hidden items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 sm:inline-flex"
              >
                <Plus size={16} /> New Internship
              </Link>
            </>
          }
        />

        <main className="flex-1 space-y-4 px-[2.5%] py-3 sm:space-y-6 sm:p-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Welcome back, Admin</h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:mt-0 sm:text-sm">Here&apos;s what&apos;s happening with your internship programs today.</p>
          </div>

          {!company?._id && authStatus === 'succeeded' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
              {freshSignup ? (
                <>
                  <p className="font-semibold text-slate-900">No company profile found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Complete your company profile to unlock the dashboard.
                  </p>
                  <Link
                    href="/company/onboarding"
                    className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-600"
                  >
                    Complete Company Profile
                  </Link>
                </>
              ) : isPendingCompany ? (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                    <i className="fas fa-hourglass-half text-2xl text-amber-500" />
                  </div>
                  <p className="font-semibold text-slate-900">Your account is under review</p>
                  <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                    Our admin team is reviewing your company profile. Your dashboard
                    will unlock automatically once you&apos;re approved.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900">No company profile found</p>
                  <p className="mt-1 text-sm text-slate-400">
                    We couldn&apos;t load your company profile. Try signing in again.
                  </p>
                </>
              )}
            </div>
          ) : loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="h-3 w-24 rounded-full bg-slate-200" />
                    <div className="mt-3 h-7 w-16 rounded-full bg-slate-200" />
                    <div className="mt-2 h-4 w-28 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="h-5 w-48 rounded-full bg-slate-200" />
                  <div className="mt-2 h-3 w-64 rounded-full bg-slate-200" />
                  <div className="mt-6 flex h-64 items-end gap-2 border-b border-slate-100 px-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex-1 rounded-t-md bg-slate-200" style={{ height: `${50 + i * 8}%` }} />
                    ))}
                  </div>
                  <div className="mt-2 h-3 w-full rounded-full bg-slate-200" />
                  <div className="mt-4 h-3 w-40 rounded-full bg-slate-200" />
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
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="h-3.5 w-52 rounded-full bg-slate-200" />
                            <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                          </div>
                          <div className="h-4 w-16 rounded-full bg-slate-200" />
                        </div>
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

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="h-5 w-36 rounded-full bg-slate-200" />
                <div className="mt-5 space-y-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="space-y-2">
                        <div className="h-3.5 w-44 rounded-full bg-slate-200" />
                        <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                      </div>
                      <div className="h-3 w-16 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {stats.map((s) => (
                  <StatCard key={s.label} {...s} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Task Completions</h3>
                      <p className="text-sm text-slate-500">Completed tasks per month · last 6 months</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <PerformanceChart data={monthlyDone.length > 0 ? monthlyDone : [{ label: '—', value: 0 }]} />
                  </div>
                  <div className="mt-4 flex gap-6 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed Tasks</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
                  <div className="mt-4 space-y-3">
                    {upcoming.length === 0 ? (
                      <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                        No open tasks with due dates.
                      </p>
                    ) : (
                      upcoming.map((b) => {
                        const d = new Date(b.dueDate as string);
                        const done = b.members.filter((m) => m.status === 'complete').length;
                        return (
                          <button
                            key={b.taskGroupId}
                            onClick={() => openBroadcast(b.taskGroupId)}
                            disabled={openingId === b.taskGroupId}
                            className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left hover:bg-slate-50 disabled:opacity-60"
                          >
                            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-amber-50 text-[10px] font-semibold text-amber-600">
                              {d.toLocaleDateString('en-US', { day: '2-digit' }).toUpperCase()}
                              <span className="text-[9px] font-normal">{d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">{b.title}</p>
                              <p className="truncate text-xs text-slate-400">
                                Group · {b.totalMembers} member(s) · {done} done
                              </p>
                            </div>
                            {openingId === b.taskGroupId ? (
                              <Loader2 size={16} className="shrink-0 animate-spin text-slate-400" />
                            ) : (
                              <MoreHorizontal size={16} className="shrink-0 text-slate-300" />
                            )}
                          </button>
                        );
                      })
                    )}
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
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-400">{p.internIds.length} Interns</p>
                            </div>
                            <p className="shrink-0 text-sm font-medium capitalize text-emerald-600">{p.status}</p>
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
                      <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No ranked interns yet.</p>
                    ) : (
                      topPerformers.map((p) => (
                        <Link key={p._id} href={`/company/admin/interns/${p._id}`} className="flex items-center gap-3 rounded-xl p-1 hover:bg-slate-50">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">{p.rank}</span>
                          <InternAvatar
                            src={p.src}
                            firstName={p.firstName}
                            lastName={p.lastName}
                            email={p.email}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                            <p className="truncate text-xs text-slate-400">{p.role}</p>
                          </div>
                          <div className="shrink-0 text-right text-xs">
                            <p className="flex items-center gap-1 font-semibold text-emerald-600">
                              <Trophy size={12} /> {p.points}
                            </p>
                          </div>
                        </Link>
                      ))
                    )}
                    <Link href="/company/admin/leaderboard" className="mt-2 block w-full rounded-lg border border-slate-200 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-50">
                      View Full Leaderboard
                    </Link>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                <div className="mt-4 divide-y divide-slate-100">
                  {activityFeed.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No recent activity yet.</p>
                  ) : (
                    activityFeed.map((a) => (
                      <div key={a.key} className="flex items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{a.title}</p>
                          <p className="truncate text-xs text-slate-400">{a.detail}</p>
                        </div>
                        <span className="shrink-0 text-xs text-slate-400">{a.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
