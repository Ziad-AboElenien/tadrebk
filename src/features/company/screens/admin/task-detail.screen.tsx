'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Paperclip,
  FileText,
  Filter,
  UploadCloud,
  X,
  Trash2,
  CheckCircle2,
  Save,
  Send,
  Layers,
  Users2,
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import InternAvatar from '@/components/ui/InternAvatar';
import { priorityTheme } from '@/features/company/utils/taskPriorityTheme';
import Select from '@/components/ui/Select';
import { taskService } from '@/features/company/services/task.service';
import { internService } from '@/features/company/services/intern.service';
import { projectService } from '@/features/company/services/project.service';
import {
  Task,
  TaskStatus,
  TaskPriority,
  Intern,
  Project,
} from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import { parseFeedbackThread } from '@/features/intern/utils/student-task';

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  complete: 'Complete',
  archived: 'Archived',
};

const STATUS_CHIP: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-500',
  in_progress: 'bg-amber-50 text-amber-600',
  in_review: 'bg-blue-50 text-blue-600',
  complete: 'bg-emerald-50 text-emerald-600',
  archived: 'bg-slate-100 text-slate-400',
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-rose-50 text-rose-500',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

const NEXT_STATUSES: Partial<Record<TaskStatus, { to: TaskStatus; label: string }[]>> = {
  todo: [
    { to: 'in_progress', label: 'Move to In Progress' },
    { to: 'complete', label: 'Mark Complete' },
  ],
  in_progress: [
    { to: 'in_review', label: 'Send to Review' },
    { to: 'complete', label: 'Mark Complete' },
  ],
  in_review: [
    { to: 'complete', label: 'Mark Complete' },
    { to: 'in_progress', label: 'Send Back to Progress' },
  ],
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/** Join first/last name without repeating a duplicated part (bad data shows "Ziad Elsayed Ziad Elsayed"). */
function displayInternName(firstName?: string | null, lastName?: string | null, email?: string | null): string {
  const first = (firstName || '').trim();
  const last = (lastName || '').trim();
  if (first && first.toLowerCase() === last.toLowerCase()) return first;
  const words = `${first} ${last}`.trim().split(/\s+/).filter(Boolean);
  const deduped = words.filter((w, i) => w.toLowerCase() !== (words[i - 1] || '').toLowerCase());
  return deduped.join(' ') || email || '';
}

const SUGGESTED_TAGS = ['Programming', 'Design', 'Documentation', 'Research', 'QA Testing'];

export default function TaskDetailScreen() {
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = params.taskId as string;
  const focusedInternId = searchParams.get('internId') || '';
  const groupId = searchParams.get('groupId') || '';
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [task, setTask] = useState<Task | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [groupRows, setGroupRows] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [feedback, setFeedback] = useState('');
  const [savingFeedback, setSavingFeedback] = useState(false);

  const [points, setPoints] = useState('');
  const [transitioningTo, setTransitioningTo] = useState<TaskStatus | ''>('');

  const [files, setFiles] = useState<File[]>([]);
  const [addingFiles, setAddingFiles] = useState(false);
  const [removingId, setRemovingId] = useState('');

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkPanelRef = useRef<HTMLElement>(null);
  const [bulkTitle, setBulkTitle] = useState('');
  // Assigned-students panel: submitted-only filter + bulk feedback selection
  const [submittedOnly, setSubmittedOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkFb, setBulkFb] = useState('');
  const [bulkPoints, setBulkPoints] = useState('');
  const [savingBulkFb, setSavingBulkFb] = useState(false);
  const [bulkDescription, setBulkDescription] = useState('');
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | ''>('');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [savingBulk, setSavingBulk] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});

  const applyTask = (t: Task) => {
    setTask(t);
    setTitle(t.title);
    setDescription(t.description ?? '');
    setPriority(t.priority ?? 'medium');
    setTags(t.tags ?? []);
    setDueDate(t.dueDate ? t.dueDate.slice(0, 10) : '');
    setFeedback(t.reviewerFeedback ?? '');
  };

  const fetchTask = useCallback(async () => {
    if (!companyId || !taskId) return;
    setLoading(true);
    try {
      if (groupId) {
        const [groupRes, internRes, projRes] = await Promise.all([
          taskService.listByGroup(companyId, groupId),
          internService.listInterns(companyId, { limit: 100 }),
          projectService.listProjects(companyId, { limit: 100 }),
        ]);
        const rows = groupRes.tasks;
        setGroupRows(rows);
        setInterns(internRes.data);
        setProjects(projRes.data);
        const rowIdOf = (v: unknown): string =>
          typeof v === 'string' ? v : ((v as { _id?: unknown } | null)?._id as string) || '';
        const initial = (focusedInternId && rows.find((t) => rowIdOf(t.internId) === focusedInternId)) || rows[0] || null;
        if (initial) applyTask(initial);
        else setTask(null);
      } else {
        const [taskRes, internRes, projRes] = await Promise.all([
          taskService.getTask(companyId, taskId),
          internService.listInterns(companyId, { limit: 100 }),
          projectService.listProjects(companyId, { limit: 100 }),
        ]);
        applyTask(taskRes);
        setInterns(internRes.data);
        setProjects(projRes.data);
        setGroupRows([]);
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, taskId, groupId, focusedInternId]);

  useEffect(() => {
    const t = setTimeout(fetchTask, 0);
    return () => clearTimeout(t);
  }, [fetchTask]);

  useEffect(() => {
    if (bulkOpen) {
      const t = setTimeout(() => bulkPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      return () => clearTimeout(t);
    }
  }, [bulkOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Tasks" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Task Details" />
          <main className="flex-1 space-y-6 px-[2.5%] py-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="h-32 rounded-2xl bg-slate-200 sm:h-36" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="h-64 rounded-2xl border border-slate-200 bg-white" />
                <div className="h-40 rounded-2xl border border-slate-200 bg-white" />
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

  if (!task) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Tasks" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Task Details" />
          <div className="py-20 text-center text-sm text-slate-400">Task not found.</div>
        </div>
      </div>
    );
  }

  const rowInternId = (v: unknown): string =>
    typeof v === 'string' ? v : ((v as { _id?: unknown } | null)?._id as string) || '';
  const intern = interns.find((i) => i._id === rowInternId(task.internId));
  // In group mode the actions below must target the selected row, not the URL taskId.
  const activeTaskId = task._id || taskId;
  const project = task.projectId ? projects.find((p) => p._id === task.projectId) : undefined;
  const nexts = NEXT_STATUSES[task.status] ?? [];
  const isGroup = Boolean(task.taskGroupId);

  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const addTag = (tag: string) => !tags.includes(tag) && setTags((t) => [...t, tag]);
  const syncGroupRow = (updated: Task) => {
    setTask(updated);
    setGroupRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files).slice(0, 10));
  };

  const renderSubmission = (visibilityClass: string) => (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 ${visibilityClass}`}>
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Clock size={18} className="text-emerald-500" /> Submission Progress
      </h3>
      <div className="mt-4 space-y-0">
        {[
          { label: 'Created', date: task.createdAt, done: true },
          { label: 'Submitted by intern', date: task.submittedAt, done: !!task.submittedAt },
          {
            label: task.pointsAwarded != null ? `Reviewed · ${task.pointsAwarded}/10` : 'Reviewed',
            date: task.reviewedAt,
            done: !!task.reviewedAt,
          },
        ].map((s, i, arr) => (
          <div key={s.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${s.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {s.done ? <CheckCircle2 size={13} /> : <Clock size={13} />}
              </span>
              {i < arr.length - 1 && <span className={`h-6 w-px ${s.done ? 'bg-emerald-200' : 'bg-slate-100'}`} />}
            </div>
            <div className="pb-5">
              <p className={`text-sm font-medium ${s.done ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
              <p className="text-xs text-slate-400">{s.date ? formatDate(s.date) : 'Pending'}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderAttachments = (visibilityClass: string) => (
    <section className={`rounded-2xl border border-slate-200 bg-white p-6 ${visibilityClass}`}>
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Paperclip size={18} className="text-emerald-500" /> Attachments
      </h3>

      <div className="mt-4 space-y-2">
        {(task.attachments ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No attachments yet.</p>
        ) : (
          (task.attachments ?? []).map((att) => (
            <div key={att.public_id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
              <a href={att.secure_url} target="_blank" rel="noreferrer" className="flex min-w-0 items-center gap-2 text-slate-700 hover:text-emerald-600">
                <Paperclip size={14} className="shrink-0 text-slate-400" />
                <span className="truncate">{att.name || 'Attachment'}</span>
                {att.size ? <span className="shrink-0 text-xs text-slate-400">{formatBytes(att.size)}</span> : null}
              </a>
              <button
                onClick={() => handleRemoveAttachment(att.public_id)}
                disabled={removingId === att.public_id}
                aria-label={`Remove ${att.name || 'attachment'}`}
                className="ml-3 shrink-0 text-slate-400 hover:text-rose-500"
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
        <UploadCloud size={24} className="text-emerald-400" />
        <p className="mt-2 text-sm font-medium text-slate-700">Add more files</p>
        <p className="text-xs text-slate-400">Maximum file size 10MB (PDF, JPG, PNG)</p>
        <input type="file" multiple hidden onChange={handleFiles} />
      </label>
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <span className="truncate text-slate-600">{f.name}</span>
              <button onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))} aria-label={`Remove ${f.name}`}>
                <X size={14} className="text-slate-400 hover:text-rose-500" />
              </button>
            </div>
          ))}
          <button
            onClick={handleAddFiles}
            disabled={addingFiles}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {addingFiles ? 'Uploading...' : `Attach ${files.length} file(s)`}
          </button>
        </div>
      )}
    </section>
  );

  const handleSaveEdit = async () => {
    if (!companyId) return;
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Task title is required.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingEdit(true);
    try {
      const updated = await taskService.updateTask(companyId, activeTaskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags,
        dueDate: dueDate || undefined,
      });
      syncGroupRow(updated);
      setEditing(false);
      toastHelper.success('Task updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTransition = async (to: TaskStatus) => {
    if (!companyId || !to) return;
    setTransitioningTo(to);
    try {
      const updated = await taskService.transitionTask(companyId, activeTaskId, {
        to,
        reviewerFeedback: feedback.trim() || undefined,
        pointsAwarded: to === 'complete' && points ? Math.min(10, Math.max(0, Number(points))) : undefined,
      });
      syncGroupRow(updated);
      toastHelper.success(`Task moved to ${STATUS_LABEL[to]}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setTransitioningTo('');
    }
  };

  const handleSaveFeedback = async () => {
    if (!companyId) return;
    setSavingFeedback(true);
    try {
      const updated = await taskService.saveFeedback(companyId, activeTaskId, feedback.trim());
      syncGroupRow(updated);
      toastHelper.success('Feedback saved');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingFeedback(false);
    }
  };

  const handleBulkFeedback = async () => {
    if (!companyId || !groupId || selectedIds.length === 0) return;
    const fb = bulkFb.trim();
    const pts = bulkPoints ? Math.min(10, Math.max(0, Number(bulkPoints))) : undefined;
    if (!fb && pts === undefined) {
      toastHelper.error('Write feedback or set points first.');
      return;
    }
    setSavingBulkFb(true);
    try {
      const results = await Promise.all(
        selectedIds.map(async (id) => {
          const row = groupRows.find((r) => r._id === id);
          if (!row || row.status === 'archived') return null;
          if (row.status !== 'complete') {
            return taskService.transitionTask(companyId, id, {
              to: 'complete',
              reviewerFeedback: fb || undefined,
              pointsAwarded: pts,
            });
          }
          if (fb) return taskService.saveFeedback(companyId, id, fb);
          return null;
        }),
      );
      const updated = results.filter((r): r is Task => r !== null);
      if (updated.length > 0) {
        setGroupRows((prev) => prev.map((r) => updated.find((u) => u._id === r._id) ?? r));
        const current = updated.find((u) => u._id === activeTaskId);
        if (current) applyTask(current);
        toastHelper.success(`Feedback sent to ${updated.length} student${updated.length > 1 ? 's' : ''}`);
      }
      setSelectedIds([]);
      setBulkFb('');
      setBulkPoints('');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingBulkFb(false);
    }
  };

  const handleAddFiles = async () => {
    if (!companyId) return;
    if (files.length === 0) {
      toastHelper.error('Choose files to attach first.');
      return;
    }
    setAddingFiles(true);
    try {
      const updated = await taskService.addAttachments(companyId, activeTaskId, files);
      syncGroupRow(updated);
      setFiles([]);
      toastHelper.success('Attachments added');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setAddingFiles(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!companyId) return;
    setRemovingId(attachmentId);
    try {
      const updated = await taskService.removeAttachment(companyId, activeTaskId, attachmentId);
      syncGroupRow(updated);
      toastHelper.success('Attachment removed');
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
      await taskService.archiveTask(companyId, activeTaskId);
      toastHelper.success('Task archived');
      window.location.href = '/company/admin/tasks';
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
      setConfirmArchive(false);
    } finally {
      setArchiving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!companyId || !task?.taskGroupId) return;
    const payload: { title?: string; description?: string; priority?: TaskPriority; dueDate?: string } = {};
    if (bulkTitle.trim()) payload.title = bulkTitle.trim();
    if (bulkDescription.trim()) payload.description = bulkDescription.trim();
    if (bulkPriority) payload.priority = bulkPriority;
    if (bulkDueDate) payload.dueDate = bulkDueDate;
    const errs: Record<string, string> = {};
    if (Object.keys(payload).length === 0) errs.bulk = 'Change at least one field to update.';
    setBulkErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingBulk(true);
    try {
      const res = await taskService.bulkUpdateByGroup(companyId, task.taskGroupId, payload);
      toastHelper.success(`Group updated — ${res.modified ?? 0} task(s) modified`);
      setBulkOpen(false);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingBulk(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Task Details" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          {(() => {
            const theme = priorityTheme(task.priority);
            return (
              <div
                className="relative overflow-hidden rounded-2xl p-6 text-white"
                style={{ background: `linear-gradient(120deg, ${theme.banner} 0%, ${theme.banner}cc 55%, ${theme.banner}99 100%)` }}
              >
                <div className="pointer-events-none absolute -left-10 top-0 h-full w-40 -skew-x-12 bg-white/15" />
                <div className="pointer-events-none absolute left-24 top-0 h-full w-10 -skew-x-12 bg-white/10" />
                <div className="pointer-events-none absolute -bottom-16 right-10 h-44 w-44 rounded-full border-[12px] border-white/20" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.85) 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />
                <div className="relative flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
                      {task.priority ? `${task.priority} priority` : 'Task'}
                      {groupId && groupRows.length > 0 ? ` · ${groupRows.length} member(s)` : ''}
                    </p>
                    <h2 className="mt-1 break-words text-xl font-bold sm:text-2xl">{task.title}</h2>
                  </div>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold capitalize backdrop-blur">
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })()}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/tasks" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Board
              </Link>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CHIP[task.status]}`}>
                {STATUS_LABEL[task.status]}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[task.priority] || 'bg-slate-100 text-slate-500'}`}>
                {task.priority?.toUpperCase()}
              </span>
            </div>
            <div className="relative flex flex-wrap items-center gap-3">
              {nexts.map((n) => (
                <button
                  key={n.to}
                  onClick={() => handleTransition(n.to)}
                  disabled={Boolean(transitioningTo)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  <CheckCircle2 size={16} /> {transitioningTo === n.to ? 'Moving...' : n.label}
                </button>
              ))}
              <button
                onClick={() => setActionsOpen((o) => !o)}
                aria-label="More actions"
                aria-expanded={actionsOpen}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50"
              >
                <MoreHorizontal size={16} />
              </button>
              {actionsOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setActionsOpen(false)} />
                  <div className="absolute right-0 top-full z-40 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                    {isGroup && (
                      <button
                        onClick={() => {
                          setActionsOpen(false);
                          setBulkErrors({});
                          setBulkOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                      >
                        <Layers size={14} /> Update Group
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActionsOpen(false);
                        setConfirmArchive(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
                    >
                      <Trash2 size={14} /> Archive Task
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                {!editing ? (
                  <>
<div className="flex items-start justify-between gap-3">
<div className="min-w-0">
<h3 className="break-words text-lg font-semibold text-slate-900">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Created {formatDate(task.createdAt)}
                          {task.submittedAt ? ` · Submitted ${formatDate(task.submittedAt)}` : ''}
                          {task.reviewedAt ? ` · Reviewed ${formatDate(task.reviewedAt)}` : ''}
                        </p>
                      </div>
                      <button onClick={() => { setEditing(true); setFieldErrors({}); }} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        <Save size={15} /> Edit
                      </button>
                    </div>
                    {task.description && (
<p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">
{task.description}
</p>
                    )}
                    {(task.tags || []).length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {task.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-4">
                      <div>
                        <dt className="text-xs text-slate-400">DUE DATE</dt>
                        <dd className="mt-1 flex items-center gap-1.5 font-medium text-slate-900">
                          <Calendar size={13} className="text-slate-400" /> {formatDate(task.dueDate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">ASSIGNED TO</dt>
                        <dd className="mt-1 font-medium text-slate-900">
                          {intern ? `${intern.firstName} ${intern.lastName}`.trim() : '—'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">PROJECT</dt>
                        <dd className="mt-1 truncate font-medium text-slate-900">{project ? project.name : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">POINTS</dt>
                        <dd className="mt-1 font-medium text-emerald-600">
                          {task.pointsAwarded != null ? `${task.pointsAwarded} pts` : '—'}
                        </dd>
                      </div>
                    </dl>
                  </>
                ) : (
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                        <FileText size={18} className="text-emerald-500" /> Edit Task
                      </h3>
                      <button onClick={() => setEditing(false)} className="text-sm text-slate-400 hover:text-slate-600">
                        Cancel edit
                      </button>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-slate-700">Task Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                          fieldErrors.title ? 'border-rose-400' : 'border-slate-200'
                        }`}
                      />
                      {fieldErrors.title && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.title}</p>}
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-slate-700">Detailed Description</label>
                      <textarea
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Due Date</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Priority</label>
                        <div className="mt-2 flex gap-2">
                          {(['low', 'medium', 'high'] as const).map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(p)}
                              className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 ${
                                p === 'high'
                                  ? 'bg-rose-50 text-rose-500 ring-rose-200'
                                  : p === 'medium'
                                    ? 'bg-amber-50 text-amber-600 ring-amber-200'
                                    : 'bg-emerald-50 text-emerald-600 ring-emerald-200'
                              } ${priority === p ? 'ring-2' : 'ring-1'}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-sm font-medium text-slate-700">Tags</label>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a tag..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                              e.preventDefault();
                              addTag((e.target as HTMLInputElement).value.trim());
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                            {tag}
                            <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTag(tag)}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 hover:bg-slate-200"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <button
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </section>

          {groupId && groupRows.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Users2 size={18} className="text-emerald-500" /> Assigned Students
                  <span className="text-sm font-normal text-slate-400">({groupRows.length})</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedOnly((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      submittedOnly
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Filter size={12} /> Submitted only
                  </button>
                  {(() => {
                    const visible = submittedOnly ? groupRows.filter((r) => r.submittedAt) : groupRows;
                    const selectable = visible.filter((r) => r.status !== 'archived');
                    const allChecked = selectable.length > 0 && selectable.every((r) => selectedIds.includes(r._id));
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedIds(allChecked ? [] : selectable.map((r) => r._id))
                        }
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50"
                      >
                        {allChecked ? 'Deselect all' : `Select all (${selectable.length})`}
                      </button>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(submittedOnly ? groupRows.filter((r) => r.submittedAt) : groupRows).map((r) => {
                  const iid = rowInternId(r.internId);
                  const f = interns.find((i) => i._id === iid);
                  const selected = r._id === task._id;
                  const checked = selectedIds.includes(r._id);
                  const name = f ? displayInternName(f.firstName, f.lastName, f.email) : iid.slice(-6).toUpperCase();
                  return (
                    <div
                      key={r._id}
                      className={`flex items-center gap-2.5 rounded-xl border p-3 transition-colors ${
                        selected
                          ? 'border-emerald-300 bg-emerald-50/50'
                          : checked
                            ? 'border-blue-200 bg-blue-50/40'
                            : 'border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={r.status === 'archived'}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            checked ? prev.filter((id) => id !== r._id) : [...prev, r._id],
                          )
                        }
                        aria-label={`Select ${name}`}
                        className="h-4 w-4 shrink-0 accent-emerald-500"
                      />
                      <button
                        onClick={() => applyTask(r)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <InternAvatar
                          src={f?.profilePicture?.secure_url}
                          firstName={f?.firstName}
                          lastName={f?.lastName}
                          email={f?.email}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-800">
                            {name}
                          </span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_CHIP[r.status] || 'bg-slate-100 text-slate-500'}`}>
                              {r.status.replace('_', ' ')}
                            </span>
                            {r.submittedAt && (
                              <span className="text-[10px] text-slate-400">{formatDate(r.submittedAt)}</span>
                            )}
                          </span>
                        </span>
                        {selected && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
                      </button>
                    </div>
                  );
                })}
              </div>
              {submittedOnly && groupRows.filter((r) => r.submittedAt).length === 0 && (
                <p className="mt-3 text-sm text-slate-400">Nobody submitted this task yet.</p>
              )}
              {selectedIds.length > 0 && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Feedback for {selectedIds.length} selected student{selectedIds.length > 1 ? 's' : ''}
                  </p>
                  <textarea
                    rows={3}
                    value={bulkFb}
                    onChange={(e) => setBulkFb(e.target.value)}
                    placeholder="Write review feedback for all selected students..."
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      Rating <span className="text-slate-400">/10</span>:
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={bulkPoints}
                        onChange={(e) => setBulkPoints(e.target.value)}
                        placeholder="0"
                        className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </label>
                    <button
                      onClick={() => { setSelectedIds([]); setBulkFb(''); setBulkPoints(''); }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkFeedback}
                      disabled={savingBulkFb}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                    >
                      <Send size={14} /> {savingBulkFb ? 'Sending...' : `Send to ${selectedIds.length}`}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Students move to Reviewed with this feedback and rating.
                  </p>
                </div>
              )}
            </section>
          )}

            {bulkOpen && task?.taskGroupId && (
              <section ref={bulkPanelRef} className="scroll-mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Layers size={18} className="text-indigo-500" /> Update Task Group
                  </h3>
                  <button onClick={() => setBulkOpen(false)} className="text-sm text-slate-400 hover:text-slate-600" aria-label="Close">
                    <X size={16} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Changes apply to every task in this broadcast group. Leave a field empty to keep it unchanged.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <input
                      type="text"
                      value={bulkTitle}
                      onChange={(e) => setBulkTitle(e.target.value)}
                      placeholder={task.title}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={3}
                      value={bulkDescription}
                      onChange={(e) => setBulkDescription(e.target.value)}
                      placeholder={task.description ?? 'No description'}
                      className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Priority</label>
                      <Select
                        value={bulkPriority}
                        onChange={(e) => setBulkPriority(e.target.value as TaskPriority | '')}
                        placeholder="Keep current"
                        className="mt-1.5"
                      >
                        <option value="">Keep current</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Due Date</label>
                      <input
                        type="date"
                        value={bulkDueDate}
                        onChange={(e) => setBulkDueDate(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                </div>

                {bulkErrors.bulk && (
                  <p className="mt-3 text-xs font-medium text-rose-500">{bulkErrors.bulk}</p>
                )}

                <div className="mt-5 flex items-center justify-end gap-3">
                  <button onClick={() => setBulkOpen(false)} disabled={savingBulk} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpdate}
                    disabled={savingBulk}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <Layers size={15} /> {savingBulk ? 'Updating...' : 'Update Group'}
                  </button>
                </div>
              </section>
            )}

            {renderSubmission('hidden lg:block')}

            {renderAttachments('hidden lg:block')}
          </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Assignee</h3>
                {intern ? (
                  <div className="mt-4">
                    <div className="flex items-center gap-3">
                      <Link href={`/company/admin/interns/${intern._id}`} title="View profile">
                        <InternAvatar src={intern.profilePicture?.secure_url} firstName={intern.firstName} lastName={intern.lastName} email={intern.email} className="h-10 w-10" />
                      </Link>
                      <div className="min-w-0">
                        {(() => {
                          const fullName = `${intern.firstName} ${intern.lastName}`.trim();
                          const displayName = fullName || intern.email;
                          return (
                            <>
                              <Link href={`/company/admin/interns/${intern._id}`} className="block truncate text-sm font-medium text-slate-900 hover:text-emerald-600 hover:underline">
                                {displayName}
                              </Link>
                              {intern.email && intern.email !== displayName && (
                                <p className="truncate text-xs text-slate-400">{intern.email}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <Link
                        href={`/company/admin/interns/${intern._id}`}
                        className="ml-auto shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </div>
                    {/* Student submission — note + attachments the intern sent */}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Submission</p>
                      {!task.submittedAt ? (
                        <p className="mt-2 text-sm text-slate-400">Not submitted yet.</p>
                      ) : (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400">
                            Submitted {formatDateTime(task.submittedAt)}
                            {(task.attachments ?? []).length > 0 && ` · ${(task.attachments ?? []).length} attachment${(task.attachments ?? []).length > 1 ? 's' : ''}`}
                          </p>
                          {(() => {
                            const { internNotes } = parseFeedbackThread(task.reviewerFeedback);
                            if (internNotes.length === 0) {
                              return <p className="mt-2 text-sm text-slate-500">Submitted without a note.</p>;
                            }
                            return (
                              <div className="mt-2 space-y-2">
                                {internNotes.map((n, i) => (
                                  <div key={i} className="rounded-xl bg-slate-50 p-3">
                                    <p className="whitespace-pre-line break-words text-sm text-slate-600">{n.text}</p>
                                    {n.date && <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.date)}</p>}
                                  </div>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">Not assigned to a current intern.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Reviewer Feedback</h3>
                {task.reviewerFeedback && (
                  <blockquote className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-3 text-sm italic text-slate-600">
                    “{task.reviewerFeedback}”
                  </blockquote>
                )}
                <textarea
                  rows={4}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write review feedback for this task..."
                  className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {nexts.some((n) => n.to === 'complete') && (
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-slate-600">Points <span className="text-slate-400">/10</span>:</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                        placeholder="0"
                        className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  )}
                  <button
                    onClick={handleSaveFeedback}
                    disabled={savingFeedback}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <Save size={14} /> {savingFeedback ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  Moving to Complete stamps the review — you can add points and notes at that step.
                </p>
              </section>
            </div>
          </div>

          <div className="space-y-6 lg:hidden">
            {renderSubmission('')}
            {renderAttachments('')}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={confirmArchive}
        title="Archive this task?"
        message="Archived tasks are hidden from the board. This action can be reversed later."
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}