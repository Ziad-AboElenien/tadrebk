'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Internship, getCompanyIdFromInternship, getInternshipTracks } from '@/features/internship/types';
import { Company, getCompanyImgUrl } from '@/features/company/types';
import MediaImage from '@/components/ui/MediaImage';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import { useAppSelector } from '@/store/store';
import { CATEGORY_LABELS } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const locationLabels: Record<string, string> = { 'on-site': 'On-site', remote: 'Remote', hybrid: 'Hybrid' };

export default function InternshipDetailsScreen() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.role);
  const user = useAppSelector((s) => s.user.currentUser);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [moreInternships, setMoreInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !internId) return;
    internshipService.getSavedInternships(1, 500)
      .then((res) => {
        setSaved(res.internships.some((i) => i._id === internId));
      })
      .catch(() => {});
  }, [internId, isAuthenticated]);

  // Check if user already applied
  useEffect(() => {
    if (!isAuthenticated || !internId || !user?._id) return;
    const userId = user._id;
    applicationService.getUserApplications(userId, { limit: 50 })
      .then((res) => {
        const applied = res.applications.some((a) => {
          const aid =
            typeof a.internshipId === 'string'
              ? a.internshipId
              : a.internshipId?._id;
          return aid === internId;
        });
        if (applied) setAlreadyApplied(true);
      })
      .catch(() => {});
  }, [isAuthenticated, internId, user]);

  const canApply = role !== 'company' && role !== 'admin';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const internshipData = await internshipService.getInternshipById(internId);
        setInternship(internshipData);

        const companyData = typeof internshipData.companyId === 'object' && internshipData.companyId
          ? (internshipData.companyId as Company)
          : null;
        setCompany(companyData);

        const cid = getCompanyIdFromInternship(internshipData);
        if (cid) {
          try {
            const result = await internshipService.listInternships({ companyId: cid, limit: 3 });
            setMoreInternships(result.internships.filter((i) => i._id !== internId));
          } catch { /* ignore */ }
        }
      } catch (error) {
        toastHelper.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (internId) fetchData();
  }, [internId]);

  const handleApply = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/login/student?next=/internships/${internId}/apply`);
      return;
    }
    if (!internship || internship.closed) {
      toastHelper.error('This internship is closed');
      return;
    }
    if (alreadyApplied) {
      toastHelper.info('You already applied to this internship');
      return;
    }
    router.push(`/internships/${internId}/apply`);
  }, [isAuthenticated, internship, internId, alreadyApplied, router]);

  const handleSave = useCallback(async () => {
    const wasSaved = saved;
    setSaved(!wasSaved);
    try {
      if (wasSaved) {
        await internshipService.unsaveInternship(internId);
        toastHelper.success('Removed from saved');
      } else {
        await internshipService.saveInternship(internId);
        toastHelper.success('Saved!');
      }
    } catch {
      setSaved(wasSaved);
      toastHelper.error('Failed to update saved status');
    }
  }, [internId, saved]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
          <div className="mb-5 h-4 w-48 rounded bg-slate-200" />
          <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-5">
                <div className="h-16 w-16 rounded-2xl bg-slate-200" />
                <div className="space-y-3">
                  <div className="h-7 w-64 rounded bg-slate-200" />
                  <div className="h-4 w-40 rounded bg-slate-200" />
                  <div className="flex gap-2 mt-3">
                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                    <div className="h-6 w-16 rounded-full bg-slate-200" />
                  </div>
                </div>
              </div>
              <div className="h-9 w-28 rounded-lg bg-slate-200" />
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-5 w-32 rounded bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
              <div className="mt-6 h-5 w-40 rounded bg-slate-200" />
              <div className="flex flex-wrap gap-2">
                <div className="h-7 w-20 rounded-full bg-slate-200" />
                <div className="h-7 w-20 rounded-full bg-slate-200" />
                <div className="h-7 w-20 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm h-48" />
          </div>
        </main>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            title="Internship not found"
            description="The internship you're looking for doesn't exist or has been removed."
            action={<Link href="/internships"><Button variant="outline">Back to Internships</Button></Link>}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-2 text-sm text-slate-400 min-w-0">
          <Link href="/internships" className="hover:text-slate-600 shrink-0">Internships</Link>
          <span className="shrink-0">›</span>
          <span className="font-semibold text-slate-700 break-words">{internship.title}</span>
        </div>

        {/* ── Hero header ──────────────────────────────── */}
        <div className="relative mb-6 overflow-hidden rounded-3xl shadow-lg shadow-emerald-900/20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'linear-gradient(120deg, #064e3b 0%, #065f46 45%, #059669 100%)' }}
          />
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-teal-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -left-10 top-0 h-full w-32 -skew-x-12 bg-white/10" />
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          />
          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 gap-5">
                {company ? (
                  <Link href={`/companies/${company._id}`} className="shrink-0">
                    <MediaImage
                      src={getCompanyImgUrl(company.logo)}
                      alt={company.name}
                      boxClassName="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg"
                      imgClassName="w-full h-full object-cover"
                      iconClassName="fas fa-building text-xl text-white/70"
                    />
                  </Link>
                ) : (
                  <div className="h-16 w-16 flex-shrink-0 rounded-2xl border-2 border-white/40 bg-white/15 backdrop-blur" />
                )}
                <div className="min-w-0">
                  <h1 className="break-words text-2xl font-bold text-white sm:text-3xl">{internship.title}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-emerald-100/90">
                    {company && (
                      <Link href={`/companies/${company._id}`} className="flex items-center gap-1.5 font-semibold text-white hover:underline min-w-0">
                        <i className="fas fa-briefcase text-xs shrink-0" />
                        <span className="break-words">{company.name}</span>
                      </Link>
                    )}
                    <span className="flex items-center gap-1.5 min-w-0">
                      <i className="fas fa-users text-xs shrink-0" />
                      <span className="break-words">{company?.address || locationLabels[internship.location] || internship.location}</span>
                    </span>
                    {internship.createdAt && (
                      <span className="hidden items-center gap-1.5 sm:flex">
                        <i className="fas fa-calendar text-xs" />
                        Posted {new Date(internship.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                      {locationLabels[internship.location] || internship.location}
                    </span>
                    {internship.workingTime && (
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {internship.workingTime}
                      </span>
                    )}
                    {internship.closed && (
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-600">
                        Closed
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!internship.closed && (
                <div className="flex shrink-0 flex-row gap-3 sm:flex-col sm:items-stretch">
                  <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                  >
                    <i className={`fas fa-bookmark ${saved ? 'text-amber-300' : ''}`} />
                    {saved ? 'Saved' : 'Save'}
                  </button>
                  {canApply && !alreadyApplied && (
                    <button
                      onClick={handleApply}
                      className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
                    >
                      Apply Now
                      <i className="fas fa-arrow-right text-xs" />
                    </button>
                  )}
                  {canApply && alreadyApplied && (
                    <button
                      disabled
                      className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white"
                    >
                      <i className="fas fa-check-circle text-xs" />
                      Already Applied
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Closed banner ──────────────────────────────── */}
        {internship.closed && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700 text-sm font-medium">
            <i className="fas fa-lock mr-2" />
            This internship is no longer accepting applications.
          </div>
        )}

        {/* ── Body grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:col-span-2 overflow-hidden">
            {/* Overview */}
            <section>
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <i className="fas fa-info-circle text-emerald-500 text-lg" />
                Overview
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap break-words min-w-0">
                {internship.description}
              </p>
            </section>

            {/* Tracks */}
            {getInternshipTracks(internship).length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <i className="fas fa-tags text-emerald-500 text-lg" />
                  Tracks
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {getInternshipTracks(internship).map((track) => (
                    <span
                      key={track}
                      className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 border border-emerald-100"
                    >
                      {CATEGORY_LABELS[track as keyof typeof CATEGORY_LABELS] || track}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Requirements */}
            {(internship.technicalSkills?.length || internship.softSkills?.length) && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <i className="fas fa-check-circle text-emerald-500 text-lg" />
                  Requirements
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {internship.technicalSkills?.map((skill) => (
                    <div key={skill} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 overflow-hidden">
                      <i className="fas fa-check-circle mt-0.5 text-emerald-500 shrink-0" />
                      <p className="text-sm leading-relaxed text-slate-600 break-words min-w-0">{skill}</p>
                    </div>
                  ))}
                  {internship.softSkills?.map((skill) => (
                    <div key={skill} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 overflow-hidden">
                      <i className="fas fa-check-circle mt-0.5 text-emerald-500 shrink-0" />
                      <p className="text-sm leading-relaxed text-slate-600 break-words min-w-0">{skill}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="rounded-2xl bg-slate-100 p-6 overflow-hidden">
              <h3 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
                <i className="fas fa-info-circle text-emerald-500" />
                Quick Facts
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-clock text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Work Hours</p>
                    <p className="text-sm font-bold text-slate-900 break-words">{internship.workingTime || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-map-marker-alt text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Location</p>
                    <p className="text-sm font-bold text-slate-900 break-words">{company?.address || locationLabels[internship.location] || internship.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-calendar text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Posted</p>
                    <p className="text-sm font-bold text-slate-900 break-words">
                      {internship.createdAt
                        ? new Date(internship.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {!internship.closed && canApply && !alreadyApplied && (
                <div className="mt-6 rounded-xl bg-white p-4 text-center">
                  <p className="mb-3 text-sm text-slate-500">Ready to kickstart your career?</p>
                  <button
                    onClick={handleApply}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
                  >
                    Apply for this role
                  </button>
                </div>
              )}
              {!internship.closed && canApply && alreadyApplied && (
                <div className="mt-6 rounded-xl bg-white p-4 text-center">
                  <p className="mb-3 text-sm text-slate-500">You already applied</p>
                  <button
                    disabled
                    className="w-full rounded-xl bg-gray-300 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed"
                  >
                    <i className="fas fa-check-circle mr-1" />
                    Already Applied
                  </button>
                </div>
              )}
            </div>

            {/* CV Builder card */}
              <div className="rounded-2xl bg-slate-900 p-6 text-white overflow-hidden">
                <h3 className="mb-2 text-base font-bold">Need Help with your CV?</h3>
                <p className="mb-4 text-sm leading-relaxed text-slate-300 break-words min-w-0">
                  Build a standout CV from your profile in one click, then attach it here.
                </p>
                <Link
                  href="/profile"
                  className="block w-full rounded-xl bg-white/10 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Open My Profile
                </Link>
              </div>
          </div>
        </div>

        {/* ── About company ──────────────────────────────── */}
        {company && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between bg-slate-900 px-6 py-5 sm:px-8 overflow-hidden">
              <div className="flex items-center gap-4 min-w-0">
                <MediaImage
                  src={getCompanyImgUrl(company.logo)}
                  alt={company.name}
                  boxClassName="h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden"
                  imgClassName="w-full h-full object-cover"
                  iconClassName="fas fa-building text-lg text-slate-300"
                />
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-white break-words">About {company.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                    {company.numberOfEmployees && (
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-users text-xs" />
                        {company.numberOfEmployees} employees
                      </span>
                    )}
                    {company.industry && (
                      <span className="flex items-center gap-1.5">
                        <i className="fas fa-tag text-xs" />
                        {company.industry}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link href={`/companies/${company._id}`} className="shrink-0">
                <button className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  View Profile
                </button>
              </Link>
            </div>

            <div className="px-6 py-6 sm:px-8">
              {company.description && (
                <p className="text-sm italic leading-relaxed text-slate-500 break-words min-w-0">
                  &ldquo;{company.description}&rdquo;
                </p>
              )}

              {moreInternships.length > 0 && (
                <>
                  <div className="my-6 h-px bg-slate-100" />
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-900 break-words">
                      More Opportunities at {company.name}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {moreInternships.length} Available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {moreInternships.map((intern) => (
                      <Link key={intern._id} href={`/internships/${intern._id}`}>
                        <div className="cursor-pointer rounded-xl border border-slate-100 p-4 transition hover:border-emerald-200 hover:shadow-sm overflow-hidden">
                          <p className="text-sm font-bold text-slate-900 break-words">{intern.title}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <i className="fas fa-clock text-xs" />
                              {intern.workingTime || 'Full-time'}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="fas fa-map-marker-alt text-xs" />
                              {locationLabels[intern.location] || intern.location}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {!internship.closed && canApply && !alreadyApplied && (
        <div className="sticky bottom-0 z-30 -mx-4 border-t border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:hidden">
          <button
            onClick={handleApply}
            className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600"
          >
            Apply Now
          </button>
        </div>
      )}
    </div>
  );
}
