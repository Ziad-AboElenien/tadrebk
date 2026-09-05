'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUnreadCount } from '@/store/notificationSlice';
import { notificationService } from '@/features/notifications/server/notification.service';
import type { Notification } from '@/features/notifications/types';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';
import { toastHelper } from '@/lib/toast';

type FilterTab = 'All' | 'Unread';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function getIcon(type: string): string {
  if (type === 'application_reviewed') return 'fa-check-circle';
  if (type === 'application_received' || type === 'new_application') return 'fa-paper-plane';
  if (type === 'message' || type === 'mention' || type === 'new_message') return 'fa-message';
  return 'fa-bell';
}

function statusBadge(status?: string) {
  if (!status) return null;
  const colors: Record<string, string> = {
    accepted: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
      <i className={`fas fa-circle text-[6px] ${status === 'accepted' ? 'text-emerald-500' : status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`} />
      {status}
    </span>
  );
}

function getNotificationHref(n: Notification): string | null {
  if (n.data?.internshipId) return `/internships/${n.data.internshipId}`;
  if (n.data?.applicationId) return null;
  return null;
}

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { unreadCount } = useAppSelector((s) => s.notifications);
  const role = useAppSelector((s) => s.auth.role);
  const dashboardHref = role === 'company' ? '/company/admin' : '/dashboard';

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<FilterTab>('All');

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const result = await notificationService.list({ page: p, limit: 10, unreadOnly: false });
      setItems(result.notifications);
      setTotalPages(result.pagination.pages);
      setPage(result.pagination.page);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPage(page); }, [fetchPage, page]);

  const refreshCount = useCallback(async () => {
    try {
      const c = await notificationService.getUnreadCount();
      dispatch(setUnreadCount(c));
    } catch { /* ignore */ }
  }, [dispatch]);

  useEffect(() => { refreshCount(); }, [refreshCount]);

  const filtered = items.filter((n) => {
    if (filter === 'Unread') return !n.read;
    return true;
  });

  async function handleMarkAsRead(n: Notification) {
    if (n.read) return;
    try {
      await notificationService.markAsRead(n._id);
      setItems((prev) => prev.map((item) => item._id === n._id ? { ...item, read: true } : item));
      refreshCount();
    } catch { /* ignore */ }
  }

  async function handleCardClick(n: Notification) {
    const href = getNotificationHref(n);
    if (!n.read) {
      handleMarkAsRead(n);
      if (href) router.push(href);
      return;
    }
    if (href) router.push(href);
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      await fetchPage(page);
      await refreshCount();
    } catch { toastHelper.error('Failed to mark all as read'); }
    finally { setMarkingAll(false); }
  }

  const tabs: FilterTab[] = ['All', 'Unread'];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href={dashboardHref} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all backdrop-blur-xl border ${
                filter === tab
                  ? 'bg-white/70 border-white/80 text-emerald-700 shadow-md shadow-emerald-100/50'
                  : 'bg-white/50 border-white/60 text-gray-500 hover:bg-white/70 hover:text-gray-700'
              }`}
            >
              {tab}
              {tab === 'Unread' && unreadCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px] font-bold text-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <i className="fas fa-bell text-4xl text-gray-300" />
          <p className="text-sm text-gray-400">
            {filter === 'Unread'
              ? "You're all caught up!"
              : role === 'company'
                ? 'When students apply to your internships, you&apos;ll see it here.'
                : 'When companies respond to your applications, you&apos;ll see it here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            return (
              <div
                key={n._id}
                onClick={() => handleCardClick(n)}
                className={`flex items-start gap-4 rounded-2xl border px-5 py-5 transition-all ${
                  !n.read
                    ? 'border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white hover:border-emerald-200 hover:shadow-sm cursor-pointer'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm cursor-pointer'
                }`}
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${
                  !n.read ? 'bg-emerald-100' : 'bg-emerald-50'
                }`}>
                  <i className={`fas ${getIcon(n.type)} text-base ${!n.read ? 'text-emerald-600' : 'text-emerald-400'}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm ${!n.read ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.title}</h3>
                      {!n.read && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>
                      )}
                      {statusBadge(n.data?.status)}
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{n.message}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                    <i className="fas fa-clock text-[11px]" />{timeAgo(n.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {items.some((n) => !n.read) && (
        <div className="mt-6 text-center">
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="rounded-full border-2 border-emerald-400 px-8 py-3 text-sm font-bold text-emerald-500 transition hover:bg-emerald-50 disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark all as read'}
          </button>
        </div>
      )}
    </div>
  );
}
