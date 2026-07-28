'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store/store';
import { setUnreadCount } from '@/store/notificationSlice';
import { notificationService } from '@/features/notifications/server/notification.service';
import { toast } from 'react-toastify';

let globalIntervalId: ReturnType<typeof setInterval> | null = null;
let globalInitialized = false;

export default function NotificationPoller() {
  const dispatch = useAppDispatch();
  const lastCountRef = useRef(0);
  const mountedRef = useRef(false);

  const fetchCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      if (mountedRef.current && count > lastCountRef.current) {
        const diff = count - lastCountRef.current;
        toast(
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <i className="fas fa-bell text-emerald-500 text-sm" />
            </div>
            <div>
              <p className="text-sm font-semibold text-dark">New Notification{diff > 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500">You have {diff} unread notification{diff > 1 ? 's' : ''}</p>
            </div>
          </div>,
          {
            icon: false,
            className: '!bg-white !border !border-gray-100 !rounded-2xl !shadow-xl !overflow-hidden',
            autoClose: 5000,
          }
        );
      }
      lastCountRef.current = count;
      dispatch(setUnreadCount(count));
    } catch { /* ignore */ }
  }, [dispatch]);

  useEffect(() => {
    if (globalInitialized) return;
    globalInitialized = true;
    mountedRef.current = true;

    fetchCount();
    globalIntervalId = setInterval(fetchCount, 30000);

    return () => {
      mountedRef.current = false;
    };
  }, [fetchCount]);

  return null;
}
