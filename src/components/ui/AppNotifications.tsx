'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type AppNotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotificationInput {
  type: AppNotificationType;
  message: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface AppNotification extends Required<Pick<AppNotificationInput, 'type' | 'message'>> {
  id: number;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration: number;
}

const DEFAULT_TITLES: Record<AppNotificationType, string> = {
  success: 'Success',
  error: 'Something went wrong',
  warning: 'Heads up',
  info: 'FYI',
};

const TONE: Record<AppNotificationType, { icon: LucideIcon; chip: string; iconColor: string }> = {
  success: { icon: CheckCircle2, chip: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  error: { icon: XCircle, chip: 'bg-red-50', iconColor: 'text-red-500' },
  warning: { icon: AlertTriangle, chip: 'bg-amber-50', iconColor: 'text-amber-500' },
  info: { icon: Info, chip: 'bg-blue-50', iconColor: 'text-blue-600' },
};

const DEFAULT_DURATION = 6000;
const MAX_VISIBLE = 4;

let pushFn: ((input: AppNotificationInput) => void) | null = null;
let idCounter = 0;

/** Imperative bridge used by `toastHelper` — safe to call before mount (queued). */
const pendingQueue: AppNotificationInput[] = [];

function toNotification(input: AppNotificationInput): AppNotification {
  return {
    id: ++idCounter,
    type: input.type,
    message: input.message,
    title: input.title,
    description: input.description,
    actionLabel: input.actionLabel,
    onAction: input.onAction,
    duration: input.duration ?? DEFAULT_DURATION,
  };
}

/** Drain anything queued before the provider mounted (runs once, no effect). */
function takePending(): AppNotification[] {
  const drained: AppNotification[] = [];
  while (pendingQueue.length > 0) {
    const next = pendingQueue.shift();
    if (next) drained.push(toNotification(next));
  }
  return drained.slice(-MAX_VISIBLE);
}

export function pushNotification(input: AppNotificationInput) {
  if (pushFn) {
    pushFn(input);
  } else {
    pendingQueue.push(input);
  }
}

function NotificationCard({
  notification,
  onDismiss,
  reducedMotion,
}: {
  notification: AppNotification;
  onDismiss: () => void;
  reducedMotion: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { icon: Icon, chip, iconColor } = TONE[notification.type];
  const expandable = !!(notification.description || notification.actionLabel);

  // Auto-dismiss (paused while expanded so users can read + act).
  useEffect(() => {
    if (expanded) return;
    const t = window.setTimeout(onDismiss, notification.duration);
    return () => window.clearTimeout(t);
  }, [expanded, notification.duration, onDismiss]);

  return (
    <motion.div
      role="listitem"
      layout={!reducedMotion}
      initial={{ opacity: 0, y: reducedMotion ? 0 : -24, scale: reducedMotion ? 1 : 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95, transition: { duration: 0.18 } }}
      transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
        <div aria-hidden className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${chip}`}>
          <Icon size={20} className={iconColor} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900">
                {notification.title || DEFAULT_TITLES[notification.type]}
              </h3>
              <p className="break-words text-sm text-slate-600">{notification.message}</p>
            </div>
            {expandable && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Hide details' : 'Show details'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:text-slate-700"
              >
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: reducedMotion ? 0 : 0.2 }}
                  className="flex"
                >
                  <ChevronDown size={15} aria-hidden />
                </motion.span>
              </button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {expanded && expandable && (
              <motion.div
                key="details"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.25, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-3 border-t border-slate-100 pt-3">
                  {notification.description && (
                    <p className="break-words text-sm leading-relaxed text-slate-500">
                      {notification.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {notification.actionLabel && (
                      <button
                        type="button"
                        onClick={() => {
                          notification.onAction?.();
                          onDismiss();
                        }}
                        className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
                      >
                        {notification.actionLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="rounded-full px-4 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-full p-1 text-slate-400 transition-colors hover:text-slate-700"
        >
          <X size={15} aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

const NotificationsContext = createContext<{ notify: (input: AppNotificationInput) => void } | null>(null);

export function useAppNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useAppNotifications must be used within AppNotificationsProvider');
  return ctx;
}

export default function AppNotificationsProvider({ children }: { children: ReactNode }) {
  // Pre-mounted queue drains into the initial state — no syncing effect needed.
  const [items, setItems] = useState<AppNotification[]>(takePending);
  const reducedMotion = useReducedMotion() ?? false;

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((input: AppNotificationInput) => {
    const notification = toNotification(input);
      setItems((prev) => {
        // Same message already visible → restart its timer instead of stacking.
        if (prev.some((n) => n.type === notification.type && n.message === notification.message)) {
          return prev.map((n) =>
            n.type === notification.type && n.message === notification.message
              ? { ...n, id: notification.id }
              : n,
          );
        }
        return [...prev.slice(-(MAX_VISIBLE - 1)), notification];
      });
    },
    [],
  );

  useEffect(() => {
    pushFn = notify;
    return () => {
      if (pushFn === notify) pushFn = null;
    };
  }, [notify]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 top-0 z-[200] p-4 sm:p-6">
        <div className="pointer-events-auto mx-auto flex w-full max-w-md flex-col gap-3">
          <AnimatePresence initial={false}>
            {items.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onDismiss={() => dismiss(n.id)}
                reducedMotion={reducedMotion}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationsContext.Provider>
  );
}
