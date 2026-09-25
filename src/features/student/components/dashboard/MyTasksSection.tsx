'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Filter, Loader2, Play, Send } from 'lucide-react';
import type { Task } from '@/features/company/types/management';
import SubmitTaskModal from '@/features/student/components/dashboard/SubmitTaskModal';
import { studentBucket, STUDENT_BUCKET_META, type StudentTaskBucket } from '@/features/intern/utils/student-task';

type TaskTab = 'All' | StudentTaskBucket;

const TABS: { key: TaskTab; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'todo', label: 'To Do' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'reviewed', label: 'Reviewed' },
];

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
  const [active, setActive] = useState<TaskTab>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [submitTask, setSubmitTask] = useState<Task | null>(null);
  // Students only ever see outstanding work, submitted work and reviewed work.
  const studentTasks = useMemo(() => tasks.filter((t) => studentBucket(t) !== null), [tasks]);
  const visible = useMemo(
    () => (active === 'All' ? studentTasks : studentTasks.filter((t) => studentBucket(t) === active)),
    [studentTasks, active],
  );
  const activeLabel = TABS.find((t) => t.key === active)?.label ?? 'All';

  const openSubmit = (task: Task) => {
    setSubmitTask(task);
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
                const count = tab.key === 'All' ? studentTasks.length : studentTasks.filter((t) => studentBucket(t) === tab.key).length;
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
          visible.map((task) => {
            const bucket = studentBucket(task);
            const meta = bucket ? STUDENT_BUCKET_META[bucket] : null;
            return (
            <div key={task._id} className="flex flex-wrap items-center gap-3 py-3.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${meta?.dot ?? 'bg-slate-300'}`} />
              <Link
                href={`/my-tasks/${task._id}`}
                className="min-w-0 flex-1 basis-40 break-words text-sm font-semibold text-slate-900 hover:text-emerald-600 hover:underline"
              >
                {task.title}
              </Link>
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
                {meta && (
                  <span className={`rounded-full px-3 py-1 font-medium ${meta.chip}`}>
                    {meta.label}
                  </span>
                )}
              </span>
            </div>
            );
          })
        )}
      </div>

      {/* Submit modal — note + attachment (attachment optional until the API supports uploads) */}
      {submitTask && (
        <SubmitTaskModal
          task={submitTask}
          actingId={actingId}
          onClose={() => setSubmitTask(null)}
          onConfirm={(note) => {
            onSubmit?.(submitTask._id, note);
            setSubmitTask(null);
          }}
        />
      )}
    </section>
  );
}
