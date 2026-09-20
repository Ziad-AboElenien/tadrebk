'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, PenLine, Save, Share2, Star, X } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import InternAvatar from '@/components/ui/InternAvatar';
import { evaluationService, Evaluation } from '@/features/company/services/evaluation.service';
import { internService } from '@/features/company/services/intern.service';
import { Intern } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stars({ value }: { value: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(value) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

export default function EvaluationDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const evaluationId = params.evaluationId as string;
  const programId = searchParams.get('programId') || '';
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [intern, setIntern] = useState<Intern | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [skill, setSkill] = useState('');
  const [teamwork, setTeamwork] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!companyId || !evaluationId) return;
    setLoading(true);
    try {
      const ev = await evaluationService.getEvaluation(companyId, evaluationId);
      setEvaluation(ev);
      setSkill(String(ev.skillRating));
      setTeamwork(String(ev.teamworkRating));
      setStrengths(ev.strengths || '');
      setImprovements(ev.improvements || '');
      setNotes(ev.privateNotes || '');
      try {
        const list = await internService.listAllInterns(companyId);
        setIntern(list.find((i) => i._id === ev.internId) || null);
      } catch {
        // intern name stays as id fallback
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, evaluationId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const backHref = programId ? `/company/admin/evaluations?programId=${programId}` : '/company/admin/evaluations';

  const handleUpdate = async () => {
    if (!companyId || !evaluation) return;
    const errs: Record<string, string> = {};
    const sk = Number(skill);
    const tw = Number(teamwork);
    if (Number.isNaN(sk) || sk < 0 || sk > 5) errs.skill = 'Must be between 0 and 5.';
    if (Number.isNaN(tw) || tw < 0 || tw > 5) errs.teamwork = 'Must be between 0 and 5.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      const updated = await evaluationService.updateEvaluation(companyId, evaluation._id, {
        skillRating: sk,
        teamworkRating: tw,
        strengths: strengths.trim() || undefined,
        improvements: improvements.trim() || undefined,
        privateNotes: notes.trim() || undefined,
      });
      setEvaluation(updated);
      setEditing(false);
      toastHelper.success('Evaluation updated');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!companyId || !evaluation) return;
    setSharing(true);
    try {
      const updated = await evaluationService.shareEvaluation(companyId, evaluation._id);
      setEvaluation(updated);
      toastHelper.success('Evaluation shared with intern');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSharing(false);
    }
  };

  const internName = intern
    ? `${intern.firstName} ${intern.lastName}`.trim() || intern.email
    : evaluation
      ? evaluation.internId.slice(-6).toUpperCase()
      : '—';

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Evaluations" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Evaluation Details" />

        <main className="animate-fade-in mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={15} /> Back to Evaluations
          </Link>

          {loading ? (
            <div className="space-y-4">
              <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : !evaluation ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Evaluation not found.
            </p>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <InternAvatar
                      src={intern?.profilePicture?.secure_url}
                      firstName={intern?.firstName}
                      lastName={intern?.lastName}
                      email={intern?.email}
                      className="h-12 w-12 text-sm"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-bold text-slate-900">{internName}</h2>
                      <p className="text-sm text-slate-400">
                        {formatDate(evaluation.period.start)} → {formatDate(evaluation.period.end)}
                      </p>
                    </div>
                  </div>
                  {evaluation.sharedWithIntern ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 size={12} /> Shared{evaluation.sharedAt ? ` · ${formatDate(evaluation.sharedAt)}` : ''}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Draft</span>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { label: 'Overall', value: String(evaluation.overallScore) },
                    { label: 'Attendance', value: `${evaluation.attendanceRate}%` },
                    { label: 'Evaluated', value: formatDate(evaluation.evaluatedAt) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">{s.value}</p>
                    </div>
                  ))}
                </div>

                {!editing ? (
                  <dl className="mt-6 space-y-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-slate-500">Skill rating</dt>
                      <dd className="flex items-center gap-2 font-semibold text-slate-900">
                        {evaluation.skillRating} <Stars value={evaluation.skillRating} />
                      </dd>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <dt className="text-slate-500">Teamwork rating</dt>
                      <dd className="flex items-center gap-2 font-semibold text-slate-900">
                        {evaluation.teamworkRating} <Stars value={evaluation.teamworkRating} />
                      </dd>
                    </div>
                    {evaluation.strengths && (
                      <div>
                        <dt className="text-slate-500">Strengths</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{evaluation.strengths}</dd>
                      </div>
                    )}
                    {evaluation.improvements && (
                      <div>
                        <dt className="text-slate-500">Areas to improve</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{evaluation.improvements}</dd>
                      </div>
                    )}
                    {evaluation.privateNotes && (
                      <div className="rounded-xl bg-amber-50 p-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-amber-600">Private notes (admin only)</dt>
                        <dd className="mt-1 whitespace-pre-wrap break-words text-slate-700">{evaluation.privateNotes}</dd>
                      </div>
                    )}
                  </dl>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Skill (0–5)</label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.5}
                          value={skill}
                          onChange={(e) => setSkill(e.target.value)}
                          className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                            errors.skill ? 'border-rose-400' : 'border-slate-200'
                          }`}
                        />
                        {errors.skill && <p className="mt-1 text-xs font-medium text-rose-500">{errors.skill}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Teamwork (0–5)</label>
                        <input
                          type="number"
                          min={0}
                          max={5}
                          step={0.5}
                          value={teamwork}
                          onChange={(e) => setTeamwork(e.target.value)}
                          className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                            errors.teamwork ? 'border-rose-400' : 'border-slate-200'
                          }`}
                        />
                        {errors.teamwork && <p className="mt-1 text-xs font-medium text-rose-500">{errors.teamwork}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Strengths</label>
                      <textarea rows={3} value={strengths} onChange={(e) => setStrengths(e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Areas to improve</label>
                      <textarea rows={3} value={improvements} onChange={(e) => setImprovements(e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Private notes</label>
                      <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                  {!evaluation.sharedWithIntern && !editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <PenLine size={14} /> Edit
                    </button>
                  )}
                  {editing && (
                    <>
                      <button
                        onClick={() => setEditing(false)}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <X size={14} /> Cancel
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </>
                  )}
                  {!evaluation.sharedWithIntern && !editing && (
                    <button
                      onClick={handleShare}
                      disabled={sharing}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                      <Share2 size={14} /> {sharing ? 'Sharing...' : 'Share with intern'}
                    </button>
                  )}
                  <button
                    onClick={() => router.push('/company/admin/evaluations/new')}
                    className="ml-auto text-sm font-medium text-emerald-600 hover:underline"
                  >
                    + New evaluation
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
