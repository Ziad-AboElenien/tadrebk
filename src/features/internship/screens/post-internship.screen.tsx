'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  ListChecks,
  MapPin,
  Send,
  Sparkles,
  Tags,
  Trash2,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { internshipSchema } from '@/features/auth/schemas/auth.schemas';
import type { InternshipQuestion } from '@/features/internship/types';
import Input from '@/components/ui/Input';
import ChipInput from '@/components/ui/ChipInput';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import { CATEGORY_LABELS } from '@/features/student/types';
import { MAX_TRACKS_PER_POST } from '@/lib/constants';

const UniversityAutocomplete = dynamic(() => import('@/components/ui/UniversityAutocomplete'), {
  ssr: false,
});

type InternshipFormValues = z.output<typeof internshipSchema>;

const STEPS = [
  { key: 'basics', label: 'Basics', icon: FileText },
  { key: 'skills', label: 'Skills & Tracks', icon: Tags },
  { key: 'questions', label: 'Questions', icon: ListChecks },
  { key: 'review', label: 'Review & Post', icon: Send },
] as const;

const LOCATION_META = [
  { value: 'on-site', label: 'On-site', icon: Briefcase, hint: 'Work from office' },
  { value: 'remote', label: 'Remote', icon: MapPin, hint: 'Work from anywhere' },
  { value: 'hybrid', label: 'Hybrid', icon: Sparkles, hint: 'Mix of both' },
] as const;

