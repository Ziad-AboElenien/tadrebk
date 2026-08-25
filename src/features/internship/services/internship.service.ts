import api from '@/lib/axios';
import { Internship, InternshipQuestion } from '@/features/internship/types';

// Matches the backend POST /company/{companyId}/internships body schema
export interface RequiredEducationEntry {
  institution: string;
  degree?: string;
  field?: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
}

interface CreateInternshipPayload {
  title: string;
  description: string;
  location: 'on-site' | 'remote' | 'hybrid';
  workingTime: 'full-time' | 'part-time';
  softSkills: string[];
  technicalSkills: string[];
  questions?: InternshipQuestion[];
  preKnowledge?: string[];
  track?: string[];
  requiredEducation?: RequiredEducationEntry[];
}

interface UpdateInternshipPayload extends Partial<CreateInternshipPayload> {
  closed?: boolean;
}

interface ListInternshipsParams {
  type?: 'full-time' | 'part-time';
  location?: string;
  companyId?: string;
  title?: string;
  closed?: boolean;
  page?: number;
  limit?: number;
}

interface InternshipListResponse {
  data: {
    internships: Internship[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  msg: string;
}

interface InternshipResponse {
  data: {
    internship: Internship;
  };
  msg: string;
}

export const internshipService = {
  async listInternships(params?: ListInternshipsParams): Promise<{
    internships: Internship[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    const { data } = await api.get<InternshipListResponse>('/internships', { params });
    return {
      internships: data.data.internships,
      pagination: data.data.pagination,
    };
  },

  async getInternshipById(internId: string): Promise<Internship> {
    const { data } = await api.get<InternshipResponse>(`/internships/${internId}`);
    return data.data.internship;
  },

  async createInternship(
    companyId: string,
    payload: CreateInternshipPayload
  ): Promise<Internship> {
    const { data } = await api.post<InternshipResponse>(
      `/company/${companyId}/internships`,
      payload
    );
    return data.data.internship;
  },

  async updateInternship(
    companyId: string,
    internId: string,
    payload: UpdateInternshipPayload
  ): Promise<Internship> {
    const { data } = await api.put<InternshipResponse>(
      `/company/${companyId}/internships/${internId}`,
      payload
    );
    return data.data.internship;
  },

  async deleteInternship(companyId: string, internId: string): Promise<void> {
    await api.delete(`/company/${companyId}/internships/${internId}`);
  },

  async closeInternship(companyId: string, internId: string): Promise<Internship> {
    const { data } = await api.patch<InternshipResponse>(
      `/company/${companyId}/internships/${internId}/close`
    );
    return data.data.internship;
  },

  async reopenInternship(companyId: string, internId: string): Promise<Internship> {
    const { data } = await api.patch<InternshipResponse>(
      `/company/${companyId}/internships/${internId}/reopen`
    );
    return data.data.internship;
  },
};
