'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { logout } from '@/store/authSlice';
import { clearUser } from '@/store/userSlice';
import { clearCompany } from '@/store/companySlice';
import * as authService from '@/features/auth/server/auth.service';
import Avatar from '@/components/ui/Avatar';
import InternAvatar from '@/components/ui/InternAvatar';
import { getCompanyImgUrl } from '@/features/company/types';
import { notificationService } from '@/features/notifications/server/notification.service';
import type { Notification } from '@/features/notifications/types';
import { internService } from '@/features/company/services/intern.service';
import { taskService } from '@/features/company/services/task.service';
import { programService } from '@/features/company/services/program.service';
import type { Intern, Task, Program } from '@/features/company/types/management';
import { toastHelper } from '@/lib/toast';
import { getErrorMessage } from '@/lib/axios';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SearchResults({
  query,
  loading,
  failed,
  interns,
  tasks,
  programs,
  onNavigate,
}: {
  query: string;
  loading: boolean;
  failed: boolean;
  interns: Intern[];
  tasks: Task[];
  programs: Program[];
  onNavigate: () => void;
}) {
  const q = query.trim().toLowerCase();
  const matched = useMemo(() => {
    if (!q) return { interns: [] as Intern[], tasks: [] as Task[], programs: [] as Program[] };
    return {
      interns: interns
        .filter((i) => `${i.firstName} ${i.lastName} ${i.email}`.toLowerCase().includes(q))
        .slice(0, 4),
      tasks: tasks.filter((t) => `${t.title} ${t.description || ''}`.toLowerCase().includes(q)).slice(0, 4),
      programs: programs.filter((p) => `${p.name} ${p.description || ''}`.toLowerCase().includes(q)).slice(0, 3),
    };
  }, [q, interns, tasks, programs]);
  const { interns: matchedInterns, tasks: matchedTasks, programs: matchedPrograms } = matched;
  const empty = matchedInterns.length + matchedTasks.length + matchedPrograms.length === 0;

  return (
    <div className="absolute right-0 top-full z-50 mt-2 max-h-80 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
      <div className="max-h-72 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
      {loading ? (
        <div className="space-y-2 px-4 py-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : failed ? (
        <p className="px-4 py-5 text-center text-sm text-rose-500">Couldn’t load search data. Close and try again.</p>
      ) : empty ? (
        <p className="px-4 py-5 text-center text-sm text-slate-400">No matches for “{query.trim()}”.</p>
      ) : (
        <>
          {matchedInterns.length > 0 && (
            <div>
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Interns</p>
              {matchedInterns.map((i) => (
                <Link
                  key={i._id}
                  href={`/company/admin/interns/${i._id}`}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-slate-50"
                >
<InternAvatar
                    src={i.profilePicture?.secure_url}
                    firstName={i.firstName}
                    lastName={i.lastName}
                    email={i.email}
                    className="h-7 w-7 text-[10px]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-slate-800">{`${i.firstName} ${i.lastName}`.trim() || i.email}</span>
                    <span className="block truncate text-xs text-slate-400">{i.email}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
          {matchedTasks.length > 0 && (
            <div>
              <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tasks</p>
              {matchedTasks.map((t) => (
                <Link
                  key={t._id}
                  href={`/company/admin/tasks/${t._id}`}
                  onClick={onNavigate}
                  className="block truncate px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          )}
                {matchedPrograms.length > 0 && (
                  <div>
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Programs</p>
                    {matchedPrograms.map((p) => (
                      <Link
                        key={p._id}
                        href={`/company/admin/programs/${p._id}`}
                        onClick={onNavigate}
                        className="block truncate px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
      </div>
    </div>
  );
}

function SearchBox({
wrapperClassName,
inputClassName,
boxRef,
autoFocus,
id,
query,
setQuery,
setSearchOpen,
ensureSearchData,
searchOpen,
searchLoading,
searchFailed,
searchLoaded,
allInterns,
allTasks,
allPrograms,
onNavigate,
}: {
wrapperClassName?: string;
inputClassName?: string;
boxRef: React.RefObject<HTMLDivElement | null>;
autoFocus?: boolean;
id: string;
query: string;
setQuery: (v: string) => void;
setSearchOpen: (v: boolean) => void;
ensureSearchData: () => void;
searchOpen: boolean;
searchLoading: boolean;
searchFailed: boolean;
searchLoaded: boolean;
allInterns: Intern[];
allTasks: Task[];
allPrograms: Program[];
onNavigate: () => void;
}) {
return (
  <div className={`relative ${wrapperClassName || ''}`} ref={boxRef}>
    <Search
      size={16}
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
    <input
      id={id}
      type="text"
      placeholder="Search interns, tasks..."
      aria-label="Search interns and tasks"
      value={query}
      autoFocus={autoFocus}
      onChange={(e) => {
        setQuery(e.target.value);
        setSearchOpen(true);
      }}
      onFocus={() => {
        ensureSearchData();
        if (query.trim()) setSearchOpen(true);
      }}
      className={`rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${inputClassName || ''}`}
    />
    {searchOpen && query.trim() && (
      <SearchResults
        query={query}
        loading={searchLoading}
        failed={searchFailed && !searchLoaded}
        interns={allInterns}
        tasks={allTasks}
        programs={allPrograms}
        onNavigate={onNavigate}
      />
    )}
  </div>
);
}

type TopBarProps = {
  title: string;
  actions?: React.ReactNode;
};

export default function TopBar({
  title,
  actions,
}: TopBarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentCompany = useAppSelector((s) => s.company.currentCompany);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const [allInterns, setAllInterns] = useState<Intern[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setMobileSearchOpen(false);
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, []);

  useEffect(() => {
    notificationService.getUnreadCount().then(setUnread).catch(() => {});
  }, []);

  const openNotifications = async () => {
    const next = !notifOpen;
    setNotifOpen(next);
    if (!next) return;
    setNotifLoading(true);
    try {
      const [list, count] = await Promise.all([
        notificationService.list({ limit: 20 }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(list.notifications);
      setUnread(count);
    } catch {
      // silent — dropdown will show empty state
    } finally {
      setNotifLoading(false);
    }
  };

  const handleReadOne = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  };

  const handleReadAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  };

  const ensureSearchData = async () => {
    if (searchLoaded || searchLoading) return;
    const cid = currentCompany?._id;
    if (!cid) return;
    setSearchLoading(true);
    setSearchFailed(false);
    try {
      const results = await Promise.allSettled([
        internService.listAllInterns(cid),
        (async () => {
          try {
            return (await taskService.listTasks(cid, { limit: 100 })).tasks;
          } catch {
            return [] as Task[];
          }
        })(),
        (async () => {
          try {
            return (await programService.listPrograms(cid, { limit: 100 })).data;
          } catch {
            return [] as Program[];
          }
        })(),
      ]);
      const interns = results[0].status === 'fulfilled' ? results[0].value : ([] as Intern[]);
      const tasks = results[1].status === 'fulfilled' ? results[1].value : ([] as Task[]);
      const progs = results[2].status === 'fulfilled' ? results[2].value : ([] as Program[]);
      if (results.some((r) => r.status === 'rejected')) {
        setSearchFailed(true);
        return;
      }
      setAllInterns(interns);
      setAllTasks(tasks);
      setAllPrograms(progs);
      setSearchLoaded(true);
    } finally {
      setSearchLoading(false);
    }
  };

  async function handleLogout() {
    await authService.logout();
    dispatch(logout());
    dispatch(clearUser());
    dispatch(clearCompany());
    document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
    document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
    router.push('/');
  }

  const links = [
    { href: '/company/admin', label: 'Dashboard', icon: 'fa-th-large' },
    { href: '/company/profile', label: 'My Profile', icon: 'fa-building' },
    { href: '/company/activity', label: 'Activity', icon: 'fa-chart-line' },
    { href: '/company/settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg lg:text-xl">{title}</h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Actions inline on tablet+ */}
          {actions && <div className="hidden sm:block">{actions}</div>}

          {/* Mobile search toggle — expands a full-width field below */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((o) => !o)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearchOpen}
            className={`rounded-lg p-2 transition-colors md:hidden ${
              mobileSearchOpen ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Search size={18} />
          </button>

          <SearchBox
            wrapperClassName="hidden md:block"
            inputClassName="w-48 lg:w-64"
            boxRef={searchRef}
            id="topbar-search"
            query={query}
            setQuery={setQuery}
            setSearchOpen={setSearchOpen}
            ensureSearchData={ensureSearchData}
            searchOpen={searchOpen}
            searchLoading={searchLoading}
            searchFailed={searchFailed}
            searchLoaded={searchLoaded}
            allInterns={allInterns}
            allTasks={allTasks}
            allPrograms={allPrograms}
            onNavigate={() => {
              setSearchOpen(false);
              setQuery('');
            }}
          />

          <div className="relative" ref={notifRef}>
            <button
              type="button"
              aria-label="Notifications"
              aria-haspopup="menu"
              aria-expanded={notifOpen}
              onClick={openNotifications}
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-slate-50">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="flex items-center justify-between px-4 py-2">
                  <p className="text-sm font-semibold text-slate-900">Notifications</p>
                  {unread > 0 && (
                    <button onClick={handleReadAll} className="text-xs font-medium text-emerald-600 hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto overscroll-contain [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent">
                {notifLoading ? (
                  <div className="space-y-2 px-4 py-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-12 animate-pulse rounded-xl bg-slate-100" />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleReadOne(n._id)}
                      className={`flex w-full gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50 ${n.read ? 'opacity-60' : ''}`}
                    >
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-200' : 'bg-emerald-500'}`} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-slate-900">{n.title}</span>
                        <span className="block truncate text-xs text-slate-500">{n.message}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  ))
                )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-1 hover:bg-slate-100 sm:pr-2"
            >
              <Avatar
                src={getCompanyImgUrl(currentCompany?.logo) ?? null}
                name={currentCompany?.name || 'Company'}
                size="sm"
                icon="fa-building"
              />
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-[120px] truncate text-sm font-medium text-slate-900 lg:max-w-[140px]">
                  {currentCompany?.name || 'Company'}
                </p>
                <p className="truncate text-xs text-slate-400">{currentCompany?.industry || 'Admin'}</p>
              </div>
              <ChevronDown size={16} className="hidden text-slate-400 sm:block" />
            </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <i className={`fas ${l.icon} w-4 text-center text-slate-400`} />
                  {l.label}
                </Link>
              ))}
              <div className="mx-4 mb-1 mt-2 border-t border-slate-100 pt-2">
                <p className="px-0 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Browse site
                </p>
              </div>
              {[
                { href: '/internships', label: 'Internships', icon: 'fa-search' },
                { href: '/companies', label: 'Companies', icon: 'fa-building' },
                { href: '/how-it-works', label: 'How it works', icon: 'fa-circle-question' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <i className={`fas ${l.icon} w-4 text-center text-slate-400`} />
                  {l.label}
                </Link>
              ))}
              <div className="mt-1 border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <i className="fas fa-sign-out-alt w-4 text-center" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

          {/* Actions on mobile — full-width second row below the icons */}
          {mobileSearchOpen && (
            <div className="mt-3 md:hidden">
              <SearchBox
                inputClassName="w-full"
                boxRef={mobileSearchRef}
                autoFocus
                id="topbar-search-mobile"
                query={query}
                setQuery={setQuery}
                setSearchOpen={setSearchOpen}
                ensureSearchData={ensureSearchData}
                searchOpen={searchOpen}
                searchLoading={searchLoading}
                searchFailed={searchFailed}
                searchLoaded={searchLoaded}
                allInterns={allInterns}
                allTasks={allTasks}
                allPrograms={allPrograms}
                onNavigate={() => {
                  setSearchOpen(false);
                  setQuery('');
                  setMobileSearchOpen(false);
                }}
              />
            </div>
          )}
          {actions && <div className="mt-3 flex w-full items-center gap-3 sm:hidden">{actions}</div>}
    </header>
  );
}