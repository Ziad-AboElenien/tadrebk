'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowUpDown,
  Filter,
  Plus,
  Circle,
  PlayCircle,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  MoreVertical,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { taskService } from '@/features/company/services/task.service';
import { Task, TaskStatus } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-50 text-rose-500',
  MEDIUM: 'bg-amber-50 text-amber-600',
  LOW: 'bg-emerald-50 text-emerald-600',
};

const STATUS_ORDER: { key: TaskStatus; title: string; icon: typeof Circle; iconColor: string }[] = [
  { key: 'todo', title: 'To Do', icon: Circle, iconColor: 'text-slate-400' },
  { key: 'in_progress', title: 'In Progress', icon: PlayCircle, iconColor: 'text-emerald-500' },
  { key: 'in_review', title: 'In Review', icon: Clock, iconColor: 'text-amber-500' },
  { key: 'complete', title: 'Complete', icon: CheckCircle2, iconColor: 'text-emerald-500' },
];

function formatDue(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TaskCard({ task }: { task: Task }) {
  const priority = task.priority ? task.priority.toUpperCase() : '';
  const points = task.pointsAwarded != null ? `${task.pointsAwarded} pts` : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{task._id.slice(-8).toUpperCase()}</span>
        {priority && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[priority] || 'bg-slate-100 text-slate-500'}`}>
            {priority}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{task.title}</p>
      {task.description && <p className="mt-1 text-xs text-slate-400 line-clamp-2">{task.description}</p>}
      {(task.tags || []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={13} /> {formatDue(task.dueDate)}</span>
          {points && <span className="flex items-center gap-1 text-emerald-600">{points}</span>}
        </div>
        <div className="flex items-center gap-1 text-slate-300">
          <MessageSquare size={13} />
          <MoreVertical size={16} />
        </div>
      </div>
    </div>
  );
}

export default function TaskBoardScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [columns, setColumns] = useState<Record<TaskStatus, Task[]>>({
    todo: [],
    in_progress: [],
    in_review: [],
    complete: [],
    archived: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await taskService.listTasks(companyId, { limit: 100 });
      const grouped: Record<TaskStatus, Task[]> = {
        todo: [],
        in_progress: [],
        in_review: [],
        complete: [],
        archived: [],
      };
      res.tasks.forEach((t) => {
        if (grouped[t.status]) grouped[t.status].push(t);
        else grouped.todo.push({ ...t, status: 'todo' });
      });
      setColumns(grouped);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchTasks, 0);
    return () => clearTimeout(t);
  }, [fetchTasks]);

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Task Board" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Project Sprint: Oct 2024</h2>
              <p className="text-sm text-slate-500">Track intern contributions and project milestones in real-time.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  placeholder="Filter tasks..."
                  className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div className="flex rounded-lg border border-slate-200 bg-white p-1 text-sm">
                <button className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-900">Board View</button>
                <button className="rounded-md px-3 py-1.5 text-slate-500">List View</button>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Filter size={15} /> Filter
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowUpDown size={15} /> Sort
              </button>
              <Link
                href="/company/admin/tasks/new"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <Plus size={16} /> Create Task
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
              {[0, 1, 2, 3].map((col) => (
                <div key={col} className="min-w-[260px] rounded-2xl bg-slate-100/60 p-3">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-slate-200" />
                      <div className="h-3.5 w-24 rounded-full bg-slate-200" />
                    </div>
                    <div className="h-5 w-7 rounded-full bg-slate-200" />
                  </div>
                  <div className="space-y-3">
                    {[0, 1, 2].map((card) => (
                      <div key={card} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="space-y-2">
                          <div className="h-3.5 w-full rounded-full bg-slate-200" />
                          <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
                        </div>
                        <div className="mt-3 flex gap-2">
                          <div className="h-5 w-20 rounded-full bg-slate-200" />
                          <div className="h-5 w-16 rounded-full bg-slate-200" />
                        </div>
                        <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                          <div className="h-7 w-7 rounded-full bg-slate-200" />
                          <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                          <div className="ml-auto h-2.5 w-12 rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
              {STATUS_ORDER.map((col) => (
                <div key={col.key} className="min-w-[260px] rounded-2xl bg-slate-100/60 p-3">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <div className="flex items-center gap-2">
                      <col.icon size={16} className={col.iconColor} />
                      <span className="text-sm font-semibold text-slate-900">{col.title}</span>
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {columns[col.key].length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <button aria-label={`Add task to ${col.title}`}><Plus size={15} /></button>
                      <button aria-label={`More options for ${col.title}`}><MoreHorizontal size={15} /></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {columns[col.key].map((t) => (
                      <TaskCard key={t._id} task={t} />
                    ))}
                    <Link
                      href="/company/admin/tasks/new"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-400 hover:bg-white"
                    >
                      <Plus size={15} /> Add Task
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}