'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Flame,
  Layers,
  BookOpen,
  Briefcase,
  Bookmark,
  Mail,
  Eye,
  Settings,
  User,
  Shield,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';

export function Sidebar() {
  const pathname = usePathname();
  const { bookmarkedIds, watchlistIds, currentUser } = useAppStore();

  const navigation = [
    { name: 'Home', href: '/home', icon: LayoutDashboard },
    { name: 'For You', href: '/for-you', icon: Sparkles, badge: 'AI' },
    { name: 'Latest', href: '/latest', icon: Layers },
    { name: 'Trending', href: '/trending', icon: Flame, badge: 'Hot' },
    { name: 'Technologies', href: '/technologies', icon: Compass },
    { name: 'Research', href: '/research', icon: BookOpen },
    { name: 'Jobs & Skills', href: '/jobs-skills', icon: Briefcase },
    {
      name: 'Bookmarks',
      href: '/bookmarks',
      icon: Bookmark,
      count: bookmarkedIds.length,
    },
    { name: 'Newsletter', href: '/newsletter', icon: Mail },
    {
      name: 'Watchlist',
      href: '/watchlist',
      icon: Eye,
      count: watchlistIds.length,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#0a0f1e]/50 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4">
      {/* Top Main Nav */}
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Intelligence Platform
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive
                          ? 'text-cyan-500'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {item.badge}
                    </span>
                  )}

                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Dashboard Link */}
        {currentUser.role === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Admin Console</span>
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-500/15 text-purple-400 font-semibold border border-purple-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-purple-400 hover:bg-purple-500/5'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin Dashboard</span>
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Bottom Nav: Settings, Profile */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-1">
        <Link
          href="/settings"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
            pathname === '/settings'
              ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>

        <Link
          href="/profile"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
            pathname === '/profile'
              ? 'bg-cyan-500/10 text-cyan-400 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile ({currentUser.occupation})</span>
        </Link>
      </div>
    </aside>
  );
}
