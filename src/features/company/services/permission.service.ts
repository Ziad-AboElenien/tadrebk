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

export const permissionService = {
  async listPermissions(): Promise<PermissionEntry[]> {
    const { data } = await api.get<PermissionsEnvelope>('/permissions');
    return data.data.permissions ?? [];
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
