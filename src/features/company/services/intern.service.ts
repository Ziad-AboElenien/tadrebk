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

  async listAllInterns(
    companyId: string,
    params?: {
      programId?: string;
      projectId?: string;
      status?: InternStatus;
      search?: string;
      sort?: InternSort;
    },
  ): Promise<Intern[]> {
    // Backend caps limit at 100 — walk pages to get the full roster.
    const all: Intern[] = [];
    let page = 1;
    for (;;) {
      const res = await internService.listInterns(companyId, { ...params, page, limit: 100 });
      all.push(...res.data);
      if (page >= (res.pagination.pages || 1)) break;
      page += 1;
    }
    return all;
  },

  async getIntern(companyId: string, internId: string): Promise<Intern> {
    const { data } = await api.get<InternRawResponse>(`/company/${companyId}/interns/${internId}`);
    const d = data?.data as unknown;
    if (Array.isArray(d)) {
      if (d[0]) return d[0] as Intern;
    } else if (d && typeof d === 'object') {
      if ('_id' in d) return d as Intern;
      const nested = (d as { intern?: Intern; user?: Intern }).intern ?? (d as { user?: Intern }).user;
      if (nested) return nested;
    }
    const flat = data?.interns?.[0];
    if (flat) return flat;
    throw new Error('Intern not found');
  },
};
