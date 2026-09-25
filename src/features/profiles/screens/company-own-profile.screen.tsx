'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setCompany } from '@/store/companySlice';
import { companyService, type CompanyRatings } from '@/features/company/services/company.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService } from '@/features/student/services/application.service';
import type { Company } from '@/features/company/types';
import { getErrorMessage } from '@/lib/axios';
import { LS_PENDING_ONBOARDING } from '@/lib/constants';
import { toastHelper } from '@/lib/toast';
import Button from '@/components/ui/Button';
import CompanyProfileOwn, { type PostingWithApplicants } from '@/features/profiles/components/CompanyProfileOwn';
import CompanyProfileViewer from '@/features/profiles/components/CompanyProfileViewer';
import { CompanyProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function CompanyOwnProfileScreen() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const storedCompany = useAppSelector((s) => s.company.currentCompany);
  const backendRole =
    useAppSelector((s) => s.user.currentUser as { role?: string } | null)?.role || '';
  const isPendingCompany = /company/i.test(backendRole);
  // The onboarding form is reachable ONLY from a fresh signup holding its
  // flag — everywhere else shows the under-review state, never the form.
  const freshSignup =
    typeof window !== 'undefined' && localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';
  const [company, setLocalCompany] = useState<Company | null>(storedCompany);
  const [postings, setPostings] = useState<PostingWithApplicants[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [totalPostings, setTotalPostings] = useState(0);
  const [ratings, setRatings] = useState<CompanyRatings | null>(null);
  const [loading, setLoading] = useState(true);

  const isPreview = searchParams.get('preview') === 'student';

  useEffect(() => {
    if (!storedCompany?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const companyId = storedCompany._id;
        const [fresh, list, ratingData] = await Promise.all([
          companyService.getCompanyById(companyId).catch(() => storedCompany),
          internshipService.listInternships({ companyId, limit: 50 }),
          companyService.getCompanyRatings(companyId).catch(() => null),
        ]);
        if (cancelled) return;
        dispatch(setCompany(fresh));
        setLocalCompany(fresh);
        setTotalPostings(list.pagination.total);
        setRatings(ratingData);
        // Prefer the aggregated count from the list endpoint; fall back to
        // per-posting fetches only for items missing it (no N+1 by default).
        const missing = list.internships.filter((p) => typeof p.applicantsCount !== 'number');
        const fetched = new Map<string, number>();
        if (missing.length > 0) {
          const counts = await Promise.allSettled(
            missing.map((p) =>
              applicationService
                .getCompanyApplications(companyId, p._id, { limit: 1 })
                .then((r) => r.pagination.total)
                .catch(() => 0),
            ),
          );
          missing.forEach((p, i) => {
            fetched.set(p._id, counts[i].status === 'fulfilled' ? (counts[i] as PromiseFulfilledResult<number>).value : 0);
          });
        }
        if (cancelled) return;
        const withCounts: PostingWithApplicants[] = list.internships.map((p) => ({
          ...p,
          applicantsCount: typeof p.applicantsCount === 'number' ? p.applicantsCount : (fetched.get(p._id) ?? 0),
        }));
        setPostings(withCounts);
        setTotalApplicants(withCounts.reduce((a, p) => a + p.applicantsCount, 0));
      } catch (err) {
        if (!cancelled) toastHelper.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Depend on the id only — the full company object identity changes on every store update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedCompany?._id, dispatch]);

  if (!storedCompany?._id) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          {freshSignup ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">No company profile yet</h1>
              <p className="mt-2 text-sm text-slate-500">Complete onboarding to create your company profile.</p>
              <Link href="/company/onboarding" className="mt-6 inline-block">
                <Button>Complete Onboarding</Button>
              </Link>
            </>
          ) : isPendingCompany ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <i className="fas fa-hourglass-half text-2xl text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Your account is under review</h1>
              <p className="mt-2 text-sm text-slate-500">
                Our admin team is reviewing your company profile. It will appear
                here automatically once you&apos;re approved.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">No company profile yet</h1>
              <p className="mt-2 text-sm text-slate-500">
                We couldn&apos;t load your company profile. Try signing in again.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <CompanyProfileSkeleton />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          {freshSignup ? (
            <>
              <h1 className="text-2xl font-bold text-slate-900">No company profile yet</h1>
              <p className="mt-2 text-sm text-slate-500">Complete onboarding to create your company profile.</p>
              <Link href="/company/onboarding" className="mt-6 inline-block">
                <Button>Complete Onboarding</Button>
              </Link>
            </>
          ) : isPendingCompany ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
                <i className="fas fa-hourglass-half text-2xl text-amber-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Your account is under review</h1>
              <p className="mt-2 text-sm text-slate-500">
                Our admin team is reviewing your company profile. It will appear
                here automatically once you&apos;re approved.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900">No company profile yet</h1>
              <p className="mt-2 text-sm text-slate-500">
                We couldn&apos;t load your company profile. Try signing in again.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
          <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Preview — this is how students see your company.{' '}
            <Link href="/company/profile" className="font-semibold underline">
              Back to my profile
            </Link>
          </p>
        </div>
        <CompanyProfileViewer company={company} postings={postings} totalPostings={totalPostings} ratings={ratings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <CompanyProfileOwn company={company} postings={postings} totalApplicants={totalApplicants} ratings={ratings} />
    </div>
  );
}
