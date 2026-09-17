'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  FileText,
  FolderKanban,
  Calendar,
  Users2,
  Palette,
  CheckCircle2,
  UploadCloud,
  Paperclip,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { projectService, CreateProjectPayload } from '@/features/company/services/project.service';
import { programService } from '@/features/company/services/program.service';
import { internService } from '@/features/company/services/intern.service';
import { Program, Intern } from '@/features/company/types/management';
import Select from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const COLOR_OPTIONS: { key: string; name: string; cls: string }[] = [
  { key: '#10B981', name: 'Emerald', cls: 'bg-emerald-500' },
  { key: '#3B82F6', name: 'Blue', cls: 'bg-blue-500' },
  { key: '#8B5CF6', name: 'Violet', cls: 'bg-violet-500' },
  { key: '#F59E0B', name: 'Amber', cls: 'bg-amber-400' },
  { key: '#EF4444', name: 'Rose', cls: 'bg-rose-500' },
];

export default function AddNewProjectScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [programInterns, setProgramInterns] = useState<Intern[]>([]);
  const [loadedProgramId, setLoadedProgramId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [programId, setProgramId] = useState(() => searchParams.get('programId') || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#10B981');
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!company?._id) return;
    (async () => {
      try {
        const [progRes, internRes] = await Promise.all([
          programService.listPrograms(company._id, { limit: 100 }),
          internService.listInterns(company._id, { status: 'active', limit: 100 }),
        ]);
        setPrograms(progRes.data.filter((p) => p.status === 'active' || p.status === 'upcoming'));
        setInterns(internRes.data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      }
    })();
  }, [company?._id]);

  useEffect(() => {
    if (!company?._id || !programId) return;
    (async () => {
      try {
        const res = await internService.listInterns(company._id, { programId });
        setProgramInterns(res.data);
        setLoadedProgramId(programId);
      } catch {
        setProgramInterns([]);
        setLoadedProgramId(programId);
      }
    })();
  }, [company?._id, programId]);

  const assignableInterns = programId && programId === loadedProgramId ? programInterns : interns;

  const toggleIntern = (internId: string) =>
    setSelectedInterns((prev) =>
      prev.includes(internId) ? prev.filter((id) => id !== internId) : [...prev, internId],
    );

  const handleCreate = async () => {
    if (!company?._id) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter a project name.';
    if (file && file.size > 10 * 1024 * 1024) errs.file = 'File must be 10MB or less.';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End date cannot be before start date.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const payload: CreateProjectPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        programId: programId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        color,
        file: file ?? undefined,
      };
      const created = await projectService.createProject(company._id, payload);
      if (selectedInterns.length) {
        await projectService.assignInterns(company._id, created._id, selectedInterns);
      }
      toastHelper.success('Project created');
      router.push('/company/admin/projects');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Projects" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Add New Project" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">New Project Details</h2>
              <p className="text-sm text-slate-500">Set up a new deliverable-based project for your interns.</p>
            </div>
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              Cancel <X size={14} />
            </button>
          </div>
          {programId && (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm text-emerald-700">
              Creating inside program: <span className="font-semibold">{programs.find((p) => p._id === programId)?.name || 'Selected program'}</span>
              {' '}— interns below are pre-filtered to this program.
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={18} className="text-emerald-500" /> Basic Information
                </h3>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Company Website Redesign"
                    className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                      fieldErrors.name ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.name && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.name}</p>}
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the project scope, goals, and expected deliverables..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">Associated Program</label>
                  <Select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    className="mt-2"
                  >
                    <option value="">No program...</option>
                    {programs.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </Select>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Palette size={18} className="text-emerald-500" /> Project Color
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setColor(c.key)}
                      aria-label={c.name}
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${c.cls} ${
                        color === c.key ? 'ring-2 ring-slate-900 ring-offset-2' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {color === c.key && <CheckCircle2 size={16} className="text-white" />}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Users2 size={18} className="text-emerald-500" /> Assign Interns
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {programId
                    ? `Showing interns enrolled in the selected program.`
                    : `Select a program above to list its enrolled interns, or assign from all active interns.`}
                </p>
                <div className="mt-4 space-y-1.5">
                  {assignableInterns.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                      {programId
                        ? 'No interns enrolled in the selected program yet.'
                        : 'No active interns to assign.'}
                    </p>
                  ) : (
                    assignableInterns.map((i) => {
                      const checked = selectedInterns.includes(i._id);
                      return (
                        <label
                          key={i._id}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                            checked ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
                            {`${i.firstName} ${i.lastName}`.trim().split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {`${i.firstName} ${i.lastName}`.trim() || i.email}
                            </p>
                            <p className="truncate text-xs text-slate-400">{i.email}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleIntern(i._id)}
                            className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Calendar size={18} className="text-emerald-500" /> Timeline
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
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
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Paperclip size={18} className="text-emerald-500" /> Attachment
                </h3>
                <p className="mt-1 text-xs text-slate-400">Upload a brief or deliverable file — you can replace it later.</p>
                <label className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 px-6 py-8 text-center ${
                    fieldErrors.file ? 'border-rose-400' : 'border-slate-200'
                  }`}>
                  <UploadCloud size={24} className="text-emerald-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">{file ? file.name : 'Choose a file'}</p>
                  <p className="text-xs text-slate-400">Maximum file size 10MB</p>
                  <input type="file" hidden accept=".pdf,.doc,.docx,.zip,.jpg,.png" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
                {fieldErrors.file && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.file}</p>}
                {file && (
                  <button
                    onClick={() => setFile(null)}
                    className="mt-2 text-xs font-medium text-rose-500 hover:text-rose-600"
                  >
                    Remove file
                  </button>
                )}
              </section>

              <section className="rounded-2xl flex gap-3 border border-emerald-100 bg-emerald-50/60 p-5">
                <FolderKanban size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Admin Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700/80">
                    Linking this project to a program keeps your deliverables organized by cohort.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Ready to publish?</p>
                <p className="text-xs text-slate-400">The project will be visible to assigned interns immediately.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
              <button disabled={submitting} onClick={handleCreate} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}