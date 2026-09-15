import api from '@/lib/axios';
import {
  Task,
  TaskStatus,
  Pagination,
} from '@/features/company/types/management';

interface MyTasksEnvelope {
  data: {
    tasks: Task[];
    pagination: Pagination;
  };
  msg: string;
}

interface TaskResponse {
  data: Task;
  msg: string;
}

export const internTaskService = {
  async listMyTasks(
    companyId: string,
    params?: {
      status?: TaskStatus;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ tasks: Task[]; pagination: Pagination }> {
    const { data } = await api.get<MyTasksEnvelope>(`/intern/me/${companyId}/tasks`, { params });
    return { tasks: data.data.tasks, pagination: data.data.pagination };
  },

  async getMyTask(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.get<TaskResponse>(
      `/intern/me/${companyId}/tasks/${taskId}`,
    );
    return data.data;
  },

  async startTask(companyId: string, taskId: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(
      `/intern/me/${companyId}/tasks/${taskId}/start`,
    );
    return data.data;
  },

  async submitTask(companyId: string, taskId: string, note?: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(
      `/intern/me/${companyId}/tasks/${taskId}/submit`,
      note ? { note } : undefined,
    );
    return data.data;
  },
};

export const INTERN_TASK_TRANSITIONS: Partial<Record<TaskStatus, TaskStatus | undefined>> = {
  todo: 'in_progress',
  in_progress: 'in_review',
};