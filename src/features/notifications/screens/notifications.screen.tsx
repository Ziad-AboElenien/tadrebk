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
  const dashboardHref = role === 'company' ? '/company/dashboard' : '/dashboard';

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [markingAll, setMarkingAll] = useState(false);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterTab>('All');
  const [selected, setSelected] = useState<Set<string>>(new Set());

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

  const allChecked = filtered.length > 0 && filtered.every((n) => selected.has(n._id));

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(filtered.map((n) => n._id)));

  async function handleMarkAsRead(n: Notification) {
    if (n.read) return;
    setMarkingIds((prev) => new Set(prev).add(n._id));
    try {
      await notificationService.markAsRead(n._id);
      await fetchPage(page);
      await refreshCount();
    } catch { toastHelper.error('Failed to mark as read'); }
    finally { setMarkingIds((prev) => { const next = new Set(prev); next.delete(n._id); return next; }); }
  }

  async function handleCardClick(n: Notification) {
    const href = getNotificationHref(n);
    if (!n.read) await handleMarkAsRead(n);
    if (href) router.push(href);
  }

  async function handleMarkSelectedRead() {
    if (selected.size === 0) return;
    setMarkingAll(true);
    try {
      await Promise.all([...selected].map((id) => notificationService.markAsRead(id)));
      await fetchPage(page);
      await refreshCount();
      setSelected(new Set());
    } catch { toastHelper.error('Failed to mark as read'); }
    finally { setMarkingAll(false); }
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
              onClick={() => { setFilter(tab); setSelected(new Set()); }}
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

      {selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-900 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAll}
              className={`flex h-5 w-5 items-center justify-center rounded border-2 transition ${allChecked ? 'border-white bg-white' : 'border-gray-400'}`}
            >
              {allChecked && <i className="fas fa-check h-3 w-3 text-gray-900" />}
            </button>
            <span className="text-sm font-semibold text-white">
              {selected.size} {selected.size === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkSelectedRead}
              disabled={markingAll}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {markingAll ? <Spinner size="sm" /> : <i className="fas fa-check h-4 w-4" />} Mark selected as read
            </button>
          </div>
        </div>
      )}

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
            const checked = selected.has(n._id);
            const loadingMark = markingIds.has(n._id);
            const href = getNotificationHref(n);
            return (
              <div
                key={n._id}
                onClick={() => handleCardClick(n)}
                className={`flex items-start gap-4 rounded-2xl border px-5 py-5 transition-all ${
                  checked
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : !n.read
                      ? 'border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white hover:border-emerald-200 hover:shadow-sm cursor-pointer'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm cursor-pointer'
                }`}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(n._id); }}
                  className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                    checked ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300 bg-white hover:border-emerald-400'
                  }`}
                >
                  {checked && <i className="fas fa-check h-3 w-3 text-white" />}
                </button>

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
                    <div className="flex items-center gap-2">
                      {loadingMark && <Spinner size="sm" />}
                      {href && (
                        <i className="fas fa-arrow-right text-[11px] text-gray-300" />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{n.message}</p>
                  {n.data?.internshipTitle && (
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <i className="fas fa-briefcase text-[10px]" />
                      {n.data.internshipTitle}
                    </p>
                  )}
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

      {items.some((n) => !n.read) && selected.size === 0 && (
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
