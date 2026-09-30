'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, NewsletterPreference, AppNotification } from '../types';

interface AppState {
  // Auth state
  isAuthenticated: boolean;
  currentUser: UserProfile;
  setAuthenticated: (val: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  login: (email: string, role?: 'user' | 'admin', name?: string) => void;
  signup: (data: { name: string; email: string; occupation?: any; role?: 'user' | 'admin' }) => void;
  switchRole: (role: 'user' | 'admin') => void;
  logout: () => void;

  // Bookmarks
  bookmarkedIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;

  // Watchlist (Followed Technologies)
  watchlistIds: string[];
  toggleWatchlist: (id: string) => void;
  isWatching: (id: string) => boolean;

  // Interests
  interests: string[];
  toggleInterest: (id: string) => void;

  // Newsletter preferences
  newsletterPrefs: NewsletterPreference;
  updateNewsletterPrefs: (prefs: Partial<NewsletterPreference>) => void;

  // Real-Time Notifications
  notifications: AppNotification[];
  notifiedKeys: string[];
  activeToast: AppNotification | null;
  toastQueue: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'> & { id?: string; timestamp?: string; isRead?: boolean }) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setActiveToast: (toast: AppNotification | null) => void;
  dismissToast: () => void;
  hasNotifiedKey: (key: string) => boolean;
  recordNotifiedKey: (key: string) => void;

  // Theme
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;

  // Global search modal
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}


const DEFAULT_USER: UserProfile = {
  id: 'usr_normal_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@techpulse.dev',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
  occupation: 'Software Engineer',
  interests: ['ai', 'web-dev', 'software-eng', 'cloud', 'cybersecurity'],
  followedTechs: ['rust', 'llm-agents', 'nextjs', 'pgvector', 'ebpf'],
  role: 'user', // Default to normal user so admin isolation is immediately apparent
  joinedAt: '2025-01-10',
  newsletterPreference: {
    frequency: 'daily',
    categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
    enableAlerts: true,
    alertCategories: ['AI/ML', 'Languages', 'Cybersecurity'],
    maxAlertsPerDay: 1,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    deliveryTime: '08:30',
    deliveryDayOfWeek: 1,
    deliveryDayOfMonth: 1,
    scheduledEmail: 'sgdesilva1113@gmail.com',
    scheduleEnabled: true,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true,
      currentUser: DEFAULT_USER,
      setAuthenticated: (val) => set({ isAuthenticated: val }),
      updateUser: (updates) =>
        set((state) => ({ currentUser: { ...state.currentUser, ...updates } })),

      login: (email, role = 'user', name) => {
        const isAdmin = role === 'admin' || email.toLowerCase().includes('admin');
        set({
          isAuthenticated: true,
          currentUser: {
            ...get().currentUser,
            email,
            name: name || (isAdmin ? 'Admin Operator' : email.split('@')[0]),
            role: isAdmin ? 'admin' : 'user',
          },
        });
      },

      signup: (data) => {
        set({
          isAuthenticated: true,
          currentUser: {
            ...get().currentUser,
            id: `usr_${Date.now()}`,
            name: data.name,
            email: data.email,
            occupation: data.occupation || 'Software Engineer',
            role: data.role || (data.email.toLowerCase().includes('admin') ? 'admin' : 'user'),
            joinedAt: new Date().toISOString().split('T')[0],
          },
        });
      },

      switchRole: (newRole) => {
        set((state) => ({
          currentUser: {
            ...state.currentUser,
            role: newRole,
            name: newRole === 'admin' ? 'Admin Operator' : 'Alex Rivera',
            email: newRole === 'admin' ? 'admin@teqvu.dev' : 'alex.rivera@techpulse.dev',
          },
        }));
      },

      logout: () => {
        set({
          isAuthenticated: false,
        });
      },

      // Bookmarks
      bookmarkedIds: ['art-001', 'paper-001', 'art-002'],
      toggleBookmark: (id) =>
        set((state) => {
          const exists = state.bookmarkedIds.includes(id);
          return {
            bookmarkedIds: exists
              ? state.bookmarkedIds.filter((item) => item !== id)
              : [...state.bookmarkedIds, id],
          };
        }),
      isBookmarked: (id) => get().bookmarkedIds.includes(id),

      // Watchlist
      watchlistIds: ['rust', 'llm-agents', 'nextjs', 'pgvector', 'ebpf'],
      toggleWatchlist: (id) =>
        set((state) => {
          const exists = state.watchlistIds.includes(id);
          return {
            watchlistIds: exists
              ? state.watchlistIds.filter((item) => item !== id)
              : [...state.watchlistIds, id],
          };
        }),
      isWatching: (id) => get().watchlistIds.includes(id),

      // Interests
      interests: ['ai', 'web-dev', 'software-eng', 'cloud', 'cybersecurity'],
      toggleInterest: (id) =>
        set((state) => {
          const exists = state.interests.includes(id);
          const newInterests = exists
            ? state.interests.filter((item) => item !== id)
            : [...state.interests, id];
          return {
            interests: newInterests,
            currentUser: { ...state.currentUser, interests: newInterests },
          };
        }),

      // Newsletter
      newsletterPrefs: {
        frequency: 'daily',
        categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
        enableAlerts: true,
        alertCategories: ['AI/ML', 'Languages', 'Cybersecurity'],
        maxAlertsPerDay: 1,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        deliveryTime: '08:30',
        deliveryDayOfWeek: 1,
        deliveryDayOfMonth: 1,
        scheduledEmail: 'sgdesilva1113@gmail.com',
        scheduleEnabled: true,
      },
      updateNewsletterPrefs: (prefs) =>
        set((state) => ({
          newsletterPrefs: { ...state.newsletterPrefs, ...prefs },
        })),

      // Real-Time Notifications
      notifications: [],
      notifiedKeys: [],
      activeToast: null,
      toastQueue: [],

      addNotification: (item) => {
        const id = item.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const timestamp = item.timestamp || new Date().toISOString();
        const newNotif: AppNotification = {
          ...item,
          id,
          timestamp,
          isRead: item.isRead ?? false,
          importance: item.importance || 'normal',
        };

        set((state) => {
          // Avoid duplicate ID in notification list
          const exists = state.notifications.some((n) => n.id === id);
          if (exists) return state;
          // Keep newest first, max 50 items
          const updated = [newNotif, ...state.notifications].slice(0, 50);

          if (!state.activeToast) {
            return {
              notifications: updated,
              activeToast: newNotif,
            };
          } else {
            return {
              notifications: updated,
              toastQueue: [...state.toastQueue, newNotif],
            };
          }
        });
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          activeToast: state.activeToast?.id === id ? null : state.activeToast,
          toastQueue: state.toastQueue.filter((n) => n.id !== id),
        })),

