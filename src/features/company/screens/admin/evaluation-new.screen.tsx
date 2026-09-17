'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import Select from '@/components/ui/Select';
import { evaluationService } from '@/features/company/services/evaluation.service';
import { internService } from '@/features/company/services/intern.service';
import { Intern } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function EvaluationNewScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetInternId = searchParams.get('internId') || '';
  const programId = searchParams.get('programId') || '';
  const company = useAppSelector((s) => s.company.currentCompany);
  const companyId = company?._id;

  const [interns, setInterns] = useState<Intern[]>([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [internId, setInternId] = useState(presetInternId);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [skill, setSkill] = useState('4');
  const [teamwork, setTeamwork] = useState('4');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    (async () => {
      try {
        const list = await internService.listAllInterns(companyId);
        setInterns(list);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setLoadingInterns(false);
      }
    })();
  }, [companyId]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!internId) errs.internId = 'Choose an intern.';
    if (!periodStart) errs.periodStart = 'Period start is required.';
    if (!periodEnd) errs.periodEnd = 'Period end is required.';
    if (periodStart && periodEnd && new Date(periodEnd) < new Date(periodStart)) {
      errs.periodEnd = 'Period end must be after start.';
    }
    const sk = Number(skill);
    if (Number.isNaN(sk) || sk < 0 || sk > 5) errs.skill = 'Must be between 0 and 5.';
    const tw = Number(teamwork);
    if (Number.isNaN(tw) || tw < 0 || tw > 5) errs.teamwork = 'Must be between 0 and 5.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async () => {
    if (!companyId || creating) return;
    if (!validate()) return;
    setCreating(true);
    try {
      const created = await evaluationService.createEvaluation(companyId, internId, {
        internId,
        period: { start: new Date(periodStart).toISOString(), end: new Date(periodEnd).toISOString() },
        skillRating: Number(skill),
        teamworkRating: Number(teamwork),
        strengths: strengths.trim() || undefined,
        improvements: improvements.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
      });
      toastHelper.success('Evaluation created');
      router.push(`/company/admin/evaluations/${created._id}${programId ? `?programId=${programId}` : ''}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Evaluations" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="New Evaluation" />

        <main className="animate-fade-in mx-auto w-full max-w-3xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Link
            href={programId ? `/company/admin/evaluations?programId=${programId}` : '/company/admin/evaluations'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={15} /> Back to Evaluations
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">New Evaluation</h2>
            <p className="mt-1 text-sm text-slate-500">Rate an intern for a review period.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Intern <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={internId}
                  onChange={(e) => setInternId(e.target.value)}
                  placeholder={loadingInterns ? 'Loading interns...' : 'Select intern...'}
                  error={errors.internId}
                  className="mt-2"
                  disabled={loadingInterns}
                >
                  {interns.map((i) => (
                    <option key={i._id} value={i._id}>{`${i.firstName} ${i.lastName}`.trim() || i.email}</option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Period start <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                      errors.periodStart ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.periodStart && <p className="mt-1 text-xs font-medium text-rose-500">{errors.periodStart}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Period end <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className={`mt-2 w-full rounded-lg border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                      errors.periodEnd ? 'border-rose-400' : 'border-slate-200'
                    }`}
                  />
                  {errors.periodEnd && <p className="mt-1 text-xs font-medium text-rose-500">{errors.periodEnd}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700">Skill (0–5, step 0.5)</label>
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
                  <label className="text-sm font-medium text-slate-700">Teamwork (0–5, step 0.5)</label>
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
                <textarea
                  rows={3}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Areas to improve</label>
                <textarea
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Private notes (admin only)</label>
                <textarea
                  rows={3}
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus size={15} /> Create Evaluation
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
