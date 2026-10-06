'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, NewsletterPreference, AppNotification, Occupation } from '../types';
import {
  PRIMARY_ADMIN_EMAIL,
  ADMIN_NAME,
  isAdminAccount,
  isPrimaryAdmin,
  canSwitchRole,
} from '../security/admin';
import { supabase } from '../supabase/client';

export const ANONYMOUS_USER: UserProfile = {
  id: '',
  name: 'Guest User',
  email: '',
  avatarUrl: '',
  occupation: '',
  country: 'United States',
  interests: [],
  followedTechs: [],
  role: 'user',
  joinedAt: '',
  newsletterPreference: {
    frequency: 'daily',
    categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
    enableAlerts: false,
    alertCategories: [],
    maxAlertsPerDay: 1,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    deliveryTime: '08:00',
    deliveryDayOfWeek: 1,
    deliveryDayOfMonth: 1,
    scheduledEmail: '',
    scheduleEnabled: false,
    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  },
  hasPassword: false,
  authProviders: [],
  passwordUpdatedAt: '',
  twoFactorEnabled: false,
};

export interface UserSavedData {
  currentUser: Partial<UserProfile>;
  bookmarkedIds: string[];
  watchlistIds: string[];
  interests: string[];
  newsletterPrefs: NewsletterPreference;
}

interface AppState {
  // Auth state
  isAuthenticated: boolean;
  currentUser: UserProfile;
  adminRolePreference?: 'user' | 'admin';
  setAdminRolePreference: (role: 'user' | 'admin') => void;
  lastActiveAt: number;
  recordActivity: () => void;
  sessionTimedOut: boolean;
  setAuthenticated: (val: boolean) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  login: (email: string, role?: 'user' | 'admin', name?: string, provider?: 'google' | 'github' | 'email', hasPassword?: boolean) => void;
  signup: (data: { name: string; email: string; occupation?: Occupation | string; role?: 'user' | 'admin' }) => void;
  setPasswordStatus: (hasPassword: boolean, updatedAt?: string) => void;
  linkAuthProvider: (provider: 'google' | 'github' | 'email') => void;
  switchRole: (role: 'user' | 'admin') => boolean;
  logout: (options?: { skipSupabase?: boolean }) => Promise<void>;
  deleteAccount: () => Promise<boolean>;

  // User directory for duplicate sign-up prevention
  registeredEmails: string[];
  isEmailRegistered: (email: string) => boolean;

  // Unified per-account persistent storage (bookmarks, watchlist, features, customized options keyed by email)
  userDataByEmail: Record<string, UserSavedData>;

