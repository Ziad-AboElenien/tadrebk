'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { applicationService, Application } from '@/features/student/services/application.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { internMeService } from '@/features/intern/services/intern-me.service';
import { internTaskService } from '@/features/intern/services/intern-task.service';
import type { InternAttendance } from '@/features/intern/types';
import { Internship } from '@/features/internship/types';
import { Task } from '@/features/company/types/management';
import { Program } from '@/features/company/types/management';
import { getUserImgUrl } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import CheckInCard, { CheckInVariant } from '@/features/student/components/dashboard/CheckInCard';
import { checkinService, utcDay } from '@/features/student/services/checkin.service';
import StudentProfileCard from '@/features/student/components/dashboard/StudentProfileCard';
import DashboardSidebar from '@/features/student/components/dashboard/DashboardSidebar';
import MyTasksSection from '@/features/student/components/dashboard/MyTasksSection';
import StudentAttendanceSection from '@/features/student/components/dashboard/StudentAttendanceSection';
import MyApplicationsSection from '@/features/student/components/dashboard/MyApplicationsSection';
import InternshipPanel, {
  PanelFeedback,
  PanelRequirement,
} from '@/features/student/components/dashboard/InternshipPanel';

const CHECKIN_KEY = 'tadrebk_checkin';

interface CheckinState {
  last: string;
  streak: number;
  result: string;
}

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDate(base: string, deltaDays: number): string {
  const d = new Date(`${base}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadCheckin(): CheckinState {
  try {
    const raw = localStorage.getItem(CHECKIN_KEY);
    if (raw) return JSON.parse(raw) as CheckinState;
  } catch {
    // ignore
  }
  return { last: '', streak: 0, result: '' };
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function StudentDashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);

  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [program, setProgram] = useState<Program | null>(null);
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorRole, setSupervisorRole] = useState('');

  const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const [feedbacks, setFeedbacks] = useState<PanelFeedback[]>([]);

  const [attendance, setAttendance] = useState<InternAttendance[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const [checkVariant, setCheckVariant] = useState<CheckInVariant>('prompt');
  const [checkState, setCheckState] = useState<CheckinState>({ last: '', streak: 0, result: '' });

  const persistCheckin = (st: CheckinState) => {
    setCheckState(st);
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(st));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // Server streak wins; localStorage is the offline fallback.
    const applyState = (streak: number, last: string, result: string) => {
      setCheckState({ last, streak, result });
      const today = localToday();
      const yesterday = shiftDate(today, -1);
      if (last === today) {
        setCheckVariant('completed');
      } else if (last && last !== yesterday && streak > 0) {
        setCheckVariant('streak-broken');
      } else {
        setCheckVariant('prompt');
      }
    };
    if (!userId) {
      const st = loadCheckin();
      applyState(st.streak, st.last, st.result);
      return;
    }
    checkinService
      .getCheckin(userId)
      .then((s) => {
        const last = s.last ? utcDay(s.last) : '';
        const prev = loadCheckin();
        const st = { last, streak: s.count, result: prev.result || 'Looking for internships' };
        persistCheckin(st);
        applyState(st.streak, st.last, st.result);
      })
      .catch(() => {
        const st = loadCheckin();
        applyState(st.streak, st.last, st.result);
      });
  }, [userId]);

  const handleCheckIn = (answer?: string) => {
    const result = answer || checkState.result || 'Looking for internships';
    if (!userId) {
      const today = localToday();
      const yesterday = shiftDate(today, -1);
      const continued = checkState.last === yesterday;
      persistCheckin({ last: today, streak: continued ? checkState.streak + 1 : 1, result });
      setCheckVariant('completed');
      return;
    }
    checkinService
      .postCheckin(userId)
      .then((s) => {
        const st = { last: s.last ? utcDay(s.last) : localToday(), streak: s.count, result };
        persistCheckin(st);
        setCheckState(st);
        setCheckVariant('completed');
      })
      .catch(() => {
        const today = localToday();
        const yesterday = shiftDate(today, -1);
        const continued = checkState.last === yesterday;
        persistCheckin({ last: today, streak: continued ? checkState.streak + 1 : 1, result });
        setCheckVariant('completed');
      });
  };

  const handleRecover = () => {
    if (!userId) {
      persistCheckin({ last: localToday(), streak: checkState.streak, result: checkState.result });
      setCheckVariant('completed');
      return;
    }
    checkinService
      .postCheckin(userId)
      .then((s) => {
        const st = { last: s.last ? utcDay(s.last) : localToday(), streak: s.count, result: checkState.result };
        persistCheckin(st);
        setCheckState(st);
        setCheckVariant('completed');
      })
      .catch(() => {
        persistCheckin({ last: localToday(), streak: checkState.streak, result: checkState.result });
        setCheckVariant('completed');
      });
  };

  const handleFreshStart = () => {
    persistCheckin({ last: '', streak: 0, result: '' });
    setCheckVariant('prompt');
  };

  const weeklyProgress = (() => {
    const arr = [false, false, false, false, false, false, false];
    if (checkState.last === localToday()) arr[new Date().getDay()] = true;
    return arr;
  })();

  const fetchBase = useCallback(async () => {
    try {
      const res = await internshipService.getSavedInternships(1, 50);
      setSavedInternships(res.internships);
    } catch {
      // ignore
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingApps(true);
      const result = await applicationService.getUserApplications(userId, { page: 1, limit: 100 });
      setApplications(result.applications);
    } catch {
      toastHelper.error('Failed to load applications');
    } finally {
      setLoadingApps(false);
    }
  }, [userId]);

  const fetchEnrollment = useCallback(async () => {
    try {
      const picker = await internMeService.getPicker();
      const first = picker.enrollments?.[0];
      if (!first?.companyId) return;
      setCompanyId(first.companyId);
      const [prog, sup, evals] = await Promise.all([
        internMeService.getProgram(first.companyId).catch(() => undefined),
        internMeService.getSupervisor(first.companyId).catch(() => ({})),
        internMeService.getEvaluations(first.companyId, { limit: 50 }).catch(() => ({})),
      ]);
      if (prog) setProgram(prog);
      const s = sup as Record<string, string>;
      const sName = [s.firstName, s.lastName].filter(Boolean).join(' ') || (s.name as string) || '';
      setSupervisorName(sName);
      setSupervisorRole((s.role as string) || (s.title as string) || 'Supervisor');
      setCompanyName((prog as unknown as { companyName?: string })?.companyName || '');
      const list = ((evals as Record<string, unknown>).evaluations as unknown[]) || [];
      setFeedbacks(
        (list as Record<string, unknown>[])
          .filter((e) => (e as { sharedWithIntern?: boolean }).sharedWithIntern !== false)
          .slice(0, 5)
          .map((e) => {
            const ev = e as {
              strengths?: string;
              improvements?: string;
              skillRating?: number;
              teamworkRating?: number;
              sharedAt?: string;
              evaluatedAt?: string;
            };
            return {
              author: sName || 'Supervisor',
              date: formatDate((ev.sharedAt as string) || (ev.evaluatedAt as string)),
              body: [ev.strengths, ev.improvements].filter(Boolean).join(' ') || 'Great progress. Keep it up!',
              skillRating: ev.skillRating,
              teamworkRating: ev.teamworkRating,
            };
          }),
      );
    } catch {
      // not enrolled — tasks/panel sections stay hidden
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!companyId) return;
    try {
      setLoadingTasks(true);
      const res = await internTaskService.listMyTasks(companyId, { limit: 100 });
      setTasks(res.tasks);
    } catch {
      toastHelper.error('Failed to load tasks');
    } finally {
      setLoadingTasks(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchBase();
  }, [fetchBase]);
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);
  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!companyId) return;
    setLoadingAttendance(true);
    internMeService
      .getAttendance(companyId, { limit: 30 })
      .then((res) => setAttendance(res.attendance))
      .catch(() => {})
      .finally(() => setLoadingAttendance(false));
  }, [companyId]);

  const handleCancel = useCallback(
    async (app: Application) => {
      const internId = typeof app.internshipId === 'string' ? app.internshipId : app.internshipId._id;
      setCancellingId(app._id);
      try {
        await applicationService.cancelApplication(app.companyId, internId, app._id);
        toastHelper.success('Application cancelled');
        fetchApplications();
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setCancellingId(null);
      }
    },
    [fetchApplications],
  );

  const handleTaskAction = useCallback(
    async (taskId: string, action: 'start' | 'submit', note?: string) => {
      if (!companyId) return;
      setActingId(taskId);
      try {
        const updated =
          action === 'start'
            ? await internTaskService.startTask(companyId, taskId)
            : await internTaskService.submitTask(companyId, taskId, note);
        setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
        toastHelper.success(action === 'start' ? 'Task started' : 'Task submitted for review');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setActingId(null);
      }
    },
    [companyId],
  );

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.push('/');
    toastHelper.success('Signed out');
  }, [dispatch, router]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Student';
  const firstName = user?.firstName || 'there';
  const education = user?.education?.[0];
  const doneCount = applications.filter((a) => a.status === 'accepted' && a.completed).length;

  const requirements: PanelRequirement[] = tasks
    .filter((t) => t.status === 'todo' || t.status === 'in_review')
    .slice(0, 5)
    .map((t) => ({
      title: t.title,
      due: formatDate(t.dueDate),
      status: t.status === 'in_review' ? 'Action Needed' : 'Pending',
    }));

  const authStatus = useAppSelector((s) => s.auth.status);
  const hydrating = authStatus === 'idle' || authStatus === 'loading';

  if (hydrating) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-[2.5%] py-6 sm:px-6 sm:py-10">
          <div className="h-8 w-64 animate-pulse rounded-full bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-slate-500">Please sign in to view your dashboard.</p>
        <Link
          href="/login/student"
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const period = program
    ? `${formatDate(program.startDate)} – ${program.endDate ? formatDate(program.endDate) : 'Present'}`
    : '—';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-[2.5%] py-6 sm:px-6 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}!</h2>
            <p className="text-sm text-slate-500">Start exploring internships that match your skills.</p>
          </div>
          <Link
            href="/internships"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Browse Internships
          </Link>
        </div>

        <CheckInCard
          variant={checkVariant}
          firstName={firstName}
          streak={{
            current: checkState.streak,
            beforeBreak: checkState.streak,
            todayStatus: checkVariant === 'completed' ? 'Present' : 'Not checked in',
            weeklyProgress,
          }}
          result={checkState.result}
          checkedAt={checkVariant === 'completed' ? formatTime(`${localToday()}T00:00:00`) : undefined}
          onCheckIn={handleCheckIn}
          onRecover={handleRecover}
          onFreshStart={handleFreshStart}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-6">
            <StudentProfileCard
              student={{
                name: displayName,
                university: education?.institution || 'Not specified',
                major: education?.field || 'Not specified',
                graduation: education?.endDate
                  ? `Class of ${new Date(education.endDate).getFullYear()}`
                  : 'Not specified',
                email: user.email,
                avatarUrl: getUserImgUrl(user.profilePicture),
              }}
            />
          </div>

          <DashboardSidebar
            counts={{ applied: applications.length, saved: savedInternships.length, done: doneCount }}
            onSignOut={handleSignOut}
          />
        </div>

        {companyId && (
          <MyTasksSection
            tasks={tasks}
            loading={loadingTasks}
            actingId={actingId}
            onStart={(id) => handleTaskAction(id, 'start')}
            onSubmit={(id, note) => handleTaskAction(id, 'submit', note)}
          />
        )}

        <MyApplicationsSection
          applications={applications}
          loading={loadingApps}
          cancellingId={cancellingId}
          onCancel={handleCancel}
          onBrowse={() => router.push('/internships')}
        />

        {companyId && (
          <StudentAttendanceSection records={attendance} loading={loadingAttendance} />
        )}

        {companyId && (
          <InternshipPanel
            internship={{
              company: companyName || program?.name || 'My Internship',
              period,
              department: program?.description?.slice(0, 60) || '—',
              supervisor: supervisorName || '—',
              supervisorRole,
              status: 'Active',
            }}
            requirements={requirements}
            feedback={feedbacks}
          />
        )}
      </main>
    </div>
  );
}
