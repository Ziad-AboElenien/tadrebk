'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  FolderKanban,
  Layers,
  Loader2,
  Paperclip,
  Play,
  Send,
  Star,
} from 'lucide-react';
import { internMeService } from '@/features/intern/services/intern-me.service';
import { internTaskService } from '@/features/intern/services/intern-task.service';
import type { Task } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import SubmitTaskModal from '@/features/student/components/dashboard/SubmitTaskModal';
import {
  parseFeedbackThread,
  studentBucket,
  STUDENT_BUCKET_META,
} from '@/features/intern/utils/student-task';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-rose-50 text-rose-500',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

export default function StudentTaskDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [companyId, setCompanyId] = useState('');
  const [task, setTask] = useState<Task | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [programName, setProgramName] = useState('');
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const fetchTask = useCallback(async () => {
    try {
      const picker = await internMeService.getPicker();
      const cid = picker.enrollments?.[0]?.companyId;
      if (!cid) {
        toastHelper.error('No active internship found');
        router.replace('/dashboard');
        return;
      }
      setCompanyId(cid);
      const [t, view, prog] = await Promise.all([
        internTaskService.getMyTask(cid, taskId),
        internMeService.getCompanyView(cid).catch(() => ({} as Record<string, unknown>)),
        internMeService.getProgram(cid).catch(() => undefined),
      ]);
      setTask(t);
      const v = view as Record<string, unknown>;
      const nested = v.company as Record<string, unknown> | undefined;
      const cname =
        (typeof v.companyName === 'string' && v.companyName) ||
        (nested && typeof nested.name === 'string' && nested.name) ||
        (typeof v.name === 'string' && v.name) ||
        '';
      setCompanyName(cname);
      if (t.programId && prog && prog._id === t.programId && prog.name) {
        setProgramName(prog.name);
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleStart = async () => {
    if (!companyId || !task) return;
    setActing(true);
    try {
      const updated = await internTaskService.startTask(companyId, task._id);
      setTask(updated);
      toastHelper.success('Task started');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  const handleSubmit = async (note?: string) => {
    if (!companyId || !task) return;
    setActing(true);
    try {
      const updated = await internTaskService.submitTask(companyId, task._id, note);
      setTask(updated);
      setSubmitOpen(false);
      toastHelper.success('Task submitted for review');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-[2.5%] py-6 sm:px-6 sm:py-10">
        <div className="h-6 w-40 animate-pulse rounded-full bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="mb-4 text-slate-500">Task not found.</p>
        <Link
          href="/dashboard"
          className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-600"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const bucket = studentBucket(task);
  const meta = bucket ? STUDENT_BUCKET_META[bucket] : null;
  const thread = parseFeedbackThread(task.reviewerFeedback);
  const reviewed = bucket === 'reviewed';
  const attachments = task.attachments ?? [];
  const tags = task.tags ?? [];
  const parentLabel = task.projectId
    ? 'Project task'
    : task.programId
      ? `Program task${programName ? ` · ${programName}` : ''}`
      : task.taskGroupId
        ? 'General task'
        : 'Direct task';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-[2.5%] py-6 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        {/* Belongs to: company + program/project */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <Building2 size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Company</p>
                <p className="truncate text-sm font-semibold text-slate-900">{companyName || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                {task.projectId ? <FolderKanban size={18} /> : <Layers size={18} />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Part of</p>
                <p className="truncate text-sm font-semibold text-slate-900">{parentLabel}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">{task.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {meta && (
                  <span className={`rounded-full px-3 py-1 font-medium ${meta.chip}`}>
                    {meta.label}
                  </span>
                )}
                {task.priority && (
                  <span className={`rounded-full px-3 py-1 font-medium capitalize ${PRIORITY_STYLES[task.priority] || 'bg-slate-100 text-slate-500'}`}>
                    {task.priority}
                  </span>
                )}
                {tags.map((tag) => (
                  <span key={tag} className="rounded bg-slate-100 px-2 py-0.5 font-semibold uppercase tracking-wide text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {task.status === 'todo' && (
              <button
                onClick={handleStart}
                disabled={acting}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                {acting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Start task
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => setSubmitOpen(true)}
                disabled={acting}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <Send size={14} />
                Submit task
              </button>
            )}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-400"><Calendar size={12} /> DUE DATE</dt>
              <dd className="mt-1 font-semibold text-slate-900">{formatDate(task.dueDate)}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-400"><Clock size={12} /> SUBMITTED</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {task.submittedAt ? formatDate(task.submittedAt) : '—'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-400"><CheckCircle2 size={12} /> REVIEWED</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {task.reviewedAt ? formatDate(task.reviewedAt) : '—'}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-slate-400"><Star size={12} /> RATING</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {task.pointsAwarded != null ? `${task.pointsAwarded}/10` : '—'}
              </dd>
            </div>
          </dl>
        </section>

        {/* Description */}
        {task.description && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <FileText size={18} className="text-emerald-500" /> Details
            </h3>
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">
              {task.description}
            </p>
          </section>
        )}

        {/* Attachments */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Paperclip size={18} className="text-emerald-500" /> Attachments
          </h3>
          {attachments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No attachments on this task.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {attachments.map((a) => (
                <a
                  key={a.public_id}
                  href={a.secure_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 text-sm transition-colors hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <Paperclip size={15} className="shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{a.name}</span>
                  <span className="shrink-0 text-xs text-slate-400">Open</span>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* My submission */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900">
            <Send size={18} className="text-emerald-500" /> My Submission
          </h3>
          {!task.submittedAt ? (
            <div className="mt-3">
              <p className="text-sm text-slate-400">You haven&apos;t submitted this task yet.</p>
              {task.status === 'todo' && (
                <button
                  onClick={handleStart}
                  disabled={acting}
                  className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {acting ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  Start task
                </button>
              )}
              {task.status === 'in_progress' && (
                <button
                  onClick={() => setSubmitOpen(true)}
                  disabled={acting}
                  className="mt-3 flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Send size={14} />
                  Submit now
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-xs text-slate-400">Submitted {formatDateTime(task.submittedAt)}</p>
              {thread.internNotes.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">Submitted without a note.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {thread.internNotes.map((n, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3">
                      <p className="whitespace-pre-line break-words text-sm text-slate-600">{n.text}</p>
                      {n.date && <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(n.date)}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Reviewer feedback */}
        {reviewed && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900">
              <Flag size={18} className="text-emerald-500" /> Reviewer Feedback
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <Star size={18} className="fill-amber-400 text-amber-400" />
              <p className="text-lg font-bold text-slate-900">
                {task.pointsAwarded != null ? `${task.pointsAwarded}/10` : 'Reviewed'}
              </p>
              {task.reviewedAt && (
                <span className="text-xs text-slate-400">· {formatDate(task.reviewedAt)}</span>
              )}
            </div>
            {thread.adminNotes ? (
              <blockquote className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-white p-4 text-sm italic leading-relaxed text-slate-600">
                “{thread.adminNotes}”
              </blockquote>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Reviewed without written feedback.</p>
            )}
          </section>
        )}
      </main>

      {submitOpen && (
        <SubmitTaskModal
          task={task}
          actingId={acting ? task._id : null}
          onClose={() => setSubmitOpen(false)}
          onConfirm={(note) => handleSubmit(note)}
        />
      )}
    </div>
  );
}
