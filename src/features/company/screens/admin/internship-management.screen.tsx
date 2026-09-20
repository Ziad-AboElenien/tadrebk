'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Download,
  Plus,
  CheckCircle2,
  Clock,
  FileBarChart2,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  ArrowLeft,
  Users,
  XCircle,
  X,
  Mail,
  GraduationCap,
  Eye,
  FileText,
  Building2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import Select from '@/components/ui/Select';
import GlassFilter from '@/components/ui/GlassFilter';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService, Application } from '@/features/student/services/application.service';
import { Internship } from '@/features/internship/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type AppStatus = Application['status'] | 'all';

const STATUS_META: Record<Application['status'], { label: string; className: string }> = {
  accepted: { label: 'Active', className: 'bg-emerald-50 text-emerald-600' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600' },
  rejected: { label: 'Rejected', className: 'bg-slate-100 text-slate-500' },
};

const FILTERS: { key: AppStatus; label: string }[] = [
  { key: 'all', label: 'All Status' },
  { key: 'accepted', label: 'Active' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];

const PAGE_SIZE = 6;

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStudentLabel(app: Application): { name: string; email: string; dept: string; uni: string; initials: string } {
  const s = app.studentId;
  const name = s ? `${s.firstName} ${s.lastName}`.trim() : 'Unknown User';
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const edu = s?.education?.[0];
  return {
    name,
    email: s?.email || '',
    dept: edu?.field || '—',
    uni: edu?.institution || '—',
    initials: initials || '?',
  };
}

function StudentAvatar({ initials, src, alt }: { initials: string; src?: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
      {initials}
    </div>
  );
}

export default function InternshipManagementScreen() {
  const params = useParams();
  const router = useRouter();
  const internshipId = params.internshipId as string;
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AppStatus>('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [uniFilter, setUniFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; openUp: boolean } | null>(null);
  const [page, setPage] = useState(1);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!companyId || !internshipId) return;
    setLoading(true);
    try {
      const [internData, appData] = await Promise.all([
        internshipService.getInternshipById(internshipId),
        applicationService.getCompanyApplications(companyId, internshipId, { limit: 200 }),
      ]);
      setInternship(internData);
      setApplications(appData.applications);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, internshipId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const stats = useMemo(() => {
    const accepted = applications.filter((a) => a.status === 'accepted').length;
    const pending = applications.filter((a) => a.status === 'pending').length;
    return { accepted, pending, total: applications.length };
  }, [applications]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      const d = getStudentLabel(a).dept;
      if (d && d !== '—') set.add(d);
    });
    return Array.from(set).sort();
  }, [applications]);

  const universities = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => {
      const u = getStudentLabel(a).uni;
      if (u && u !== '—') set.add(u);
    });
    return Array.from(set).sort();
  }, [applications]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filter !== 'all') n += 1;
    if (deptFilter !== 'all') n += 1;
    if (uniFilter !== 'all') n += 1;
    return n;
  }, [filter, deptFilter, uniFilter]);

  const hasActiveFilters = activeFilterCount > 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (filter !== 'all' && a.status !== filter) return false;
      const { dept, uni } = getStudentLabel(a);
      if (deptFilter !== 'all' && dept !== deptFilter) return false;
      if (uniFilter !== 'all' && uni !== uniFilter) return false;
      if (!q) return true;
      const { name, email } = getStudentLabel(a);
      return [name, email, dept, uni].some((v) => v.toLowerCase().includes(q));
    });
  }, [applications, filter, deptFilter, uniFilter, search]);

  const roster = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (a.status !== 'accepted') return false;
      const { dept, uni } = getStudentLabel(a);
      if (deptFilter !== 'all' && dept !== deptFilter) return false;
      if (uniFilter !== 'all' && uni !== uniFilter) return false;
      if (!q) return true;
      const { name, email } = getStudentLabel(a);
      return [name, email, dept, uni].some((v) => v.toLowerCase().includes(q));
    });
  }, [applications, deptFilter, uniFilter, search]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleReview = async (app: Application, status: 'accepted' | 'rejected') => {
    if (!companyId || reviewingId) return;
    setReviewingId(app._id);
    try {
      await applicationService.reviewApplication(companyId, internshipId, app._id, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === app._id ? { ...a, status } : a)),
      );
      toastHelper.success(status === 'accepted' ? 'Application accepted' : 'Application rejected');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setReviewingId(null);
      setMenuOpenId(null);
      setMenuRect(null);
    }
  };

  const handleComplete = async (app: Application) => {
    if (!companyId || completingId) return;
    setCompletingId(app._id);
    try {
      await applicationService.completeApplication(companyId, internshipId, app._id);
      setApplications((prev) =>
        prev.map((a) => (a._id === app._id ? { ...a, completed: true } : a)),
      );
      toastHelper.success('Application marked as completed');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setCompletingId(null);
      setMenuOpenId(null);
      setMenuRect(null);
    }
  };

  const handleSendEmail = async (app: Application) => {
    if (!companyId || sendingEmailId) return;
    setSendingEmailId(app._id);
    try {
      await applicationService.sendAcceptanceEmail(companyId, internshipId, app._id);
      toastHelper.success('Acceptance email sent');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSendingEmailId(null);
      setMenuOpenId(null);
      setMenuRect(null);
    }
  };

  function exportRoster() {
    if (roster.length === 0) return;
    const head = ['Name', 'Email', 'Department', 'University', 'Start Date'];
    const rows = roster.map((a) => {
      const { name, email, dept, uni } = getStudentLabel(a);
      return [name, email, dept, uni, formatDate(a.createdAt)].map((c) => `"${c.replace(/"/g, '""')}"`);
    });
    const csv = [head, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${internship?.title || 'internship'}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const statCards = [
    { label: 'Total Active Interns', value: String(stats.accepted), icon: CheckCircle2, iconColor: 'text-emerald-600 bg-emerald-50', sub: 'Currently enrolled' },
    { label: 'Pending Onboarding', value: String(stats.pending), icon: Clock, iconColor: 'text-blue-600 bg-blue-50', sub: 'Awaiting review' },
    { label: 'Avg. Performance', value: '—', icon: FileBarChart2, iconColor: 'text-amber-600 bg-amber-50', sub: 'Available after evaluations' },
    { label: 'Evaluations Due', value: '—', icon: AlertCircle, iconColor: 'text-rose-500 bg-rose-50', sub: 'Rate students on their profile' },
  ];

  const filterOuterOpen = filterOpen;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title={internship?.title || 'Internship Management'} />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/company/admin/interns"
                className="mb-3 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={15} /> Back to Interns
              </Link>
              <h2 className="break-words text-2xl font-semibold text-slate-900">Internship Overview</h2>
              <p className="text-sm text-slate-500">Snapshot of your current internship talent pool.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportRoster}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Download size={15} /> Export Roster
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.iconColor}`}>
                    <s.icon size={18} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {stats.total} total
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Applications</h3>
                <p className="text-sm text-slate-400">Review and manage all internship applications.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Filter by name, uni, or email..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 sm:w-64"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen((v) => !v)}
                    aria-label="Filter applications"
                    aria-expanded={filterOpen}
                    className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                      hasActiveFilters
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Filter size={14} /> Filter
                    {activeFilterCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {filterOuterOpen && (
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
                              <CheckCircle2 size={12} /> Status
                            </p>
                            <div className="mt-2">
                              <GlassFilter
                                options={FILTERS}
                                value={filter}
                                onChange={(key) => {
                                  setFilter(key as AppStatus);
                                  setPage(1);
                                }}
                                ariaLabel="Filter applications by status"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="dept-filter" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              <GraduationCap size={12} /> Department
                            </label>
                            <Select
                              id="dept-filter"
                              value={deptFilter}
                              onChange={(e) => {
                                setDeptFilter(e.target.value);
                                setPage(1);
                              }}
                              placeholder="All Departments"
                              className="mt-2"
                            >
                              <option value="all">All Departments</option>
                              {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label htmlFor="uni-filter" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                              <Building2 size={12} /> University
                            </label>
                            <Select
                              id="uni-filter"
                              value={uniFilter}
                              onChange={(e) => {
                                setUniFilter(e.target.value);
                                setPage(1);
                              }}
                              placeholder="All Universities"
                              className="mt-2"
                            >
                              <option value="all">All Universities</option>
                              {universities.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                          <button
                            onClick={() => {
                              setDeptFilter('all');
                              setUniFilter('all');
                              setFilter('all');
                              setSearch('');
                              setPage(1);
                            }}
                            disabled={activeFilterCount === 0 && !search.trim()}
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
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-3 pr-4 font-medium">Intern Profile</th>
                      <th className="py-3 pr-4 font-medium">Department &amp; University</th>
                      <th className="py-3 pr-4 font-medium">Enrollment Status</th>
                      <th className="py-3 pr-4 font-medium">Date</th>
                      <th className="py-3 pr-4 font-medium">View Application</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paged.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-sm text-slate-400">
                          <Users size={24} className="mx-auto mb-2 text-slate-200" />
                          No interns found for this internship.
                        </td>
                      </tr>
                    ) : (
                      paged.map((app) => {
                        const meta = STATUS_META[app.status];
                        const { name, email, dept, uni, initials } = getStudentLabel(app);
                        const studentId = app.studentId?._id;
                        return (
                          <tr key={app._id} className="transition-colors hover:bg-slate-50/50">
                            <td className="py-3.5 pr-4">
                              <Link
                                href={studentId ? `/company/admin/interns/${studentId}` : '#'}
                                className="flex items-center gap-3"
                              >
<StudentAvatar initials={initials} src={app.studentId?.profilePicture?.secure_url} alt={name} />
<div className="min-w-0">
<p className="truncate font-medium text-slate-900">{name}</p>
<p className="truncate text-xs text-slate-400">{email}</p>
</div>
                              </Link>
                            </td>
                            <td className="py-3.5 pr-4">
                              <p className="text-slate-700">{dept}</p>
                              <p className="text-xs text-slate-400">{uni}</p>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar size={12} className="shrink-0 text-slate-400" /> {formatDate(app.createdAt)}
                              </span>
                            </td>
                            <td className="py-3.5 pr-4">
                              <Link
                                href={`/company/admin/internships/${internshipId}/applications/${app._id}`}
                                aria-label="View application"
                                title="View application"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Eye size={16} />
                              </Link>
                            </td>
                            <td className="relative py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  if (menuOpenId === app._id) {
                                    setMenuOpenId(null);
                                    setMenuRect(null);
                                    return;
                                  }
                                  const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                                  const menuHeight = app.status === 'pending' ? 184 : app.status === 'accepted' ? 232 : 128;
                                  const spaceBelow = window.innerHeight - rect.bottom;
                                  const openUp = spaceBelow < menuHeight;
                                  setMenuRect({
                                    top: openUp ? rect.top - 12 : rect.bottom + 4,
                                    left: rect.left,
                                    openUp,
                                  });
                                  setMenuOpenId(app._id);
                                }}
                                aria-label={`Actions for ${name}`}
                                className="inline-flex items-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <MoreHorizontal size={16} />
                              </button>

                              {menuOpenId === app._id && menuRect && (
                                <>
                                  <div className="fixed inset-0 z-30" onClick={() => { setMenuOpenId(null); setMenuRect(null); }} />
                                  <div
                                    className="fixed z-40 w-56 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl"
                                    style={{
                                      top: menuRect.top,
                                      left: menuRect.left,
                                      transform: `translateX(-100%) ${menuRect.openUp ? 'translateY(-100%)' : ''}`,
                                    }}
                                  >
                                    {app.status === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => handleReview(app, 'accepted')}
                                          disabled={!!reviewingId}
                                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                        >
                                          <CheckCircle2 size={14} /> Accept Application
                                        </button>
                                        <button
                                          onClick={() => handleReview(app, 'rejected')}
                                          disabled={!!reviewingId}
                                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                        >
                                          <XCircle size={14} /> Reject Application
                                        </button>
                                        <div className="my-1 h-px bg-slate-100" />
                                      </>
                                    )}

                                    {app.status === 'accepted' && !app.completed && (
                                      <>
                                        <button
                                          onClick={() => handleComplete(app)}
                                          disabled={!!completingId}
                                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                          <CheckCircle2 size={14} /> Mark Complete
                                        </button>
                                        <button
                                          onClick={() => handleSendEmail(app)}
                                          disabled={!!sendingEmailId}
                                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                        >
                                          <Mail size={14} /> Send Acceptance Email
                                        </button>
                                        <div className="my-1 h-px bg-slate-100" />
                                      </>
                                    )}

                                    {app.status === 'accepted' && (
                                      <button
                                        onClick={() =>
                                          router.push(`/company/internships/${internshipId}/compose-email?target=${app._id}`)
                                        }
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                      >
                                        <Mail size={14} /> Send Email
                                      </button>
                                    )}

                                    <Link
                                      href={studentId ? `/company/admin/interns/${studentId}` : '#'}
                                      onClick={() => { setMenuOpenId(null); setMenuRect(null); }}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                    >
                                      <GraduationCap size={14} /> View Profile
                                    </Link>
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

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
              <span>Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} results</span>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`h-8 w-8 rounded-full text-sm ${
                        page === n ? 'bg-emerald-500 font-medium text-white' : 'hover:bg-slate-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Talent Roster</h3>
                <p className="text-sm text-slate-400">Manage and monitor all currently enrolled interns.</p>
              </div>
              <button
                onClick={exportRoster}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Download size={15} /> Export Roster
              </button>
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
                      <th className="py-3 pr-4 font-medium">Intern Profile</th>
                      <th className="py-3 pr-4 font-medium">Department &amp; University</th>
                      <th className="py-3 pr-4 font-medium">Start Date</th>
                      <th className="py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roster.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                          <Users size={24} className="mx-auto mb-2 text-slate-200" />
                          No accepted interns yet.
                        </td>
                      </tr>
                    ) : (
                      roster.map((app) => {
                        const { name, email, dept, uni, initials } = getStudentLabel(app);
                        const studentId = app.studentId?._id;
                        return (
                          <tr key={app._id} className="transition-colors hover:bg-slate-50/50">
                            <td className="py-3.5 pr-4">
                              <Link
                                href={studentId ? `/company/admin/interns/${studentId}` : '#'}
                                className="flex items-center gap-3"
                              >
<StudentAvatar initials={initials} src={app.studentId?.profilePicture?.secure_url} alt={name} />
<div className="min-w-0">
<p className="truncate font-medium text-slate-900">{name}</p>
<p className="truncate text-xs text-slate-400">{email}</p>
</div>
                              </Link>
                            </td>
                            <td className="py-3.5 pr-4">
                              <p className="text-slate-700">{dept}</p>
                              <p className="text-xs text-slate-400">{uni}</p>
                            </td>
                            <td className="py-3.5 pr-4">
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <Calendar size={13} className="text-slate-400" /> {formatDate(app.createdAt)}
                              </span>
                            </td>
                            <td className="relative py-3.5 text-right">
                              <Link
                                href={studentId ? `/company/admin/interns/${studentId}` : '#'}
                                className="inline-flex items-center rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                aria-label={`View ${name}`}
                              >
                                <MoreHorizontal size={16} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 text-sm text-slate-400">
              Showing {roster.length} of {roster.length} accepted interns
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}