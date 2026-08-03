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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Only enforce onboarding for authenticated users. A stale flag on a
    // logged-out device must not trap the user in a redirect loop.
    if (!isAuthenticated) return;
    const pending = localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';
    if (!pending) return;
    if (pathname === ONBOARDING_ROUTE) return;
    router.replace(ONBOARDING_ROUTE);
  }, [pathname, router, isAuthenticated]);

  return null;
}
