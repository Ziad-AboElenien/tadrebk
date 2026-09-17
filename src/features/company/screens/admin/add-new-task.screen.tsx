'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Save,
  FileText,
  Tag,
  Grid2x2,
  Calendar,
  Paperclip,
  Info,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { taskService, CreateTaskPayload } from '@/features/company/services/task.service';
import { projectService } from '@/features/company/services/project.service';
import { internService } from '@/features/company/services/intern.service';
import { programService } from '@/features/company/services/program.service';
import { Project, Intern, Program, TaskPriority, TaskTarget } from '@/features/company/types/management';
import Select from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const SUGGESTED_TAGS = ['Programming', 'Design', 'Documentation', 'Research', 'QA Testing'];

export default function AddNewTaskScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [target, setTarget] = useState<TaskTarget>(() =>
    searchParams.get('target') === 'program' ? 'program' : 'intern',
  );
  const [projectId, setProjectId] = useState('');
  const [programId, setProgramId] = useState(() => searchParams.get('programId') || '');
  const [internId, setInternId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!company?._id) return;
    (async () => {
      try {
        const [projRes, internRes, progRes] = await Promise.all([
          projectService.listProjects(company._id, { limit: 100 }),
          internService.listInterns(company._id, { status: 'active', limit: 100 }),
          programService.listPrograms(company._id, { limit: 100 }),
        ]);
        setProjects(projRes.data);
        setInterns(internRes.data);
        setPrograms(progRes.data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      }
    })();
  }, [company?._id]);

  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const addTag = (tag: string) => !tags.includes(tag) && setTags((t) => [...t, tag]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const picked = Array.from(e.target.files);
    setFieldErrors((prev) => ({ ...prev, files: picked.length > 10 ? 'You can attach up to 10 files.' : '' }));
    setFiles(picked.slice(0, 10));
    e.target.value = '';
  };

  const handleCreate = async () => {
    if (!company?._id) return;
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Please enter a task title.';
    if (!dueDate) errs.dueDate = 'Please choose a due date.';
    if (target === 'intern' && !internId) errs.internId = 'Please select an assignee.';
    if (target === 'program' && !programId) errs.programId = 'Please select a program.';
    if (target === 'project' && !projectId) errs.projectId = 'Please select a project.';
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const fields: CreateTaskPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        target,
        internId: target === 'intern' ? internId : undefined,
        programId: target === 'program' ? programId : undefined,
        projectId: target === 'project' ? projectId : target === 'intern' ? projectId || undefined : undefined,
        priority,
        tags,
        dueDate,
      };
      const result = await taskService.createTask(company._id, fields, files);
      if (result.tasks && result.count != null && result.count > 1) {
        toastHelper.success(`Task broadcast to ${result.count} member(s)`);
      } else {
        toastHelper.success('Task created and assigned');
      }
      router.push('/company/admin/tasks');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Add New Task" />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">New Task Details</h2>
              <p className="text-sm text-slate-500">Fill out the form below to create a task for one intern or broadcast it to many.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                Cancel <X size={14} />
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Save size={15} /> Save as Draft
              </button>
            </div>
          </div>
          {target === 'program' && programId && (
            <p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-sm text-emerald-700">
              Broadcasting to program: <span className="font-semibold">{programs.find((p) => p._id === programId)?.name || 'Selected program'}</span>
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
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">A brief and clear title for the task</p>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Optimize homepage load speed"
                    className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                      fieldErrors.title ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {fieldErrors.title && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.title}</p>}
                </div>

                <div className="mt-5">
                  <label className="text-sm font-medium text-slate-700">
                    Detailed Description <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-400">Explain the steps and expected outcomes clearly</p>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task details and technical requirements here..."
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Grid2x2 size={18} className="text-emerald-500" /> Assignment Target
                  </h3>
<div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Who is this task for? <span className="text-rose-500">*</span>
                        </label>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(
                            [
                              { key: 'intern', title: 'Single Intern', desc: 'Assign to one intern' },
                              { key: 'company', title: 'All Company', desc: 'Every active intern' },
                              { key: 'program', title: 'All in Program', desc: 'Interns of one program' },
                              { key: 'project', title: 'All in Project', desc: 'Interns of one project' },
                            ] as { key: TaskTarget; title: string; desc: string }[]
                          ).map((opt) => (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setTarget(opt.key)}
                              className={`rounded-xl border p-3 text-left transition ${
                                target === opt.key
                                  ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/30'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }`}
                            >
                              <p className="text-sm font-semibold text-slate-900">{opt.title}</p>
                              <p className="mt-0.5 text-xs text-slate-500">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {target === 'intern' && (
                        <>
                          <div>
                            <label className="text-sm font-medium text-slate-700">
                              Assignee (Intern) <span className="text-rose-500">*</span>
                            </label>
                            <Select
                              value={internId}
                              onChange={(e) => setInternId(e.target.value)}
                              placeholder="Select an intern..."
                              error={fieldErrors.internId}
                              className={`mt-2 ${fieldErrors.internId ? 'border-rose-400' : ''}`}
                            >
                              {interns.map((i) => (
                                <option key={i._id} value={i._id}>{`${i.firstName} ${i.lastName}`.trim() || i.email}</option>
                              ))}
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Select Project</label>
                            <Select
                              value={projectId}
                              onChange={(e) => setProjectId(e.target.value)}
                              placeholder="Select associated project..."
                              className="mt-2"
                            >
                              {projects.map((p) => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                              ))}
                            </Select>
                          </div>
                        </>
                      )}

                      {target === 'program' && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Select Program <span className="text-rose-500">*</span>
                          </label>
                          <Select
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            placeholder="Select a program..."
                            error={fieldErrors.programId}
                            className={`mt-2 ${fieldErrors.programId ? 'border-rose-400' : ''}`}
                          >
                            {programs.map((p) => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </Select>
                        </div>
                      )}

                      {target === 'project' && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">
                            Select Project <span className="text-rose-500">*</span>
                          </label>
                          <Select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            placeholder="Select associated project..."
                            error={fieldErrors.projectId}
                            className={`mt-2 ${fieldErrors.projectId ? 'border-rose-400' : ''}`}
                          >
                            {projects.map((p) => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </Select>
                        </div>
                      )}

                      {target === 'company' && (
                        <div className="rounded-xl bg-emerald-50/60 p-3.5 text-sm text-emerald-700">
                          This task will be created for <span className="font-semibold">{interns.length}</span> active intern(s) at this company.
                        </div>
                      )}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Calendar size={18} className="text-emerald-500" /> Timeline & Priority
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Due Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className={`w-full rounded-lg border bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                            fieldErrors.dueDate ? 'border-rose-400' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {fieldErrors.dueDate && <p className="mt-1 text-xs font-medium text-rose-500">{fieldErrors.dueDate}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Priority Level <span className="text-rose-500">*</span>
                      </label>
                      <div className="mt-2 flex gap-2">
                        {[
                          { key: 'high', cls: 'bg-rose-50 text-rose-500 ring-rose-200' },
                          { key: 'medium', cls: 'bg-amber-50 text-amber-600 ring-amber-200' },
                          { key: 'low', cls: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
                        ].map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            onClick={() => setPriority(p.key as TaskPriority)}
                            className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 ${p.cls} ${
                              priority === p.key ? 'ring-2' : 'ring-1'
                            }`}
                          >
                            {p.key}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Paperclip size={18} className="text-emerald-500" /> Attachments (Optional)
                </h3>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                  <UploadCloud size={28} className="text-emerald-400" />
                  <p className="mt-3 text-sm font-medium text-slate-700">Drag files here or click to upload</p>
                  <p className="text-xs text-slate-400">
                    {files.length > 0
                      ? `${files.length} of 10 file(s) selected. Maximum file size 10MB (PDF, JPG, PNG)`
                      : 'Upload up to 10 files · Maximum file size 10MB each (PDF, JPG, PNG)'}
                  </p>
                  <input type="file" multiple hidden onChange={handleFiles} />
                  <span className="mt-4 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50">
                    Browse Files
                  </span>
                </label>
                {fieldErrors.files && <p className="mt-2 text-xs font-medium text-rose-500">{fieldErrors.files}</p>}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="truncate text-slate-600">{f.name}</span>
                        <button onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))} aria-label={`Remove ${f.name}`}>
                          <X size={14} className="text-slate-400 hover:text-rose-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <Tag size={18} className="text-emerald-500" /> Tags & Classification
                </h3>
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700">Add Tag</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter a tag..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          e.preventDefault();
                          addTag((e.target as HTMLInputElement).value.trim());
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      {tag}
                      <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-400">Suggested Tags:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SUGGESTED_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 hover:bg-slate-200"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="flex gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <Info size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Admin Tip</p>
                  <p className="mt-1 text-xs leading-relaxed text-emerald-700/80">
                    Be sure to attach reference files or explanatory links to help the intern
                    understand the task and reduce the need for follow-up communication.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Publication Status Preview</h3>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Status:</dt>
                    <dd className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">Draft</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Visibility:</dt>
                    <dd className="font-medium text-slate-900">
                      {target === 'intern' ? 'Assigned Intern Only' : target === 'program' ? 'All Program Interns' : target === 'project' ? 'All Project Interns' : 'All Active Interns'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Notifications:</dt>
                    <dd className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 size={14} /> Enabled
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
                <p className="text-xs text-slate-400">Once you click Create, the intern will be notified immediately.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
              <button disabled={submitting} onClick={handleCreate} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create & Assign Task →'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
