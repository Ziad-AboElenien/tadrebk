'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AdminShellContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

export function AdminShellProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);

  return (
    <AdminShellContext.Provider value={{ sidebarOpen, setSidebarOpen, toggleSidebar }}>
      {children}
    </AdminShellContext.Provider>
  );
}

export function useAdminShell(): AdminShellContextValue {
  const ctx = useContext(AdminShellContext);
  if (!ctx) throw new Error('useAdminShell must be used within AdminShellProvider');
  return ctx;
}