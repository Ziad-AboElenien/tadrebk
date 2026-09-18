'use client';

import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import Input from '@/components/ui/Input';
import FormModal from '@/features/profiles/components/FormModal';
import type { Education } from '@/features/student/types';

export interface EducationFormValue {
  entry: Education;
  description?: string;
}

interface EducationModalProps {
  open: boolean;
  saving?: boolean;
  initial?: { index: number; entry: Education; description?: string } | null;
  onClose: () => void;
  onSave: (value: EducationFormValue) => void;
}

export default function EducationModal({ open, saving = false, initial = null, onClose, onSave }: EducationModalProps) {
  // NOTE: the parent mounts this modal fresh on every open, so useState
  // initializers (no syncing effect) always reflect the latest `initial`.
  const [institution, setInstitution] = useState(initial?.entry.institution || '');
  const [degree, setDegree] = useState(initial?.entry.degree || '');
  const [field, setField] = useState(initial?.entry.field || '');
  const [grade, setGrade] = useState(initial?.entry.grade || '');
  const [startDate, setStartDate] = useState((initial?.entry.startDate || '').slice(0, 7));
  const [endDate, setEndDate] = useState((initial?.entry.endDate || '').slice(0, 7));
  const [description, setDescription] = useState(initial?.description || '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!institution.trim()) {
      setError('Institution is required.');
      return;
    }
    setError(null);
    const toISO = (m: string) => (m ? `${m}-01` : undefined);
    onSave({
      entry: {
        institution: institution.trim(),
        degree: degree.trim() || undefined,
        field: field.trim() || undefined,
        grade: grade.trim() || undefined,
        startDate: toISO(startDate),
        endDate: toISO(endDate),
      },
      description: description.trim() || undefined,
    });
  }

  return (
    <FormModal
      open={open}
      title={initial ? 'Edit education' : 'Add education'}
      subtitle="Schools, universities and degrees."
      icon={GraduationCap}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initial ? 'Save changes' : 'Add education'}
      saving={saving}
      wide
    >
      <Input
        label="Institution"
        placeholder="e.g. Menoufia University"
        value={institution}
        onChange={(e) => setInstitution(e.target.value)}
        error={error || undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Degree"
          placeholder="e.g. BSc"
          value={degree}
          onChange={(e) => setDegree(e.target.value)}
        />
        <Input
          label="Field of study"
          placeholder="e.g. Computer Science"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Grade"
          placeholder="e.g. Very Good"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Start</label>
          <input
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">End</label>
          <input
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Activities, thesis, relevant coursework..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>
    </FormModal>
  );
}
