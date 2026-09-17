import api from '@/lib/axios';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskTarget,
  TaskBroadcastResult,
  Pagination,
} from '@/features/company/types/management';

export interface CreateTaskFields {
  title: string;
  description?: string;
  target: TaskTarget;
  internId?: string;
  programId?: string;
  projectId?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  target: TaskTarget;
  internId?: string;
  programId?: string;
  projectId?: string;
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

export interface UpdateTaskGroupPayload {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string;
}

interface TaskListEnvelope {
  data?:
    | { tasks?: Task[]; pagination?: Pagination }
    | { tasks?: Task[]; count?: number; groupId?: string; target?: TaskTarget; members?: number }
    | Task[];
  tasks?: Task[];
  count?: number;
  groupId?: string;
  target?: TaskTarget;
  members?: number;
  pagination?: Pagination;
  msg?: string;
}

export interface BroadcastMember {
  internId: string;
  status: TaskStatus;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  pointsAwarded?: number;
  intern?: { firstName: string; lastName: string; email: string; profilePicture?: string };
}

export interface BroadcastCard {
  taskGroupId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  projectId?: string | null;
  programId?: string | null;
  totalMembers: number;
  byStatus?: Partial<Record<TaskStatus, number>>;
  members: BroadcastMember[];
}

interface TaskResponse {
  data: Task | TaskBroadcastResult;
  msg: string;
}

interface BroadcastListEnvelope {
  data?: { broadcasts?: BroadcastCard[]; pagination?: Pagination };
  broadcasts?: BroadcastCard[];
  pagination?: Pagination;
  msg?: string;
}

function normalizeTaskBroadcast(raw?: Task | TaskBroadcastResult | null): TaskBroadcastResult {
  if (!raw) return {};
  if ('_id' in raw || 'status' in raw) return { task: raw as Task };
  return raw as TaskBroadcastResult;
}

function normalizeTask(raw?: Task | TaskBroadcastResult | null): Task | undefined {
  if (!raw) return undefined;
  if ('_id' in raw) return raw as Task;
  return (raw as TaskBroadcastResult).task;
}

export const taskService = {
  async listTasks(
    companyId: string,
    params?: {
      taskGroupId?: string;
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
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async createTask(
    companyId: string,
    fields: CreateTaskFields,
    files: File[] = [],
  ): Promise<TaskBroadcastResult> {
    const payload: CreateTaskPayload = {
      title: fields.title,
      description: fields.description,
      target: fields.target,
      dueDate: fields.dueDate,
      priority: fields.priority,
      tags: fields.tags,
    };
    if (fields.internId) payload.internId = fields.internId;
    if (fields.programId) payload.programId = fields.programId;
    if (fields.projectId) payload.projectId = fields.projectId;

    if (files.length === 0) {
      const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks`, payload);
      return normalizeTaskBroadcast(data?.data);
    }

    const form = new FormData();
    form.append('body', JSON.stringify(payload));
    files.forEach((file) => form.append('files', file));
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeTaskBroadcast(data?.data);
  },

  async updateTask(companyId: string, taskId: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<TaskResponse>(`/company/${companyId}/tasks/${taskId}`, payload);
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async archiveTask(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.delete<TaskResponse>(`/company/${companyId}/tasks/${taskId}`);
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async transitionTask(
    companyId: string,
    taskId: string,
    payload: { to: TaskStatus; reviewerFeedback?: string; pointsAwarded?: number },
  ): Promise<Task> {
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks/${taskId}/transition`, payload);
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async saveFeedback(companyId: string, taskId: string, reviewerFeedback: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(`/company/${companyId}/tasks/${taskId}/feedback`, {
      reviewerFeedback,
    });
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async addAttachments(companyId: string, taskId: string, files: File[]): Promise<Task> {
    const form = new FormData();
    files.forEach((file) => form.append('files', file));
    const { data } = await api.post<TaskResponse>(
      `/company/${companyId}/tasks/${taskId}/attachments`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async removeAttachment(
    companyId: string,
    taskId: string,
    attachmentId: string,
  ): Promise<Task> {
    const { data } = await api.delete<TaskResponse>(
      `/company/${companyId}/tasks/${taskId}/attachments/${attachmentId}`,
    );
    return normalizeTask(data?.data) ?? ({} as Task);
  },

  async listBroadcasts(
    companyId: string,
    params?: {
      memberId?: string;
      projectId?: string;
      programId?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      search?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ broadcasts: BroadcastCard[]; pagination: Pagination }> {
    const { data } = await api.get<BroadcastListEnvelope>(
      `/company/${companyId}/tasks/broadcasts`,
      { params },
    );
    const nested = data?.data;
    const broadcasts = nested?.broadcasts ?? data?.broadcasts ?? [];
    const pagination = nested?.pagination ?? data?.pagination;
    return {
      broadcasts,
      pagination: pagination
        ? { ...pagination, total: pagination.total ?? broadcasts.length }
        : { page: 1, limit: broadcasts.length, pages: 1, total: broadcasts.length },
    };
  },

  async listByGroup(
    companyId: string,
    groupId: string,
  ): Promise<{ tasks: Task[]; count?: number; groupId?: string; target?: TaskTarget; members?: number }> {
    const { data } = await api.get<TaskListEnvelope>(`/company/${companyId}/tasks/group/${groupId}`);
    const raw = (data?.data as { tasks?: Task[]; count?: number; groupId?: string; target?: TaskTarget; members?: number } | undefined);
    return { tasks: raw?.tasks ?? data?.tasks ?? [], count: raw?.count ?? data?.count, groupId: raw?.groupId ?? data?.groupId, target: raw?.target ?? data?.target, members: raw?.members ?? data?.members };
  },

  async bulkUpdateByGroup(
    companyId: string,
    groupId: string,
    payload: UpdateTaskGroupPayload,
  ): Promise<{ groupId?: string; matched?: number; modified?: number }> {
    const { data } = await api.patch<{ data: { groupId?: string; matched?: number; modified?: number }; msg?: string }>(
      `/company/${companyId}/tasks/group/${groupId}`,
      payload,
    );
    return data.data ?? {};
  },
};
