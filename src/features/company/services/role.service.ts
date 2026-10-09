import api from '@/lib/axios';

export interface CompanyRole {
  _id: string;
  companyId?: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isOwnerRole: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissions?: string[];
}

interface RolesEnvelope {
  data: { roles: CompanyRole[] };
  msg: string;
}

interface RoleEnvelope {
  data: { role: CompanyRole };
  msg: string;
}

export const roleService = {
  async listRoles(companyId: string, includeSystem = true): Promise<CompanyRole[]> {
    const { data } = await api.get<RolesEnvelope>(`/company/${companyId}/roles`, {
      params: { includeSystem },
    });
    return data.data.roles ?? [];
  },

  async createRole(companyId: string, payload: CreateRolePayload): Promise<CompanyRole> {
    const { data } = await api.post<RoleEnvelope>(`/company/${companyId}/roles`, payload);
    return data.data.role;
  },

  async updateRole(companyId: string, roleId: string, payload: UpdateRolePayload): Promise<CompanyRole> {
    const { data } = await api.patch<RoleEnvelope>(`/company/${companyId}/roles/${roleId}`, payload);
    return data.data.role;
  },

  async deleteRole(companyId: string, roleId: string): Promise<void> {
    await api.delete(`/company/${companyId}/roles/${roleId}`);
  },
};
