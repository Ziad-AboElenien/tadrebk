'use client';

import { pushNotification, type AppNotificationType } from '@/components/ui/AppNotifications';

export interface ToastOpts {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

function toastWith(message: string, type: AppNotificationType, opts?: ToastOpts) {
  pushNotification({ type, message, ...opts });
}

export const toastHelper = {
  success: (msg: string, opts?: ToastOpts) => toastWith(msg, 'success', opts),
  error:   (msg: string, opts?: ToastOpts) => toastWith(msg, 'error', opts),
  info:    (msg: string, opts?: ToastOpts) => toastWith(msg, 'info', opts),
  warning: (msg: string, opts?: ToastOpts) => toastWith(msg, 'warning', opts),
};