  // Admin Governance & Delegation
  adminEmails: string[];
  assignAdmin: (email: string) => boolean;
  revokeAdmin: (email: string) => boolean;

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

// Concurrency guard to prevent re-entrant or duplicate logout loops
let isLoggingOut = false;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      currentUser: ANONYMOUS_USER,
      adminRolePreference: undefined,
      lastActiveAt: 0,
      sessionTimedOut: false,
      userDataByEmail: {},
      setAdminRolePreference: (role) => set({ adminRolePreference: role }),
      recordActivity: () => set({ lastActiveAt: Date.now() }),
      setAuthenticated: (val) => set({ isAuthenticated: val }),
      updateUser: (updates) => {
        if (!get().isAuthenticated) return;
        const cleanEmail = get().currentUser.email?.trim().toLowerCase();
        set((state) => {
          const nextUser = { ...state.currentUser, ...updates };
          const nextUserData = cleanEmail
            ? {
                ...state.userDataByEmail,
                [cleanEmail]: {
                  ...(state.userDataByEmail[cleanEmail] || {
                    bookmarkedIds: state.bookmarkedIds,
                    watchlistIds: state.watchlistIds,
                    interests: state.interests,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  currentUser: nextUser,
                },
              }
            : state.userDataByEmail;
          return {
            currentUser: nextUser,
            userDataByEmail: nextUserData,
          };
        });
      },

      // User directory
      registeredEmails: [PRIMARY_ADMIN_EMAIL],
      isEmailRegistered: (email: string) => {
        const clean = (email || '').trim().toLowerCase();
        if (!clean) return false;
        return (get().registeredEmails || []).some((e) => e.trim().toLowerCase() === clean);
      },

      adminEmails: [PRIMARY_ADMIN_EMAIL],

      assignAdmin: (email: string) => {
        const clean = (email || '').trim().toLowerCase();
        if (!clean || !clean.includes('@')) return false;

        const current = get().adminEmails.map((e) => e.trim().toLowerCase());
        if (current.includes(clean)) return true;

        const updated = [...get().adminEmails, clean];
        set({ adminEmails: updated });

        // If the currently logged in user is the one being assigned, update role
        if (get().currentUser.email.trim().toLowerCase() === clean) {
          set((state) => ({ currentUser: { ...state.currentUser, role: 'admin' } }));
        }
        return true;
      },

      revokeAdmin: (email: string) => {
        const clean = (email || '').trim().toLowerCase();
        // Never allow revoking the primary super admin
        if (clean === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          console.warn('Cannot revoke the primary administrator.');
          return false;
        }

        const updated = get().adminEmails.filter((e) => e.trim().toLowerCase() !== clean);
        set({ adminEmails: updated });

        // If the currently logged in user was revoked, demote role to 'user'
        if (get().currentUser.email.trim().toLowerCase() === clean) {
          set((state) => ({ currentUser: { ...state.currentUser, role: 'user' } }));
        }
        return true;
      },

      login: (email, role, name, provider, hasPassword) => {
        const cleanEmail = email.trim().toLowerCase();
        const isAdmin = isAdminAccount(email, get().adminEmails);

        // Retrieve existing unified user record for this email
        const savedData = get().userDataByEmail?.[cleanEmail];
        const savedUser = savedData?.currentUser;

        const prevProviders = savedUser?.authProviders || get().currentUser.authProviders || ['email'];
        const providerToAdd = provider || 'email';
        const updatedProviders = Array.from(new Set([...prevProviders, providerToAdd]));

        let effectiveRole: 'user' | 'admin' = 'user';
        if (isAdmin) {
          if (role) {
            effectiveRole = role;
          } else if (get().adminRolePreference) {
            effectiveRole = get().adminRolePreference!;
          } else {
            effectiveRole = 'admin';
          }
        }

        const now = new Date().toISOString();
        const prevUser = get().currentUser;
        const displayName =
          (savedUser?.name && savedUser.name !== ADMIN_NAME)
            ? savedUser.name
            : (name && name !== ADMIN_NAME)
            ? name
            : (prevUser.name && prevUser.name !== ADMIN_NAME && prevUser.name !== 'Platform Owner & Admin' && prevUser.name !== 'Admin Operator'
              ? prevUser.name
              : cleanEmail.split('@')[0]);

        const currentReg = get().registeredEmails || [];
        const nextReg = currentReg.includes(cleanEmail) ? currentReg : [...currentReg, cleanEmail];

        // Restored Bookmarks, Watchlist, Interests, Newsletter Preferences
        const isPrimary = cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();
        const restoredBookmarks = savedData?.bookmarkedIds ?? (
          isPrimary ? ['art-001', 'paper-001', 'art-002'] : []
        );
        const restoredWatchlist = savedData?.watchlistIds ?? (
          isPrimary ? ['rust', 'llm-agents', 'nextjs', 'pgvector', 'ebpf'] : ['rust', 'llm-agents', 'nextjs']
        );
        const restoredInterests = savedData?.interests ?? (
          isPrimary ? ['ai', 'web-dev', 'software-eng', 'cloud', 'cybersecurity'] : ['ai', 'web-dev', 'software-eng']
        );
        const restoredNewsletter: NewsletterPreference = savedData?.newsletterPrefs ?? {
          frequency: 'daily',
          categories: ['AI/ML', 'Languages', 'Cloud Computing', 'Cybersecurity', 'Software Engineering'],
          enableAlerts: true,
          alertCategories: ['AI/ML', 'Languages', 'Cybersecurity'],
          maxAlertsPerDay: 1,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          deliveryTime: '08:00',
          deliveryDayOfWeek: 1,
          deliveryDayOfMonth: 1,
          scheduledEmail: email,
          scheduleEnabled: true,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        };

        const resolvedHasPassword =
          hasPassword !== undefined
            ? hasPassword
            : (savedUser?.hasPassword ?? true);

        const updatedUser: UserProfile = {
          id: savedUser?.id || get().currentUser.id || `usr_${Date.now()}`,
          email,
          name: displayName,
          role: effectiveRole,
          avatarUrl: savedUser?.avatarUrl || get().currentUser.avatarUrl || '',
          occupation: savedUser?.occupation || (get().currentUser.occupation !== 'Platform Administrator' ? get().currentUser.occupation : '') || 'Software Engineer',
          country: savedUser?.country || get().currentUser.country || 'United States',
          interests: restoredInterests,
          followedTechs: restoredWatchlist,
          joinedAt: savedUser?.joinedAt || get().currentUser.joinedAt || now.split('T')[0],
          hasPassword: resolvedHasPassword,
          authProviders: updatedProviders,
          passwordUpdatedAt: savedUser?.passwordUpdatedAt || now,
          twoFactorEnabled: savedUser?.twoFactorEnabled || false,
          newsletterPreference: {
            ...restoredNewsletter,
            scheduledEmail: email,
            scheduleEnabled: restoredNewsletter.scheduleEnabled ?? true,
          },
        };

        const nextUserDataMap = {
          ...(get().userDataByEmail || {}),
          [cleanEmail]: {
            currentUser: updatedUser,
            bookmarkedIds: restoredBookmarks,
            watchlistIds: restoredWatchlist,
            interests: restoredInterests,
            newsletterPrefs: restoredNewsletter,
          },
        };

        set({
          isAuthenticated: true,
          adminRolePreference: effectiveRole,
          lastActiveAt: Date.now(),
          sessionTimedOut: false,
          registeredEmails: nextReg,
          currentUser: updatedUser,
          bookmarkedIds: restoredBookmarks,
          watchlistIds: restoredWatchlist,
          interests: restoredInterests,
          newsletterPrefs: restoredNewsletter,
          userDataByEmail: nextUserDataMap,
        });
      },

      signup: (data) => {
        // Normal registrations are strictly regular 'user' accounts unless matching an admin email
        const isAdmin = isAdminAccount(data.email, get().adminEmails);
        const effectiveRole: 'user' | 'admin' = isAdmin ? 'admin' : 'user';
        const now = new Date().toISOString();
        const cleanEmail = data.email.trim().toLowerCase();
        const currentReg = get().registeredEmails || [];
        const nextReg = currentReg.includes(cleanEmail) ? currentReg : [...currentReg, cleanEmail];

        const initialBookmarks = ['art-001', 'paper-001'];
        const initialWatchlist = ['rust', 'llm-agents', 'nextjs', 'pgvector'];
        const initialInterests = ['ai', 'web-dev', 'software-eng', 'cloud', 'cybersecurity'];
        const initialNewsletter: NewsletterPreference = {
          frequency: 'daily',
          categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
          enableAlerts: true,
          alertCategories: ['AI/ML', 'Languages', 'Cybersecurity'],
          maxAlertsPerDay: 1,
          quietHoursStart: '22:00',
          quietHoursEnd: '07:00',
          deliveryTime: '08:00',
          deliveryDayOfWeek: 1,
          deliveryDayOfMonth: 1,
          scheduledEmail: data.email,
          scheduleEnabled: true,
          timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
        };

        const newUser: UserProfile = {
          id: `usr_${Date.now()}`,
          name: data.name,
          email: data.email,
          occupation: (data.occupation as Occupation) || 'Software Engineer',
          country: (data as any).country || 'United States',
          role: effectiveRole,
          joinedAt: now.split('T')[0],
          hasPassword: true,
          authProviders: ['email'],
          passwordUpdatedAt: now,
          avatarUrl: '',
          interests: initialInterests,
          followedTechs: initialWatchlist,
          twoFactorEnabled: false,
          newsletterPreference: initialNewsletter,
        };

        const nextUserDataMap = {
          ...(get().userDataByEmail || {}),
          [cleanEmail]: {
            currentUser: newUser,
            bookmarkedIds: initialBookmarks,
            watchlistIds: initialWatchlist,
            interests: initialInterests,
            newsletterPrefs: initialNewsletter,
          },
        };

        set({
          isAuthenticated: true,
          adminRolePreference: effectiveRole,
          lastActiveAt: Date.now(),
          sessionTimedOut: false,
          registeredEmails: nextReg,
          currentUser: newUser,
          bookmarkedIds: initialBookmarks,
          watchlistIds: initialWatchlist,
          interests: initialInterests,
          newsletterPrefs: initialNewsletter,
          userDataByEmail: nextUserDataMap,
        });
      },

      setPasswordStatus: (hasPassword, updatedAt) => {
        const cleanEmail = get().currentUser.email?.trim().toLowerCase();
        set((state) => {
          const nextUser = {
            ...state.currentUser,
            hasPassword,
            passwordUpdatedAt: updatedAt || new Date().toISOString(),
          };
          const nextUserData = cleanEmail
            ? {
                ...state.userDataByEmail,
                [cleanEmail]: {
                  ...(state.userDataByEmail[cleanEmail] || {
                    bookmarkedIds: state.bookmarkedIds,
                    watchlistIds: state.watchlistIds,
                    interests: state.interests,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  currentUser: nextUser,
                },
              }
            : state.userDataByEmail;
          return {
            currentUser: nextUser,
            userDataByEmail: nextUserData,
          };
        });
      },

      linkAuthProvider: (provider) => {
        const cleanEmail = get().currentUser.email?.trim().toLowerCase();
        set((state) => {
          const current = state.currentUser.authProviders || ['email'];
          if (current.includes(provider)) return state;
          const nextProviders = [...current, provider];
          const nextUser = {
            ...state.currentUser,
            authProviders: nextProviders,
          };
          const nextUserData = cleanEmail
            ? {
                ...state.userDataByEmail,
                [cleanEmail]: {
                  ...(state.userDataByEmail[cleanEmail] || {
                    bookmarkedIds: state.bookmarkedIds,
                    watchlistIds: state.watchlistIds,
                    interests: state.interests,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  currentUser: nextUser,
                },
              }
            : state.userDataByEmail;
          return {
            currentUser: nextUser,
            userDataByEmail: nextUserData,
          };
        });
      },

      switchRole: (newRole) => {
        const state = get();
        const currentEmail = state.currentUser.email;
        const currentRole = state.currentUser.role;
        const adminList = state.adminEmails;

        // ONLY authorized admins (sgdesilva1113@gmail.com or assigned admins) have authority to switch roles
        if (!canSwitchRole(currentEmail, currentRole, adminList)) {
          console.warn('Unauthorized role switch attempt blocked for user:', currentEmail);
          return false;
        }

        // Switching roles MUST NOT log out the user! Seamless in-place role switch
        // Profile details (name, occupation, avatar) must remain identical to user profile details
        const authenticName =
          state.currentUser.name === 'Platform Owner & Admin' || state.currentUser.name === 'Admin Operator'
            ? currentEmail.split('@')[0]
            : state.currentUser.name;

        set((s) => ({
          currentUser: {
            ...s.currentUser,
            role: newRole,
            name: authenticName,
          },
          adminRolePreference: newRole,
          lastActiveAt: Date.now(),
        }));

        state.addNotification({
          title: 'Role Switched',
          message: `Switched to ${newRole === 'admin' ? 'Administrator' : 'Normal User'} mode.`,
          type: 'system',
          importance: 'normal',
        });

        return true;
      },

      logout: async (options?: { skipSupabase?: boolean }) => {
        if (isLoggingOut) return;
        isLoggingOut = true;

        try {
          // Snapshot current user's state into persistent storage before clearing active session
          const currentEmail = get().currentUser.email?.trim().toLowerCase();
          const savedMap = { ...(get().userDataByEmail || {}) };
          if (currentEmail) {
            savedMap[currentEmail] = {
              currentUser: { ...get().currentUser },
              bookmarkedIds: [...get().bookmarkedIds],
              watchlistIds: [...get().watchlistIds],
              interests: [...get().interests],
              newsletterPrefs: { ...get().newsletterPrefs },
            };
          }

          // 1. Immediately reset active session state synchronously in the Zustand store
          set({
            isAuthenticated: false,
            currentUser: ANONYMOUS_USER,
            userDataByEmail: savedMap,
            bookmarkedIds: [],
            watchlistIds: [],
            interests: [],
            notifications: [],
            notifiedKeys: [],
            activeToast: null,
            toastQueue: [],
            newsletterPrefs: {
              frequency: 'daily',
              categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
              enableAlerts: false,
              alertCategories: [],
              maxAlertsPerDay: 1,
              quietHoursStart: '22:00',
              quietHoursEnd: '07:00',
              deliveryTime: '08:00',
              deliveryDayOfWeek: 1,
              deliveryDayOfMonth: 1,
              scheduledEmail: '',
              scheduleEnabled: false,
              timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
            },
            lastActiveAt: 0,
            sessionTimedOut: false,
          });

          // 2. Clear any auth tokens from browser storage
          if (typeof window !== 'undefined') {
            try {
              sessionStorage.clear();
              const keysToRemove: string[] = [];
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.startsWith('sb-') || key.includes('supabase.auth'))) {
                  keysToRemove.push(key);
                }
              }
              keysToRemove.forEach((k) => localStorage.removeItem(k));
            } catch {}
          }

          // 3. Inform Supabase client to clear local session safely without blocking or deadlocking
          if (!options?.skipSupabase && supabase) {
            try {
              await Promise.race([
                supabase.auth.signOut({ scope: 'local' }),
                new Promise<void>((resolve) => setTimeout(resolve, 1500)),
              ]);
            } catch (err) {
              console.warn('Supabase signOut note:', err);
            }
          }
        } finally {
          isLoggingOut = false;
        }
      },

      deleteAccount: async () => {
        const currentEmail = get().currentUser.email?.trim().toLowerCase();
        const currentId = get().currentUser.id;

        try {
          await fetch('/api/auth/delete-account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, userId: currentId }),
          });
        } catch (err) {
          console.warn('Backend delete-account request error:', err);
        }

        const remainingRegistered = (get().registeredEmails || []).filter(
          (e) => e.trim().toLowerCase() !== (currentEmail || '')
        );
        const remainingData = { ...(get().userDataByEmail || {}) };
        if (currentEmail) {
          delete remainingData[currentEmail];
        }

        set({ registeredEmails: remainingRegistered, userDataByEmail: remainingData });

        // Safely perform logout to clear session & storage
        await get().logout();

        return true;
      },

      // Bookmarks
      bookmarkedIds: ['art-001', 'paper-001', 'art-002'],
      toggleBookmark: (id) => {
        if (!get().isAuthenticated) return;
        set((state) => {
          const exists = state.bookmarkedIds.includes(id);
          const nextBookmarks = exists
            ? state.bookmarkedIds.filter((item) => item !== id)
            : [...state.bookmarkedIds, id];
          const email = state.currentUser.email?.trim().toLowerCase();
          const nextUserData = email
            ? {
                ...state.userDataByEmail,
                [email]: {
                  ...(state.userDataByEmail[email] || {
                    currentUser: state.currentUser,
                    watchlistIds: state.watchlistIds,
                    interests: state.interests,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  bookmarkedIds: nextBookmarks,
                },
              }
            : state.userDataByEmail;
          return {
            bookmarkedIds: nextBookmarks,
            userDataByEmail: nextUserData,
          };
        });
      },
      isBookmarked: (id) => get().bookmarkedIds.includes(id),

      // Watchlist
      watchlistIds: ['rust', 'llm-agents', 'nextjs', 'pgvector', 'ebpf'],
      toggleWatchlist: (id) => {
        if (!get().isAuthenticated) return;
        set((state) => {
          const exists = state.watchlistIds.includes(id);
          const nextWatchlist = exists
            ? state.watchlistIds.filter((item) => item !== id)
            : [...state.watchlistIds, id];
          const email = state.currentUser.email?.trim().toLowerCase();
          const nextUserData = email
            ? {
                ...state.userDataByEmail,
                [email]: {
                  ...(state.userDataByEmail[email] || {
                    currentUser: state.currentUser,
                    bookmarkedIds: state.bookmarkedIds,
                    interests: state.interests,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  watchlistIds: nextWatchlist,
                },
              }
            : state.userDataByEmail;
          return {
            watchlistIds: nextWatchlist,
            currentUser: { ...state.currentUser, followedTechs: nextWatchlist },
            userDataByEmail: nextUserData,
          };
        });
      },
      isWatching: (id) => get().watchlistIds.includes(id),

      // Interests
      interests: ['ai', 'web-dev', 'software-eng', 'cloud', 'cybersecurity'],
      toggleInterest: (id) => {
        if (!get().isAuthenticated) return;
        set((state) => {
          const exists = state.interests.includes(id);
          const newInterests = exists
            ? state.interests.filter((item) => item !== id)
            : [...state.interests, id];
          const email = state.currentUser.email?.trim().toLowerCase();
          const nextUserData = email
            ? {
                ...state.userDataByEmail,
                [email]: {
                  ...(state.userDataByEmail[email] || {
                    currentUser: state.currentUser,
                    bookmarkedIds: state.bookmarkedIds,
                    watchlistIds: state.watchlistIds,
                    newsletterPrefs: state.newsletterPrefs,
                  }),
                  interests: newInterests,
                },
              }
            : state.userDataByEmail;
          return {
            interests: newInterests,
            currentUser: { ...state.currentUser, interests: newInterests },
            userDataByEmail: nextUserData,
          };
        });
      },

      // Newsletter
      newsletterPrefs: {
        frequency: 'daily',
        categories: ['AI/ML', 'Languages', 'Cloud', 'Cybersecurity', 'DevOps'],
        enableAlerts: true,
        alertCategories: ['AI/ML', 'Languages', 'Cybersecurity'],
        maxAlertsPerDay: 1,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        deliveryTime: '08:00',
        deliveryDayOfWeek: 1,
        deliveryDayOfMonth: 1,
        scheduledEmail: '',
        scheduleEnabled: false,
        timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
      },
      updateNewsletterPrefs: (prefs) => {
        if (!get().isAuthenticated) return;
        set((state) => {
          const nextPrefs = { ...state.newsletterPrefs, ...prefs };
          const email = state.currentUser.email?.trim().toLowerCase();
          const nextUserData = email
            ? {
                ...state.userDataByEmail,
                [email]: {
                  ...(state.userDataByEmail[email] || {
                    currentUser: state.currentUser,
                    bookmarkedIds: state.bookmarkedIds,
                    watchlistIds: state.watchlistIds,
                    interests: state.interests,
                  }),
                  newsletterPrefs: nextPrefs,
                },
              }
            : state.userDataByEmail;
          return {
            newsletterPrefs: nextPrefs,
            currentUser: { ...state.currentUser, newsletterPreference: nextPrefs },
            userDataByEmail: nextUserData,
          };
        });
      },

      // Real-Time Notifications
      notifications: [],
      notifiedKeys: [],
      activeToast: null,
      toastQueue: [],

      addNotification: (item) => {
        if (!get().isAuthenticated) return;
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
        adminRolePreference: state.adminRolePreference,
        lastActiveAt: state.lastActiveAt,
        adminEmails: state.adminEmails,
        registeredEmails: state.registeredEmails,
        userDataByEmail: state.userDataByEmail,
        bookmarkedIds: state.bookmarkedIds,
        watchlistIds: state.watchlistIds,
        interests: state.interests,
        newsletterPrefs: state.newsletterPrefs,
        isDark: state.isDark,
        notifications: state.notifications,
        notifiedKeys: state.notifiedKeys,
      }),
      onRehydrateStorage: () => (state) => {
        // If unauthenticated, sanitize active session so no previous user details are visible
        if (state && !state.isAuthenticated) {
          state.currentUser = ANONYMOUS_USER;
          state.bookmarkedIds = [];
          state.watchlistIds = [];
          state.interests = [];
          state.notifications = [];
        }
      },
    }
  )
);
