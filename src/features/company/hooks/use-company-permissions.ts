'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/store';
import { roleService } from '@/features/company/services/role.service';
import { staffService } from '@/features/company/services/staff.service';

export interface CompanyPermissions {
  isOwner: boolean;
  loading: boolean;
  permissions: Set<string>;
  can: (...perms: string[]) => boolean;
  canAny: (perms: string[]) => boolean;
}

/**
 * Resolves the current user's permission set inside a company.
 * Owners bypass everything. Staff resolve via team list → role → role perms.
 * While loading, everything is allowed (backend 403s remain the enforcer).
 */
export function useCompanyPermissions(companyId?: string | null): CompanyPermissions {
  const storeRole = useAppSelector((s) => s.auth.role);
  const userId = useAppSelector((s) => s.auth.userId);
  const backendRole = useAppSelector(
    (s) => (s.user.currentUser as { role?: string } | null)?.role || '',
  );
  const userEmail = useAppSelector((s) => s.user.currentUser?.email || '');

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  const isOwner =
    storeRole === 'company' && !/instructor/i.test(backendRole);

  useEffect(() => {
    if (!companyId || isOwner) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [members, roles] = await Promise.all([
          staffService.listStaff(companyId, 'active').catch(() => []),
          roleService.listRoles(companyId).catch(() => []),
        ]);
        if (cancelled) return;
        const me =
          members.find((m) => m._id === userId) ??
          members.find((m) => m.email?.toLowerCase() === userEmail.toLowerCase());
        const roleName = me?.roleName;
        const role = roles.find((r) => r.name === roleName || r._id === me?.roleId);
        setPermissions(new Set(role?.permissions ?? []));
      } catch {
        if (!cancelled) setPermissions(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, isOwner, userId, userEmail]);

  const can = useCallback(
    (...perms: string[]) => {
      if (isOwner || loading) return true;
      return perms.every((p) => permissions.has(p));
    },
    [isOwner, loading, permissions],
  );

  const canAny = useCallback(
    (perms: string[]) => {
      if (isOwner || loading) return true;
      return perms.some((p) => permissions.has(p));
    },
    [isOwner, loading, permissions],
  );

  return { isOwner, loading, permissions, can, canAny };
}
