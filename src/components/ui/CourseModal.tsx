'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { toastHelper } from '@/lib/toast';

interface CourseModalProps {
  open: boolean;
  adding?: boolean;
  onAdd: (name: string, file?: File) => void;
  onClose: () => void;
}

export default function CourseModal({ open, adding = false, onAdd, onClose }: CourseModalProps) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setFile(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const canSubmit = name.trim().length > 0 && !adding;

  function submit() {
    if (canSubmit) onAdd(name.trim(), file ?? undefined);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-dark flex items-center gap-2">
            <i className="fas fa-certificate text-primary" /> Add course
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <i className="fas fa-xmark text-sm" />
          </button>
        </div>

        <label className="block mb-1.5 text-sm font-semibold text-gray-700">
          Course name <span className="text-red-500">*</span>
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="e.g. React Basics"
          className="w-full border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200"
        />

        <label className="block mt-4 mb-1.5 text-sm font-semibold text-gray-700">
          Certificate <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="course-cert-input"
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > 2 * 1024 * 1024) {
              toastHelper.error('Certificate file must be 2 MB or smaller');
              e.target.value = '';
              return;
            }
            setFile(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => (document.getElementById('course-cert-input') as HTMLInputElement)?.click()}
          className={`flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-xl border w-full transition-all ${
            file
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-gray-50 text-gray-500 border-dashed border-gray-300 hover:border-gray-400'
          }`}
        >
          {file ? (
            <>
              <i className="fas fa-check-circle text-xs" /> {file.name}
            </>
          ) : (
            <>
              <i className="fas fa-upload text-xs" /> Upload certificate (image or PDF)
            </>
          )}
        </button>
        {file && (
          <button
            type="button"
            onClick={() => setFile(null)}
            className="mt-2 text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <i className="fas fa-trash text-[10px]" /> Remove file
          </button>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" fullWidth onClick={onClose} disabled={adding}>
            Cancel
          </Button>
          <Button fullWidth loading={adding} disabled={!canSubmit} onClick={submit}>
            Add course
          </Button>
        </div>
      </div>
    </div>
  );
}
