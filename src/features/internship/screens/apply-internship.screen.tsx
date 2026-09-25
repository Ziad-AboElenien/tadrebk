'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService, Answer } from '@/features/student/services/application.service';
import { Internship, getCompanyIdFromInternship, getInternshipTracks } from '@/features/internship/types';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type FieldErrors = Record<string, string>;

export default function ApplyInternshipScreen() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.user.currentUser);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracks, setTracks] = useState<string[]>([]);
  const [track, setTrack] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | undefined>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login/student?next=/internships/${internId}/apply`);
      return;
    }
    (async () => {
      try {
        const data = await internshipService.getInternshipById(internId);
        setInternship(data);
        const t = getInternshipTracks(data);
        setTracks(t);
        if (t.length === 1) setTrack(t[0]);
        setAnswers(
          (data.questions || []).map((q) =>
            q.type === 'mcq' ? { type: 'mcq' as const, selectedOption: '' } : { type: 'writing' as const, text: '' },
          ),
        );
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [internId, isAuthenticated, router]);

  const setAnswer = useCallback(
    (index: number, value: string) => {
      setAnswers((prev) => {
        const next = [...prev];
        const q = internship?.questions?.[index];
        if (q?.type === 'mcq') next[index] = { type: 'mcq', selectedOption: value };
        else next[index] = { type: 'writing', text: value };
        return next;
      });
      setErrors((prev) => {
        if (!prev[`q${index}`]) return prev;
        const next = { ...prev };
        delete next[`q${index}`];
        return next;
      });
    },
    [internship],
  );

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (tracks.length > 0 && !track) {
      errs.track = 'Choose the track you are applying for.';
    }
    if (!resumeFile && !user?.resume) {
      errs.resume = 'Upload a CV here or add one to your profile first.';
    } else if (resumeFile) {
      const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!ok.includes(resumeFile.type) && !/\.(pdf|doc|docx)$/i.test(resumeFile.name)) {
        errs.resume = 'CV must be a PDF, DOC or DOCX file.';
      }
    }
    (internship?.questions || []).forEach((q, i) => {
      const a = answers[i];
      const empty = !a || (a.type === 'mcq' ? !a.selectedOption : !a.text.trim());
      if (empty) errs[`q${i}`] = 'This question is required.';
    });
    if (coverLetter.length > 2000) {
      errs.coverLetter = 'Cover letter must be 2000 characters or fewer.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!internship || submitting) return;
    if (!validate()) {
      document.getElementById('apply-errors')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const cid = getCompanyIdFromInternship(internship);
    if (!cid) {
      toastHelper.error('Company information not available for this internship');
      return;
    }
    setSubmitting(true);
    try {
      const hasAnswers = answers.some((a) => (a.type === 'mcq' ? a.selectedOption : a.text.trim()));
      await applicationService.apply(cid, internId, {
        ...(coverLetter.trim() ? { coverLetter: coverLetter.trim() } : {}),
        ...(hasAnswers ? { answers } : {}),
        ...(resumeFile ? { resume: resumeFile } : {}),
        ...(track ? { track } : {}),
      });
      setDone(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes('already applied')) {
        toastHelper.info('You already applied to this internship');
        router.push('/dashboard');
      } else if (msg.includes('resume') || msg.includes('CV')) {
        setErrors({ resume: 'A CV is required — upload one here or add it to your profile.' });
      } else if (msg.includes('closed')) {
        toastHelper.error('This internship is no longer accepting applications');
      } else {
        toastHelper.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-4 h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="font-semibold text-slate-900">Internship not found</p>
        <p className="mt-1 text-sm text-slate-400">It may have been removed.</p>
        <Link href="/internships" className="mt-4 inline-block rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
          Browse Internships
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 size={36} className="text-emerald-500" />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Application Submitted!</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          Your application for <span className="font-semibold text-slate-700">{internship.title}</span>
          {track ? (
            <> (<span className="font-semibold text-slate-700">{track}</span>)</>
          ) : null}{' '}
          was sent successfully. The company will review it and get back to you.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
            My Applications
          </Link>
          <Link href="/internships" className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Continue Browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href={`/internships/${internId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to internship
      </Link>
      <h1 className="mt-3 break-words text-2xl font-bold text-slate-900 sm:text-3xl">Apply for Internship</h1>
      <div className="mt-3 rounded-xl bg-slate-50 p-4">
        <p className="break-words text-sm font-bold text-slate-900">{internship.title}</p>
      </div>

      <div id="apply-errors" className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {tracks.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-700">
              Which track are you applying for? <span className="text-rose-500">*</span>
            </label>
            <Select
              value={track}
              onChange={(e) => {
                setTrack(e.target.value);
                setErrors((prev) => {
                  if (!prev.track) return prev;
                  const next = { ...prev };
                  delete next.track;
                  return next;
                });
              }}
              placeholder="Select a track..."
              error={errors.track}
              className="mt-2"
            >
              {tracks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Resume / CV <span className="font-normal text-slate-400">(your profile CV is used if omitted)</span>
          </label>
          <div className="mt-2 flex items-center gap-3">
            <label className={`flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition hover:border-emerald-400 hover:bg-emerald-50/30 ${errors.resume ? 'border-rose-400' : 'border-slate-300'}`}>
              <UploadCloud size={18} className="shrink-0 text-emerald-500" />
              <span className="truncate text-sm text-slate-500">
                {resumeFile ? resumeFile.name : 'Upload a CV (PDF, DOC, DOCX)'}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                  setResumeFile(e.target.files?.[0] || undefined);
                  setErrors((prev) => {
                    if (!prev.resume) return prev;
                    const next = { ...prev };
                    delete next.resume;
                    return next;
                  });
                }}
              />
            </label>
            {resumeFile && (
              <button
                type="button"
                onClick={() => setResumeFile(undefined)}
                aria-label="Remove CV"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-400 hover:text-rose-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {errors.resume && <p className="mt-1 text-xs font-medium text-rose-500">{errors.resume}</p>}
        </div>

        {(internship.questions || []).length > 0 && (
          <div className="space-y-5">
            <p className="text-sm font-medium text-slate-700">Application Questions</p>
            {internship.questions!.map((q, qi) => (
              <div key={qi}>
                <label id={`apply-q-${qi}`} className="block text-sm font-semibold text-slate-600">
                  {qi + 1}. {q.prompt} <span className="text-rose-500">*</span>
                </label>
                {q.type === 'mcq' ? (
                  <div className="mt-2 space-y-2">
                    {q.options.map((opt, oi) => {
                      const checked = answers[qi]?.type === 'mcq' && (answers[qi] as { selectedOption: string }).selectedOption === opt;
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                            checked
                              ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10'
                              : errors[`q${qi}`]
                                ? 'border-rose-300 hover:border-rose-400'
                                : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${qi}`}
                            checked={checked}
                            onChange={() => setAnswer(qi, opt)}
                            className="accent-emerald-600"
                          />
                          <span className="text-sm text-slate-700">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    aria-labelledby={`apply-q-${qi}`}
                    value={answers[qi]?.type === 'writing' ? (answers[qi] as { text: string }).text : ''}
                    onChange={(e) => setAnswer(qi, e.target.value)}
                    rows={3}
                    placeholder="Write your answer..."
                    className={`mt-2 w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${
                      errors[`q${qi}`] ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                )}
                {errors[`q${qi}`] && <p className="mt-1 text-xs font-medium text-rose-500">{errors[`q${qi}`]}</p>}
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-slate-700">
            Cover Letter <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => {
              setCoverLetter(e.target.value);
              setErrors((prev) => {
                if (!prev.coverLetter) return prev;
                const next = { ...prev };
                delete next.coverLetter;
                return next;
              });
            }}
            placeholder="Tell the employer why you're a great fit for this role..."
            rows={4}
            className={`mt-2 w-full resize-none rounded-xl border bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 ${
              errors.coverLetter ? 'border-rose-400' : 'border-slate-200'
            }`}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.coverLetter ? (
              <p className="text-xs font-medium text-rose-500">{errors.coverLetter}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-slate-400">{coverLetter.length}/2000</p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </div>
    </div>
  );
}
