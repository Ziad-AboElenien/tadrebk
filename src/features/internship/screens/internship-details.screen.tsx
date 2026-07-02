'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Internship, getCompanyIdFromInternship } from '@/features/internship/types';
import { Company, getImgUrl } from '@/features/company/types';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import ApplyModal from '@/components/ui/ApplyModal';
import { internshipService } from '@/services/internship.service';
import { applicationService } from '@/services/application.service';
import { useAppSelector } from '@/store/store';
import { getErrorMessage, getErrorUrl } from '@/lib/axios';
import { toast } from 'react-toastify';

const LS_SAVED = 'tadrebk_saved_internships';

function isSaved(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try { return JSON.parse(localStorage.getItem(LS_SAVED) || '[]').includes(id); }
  catch { return false; }
}

function toggleSaved(id: string): boolean {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
    const idx = saved.indexOf(id);
    if (idx > -1) { saved.splice(idx, 1); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return false; }
    else { saved.push(id); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return true; }
  } catch { return false; }
}

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
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => { setSaved(isSaved(internId)); }, [internId]);

  // Check if user already applied
  useEffect(() => {
    if (!isAuthenticated || !internId || !user?._id) return;
    const userId = user._id;
    applicationService.getUserApplications(userId, { limit: 50 })
      .then((res) => {
        if (res.applications.some((a) => a.internshipId === internId)) {
          setAlreadyApplied(true);
        }
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
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (internId) fetchData();
  }, [internId]);

  const handleApply = useCallback(() => {
    if (!isAuthenticated) {
      router.push(`/login/student?next=/internships/${internId}`);
      return;
    }
    if (!internship || internship.closed) {
      toast.error('This internship is closed');
      return;
    }
    if (alreadyApplied) {
      toast.info('You already applied to this internship');
      return;
    }
    if (!user?.resume) {
      toast.warning('You haven\'t uploaded your CV/resume yet. Please upload one in your profile before applying.');
    }
    setShowApplyModal(true);
  }, [isAuthenticated, internship, internId, alreadyApplied, user, router]);

  const handleApplySubmit = useCallback(async (coverLetter: string) => {
    if (!internship) return;
    setApplying(true);
    try {
      const cid = getCompanyIdFromInternship(internship);
      if (!cid) {
        toast.error('Company information not available for this internship');
        setApplying(false);
        setShowApplyModal(false);
        return;
      }
      await applicationService.apply(cid, internId, { coverLetter: coverLetter || undefined });
      toast.success('Application submitted!');
      setShowApplyModal(false);
    } catch (err: any) {
      const msg = getErrorMessage(err);
      if (msg.includes('already applied')) {
        toast.info('You already applied to this internship');
      } else if (msg.includes('resume') || msg.includes('CV')) {
        toast.warning('Please upload your CV/resume in your profile settings first');
      } else if (msg.includes('closed')) {
        toast.error('This internship is no longer accepting applications');
      } else if (msg.includes('Invalid internship id')) {
        const idUrl = getErrorUrl(err);
        toast.warning(`Unable to apply. Make sure you have uploaded your CV/resume in your profile, and that you haven't already applied.${idUrl ? ` (${idUrl})` : ''}`);
      } else {
        toast.error(msg);
      }
      setShowApplyModal(false);
    } finally {
      setApplying(false);
    }
  }, [internship, internId]);

  const handleSave = useCallback(() => {
    const now = toggleSaved(internId);
    setSaved(now);
    toast.success(now ? 'Saved!' : 'Removed from saved');
  }, [internId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50">
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
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Breadcrumb ─────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/internships" className="hover:text-gray-600">Internships</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">{internship.title}</span>
        </div>

        {/* ── Header card ────────────────────────────────── */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-5">
              {company ? (
                <Link href={`/companies/${company._id}`}>
                  <div className="h-16 w-16 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200 flex items-center justify-center text-gray-700 font-bold text-xl">
                    {getImgUrl(company.logo) ? (
                      <img src={getImgUrl(company.logo)!} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      company.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                </Link>
              ) : (
                <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200" />
              )}
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{internship.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {company && (
                    <Link href={`/companies/${company._id}`} className="flex items-center gap-1.5 font-semibold text-gray-600 hover:text-primary transition-colors">
                      <i className="fas fa-briefcase text-xs" />
                      {company.name}
                    </Link>
                  )}
                  <span className="flex items-center gap-1.5">
                    <i className="fas fa-users text-xs" />
                    {company?.address || locationLabels[internship.location] || internship.location}
                  </span>
                  {internship.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <i className="fas fa-calendar text-xs" />
                      Posted {new Date(internship.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    {locationLabels[internship.location] || internship.location}
                  </span>
                  {internship.workingTime && (
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {internship.workingTime}
                    </span>
                  )}
                  {internship.closed && (
                    <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!internship.closed && (
              <div className="flex flex-shrink-0 gap-3 sm:flex-col sm:items-stretch">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-200"
                >
                  <i className={`fas fa-bookmark ${saved ? 'text-emerald-500' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                {canApply && !alreadyApplied && (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Apply Now'}
                    <i className="fas fa-arrow-right text-xs" />
                  </button>
                )}
                {canApply && alreadyApplied && (
                  <button
                    disabled
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-300 px-5 py-2.5 text-sm font-bold text-gray-500 shadow-sm cursor-not-allowed"
                  >
                    <i className="fas fa-check-circle text-xs" />
                    Already Applied
                  </button>
                )}
              </div>
            )}
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
          <div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            {/* Overview */}
            <section>
              <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
                <i className="fas fa-info-circle text-emerald-500 text-lg" />
                Overview
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                {internship.description}
              </p>
            </section>

            {/* Requirements */}
            {(internship.technicalSkills?.length || internship.softSkills?.length) && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
                  <i className="fas fa-check-circle text-emerald-500 text-lg" />
                  Requirements
                </h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {internship.technicalSkills?.map((skill) => (
                    <div key={skill} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                      <i className="fas fa-check-circle mt-0.5 text-emerald-500" />
                      <p className="text-sm leading-relaxed text-gray-600">{skill}</p>
                    </div>
                  ))}
                  {internship.softSkills?.map((skill) => (
                    <div key={skill} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                      <i className="fas fa-check-circle mt-0.5 text-emerald-500" />
                      <p className="text-sm leading-relaxed text-gray-600">{skill}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <div className="rounded-2xl bg-gray-100 p-6">
              <h3 className="mb-5 flex items-center gap-2 text-base font-extrabold text-gray-900">
                <i className="fas fa-info-circle text-emerald-500" />
                Quick Facts
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-clock text-sm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Work Hours</p>
                    <p className="text-sm font-bold text-gray-900">{internship.workingTime || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-map-marker-alt text-sm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Location</p>
                    <p className="text-sm font-bold text-gray-900">{company?.address || locationLabels[internship.location] || internship.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                    <i className="fas fa-calendar text-sm" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Posted</p>
                    <p className="text-sm font-bold text-gray-900">
                      {internship.createdAt
                        ? new Date(internship.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {!internship.closed && canApply && !alreadyApplied && (
                <div className="mt-6 rounded-xl bg-white p-4 text-center">
                  <p className="mb-3 text-sm text-gray-500">Ready to kickstart your career?</p>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Apply for this role'}
                  </button>
                </div>
              )}
              {!internship.closed && canApply && alreadyApplied && (
                <div className="mt-6 rounded-xl bg-white p-4 text-center">
                  <p className="mb-3 text-sm text-gray-500">You already applied</p>
                  <button
                    disabled
                    className="w-full rounded-xl bg-gray-300 py-2.5 text-sm font-bold text-gray-500 cursor-not-allowed"
                  >
                    <i className="fas fa-check-circle mr-1" />
                    Already Applied
                  </button>
                </div>
              )}
            </div>

            {/* CV Builder card */}
            <div className="rounded-2xl bg-gray-900 p-6 text-white">
              <h3 className="mb-2 text-base font-extrabold">Need Help with your CV?</h3>
              <p className="mb-4 text-sm leading-relaxed text-gray-300">
                Our AI-powered CV builder is specifically designed for Egyptian students looking for top-tier internships.
              </p>
              <button className="w-full rounded-xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20">
                Try CV Builder
              </button>
            </div>
          </div>
        </div>

        {/* ── About company ──────────────────────────────── */}
        {company && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="flex items-center justify-between bg-gray-900 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200 flex items-center justify-center text-gray-700 font-bold">
                  {getImgUrl(company.logo) ? (
                    <img src={getImgUrl(company.logo)!} alt={company.name} className="w-full h-full object-cover" />
                  ) : (
                    company.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">About {company.name}</h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-300">
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
              <Link href={`/companies/${company._id}`}>
                <button className="rounded-xl bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
                  View Profile
                </button>
              </Link>
            </div>

            <div className="px-6 py-6 sm:px-8">
              {company.description && (
                <p className="text-sm italic leading-relaxed text-gray-500">
                  &ldquo;{company.description}&rdquo;
                </p>
              )}

              {moreInternships.length > 0 && (
                <>
                  <div className="my-6 h-px bg-gray-100" />
                  <div className="mb-4 flex items-center gap-2">
                    <p className="text-sm font-extrabold uppercase tracking-wide text-gray-900">
                      More Opportunities at {company.name}
                    </p>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      {moreInternships.length} Available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {moreInternships.map((intern) => (
                      <Link key={intern._id} href={`/internships/${intern._id}`}>
                        <div className="cursor-pointer rounded-xl border border-gray-100 p-4 transition hover:border-emerald-200 hover:shadow-sm">
                          <p className="text-sm font-bold text-gray-900">{intern.title}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
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

      <ApplyModal
        open={showApplyModal}
        internshipTitle={internship.title}
        companyName={company?.name}
        loading={applying}
        onSubmit={handleApplySubmit}
        onCancel={() => setShowApplyModal(false)}
      />
    </div>
  );
}
