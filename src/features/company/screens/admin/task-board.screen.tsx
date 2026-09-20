'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Circle,
  PlayCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Loader2,
  Users2,
  Filter,
  ArrowUpDown,
  Check,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  GripVertical,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Select from '@/components/ui/Select';
import { taskService, BroadcastCard } from '@/features/company/services/task.service';
import { internService } from '@/features/company/services/intern.service';
import { Task, TaskStatus, Intern } from '@/features/company/types/management';
import InternAvatar from '@/components/ui/InternAvatar';
import GlassFilter from '@/components/ui/GlassFilter';
import { priorityTheme } from '@/features/company/utils/taskPriorityTheme';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-rose-50 text-rose-500',
  medium: 'bg-amber-50 text-amber-600',
  low: 'bg-emerald-50 text-emerald-600',
};

const STATUS_ORDER: { key: TaskStatus; title: string; icon: typeof Circle; iconColor: string }[] = [
  { key: 'todo', title: 'To Do', icon: Circle, iconColor: 'text-slate-400' },
  { key: 'in_progress', title: 'In Progress', icon: PlayCircle, iconColor: 'text-emerald-500' },
  { key: 'in_review', title: 'In Review', icon: Clock, iconColor: 'text-amber-500' },
  { key: 'complete', title: 'Complete', icon: CheckCircle2, iconColor: 'text-emerald-500' },
];

const STATUS_RANK: Record<string, number> = {
  todo: 0,
  in_progress: 1,
  in_review: 2,
  complete: 3,
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  complete: 'Complete',
  archived: 'Archived',
};

type DragItem = { kind: 'single' | 'group'; id: string; title: string; from: TaskStatus };

/**
 * Canonicalize API status strings. Unknown/blank values fall back to 'todo'
 * (visible beats invisible) instead of silently dropping the task.
 */
