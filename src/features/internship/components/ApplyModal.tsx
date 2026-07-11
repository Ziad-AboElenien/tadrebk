'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import type { InternshipQuestion } from '@/features/internship/types';

type Answer = { type: 'mcq'; selectedOption: string } | { type: 'writing'; text: string };

interface ApplyModalProps {
  open: boolean;
  internshipTitle: string;
  companyName?: string;
  questions?: InternshipQuestion[];
  loading: boolean;
  onSubmit: (coverLetter: string, answers: Answer[], resume?: File) => void;
  onCancel: () => void;
}

export default function ApplyModal({
  open,
  internshipTitle,
  companyName,
  questions,
  loading,
  onSubmit,
  onCancel,
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | undefined>();
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  useEffect(() => {
    if (open) {
      setCoverLetter('');
      setResumeFile(undefined);
      setAnswers(
        (questions || []).map((q) =>
          q.type === 'mcq' ? { type: 'mcq' as const, selectedOption: '' } : { type: 'writing' as const, text: '' },
        ),
      );
    }
  }, [open, questions]);

  function setAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      const q = questions?.[index];
      if (q?.type === 'mcq') next[index] = { type: 'mcq', selectedOption: value };
      else next[index] = { type: 'writing', text: value };
      return next;
    });
  }

  if (!open) return null;

  const hasQuestions = questions && questions.length > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
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

        {/* Resume upload */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Resume / CV <span className="text-gray-400 font-normal">(optional — your profile CV will be used if omitted)</span>
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-4 py-3 cursor-pointer transition hover:border-emerald-400 hover:bg-emerald-50/30">
              <i className="fas fa-cloud-upload-alt text-emerald-500 text-lg" />
              <span className="text-sm text-gray-500 truncate">
                {resumeFile ? resumeFile.name : 'Upload a new CV (PDF, DOC, DOCX)'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setResumeFile(e.target.files?.[0] || undefined)}
              />
            </label>
            {resumeFile && (
              <button
                type="button"
                onClick={() => setResumeFile(undefined)}
                className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 transition"
              >
                <i className="fas fa-times text-xs" />
              </button>
            )}
          </div>
        </div>

        {/* Questions */}
        {hasQuestions && (
          <div className="mb-6 space-y-5">
            <p className="text-sm font-bold text-gray-700">Application Questions</p>
            {questions.map((q, qi) => (
              <div key={qi}>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  {qi + 1}. {q.prompt}
                </label>
                {q.type === 'mcq' ? (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${
                          (answers[qi] as any)?.selectedOption === opt
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${qi}`}
                          value={opt}
                          checked={(answers[qi] as any)?.selectedOption === opt}
                          onChange={() => setAnswer(qi, opt)}
                          className="accent-emerald-600"
                        />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={(answers[qi] as any)?.text || ''}
                    onChange={(e) => setAnswer(qi, e.target.value)}
                    rows={3}
                    placeholder="Write your answer..."
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none resize-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cover letter */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Cover Letter <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell the employer why you're a great fit for this role..."
            rows={4}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none resize-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:text-gray-400"
          />
          <p className="mt-1.5 text-xs text-gray-400 text-right">{coverLetter.length} characters</p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            onClick={() => onSubmit(coverLetter, answers, resumeFile)}
          >
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
}
