'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Flag,
  Globe,
  Link2,
  MapPin,
  Share2,
  Users,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import { getCompanyImgUrl, type Company } from '@/features/company/types';
import { companyService, type CompanyRatings } from '@/features/company/services/company.service';
import { getInternshipTracks, type Internship } from '@/features/internship/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import api from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import ReportModal from '@/components/ui/ReportModal';
import {
  Pill,
  ProfileEmptyState,
  RatingStars,
  SectionCard,
  formatDate,
  formatMonthYear,
} from '@/features/profiles/components/ProfilePrimitives';

interface CompanyProfileViewerProps {
  company: Company;
  postings: Internship[];
  totalPostings: number;
  ratings: CompanyRatings | null;
}

export default function CompanyProfileViewer({ company, postings, totalPostings, ratings }: CompanyProfileViewerProps) {
  const role = useAppSelector((s) => s.auth.role);
  const isStudent = role === 'student';
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const logoUrl = getCompanyImgUrl(company.logo);
  const coverUrl = getCompanyImgUrl(company.coverPicture);
  const openPostings = postings.filter((p) => !p.closed);
  const hiringTracks = [...new Set(postings.flatMap((p) => getInternshipTracks(p)))].slice(0, 12);
  const ratingCount = ratings?.count ?? 0;
  const ratingAvg = ratings?.avg ?? null;

  useEffect(() => {
    if (!isStudent) return;
    (async () => {
      try {
        const res = await companyService.getSavedCompanies(1, 100);
        setSaved(res.companies.some((c) => c._id === company._id));
      } catch {
        // not saved (or session expired) — stay unsaved
      }
    })();
  }, [isStudent, company._id]);

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: company.name, url });
      } else {
        await navigator.clipboard.writeText(url);
        toastHelper.success('Company link copied');
      }
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  }

  async function handleToggleSave() {
    if (!isStudent) {
      toastHelper.info('Sign in as a student to save companies');
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (saved) {
        await companyService.unsaveCompany(company._id);
        setSaved(false);
        toastHelper.success('Removed from saved companies');
      } else {
        await companyService.saveCompany(company._id);
        setSaved(true);
        toastHelper.success('Company saved!');
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-[2.5%] py-4 sm:px-6 sm:py-8">
      {/* ---------- cover + identity ---------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-44 bg-gradient-to-r from-slate-900 to-slate-700">
          {coverUrl && <img src={coverUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={company.name}
                className="h-28 w-28 rounded-2xl border-4 border-white bg-white object-contain shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-3xl font-bold text-white shadow-lg">
                {company.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pb-1">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share company"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                  saved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark size={15} className={saved ? 'fill-emerald-600' : ''} />
                {saved ? 'Saved' : 'Save company'}
              </button>
              <a
                href="#open-internships"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                View open internships <ArrowRight size={15} />
              </a>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold text-slate-900">{company.name}</h1>
              {company.approvedByAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            {company.headline && <p className="mt-0.5 break-words text-slate-600">{company.headline}</p>}
            {company.description && !company.headline && (
              <p className="mt-1 line-clamp-2 break-words text-slate-600">{company.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <RatingStars ratingSum={(ratingAvg ?? 0) * ratingCount} ratingCount={ratingCount} />
              {company.industry && (
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} /> {company.industry}
                </span>
              )}
              {company.numberOfEmployees && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {company.numberOfEmployees} employees
                </span>
              )}
              {company.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {company.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* trust strip */}
        <div className="grid grid-cols-2 divide-slate-100 border-t border-slate-100 sm:grid-cols-3 sm:divide-x">
          {[
            { label: 'Open positions', value: String(openPostings.length) },
            { label: 'Total postings', value: String(totalPostings) },
            { label: 'Avg. intern rating', value: ratingCount > 0 && ratingAvg != null ? `${ratingAvg.toFixed(1)}/5` : '—' },
          ].map((s) => (
            <div key={s.label} className="px-6 py-4 text-center">
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ================= main column ================= */}
        <div className="min-w-0 space-y-6">
          <div id="open-internships" className="scroll-mt-24">
            <SectionCard
              title="Open internships"
              subtitle={`${openPostings.length} position${openPostings.length !== 1 ? 's' : ''} accepting applications`}
            >
              {openPostings.length ? (
                <div className="space-y-3">
                  {openPostings.map((p) => {
                    const tracks = getInternshipTracks(p);
                    return (
                      <div
                        key={p._id}
                        className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-5 transition-colors hover:border-emerald-200 hover:bg-emerald-50/30"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Briefcase size={19} />
                        </span>
                        <div className="min-w-0 flex-1 basis-48">
                          <p className="truncate font-semibold text-slate-900">{p.title}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {[tracks[0], p.workingTime, p.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <Link
                          href={`/internships/${p._id}/apply`}
                          className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          Apply
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ProfileEmptyState message="No open positions right now — save the company to get notified." />
              )}
            </SectionCard>
          </div>

          {company.description && (
            <SectionCard title={`About ${company.name}`}>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{company.description}</p>
              {hiringTracks.length > 0 && (
                <>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Hiring in</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hiringTracks.map((t) => (
                      <Pill key={t}>{CATEGORY_LABELS[t as keyof typeof CATEGORY_LABELS] || t}</Pill>
                    ))}
                  </div>
                </>
              )}
            </SectionCard>
          )}

          <SectionCard
            title="Intern reviews"
            subtitle={
              ratingCount > 0
                ? `${ratingCount} student${ratingCount !== 1 ? 's' : ''} rated their internship here`
                : 'No reviews yet'
            }
          >
            {ratingCount > 0 && ratingAvg != null ? (
              <>
                <div className="mb-5 flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-5">
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{ratingAvg.toFixed(1)}</p>
                    <RatingStars ratingSum={ratingAvg * ratingCount} ratingCount={ratingCount} showCount={false} />
                  </div>
                  {ratings && ratings.histogram.length > 0 && (
                    <div className="w-full min-w-0 flex-1 space-y-1.5 sm:min-w-[180px]">
                      {ratings.histogram.map((r) => (
                        <div key={r.stars} className="flex items-center gap-2 text-xs">
                          <span className="w-3 text-slate-400">{r.stars}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
                          </div>
                          <span className="w-8 text-right text-slate-400">{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {ratings && ratings.reviews.length > 0 && (
                  <div className="space-y-4">
                    {ratings.reviews.map((r, i) => (
                      <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">
                              {(r.student || '?')[0]?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{r.student || 'Anonymous'}</p>
                              <p className="text-xs text-slate-400">
                                {[r.track ? `${r.track} intern` : null, r.date ? formatDate(r.date) : null]
                                  .filter(Boolean)
                                  .join(' · ') || 'Intern'}
                              </p>
                            </div>
                          </div>
                          {!!r.rating && r.rating > 0 && (
                            <RatingStars ratingSum={r.rating} ratingCount={1} showCount={false} size={13} />
                          )}
                        </div>
                        {r.body && (
                          <p className="mt-3 break-words text-sm leading-relaxed text-slate-600">{r.body}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ProfileEmptyState message="No intern reviews yet — be the first to rate this company after your internship." />
            )}
          </SectionCard>
        </div>

        {/* ================= sidebar ================= */}
        <div className="space-y-6">
          <SectionCard title="Company details">
            <dl className="space-y-4 text-sm">
              {company.industry && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Industry</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{company.industry}</dd>
                </div>
              )}
              {company.numberOfEmployees && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Company size</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{company.numberOfEmployees} employees</dd>
                </div>
              )}
              {company.foundedYear != null && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Founded</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{company.foundedYear}</dd>
                </div>
              )}
              {company.address && (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</dt>
                  <dd className="mt-0.5 font-medium text-slate-900">{company.address}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">On Tadrebk since</dt>
                <dd className="mt-0.5 font-medium text-slate-900">{formatMonthYear(company.createdAt) || '—'}</dd>
              </div>
            </dl>

            {(company.website || company.linkedin || company.googleMapsUrl) && (
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-5">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
                  >
                    <Globe size={15} /> Visit website
                  </a>
                )}
                {company.linkedin && (
                  <a
                    href={company.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
                  >
                    <Link2 size={15} /> LinkedIn
                  </a>
                )}
                {company.googleMapsUrl && (
                  <a
                    href={company.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:underline"
                  >
                    <Globe size={15} /> View on map
                  </a>
                )}
              </div>
            )}
          </SectionCard>

          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <p className="font-bold">Interested in {company.name}?</p>
            <p className="mt-1.5 text-sm text-slate-300">
              Save the company and we&apos;ll notify you the moment a new internship opens.
            </p>
            <button
              type="button"
              onClick={handleToggleSave}
              disabled={saving}
              className="mt-4 w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold hover:bg-emerald-600 disabled:opacity-60"
            >
              {saved ? 'Saved ✓' : 'Save company'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-rose-500"
          >
            <Flag size={14} /> Report this company
          </button>
          <ReportModal
            open={reportOpen}
            title={`Report ${company.name}`}
            onClose={() => setReportOpen(false)}
            onConfirm={async (reason) => {
              try {
                await api.post('/reports', { targetType: 'company', targetId: company._id, reason });
                toastHelper.success('Report received. Our team will review it.');
              } catch (err) {
                toastHelper.error(getErrorMessage(err));
                throw err;
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}

