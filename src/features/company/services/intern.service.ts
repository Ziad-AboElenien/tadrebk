import api from '@/lib/axios';
import { Intern, InternStatus, InternSort, ListResponse, Pagination } from '@/features/company/types/management';

interface InternListResponse {
  data: Intern[];
  pagination: Pagination;
  msg: string;
}

interface InternResponse {
  data: Intern;
  msg: string;
}

export const internService = {
  async listInterns(
    companyId: string,
    params?: {
      programId?: string;
      projectId?: string;
      status?: InternStatus;
      search?: string;
      sort?: InternSort;
      page?: number;
      limit?: number;
    },
  ): Promise<ListResponse<Intern>> {
    const { data } = await api.get<InternListResponse>(`/company/${companyId}/interns`, { params });
    return { data: data.data, pagination: data.pagination };
  },

  async getIntern(companyId: string, internId: string): Promise<Intern> {
    const { data } = await api.get<InternResponse>(`/company/${companyId}/interns/${internId}`);
    return data.data;
  },
};
