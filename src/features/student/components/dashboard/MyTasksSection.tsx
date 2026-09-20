'use client';

import { useState } from 'react';
import { Check, FileText, Filter, Loader2, Paperclip, Play, Send, X } from 'lucide-react';
import type { Task, TaskStatus } from '@/features/company/types/management';

const TABS: { key: 'All' | TaskStatus; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'complete', label: 'Completed' },
];

const STATUS_CHIP: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-50 text-blue-600',
  in_review: 'bg-purple-50 text-purple-600',
  complete: 'bg-emerald-50 text-emerald-600',
  archived: 'bg-slate-100 text-slate-400',
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  complete: 'Completed',
  archived: 'Archived',
};

interface MyTasksSectionProps {
  tasks: Task[];
  loading?: boolean;
  actingId?: string | null;
  onStart?: (taskId: string) => void;
  onSubmit?: (taskId: string, note?: string) => void;
}

function formatDue(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MyTasksSection({ tasks, loading = false, actingId = null, onStart, onSubmit }: MyTasksSectionProps) {
  const [active, setActive] = useState<'All' | TaskStatus>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const visible = active === 'All' ? tasks : tasks.filter((t) => t.status === active);
  const activeLabel = TABS.find((t) => t.key === active)?.label ?? 'All';

  const openSubmit = (task: Task) => {
    setSubmitTask(task);
    setNote('');
    setFile(null);
  };

  const confirmSubmit = () => {
    if (!submitTask) return;
    onSubmit?.(submitTask._id, note.trim() || undefined);
    setSubmitTask(null);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-bold text-slate-900">My Tasks</h3>
      <p className="text-sm text-slate-400">Tasks assigned by your internship company</p>

      {/* Mobile: filter icon + dropdown menu */}
      <div className="relative mt-4 sm:hidden">
        <button
          type="button"
          onClick={() => setFilterOpen((o) => !o)}
          className={`flex w-full items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm transition-colors ${
            active !== 'All' ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-600'
          }`}
        >
          <Filter size={15} />
          <span className="font-medium">{activeLabel}</span>
          <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {visible.length}
          </span>
        </button>
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
            <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-200/60">
              {TABS.map((tab) => {
                const count = tab.key === 'All' ? tasks.length : tasks.filter((t) => t.status === tab.key).length;
                const selected = active === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => { setActive(tab.key); setFilterOpen(false); }}
                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      selected ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex-1">{tab.label}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {count}
                    </span>
                    {selected && <Check size={14} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Desktop: filter pills */}
      <div className="mt-4 hidden max-w-full flex-wrap gap-1 rounded-lg bg-slate-50 p-1 sm:inline-flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`whitespace-nowrap rounded-md px-4 py-1.5 text-sm transition-colors ${
              active === tab.key
                ? 'bg-white font-medium text-emerald-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {loading ? (
          <div className="space-y-2 py-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No tasks in this view.</p>
        ) : (
          visible.map((task) => (
            <div key={task._id} className="flex flex-wrap items-center gap-3 py-3.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <span className="min-w-0 flex-1 basis-40 break-words text-sm font-semibold text-slate-900">
                {task.title}
              </span>
              {(task.tags?.[0] || task.priority) && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  {task.tags?.[0] || task.priority}
                </span>
              )}
              <span className="ml-auto flex shrink-0 items-center gap-3 text-xs sm:gap-5">
                {task.status === 'todo' && onStart && (
                  <button
                    onClick={() => onStart(task._id)}
                    disabled={actingId === task._id}
                    className="flex items-center gap-1 font-semibold text-emerald-600 hover:underline disabled:opacity-50"
                  >
                    {actingId === task._id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    Start
                  </button>
                )}
                {task.status === 'in_progress' && onSubmit && (
                  <button
                    onClick={() => openSubmit(task)}
                    disabled={actingId === task._id}
                    className="flex items-center gap-1 font-semibold text-blue-600 hover:underline disabled:opacity-50"
                  >
                    {actingId === task._id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    Submit
                  </button>
                )}
                <span className="hidden text-slate-400 sm:inline">{formatDue(task.dueDate)}</span>
                <span className={`rounded-full px-3 py-1 font-medium ${STATUS_CHIP[task.status]}`}>
                  {STATUS_LABEL[task.status]}
                </span>
              </span>
            </div>
          ))
        )}
      </div>

      {/* Submit modal — note + attachment (attachment optional until the API supports uploads) */}
      {submitTask && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSubmitTask(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
              <p className="text-sm font-semibold text-slate-900">Submit task for review</p>
              <button
                type="button"
                onClick={() => setSubmitTask(null)}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <p className="break-words text-sm font-medium text-slate-700">{submitTask.title}</p>
              <div>
                <label htmlFor="task-submit-note" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Note for reviewer
                </label>
                <textarea
                  id="task-submit-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="What did you finish? Anything the reviewer should know…"
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Attachment <span className="font-normal normal-case text-slate-300">(optional for now)</span>
                </span>
                <label
                  htmlFor="task-submit-file"
                  className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Paperclip size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    {file ? (
                      <>
                        <span className="block truncate text-sm font-medium text-slate-700">{file.name}</span>
                        <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · ready</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-sm font-medium text-slate-600">Attach your work file</span>
                        <span className="text-xs text-slate-400">Tap to choose a file</span>
                      </>
                    )}
                  </span>
                  {file && (
                    <button
                      type="button"
                      aria-label="Remove file"
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"
                    >
                      <X size={14} />
                    </button>
                  )}
                </label>
                <input
                  id="task-submit-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSubmitTask(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSubmit}
                  disabled={actingId === submitTask._id}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                >
                  {actingId === submitTask._id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  Submit task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