export default function PostInternshipScreen() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);
  const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [technicalError, setTechnicalError] = useState<string | null>(null);
  const [softError, setSoftError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InternshipQuestion[]>([]);
  const [preKnowledge, setPreKnowledge] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [categoryText, setCategoryText] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [stepError, setStepError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      title: '',
      description: '',
      location: 'on-site' as const,
      workingTime: 'full-time' as const,
      softSkills: [] as string[],
      technicalSkills: [] as string[],
    },
  });

  const wTitle = watch('title');
  const wDescription = watch('description');
  const wLocation = watch('location');
  const wWorkingTime = watch('workingTime');

  function addQuestion(type: 'mcq' | 'writing') {
    if (type === 'mcq') {
      setQuestions((prev) => [...prev, { type: 'mcq', prompt: '', options: ['', ''] }]);
    } else {
      setQuestions((prev) => [...prev, { type: 'writing', prompt: '' }]);
    }
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, patch: Partial<InternshipQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? ({ ...q, ...patch } as InternshipQuestion) : q)),
    );
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex || q.type !== 'mcq') return q;
        const opts = [...q.options];
        opts[optionIndex] = value;
        return { ...q, options: opts } as InternshipQuestion;
      }),
    );
  }

  function addOption(questionIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex || q.type !== 'mcq') return q;
        return { ...q, options: [...q.options, ''] } as InternshipQuestion;
      }),
    );
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex || q.type !== 'mcq') return q;
        return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) } as InternshipQuestion;
      }),
    );
  }

  function toggleCategory(value: string) {
    if (value === 'other') {
      if (selectedCategories.length >= MAX_TRACKS_PER_POST) {
        setCategoryError(`You can select up to ${MAX_TRACKS_PER_POST} tracks`);
        return;
      }
      setShowCategoryInput(true);
      return;
    }
    if (selectedCategories.includes(value)) {
      setSelectedCategories((prev) => prev.filter((c) => c !== value));
    } else {
      if (selectedCategories.length >= MAX_TRACKS_PER_POST) {
        setCategoryError(`You can select up to ${MAX_TRACKS_PER_POST} tracks`);
        return;
      }
      setSelectedCategories((prev) => [...prev, value]);
      setCategoryError(null);
    }
  }

  function commitCustomCategory() {
    const val = categoryText.trim();
    if (!val) return;
    if (selectedCategories.length >= MAX_TRACKS_PER_POST) {
      setCategoryError(`You can select up to ${MAX_TRACKS_PER_POST} tracks`);
      return;
    }
    if (!selectedCategories.includes(val)) {
      setSelectedCategories((prev) => [...prev, val]);
      setCategoryError(null);
    }
    setCategoryText('');
    setShowCategoryInput(false);
  }

  async function goNext() {
    setStepError(null);
    if (step === 0) {
      const ok = await trigger(['title', 'description', 'location', 'workingTime']);
      if (!ok) {
        setStepError('Add a clear title and description to continue.');
        return;
      }
      setStep(1);
      return;
    }
    if (step === 1) {
      const tech = technicalSkills.filter(Boolean);
      const soft = softSkills.filter(Boolean);
      if (tech.length === 0) {
        setTechnicalError('Add at least one technical skill');
        setStepError('Add at least one technical and one soft skill to continue.');
        return;
      }
      if (soft.length === 0) {
        setSoftError('Add at least one soft skill');
        setStepError('Add at least one technical and one soft skill to continue.');
        return;
      }
      if (selectedCategories.length === 0) {
        setCategoryError('Select at least one track');
        setStepError('Select at least one track to continue.');
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      const invalid = questions.some((q) => {
        if (!q.prompt.trim()) return true;
        if (q.type === 'mcq' && q.options.filter((o) => o.trim()).length < 2) return true;
        return false;
      });
      if (invalid) {
        setStepError('Each question needs a prompt, and MCQ needs at least 2 filled options.');
        return;
      }
      setStep(3);
    }
  }

  async function onSubmit(data: InternshipFormValues) {
    if (!company || submitting) return;
    setSubmitting(true);
    try {
      const cleaned = questions.map((q) => {
        if (q.type === 'mcq') return { ...q, options: q.options.filter((o) => o.trim()) };
        return q;
      });
      await internshipService.createInternship(company._id, {
        ...data,
        softSkills: softSkills.filter(Boolean),
        technicalSkills: technicalSkills.filter(Boolean),
        questions: cleaned.length > 0 ? cleaned : undefined,
        preKnowledge: preKnowledge.filter(Boolean),
        track: selectedCategories.length > 0 ? selectedCategories : undefined,
        requiredEducation: universities.map((institution) => ({ institution })),
      });
      setPosted(true);
      toastHelper.success('Internship posted successfully');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <Briefcase size={28} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Complete your company profile first</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              You need a company profile before posting internships.
            </p>
            <Link href="/company/onboarding" className="mt-8 inline-block">
              <Button>Complete Company Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!company.approvedByAdmin) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <Clock size={28} className="text-amber-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Account pending approval</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Your company account is still under review. You can post internships once it has been
              approved by the admin.
            </p>
            <Link href="/company/admin" className="mt-8 inline-block">
              <Button>Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (posted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <CheckCircle2 size={30} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Internship posted</h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {wTitle ? `“${wTitle}” is now live.` : 'Your internship is now live.'} Start reviewing
              applicants from your dashboard.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={() => router.push('/company/admin')}>Go to Dashboard</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPosted(false);
                  setStep(0);
                }}
              >
                Post another
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-[2.5%] py-4 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/company/admin"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">Post a new internship</h1>
              <p className="mt-1 text-sm text-slate-500">
                Step {step + 1} of {STEPS.length} — {STEPS[step].label}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-auto">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    i === step
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : i < step
                        ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        : 'border-slate-100 bg-slate-50 text-slate-400'
                  }`}
                >
                  <s.icon size={14} className="shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
            {stepError && (
              <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {stepError}
              </p>
            )}

            {step === 0 && (
              <div className="space-y-5">
                <Input
                  label="Title"
                  placeholder="e.g. Frontend Developer Intern"
                  error={errors.title?.message}
                  {...register('title')}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    placeholder="Describe responsibilities, requirements, and what interns will learn..."
                    className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
                      errors.description ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Location</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {LOCATION_META.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setValue('location', l.value, { shouldValidate: true })}
                        className={`rounded-xl border p-3 text-left transition-colors ${
                          wLocation === l.value
                            ? 'border-emerald-300 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <l.icon
                          size={16}
                          className={wLocation === l.value ? 'text-emerald-600' : 'text-slate-400'}
                        />
                        <p className="mt-1.5 text-sm font-semibold text-slate-900">{l.label}</p>
                        <p className="text-xs text-slate-400">{l.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <Select
                  label="Working time"
                  error={errors.workingTime?.message}
                  value={wWorkingTime}
                  onChange={(e) => setValue('workingTime', e.target.value, { shouldValidate: true })}
                  options={[
                    { value: 'full-time', label: 'Full-time' },
                    { value: 'part-time', label: 'Part-time' },
                  ]}
                />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <ChipInput
                  label="Technical skills"
                  value={technicalSkills}
                  onChange={(items) => {
                    setTechnicalSkills(items);
                    if (technicalError) setTechnicalError(null);
                  }}
                  error={technicalError || undefined}
                  placeholder="e.g. JavaScript, React, Node.js"
                />
                <ChipInput
                  label="Soft skills"
                  value={softSkills}
                  onChange={(items) => {
                    setSoftSkills(items);
                    if (softError) setSoftError(null);
                  }}
                  error={softError || undefined}
                  placeholder="e.g. Communication, Teamwork"
                />
                <ChipInput
                  label="Pre-knowledge to start"
                  value={preKnowledge}
                  onChange={setPreKnowledge}
                  placeholder="e.g. Basic JavaScript, REST APIs"
                  hint="Each item appears as a bullet in the acceptance email."
                />
                <div>
                  <p className="mb-2 block text-sm font-semibold text-slate-700">
                    Track <span className="text-red-500">*</span>{' '}
                    <span className="font-normal text-slate-400">
                      (1 to {MAX_TRACKS_PER_POST}
                      {selectedCategories.length > 0 && (
                        <>
                          {' '}— <span className="font-bold text-emerald-600">{selectedCategories.length}</span>/
                          {MAX_TRACKS_PER_POST} selected
                        </>
                      )}
                      )
                    </span>
                  </p>
                  {selectedCategories.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {selectedCategories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] || cat}
                          <button
                            type="button"
                            onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/40"
                            aria-label={`Remove ${cat}`}
                          >
                            <i className="fas fa-xmark text-[10px]" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(CATEGORY_LABELS) as [string, string][]).map(([value, label]) => {
                      const on = selectedCategories.includes(value);
                      const isOther = value === 'other';
                      const full = selectedCategories.length >= MAX_TRACKS_PER_POST && !on;
                      return (
                        <button
                          key={value}
                          type="button"
                          disabled={on || (full && !isOther)}
                          onClick={() => toggleCategory(value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                            isOther
                              ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : on
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : full
                                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600'
                          }`}
                        >
                          {isOther ? (
                            <>
                              <i className="fas fa-pen mr-1 text-[10px]" />
                              {label}
                            </>
                          ) : on ? (
                            <>
                              <i className="fas fa-check mr-1 text-[10px]" />
                              {label}
                            </>
                          ) : (
                            label
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {categoryError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{categoryError}</p>
                  )}
                  {showCategoryInput && (
                    <div className="mt-3 flex items-center gap-2">
                      <input
                        type="text"
                        value={categoryText}
                        onChange={(e) => setCategoryText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitCustomCategory();
                          }
                        }}
                        placeholder="Type your track..."
                        autoFocus
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                      <button
                        type="button"
                        onClick={commitCustomCategory}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white transition-colors hover:bg-emerald-600"
                        aria-label="Add track"
                      >
                        <i className="fas fa-plus text-xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCategoryInput(false);
                          setCategoryText('');
                        }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
                        aria-label="Cancel"
                      >
                        <i className="fas fa-xmark text-xs" />
                      </button>
                    </div>
                  )}
                </div>
                <UniversityAutocomplete
                  label="Target universities (optional)"
                  placeholder="Type to search universities..."
                  hint="Pick the universities you want interns from."
                  multiple
                  values={universities}
                  onMultiChange={setUniversities}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Optional — add screening questions for applicants.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addQuestion('mcq')}
                      className="flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <i className="fas fa-list-ul text-[10px]" /> MCQ
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuestion('writing')}
                      className="flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
                    >
                      <i className="fas fa-pen text-[10px]" /> Writing
                    </button>
                  </div>
                </div>
                {questions.length === 0 && (
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm italic text-slate-400">
                    No questions yet. Applicants will apply with CV only.
                  </p>
                )}
                {questions.map((q, qi) => (
                  <div key={qi} className="relative rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      aria-label="Remove question"
                      className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-400 transition hover:bg-red-200 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        {q.type === 'mcq' ? 'Multiple Choice' : 'Writing'}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">Question {qi + 1}</span>
                    </div>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                      placeholder="e.g. Why do you want this internship?"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {q.type === 'mcq' && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-slate-600">Options</p>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(qi, oi, e.target.value)}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qi, oi)}
                                aria-label="Remove option"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                              >
                                <i className="fas fa-minus text-[10px]" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addOption(qi)}
                          className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          <i className="fas fa-plus text-[10px]" /> Add option
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Title</p>
                  <p className="font-medium text-slate-900">{wTitle || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Description</p>
                  <p className="whitespace-pre-wrap text-sm text-slate-600">{wDescription || '—'}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
                    <p className="text-sm capitalize text-slate-900">{wLocation}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Working time</p>
                    <p className="text-sm capitalize text-slate-900">{wWorkingTime}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Technical ({technicalSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {technicalSkills.length === 0 && <span className="text-sm text-slate-400">—</span>}
                      {technicalSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Soft ({softSkills.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {softSkills.length === 0 && <span className="text-sm text-slate-400">—</span>}
                      {softSkills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Tracks ({selectedCategories.length}) · Questions ({questions.length})
                  </p>
                  <p className="text-sm text-slate-600">
                    {selectedCategories.map((c) => CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c).join(', ') || '—'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={14} /> Back
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={goNext}>
                  Continue <ArrowRight size={14} />
                </Button>
              ) : (
                <Button type="submit" loading={submitting}>
                  Post internship
                </Button>
              )}
            </div>
          </div>

          <aside className="min-w-0">
            <div className="lg:sticky lg:top-6 space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <i className="fas fa-eye text-[11px]" /> Live preview
                  </p>
                </div>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white">
                      {company.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">{wTitle || 'Your internship title'}</p>
                      <p className="truncate text-xs text-slate-400">{company.name}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-500">
                    {wDescription || 'Your description will appear here for students browsing internships.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-600">
                      {wLocation}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-600">
                      {wWorkingTime}
                    </span>
                    {selectedCategories.slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600"
                      >
                        {CATEGORY_LABELS[c as keyof typeof CATEGORY_LABELS] || c}
                      </span>
                    ))}
                  </div>
                  {(technicalSkills.length > 0 || softSkills.length > 0) && (
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {technicalSkills.length + softSkills.length} skills · {questions.length} questions
                        {universities.length > 0 && ` · ${universities.length} target universities`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                  <Sparkles size={14} className="text-emerald-500" /> Tips for a strong post
                </p>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-500">
                  <li>• Use a specific title with the role and level.</li>
                  <li>• List 3–6 technical skills students actually need.</li>
                  <li>• Keep screening questions short (2–4 max).</li>
                </ul>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
