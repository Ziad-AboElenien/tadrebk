'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Users2,
  Trash2,
  Save,
  X,
  Plus,
  Check,
  FolderKanban,
  Palette,
  Paperclip,
  UploadCloud,
PenLine,
MoreHorizontal,
ListTodo,
Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InternAvatar from '@/components/ui/InternAvatar';
import Select from '@/components/ui/Select';
import { projectService } from '@/features/company/services/project.service';
import { programService } from '@/features/company/services/program.service';
import { internService } from '@/features/company/services/intern.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import { Project, Program, Intern, Task } from '@/features/company/types/management';
import { taskService, BroadcastCard } from '@/features/company/services/task.service';
import { priorityTheme } from '@/features/company/utils/taskPriorityTheme';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

const STATUS_OPTIONS: Project['status'][] = ['active', 'completed', 'archived'];

const COLOR_OPTIONS: { key: string; name: string; cls: string }[] = [
  { key: '#10B981', name: 'Emerald', cls: 'bg-emerald-500' },
  { key: '#3B82F6', name: 'Blue', cls: 'bg-blue-500' },
  { key: '#8B5CF6', name: 'Violet', cls: 'bg-violet-500' },
  { key: '#F59E0B', name: 'Amber', cls: 'bg-amber-400' },
  { key: '#EF4444', name: 'Rose', cls: 'bg-rose-500' },
];

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

