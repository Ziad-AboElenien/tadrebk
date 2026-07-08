import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/features/notifications/types';

interface NotificationState {
  list: Notification[];
  unreadCount: number;
  page: number;
  totalPages: number;
  loading: boolean;
}

const initialState: NotificationState = {
  list: [],
  unreadCount: 0,
  page: 1,
  totalPages: 1,
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<{ notifications: Notification[]; page: number; pages: number }>) {
      state.list = action.payload.notifications;
      state.page = action.payload.page;
      state.totalPages = action.payload.pages;
      state.loading = false;
    },
    appendNotifications(state, action: PayloadAction<{ notifications: Notification[]; page: number; pages: number }>) {
      state.list = [...state.list, ...action.payload.notifications];
      state.page = action.payload.page;
      state.totalPages = action.payload.pages;
      state.loading = false;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    decrementUnreadCount(state) {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.list.find((x) => x._id === action.payload);
      if (n) n.read = true;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
      state.page = 1;
      state.totalPages = 1;
      state.loading = false;
    },
  },
});

export const {
  setNotifications,
  appendNotifications,
  setUnreadCount,
  decrementUnreadCount,
  clearUnreadCount,
  markAsRead,
  setLoading,
  clearNotifications,
} = notificationSlice.actions;
export default notificationSlice.reducer;
