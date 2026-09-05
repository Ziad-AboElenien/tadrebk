import api from '@/lib/axios';
import {
  Task,
  TaskStatus,
  ListResponse,
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
    params?: {
      status?: TaskStatus;
      sort?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ tasks: Task[]; pagination: Pagination }> {
    const { data } = await api.get<MyTasksEnvelope>('/intern/me/tasks', { params });
    return { tasks: data.data.tasks, pagination: data.data.pagination };
  },

  async getMyTask(taskId: string): Promise<Task> {
    const { data } = await api.get<TaskResponse>(`/intern/me/tasks/${taskId}`);
    return data.data;
  },

  async startTask(taskId: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(`/intern/me/tasks/${taskId}/start`);
    return data.data;
  },

  async submitTask(taskId: string, note?: string): Promise<Task> {
    const { data } = await api.post<TaskResponse>(
      `/intern/me/tasks/${taskId}/submit`,
      note ? { note } : undefined,
    );
    return data.data;
  },
};
