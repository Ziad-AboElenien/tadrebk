import api from '@/lib/axios';
import type { Notification, NotificationsResponse, UnreadCountResponse } from '@/features/notifications/types';

interface ListParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export const notificationService = {
  async list(params?: ListParams): Promise<{ notifications: Notification[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
    const queryParams: Record<string, string> = {};
    if (params?.unreadOnly !== undefined) queryParams.unreadOnly = params.unreadOnly ? 'true' : 'false';
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    const { data } = await api.get<NotificationsResponse>('/notifications', { params: queryParams });
    return data.data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return data.data.count;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};
