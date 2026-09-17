'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Users2,
  Trash2,
  Save,
  X,
  Plus,
  Check,
  PenLine,
  Loader2,
  MoreHorizontal,
  ClipboardCheck,
  FolderKanban,
  ListTodo,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InternAvatar from '@/components/ui/InternAvatar';
import Select from '@/components/ui/Select';
import { programService } from '@/features/company/services/program.service';
import { projectService } from '@/features/company/services/project.service';
import { taskService } from '@/features/company/services/task.service';
import { internService } from '@/features/company/services/intern.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import { Internship } from '@/features/internship/types';
import { Program, Intern, Project, Task, TaskStatus } from '@/features/company/types/management';
import ProgramAttendanceSection from './program-attendance.section';
import { priorityTheme } from '@/features/company/utils/taskPriorityTheme';
import { BroadcastCard } from '@/features/company/services/task.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-600',
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

const STATUS_OPTIONS: Program['status'][] = ['upcoming', 'active', 'completed', 'archived'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProgramDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [program, setProgram] = useState<Program | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'view' | 'edit'>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'edit'
      ? 'edit'
      : 'view',
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Program['status']>('upcoming');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxInterns, setMaxInterns] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showEnroll, setShowEnroll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState('');

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [internshipStudents, setInternshipStudents] = useState<Intern[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const [programProjects, setProgramProjects] = useState<Project[]>([]);
  const [programTasks, setProgramTasks] = useState<Task[]>([]);
  const [programBroadcasts, setProgramBroadcasts] = useState<BroadcastCard[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [openingGroup, setOpeningGroup] = useState('');

  const fetchProgramExtras = useCallback(async () => {
    if (!companyId || !programId) return;
    setLoadingExtras(true);
    try {
      const [projRes, taskRes, bcRes] = await Promise.all([
        projectService.listProjects(companyId, { programId, limit: 100 }),
        taskService.listTasks(companyId, { limit: 100 }),
        taskService.listBroadcasts(companyId, { programId, limit: 100 }),
      ]);
      setProgramProjects(projRes.data);
      setProgramTasks(taskRes.tasks);
      setProgramBroadcasts(bcRes.broadcasts);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoadingExtras(false);
    }
  }, [companyId, programId]);

  useEffect(() => {
    const t = setTimeout(fetchProgramExtras, 0);
    return () => clearTimeout(t);
  }, [fetchProgramExtras]);

  const tasksByProject = useMemo(() => {
    const map: Record<string, Task[]> = {};
    programTasks.forEach((t) => {
      if (!t.projectId || t.taskGroupId) return;
      (map[t.projectId] = map[t.projectId] || []).push(t);
    });
    return map;
  }, [programTasks]);

  const broadcastsByProject = useMemo(() => {
    const map: Record<string, BroadcastCard[]> = {};
    programBroadcasts.forEach((b) => {
      if (!b.projectId) return;
      (map[b.projectId] = map[b.projectId] || []).push(b);
    });
    return map;
  }, [programBroadcasts]);

  const programDirectTasks = useMemo(
    () => programTasks.filter((t) => t.programId === programId && !t.projectId && !t.taskGroupId),
    [programTasks, programId],
  );

  const programLevelBroadcasts = useMemo(
    () => programBroadcasts.filter((b) => !b.projectId),
    [programBroadcasts],
  );

  const openBroadcast = async (groupId: string) => {
    if (!companyId) return;
    setOpeningGroup(groupId);
    try {
      const res = await taskService.listByGroup(companyId, groupId);
      const rows = res.tasks;
      if (rows.length === 0) {
        toastHelper.error('No tasks in this group yet');
        return;
      }
      const first = rows[0];
      const iid = typeof first.internId === 'string' ? first.internId : ((first.internId as unknown as { _id?: string })?._id || '');
      router.push(`/company/admin/tasks/${first._id}?groupId=${groupId}&internId=${iid}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setOpeningGroup('');
    }
  };

  const fetchProgram = useCallback(async () => {
    if (!companyId || !programId) return;
    setLoading(true);
    try {
      const progRes = await programService.getProgram(companyId, programId);
      setProgram(progRes);
      setName(progRes.name);
      setDescription(progRes.description ?? '');
      setStatus(progRes.status ?? 'upcoming');
      setStartDate(progRes.startDate ? progRes.startDate.slice(0, 10) : '');
      setEndDate(progRes.endDate ? progRes.endDate.slice(0, 10) : '');
      setMaxInterns(progRes.maxInterns != null ? String(progRes.maxInterns) : '');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, programId]);

  const fetchInterns = useCallback(async () => {
    if (!companyId) return;
    try {
      const internRes = await internService.listInterns(companyId, { limit: 100 });
      if (internRes.data.length > 0) {
        setInterns(internRes.data);
        return;
      }

      const internships = await internshipService.listInternships({ companyId, limit: 100 });
      const accepted: Intern[] = [];
      const seen = new Set<string>();
      for (const ip of internships.internships) {
        try {
          const apps = await applicationService.getCompanyApplications(companyId, ip._id, {
            status: 'accepted',
            limit: 200,
          });
          for (const a of apps.applications) {
            const s = a.studentId;
            if (!s?._id || seen.has(s._id)) continue;
            seen.add(s._id);
            accepted.push({
              _id: s._id,
              firstName: s.firstName ?? '',
              lastName: s.lastName ?? '',
              email: s.email ?? '',
              role: 'intern',
              isConfirmed: true,
              totalPoints: 0,
            });
          }
        } catch {
          // ignore per-internship failures
        }
      }
      setInterns(accepted);
    } catch {
      setInterns([]);
    }
  }, [companyId]);

  const fetchInternships = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await internshipService.listInternships({ companyId, limit: 100 });
      setInternships(res.internships.filter((ip) => !ip.closed));
    } catch {
      setInternships([]);
    }
  }, [companyId]);

  const handleInternshipSelect = useCallback(
    async (internshipId: string) => {
      if (!companyId || !internshipId) return;
      setSelectedInternshipId(internshipId);
      setSelected([]);
      setInternshipStudents([]);
      setLoadingStudents(true);
      try {
        const apps = await applicationService.getCompanyApplications(companyId, internshipId, {
          status: 'accepted',
          limit: 200,
        });
        const students: Intern[] = [];
        const seen = new Set<string>();
        for (const app of apps.applications) {
          const s = app.studentId;
          if (!s?._id || seen.has(s._id)) continue;
          seen.add(s._id);
          students.push({
            _id: s._id,
            firstName: s.firstName ?? '',
            lastName: s.lastName ?? '',
            email: s.email ?? '',
            role: 'intern',
            isConfirmed: true,
            totalPoints: 0,
          });
        }
        setInternshipStudents(students);
      } catch {
        setInternshipStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    const t = setTimeout(fetchProgram, 0);
    return () => clearTimeout(t);
  }, [fetchProgram]);

  useEffect(() => {
    const t = setTimeout(fetchInterns, 0);
    return () => clearTimeout(t);
  }, [fetchInterns]);

  useEffect(() => {
    const t = setTimeout(fetchInternships, 0);
    return () => clearTimeout(t);
  }, [fetchInternships]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Programs" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Program Details" />
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="h-36 rounded-2xl bg-slate-200 sm:h-40" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-48 rounded-2xl border border-slate-200 bg-white" />
            </div>
            <div className="space-y-6">
              <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
            </div>
          </div>
        </main>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Programs" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Program Details" />
          <div className="py-20 text-center text-sm text-slate-400">Program not found.</div>
        </div>
      </div>
    );
  }

  const enrolledInterns = interns.filter((i) => program.internIds.includes(i._id));

  const handleSaveEdit = async () => {
    if (!companyId) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Program name is required.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (endDate && startDate && endDate < startDate) errs.endDate = 'End date cannot be before start date.';
    if (maxInterns && Number(maxInterns) < 1) errs.maxInterns = 'Max interns must be at least 1.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingEdit(true);
    try {
      await programService.updateProgram(companyId, programId, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate,
        endDate: endDate || undefined,
        maxInterns: maxInterns ? Number(maxInterns) : undefined,
      });
      await fetchProgram();
      setMode('view');
      toastHelper.success('Program updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleSelect = (internId: string) =>
    setSelected((prev) => (prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]));

  const handleEnroll = async () => {
    if (!companyId) return;
    if (selected.length === 0) {
      toastHelper.error('Select at least one intern to enroll.');
      return;
    }
    setEnrolling(true);
    try {
      await programService.enrollInterns(companyId, programId, selected);
      setShowEnroll(false);
      setSelected([]);
      await Promise.all([fetchProgram(), fetchInterns()]);
      toastHelper.success(`${selected.length} intern(s) enrolled`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (internId: string) => {
    if (!companyId) return;
    setUnenrollingId(internId);
    try {
      await programService.unenrollIntern(companyId, programId, internId);
      await Promise.all([fetchProgram(), fetchInterns()]);
      toastHelper.success('Intern removed from program');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setUnenrollingId('');
    }
  };

  const handleArchive = async () => {
    if (!companyId) return;
    setArchiving(true);
    try {
      await programService.archiveProgram(companyId, programId);
      toastHelper.success('Program archived');
      window.location.href = '/company/admin/programs';
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
      setConfirmArchive(false);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Programs" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Program Details" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-lg shadow-slate-200/60 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(115deg, #064e3b 0%, #065f46 40%, #047857 70%, #10b981 100%)' }}
            />
            <div className="pointer-events-none absolute -left-16 top-0 h-full w-56 -skew-x-12 bg-white/10" />
            <div className="pointer-events-none absolute left-24 top-0 h-full w-16 -skew-x-12 bg-white/10" />
            <div className="pointer-events-none absolute -bottom-14 -right-6 h-44 w-44 rounded-full border-[14px] border-white/15" />
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                  Program · {program.status}
                </p>
                <h2 className="mt-1 break-words text-xl font-bold text-white sm:text-3xl">{program.name}</h2>
                {program.description && (
                  <p className="mt-1 line-clamp-2 max-w-2xl break-words text-sm text-emerald-100/80">{program.description}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {enrolledInterns.length} intern(s)
                </span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {programProjects.length} project(s)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/programs" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Programs
              </Link>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[program.status] || 'bg-slate-100 text-slate-500'}`}>
                {program.status}
              </span>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              <Link
                href={`/company/admin/evaluations?programId=${programId}`}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <ClipboardCheck size={15} /> Evaluation
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Actions"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      {mode === 'view' ? (
                        <button
                          onClick={() => { setMenuOpen(false); setMode('edit'); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <PenLine size={14} /> Edit
                        </button>
                      ) : (
                        <button
                          onClick={() => { setMenuOpen(false); setMode('view'); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                        >
                          <X size={14} /> Cancel
                        </button>
                      )}
                      <button
                        onClick={() => { setMenuOpen(false); setConfirmArchive(true); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 size={14} /> Archive
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={18} className="text-emerald-500" /> Program Details
                </h3>

                {mode === 'view' ? (
                  <div className="mt-4 space-y-4">
                    <div>
<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Program Name</p>
<p className="mt-1 break-words text-sm font-medium text-slate-900">{program.name}</p>
                    </div>
                    {program.description && (
                      <div>
<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
<p className="mt-1 break-words text-sm text-slate-600">{program.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Start Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(program.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">End Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{program.endDate ? formatDate(program.endDate) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Max Interns</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {program.maxInterns ? program.maxInterns : 'Unlimited'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[program.status] || 'bg-slate-100 text-slate-500'}`}>
                          {program.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Program Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.name ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.name && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Program['status'])}
                      className="mt-2"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Max Interns</label>
                    <input
                      type="number"
                      min={1}
                      value={maxInterns}
                      onChange={(e) => setMaxInterns(e.target.value)}
                      placeholder="Unlimited"
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.maxInterns ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.maxInterns && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.maxInterns}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.startDate ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.startDate && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.startDate}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.endDate ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.endDate && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.endDate}</p>}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <Save size={15} /> {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setMode('view')}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
                </>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <FolderKanban size={18} className="text-emerald-500" /> Projects
                    <span className="text-sm font-normal text-slate-400">({programProjects.length})</span>
                  </h3>
                  <Link
                    href={`/company/admin/projects/new?programId=${programId}`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Plus size={13} /> New Project
                  </Link>
                </div>
                {loadingExtras ? (
                  <div className="mt-4 space-y-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : programProjects.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                    No projects in this program yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {programProjects.map((p) => {
                      const tasks = tasksByProject[p._id] || [];
                      const groups = broadcastsByProject[p._id] || [];
                      const totalCount = tasks.length + groups.length;
                      return (
                        <div
                          key={p._id}
                          className="overflow-hidden rounded-xl border border-slate-200"
                          style={{ background: `linear-gradient(to bottom, ${p.color || '#10b981'}14, #ffffff 55%)` }}
                        >
                          <div className="h-2 w-full" style={{ backgroundColor: p.color || '#10b981' }} />
                          <div className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <Link
                                  href={`/company/admin/projects/${p._id}`}
                                  className="block truncate text-sm font-semibold text-slate-900 hover:text-emerald-600 hover:underline"
                                >
                                  {p.name}
                                </Link>
                                {p.description && (
                                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{p.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 border-t border-slate-100 pt-3">
                              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                                <ListTodo size={13} /> Tasks ({totalCount})
                              </p>
                              {totalCount === 0 ? (
                                <p className="mt-2 text-xs text-slate-400">No tasks in this project yet.</p>
                              ) : (
                                <div className="mt-2 space-y-1.5">
                                  {groups.map((b) => {
                                    const theme = priorityTheme(b.priority);
                                    const done = b.members.filter((m) => m.status === 'complete').length;
                                    return (
                                      <button
                                        key={b.taskGroupId}
                                        onClick={() => openBroadcast(b.taskGroupId)}
                                        disabled={openingGroup === b.taskGroupId}
                                        className={`block w-full overflow-hidden rounded-lg border border-slate-200 ${theme.cardBg} text-left transition-shadow hover:shadow-sm disabled:opacity-60`}
                                      >
                                        <div className="h-1 w-full" style={{ backgroundColor: theme.banner }} />
                                        <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                                          <span className="flex min-w-0 items-center gap-2">
                                            <span className="truncate font-medium text-slate-700">{b.title}</span>
                                            <span className="shrink-0 text-[10px] text-slate-400">
                                              {done}/{b.members.length} done
                                            </span>
                                          </span>
                                          <span className="flex shrink-0 items-center gap-1.5">
                                            <span className="flex -space-x-1">
                                              {b.members.slice(0, 3).map((m) => (
                                                <InternAvatar
                                                  key={m.internId}
                                                  src={m.intern?.profilePicture}
                                                  firstName={m.intern?.firstName}
                                                  lastName={m.intern?.lastName}
                                                  email={m.intern?.email}
                                                  className="h-4 w-4 border border-white text-[6px]"
                                                />
                                              ))}
                                            </span>
                                            {openingGroup === b.taskGroupId ? (
                                              <Loader2 size={12} className="animate-spin text-slate-400" />
                                            ) : (
                                              <span className={`rounded-full px-1.5 py-px text-[10px] font-medium ${theme.chip}`}>
                                                Group
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                  {tasks.map((t) => {
                                    const theme = priorityTheme(t.priority);
                                    const iid = typeof t.internId === 'string' ? t.internId : ((t.internId as unknown as { _id?: string })?._id || '');
                                    return (
                                      <Link
                                        key={t._id}
                                        href={`/company/admin/tasks/${t._id}?internId=${iid}`}
                                        style={{ borderLeftColor: theme.banner }}
                                        className={`flex items-center justify-between gap-2 rounded-lg border border-slate-100 border-l-4 ${theme.cardBg} px-3 py-2 text-xs hover:shadow-sm`}
                                      >
                                        <span className="truncate font-medium text-slate-700">{t.title}</span>
                                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${theme.chip}`}>
                                          {t.status.replace('_', ' ')}
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <ListTodo size={18} className="text-emerald-500" /> Program Tasks
                    <span className="text-sm font-normal text-slate-400">({programDirectTasks.length + programLevelBroadcasts.length})</span>
                  </h3>
                  <Link
                    href={`/company/admin/tasks/new?programId=${programId}&target=program`}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Plus size={13} /> New Task
                  </Link>
                </div>
                {loadingExtras ? (
                  <div className="mt-4 space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : programDirectTasks.length === 0 && programLevelBroadcasts.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                    No tasks assigned directly to this program yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-1.5">
                    {programLevelBroadcasts.map((b) => {
                      const theme = priorityTheme(b.priority);
                      const done = b.members.filter((m) => m.status === 'complete').length;
                      return (
                        <button
                          key={b.taskGroupId}
                          onClick={() => openBroadcast(b.taskGroupId)}
                          disabled={openingGroup === b.taskGroupId}
                          className={`block w-full overflow-hidden rounded-xl border border-slate-100 ${theme.cardBg} text-left transition-shadow hover:shadow-sm disabled:opacity-60`}
                        >
                          <div className="h-1 w-full" style={{ backgroundColor: theme.banner }} />
                          <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                            <span className="min-w-0">
                              <span className="block truncate font-medium text-slate-800">
                                {b.title}
                                <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.chip}`}>
                                  Group · {b.members.length}
                                </span>
                              </span>
                              {b.description && (
                                <span className="block truncate text-xs text-slate-400">{b.description}</span>
                              )}
                            </span>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                              {done}/{b.members.length} done
                              {openingGroup === b.taskGroupId ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <span className="text-[10px] font-medium text-slate-300">
                                  {formatDate(b.dueDate)}
                                </span>
                              )}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {programDirectTasks.map((t) => {
                      const theme = priorityTheme(t.priority);
                      const iid = typeof t.internId === 'string' ? t.internId : ((t.internId as unknown as { _id?: string })?._id || '');
                      return (
                        <Link
                          key={t._id}
                          href={`/company/admin/tasks/${t._id}?internId=${iid}`}
                          style={{ borderLeftColor: theme.banner }}
                          className={`flex items-center justify-between gap-2 rounded-xl border border-slate-100 border-l-4 ${theme.cardBg} px-4 py-3 text-sm hover:shadow-sm`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-800">{t.title}</span>
                            {t.description && (
                              <span className="block truncate text-xs text-slate-400">{t.description}</span>
                            )}
                          </span>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${theme.chip}`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <ClipboardCheck size={18} className="text-emerald-500" /> Evaluation
                  </h3>
                  <Link
                    href={`/company/admin/evaluations?programId=${programId}`}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-600"
                  >
                    Open Evaluations
                  </Link>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Review performance, attendance and ratings for the {enrolledInterns.length} intern(s) in this program.
                </p>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users2 size={18} className="text-emerald-500" /> Enrolled Interns
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      {enrolledInterns.length}{program.maxInterns ? `/${program.maxInterns}` : ''}
                    </span>
                    <button
                      onClick={() => setShowEnroll((v) => !v)}
                      aria-label="Assign Interns"
                      className={`group flex items-center overflow-hidden rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        showEnroll ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      <Plus size={14} />
                      <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-1.5 group-hover:max-w-[120px] group-hover:opacity-100">
                        Assign Interns
                      </span>
                    </button>
                  </div>
                </div>

                {showEnroll && (
                  <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Internship</label>
                      <Select
                        value={selectedInternshipId}
                        onChange={(e) => handleInternshipSelect(e.target.value)}
                        placeholder="Select an internship..."
                        className="mt-2"
                      >
                        {internships.map((ip) => (
                          <option key={ip._id} value={ip._id}>{ip.title}</option>
                        ))}
                      </Select>
                      {internships.length === 0 && (
                        <p className="mt-2 text-xs text-slate-400">No active internships for this company yet.</p>
                      )}
                    </div>

                    {selectedInternshipId && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700">
                          Accepted Interns <span className="font-normal text-slate-400">({internshipStudents.length})</span>
                        </p>

                        {loadingStudents ? (
                          <div className="mt-2 space-y-2 animate-pulse">
                            {[0, 1, 2].map((i) => (
                              <div key={i} className="h-12 rounded-xl bg-slate-100" />
                            ))}
                          </div>
                        ) : internshipStudents.length === 0 ? (
                          <p className="mt-2 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                            No accepted interns in this internship yet.
                          </p>
                        ) : (
                          <div className="mt-2 space-y-1.5">
                            {internshipStudents.map((i) => {
                              const checked = selected.includes(i._id);
                              const alreadyAssigned = program.internIds.includes(i._id);
                              return (
                                <label
                                  key={i._id}
                                  className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                                    alreadyAssigned
                                      ? 'cursor-not-allowed border-slate-100 opacity-60'
                                      : `cursor-pointer ${checked ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 hover:bg-slate-50'}`
                                  }`}
                                >
<InternAvatar src={i.profilePicture?.secure_url} firstName={i.firstName} lastName={i.lastName} email={i.email} />
<div className="min-w-0 flex-1">
<p className="truncate text-sm font-medium text-slate-900">
{`${i.firstName} ${i.lastName}`.trim() || i.email}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">
                                      {i.email}{alreadyAssigned ? ' · Already assigned' : ''}
                                    </p>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={alreadyAssigned}
                                    onChange={() => toggleSelect(i._id)}
                                    className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-end gap-3">
                      <button
                        onClick={() => setShowEnroll(false)}
                        className="text-sm text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnroll}
                        disabled={enrolling || selected.length === 0}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        <Check size={15} /> {enrolling ? 'Assigning...' : `Assign ${selected.length}`}
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  {enrolledInterns.length === 0 ? (
                    <p className="text-sm text-slate-400">No interns enrolled yet.</p>
                  ) : (
enrolledInterns.map((i) => (
<div key={i._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
<Link href={`/company/admin/interns/${i._id}`} className="flex min-w-0 flex-1 items-center gap-3" title="View profile">
<InternAvatar src={i.profilePicture?.secure_url} firstName={i.firstName} lastName={i.lastName} email={i.email} />
<div className="min-w-0 flex-1">
<p className="truncate text-sm font-medium text-slate-900 hover:text-emerald-600 hover:underline">
{`${i.firstName} ${i.lastName}`.trim() || i.email}
</p>
<p className="truncate text-xs text-slate-400">{i.email}</p>
</div>
</Link>
                        <button
                          onClick={() => handleUnenroll(i._id)}
                          disabled={unenrollingId === i._id}
                          aria-label={`Remove ${i.firstName}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Calendar size={18} className="text-emerald-500" /> Timeline
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Start</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.startDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">End</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.endDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.createdAt)}</dd>
                  </div>
                </dl>
              </section>

              <ProgramAttendanceSection
                companyId={companyId}
                programId={programId}
                program={program}
                interns={enrolledInterns}
              />
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={confirmArchive}
        title="Archive this program?"
        message="Archived programs will no longer appear as active. This can be reversed later."
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}