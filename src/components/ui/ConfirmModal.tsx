'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useFocusTrap } from '@/components/ui/use-focus-trap';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  const trapRef = useFocusTrap<HTMLDivElement>(open);

  if (!open) return null;

  const danger = confirmVariant !== 'primary';

  return (
    <div ref={trapRef} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm animate-scale-in rounded-3xl bg-white p-5 shadow-2xl sm:p-8" role="document">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${danger ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <i className={`fas fa-exclamation-triangle text-2xl ${danger ? 'text-red-500' : 'text-emerald-500'}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-1 break-words text-sm text-slate-500">{message}</p>
          </div>
          <div className="flex w-full gap-3">
            <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant={confirmVariant} fullWidth loading={loading} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
