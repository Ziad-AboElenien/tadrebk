'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Download,
  Plus,
  CheckCircle2,
  Ban,
  Layers,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Trash2,
  Play,
  Pause,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { internshipService } from '@/features/internship/services/internship.service';
import { Internship, getInternshipTracks } from '@/features/internship/types';
import { syncInternshipsClosedState, markInternshipClosed, markInternshipOpen } from '@/features/internship/utils/closedInternshipState';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type FilterKey = 'all' | 'active' | 'closed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
];

const STATE_STYLES = {
  active: 'bg-emerald-50 text-emerald-600',
  closed: 'bg-slate-100 text-slate-500',
} as const;

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InternsManagementScreen() {
  const router = useRouter();
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [busyRow, setBusyRow] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Internship | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInternships = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const all: Internship[] = [];
      const first = await internshipService.listInternships({ companyId, limit: 50 });
      all.push(...first.internships);
      const pages = first.pagination?.pages ?? 1;
      for (let p = 2; p <= pages; p++) {
        const next = await internshipService.listInternships({ companyId, page: p, limit: 50 });
        all.push(...next.internships);
      }
      setInternships(syncInternshipsClosedState(all));
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const t = setTimeout(fetchInternships, 0);
    return () => clearTimeout(t);
  }, [fetchInternships]);

  const counts = useMemo(() => {
    const closed = internships.filter((i) => i.closed).length;
    return { all: internships.length, active: internships.length - closed, closed };
  }, [internships]);

  const visibleInternships = useMemo(() => {
    const q = search.trim().toLowerCase();
    return internships.filter((i) => {
      if (filter === 'active' && i.closed) return false;
      if (filter === 'closed' && !i.closed) return false;
      if (q && !(i.title || '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [internships, filter, search]);

  const handleToggleState = async (internship: Internship) => {
    if (!companyId || busyRow) return;
    setBusyRow(internship._id);
    try {
      let updated: Internship;
      if (internship.closed) {
        updated = await internshipService.reopenInternship(companyId, internship._id);
        markInternshipOpen(internship._id);
        toastHelper.success('Internship reopened');
      } else {
        updated = await internshipService.closeInternship(companyId, internship._id);
        markInternshipClosed(internship._id);
        toastHelper.success('Internship closed');
      }
      setInternships((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i)),
      );
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setBusyRow(null);
      setMenuOpenId(null);
    }
  };

  const handleDelete = async () => {
    if (!companyId || !confirmDelete || deleting) return;
    setDeleting(true);
    try {
      await internshipService.deleteInternship(companyId, confirmDelete._id);
      toastHelper.success('Internship deleted');
      setInternships((prev) => prev.filter((i) => i._id !== confirmDelete._id));
      setConfirmDelete(null);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const stats = [
    { label: 'All Internships', value: String(counts.all), icon: Layers, iconColor: 'text-blue-600 bg-blue-50' },
    { label: 'Active', value: String(counts.active), icon: CheckCircle2, iconColor: 'text-emerald-600 bg-emerald-50' },
    { label: 'Closed', value: String(counts.closed), icon: Ban, iconColor: 'text-slate-500 bg-slate-100' },
  ];

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Interns Management" />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Interns Overview</h2>
              <p className="text-sm text-slate-500">Snapshot of your current internship postings.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Download size={15} /> Export Roster
              </button>
              <Link
                href="/company/post-internship"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                <Plus size={16} /> New Internship
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconColor}`}>
                    <s.icon size={18} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Postings</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Internship Postings</h3>
                <p className="text-sm text-slate-400">Manage and monitor all your internships.</p>
              </div>
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by title..."
                    className="w-64 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <button
                  onClick={() => setFilterOpen((v) => !v)}
                  aria-label="Filter internships"
                  className={`relative flex h-9 w-9 items-center justify-center rounded-lg border text-slate-500 transition-colors ${
                    filter !== 'all' ? 'border-emerald-300 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <SlidersHorizontal size={15} />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-11 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {FILTERS.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => {
                          setFilter(f.key);
                          setFilterOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          filter === f.key ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {f.label}
                        {filter === f.key && <CheckCircle2 size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              {loading ? (
                <div className="animate-pulse">
                  <div className="flex gap-16 border-b border-slate-100 pb-3 text-xs uppercase tracking-wide text-slate-400">
                    <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                    <div className="h-2.5 w-14 rounded-full bg-slate-200" />
                  </div>
                  <div className="divide-y divide-slate-50">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-16 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200" />
                          <div className="space-y-2">
                            <div className="h-3.5 w-28 rounded-full bg-slate-200" />
                            <div className="h-2.5 w-20 rounded-full bg-slate-200" />
                          </div>
                        </div>
                        <div className="h-3.5 w-32 rounded-full bg-slate-200" />
                        <div className="h-3.5 w-24 rounded-full bg-slate-200" />
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                        <div className="h-8 w-8 rounded-lg bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 pr-4 font-medium">Name</th>
                      <th className="py-3 pr-4 font-medium">Track</th>
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">State</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleInternships.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-sm text-slate-400">
                          No internships found.
                        </td>
                      </tr>
                    ) : (
                      visibleInternships.map((i) => {
                        const active = !i.closed;
                        const stateLabel = active ? 'Active' : 'Closed';
                        const tracks = getInternshipTracks(i);
                        return (
                          <tr
                            key={i._id}
                            onClick={() => router.push(`/company/admin/internships/${i._id}`)}
                            className="cursor-pointer transition-colors hover:bg-slate-50/50"
                          >
                            <td className="py-3.5 pr-4">
                              <p className="font-medium text-slate-900">{i.title || 'Untitled Internship'}</p>
                            </td>
                            <td className="py-3.5 pr-4">
                              {tracks.length ? (
                                <div className="flex max-w-xs flex-wrap gap-1">
                                  {tracks.slice(0, 2).map((t) => (
                                    <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                      {t}
                                    </span>
                                  ))}
                                  {tracks.length > 2 && <span className="text-xs text-slate-400">+{tracks.length - 2}</span>}
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-4 text-slate-500">{formatDate(i.createdAt)}</td>
                            <td className="py-3.5 pr-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATE_STYLES[active ? 'active' : 'closed']}`}>
                                {stateLabel}
                              </span>
                            </td>
                            <td className="relative py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId((v) => (v === i._id ? null : i._id));
                                }}
                                aria-label={`Actions for ${i.title}`}
                                className="inline-flex items-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {menuOpenId === i._id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                                  <div className="absolute right-0 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-lg">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleState(i);
                                      }}
                                      disabled={busyRow === i._id}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                      {active ? <Pause size={14} /> : <Play size={14} />}
                                      {active ? 'Close' : 'Reopen'}
                                    </button>
                                    <div className="my-1 h-px bg-slate-100" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDelete(i);
                                      }}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
              <span>Showing {visibleInternships.length} of {internships.length} results</span>
            </div>
          </div>
        </main>
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Internship"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}