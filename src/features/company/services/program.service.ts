import api from '@/lib/axios';
import { Program, ListResponse, Pagination } from '@/features/company/types/management';

export interface CreateProgramPayload {
  name: string;
  startDate: string;
  description?: string;
  endDate?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'archived';
  maxInterns?: number;
  coverImage?: { public_id: string; secure_url: string };
}

export interface UpdateProgramPayload {
  name?: string;
  description?: string;
  status?: 'upcoming' | 'active' | 'completed' | 'archived';
  startDate?: string;
  endDate?: string;
  maxInterns?: number;
  coverImage?: { public_id: string; secure_url: string };
}

interface ProgramListEnvelope {
  data?: Program[] | { programs?: Program[]; pagination?: Pagination };
  programs?: Program[];
  pagination?: Pagination;
  msg?: string;
}

interface ProgramResponse {
  data: Program | { program?: Program } | undefined;
  program?: Program;
  msg?: string;
}

function normalizeProgram(raw?: Program | { program?: Program }): Program {
  if (!raw) throw new Error('Program not found');
  return '_id' in raw ? (raw as Program) : ((raw as { program?: Program }).program ?? ({} as Program));
}

interface ProgramDetailEnvelope {
  data: Program | { program?: Program } | undefined;
  program?: Program;
  msg?: string;
}

export const programService = {
  async listPrograms(
    companyId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<ListResponse<Program>> {
    const { data } = await api.get<ProgramListEnvelope>(
      `/company/${companyId}/programs`,
      { params },
    );

    const nested = Array.isArray(data?.data)
      ? { programs: data.data as Program[], pagination: data.pagination }
      : (data?.data as { programs?: Program[]; pagination?: Pagination } | undefined);
    const programs = nested?.programs ?? data?.programs ?? [];
    const pagination = nested?.pagination ?? data?.pagination;

    return {
      data: programs,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? programs.length }
        : { page: 1, limit: programs.length, pages: 1, total: programs.length },
    };
  },

  async getProgram(companyId: string, programId: string): Promise<Program> {
    const { data } = await api.get<ProgramDetailEnvelope>(`/company/${companyId}/programs/${programId}`);

    const unwrapped = (data?.data as Program | { program?: Program } | undefined) ?? data;
    return normalizeProgram(unwrapped as Program | { program?: Program });
  },

  async createProgram(companyId: string, payload: CreateProgramPayload): Promise<Program> {
    const { data } = await api.post<ProgramResponse>(`/company/${companyId}/programs`, payload);
    return normalizeProgram((data?.data as Program | { program?: Program } | undefined) ?? data);
  },

  async updateProgram(
    companyId: string,
    programId: string,
    payload: UpdateProgramPayload,
  ): Promise<Program> {
    const { data } = await api.patch<ProgramResponse>(`/company/${companyId}/programs/${programId}`, payload);
    return normalizeProgram((data?.data as Program | { program?: Program } | undefined) ?? data);
  },

  async archiveProgram(companyId: string, programId: string): Promise<Program> {
    const { data } = await api.delete<ProgramResponse>(`/company/${companyId}/programs/${programId}`);
    return normalizeProgram((data?.data as Program | { program?: Program } | undefined) ?? data);
  },

  async enrollInterns(companyId: string, programId: string, internIds: string[]): Promise<void> {
    await api.post(`/company/${companyId}/programs/${programId}/interns`, { internIds });
  },

  async unenrollIntern(companyId: string, programId: string, internId: string): Promise<void> {
    await api.delete(`/company/${companyId}/programs/${programId}/interns/${internId}`);
  },
};
