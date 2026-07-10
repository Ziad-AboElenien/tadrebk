'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setUnreadCount } from '@/store/notificationSlice';
import { notificationService } from '@/features/notifications/server/notification.service';
import type { Notification } from '@/features/notifications/types';
import Spinner from '@/components/ui/Spinner';
import Pagination from '@/components/ui/Pagination';
import { toast } from 'react-toastify';

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
  switch (type) {
    case 'application_reviewed': return 'fa-check-circle';
    case 'application_received':
    case 'new_application': return 'fa-paper-plane';
    default: return 'fa-bell';
  }
}

function getIconBg(type: string): string {
  switch (type) {
    case 'application_reviewed': return 'bg-emerald-100';
    case 'application_received':
    case 'new_application': return 'bg-blue-100';
    default: return 'bg-gray-100';
  }
}

function getIconColor(type: string): string {
  switch (type) {
    case 'application_reviewed': return 'text-emerald-500';
    case 'application_received':
    case 'new_application': return 'text-blue-500';
    default: return 'text-gray-500';
  }
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

export default function NotificationsScreen() {
  const dispatch = useAppDispatch();
  const { unreadCount } = useAppSelector((s) => s.notifications);
  const role = useAppSelector((s) => s.auth.role);
  const dashboardHref = role === 'company' ? '/company/dashboard' : '/dashboard';

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());

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

  async function handleMarkAsRead(n: Notification) {
    if (n.read) return;
    setMarkingIds((prev) => new Set(prev).add(n._id));
    try {
      await notificationService.markAsRead(n._id);
      await fetchPage(page);
      await refreshCount();
    } catch { toast.error('Failed to mark as read'); }
    finally { setMarkingIds((prev) => { const next = new Set(prev); next.delete(n._id); return next; }); }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      await fetchPage(page);
      await refreshCount();
    } catch { toast.error('Failed to mark all as read'); }
    finally { setMarkingAll(false); }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href={dashboardHref} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-400">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {items.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            {markingAll ? 'Marking...' : 'Mark All as Read'}
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <i className="fas fa-bell-slash text-4xl mb-4" />
          <p className="text-lg font-semibold">No notifications yet</p>
          <p className="mt-1 text-sm">{role === 'company' ? 'When students apply to your internships, you&apos;ll see it here.' : 'When companies respond to your applications, you&apos;ll see it here.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const loadingMark = markingIds.has(n._id);
            return (
              <button
                key={n._id}
                onClick={() => handleMarkAsRead(n)}
                disabled={loadingMark}
                className={`w-full flex items-start gap-4 rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                  n.read
                    ? 'border-gray-100 bg-white'
                    : 'border-emerald-100 bg-emerald-50/60'
                }`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${getIconBg(n.type)}`}>
                  <i className={`fas ${getIcon(n.type)} text-base ${getIconColor(n.type)}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm ${n.read ? 'text-gray-600' : 'font-bold text-gray-900'}`}>
                      {n.title}
                    </p>
                    {statusBadge(n.data?.status)}
                  </div>
                  <p className={`mt-0.5 text-sm ${n.read ? 'text-gray-400' : 'text-gray-500'}`}>{n.message}</p>
                  {n.data?.internshipId && n.data?.internshipTitle && (
                    <Link
                      href={`/internships/${n.data.internshipId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <i className="fas fa-briefcase" />
                      {n.data.internshipTitle}
                      <i className="fas fa-arrow-up-right-from-square text-[9px]" />
                    </Link>
                  )}
                  <div className="mt-1.5 flex items-center gap-3">
                    <p className="text-xs font-medium text-gray-300">{timeAgo(n.createdAt)}</p>
                    {loadingMark && <Spinner size="sm" />}
                  </div>
                </div>
                {!n.read && (
                  <span className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
