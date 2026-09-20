'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Users2,
  FolderKanban,
  Eye,
  PenLine,
  Trash2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ExpandableSearch from '@/components/ui/ExpandableSearch';
import GlassFilter from '@/components/ui/GlassFilter';
import { projectService } from '@/features/company/services/project.service';
import { programService } from '@/features/company/services/program.service';
import { Project, Program } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [projects, setProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Project | null>(null);
  const [archiving, setArchiving] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const [projRes, progRes] = await Promise.all([
        projectService.listProjects(companyId, { limit: 100 }),
        programService.listPrograms(companyId, { limit: 100 }),
      ]);
      setProjects(projRes.data);
      setPrograms(progRes.data);
      setTotal(projRes.pagination?.total ?? projRes.data.length);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchProjects, 0);
    return () => clearTimeout(t);
  }, [fetchProjects]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-row-menu]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleArchive = async () => {
    if (!companyId || !archiveTarget) return;
    setArchiving(true);
    try {
      await projectService.archiveProject(companyId, archiveTarget._id);
      toastHelper.success('Project archived');
      setArchiveTarget(null);
      setOpenMenuId(null);
      await fetchProjects();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setArchiving(false);
    }
  };

  const filtered = projects.filter((p) => {
    const statusMatch = filter === 'all' || p.status === filter;
    const term = search.trim().toLowerCase();
    const searchMatch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description ?? '').toLowerCase().includes(term);
    return statusMatch && searchMatch;
  });

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const internCount = projects.reduce((sum, p) => sum + (p.internIds?.length ?? 0), 0);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Projects" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Projects" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Internship Projects</h2>
              <p className="text-sm text-slate-500">Organize interns around deliverable-based projects.</p>
            </div>
            <Link
              href="/company/admin/projects/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Plus size={16} /> Create Project
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200/70">
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Total Projects</p>
                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{total}</p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Active</p>
                <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">{activeCount}</p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Interns Assigned</p>
                <p className="mt-1 text-xl font-bold text-blue-600 sm:text-2xl">{internCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3">
              <ExpandableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search projects..."
                id="projects-search"
              />
              <div className="flex min-w-0 flex-wrap gap-2">
                <GlassFilter
                  options={FILTERS}
                  value={filter}
                  onChange={(key) => setFilter(key)}
                  ariaLabel="Filter projects by status"
                  compact
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-5 animate-pulse sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <div className="h-24 bg-slate-200" />
                    <div className="space-y-2 p-5">
                      <div className="h-4 w-2/3 rounded-full bg-slate-200" />
                      <div className="h-3 w-full rounded-full bg-slate-100" />
                      <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
                <FolderKanban size={36} className="text-slate-200" />
                <p className="mt-3 text-sm font-medium text-slate-500">No projects found</p>
                <p className="text-xs text-slate-400">
                  {search || filter !== 'all' ? 'Try adjusting the search or filters.' : 'Create your first project to get started.'}
                </p>
                <Link
                  href="/company/admin/projects/new"
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <Plus size={16} /> Create Project
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((p) => {
                  const program = p.programId ? programs.find((pg) => pg._id === p.programId) : undefined;
                  const color = p.color ?? '#10B981';
                  return (
                    <div
                      key={p._id}
                      style={{ background: `linear-gradient(to bottom, ${color}14, rgba(255,255,255,0.4) 60%)` }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-white/60 shadow-lg shadow-slate-200/60 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      <div
                        className="relative flex h-24 items-center justify-between p-4"
                        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/25 text-white backdrop-blur-sm">
                          <FolderKanban size={20} />
                        </span>
                        <div className="absolute right-3 top-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId((cur) => (cur === p._id ? null : p._id));
                            }}
                            aria-label={`Actions for ${p.name}`}
                            className="inline-flex items-center rounded-lg p-2 text-white/90 hover:bg-white/20 hover:text-white"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenuId === p._id && (
                            <div data-row-menu className="absolute right-0 top-10 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm text-slate-600 shadow-lg">
                              <Link
                                href={`/company/admin/projects/${p._id}`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                              >
                                <Eye size={14} /> View Details
                              </Link>
                              <Link
                                href={`/company/admin/projects/${p._id}?mode=edit`}
                                onClick={() => setOpenMenuId(null)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50"
                              >
                                <PenLine size={14} /> Edit
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setArchiveTarget(p);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 size={14} /> Archive
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

<div className="flex flex-1 flex-col p-5">
<Link href={`/company/admin/projects/${p._id}`} className="block">
<p className="break-words text-lg font-semibold text-slate-900 group-hover:text-slate-700">{p.name}</p>
</Link>
<div className="mt-2">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        {p.description && (
                          <p className="mt-3 line-clamp-2 text-sm text-slate-500">{p.description}</p>
                        )}
                        <div className="mt-auto space-y-2 pt-4">
<div className="flex items-center justify-between gap-2 text-xs text-slate-500">
<span className="flex min-w-0 items-center gap-1.5">
<FolderKanban size={13} className="shrink-0 text-slate-400" />
<span className="truncate">{program ? program.name : 'No program'}</span>
</span>
</div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-slate-400" />
                              {p.startDate ? formatDate(p.startDate) : '—'}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users2 size={13} className="text-slate-400" /> {p.internIds?.length ?? 0} interns
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={!!archiveTarget}
        title="Archive this project?"
        message={archiveTarget ? `"${archiveTarget.name}" will no longer appear as active. This can be reversed later.` : ''}
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}