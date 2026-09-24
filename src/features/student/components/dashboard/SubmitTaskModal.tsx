'use client';

import { useState } from 'react';
import { FileText, Loader2, Paperclip, X } from 'lucide-react';
import type { Task } from '@/features/company/types/management';

interface SubmitTaskModalProps {
  task: Task;
  actingId?: string | null;
  onClose: () => void;
  onConfirm: (note?: string) => void;
}

/** Submit modal — note + attachment (attachment optional until the API supports uploads). */
export default function SubmitTaskModal({ task, actingId = null, onClose, onConfirm }: SubmitTaskModalProps) {
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">Submit task for review</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <p className="break-words text-sm font-medium text-slate-700">{task.title}</p>
          <div>
            <label htmlFor="task-submit-note" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Note for reviewer
            </label>
            <textarea
              id="task-submit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What did you finish? Anything the reviewer should know…"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Attachment <span className="font-normal normal-case text-slate-300">(optional for now)</span>
            </span>
            <label
              htmlFor="task-submit-file"
              className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 transition-colors hover:border-emerald-300 hover:bg-emerald-50/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                <Paperclip size={16} />
              </span>
              <span className="min-w-0 flex-1">
                {file ? (
                  <>
                    <span className="block truncate text-sm font-medium text-slate-700">{file.name}</span>
                    <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB · ready</span>
                  </>
                ) : (
                  <>
                    <span className="block text-sm font-medium text-slate-600">Attach your work file</span>
                    <span className="text-xs text-slate-400">Tap to choose a file</span>
                  </>
                )}
              </span>
              {file && (
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"
                >
                  <X size={14} />
                </button>
              )}
            </label>
            <input
              id="task-submit-file"
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(note.trim() || undefined)}
              disabled={actingId === task._id}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {actingId === task._id ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              Submit task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