function normalizeStatus(s?: string | null): TaskStatus {
  const v = (s || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  const map: Record<string, TaskStatus> = {
    todo: 'todo',
    to_do: 'todo',
    open: 'todo',
    pending: 'todo',
    backlog: 'todo',
    in_progress: 'in_progress',
    inprogress: 'in_progress',
    in_review: 'in_review',
    inreview: 'in_review',
    review: 'in_review',
    complete: 'complete',
    completed: 'complete',
    done: 'complete',
    archived: 'archived',
    archive: 'archived',
  };
  return map[v] || 'todo';
}

/**
 * A broadcast card represents N parallel member tasks — place it in the
 * column of its members' MOST COMMON status (tie → most advanced), ignoring
 * archived members. Previously the minimum rank won, so one stale/archived
 * member dragged the whole card into To Do.
 */
function groupColumn(statuses: string[]): TaskStatus {
  const valid = statuses.map(normalizeStatus).filter((s) => s !== 'archived');
  if (valid.length === 0) return 'todo';
  const counts = new Map<TaskStatus, number>();
  valid.forEach((s) => counts.set(s, (counts.get(s) || 0) + 1));
  let best: TaskStatus = 'todo';
  let bestScore = -1;
  counts.forEach((count, status) => {
    const score = count * 10 + (STATUS_RANK[status] ?? 0);
    if (score > bestScore) {
      bestScore = score;
      best = status;
    }
  });
  return best;
}

function formatDue(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function idOf(v: unknown): string {
  return typeof v === 'string' ? v : ((v as { _id?: unknown } | null)?._id as string) || '';
}

export default function TaskBoardScreen() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [broadcasts, setBroadcasts] = useState<BroadcastCard[]>([]);
  const [singles, setSingles] = useState<Task[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [internFilter, setInternFilter] = useState('');
  const [opening, setOpening] = useState('');
  const [colMenu, setColMenu] = useState<TaskStatus | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: 'archive' | 'complete'; status: TaskStatus } | null>(null);
  const [bulking, setBulking] = useState(false);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<TaskStatus[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'due' | 'title' | 'priority'>('default');
  const [filterOpen, setFilterOpen] = useState(false);

  // ---- Drag & drop (pointer-based: mouse + touch) ----
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const dragData = useRef<{ item: DragItem; startX: number; startY: number; x: number; y: number; moved: boolean } | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const colRefs = useRef<Partial<Record<TaskStatus, HTMLDivElement | null>>>({});
  const overColRef = useRef<TaskStatus | null>(null);
  const suppressClick = useRef(false);
  const performDropRef = useRef<((item: DragItem, to: TaskStatus) => void) | null>(null);

  const moveGhost = useCallback((x: number, y: number) => {
    const g = ghostRef.current;
    if (g) g.style.transform = `translate(${x}px, ${y}px) translate(-50%, -130%) rotate(-3deg)`;
  }, []);

  const hitColumn = useCallback((x: number, y: number): TaskStatus | null => {
    for (const col of STATUS_ORDER) {
      const el = colRefs.current[col.key];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return col.key;
    }
    return null;
  }, []);

  const onDragMove = useCallback(
    (e: PointerEvent) => {
      const d = dragData.current;
      if (!d) return;
      if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 8) d.moved = true;
      d.x = e.clientX;
      d.y = e.clientY;
      moveGhost(e.clientX, e.clientY);
      const hit = hitColumn(e.clientX, e.clientY);
      if (hit !== overColRef.current) {
        overColRef.current = hit;
        setOverCol(hit);
      }
    },
    [hitColumn, moveGhost],
  );

  const endDrag = useCallback(() => {
    const d = dragData.current;
    dragData.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
    window.removeEventListener('pointercancel', onDragEnd);
    if (d?.moved) {
      // A real drag just happened — swallow the click that follows it.
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 80);
    }
    const target = overColRef.current;
    const item = d?.item;
    setDragItem(null);
    setOverCol(null);
    if (item && target && target !== item.from) {
      performDropRef.current?.(item, target);
    }
  }, [onDragMove]);

  // Named separately so listeners can be removed (same reference).
  const onDragEnd = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const beginDrag = useCallback(
    (item: DragItem, e: React.PointerEvent) => {
      if (movingId) return;
      e.preventDefault();
      suppressClick.current = false;
      dragData.current = { item, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false };
      overColRef.current = null;
      setOverCol(null);
      setDragItem(item);
      moveGhost(e.clientX, e.clientY);
      window.addEventListener('pointermove', onDragMove);
      window.addEventListener('pointerup', onDragEnd);
      window.addEventListener('pointercancel', onDragEnd);
    },
    [movingId, moveGhost, onDragMove, onDragEnd],
  );

  const fetchAll = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const all: BroadcastCard[] = [];
      let page = 1;
      for (;;) {
        const res = await taskService.listBroadcasts(companyId, { page, limit: 100 });
        all.push(...res.broadcasts);
        if (page >= (res.pagination.pages || 1)) break;
        page += 1;
      }
      const [tRes, iRes] = await Promise.all([
        taskService.listTasks(companyId, { limit: 100 }),
        internService.listAllInterns(companyId),
      ]);
      setBroadcasts(all);
      setSingles(tRes.tasks.filter((t) => !t.taskGroupId && t.status !== 'archived'));
      setInterns(iRes);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const internMap = useMemo(() => new Map(interns.map((i) => [i._id, i])), [interns]);

  const activeFilterCount =
    (internFilter ? 1 : 0) + priorityFilter.length + statusFilter.length + (sortBy !== 'default' ? 1 : 0);

  const runBulkColumn = async () => {
    if (!companyId || !confirmBulk) return;
    setBulking(true);
    try {
      const items = columns[confirmBulk.status];
      const ids: string[] = [];
      for (const item of items) {
        if (item.kind === 'single') {
          ids.push(item.task._id);
        } else {
          try {
            const res = await taskService.listByGroup(companyId, item.card.taskGroupId);
            res.tasks.forEach((t) => ids.push(t._id));
          } catch {
            // skip groups that fail to load
          }
        }
      }
      if (ids.length === 0) {
        toastHelper.error('No tasks to update in this column');
        return;
      }
      const results = await Promise.allSettled(
        ids.map((id) =>
          confirmBulk.action === 'archive'
            ? taskService.archiveTask(companyId, id)
            : taskService.transitionTask(companyId, id, { to: 'complete' }),
        ),
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const fail = results.length - ok;
      toastHelper.success(
        fail > 0 ? `${ok} updated · ${fail} failed` : `${ok} task(s) ${confirmBulk.action === 'archive' ? 'archived' : 'marked complete'}`,
      );
      setConfirmBulk(null);
      setColMenu(null);
      fetchAll();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setBulking(false);
    }
  };

  const performDrop = useCallback(
    async (item: DragItem, to: TaskStatus) => {
      if (!companyId || movingId) return;
      setMovingId(item.kind === 'single' ? item.id : `group-${item.id}`);
      try {
        if (item.kind === 'single') {
          await taskService.transitionTask(companyId, item.id, { to });
          toastHelper.success(`Moved to ${STATUS_LABEL[to]}`);
        } else {
          const res = await taskService.listByGroup(companyId, item.id);
          const ids = res.tasks.map((t) => t._id);
          if (ids.length === 0) {
            toastHelper.error('No tasks in this group');
            return;
          }
          const results = await Promise.allSettled(
            ids.map((id) => taskService.transitionTask(companyId, id, { to })),
          );
          const ok = results.filter((r) => r.status === 'fulfilled').length;
          const fail = results.length - ok;
          if (fail > 0) toastHelper.success(`${ok} moved · ${fail} failed`);
          else toastHelper.success(`Moved to ${STATUS_LABEL[to]}`);
        }
        fetchAll();
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
        fetchAll();
      } finally {
        setMovingId(null);
      }
    },
    [companyId, movingId, fetchAll],
  );

  useEffect(() => {
    performDropRef.current = performDrop;
  }, [performDrop]);

  const openBroadcast = async (groupId: string) => {    if (!companyId) return;
    setOpening(groupId);
    try {
      const res = await taskService.listByGroup(companyId, groupId);
      const rows = res.tasks;
      if (rows.length === 0) {
        toastHelper.error('No tasks in this group yet');
        return;
      }
      const first = rows[0];
      router.push(`/company/admin/tasks/${first._id}?groupId=${groupId}&internId=${idOf(first.internId)}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setOpening('');
    }
  };

  const columns = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matchPriority = (p?: string | null) =>
      priorityFilter.length === 0 || (p != null && priorityFilter.includes(p));
    const grouped: Record<TaskStatus, ({ kind: 'group'; card: BroadcastCard } | { kind: 'single'; task: Task })[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      complete: [],
      archived: [],
    };
    broadcasts.forEach((b) => {
      if (internFilter && !b.members.some((m) => m.internId === internFilter)) return;
      if (!matchPriority(b.priority)) return;
      if (q && !`${b.title} ${b.description || ''}`.toLowerCase().includes(q)) return;
      const key = groupColumn(b.members.map((m) => m.status));
      if (statusFilter.length > 0 && !statusFilter.includes(key)) return;
      grouped[key].push({ kind: 'group', card: b });
    });
    singles.forEach((t) => {
      if (internFilter && idOf(t.internId) !== internFilter) return;
      if (!matchPriority(t.priority)) return;
      if (q && !`${t.title} ${t.description || ''} ${(t.tags || []).join(' ')}`.toLowerCase().includes(q)) return;
      const key = normalizeStatus(t.status);
      if (key === 'archived') return;
      if (statusFilter.length > 0 && !statusFilter.includes(key)) return;
      grouped[key].push({ kind: 'single', task: t });
    });
    const prioRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const sortFn = (a: { due?: string | null; title: string; prio?: string | null }, b: { due?: string | null; title: string; prio?: string | null }) => {
      if (sortBy === 'due') {
        const da = a.due ? new Date(a.due).getTime() : Number.MAX_SAFE_INTEGER;
        const db = b.due ? new Date(b.due).getTime() : Number.MAX_SAFE_INTEGER;
        return da - db;
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'priority') return (prioRank[a.prio || ''] ?? 3) - (prioRank[b.prio || ''] ?? 3);
      return 0;
    };
    (Object.keys(grouped) as TaskStatus[]).forEach((k) => {
      grouped[k].sort((a, b) =>
        sortFn(
          a.kind === 'group'
            ? { due: a.card.dueDate, title: a.card.title, prio: a.card.priority }
            : { due: a.task.dueDate, title: a.task.title, prio: a.task.priority },
          b.kind === 'group'
            ? { due: b.card.dueDate, title: b.card.title, prio: b.card.priority }
            : { due: b.task.dueDate, title: b.task.title, prio: b.task.priority },
        ),
      );
    });
    return grouped;
  }, [broadcasts, singles, search, internFilter, priorityFilter, statusFilter, sortBy]);

  const activeIntern = internFilter ? internMap.get(internFilter) : undefined;

  const filterPanel = (
    <>
      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
          <Filter size={14} className="text-emerald-500" /> Filters
        </p>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            {activeFilterCount} active
          </span>
        )}
      </div>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <Users2 size={12} /> Intern
          </p>
          <Select
            value={internFilter}
            onChange={(e) => setInternFilter(e.target.value)}
            placeholder="All interns"
            className="mt-2"
          >
            <option value="">All interns</option>
            {interns.map((i) => (
              <option key={i._id} value={i._id}>
                {`${i.firstName} ${i.lastName}`.trim() || i.email}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {['high', 'medium', 'low'].map((p) => (
              <button
                key={p}
                onClick={() =>
                  setPriorityFilter((prev) =>
                    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                  )
                }
                className={`rounded-xl border px-3 py-2 text-sm capitalize transition-all ${
                  priorityFilter.includes(p)
                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {p}
                  {priorityFilter.includes(p) && <Check size={13} className="shrink-0" />}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {STATUS_ORDER.map((s) => (
              <button
                key={s.key}
                onClick={() =>
                  setStatusFilter((prev) =>
                    prev.includes(s.key) ? prev.filter((x) => x !== s.key) : [...prev, s.key],
                  )
                }
                className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                  statusFilter.includes(s.key)
                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1">
                  {s.title}
                  {statusFilter.includes(s.key) && <Check size={13} className="shrink-0" />}
                </span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <ArrowUpDown size={12} /> Sort by
          </p>
          <div className="mt-2 space-y-1">
            {[
              { key: 'default', label: 'Default order' },
              { key: 'due', label: 'Due date' },
              { key: 'title', label: 'Title A–Z' },
              { key: 'priority', label: 'Priority' },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => setSortBy(o.key as typeof sortBy)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  sortBy === o.key ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {o.label}
                {sortBy === o.key && <Check size={14} className="shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3">
        <button
          onClick={() => {
            setPriorityFilter([]);
            setStatusFilter([]);
            setInternFilter('');
            setSortBy('default');
          }}
          disabled={activeFilterCount === 0}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-500 disabled:opacity-40"
        >
          Clear all
        </button>
        <button
          onClick={() => setFilterOpen(false)}
          className="rounded-lg bg-emerald-500 px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600"
        >
          Apply
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Task Board" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-semibold text-slate-900">
                {activeIntern
                  ? `Tasks · ${`${activeIntern.firstName} ${activeIntern.lastName}`.trim() || activeIntern.email}`
                  : 'Tasks Board'}
              </h2>
              <p className="text-sm text-slate-500">Track intern contributions and project milestones in real-time.</p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
              {/* Mobile: one row — open search + filter icon + view icons. Desktop: inline field + full buttons. */}
              <div className="relative flex items-center gap-2 sm:contents">
                <div className="relative min-w-0 flex-1 sm:hidden">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Filter tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="relative hidden sm:block">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    placeholder="Filter tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <Link
                  href="/company/admin/tasks/new"
                  className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 sm:flex"
                >
                  <Plus size={16} className="shrink-0" />
                  <span>New Task</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-label="Open filters"
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white transition-colors sm:hidden ${
                    activeFilterCount > 0 ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <Filter size={15} />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 sm:hidden" role="group" aria-label="Switch view">
                  <button
                    type="button"
                    onClick={() => setView('board')}
                    aria-label="Board view"
                    title="Board view"
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      view === 'board' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    aria-label="List view"
                    title="List view"
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      view === 'list' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                    }`}
                  >
                    <List size={14} />
                  </button>
                </div>
                {filterOpen && (
                  <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 sm:hidden">
                    {filterPanel}
                  </div>
                )}
              </div>
              <div className="hidden items-center gap-2.5 sm:flex sm:flex-wrap">
              <GlassFilter
                options={[
                  { key: 'board', label: 'Board View' },
                  { key: 'list', label: 'List View' },
                ]}
                value={view}
                onChange={(key) => setView(key as 'board' | 'list')}
                ariaLabel="Switch view"
              />
              <div className="relative">
                <button
                  onClick={() => setFilterOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-slate-50 ${
                    activeFilterCount > 0 ? 'border-emerald-300 text-emerald-600' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <Filter size={15} /> Filter
                  {activeFilterCount > 0 && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setFilterOpen(false)} />
                    <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[88vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">
                      <div className="flex items-center justify-between bg-slate-50/80 px-4 py-3">
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                          <Filter size={14} className="text-emerald-500" /> Filters
                        </p>
                        {activeFilterCount > 0 && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                            {activeFilterCount} active
                          </span>
                        )}
                      </div>
                      <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <Users2 size={12} /> Intern
                          </p>
                          <Select
                            value={internFilter}
                            onChange={(e) => setInternFilter(e.target.value)}
                            placeholder="All interns"
                            className="mt-2"
                          >
                            <option value="">All interns</option>
                            {interns.map((i) => (
                              <option key={i._id} value={i._id}>
                                {`${i.firstName} ${i.lastName}`.trim() || i.email}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Priority</p>
                          <div className="mt-2 grid grid-cols-3 gap-1.5">
                            {['high', 'medium', 'low'].map((p) => (
                              <button
                                key={p}
                                onClick={() =>
                                  setPriorityFilter((prev) =>
                                    prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-sm capitalize transition-all ${
                                  priorityFilter.includes(p)
                                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700 shadow-sm'
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="flex items-center justify-center gap-1">
                                  {p}
                                  {priorityFilter.includes(p) && <Check size={13} className="shrink-0" />}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Status</p>
                          <div className="mt-2 grid grid-cols-2 gap-1.5">
                            {STATUS_ORDER.map((s) => (
                              <button
                                key={s.key}
                                onClick={() =>
                                  setStatusFilter((prev) =>
                                    prev.includes(s.key) ? prev.filter((x) => x !== s.key) : [...prev, s.key],
                                  )
                                }
                                className={`rounded-xl border px-3 py-2 text-sm transition-all ${
                                  statusFilter.includes(s.key)
                                    ? 'border-emerald-300 bg-emerald-50 font-medium text-emerald-700 shadow-sm'
                                    : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <span className="flex items-center justify-center gap-1">
                                  {s.title}
                                  {statusFilter.includes(s.key) && <Check size={13} className="shrink-0" />}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            <ArrowUpDown size={12} /> Sort by
                          </p>
                          <div className="mt-2 space-y-1">
                            {[
                              { key: 'default', label: 'Default order' },
                              { key: 'due', label: 'Due date' },
                              { key: 'title', label: 'Title A–Z' },
                              { key: 'priority', label: 'Priority' },
                            ].map((o) => (
                              <button
                                key={o.key}
                                onClick={() => setSortBy(o.key as typeof sortBy)}
                                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                  sortBy === o.key ? 'bg-emerald-50 font-medium text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {o.label}
                                {sortBy === o.key && <Check size={14} className="shrink-0" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                        <button
                          onClick={() => {
                            setPriorityFilter([]);
                            setStatusFilter([]);
                            setInternFilter('');
                            setSortBy('default');
                          }}
                          disabled={activeFilterCount === 0}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-500 disabled:opacity-40"
                        >
                          Clear all
                        </button>
                        <button
                          onClick={() => setFilterOpen(false)}
                          className="rounded-lg bg-emerald-500 px-5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-600"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              </div>
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
                      <div key={card} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="h-1.5 w-full bg-slate-200" />
                        <div className="p-4">
                          <div className="space-y-2">
                            <div className="h-3.5 w-full rounded-full bg-slate-200" />
                            <div className="h-3.5 w-3/4 rounded-full bg-slate-200" />
                          </div>
                          <div className="mt-3">
                            <div className="h-1.5 rounded-full bg-slate-100" />
                          </div>
                          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
                            <div className="flex -space-x-1.5">
                              <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                              <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                              <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-200" />
                            </div>
                            <div className="ml-auto h-2.5 w-12 rounded-full bg-slate-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : view === 'list' ? (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {(Object.keys(columns) as TaskStatus[])
                .filter((k) => k !== 'archived')
                .flatMap((k) => columns[k]).length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-400">No tasks found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {(Object.keys(columns) as TaskStatus[])
                    .filter((k) => k !== 'archived')
                    .flatMap((k) => columns[k])
                    .map((item) =>
                      item.kind === 'group' ? (
                        <button
                          key={item.card.taskGroupId}
                          onClick={() => openBroadcast(item.card.taskGroupId)}
                          disabled={opening === item.card.taskGroupId}
                          style={{ borderLeftColor: priorityTheme(item.card.priority).banner }}
                          className={`flex w-full flex-wrap items-center gap-3 border-l-4 px-4 py-3.5 text-left transition-shadow hover:shadow-sm disabled:opacity-60 sm:flex-nowrap ${priorityTheme(item.card.priority).cardBg}`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-semibold text-indigo-600">
                              {opening === item.card.taskGroupId ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Users2 size={16} />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-slate-900">
                                {item.card.title}
                                <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                                  Group · {item.card.totalMembers}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-slate-400">
                                {item.card.description || 'No description'}
                              </span>
                              <span className="mt-1.5 flex items-center gap-2">
                                <span className="flex -space-x-1.5">
                                  {item.card.members.slice(0, 4).map((m) => (
                                    <InternAvatar
                                      key={m.internId}
                                      src={m.intern?.profilePicture}
                                      firstName={m.intern?.firstName}
                                      lastName={m.intern?.lastName}
                                      email={m.intern?.email}
                                      className="h-5 w-5 border border-white text-[7px]"
                                    />
                                  ))}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {item.card.members.filter((m) => m.status === 'complete').length}/{item.card.totalMembers} done
                                </span>
                                {item.card.priority && (
                                  <span className={`rounded-full px-1.5 py-px text-[10px] font-semibold uppercase ${PRIORITY_STYLES[item.card.priority] || 'bg-slate-100 text-slate-500'}`}>
                                    {item.card.priority}
                                  </span>
                                )}
                              </span>
                            </span>
                          </div>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                            <Calendar size={13} /> {formatDue(item.card.dueDate)}
                          </span>
                        </button>
                      ) : (
                        <Link
                          key={item.task._id}
                          href={`/company/admin/tasks/${item.task._id}?internId=${idOf(item.task.internId)}`}
                          style={{ borderLeftColor: priorityTheme(item.task.priority).banner }}
                          className={`flex w-full flex-wrap items-center gap-3 border-l-4 px-4 py-3.5 transition-shadow hover:shadow-sm sm:flex-nowrap ${priorityTheme(item.task.priority).cardBg}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">{item.task.title}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {(() => {
                                const f = internMap.get(idOf(item.task.internId));
                                return f ? `${`${f.firstName} ${f.lastName}`.trim() || f.email} · ` : '';
                              })()}
                              {item.task.description || 'No description'}
                            </span>
                            {(item.task.tags || []).length > 0 && (
                              <span className="mt-1.5 flex flex-wrap gap-1">
                                {item.task.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="rounded-full bg-emerald-50 px-2 py-px text-[10px] font-medium text-emerald-600">
                                    {tag}
                                  </span>
                                ))}
                              </span>
                            )}
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            {item.task.priority && (
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[item.task.priority] || 'bg-slate-100 text-slate-500'}`}>
                                {item.task.priority}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar size={13} /> {formatDue(item.task.dueDate)}
                            </span>
                            {item.task.pointsAwarded != null && (
                              <span className="text-xs font-semibold text-emerald-600">{item.task.pointsAwarded} pts</span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                              item.task.status === 'complete' ? 'bg-emerald-100 text-emerald-700'
                              : item.task.status === 'in_review' ? 'bg-blue-100 text-blue-700'
                              : item.task.status === 'in_progress' ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-200 text-slate-500'
                            }`}>
                              {item.task.status.replace('_', ' ')}
                            </span>
                          </span>
                        </Link>
                      ),
                    )}
                </div>
              )}
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-x-auto sm:grid-cols-2 lg:grid-cols-4">
              {STATUS_ORDER.map((col) => (
                <div
                  key={col.key}
                  ref={(el) => {
                    colRefs.current[col.key] = el;
                  }}
                  className={`min-w-[260px] rounded-2xl p-3 transition-colors ${
                    overCol === col.key
                      ? 'bg-emerald-50/70 ring-2 ring-emerald-400'
                      : 'bg-slate-100/60'
                  } ${dragItem ? 'min-h-[160px]' : ''}`}
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <div className="flex items-center gap-2">
                      <col.icon size={16} className={col.iconColor} />
                      <span className="text-sm font-semibold text-slate-900">{col.title}</span>
                      <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">
                        {columns[col.key].length}
                      </span>
                    </div>
                    <div className="relative flex items-center gap-1 text-slate-400">
                      <button
                        aria-label={`More options for ${col.title}`}
                        onClick={() => setColMenu((m) => (m === col.key ? null : col.key))}
                        className="rounded-md p-1 hover:bg-slate-200/70 hover:text-slate-600"
                      >
                        <MoreHorizontal size={15} />
                      </button>
                      {colMenu === col.key && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setColMenu(null)} />
                          <div className="absolute right-0 top-full z-40 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white py-1.5 text-left shadow-xl">
                            {col.key !== 'complete' && columns[col.key].length > 0 && (
                              <button
                                onClick={() => {
                                  setConfirmBulk({ action: 'complete', status: col.key });
                                  setColMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50"
                              >
                                <CheckCircle2 size={14} /> Mark all complete
                              </button>
                            )}
                            {columns[col.key].length > 0 && (
                              <button
                                onClick={() => {
                                  setConfirmBulk({ action: 'archive', status: col.key });
                                  setColMenu(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 size={14} /> Archive all
                              </button>
                            )}
                            {columns[col.key].length === 0 && (
                              <p className="px-3 py-2 text-xs text-slate-400">No tasks in this column.</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {columns[col.key].map((item) =>
                      item.kind === 'group' ? (
                        <GroupCard
                          key={item.card.taskGroupId}
                          card={item.card}
                          opening={opening === item.card.taskGroupId}
                          dimmed={movingId === `group-${item.card.taskGroupId}` || (dragItem?.kind === 'group' && dragItem.id === item.card.taskGroupId)}
                          grip={
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label={`Drag ${item.card.title}`}
                              onPointerDown={(e) =>
                                beginDrag(
                                  { kind: 'group', id: item.card.taskGroupId, title: item.card.title, from: col.key },
                                  e,
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') openBroadcast(item.card.taskGroupId);
                              }}
                              className="cursor-grab touch-none rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
                            >
                              <GripVertical size={14} />
                            </span>
                          }
                          onOpen={() => {
                            if (suppressClick.current) return;
                            openBroadcast(item.card.taskGroupId);
                          }}
                        />
                      ) : (
                        <Link
                          key={item.task._id}
                          href={`/company/admin/tasks/${item.task._id}?internId=${idOf(item.task.internId)}`}
                          onClickCapture={(e) => {
                            if (suppressClick.current) {
                              e.preventDefault();
                              e.stopPropagation();
                            }
                          }}
                          className={`block overflow-hidden rounded-xl border border-slate-200 ${priorityTheme(item.task.priority).cardBg} transition-shadow hover:shadow-md ${
                            movingId === item.task._id || (dragItem?.kind === 'single' && dragItem.id === item.task._id) ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="h-1.5 w-full" style={{ backgroundColor: priorityTheme(item.task.priority).banner }} />
                          <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-slate-400">{item.task._id.slice(-8).toUpperCase()}</span>
                            <span className="flex shrink-0 items-center gap-1">
                              {item.task.priority && (
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityTheme(item.task.priority).chip}`}>
                                  {item.task.priority.toUpperCase()}
                                </span>
                              )}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Drag ${item.task.title}`}
                                onPointerDown={(e) =>
                                  beginDrag(
                                    { kind: 'single', id: item.task._id, title: item.task.title, from: col.key },
                                    e,
                                  )
                                }
                                className="cursor-grab touch-none rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing"
                              >
                                <GripVertical size={14} />
                              </span>
                            </span>
                          </div>
                          <p className="mt-2 break-words text-sm font-semibold text-slate-900">{item.task.title}</p>
                          {item.task.description && (
                            <p className="mt-1 break-words text-xs text-slate-400 line-clamp-2">{item.task.description}</p>
                          )}
                          <SingleAssignee internId={idOf(item.task.internId)} internMap={internMap} dueDate={item.task.dueDate} points={item.task.pointsAwarded} />
                          </div>
                        </Link>
                      ),
                    )}
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

      <ConfirmModal
        open={!!confirmBulk}
        title={confirmBulk?.action === 'archive' ? 'Archive all tasks in this column?' : 'Mark all tasks in this column complete?'}
        message="This applies to every task currently shown in the column."
        confirmLabel={confirmBulk?.action === 'archive' ? 'Archive all' : 'Mark complete'}
        loading={bulking}
        onConfirm={runBulkColumn}
        onCancel={() => setConfirmBulk(null)}
      />

      {/* Drag ghost (follows mouse / finger) */}
      {dragItem && (
        <div className="pointer-events-none fixed left-0 top-0 z-[200]">
          <div
            ref={ghostRef}
            className="flex w-64 items-center gap-2.5 rounded-xl border border-emerald-300 bg-white px-4 py-3 shadow-2xl"
          >
            <GripVertical size={15} className="shrink-0 text-emerald-500" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">
              {dragItem.title}
            </span>
            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
              {dragItem.kind === 'group' ? 'Group' : 'Task'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupCard({
  card,
  opening,
  onOpen,
  grip,
  dimmed,
}: {
  card: BroadcastCard;
  opening: boolean;
  onOpen: () => void;
  grip?: React.ReactNode;
  dimmed?: boolean;
}) {
  const members = card.members;
  const done = members.filter((m) => m.status === 'complete').length;
  const pct = members.length > 0 ? Math.round((done / members.length) * 100) : 0;
  const theme = priorityTheme(card.priority);
  return (
    <button
      onClick={onOpen}
      disabled={opening}
      className={`block w-full overflow-hidden rounded-xl border border-slate-200 ${theme.cardBg} text-left transition-shadow hover:shadow-md disabled:opacity-60 ${
        dimmed ? 'opacity-50' : ''
      }`}
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: theme.banner }} />
      <div className="p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
          <Calendar size={11} /> {formatDue(card.dueDate)}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {card.priority ? (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[card.priority] || 'bg-slate-100 text-slate-500'}`}>
              {card.priority.toUpperCase()}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <MessageSquare size={13} />
            </span>
          )}
          {grip}
        </span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">{card.title}</p>
      {card.description && (
        <p className="mt-1 break-words text-xs text-slate-400 line-clamp-2">{card.description}</p>
      )}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">{done}/{members.length} done</span>
          <span className="font-semibold text-emerald-600">{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m) => (
            <span
              key={m.internId}
              title={`${m.intern ? `${m.intern.firstName} ${m.intern.lastName}`.trim() : m.internId} · ${m.status.replace('_', ' ')}`}
              className="relative"
            >
              <InternAvatar
                src={m.intern?.profilePicture}
                firstName={m.intern?.firstName}
                lastName={m.intern?.lastName}
                email={m.intern?.email}
                className="h-7 w-7 border-2 border-white text-[9px]"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                  m.status === 'complete' ? 'bg-emerald-500'
                  : m.status === 'in_review' ? 'bg-blue-500'
                  : m.status === 'in_progress' ? 'bg-amber-400'
                  : 'bg-slate-300'
                }`}
              />
            </span>
          ))}
          {members.length > 5 && (
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-semibold text-slate-500">
              +{members.length - 5}
            </span>
          )}
        </div>
{opening ? (
<Loader2 size={15} className="animate-spin text-slate-400" />
) : (
<span className="text-xs font-medium text-slate-400">{members.length} member{members.length === 1 ? '' : 's'}</span>
)}
</div>
      </div>
    </button>
  );
}

function SingleAssignee({
  internId,
  internMap,
  dueDate,
  points,
}: {
  internId: string;
  internMap: Map<string, Intern>;
  dueDate?: string | null;
  points?: number | null;
}) {
  const intern = internMap.get(internId);
  return (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
      <div className="flex min-w-0 items-center gap-2">
        {intern ? (
          <>
            <InternAvatar
              src={intern.profilePicture?.secure_url}
              firstName={intern.firstName}
              lastName={intern.lastName}
              email={intern.email}
              className="h-6 w-6 text-[9px]"
            />
            <span className="truncate text-xs text-slate-500">
              {`${intern.firstName} ${intern.lastName}`.trim() || intern.email}
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={13} /> {formatDue(dueDate)}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
        {intern && (
          <span className="flex items-center gap-1">
            <Calendar size={13} /> {formatDue(dueDate)}
          </span>
        )}
        {points != null && <span className="font-medium text-emerald-600">{points} pts</span>}
        <MessageSquare size={13} />
      </div>
    </div>
  );
}
