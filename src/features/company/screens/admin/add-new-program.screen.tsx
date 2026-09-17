'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  Layers,
  Calendar,
  Users2,
  CheckCircle2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { programService, CreateProgramPayload } from '@/features/company/services/program.service';
import Select from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function AddNewProgramScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'upcoming' | 'active'>('upcoming');
  const [maxInterns, setMaxInterns] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleCreate = async () => {
    if (!company?._id) return;
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Please enter a program name.';
    if (!startDate) errs.startDate = 'Please choose a start date.';
    if (endDate && startDate && endDate < startDate) errs.endDate = 'End date cannot be before start date.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const payload: CreateProgramPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate: endDate || undefined,
        status,
        maxInterns: maxInterns ? Number(maxInterns) : undefined,
      };
      await programService.createProgram(company._id, payload);
      toastHelper.success('Program created');
      router.push('/company/admin/programs');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Programs" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Add New Program" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">New Program Details</h2>
              <p className="text-sm text-slate-500">Create an internship program cohort for your company.</p>
            </div>
            <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              Cancel <X size={14} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={18} className="text-emerald-500" /> Basic Information
                </h3>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">
                    Program Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Summer 2026 Internship Cohort"
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
                    placeholder="Describe the goals and scope of this program..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Calendar size={18} className="text-emerald-500" /> Timeline & Capacity
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">
                      Start Date <span className="text-rose-500">*</span>
                    </label>
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
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Users2 size={15} className="text-slate-400" /> Max Interns
                  </label>
                  <p className="text-xs text-slate-400">Leave empty for unlimited capacity.</p>
                  <input
                    type="number"
                    min={1}
                    value={maxInterns}
                    onChange={(e) => setMaxInterns(e.target.value)}
                    placeholder="e.g., 20"
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'upcoming' | 'active')}
                    className="mt-2"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                  </Select>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl flex gap-3 border border-emerald-100 bg-emerald-50/60 p-5">
                <Layers size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Admin Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700/80">
                    After creating the program you can enroll interns and assign tasks directly
                    from the program screen.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Program Preview</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Status:</dt>
                    <dd className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {status === 'active' ? 'Active' : 'Upcoming'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Enrollment:</dt>
                    <dd className="font-medium text-slate-900">0 / {maxInterns || '∞'} interns</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Visibility:</dt>
                    <dd className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 size={14} /> Active
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Ready to publish?</p>
                <p className="text-xs text-slate-400">The program will be visible to your company immediately.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
              <button disabled={submitting} onClick={handleCreate} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}