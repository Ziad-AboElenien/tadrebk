import api from '@/lib/axios';
import {
  Task,
  TaskStatus,
  TaskPriority,
  Pagination,
} from '@/features/company/types/management';

export interface CreateTaskFields {
  title: string;
  description?: string;
  internId: string;
  projectId?: string;
  programId?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string;
  projectId?: string;
  programId?: string;
}

interface TaskListEnvelope {
  data?:
    | { tasks?: Task[]; pagination?: Pagination }
    | Task[];
  tasks?: Task[];
  pagination?: Pagination;
  msg?: string;
}

interface TaskResponse {
  data: Task;
  msg: string;
}

function toForm(fields: CreateTaskFields): FormData {
  const form = new FormData();
  (Object.keys(fields) as (keyof CreateTaskFields)[]).forEach((key) => {
    const value = fields[key];
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      form.append(key, JSON.stringify(value));
    } else if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  });
  return form;
}

export const taskService = {
  async listTasks(
    companyId: string,
    params?: {
      internId?: string;
      projectId?: string;
      programId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      tag?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ tasks: Task[]; pagination: Pagination }> {
    const { data } = await api.get<TaskListEnvelope>(`/company/${companyId}/tasks`, { params });

    // Accept `{ data: { tasks, pagination } }`, flat `{ tasks, pagination }`,
    // or `{ data: Task[] }` — normalize before returning.
    const nested = Array.isArray(data?.data)
      ? { tasks: data.data as Task[], pagination: data.pagination }
      : (data?.data as { tasks?: Task[]; pagination?: Pagination } | undefined);
    const tasks = nested?.tasks ?? data?.tasks ?? [];
    const pagination = nested?.pagination ?? data?.pagination;

    return {
      tasks,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? tasks.length }
        : { page: 1, limit: tasks.length, pages: 1, total: tasks.length },
    };
  },

  async getTask(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.get<TaskResponse>(`/company/${companyId}/tasks/${taskId}`);
    return data.data;
  },

  async createTask(
    companyId: string,
    fields: CreateTaskFields,
    files: File[] = [],
  ): Promise<Task> {
    const form = toForm(fields);
    files.forEach((file) => form.append('files', file));
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async updateTask(companyId: string, taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<TaskResponse>(`/company/${companyId}/tasks/${taskId}`, payload);
    return data.data;
  },

  async archiveTask(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.delete<TaskResponse>(`/company/${companyId}/tasks/${taskId}`);
    return data.data;
  },

  async transitionTask(
    companyId: string,
    taskId: string,
    payload: { to: TaskStatus; reviewerFeedback?: string; pointsAwarded?: number },
  ): Promise<Task> {
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks/${taskId}/transition`, payload);
    return data.data;
  },

  async saveFeedback(companyId: string, taskId: string, reviewerFeedback: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks/${taskId}/feedback`, {
      reviewerFeedback,
    });
    return data.data;
  },

  async addAttachments(companyId: string, taskId: string, files: File[]): Promise<Task> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const { data } = await api.post<TaskResponse>(
      `/company/${companyId}/tasks/${taskId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.data;
  },

  async removeAttachment(
    companyId: string,
    taskId: string,
    attachmentId: string,
  ): Promise<Task> {
    const { data } = await api.delete<TaskResponse>(
      `/company/${companyId}/tasks/${taskId}/attachments/${attachmentId}`,
    );
    return data.data;
  },
};
