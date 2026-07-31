'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LS_PENDING_ONBOARDING } from '@/lib/constants';

const ONBOARDING_ROUTE = '/company/onboarding';

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pending = localStorage.getItem(LS_PENDING_ONBOARDING) === 'true';
    if (!pending) return;
    if (pathname === ONBOARDING_ROUTE) return;
    router.replace(ONBOARDING_ROUTE);
  }, [pathname, router]);

  return null;
}
