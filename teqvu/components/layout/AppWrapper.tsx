'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '../../lib/store/useAppStore';
import { supabase } from '../../lib/supabase/client';
import { Navbar } from './Navbar';
import { GlobalSearchModal } from '../ui/GlobalSearchModal';
import { NotificationManager } from '../notifications/NotificationManager';
import { NotificationToast } from '../notifications/NotificationToast';

// Default session inactivity timeout: 2 hours (in ms)
const SESSION_INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000;
// Activity record throttle: 30 seconds
const ACTIVITY_THROTTLE_MS = 30 * 1000;

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, isAuthenticated, currentUser, lastActiveAt, recordActivity, logout } = useAppStore();
  const lastRecordedRef = useRef<number>(0);

  // Admin role restriction: when role is admin, the UI shows only the admin dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser.role === 'admin') {
      const allowedAdminRoutes = ['/admin', '/settings', '/profile', '/auth'];
      const isAllowed = allowedAdminRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
      );
      if (!isAllowed) {
        router.replace('/admin');
      }
    }
  }, [isAuthenticated, currentUser.role, pathname, router]);

  // Dark mode class toggle
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  // Activity tracking for session freshness
  useEffect(() => {
    if (!isAuthenticated) return;

    // Record initial activity if none set
    if (!lastActiveAt) {
      recordActivity();
    }

    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastRecordedRef.current > ACTIVITY_THROTTLE_MS) {
        lastRecordedRef.current = now;
        recordActivity();
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, [isAuthenticated, lastActiveAt, recordActivity]);

  // Session inactivity check interval
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const currentActive = useAppStore.getState().lastActiveAt;
      if (currentActive > 0) {
        const elapsed = Date.now() - currentActive;
        if (elapsed > SESSION_INACTIVITY_LIMIT_MS) {
          await logout();
          router.push('/signin?notice=session_timeout');
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, logout, router]);

  // Supabase Auth listener to sync sign-out (e.g. from another tab or token expiry)
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        const currentAuth = useAppStore.getState().isAuthenticated;
        if (currentAuth) {
          // Pass skipSupabase: true because Supabase has already fired the SIGNED_OUT event.
          // Re-invoking supabase.auth.signOut() from inside its own event subscriber causes lock deadlocks.
          await logout({ skipSupabase: true });
          router.push('/signin?notice=signed_out');
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [logout, router]);

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

