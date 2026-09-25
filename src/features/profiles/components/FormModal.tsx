'use client';

import { useEffect, type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useFocusTrap } from '@/components/ui/use-focus-trap';

interface FormModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  saving?: boolean;
  wide?: boolean;
  children: ReactNode;
}

/** Form-style modal (titles + fields). For pure confirmations use ConfirmModal. */
export default function FormModal({
  open,
  title,
  subtitle,
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-600',
  onClose,
  onSubmit,
  submitLabel = 'Save',
  saving = false,
  wide = false,
  children,
}: FormModalProps) {
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

  return (
    <div ref={trapRef} className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="document"
        className={`relative my-auto w-full animate-scale-in rounded-3xl bg-white shadow-2xl ${
          wide ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-5 pb-2 sm:px-6">{children}</div>

        <div className="flex gap-3 p-5 sm:p-6">
          <Button variant="outline" fullWidth onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button fullWidth loading={saving} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
