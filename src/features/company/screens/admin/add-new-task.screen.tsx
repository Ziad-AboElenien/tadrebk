'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { taskService, CreateTaskFields } from '@/features/company/services/task.service';
import { projectService } from '@/features/company/services/project.service';
import { internService } from '@/features/company/services/intern.service';
import { Project, Intern, TaskPriority } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const SUGGESTED_TAGS = ['Programming', 'Design', 'Documentation', 'Research', 'QA Testing'];

export default function AddNewTaskScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [internId, setInternId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!company?._id) return;
    (async () => {
      try {
        const [projRes, internRes] = await Promise.all([
          projectService.listProjects(company._id, { limit: 100 }),
          internService.listInterns(company._id, { status: 'active', limit: 100 }),
        ]);
        setProjects(projRes.data);
        setInterns(internRes.data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      }
    })();
  }, [company?._id]);

  const removeTag = (tag: string) => setTags((t) => t.filter((x) => x !== tag));
  const addTag = (tag: string) => !tags.includes(tag) && setTags((t) => [...t, tag]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files).slice(0, 10));
  };

  const handleCreate = async () => {
    if (!company?._id) return;
    if (!title.trim() || !internId || !dueDate) {
      toastHelper.error('Please fill title, assignee and due date.');
      return;
    }
    setSubmitting(true);
    try {
      const fields: CreateTaskFields = {
        title: title.trim(),
        description: description.trim() || undefined,
        internId,
        projectId: projectId || undefined,
        priority,
        tags,
        dueDate,
      };
      await taskService.createTask(company._id, fields, files);
      toastHelper.success('Task created and assigned');
      router.push('/company/admin/tasks');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Tasks" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Add New Task" />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">New Task Details</h2>
              <p className="text-sm text-slate-500">Fill out the form below to assign a new task to an intern.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                Cancel <X size={14} />
              </button>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Save size={15} /> Save as Draft
              </button>
            </div>
          </div>

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
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
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
                    <Grid2x2 size={18} className="text-emerald-500" /> Project & Assignment
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Select Project <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Select associated project...</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Assignee (Intern) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={internId}
                        onChange={(e) => setInternId(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Select an intern...</option>
                        {interns.map((i) => (
                          <option key={i._id} value={i._id}>{`${i.firstName} ${i.lastName}`.trim() || i.email}</option>
                        ))}
                      </select>
                    </div>
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
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                      </div>
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
                      ? `${files.length} file(s) selected. Maximum file size 10MB (PDF, JPG, PNG)`
                      : 'Maximum file size 10MB (PDF, JPG, PNG)'}
                  </p>
                  <input type="file" multiple hidden onChange={handleFiles} />
                  <span className="mt-4 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50">
                    Browse Files
                  </span>
                </label>
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
                    <dd className="font-medium text-slate-900">Assigned Intern Only</dd>
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