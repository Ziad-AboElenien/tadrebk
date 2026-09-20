'use client';

import { useState } from 'react';
import { Award, Paperclip, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import FormModal from '@/features/profiles/components/FormModal';
import type { CourseMeta } from '@/features/profiles/services/profile-meta.store';

export interface CourseFormValue {
  name: string;
  meta: CourseMeta;
  certificate?: File | null;
}

interface CourseModalProps {
  open: boolean;
  saving?: boolean;
  initial?: { name: string; meta?: CourseMeta } | null;
  existingNames: string[];
  onClose: () => void;
  onSave: (value: CourseFormValue) => void;
}

export default function CourseModal({
  open,
  saving = false,
  initial = null,
  existingNames,
  onClose,
  onSave,
}: CourseModalProps) {
  // NOTE: the parent mounts this modal fresh on every open, so useState
  // initializers (no syncing effect) always reflect the latest `initial`.
  const [name, setName] = useState(initial?.name || '');
  const [startDate, setStartDate] = useState(initial?.meta?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.meta?.present ? '' : initial?.meta?.endDate || '');
  const [present, setPresent] = useState(!!initial?.meta?.present);
  const [description, setDescription] = useState(initial?.meta?.description || '');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give the course a name.');
      return;
    }
    if (!initial && existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError('You already added this course.');
      return;
    }
    if (startDate && endDate && !present && endDate < startDate) {
      setError('End date can’t be before the start date.');
      return;
    }
    setError(null);
    // Backend expects full datetimes — month inputs only carry YYYY-MM.
    const toISO = (m: string) => (m ? `${m}-01T00:00:00.000Z` : undefined);
    onSave({
      name: trimmed,
      meta: {
        startDate: toISO(startDate),
        endDate: present ? undefined : toISO(endDate),
        present,
        description: description.trim() || undefined,
      },
      certificate,
    });
  }

  return (
    <FormModal
      open={open}
      title={initial ? 'Edit course' : 'Add course'}
      subtitle="Track what you learned, when — and attach proof."
      icon={Award}
      iconBg="bg-amber-50"
      iconColor="text-amber-600"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initial ? 'Save changes' : 'Add course'}
      saving={saving}
      wide
    >
      <Input
        label="Course name"
        placeholder="e.g. Advanced Node.js, Google Data Analytics"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!!initial}
        error={error || undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Start date</label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">End date</label>
          <input
            type="month"
            value={present ? '' : endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={present}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPresent((p) => !p)}
        className="flex items-center gap-2.5 text-left"
        aria-pressed={present}
      >
        <span
          className={`flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
            present ? 'bg-emerald-500' : 'bg-slate-200'
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
              present ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </span>
        <span className="text-sm font-medium text-slate-700">
          I’m still taking this course <span className="text-slate-400">(Present)</span>
        </span>
      </button>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What did you learn? Any grade, project, or key topics..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-semibold text-slate-700">
          Certificate <span className="font-normal text-slate-400">(optional)</span>
        </p>
        {certificate ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Paperclip size={15} className="shrink-0 text-emerald-600" />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
              {certificate.name}
            </span>
            <button
              type="button"
              onClick={() => setCertificate(null)}
              aria-label="Remove certificate"
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white hover:text-rose-500"
            >
              <X size={15} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-emerald-300 hover:text-emerald-600">
            <Paperclip size={15} />
            Attach certificate (PDF or image)
            <input
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setCertificate(e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>
    </FormModal>
  );
}
