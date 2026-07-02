import api from '@/lib/axios';
import { Company } from '@/features/company/types';

interface CompanyListResponse {
  data: {
    companies: Company[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  msg: string;
}

export const adminService = {
  async getPendingCompanies(page = 1, limit = 20): Promise<{
    companies: Company[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<CompanyListResponse>('/company/admin/pending', {
      params: { page, limit },
    });
    return {
      companies: data.data.companies,
      pagination: data.data.pagination,
    };
  },

  async getAllCompanies(page = 1, limit = 20, approvedByAdmin?: boolean): Promise<{
    companies: Company[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const params: Record<string, any> = { page, limit };
    if (approvedByAdmin !== undefined) params.approvedByAdmin = String(approvedByAdmin);
    const { data } = await api.get<CompanyListResponse>('/company/', { params });
    // Public endpoint omits approvedByAdmin/bannedAt; patch them based on filter
    const companies = data.data.companies.map((c) => ({
      ...c,
      approvedByAdmin: approvedByAdmin ?? c.approvedByAdmin,
    })) as Company[];
    return {
      companies,
      pagination: data.data.pagination,
    };
  },

  async approveCompany(companyId: string): Promise<void> {
    await api.patch(`/company/admin/${companyId}/approve`);
  },

  async banCompany(companyId: string): Promise<void> {
    await api.patch(`/company/admin/${companyId}/ban`);
  },

  async unbanCompany(companyId: string): Promise<void> {
    await api.patch(`/company/admin/${companyId}/unban`);
  },
};
