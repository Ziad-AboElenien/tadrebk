import api from '@/lib/axios';

export interface PermissionEntry {
  key: string;
  label: string;
  group: string;
}

interface PermissionsEnvelope {
  data: { permissions: PermissionEntry[] };
  msg: string;
}

export interface MyCompanyAccess {
  companyId: string;
  companyName: string;
  isOwner: boolean;
  role: {
    _id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    isOwnerRole: boolean;
    permissions: string[];
  } | null;
  effectivePermissions: string[];
}

interface MyPermissionsEnvelope {
  data: {
    userId: string;
    role: string;
    companies: MyCompanyAccess[];
  };
  msg: string;
}

export const permissionService = {
  async listPermissions(): Promise<PermissionEntry[]> {
    const { data } = await api.get<PermissionsEnvelope>('/permissions');
    return data.data.permissions ?? [];
  },

  async getMyPermissions(): Promise<MyPermissionsEnvelope['data']> {
    const { data } = await api.get<MyPermissionsEnvelope>('/me/permissions');
    return data.data;
  },

  /** Access entry for one company (or null when the account has none there). */
  async getMyAccess(companyId: string): Promise<MyCompanyAccess | null> {
    const mine = await permissionService.getMyPermissions();
    return mine.companies.find((c) => c.companyId === companyId) ?? null;
  },
};

export interface ConfirmInvitePayload {
  inviteId: string;
  token: string;
}

export interface AcceptInvitePayload {
  inviteId: string;
  token: string;
  newPassword: string;
  firstName?: string;
  lastName?: string;
}

export const instructorAuthService = {
  async confirmInvite(payload: ConfirmInvitePayload): Promise<void> {
    await api.post('/instructor-auth/confirm-invite', payload);
  },

  async acceptInvite(payload: AcceptInvitePayload): Promise<void> {
    await api.post('/instructor-auth/accept-invite', payload);
  },
};