export default function ProjectDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [project, setProject] = useState<Project | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const searchParams = useSearchParams();
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchParams.get('mode') === 'edit') setMode('edit');
    }, 0);
    return () => clearTimeout(t);
  }, [searchParams]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Project['status']>('active');
  const [programId, setProgramId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#10B981');
  const [savingEdit, setSavingEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showAssign, setShowAssign] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [removingId, setRemovingId] = useState('');
  const [assignProgramId, setAssignProgramId] = useState('');
  const [programAssignInterns, setProgramAssignInterns] = useState<Intern[]>([]);
  const [loadingAssignInterns, setLoadingAssignInterns] = useState(false);

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [projectBroadcasts, setProjectBroadcasts] = useState<BroadcastCard[]>([]);
  const [loadingProjectTasks, setLoadingProjectTasks] = useState(true);
  const [openingGroup, setOpeningGroup] = useState('');

  const fetchProjectTasks = useCallback(async () => {
    if (!companyId || !projectId) return;
    setLoadingProjectTasks(true);
    try {
      const [taskRes, bcRes] = await Promise.all([
        taskService.listTasks(companyId, { limit: 100 }),
        taskService.listBroadcasts(companyId, { projectId, limit: 100 }),
      ]);
      setProjectTasks(taskRes.tasks.filter((t) => t.projectId === projectId && !t.taskGroupId));
      setProjectBroadcasts(bcRes.broadcasts);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoadingProjectTasks(false);
    }
  }, [companyId, projectId]);

  useEffect(() => {
    const t = setTimeout(fetchProjectTasks, 0);
    return () => clearTimeout(t);
  }, [fetchProjectTasks]);

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

  const fetchProject = useCallback(async () => {
    if (!companyId || !projectId) return;
    setLoading(true);
    try {
      const [projRes, progRes, internRes, internships] = await Promise.all([
        projectService.getProject(companyId, projectId),
        programService.listPrograms(companyId, { limit: 100 }),
        internService.listInterns(companyId, { limit: 100 }),
        internshipService.listInternships({ companyId, limit: 100 }).catch(() => ({
          internships: [],
          pagination: { page: 1, limit: 0, total: 0, pages: 0 },
        })),
      ]);

      const merged = new Map<string, Intern>();
      internRes.data.forEach((i) => merged.set(i._id, i));
      for (const ip of internships.internships) {
        try {
          const apps = await applicationService.getCompanyApplications(companyId, ip._id, {
            status: 'accepted',
            limit: 200,
          });
          for (const a of apps.applications) {
            const s = a.studentId;
            if (!s?._id || merged.has(s._id)) continue;
            merged.set(s._id, {
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

      setProject(projRes);
      setPrograms(progRes.data);
      setInterns(Array.from(merged.values()));
      setName(projRes.name);
      setDescription(projRes.description ?? '');
      setStatus(projRes.status ?? 'active');
      setProgramId(projRes.programId ?? '');
      setStartDate(projRes.startDate ? projRes.startDate.slice(0, 10) : '');
      setEndDate(projRes.endDate ? projRes.endDate.slice(0, 10) : '');
      setColor(projRes.color ?? '#10B981');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, projectId]);

  useEffect(() => {
    const t = setTimeout(fetchProject, 0);
    return () => clearTimeout(t);
  }, [fetchProject]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Projects" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Project Details" />
        <main className="flex-1 space-y-6 px-[2.5%] py-4 sm:p-6 lg:p-8 animate-pulse">
          <div className="h-36 rounded-2xl bg-slate-200 sm:h-44" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-48 rounded-2xl border border-slate-200 bg-white" />
            </div>
            <div className="space-y-6">
              <div className="h-56 rounded-2xl border border-slate-200 bg-white" />
              <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
            </div>
          </div>
        </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Projects" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Project Details" />
          <div className="py-20 text-center text-sm text-slate-400">Project not found.</div>
        </div>
      </div>
    );
  }

  const program = programId ? programs.find((p) => p._id === programId) : undefined;
  const assignedInterns = interns.filter((i) => (project.internIds ?? []).includes(i._id));
  const availableInterns = interns.filter((i) => !(project.internIds ?? []).includes(i._id));
  const activePrograms = programs.filter((p) => p.status === 'active');
  const assignCandidates = assignProgramId ? programAssignInterns : availableInterns;

  const handleSaveEdit = async () => {
    if (!companyId) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Project name is required.';
    if (endDate && startDate && endDate < startDate) errs.endDate = 'End date cannot be before start date.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingEdit(true);
    try {
      const updated = await projectService.updateProject(companyId, projectId, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        programId: programId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        color,
      });
      setProject(updated);
      setMode('view');
      toastHelper.success('Project updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleSelect = (internId: string) =>
    setSelected((prev) => (prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]));

  const handleAssignProgramChange = async (programId: string) => {
    if (!companyId) return;
    setAssignProgramId(programId);
    setSelected([]);
    setProgramAssignInterns([]);
    if (!programId) return;
    setLoadingAssignInterns(true);
    try {
      const res = await internService.listInterns(companyId, { limit: 100, programId });
      setProgramAssignInterns(res.data);
    } catch {
      setProgramAssignInterns([]);
    } finally {
      setLoadingAssignInterns(false);
    }
  };

  const handleAssign = async () => {
    if (!companyId) return;
    if (selected.length === 0) {
      toastHelper.error('Select at least one intern to assign.');
      return;
    }
    setAssigning(true);
    try {
      await projectService.assignInterns(companyId, projectId, selected);
      setShowAssign(false);
      setSelected([]);
      await fetchProject();
      toastHelper.success(`${selected.length} intern(s) assigned`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (internId: string) => {
    if (!companyId) return;
    setRemovingId(internId);
    try {
      const remaining = (project.internIds ?? []).filter((id) => id !== internId);
      await projectService.assignInterns(companyId, projectId, remaining);
      await fetchProject();
      toastHelper.success('Intern removed from project');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setRemovingId('');
    }
  };

  const handleArchive = async () => {
    if (!companyId) return;
    setArchiving(true);
    try {
      await projectService.archiveProject(companyId, projectId);
      toastHelper.success('Project archived');
      window.location.href = '/company/admin/projects';
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
      setConfirmArchive(false);
    } finally {
      setArchiving(false);
    }
  };

  const handleUploadAttachment = async () => {
    if (!companyId || !attachmentFile) return;
    setUploadingAttachment(true);
    try {
      const updated = await projectService.uploadAttachment(companyId, projectId, attachmentFile);
      setProject(updated);
      setAttachmentFile(null);
      toastHelper.success('Attachment uploaded');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setUploadingAttachment(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Projects" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Project Details" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div
            className="relative overflow-hidden rounded-2xl p-6 shadow-lg shadow-slate-200/60 sm:p-8"
            style={{ background: `linear-gradient(120deg, ${project.color ?? '#10B981'} 0%, ${project.color ?? '#10B981'}b3 55%, ${project.color ?? '#10B981'}80 100%)` }}
          >
            <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute -left-8 bottom-0 h-28 w-28 rounded-full border-[10px] border-white/15" />
            <div className="pointer-events-none absolute right-16 top-1/2 hidden h-24 w-24 -translate-y-1/2 rotate-12 rounded-2xl border-[6px] border-white/15 sm:block" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
            />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/25 text-white shadow-lg backdrop-blur-sm">
                  <FolderKanban size={26} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold uppercase tracking-widest text-white/80">
                    Project{program ? ` · ${program.name}` : ''}
                  </p>
                  <h2 className="break-words text-xl font-bold text-white sm:text-3xl">{project.name}</h2>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize text-white backdrop-blur">
                  {project.status}
                </span>
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {assignedInterns.length} intern(s)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/projects" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Projects
              </Link>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
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
                  <FileText size={18} className="text-emerald-500" /> Project Details
                </h3>

                {mode === 'view' ? (
                  <div className="mt-4 space-y-5">
                    <div>
<p className="text-xs font-medium uppercase tracking-wide text-slate-400">Project Name</p>
<p className="mt-1 break-words text-sm font-medium text-slate-900">{project.name}</p>
                    </div>
                    {project.description && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
                        <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{project.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[project.status] || 'bg-slate-100 text-slate-500'}`}>
                          {project.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Associated Program</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{program ? program.name : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Start Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(project.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">End Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(project.endDate)}</p>
                      </div>
                      {project.color && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Project Color</p>
                          <span
                            className="mt-1 inline-block h-6 w-6 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                <>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Project Name</label>
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
                      onChange={(e) => setStatus(e.target.value as Project['status'])}
                      className="mt-2"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Associated Program</label>
                    <Select
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
                      className="mt-2"
                    >
                      <option value="">No program...</option>
                      {programs.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
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

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Palette size={15} className="text-slate-400" /> Project Color
                    </label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          onClick={() => setColor(c.key)}
                          aria-label={c.name}
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${c.cls} ${
                            color === c.key ? 'ring-2 ring-slate-900 ring-offset-2' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          {color === c.key && <Check size={16} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                  className="mt-5 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  <Save size={15} /> {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                </>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <ListTodo size={18} className="text-emerald-500" /> Project Tasks
                    <span className="text-sm font-normal text-slate-400">
                      ({projectBroadcasts.length + projectTasks.length})
                    </span>
                  </h3>
                  <Link
                    href="/company/admin/tasks/new"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Plus size={13} /> New Task
                  </Link>
                </div>
                {loadingProjectTasks ? (
                  <div className="mt-4 space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : projectBroadcasts.length === 0 && projectTasks.length === 0 ? (
                  <p className="mt-4 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
                    No tasks in this project yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-1.5">
                    {projectBroadcasts.map((b) => {
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
                              {openingGroup === b.taskGroupId && <Loader2 size={13} className="animate-spin" />}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                    {projectTasks.map((t) => {
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
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users2 size={18} className="text-emerald-500" /> Assigned Interns
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                      {assignedInterns.length}
                    </span>
                    <button
                      onClick={() => {
                        setShowAssign((v) => !v);
                        setAssignProgramId('');
                        setProgramAssignInterns([]);
                        setSelected([]);
                      }}
                      className={`group flex items-center overflow-hidden rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        showAssign ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                    >
                      <Plus size={14} />
                      <span className="ml-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:ml-1.5 group-hover:max-w-[120px] group-hover:opacity-100">
                        Assign Interns
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {assignedInterns.length === 0 ? (
                    <p className="text-sm text-slate-400">No interns assigned yet.</p>
                  ) : (
assignedInterns.map((i) => (
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
                          onClick={() => handleRemove(i._id)}
                          disabled={removingId === i._id}
                          aria-label={`Remove ${i.firstName}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {showAssign && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                    <p className="text-sm font-medium text-slate-700">Add interns to “{project.name}”</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Pick an active program to load its assigned interns, or leave it empty to browse all company interns.
                    </p>

                    <div className="mt-3">
                      <label className="text-sm font-medium text-slate-700">Active Program</label>
                      <Select
                        value={assignProgramId}
                        onChange={(e) => handleAssignProgramChange(e.target.value)}
                        placeholder="All company interns..."
                        className="mt-2"
                      >
                        <option value="">All company interns...</option>
                        {activePrograms.map((pg) => (
                          <option key={pg._id} value={pg._id}>{pg.name}</option>
                        ))}
                      </Select>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      {loadingAssignInterns ? (
                        <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-400 animate-pulse">
                          Loading interns...
                        </p>
                      ) : assignCandidates.length === 0 ? (
                        <p className="rounded-lg bg-white p-4 text-center text-sm text-slate-400">
                          {assignProgramId ? 'No assigned interns found for this program.' : 'All interns are already assigned.'}
                        </p>
                      ) : (
                        assignCandidates.map((i) => {
                          const checked = selected.includes(i._id);
                          return (
                            <label
                              key={i._id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3 transition-colors ${
                                checked ? 'border-emerald-300 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'
                              }`}
                            >
<InternAvatar src={i.profilePicture?.secure_url} firstName={i.firstName} lastName={i.lastName} email={i.email} />
<div className="min-w-0 flex-1">
<p className="truncate text-sm font-medium text-slate-900">
{`${i.firstName} ${i.lastName}`.trim() || i.email}
                                </p>
                                <p className="truncate text-xs text-slate-400">{i.email}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleSelect(i._id)}
                                className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                              />
                            </label>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setShowAssign(false);
                          setAssignProgramId('');
                          setProgramAssignInterns([]);
                          setSelected([]);
                        }}
                        className="text-sm text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAssign}
                        disabled={assigning || selected.length === 0}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        <Check size={15} /> {assigning ? 'Assigning...' : `Assign ${selected.length}`}
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Paperclip size={18} className="text-emerald-500" /> Attachment
                </h3>
                {project.attachment ? (
                  <a
                    href={project.attachment.secure_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-700 hover:text-emerald-600"
                  >
                    <FileText size={14} className="shrink-0 text-slate-400" />
                    <span className="truncate">{project.attachment.name || 'Attachment'}</span>
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No attachment uploaded.</p>
                )}
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-6 text-center">
                  <UploadCloud size={22} className="text-emerald-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {attachmentFile ? attachmentFile.name : 'Upload / replace file'}
                  </p>
                  <p className="text-xs text-slate-400">Max 10MB (PDF, DOC, ZIP)</p>
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.zip,.jpg,.png"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                {attachmentFile && (
                  <button
                    onClick={handleUploadAttachment}
                    disabled={uploadingAttachment}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <UploadCloud size={15} /> {uploadingAttachment ? 'Uploading...' : 'Upload attachment'}
                  </button>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FolderKanban size={18} className="text-emerald-500" /> Overview
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Program</dt>
                    <dd className="truncate pl-4 font-medium text-slate-900">{program ? program.name : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Start</dt>
                    <dd className="font-medium text-slate-900">{formatDate(project.startDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">End</dt>
                    <dd className="font-medium text-slate-900">{formatDate(project.endDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="font-medium text-slate-900">{formatDate(project.createdAt)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={confirmArchive}
        title="Archive this project?"
        message="Archived projects will no longer appear as active. This can be reversed later."
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}