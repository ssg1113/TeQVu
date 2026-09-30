'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Navbar } from './Navbar';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { NotificationManager } from '../notifications/NotificationManager';
import { NotificationToast } from '../notifications/NotificationToast';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isDark } = useAppStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <div className="flex-1 flex flex-col">{children}</div>
      <GlobalSearchModal />
      <NotificationManager />
      <NotificationToast />
    </div>
  );
}

