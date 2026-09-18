'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUnreadCount } from '@/store/notificationSlice';
import { notificationService } from '@/features/notifications/server/notification.service';
import { toastHelper } from '@/lib/toast';

let globalIntervalId: ReturnType<typeof setInterval> | null = null;
let globalInitialized = false;

export default function NotificationPoller() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isAuthRef = useRef(false);
  const lastCountRef = useRef(0);
  const mountedRef = useRef(false);
  // Skip the "new notification" toast on the first poll after login —
  // pre-existing unread mail is not "new" for this session.
  const firstPollRef = useRef(true);

  useEffect(() => {
    isAuthRef.current = isAuthenticated;
    if (!isAuthenticated) {
      lastCountRef.current = 0;
      firstPollRef.current = true;
    }
  }, [isAuthenticated]);

  const fetchCount = useCallback(async () => {
    if (!isAuthRef.current) return;
    try {
      const count = await notificationService.getUnreadCount();
      if (mountedRef.current && !firstPollRef.current && count > lastCountRef.current) {
        const diff = count - lastCountRef.current;
        toastHelper.info(
          `You have ${diff} unread notification${diff > 1 ? 's' : ''}`,
          { title: `New Notification${diff > 1 ? 's' : ''}`, duration: 5000 },
        );
      }
      firstPollRef.current = false;
      lastCountRef.current = count;
      dispatch(setUnreadCount(count));
    } catch { /* ignore */ }
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    if (globalInitialized) return;
    globalInitialized = true;

    fetchCount();
    globalIntervalId = setInterval(fetchCount, 30000);

    return () => {
      mountedRef.current = false;
      if (globalIntervalId) {
        clearInterval(globalIntervalId);
        globalIntervalId = null;
      }
      globalInitialized = false;
    };
  }, [fetchCount]);

  return null;
}
