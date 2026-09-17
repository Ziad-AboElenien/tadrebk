'use client';

import { useState } from 'react';
import { Loader2, Play, Send } from 'lucide-react';
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
  onSubmit?: (taskId: string) => void;
}

function formatDue(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MyTasksSection({ tasks, loading = false, actingId = null, onStart, onSubmit }: MyTasksSectionProps) {
  const [active, setActive] = useState<'All' | TaskStatus>('All');
  const visible = active === 'All' ? tasks : tasks.filter((t) => t.status === active);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="text-lg font-bold text-slate-900">My Tasks</h3>
      <p className="text-sm text-slate-400">Tasks assigned by your internship company</p>

      <div className="mt-4 inline-flex max-w-full flex-wrap gap-1 rounded-lg bg-slate-50 p-1">
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
                    onClick={() => onSubmit(task._id)}
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
    </section>
  );
}
