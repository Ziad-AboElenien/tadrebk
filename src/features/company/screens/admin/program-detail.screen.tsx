'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Users2,
  Trash2,
  Save,
  X,
  Plus,
  Check,
  PenLine,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Select from '@/components/ui/Select';
import { programService } from '@/features/company/services/program.service';
import { internService } from '@/features/company/services/intern.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import { Internship } from '@/features/internship/types';
import { Program, Intern } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_STYLES: Record<string, string> = {
  upcoming: 'bg-blue-50 text-blue-600',
  active: 'bg-emerald-50 text-emerald-600',
  completed: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

const STATUS_OPTIONS: Program['status'][] = ['upcoming', 'active', 'completed', 'archived'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProgramDetailScreen() {
  const params = useParams();
  const programId = params.programId as string;
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [program, setProgram] = useState<Program | null>(null);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<'view' | 'edit'>(() =>
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'edit'
      ? 'edit'
      : 'view',
  );

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Program['status']>('upcoming');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxInterns, setMaxInterns] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [showEnroll, setShowEnroll] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [enrolling, setEnrolling] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState('');

  const [internships, setInternships] = useState<Internship[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [internshipStudents, setInternshipStudents] = useState<Intern[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const fetchProgram = useCallback(async () => {
    if (!companyId || !programId) return;
    setLoading(true);
    try {
      const progRes = await programService.getProgram(companyId, programId);
      setProgram(progRes);
      setName(progRes.name);
      setDescription(progRes.description ?? '');
      setStatus(progRes.status ?? 'upcoming');
      setStartDate(progRes.startDate ? progRes.startDate.slice(0, 10) : '');
      setEndDate(progRes.endDate ? progRes.endDate.slice(0, 10) : '');
      setMaxInterns(progRes.maxInterns != null ? String(progRes.maxInterns) : '');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, programId]);

  const fetchInterns = useCallback(async () => {
    if (!companyId) return;
    try {
      const internRes = await internService.listInterns(companyId, { limit: 100 });
      if (internRes.data.length > 0) {
        setInterns(internRes.data);
        return;
      }

      const internships = await internshipService.listInternships({ companyId, limit: 100 });
      const accepted: Intern[] = [];
      const seen = new Set<string>();
      for (const ip of internships.internships) {
        try {
          const apps = await applicationService.getCompanyApplications(companyId, ip._id, {
            status: 'accepted',
            limit: 200,
          });
          for (const a of apps.applications) {
            const s = a.studentId;
            if (!s?._id || seen.has(s._id)) continue;
            seen.add(s._id);
            accepted.push({
              _id: s._id,
              firstName: s.firstName ?? '',
              lastName: s.lastName ?? '',
              email: s.email ?? '',
              role: 'intern',
              isConfirmed: true,
              totalPoints: 0,
            });
          }
        } catch {
          // ignore per-internship failures
        }
      }
      setInterns(accepted);
    } catch {
      setInterns([]);
    }
  }, [companyId]);

  const fetchInternships = useCallback(async () => {
    if (!companyId) return;
    try {
      const res = await internshipService.listInternships({ companyId, limit: 100 });
      setInternships(res.internships.filter((ip) => !ip.closed));
    } catch {
      setInternships([]);
    }
  }, [companyId]);

  const handleInternshipSelect = useCallback(
    async (internshipId: string) => {
      if (!companyId || !internshipId) return;
      setSelectedInternshipId(internshipId);
      setSelected([]);
      setInternshipStudents([]);
      setLoadingStudents(true);
      try {
        const apps = await applicationService.getCompanyApplications(companyId, internshipId, {
          status: 'accepted',
          limit: 200,
        });
        const students: Intern[] = [];
        const seen = new Set<string>();
        for (const app of apps.applications) {
          const s = app.studentId;
          if (!s?._id || seen.has(s._id)) continue;
          seen.add(s._id);
          students.push({
            _id: s._id,
            firstName: s.firstName ?? '',
            lastName: s.lastName ?? '',
            email: s.email ?? '',
            role: 'intern',
            isConfirmed: true,
            totalPoints: 0,
          });
        }
        setInternshipStudents(students);
      } catch {
        setInternshipStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    const t = setTimeout(fetchProgram, 0);
    return () => clearTimeout(t);
  }, [fetchProgram]);

  useEffect(() => {
    const t = setTimeout(fetchInterns, 0);
    return () => clearTimeout(t);
  }, [fetchInterns]);

  useEffect(() => {
    const t = setTimeout(fetchInternships, 0);
    return () => clearTimeout(t);
  }, [fetchInternships]);

  if (loading) {
    return (
      <div className="flex bg-slate-50">
        <Sidebar active="Programs" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Program Details" />
          <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="h-9 w-64 rounded-lg bg-slate-200" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
              </div>
              <div className="space-y-6">
                <div className="h-72 rounded-2xl border border-slate-200 bg-white" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="flex bg-slate-50">
        <Sidebar active="Programs" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Program Details" />
          <div className="py-20 text-center text-sm text-slate-400">Program not found.</div>
        </div>
      </div>
    );
  }

  const enrolledInterns = interns.filter((i) => program.internIds.includes(i._id));

  const handleSaveEdit = async () => {
    if (!companyId) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Program name is required.';
    if (!startDate) errs.startDate = 'Start date is required.';
    if (endDate && startDate && endDate < startDate) errs.endDate = 'End date cannot be before start date.';
    if (maxInterns && Number(maxInterns) < 1) errs.maxInterns = 'Max interns must be at least 1.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSavingEdit(true);
    try {
      await programService.updateProgram(companyId, programId, {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate,
        endDate: endDate || undefined,
        maxInterns: maxInterns ? Number(maxInterns) : undefined,
      });
      await fetchProgram();
      setMode('view');
      toastHelper.success('Program updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleSelect = (internId: string) =>
    setSelected((prev) => (prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId]));

  const handleEnroll = async () => {
    if (!companyId) return;
    if (selected.length === 0) {
      toastHelper.error('Select at least one intern to enroll.');
      return;
    }
    setEnrolling(true);
    try {
      await programService.enrollInterns(companyId, programId, selected);
      setShowEnroll(false);
      setSelected([]);
      await Promise.all([fetchProgram(), fetchInterns()]);
      toastHelper.success(`${selected.length} intern(s) enrolled`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (internId: string) => {
    if (!companyId) return;
    setUnenrollingId(internId);
    try {
      await programService.unenrollIntern(companyId, programId, internId);
      await Promise.all([fetchProgram(), fetchInterns()]);
      toastHelper.success('Intern removed from program');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setUnenrollingId('');
    }
  };

  const handleArchive = async () => {
    if (!companyId) return;
    setArchiving(true);
    try {
      await programService.archiveProgram(companyId, programId);
      toastHelper.success('Program archived');
      window.location.href = '/company/admin/programs';
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
      setConfirmArchive(false);
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Programs" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Program Details" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/programs" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Programs
              </Link>
              <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${STATUS_STYLES[program.status] || 'bg-slate-100 text-slate-500'}`}>
                {program.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setConfirmArchive(true)}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-rose-500 hover:bg-rose-50"
              >
                <Trash2 size={15} /> Archive
              </button>
              {mode === 'view' ? (
                <>
                  <button
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <PenLine size={15} /> Edit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setMode('view')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <X size={15} /> Cancel
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={18} className="text-emerald-500" /> Program Details
                </h3>

                {mode === 'view' ? (
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Program Name</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{program.name}</p>
                    </div>
                    {program.description && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
                        <p className="mt-1 text-sm text-slate-600">{program.description}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Start Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(program.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">End Date</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{program.endDate ? formatDate(program.endDate) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Max Interns</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">
                          {program.maxInterns ? program.maxInterns : 'Unlimited'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Status</p>
                        <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[program.status] || 'bg-slate-100 text-slate-500'}`}>
                          {program.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Program Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.name ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.name && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Status</label>
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as Program['status'])}
                      className="mt-2"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Max Interns</label>
                    <input
                      type="number"
                      min={1}
                      value={maxInterns}
                      onChange={(e) => setMaxInterns(e.target.value)}
                      placeholder="Unlimited"
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.maxInterns ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.maxInterns && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.maxInterns}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.startDate ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.startDate && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.startDate}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                        fieldErrors.endDate ? 'border-rose-400' : 'border-slate-200'
                      }`}
                    />
                    {fieldErrors.endDate && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.endDate}</p>}
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={handleSaveEdit}
                    disabled={savingEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    <Save size={15} /> {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => setMode('view')}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
                </>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Users2 size={18} className="text-emerald-500" /> Enrolled Interns
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    {enrolledInterns.length}{program.maxInterns ? `/${program.maxInterns}` : ''}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {enrolledInterns.length === 0 ? (
                    <p className="text-sm text-slate-400">No interns enrolled yet.</p>
                  ) : (
                    enrolledInterns.map((i) => (
                      <div key={i._id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                          {initials(`${i.firstName} ${i.lastName}`.trim()) || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {`${i.firstName} ${i.lastName}`.trim() || i.email}
                          </p>
                          <p className="truncate text-xs text-slate-400">{i.email}</p>
                        </div>
                        <button
                          onClick={() => handleUnenroll(i._id)}
                          disabled={unenrollingId === i._id}
                          aria-label={`Remove ${i.firstName}`}
                          className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Calendar size={18} className="text-emerald-500" /> Timeline
                </h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Start</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.startDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">End</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.endDate)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="font-medium text-slate-900">{formatDate(program.createdAt)}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>
        </main>
      </div>

      {showEnroll && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEnroll(false)} />
          <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Assign Members</h3>
              <button onClick={() => setShowEnroll(false)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-400">Pick an internship, then choose the accepted interns to assign to “{program.name}”.</p>

            <div className="mt-4">
              <label className="text-sm font-medium text-slate-700">Internship</label>
              <Select
                value={selectedInternshipId}
                onChange={(e) => handleInternshipSelect(e.target.value)}
                placeholder="Select an internship..."
                className="mt-2"
              >
                {internships.map((ip) => (
                  <option key={ip._id} value={ip._id}>{ip.title}</option>
                ))}
              </Select>
              {internships.length === 0 && (
                <p className="mt-2 text-xs text-slate-400">No active internships for this company yet.</p>
              )}
            </div>

            {selectedInternshipId && (
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-700">
                  Accepted Interns <span className="font-normal text-slate-400">({internshipStudents.length})</span>
                </p>

                {loadingStudents ? (
                  <div className="mt-2 space-y-2 animate-pulse">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : internshipStudents.length === 0 ? (
                  <p className="mt-2 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                    No accepted interns in this internship yet.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {internshipStudents.map((i) => {
                      const checked = selected.includes(i._id);
                      const alreadyAssigned = program.internIds.includes(i._id);
                      return (
                        <label
                          key={i._id}
                          className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                            alreadyAssigned
                              ? 'cursor-not-allowed border-slate-100 opacity-60'
                              : `cursor-pointer ${checked ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 hover:bg-slate-50'}`
                          }`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                            {initials(`${i.firstName} ${i.lastName}`.trim()) || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {`${i.firstName} ${i.lastName}`.trim() || i.email}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {i.email}{alreadyAssigned ? ' · Already assigned' : ''}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={alreadyAssigned}
                            onChange={() => toggleSelect(i._id)}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-3">
              <button onClick={() => setShowEnroll(false)} className="text-sm text-slate-500 hover:text-slate-700">
                Cancel
              </button>
              <button
                onClick={handleEnroll}
                disabled={enrolling || selected.length === 0}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                <Check size={15} /> {enrolling ? 'Assigning...' : `Assign ${selected.length}`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmArchive}
        title="Archive this program?"
        message="Archived programs will no longer appear as active. This can be reversed later."
        confirmLabel="Archive"
        loading={archiving}
        onConfirm={handleArchive}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}