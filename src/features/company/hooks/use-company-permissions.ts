'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '@/store/store';
import { permissionService } from '@/features/company/services/permission.service';
import { roleService } from '@/features/company/services/role.service';
import { staffService } from '@/features/company/services/staff.service';

/** Permissions cache TTL — one hour per company, then re-fetched. */
const PERMS_TTL_MS = 60 * 60 * 1000;

const permsKey = (companyId: string) => `tadrebk_perms_v2_${companyId}`;

interface CachedPerms {
  ts: number;
  permissions: string[];
  roleName: string | null;
  isOwner: boolean;
}

interface ResolvedPerms {
  permissions: string[];
  roleName: string | null;
  isOwner: boolean;
  /** True when the backend answered (even with zero perms) — safe to enforce AND cache. False on total failure. */
  definitive: boolean;
}

function readCache(companyId: string, allowStale = false): CachedPerms | null {
  try {
    const raw = localStorage.getItem(permsKey(companyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPerms;
    if (!parsed || typeof parsed.ts !== 'number' || !Array.isArray(parsed.permissions)) return null;
    if (!allowStale && Date.now() - parsed.ts > PERMS_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Sync read for non-React callers (e.g. the axios firewall). */
export function readPermissionsCache(companyId: string, allowStale = true): CachedPerms | null {
  if (typeof window === 'undefined') return null;
  return readCache(companyId, allowStale);
}

function writeCache(companyId: string, entry: Omit<CachedPerms, 'ts'>) {
  try {
    localStorage.setItem(permsKey(companyId), JSON.stringify({ ...entry, ts: Date.now() }));
  } catch {
    /* ignore */
  }
}

export interface CompanyPermissions {
  isOwner: boolean;
  loading: boolean;
  permissions: Set<string>;
  roleName: string | null;
  can: (...perms: string[]) => boolean;
  canAny: (perms: string[]) => boolean;
}

/**
 * Resolves the current user's permission set inside a company — owners
 * bypass everything. Reads an hourly localStorage cache first (no flicker,
 * no repeated requests); refreshes silently in the background when stale.
 * Backend 403s remain the real enforcer, so a mid-hour role change can only
 * ever hide/show buttons, never grant access.
 */
export function useCompanyPermissions(companyId?: string | null): CompanyPermissions {
  const storeRole = useAppSelector((s) => s.auth.role);
  const userId = useAppSelector((s) => s.auth.userId);
  const backendRole = useAppSelector(
    (s) => (s.user.currentUser as { role?: string } | null)?.role || '',
  );
  const userEmail = useAppSelector((s) => s.user.currentUser?.email || '');

  const [snapshot, setSnapshot] = useState<CachedPerms | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwner =
    storeRole === 'company' && !/instructor/i.test(backendRole);

  useEffect(() => {
    if (!companyId || isOwner) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    // Instant: serve the hourly cache so the UI renders correctly
    // on the first paint with zero requests.
    const cached = typeof window !== 'undefined' ? readCache(companyId) : null;
    if (cached) {
      setSnapshot(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const resolved = await resolvePermissions(companyId, userId, userEmail);
      if (cancelled) return;
      if (resolved?.definitive) {
        // Backend answered — enforce exactly this (even if empty) and cache it.
        const entry = {
          permissions: resolved.permissions,
          roleName: resolved.roleName,
          isOwner: resolved.isOwner,
        };
        setSnapshot({ ...entry, ts: Date.now() });
        writeCache(companyId, entry);
      } else {
        // Total failure (endpoint down, no match): fail OPEN so allowed
        // things never hide because of our bug — backend 403s stay the
        // enforcer. Never cache failures, so refresh always retries.
        setFailed(true);
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.warn('[permissions] resolution failed, UI fail-open', companyId);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId, isOwner, userId, userEmail]);

  const permissions = snapshot ? new Set(snapshot.permissions) : new Set<string>();
  const roleName = snapshot?.roleName ?? null;

  const can = useCallback(
    (...perms: string[]) => {
      // Fail open while unknown (loading or total failure) — never hide
      // allowed things because of a resolution bug. Definitive answers
      // (including genuinely-empty sets) are enforced exactly.
      if (isOwner || loading || failed) return true;
      return perms.every((p) => permissions.has(p));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOwner, loading, failed, snapshot],
  );

  const canAny = useCallback(
    (perms: string[]) => {
      if (isOwner || loading || failed) return true;
      return perms.some((p) => permissions.has(p));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOwner, loading, snapshot],
  );

  return { isOwner, loading, permissions, roleName, can, canAny };
}

/**
 * Warms the hourly cache right after login/hydrate (fire-and-forget) so the
 * first admin screen already renders from known permissions with zero
 * requests. Never awaited, never blocks routing; failures stay silent.
 */
export function warmPermissionsCache(companyId: string, userId: string | null, email: string): void {
  if (typeof window === 'undefined' || !companyId) return;
  if (readCache(companyId)) return;
  resolvePermissions(companyId, userId, email).then((resolved) => {
    if (resolved?.definitive) writeCache(companyId, resolved);
  }).catch(() => {});
}

async function resolvePermissions(
  companyId: string,
  userId: string | null,
  userEmail: string,
): Promise<ResolvedPerms | null> {
  try {
    // Authoritative: one call, exact effective set for this company.
    const access = await permissionService.getMyAccess(companyId);
    if (access) {
      return {
        permissions: access.isOwner
          ? access.effectivePermissions
          : (access.effectivePermissions ?? access.role?.permissions ?? []),
        roleName: access.role?.name ?? null,
        isOwner: access.isOwner,
        definitive: true,
      };
    }
    // /me answered but this company is absent → genuinely no access here.
    return { permissions: [], roleName: null, isOwner: false, definitive: true };
  } catch {
    /* fall through to the legacy resolution */
  }
  try {
    const [members, roles] = await Promise.all([
      staffService.listStaff(companyId, 'active').catch(() => []),
      roleService.listRoles(companyId).catch(() => []),
    ]);
    const me =
      members.find((m) => m._id === userId) ??
      members.find((m) => m.email?.toLowerCase() === userEmail.toLowerCase());
    // Legacy match only counts when we found the person AND their role.
    const role = me
      ? roles.find((r) => r.name === me.roleName || r._id === me.roleId)
      : undefined;
    if (me && role) {
      return {
        permissions: role.permissions ?? [],
        roleName: role.name,
        isOwner: false,
        definitive: true,
      };
    }
    return null;
  } catch {
    return null;
  }
}
