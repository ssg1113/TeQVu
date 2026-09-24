'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, NewsletterPreference } from '../types';

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
      },
      updateNewsletterPrefs: (prefs) =>
        set((state) => ({
          newsletterPrefs: { ...state.newsletterPrefs, ...prefs },
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
      }),
    }
  )
);
