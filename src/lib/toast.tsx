'use client';

import { toast, type ToastOptions } from 'react-toastify';
import { type ReactNode } from 'react';

const baseOpts: ToastOptions = {
  icon: false,
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
};

function makeIcon(faClass: string, color: string, bg: string): ReactNode {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: bg }}
    >
      <i className={`fas ${faClass} text-sm`} style={{ color }} />
    </div>
  );
}

function toastWith(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning',
) {
  const map = {
    success: {
      icon: makeIcon('fa-check', '#10b981', '#ecfdf5'),
      border: 'border-emerald-100',
    },
    error: {
      icon: makeIcon('fa-xmark', '#ef4444', '#fef2f2'),
      border: 'border-red-100',
    },
    info: {
      icon: makeIcon('fa-bell', '#3b82f6', '#eff6ff'),
      border: 'border-blue-100',
    },
    warning: {
      icon: makeIcon('fa-exclamation-triangle', '#f59e0b', '#fffbeb'),
      border: 'border-amber-100',
    },
  };

  const { icon, border } = map[type];
  const fn = type === 'error' ? toast.error : type === 'info' ? toast.info : type === 'warning' ? toast.warning : toast.success;

  fn(
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-sm font-medium text-dark">{message}</span>
    </div>,
    {
      ...baseOpts,
      className: `!bg-white !border ${border} !rounded-2xl !shadow-xl !overflow-hidden`,
    },
  );
}

export const toastHelper = {
  success: (msg: string) => toastWith(msg, 'success'),
  error:   (msg: string) => toastWith(msg, 'error'),
  info:    (msg: string) => toastWith(msg, 'info'),
  warning: (msg: string) => toastWith(msg, 'warning'),
};
