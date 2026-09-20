'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

const LS_COLLAPSED = 'tadrebk_sidebar_collapsed';

type AdminShellContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Always start expanded so SSR and the first client render match.
  // The persisted preference applies right after mount (one frame).
  const [collapsed, setCollapsedState] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      try {
        if (window.localStorage.getItem(LS_COLLAPSED) === '1') setCollapsedState(true);
      } catch {
        // storage unavailable — stay expanded
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value);
    try {
      window.localStorage.setItem(LS_COLLAPSED, value ? '1' : '0');
    } catch {
      // storage unavailable — ignore
    }
  }, []);
  const toggleCollapsed = useCallback(() => {
    setCollapsedState((prev) => {
      try {
        window.localStorage.setItem(LS_COLLAPSED, prev ? '0' : '1');
      } catch {
        // ignore
      }
      return !prev;
    });
  }, []);

  return (
    <AdminShellContext.Provider
      value={{ sidebarOpen, setSidebarOpen, toggleSidebar, collapsed, setCollapsed, toggleCollapsed }}
    >
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell(): AdminShellContextValue {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error('useAdminShell must be used within AdminShellProvider');
  return ctx;
}