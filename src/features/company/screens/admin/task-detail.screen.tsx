'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Paperclip,
  FileText,
  UploadCloud,
  X,
  Trash2,
  CheckCircle2,
  Save,
  Layers,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
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

const SUGGESTED_TAGS = ['Programming', 'Design', 'Documentation', 'Research', 'QA Testing'];

export default function TaskDetailScreen() {
  const params = useParams();
  const taskId = params.taskId as string;
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [task, setTask] = useState<Task | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkDescription, setBulkDescription] = useState('');
  const [bulkPriority, setBulkPriority] = useState<TaskPriority | ''>('');
  const [bulkDueDate, setBulkDueDate] = useState('');
  const [savingBulk, setSavingBulk] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<Record<string, string>>({});

  const fetchTask = useCallback(async () => {
    if (!companyId || !taskId) return;
    setLoading(true);
    try {
      const [taskRes, internRes, projRes] = await Promise.all([
        taskService.getTask(companyId, taskId),
        internService.listInterns(companyId, { limit: 100 }),
        projectService.listProjects(companyId, { limit: 100 }),
      ]);
      setTask(taskRes);
      setInterns(internRes.data);
      setProjects(projRes.data);
      setTitle(taskRes.title);
      setDescription(taskRes.description ?? '');
      setPriority(taskRes.priority ?? 'medium');
      setTags(taskRes.tags ?? []);
      setDueDate(taskRes.dueDate ? taskRes.dueDate.slice(0, 10) : '');
      setFeedback(taskRes.reviewerFeedback ?? '');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, taskId]);

  useEffect(() => {
    const t = setTimeout(fetchTask, 0);
    return () => clearTimeout(t);
  }, [fetchTask]);

  if (loading) {
    return (
      <div className="flex bg-slate-50">
        <Sidebar active="Tasks" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Task Details" />
          <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="h-9 w-64 rounded-lg bg-slate-200" />
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
      <div className="flex bg-slate-50">
        <Sidebar active="Tasks" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Task Details" />
          <div className="py-20 text-center text-sm text-slate-400">Task not found.</div>
        </div>
      </div>
    );
  }

  const intern = interns.find((i) => i._id === task.internId);
  const project = task.projectId ? projects.find((p) => p._id === task.projectId) : undefined;
  const nexts = NEXT_STATUSES[task.status] ?? [];
  const isGroup = Boolean(task.taskGroupId);

  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const addTag = (tag: string) => !tags.includes(tag) && setTags((t) => [...t, tag]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files).slice(0, 10));
  };

  const handleSaveEdit = async () => {
    if (!companyId) return;
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Task title is required.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingEdit(true);
    try {
      const updated = await taskService.updateTask(companyId, taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags,
        dueDate: dueDate || undefined,
      });
      setTask(updated);
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
      const updated = await taskService.transitionTask(companyId, taskId, {
        to,
        reviewerFeedback: feedback.trim() || undefined,
        pointsAwarded: to === 'complete' && points ? Number(points) : undefined,
      });
      setTask(updated);
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
      const updated = await taskService.saveFeedback(companyId, taskId, feedback.trim());
      setTask(updated);
      toastHelper.success('Feedback saved');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingFeedback(false);
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
      const updated = await taskService.addAttachments(companyId, taskId, files);
      setTask(updated);
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
      const updated = await taskService.removeAttachment(companyId, taskId, attachmentId);
      setTask(updated);
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
      await taskService.archiveTask(companyId, taskId);
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
    <div className="flex bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Task Details" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
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
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setConfirmArchive(true)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={15} /> Archive
              </button>
              {isGroup && (
                <button
                  onClick={() => {
                    setBulkErrors({});
                    setBulkOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50"
                >
                  <Layers size={15} /> Update Group
                </button>
              )}
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
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                {!editing ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">
                          Created {formatDate(task.createdAt)}
                          {task.submittedAt ? ` · Submitted ${formatDate(task.submittedAt)}` : ''}
                          {task.reviewedAt ? ` · Reviewed ${formatDate(task.reviewedAt)}` : ''}
                        </p>
                      </div>
                      <button onClick={() => { setEditing(true); setFieldErrors({}); }} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                        <Save size={15} /> Edit
                      </button>
                    </div>
                    {task.description && (
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
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

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Paperclip size={18} className="text-emerald-500" /> Attachments
                </h3>

                <div className="mt-4 space-y-2">
                  {task.attachments.length === 0 ? (
                    <p className="text-sm text-slate-400">No attachments yet.</p>
                  ) : (
                    task.attachments.map((att) => (
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
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Assignee</h3>
                {intern ? (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                      {initials(`${intern.firstName} ${intern.lastName}`.trim()) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {`${intern.firstName} ${intern.lastName}`.trim() || intern.email}
                      </p>
                      <p className="truncate text-xs text-slate-400">{intern.email}</p>
                    </div>
                    <Link
                      href={`/company/admin/interns/${intern._id}`}
                      className="ml-auto rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">Not assigned to a current intern.</p>
                )}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Reviewer Feedback</h3>
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
                      <label className="text-sm text-slate-600">Points:</label>
                      <input
                        type="number"
                        min={0}
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
              </section>

              <section className="rounded-2xl flex gap-3 border border-blue-100 bg-blue-50/60 p-5">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
                <p className="text-xs leading-relaxed text-blue-800">
                  Use the emerald button above to move this task forward. When marking Complete,
                  you can assign earned points and include review notes.
                </p>
              </section>
            </div>
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

      {bulkOpen && task?.taskGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => !savingBulk && setBulkOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Update Task Group</h3>
              <button onClick={() => setBulkOpen(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-400">
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
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={bulkDescription}
                  onChange={(e) => setBulkDescription(e.target.value)}
                  placeholder={task.description ?? 'No description'}
                  className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            {bulkErrors.bulk && (
              <p className="mt-3 text-xs font-medium text-rose-500">{bulkErrors.bulk}</p>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={() => setBulkOpen(false)} disabled={savingBulk} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
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
          </div>
        </div>
      )}
    </div>
  );
}