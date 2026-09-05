import api from '@/lib/axios';
import { Project, ListResponse, Pagination } from '@/features/company/types/management';

export interface CreateProjectPayload {
  name: string;
  description?: string;
  programId?: string;
  internIds?: string[];
  startDate?: string;
  endDate?: string;
  color?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  programId?: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  status?: 'active' | 'completed' | 'archived';
}

interface ProjectListEnvelope {
  data?: Project[] | { projects?: Project[]; pagination?: Pagination };
  projects?: Project[];
  pagination?: Pagination;
  msg?: string;
}

interface ProjectResponse {
  data: Project;
  msg: string;
}

export const projectService = {
  async listProjects(
    companyId: string,
    params?: {
      status?: string;
      programId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<ListResponse<Project>> {
    const { data } = await api.get<ProjectListEnvelope>(
      `/company/${companyId}/projects`,
      { params },
    );

    const nested = Array.isArray(data?.data)
      ? { projects: data.data as Project[], pagination: data.pagination }
      : (data?.data as { projects?: Project[]; pagination?: Pagination } | undefined);
    const projects = nested?.projects ?? data?.projects ?? [];
    const pagination = nested?.pagination ?? data?.pagination;

    return {
      data: projects,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? projects.length }
        : { page: 1, limit: projects.length, pages: 1, total: projects.length },
    };
  },

  async getProject(companyId: string, projectId: string): Promise<Project> {
    const { data } = await api.get<ProjectResponse>(`/company/${companyId}/projects/${projectId}`);
    return data.data;
  },

  async createProject(companyId: string, payload: CreateProjectPayload): Promise<Project> {
    const { data } = await api.post<ProjectResponse>(`/company/${companyId}/projects`, payload);
    return data.data;
  },

  async updateProject(
    companyId: string,
    projectId: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> {
    const { data } = await api.patch<ProjectResponse>(`/company/${companyId}/projects/${projectId}`, payload);
    return data.data;
  },

  async archiveProject(companyId: string, projectId: string): Promise<Project> {
    const { data } = await api.delete<ProjectResponse>(`/company/${companyId}/projects/${projectId}`);
    return data.data;
  },

  async assignInterns(companyId: string, projectId: string, internIds: string[]): Promise<void> {
    await api.post(`/company/${companyId}/projects/${projectId}/interns`, { internIds });
  },
};
