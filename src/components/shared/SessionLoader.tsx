'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import { setRole } from '@/store/authSlice';
import { userService } from '@/services/user.service';
import { companyService } from '@/services/company.service';

/**
 * On mount, if auth tokens exist but currentUser / currentCompany are null,
 * fetch them so the UI (Navbar, dashboards) works after a hard refresh.
 */
export default function SessionLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userId } = useAppSelector((s) => s.auth);
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const currentCompany = useAppSelector((s) => s.company.currentCompany);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    if (!isAuthenticated || !userId) return;

    const id = userId;

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
        const storedRole = localStorage.getItem('tadrebk_user_role');
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
        }
      } catch {
        // Token invalid — logout will have happened via the axios interceptor
      }
    }

    if (!currentUser) {
      hydrate();
    }

    loaded.current = true;
  }, [isAuthenticated, userId, currentUser, currentCompany, dispatch]);

  return <>{children}</>;
}
