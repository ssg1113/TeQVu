'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  Zap,
  TrendingUp,
  Bookmark,
  Shield,
  Layers,
  User,
  LogOut,
  Sparkles,
  Flame,
  CheckCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Logo } from '../ui/Logo';
import { timeAgo } from '../../lib/utils';
import { canSwitchRole } from '../../lib/security/admin';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isDark,
    toggleTheme,
    setSearchOpen,
    currentUser,
    isAuthenticated,
    bookmarkedIds,
    watchlistIds,
    switchRole,
    logout,
    adminEmails,
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);


  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/home', label: 'Dashboard' },
    { href: '/trending', label: 'Trending' },
    { href: '/latest', label: 'Latest News' },
    { href: '/technologies', label: 'Technologies' },
    { href: '/research', label: 'Research' },
    { href: '/jobs-skills', label: 'Jobs & Skills' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0a0f1e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Logo linkToHome variant="horizontal" size="md" priority />

            {/* Desktop Navigation */}
            {currentUser.role === 'admin' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm">
                  <Shield className="w-3.5 h-3.5" />
                  <span>ADMIN CONSOLE</span>
                </span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                  Real-time Management & Telemetry
                </span>
              </div>
            ) : (
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Admin-only Switch back to User Mode button */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  const success = switchRole('user');
                  if (success) {
                    router.push('/home');
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition shadow-sm cursor-pointer"
                title="Switch back to User Mode"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Switch to User Mode</span>
                <span className="sm:hidden">User Mode</span>
              </button>
            )}

            {/* Global Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 hover:border-cyan-500/50 transition group"
            >
              <Search className="w-3.5 h-3.5 text-cyan-500" />
              <span className="hidden sm:inline">Search tech, papers...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                ⌘K
              </kbd>
            </button>

            {/* Notifications Trigger */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {mounted && isAuthenticated && notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-cyan-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0a0f1e] shadow-sm animate-pulse">
                    {notifications.filter((n) => !n.isRead).length > 9 ? '9+' : notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 shadow-2xl text-xs z-50 animate-slide-up overflow-hidden">
                  <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">Live Technology Signals</span>
                      {mounted && isAuthenticated && notifications.filter((n) => !n.isRead).length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                          {notifications.filter((n) => !n.isRead).length} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5">
                      {mounted && isAuthenticated && notifications.filter((n) => !n.isRead).length > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400 transition flex items-center gap-1 font-medium"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark read</span>
                        </button>
                      )}
                      {mounted && isAuthenticated && notifications.length > 0 && (
                        <button
                          onClick={() => clearNotifications()}
                          className="text-[11px] text-slate-400 hover:text-rose-500 transition flex items-center gap-1 font-medium"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {!isAuthenticated ? (
                      <div className="py-8 px-4 text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto">
                          <Bell className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            Sign In for Live Signals
                          </p>
                          <p className="mt-1 text-slate-400 text-[11px] max-w-[240px] mx-auto leading-relaxed">
                            Sign in to get real-time alerts, technology radar updates, and personalized intelligence notifications.
                          </p>
                        </div>
                        <Link
                          href="/signin?notice=auth_required"
                          onClick={() => setNotificationsOpen(false)}
                          className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-sm"
                        >
                          Sign In
                        </Link>
                      </div>
                    ) : !mounted || notifications.length === 0 ? (
                      <div className="py-8 px-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                          <Bell className="w-5 h-5 text-slate-400 opacity-60" />
                        </div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">All Caught Up</p>
                        <p className="mt-1 text-slate-400 text-[11px] max-w-[240px] mx-auto">
                          No pending alerts. You will be automatically notified when important updates or breakout tech trends appear.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isTrend = notif.type === 'trend';
                        return (
                          <div
                            key={notif.id}
                            className={`p-3 transition group relative hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                              !notif.isRead ? 'bg-cyan-50/40 dark:bg-cyan-950/20' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                  isTrend
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {isTrend ? <Zap className="w-3.5 h-3.5" /> : <Flame className="w-3.5 h-3.5" />}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                                        isTrend
                                          ? 'text-purple-600 dark:text-purple-400'
                                          : 'text-rose-600 dark:text-rose-400'
                                      }`}
                                    >
                                      {isTrend ? 'Breakout Trend' : 'Breaking Signal'}
                                    </span>
                                    {notif.metric && (
                                      <span className="text-[9px] font-mono px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                                        {notif.metric}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                    {timeAgo(notif.timestamp)}
                                  </span>
                                </div>

                                <a
                                  href={notif.url || notif.link || '#'}
                                  target={notif.url?.startsWith('http') ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    setNotificationsOpen(false);
                                  }}
                                  className="block mt-1 font-semibold text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition text-[11px] leading-snug line-clamp-2"
                                >
                                  {notif.title}
                                </a>

                                <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>

                                <div className="mt-2 flex items-center justify-between">
                                  <a
                                    href={notif.url || notif.link || '#'}
                                    target={notif.url?.startsWith('http') ? '_blank' : '_self'}
                                    rel="noopener noreferrer"
                                    onClick={() => {
                                      markAsRead(notif.id);
                                      setNotificationsOpen(false);
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                                  >
                                    <span>{notif.url?.startsWith('http') ? 'Read Source' : 'View Details'}</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>

                                  <div className="flex items-center gap-1.5">
                                    {!notif.isRead && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          markAsRead(notif.id);
                                        }}
                                        className="text-[10px] text-slate-400 hover:text-cyan-500 transition px-1 py-0.5 rounded font-medium"
                                        title="Mark as read"
                                      >
                                        Mark read
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeNotification(notif.id);
                                      }}
                                      className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                                      title="Dismiss alert"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-between text-[11px]">
                    <Link
                      href="/trending"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition font-medium"
                    >
                      Live Radar →
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      Notification Rules
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Avatar with Dropdown OR Sign In / Register Buttons */}
            {mounted && !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/signin"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-sm shadow-cyan-500/20 transition"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200 dark:border-slate-700"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ${
                    mounted && currentUser.role === 'admin'
                      ? 'bg-gradient-to-tr from-purple-600 to-pink-500 ring-purple-500/40'
                      : 'bg-gradient-to-tr from-cyan-500 to-purple-600 ring-cyan-500/30'
                  }`}>
                    {mounted ? (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U') : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                      {mounted ? (currentUser.name ? currentUser.name.split(' ')[0] : 'User') : 'User'}
                    </span>
                    <span className="text-[9px] font-mono text-cyan-500 -mt-0.5 capitalize">
                      {mounted ? currentUser.role : 'user'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-2xl p-3 text-xs z-50 animate-slide-up space-y-2">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white">{currentUser.name || 'User'}</div>
                      <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold capitalize ${
                          currentUser.role === 'admin'
                            ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}>
                          {currentUser.role} Account
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>Edit Profile</span>
                      </Link>

                      {currentUser.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-purple-500/10 text-purple-400 font-semibold"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      {/* Role Switcher: seamlessly toggles without logging out */}
                      {canSwitchRole(currentUser.email, currentUser.role, adminEmails) && (
                        <button
                          type="button"
                          onClick={() => {
                            const targetRole = currentUser.role === 'admin' ? 'user' : 'admin';
                            const success = switchRole(targetRole);
                            setProfileDropdownOpen(false);
                            if (success) {
                              if (targetRole === 'admin') {
                                router.push('/admin');
                              } else if (pathname === '/admin') {
                                router.push('/home');
                              }
                            }
                          }}
                          className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-purple-500/10 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span>Switch Role:</span>
                          </span>
                          <strong className="text-purple-400 font-mono capitalize">
                            {currentUser.role === 'admin' ? 'Normal User' : 'Admin'}
                          </strong>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await logout();
                          router.push('/signin?notice=signed_out');
                        }}
                        className="w-full text-left flex items-center gap-2 p-2 rounded-xl hover:bg-red-500/10 text-red-400 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1e] px-4 py-3 space-y-2">
          {currentUser.role === 'admin' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <span className="flex items-center gap-2 text-xs font-bold text-purple-400">
                  <Shield className="w-4 h-4" />
                  <span>Admin Mode Active</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    switchRole('user');
                    router.push('/home');
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white cursor-pointer"
                >
                  Switch to User Mode
                </button>
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20"
              >
                Admin Dashboard & Live Telemetry
              </Link>
            </div>
          ) : (
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
              >
                {link.label}
              </Link>
            ))
          )}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-xs text-slate-400">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between">
                  <Link href="/bookmarks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5">
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    <span>Bookmarks ({bookmarkedIds.length})</span>
                  </Link>
                  {currentUser.role === 'admin' ? (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 text-purple-400">
                      <Shield className="w-4 h-4" />
                      <span>Admin Console</span>
                    </Link>
                  ) : (
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 text-slate-300">
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Profile</span>
                    </Link>
                  )}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                    router.push('/signin?notice=signed_out');
                  }}
                  className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80 text-left flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-400">
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
