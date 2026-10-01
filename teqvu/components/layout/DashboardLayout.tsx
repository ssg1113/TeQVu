'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../../lib/store/useAppStore';
import { Sidebar } from './Sidebar';

export function DashboardLayout({
  children,
  showSidebar = true,
}: {
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  const pathname = usePathname();
  const { currentUser } = useAppStore();

  // Completely remove leftside navbar in admin UI or when user is in admin role
  const isAdminUI =
    pathname === '/admin' ||
    pathname?.startsWith('/admin/') ||
    currentUser?.role === 'admin';

  const shouldRenderSidebar = showSidebar && !isAdminUI;

  return (
    <div className="flex-1 flex max-w-7xl w-full mx-auto">
      {shouldRenderSidebar && <Sidebar />}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

