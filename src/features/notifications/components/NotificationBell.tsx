'use client';

import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';

export default function NotificationBell() {
  const router = useRouter();
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

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
