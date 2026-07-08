'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUnreadCount } from '@/store/notificationSlice';
import { notificationService } from '@/features/notifications/server/notification.service';
import { toast } from 'react-toastify';

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);
  const lastCountRef = useRef(0);

  const fetchCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      if (count > lastCountRef.current) {
        const diff = count - lastCountRef.current;
        toast.info(`You have ${diff} new notification${diff > 1 ? 's' : ''}!`);
      }
      lastCountRef.current = count;
      dispatch(setUnreadCount(count));
    } catch { /* ignore */ }
  }, [dispatch]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <button
      onClick={() => router.push('/notifications')}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm transition hover:bg-gray-50"
      aria-label="Notifications"
    >
      <i className="fas fa-bell text-gray-600 text-lg" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
