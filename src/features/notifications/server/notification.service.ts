import api from '@/lib/axios';
import type { Notification, NotificationsResponse, UnreadCountResponse } from '@/features/notifications/types';

interface ListParams {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

const UNREAD_TTL_MS = 30000;
let unreadCache: { count: number; at: number } | null = null;

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
    if (unreadCache && Date.now() - unreadCache.at < UNREAD_TTL_MS) {
      return unreadCache.count;
    }
    const { data } = await api.get<UnreadCountResponse>('/notifications/unread-count');
    unreadCache = { count: data.data.count, at: Date.now() };
    return data.data.count;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all');
    unreadCache = { count: 0, at: Date.now() };
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
    unreadCache = null;
  },
};
