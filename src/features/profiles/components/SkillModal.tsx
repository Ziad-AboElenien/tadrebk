'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FormModal from '@/features/profiles/components/FormModal';
import {
  SKILL_SOURCE_LABELS,
  type SkillMeta,
  type SkillSourceType,
} from '@/features/profiles/services/profile-meta.store';

export interface SkillFormValue {
  name: string;
  meta: SkillMeta;
}

interface SkillModalProps {
  open: boolean;
  saving?: boolean;
  /** Editing an existing skill (name locked) vs adding a new one */
  initial?: { name: string; meta?: SkillMeta } | null;
  existingNames: string[];
  educationOptions: string[];
  internshipOptions: string[];
  onClose: () => void;
  onSave: (value: SkillFormValue) => void;
}

const SOURCES: { value: SkillSourceType; hint: string }[] = [
  { value: 'self', hint: 'Courses, practice, self learning' },
  { value: 'education', hint: 'Learned during your studies' },
  { value: 'internship', hint: 'Picked up in a completed internship' },
  { value: 'other', hint: 'Anywhere else' },
];

export default function SkillModal({
  open,
  saving = false,
  initial = null,
  existingNames,
  educationOptions,
  internshipOptions,
  onClose,
  onSave,
}: SkillModalProps) {
  // NOTE: the parent mounts this modal fresh on every open, so useState
  // initializers (no syncing effect) always reflect the latest `initial`.
  const [name, setName] = useState(initial?.name || '');
  const [source, setSource] = useState<SkillSourceType>(initial?.meta?.source || 'self');
  const [ref, setRef] = useState(
    initial?.meta?.source === 'other' ? '' : initial?.meta?.ref || '',
  );
  const [otherText, setOtherText] = useState(
    initial?.meta?.source === 'other' ? initial?.meta?.ref || '' : '',
  );
  const [description, setDescription] = useState(initial?.meta?.description || '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give the skill a name.');
      return;
    }
    if (!initial && existingNames.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setError('You already have this skill.');
      return;
    }
    if (source === 'education' && educationOptions.length > 0 && !ref) {
      setError('Pick which education this skill came from.');
      return;
    }
    if (source === 'internship' && internshipOptions.length > 0 && !ref) {
      setError('Pick which internship this skill came from.');
      return;
    }
    if (source === 'other' && !otherText.trim() && educationOptions.length + internshipOptions.length > 0) {
      // free text optional when there is nothing to pick from — still require it for "other"
      setError('Tell us where you learned it.');
      return;
    }
    setError(null);
    onSave({
      name: trimmed,
      meta: {
        source,
        ref: source === 'other' ? otherText.trim() : ref || undefined,
        description: description.trim() || undefined,
      },
    });
  }

  const refOptions =
    source === 'education'
      ? educationOptions.map((o) => ({ value: o, label: o }))
      : internshipOptions.map((o) => ({ value: o, label: o }));

  return (
    <FormModal
      open={open}
      title={initial ? 'Edit skill' : 'Add skill'}
      subtitle="Name it, then tell us where you picked it up."
      icon={Sparkles}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={initial ? 'Save changes' : 'Add skill'}
      saving={saving}
    >
      <Input
        label="Skill name"
        placeholder="e.g. React, Public speaking, Excel"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!!initial}
        error={error || undefined}
      />

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          How did you acquire it? <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => {
            const on = source === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => {
                  setSource(s.value);
                  setRef('');
                }}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  on ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      on ? 'border-emerald-500' : 'border-slate-300'
                    }`}
                  >
                    {on && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {SKILL_SOURCE_LABELS[s.value]}
                  </span>
                </span>
                <span className="mt-1 block pl-6 text-xs text-slate-400">{s.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {source === 'education' && educationOptions.length > 0 && (
        <Select
          label="Which education?"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          options={refOptions}
          placeholder="Select from your profile"
        />
      )}
      {source === 'education' && educationOptions.length === 0 && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          You haven&apos;t added any education yet — add it in your profile and it will show up here.
        </p>
      )}

      {source === 'internship' && internshipOptions.length > 0 && (
        <Select
          label="Which internship?"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          options={refOptions}
          placeholder="Select a completed internship"
        />
      )}
      {source === 'internship' && internshipOptions.length === 0 && (
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          No completed internships on record yet — they&apos;ll appear here once you finish one with us.
        </p>
      )}

      {source === 'other' && (
        <Input
          label="Where did you learn it?"
          placeholder="e.g. Freelance work, volunteering, online course"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
        />
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="e.g. Built 3 production apps with it, comfortable with hooks and SSR..."
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
      </div>
    </FormModal>
  );
}
