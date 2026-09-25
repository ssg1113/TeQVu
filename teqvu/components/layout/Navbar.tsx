'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';
import { Logo } from '../ui/Logo';

export function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme, setSearchOpen, currentUser, bookmarkedIds, watchlistIds, switchRole, logout } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
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
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-[#0a0f1e]" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-2xl p-4 text-xs z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Smart Technology Signals</span>
                    <span className="text-[10px] font-mono text-cyan-400">Anti-Spam Verified</span>
                  </div>
                  <div className="py-3 space-y-2.5">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-1.5 font-semibold text-purple-400">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Emerging Trend: LLM Agents</span>
                      </div>
                      <p className="mt-1 text-slate-400 text-[11px]">
                        +128% mentions surge detected across 74 independent developer blogs & research repos.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <div className="flex items-center gap-1.5 font-semibold text-cyan-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Watchlist Alert: Rust in Linux</span>
                      </div>
                      <p className="mt-1 text-slate-400 text-[11px]">
                        Production drivers merged into mainline Linux tree.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      href="/newsletter"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-cyan-500 dark:text-cyan-400 hover:underline font-medium text-[11px]"
                    >
                      Manage Alert & Newsletter Rules →
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

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
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
                    <div className="font-bold text-slate-900 dark:text-white">{currentUser.name}</div>
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

                    {/* Quick Role Switcher for Testing */}
                    <button
                      onClick={() => {
                        switchRole(currentUser.role === 'admin' ? 'user' : 'admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Switch Role to:</span>
                      </span>
                      <strong className="text-cyan-400 font-mono capitalize">
                        {currentUser.role === 'admin' ? 'Normal User' : 'Admin'}
                      </strong>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href="/signin"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-red-500/10 text-red-400"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

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
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1e] px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <Link href="/bookmarks" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-cyan-400" />
              <span>Bookmarks ({bookmarkedIds.length})</span>
            </Link>
            {currentUser.role === 'admin' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-1.5 text-purple-400">
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
