'use client';

import { useEffect, useState } from 'react';
import { Flag, Loader2, X } from 'lucide-react';
import { useFocusTrap } from '@/components/ui/use-focus-trap';

interface ReportModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function ReportModal({ open, title, onClose, onConfirm }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const trapRef = useFocusTrap<HTMLDivElement>(open);

  if (!open) return null;

  const handleSend = async () => {
    if (reason.trim().length < 5) {
      setError('Please describe the issue (at least 5 characters).');
      return;
    }
    setError('');
    setSending(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch {
      // error toast is shown by the caller
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={trapRef} className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Flag size={15} className="text-rose-500" /> {title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-5">
          <label htmlFor="report-reason" className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Why are you reporting this?
          </label>
          <textarea
            id="report-reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            rows={4}
            maxLength={1000}
            placeholder="Tell our team what seems wrong…"
            className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
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
              onClick={handleSend}
              disabled={sending}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              {sending && <Loader2 size={14} className="animate-spin" />}
              Send report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
