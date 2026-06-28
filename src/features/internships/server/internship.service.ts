import api from '@/lib/axios';
import type { InternshipsFilters, InternshipsListResponse, InternshipResponse } from '@/types/internship';

// ─── List internships (with filters) ─────────────────────────
export async function getInternships(
  filters: InternshipsFilters = {},
): Promise<InternshipsListResponse> {
  const params: Record<string, string | number | boolean> = {};

  if (filters.title) params.title = filters.title;
  if (filters.location) params.location = filters.location;
  if (filters.companyId) params.companyId = filters.companyId;
  if (filters.type) params.type = filters.type;          // API uses "type" for workingTime filter
  if (filters.closed !== undefined) params.closed = filters.closed;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await api.get<InternshipsListResponse>('/internships', { params });
  return res.data;
}

// ─── Get single internship ────────────────────────────────────
export async function getInternshipById(internId: string): Promise<InternshipResponse> {
  const res = await api.get<InternshipResponse>(`/internships/${internId}`);
  return res.data;
}

// ─── Create internship (company owner) ───────────────────────
export async function createInternship(
  companyId: string,
  data: {
    title: string;
    description: string;
    location: 'on-site' | 'remote' | 'hybrid';
    workingTime?: 'full-time' | 'part-time';
    softSkills?: string[];
    technicalSkills?: string[];
  },
): Promise<InternshipResponse> {
  const res = await api.post<InternshipResponse>(
    `/company/${companyId}/internships`,
    data,
  );
  return res.data;
}

// ─── Update internship ────────────────────────────────────────
export async function updateInternship(
  companyId: string,
  internId: string,
  data: Partial<{
    title: string;
    description: string;
    location: 'on-site' | 'remote' | 'hybrid';
    workingTime: 'full-time' | 'part-time';
    softSkills: string[];
    technicalSkills: string[];
    closed: boolean;
  }>,
): Promise<InternshipResponse> {
  const res = await api.put<InternshipResponse>(
    `/company/${companyId}/internships/${internId}`,
    data,
  );
  return res.data;
}

// ─── Delete internship ────────────────────────────────────────
export async function deleteInternship(
  companyId: string,
  internId: string,
): Promise<void> {
  await api.delete(`/company/${companyId}/internships/${internId}`);
}
