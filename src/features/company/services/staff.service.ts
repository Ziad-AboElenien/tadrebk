import api from '@/lib/axios';

export type StaffStatus = 'active' | 'removed' | 'all';

export interface StaffMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: { secure_url?: string } | string | null;
  roleName?: string;
  roleId?: string;
  status?: string;
  joinedAt?: string;
}

export interface StaffInvite {
  _id: string;
  email: string;
  status: string;
  expiresAt?: string;
  role?: { _id: string; name: string };
}

interface StaffEnvelope {
  data: { members?: StaffMember[]; staff?: StaffMember[]; invites?: StaffInvite[] };
  msg: string;
}

interface InviteEnvelope {
  data: { invite: StaffInvite };
  msg: string;
}

export interface InviteStaffPayload {
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  note?: string;
}

export const staffService = {
  async listStaff(companyId: string, status: StaffStatus = 'active'): Promise<StaffMember[]> {
    const { data } = await api.get<StaffEnvelope>(`/company/${companyId}/instructors`, {
      params: { status },
    });
    return data.data.members ?? data.data.staff ?? [];
  },

  async inviteStaff(companyId: string, payload: InviteStaffPayload): Promise<StaffInvite> {
    const { data } = await api.post<InviteEnvelope>(`/company/${companyId}/instructors`, payload);
    return data.data.invite;
  },

  async renameStaff(companyId: string, userId: string, payload: { firstName?: string; lastName?: string }): Promise<void> {
    await api.patch(`/company/${companyId}/instructors/${userId}`, payload);
  },

  async removeStaff(companyId: string, userId: string): Promise<void> {
    await api.delete(`/company/${companyId}/instructors/${userId}`);
  },

  async resendInvite(companyId: string, userId: string): Promise<void> {
    await api.post(`/company/${companyId}/instructors/${userId}/resend-invite`);
  },
};
