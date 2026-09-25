'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { LS_PENDING_ONBOARDING } from '@/lib/constants';

const ONBOARDING_ROUTE = '/company/onboarding';

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.role);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const currentCompany = useAppSelector((s) => s.company.currentCompany);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only enforce onboarding for authenticated users. A stale flag on a
    // logged-out device must not trap the user in a redirect loop.
    if (!isAuthenticated) return;
    // Only company accounts are ever gated — students (any role value that
    // isn't company, including role-less student profiles) are exempt, so a
    // stale flag can never drag them into company onboarding.
    if (role !== 'company') return;
    // A fully-onboarded student is never pending — the flag is another
    // account's leftover. Never drag them into company onboarding.
    const cats = currentUser?.categories;
    if (cats && cats.length > 0) return;
    // Companies that already have a profile don't need the form — the
    // onboarding screen itself bounces them to admin.
    if (currentCompany?._id) return;
    const pending = localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';
    if (!pending) return;
    if (pathname === ONBOARDING_ROUTE) return;
    router.replace(ONBOARDING_ROUTE);
  }, [pathname, router, isAuthenticated, role, currentUser, currentCompany]);

  return null;
}
