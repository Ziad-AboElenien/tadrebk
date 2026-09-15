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
  file?: File;
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
  data: Project | { project?: Project };
  project?: Project;
  msg?: string;
}

function normalizeProject(raw?: Project | { project?: Project }): Project {
  if (!raw) throw new Error('Project not found');
  return '_id' in raw ? (raw as Project) : ((raw as { project?: Project }).project ?? ({} as Project));
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
    return normalizeProject((data?.data as Project | { project?: Project } | undefined) ?? data);
  },

  async createProject(companyId: string, payload: CreateProjectPayload): Promise<Project> {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.description) form.append('description', payload.description);
    if (payload.programId) form.append('programId', payload.programId);
    if (payload.startDate) form.append('startDate', payload.startDate);
    if (payload.endDate) form.append('endDate', payload.endDate);
    if (payload.color) form.append('color', payload.color);
    if (payload.file) form.append('file', payload.file);
    const { data } = await api.post<ProjectResponse>(`/company/${companyId}/projects`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const raw = (data?.data ?? data) as Project | { project?: Project } | undefined;
    return ((raw && 'project' in raw ? raw.project : raw) as Project) ?? ({} as Project);
  },

  async updateProject(
    companyId: string,
    projectId: string,
    payload: UpdateProjectPayload,
  ): Promise<Project> {
    const { data } = await api.patch<ProjectResponse>(`/company/${companyId}/projects/${projectId}`, payload);
    return normalizeProject((data?.data as Project | { project?: Project } | undefined) ?? data);
  },

  async archiveProject(companyId: string, projectId: string): Promise<Project> {
    const { data } = await api.delete<ProjectResponse>(`/company/${companyId}/projects/${projectId}`);
    return normalizeProject((data?.data as Project | { project?: Project } | undefined) ?? data);
  },

  async assignInterns(companyId: string, projectId: string, internIds: string[]): Promise<void> {
    await api.post(`/company/${companyId}/projects/${projectId}/interns`, { internIds });
  },

  async uploadAttachment(
    companyId: string,
    projectId: string,
    file: File,
  ): Promise<Project> {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.put<ProjectResponse>(
      `/company/${companyId}/projects/${projectId}/attachment`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return normalizeProject((data?.data as Project | { project?: Project } | undefined) ?? data);
  },
};
