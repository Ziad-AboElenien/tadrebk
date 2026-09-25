'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  MoreHorizontal,
  Calendar,
  Users2,
  Layers,
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
import { programService } from '@/features/company/services/program.service';
import { Program } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-600',
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProgramsScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Program | null>(null);
  const [archiving, setArchiving] = useState(false);

  const fetchPrograms = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await programService.listPrograms(companyId, { limit: 100 });
      setPrograms(res.data);
      setTotal(res.pagination?.total ?? res.data.length);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchPrograms, 0);
    return () => clearTimeout(t);
  }, [fetchPrograms]);

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
      await programService.archiveProgram(companyId, archiveTarget._id);
      toastHelper.success('Program archived');
      setArchiveTarget(null);
      setOpenMenuId(null);
      await fetchPrograms();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setArchiving(false);
    }
  };

  const filtered = programs.filter((p) => {
    const statusMatch = filter === 'all' || p.status === filter;
    const term = search.trim().toLowerCase();
    const searchMatch =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description ?? '').toLowerCase().includes(term);
    return statusMatch && searchMatch;
  });

  const activeCount = programs.filter((p) => p.status === 'active').length;
  const upcomingCount = programs.filter((p) => p.status === 'upcoming').length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Programs" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Programs" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Internship Programs</h2>
              <p className="text-sm text-slate-500">Manage onboarding rounds, cohorts, and enrollment.</p>
            </div>
            <Link
              href="/company/admin/programs/new"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
            >
              <Plus size={16} /> Create Program
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
            <div className="grid grid-cols-3 divide-x divide-slate-200/70">
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Total Programs</p>
                <p className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{total}</p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Active</p>
                <p className="mt-1 text-xl font-bold text-emerald-600 sm:text-2xl">{activeCount}</p>
              </div>
              <div className="px-2 text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 sm:text-xs">Upcoming</p>
                <p className="mt-1 text-xl font-bold text-blue-600 sm:text-2xl">{upcomingCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3">
              <ExpandableSearch
                value={search}
                onChange={setSearch}
                placeholder="Search programs..."
                id="programs-search"
              />
              <div className="flex min-w-0 flex-wrap gap-2">
                <GlassFilter
                  options={FILTERS}
                  value={filter}
                  onChange={(key) => setFilter(key)}
                  ariaLabel="Filter programs by status"
                  compact
                />
              </div>
            </div>

            {loading ? (
              <div className="mt-8 space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
                <Layers size={36} className="text-slate-200" />
                <p className="mt-3 text-sm font-medium text-slate-500">No programs found</p>
                <p className="text-xs text-slate-400">
                  {search || filter !== 'all' ? 'Try adjusting the search or filters.' : 'Create your first program to get started.'}
                </p>
                <Link
                  href="/company/admin/programs/new"
                  className="mt-4 flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  <Plus size={16} /> Create Program
                </Link>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 pr-4">Program</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Start Date</th>
                      <th className="py-3 pr-4">Interns</th>
                      <th className="py-3 pr-4">Capacity</th>
                      <th className="py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((p) => (
                      <tr key={p._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="py-3.5 pr-4">
                          <Link href={`/company/admin/programs/${p._id}`} className="flex min-w-0 items-start gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                              <Layers size={16} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{p.name}</p>
                              {p.description && <p className="truncate text-xs text-slate-400 max-w-xs">{p.description}</p>}
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-500'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar size={13} className="text-slate-400" /> {formatDate(p.startDate)}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500">
                          <span className="flex items-center gap-1.5"><Users2 size={13} className="text-slate-400" /> {p.internIds?.length ?? 0}</span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500">{p.maxInterns ? `${p.internIds?.length ?? 0}/${p.maxInterns}` : 'Unlimited'}</td>
                        <td className="py-3.5 text-right">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId((cur) => (cur === p._id ? null : p._id));
                              }}
                              onKeyDown={(e) => { if (e.key === 'Escape') setOpenMenuId(null); }}
                              aria-label={`Actions for ${p.name}`}
                              aria-haspopup="menu"
                              aria-expanded={openMenuId === p._id}
                              className="inline-flex items-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openMenuId === p._id && (
                              <div data-row-menu role="menu" aria-label={`Actions for ${p.name}`} className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-sm shadow-lg">
                                <Link
                                  href={`/company/admin/programs/${p._id}`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
                                >
                                  <Eye size={14} /> View Details
                                </Link>
                                <Link
                                  href={`/company/admin/programs/${p._id}?mode=edit`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50"
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
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={!!archiveTarget}
        title="Archive this program?"
        message={archiveTarget ? `"${archiveTarget.name}" will no longer appear as active. This can be reversed later.` : ''}
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}