      clearNotifications: () =>
        set({
          notifications: [],
          activeToast: null,
          toastQueue: [],
        }),

      setActiveToast: (toast) => set({ activeToast: toast }),
      dismissToast: () =>
        set((state) => {
          if (state.toastQueue.length > 0) {
            const nextToast = state.toastQueue[0];
            return {
              activeToast: nextToast,
              toastQueue: state.toastQueue.slice(1),
            };
          }
          return { activeToast: null };
        }),

      hasNotifiedKey: (key) => get().notifiedKeys.includes(key),
      recordNotifiedKey: (key) =>
        set((state) => ({
          notifiedKeys: state.notifiedKeys.includes(key)
            ? state.notifiedKeys
            : [...state.notifiedKeys.slice(-100), key],
        })),

      // Theme (default dark for high-tech aesthetic)
      isDark: true,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
      setTheme: (dark) => set({ isDark: dark }),

      // Search modal
      isSearchOpen: false,
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: 'teqvu-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        bookmarkedIds: state.bookmarkedIds,
        watchlistIds: state.watchlistIds,
        interests: state.interests,
        newsletterPrefs: state.newsletterPrefs,
        isDark: state.isDark,
        notifications: state.notifications,
        notifiedKeys: state.notifiedKeys,
      }),
    }
  )
);
