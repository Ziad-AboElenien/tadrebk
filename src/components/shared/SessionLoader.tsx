'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import { setRole, setStatus } from '@/store/authSlice';
import { userService } from '@/features/student/services/user.service';
import { companyService } from '@/features/company/services/company.service';
import { LS_USER_ROLE } from '@/lib/constants';

/**
 * On mount, if auth tokens exist but currentUser / currentCompany are null,
 * fetch them so the UI (Navbar, dashboards) works after a hard refresh.
 */
export default function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, userId, role } = useAppSelector((s) => s.auth);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const currentCompany = useAppSelector((s) => s.company.currentCompany);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // No active session → nothing to hydrate.
    if (!isAuthenticated || !userId) {
      dispatch(setStatus('succeeded'));
      return;
    }

    const id = userId;
    dispatch(setStatus('loading'));

    async function hydrate() {
      try {
        const user = await userService.getUserProfile(id);
        dispatch(setUser(user));

        // Check if profile says admin (JWT-based detection may miss it)
        if ((user as any).role === 'admin') {
          dispatch(setRole('admin'));
          return;
        }

        // Fallback: check localStorage
        const storedRole = localStorage.getItem(LS_USER_ROLE);
        if (storedRole === 'admin') {
          dispatch(setRole('admin'));
          return;
        }

        const { companies } = await companyService.listCompanies({ limit: 50 });
        const owned = companies.find((c) => {
          const createdBy =
            typeof c.createdBy === 'object' && c.createdBy !== null
              ? (c.createdBy as { _id: string })._id
              : (c.createdBy as string);
          return createdBy === id;
        });
        if (owned) {
          const full = await companyService.getCompanyById(owned._id);
          dispatch(setCompany(full));
          dispatch(setRole('company'));
        } else {
          // Student with no categories → redirect to onboarding
          const isOnOnboarding = pathname === '/onboarding';
          const hasCategories = user.categories && user.categories.length > 0;
          if (!hasCategories && !isOnOnboarding) {
            router.replace('/onboarding');
          }
        }
      } catch {
        // Token invalid — logout will have happened via the axios interceptor
      } finally {
        dispatch(setStatus('succeeded'));
      }
    }

    if (!currentUser) {
      hydrate();
    } else {
      dispatch(setStatus('succeeded'));
    }
  }, [isAuthenticated, userId, currentUser, currentCompany, dispatch, pathname, router]);

  // Guard: if a student has no categories, keep them on /onboarding
  useEffect(() => {
    if (!isAuthenticated || !currentUser || role === 'company' || role === 'admin') return;
    if (pathname === '/onboarding') return;
    if (!currentUser.categories || currentUser.categories.length === 0) {
      router.replace('/onboarding');
    }
  }, [isAuthenticated, currentUser, role, pathname, router]);

  return <>{children}</>;
}
