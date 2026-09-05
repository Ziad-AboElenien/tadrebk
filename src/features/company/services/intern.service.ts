import api from '@/lib/axios';
import { Intern, InternStatus, InternSort, ListResponse, Pagination } from '@/features/company/types/management';

interface InternListEnvelope {
  data?: Intern[] | { interns?: Intern[]; pagination?: Pagination };
  interns?: Intern[];
  pagination?: Pagination;
  msg?: string;
}

interface InternRawResponse {
  data?: Intern | Intern[] | { interns?: Intern[]; pagination?: Pagination };
  interns?: Intern[];
  pagination?: Pagination;
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
    const { data } = await api.get<InternListEnvelope>(
      `/company/${companyId}/interns`,
      { params },
    );

    // API may either wrap the array in `data` (`{ data: [...] }`), nest it
    // with its own pagination (`{ data: { interns, pagination } }`), or return
    // it flat (`{ interns, pagination }`) — normalize all three shapes.
    const nested = Array.isArray(data?.data)
      ? { interns: data.data as Intern[], pagination: data.pagination }
      : (data?.data as { interns?: Intern[]; pagination?: Pagination } | undefined);
    const list = nested?.interns ?? data?.interns ?? [];
    const pagination = nested?.pagination ?? data?.pagination;

    return {
      data: list,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? list.length }
        : { page: 1, limit: list.length, pages: 1, total: list.length },
    };
  },

  async getIntern(companyId: string, internId: string): Promise<Intern> {
    const { data } = await api.get<InternRawResponse>(`/company/${companyId}/interns/${internId}`);
    if (Array.isArray(data?.data)) return (data.data as Intern[])[0];
    return (data?.data as Intern) ?? data?.interns?.[0];
  },
};
