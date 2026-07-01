'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';

interface ApplyModalProps {
  open: boolean;
  internshipTitle: string;
  companyName?: string;
  loading: boolean;
  onSubmit: (coverLetter: string) => void;
  onCancel: () => void;
}

export default function ApplyModal({
  open,
  internshipTitle,
  companyName,
  loading,
  onSubmit,
  onCancel,
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) setCoverLetter('');
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-extrabold text-gray-900">Apply for Internship</h3>
          <button onClick={onCancel} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        <div className="mb-5 rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-bold text-gray-900">{internshipTitle}</p>
          {companyName && <p className="text-xs text-gray-400 mt-0.5">{companyName}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're a great fit for this role..."
            rows={6}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none resize-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
          />
          <p className="mt-1.5 text-xs text-gray-400 text-right">{coverLetter.length} characters</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth loading={loading} onClick={() => onSubmit(coverLetter)}>
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
}
