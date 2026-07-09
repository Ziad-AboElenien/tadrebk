'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { billingService } from '@/services/billing.service';
import { z } from 'zod';
import { internshipSchema } from '@/features/auth/schemas/auth.schemas';
type InternshipFormValues = z.output<typeof internshipSchema>;
import type { InternshipQuestion } from '@/features/internship/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function PostInternshipScreen() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!company?._id) { setCreditsLoading(false); return; }
    billingService
      .getCredits(company._id)
      .then((c) => {
        setCredits(c);
        if (c === 0) setShowCreditModal(true);
      })
      .catch(() => toast.error('Failed to check credits'))
      .finally(() => setCreditsLoading(false));
  }, [company?._id]);
  const [technicalSkillsStr, setTechnicalSkillsStr] = useState('');
  const [softSkillsStr, setSoftSkillsStr] = useState('');
  const [questions, setQuestions] = useState<InternshipQuestion[]>([]);
  const [preKnowledgeText, setPreKnowledgeText] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } as InternshipQuestion : q)));
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== questionIndex || q.type !== 'mcq') return q;
      const opts = [...q.options];
      opts[optionIndex] = value;
      return { ...q, options: opts } as InternshipQuestion;
    }));
  }

  function addOption(questionIndex: number) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== questionIndex || q.type !== 'mcq') return q;
      return { ...q, options: [...q.options, ''] } as InternshipQuestion;
    }));
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions((prev) => prev.map((q, i) => {
      if (i !== questionIndex || q.type !== 'mcq') return q;
      const opts = q.options.filter((_, oi) => oi !== optionIndex);
      return { ...q, options: opts } as InternshipQuestion;
    }));
  }

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Complete your company profile first.</p>
        <Link href="/company/onboarding">
          <Button>Complete Company Profile</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(data: InternshipFormValues) {
    if (!company) return;
    setSubmitting(true);
    try {
      const cleaned = questions.map((q) => {
        if (q.type === 'mcq') return { ...q, options: q.options.filter((o) => o.trim()) };
        return q;
      });
      await internshipService.createInternship(company._id, {
        ...data,
        softSkills: softSkillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        technicalSkills: technicalSkillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        questions: cleaned.length > 0 ? cleaned : undefined,
        preKnowledge: preKnowledgeText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setShowSuccessModal(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (creditsLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-center py-24"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" /></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Credit modal */}
      {showCreditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => router.push('/company/dashboard')} />
          <div className="relative bg-white rounded-[2rem] p-10 sm:p-12 shadow-2xl max-w-md w-full mx-4 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-[1.25rem] bg-amber-50 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-dark mb-3">You have reached your credit limit</h2>
            <p className="text-gray-500 mb-2">Purchase a plan to get more internship credits and start posting opportunities.</p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/company/billing/plans" className="w-full">
                <Button fullWidth className="!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !shadow-lg !shadow-emerald-200 !py-3.5 !font-bold">
                  <i className="fas fa-bolt mr-2" />
                  Charge Your Credit
                </Button>
              </Link>
              <Button variant="outline" onClick={() => router.push('/company/dashboard')} className="!py-3.5">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => router.push('/company/dashboard')} />
          <div className="relative bg-white rounded-[2rem] p-10 sm:p-12 shadow-2xl max-w-md w-full mx-4 text-center animate-fade-in-up">
            <div className="w-20 h-20 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-black text-dark mb-3">Internship Posted! 🎉</h2>
            <p className="text-gray-500 mb-8">Your internship has been published successfully. Start reviewing applicants now.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => router.push('/company/dashboard')} className="!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !shadow-lg !shadow-emerald-200 !font-bold !px-8 !py-3.5">
                <i className="fas fa-th-large mr-2" />
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/company/billing')} className="!px-8 !py-3.5">
                <i className="fas fa-coins mr-2" />
                Check Credits
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.35s ease-out both; }
      `}</style>

      {!showCreditModal && !showSuccessModal && (
        <>
          <h1 className="text-2xl font-black text-dark mb-8">Post a new internship</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          placeholder="e.g. Frontend Developer Intern"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={6}
            className={`w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Describe the internship responsibilities and requirements..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Location"
            error={errors.location?.message}
            value={wLocation}
            onChange={(e) => setValue('location', e.target.value, { shouldValidate: true })}
            options={[
              { value: 'on-site', label: 'On-site' },
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
            ]}
          />

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

        <Input
          label="Technical skills (comma-separated)"
          value={technicalSkillsStr}
          onChange={(e) => setTechnicalSkillsStr(e.target.value)}
          placeholder="e.g. JavaScript, React, Node.js"
        />

        <Input
          label="Soft skills (comma-separated)"
          value={softSkillsStr}
          onChange={(e) => setSoftSkillsStr(e.target.value)}
          placeholder="e.g. Communication, Teamwork, Problem-solving"
        />

        {/* Pre-knowledge to start */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Pre-knowledge to Start <span className="text-gray-400 font-normal">(optional, comma-separated)</span>
          </label>
          <textarea
            value={preKnowledgeText}
            onChange={(e) => setPreKnowledgeText(e.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none resize-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
            placeholder="e.g. Basic JavaScript knowledge, Understanding of REST APIs, Familiarity with Git"
          />
          <p className="text-xs text-gray-400">Enter items separated by commas. Each item will appear as a bullet point in the acceptance email.</p>
        </div>

        {/* Questions builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Application Questions <span className="text-gray-400 font-normal">(optional)</span></label>
            <div className="flex gap-2">
              <button type="button" onClick={() => addQuestion('mcq')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition">
                <i className="fas fa-list-ul text-[10px]" /> MCQ
              </button>
              <button type="button" onClick={() => addQuestion('writing')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition">
                <i className="fas fa-pen text-[10px]" /> Writing
              </button>
            </div>
          </div>

          {questions.length === 0 && (
            <p className="text-xs text-gray-400 italic">No questions yet. Add MCQ or writing questions for applicants.</p>
          )}

          {questions.map((q, qi) => (
            <div key={qi} className="border border-gray-200 rounded-2xl p-5 bg-gray-50/50 relative">
              <button
                type="button"
                onClick={() => removeQuestion(qi)}
                className="absolute top-3 right-3 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-200 transition"
              >
                <i className="fas fa-times text-[10px]" />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  {q.type === 'mcq' ? 'Multiple Choice' : 'Writing'}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Question {qi + 1}</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600">Prompt</label>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                  placeholder="e.g. Why do you want this internship?"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
                />
              </div>

              {q.type === 'mcq' && (
                <div className="mt-3 space-y-2">
                  <label className="text-xs font-semibold text-gray-600">Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeOption(qi, oi)}
                          className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <i className="fas fa-minus text-[10px]" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addOption(qi)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-1"
                  >
                    <i className="fas fa-plus text-[10px]" /> Add option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" loading={submitting}>
            Post internship
          </Button>
          <Link href="/company/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
        </>
      )}
    </div>
  );
}
