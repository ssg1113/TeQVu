'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, Bell, BellOff, ArrowUpRight, ArrowDownRight, Trash2, Plus, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { technologies } from '../../lib/mock-data/technologies';
import { TrendBadge } from '../../components/ui/Badge';
import { Sparkline } from '../../components/ui/Sparkline';
import { formatGrowth } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

export default function WatchlistPage() {
  const { watchlistIds, toggleWatchlist } = useAppStore();

  const watchedTechs = technologies.filter((t) => watchlistIds.includes(t.id));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Eye className="w-4 h-4" />
              <span>Dedicated Tracking Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technology Watchlist
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Actively monitoring {watchedTechs.length} technologies for mention spikes, breaking drivers, and research updates.
            </p>
          </div>

          <Link
            href="/technologies"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add More Technologies</span>
          </Link>
        </div>

        {/* Watchlist Table */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
          {watchedTechs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No technologies followed yet</h3>
              <p className="text-sm text-slate-400 max-w-xs mb-6">
                Follow technologies from the Technologies page to track their velocity and get notified of significant changes.
              </p>
              <Link
                href="/technologies"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Browse Technologies</span>
              </Link>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Technology</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Trend Score</th>
                  <th className="py-3.5 px-4 font-semibold">Velocity Sparkline</th>
                  <th className="py-3.5 px-4 font-semibold">Growth (7D)</th>
                  <th className="py-3.5 px-4 font-semibold">Mentions</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Alerts</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {watchedTechs.map((tech) => (
                  <tr
                    key={tech.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/technologies/${tech.slug}`}
                        className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition"
                      >
                        {tech.name}
                      </Link>
                      <div className="text-[11px] text-slate-400 line-clamp-1 max-w-[160px]">
                        {tech.description}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                      {tech.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {tech.trendScore} / 100
                    </td>
                    <td className="py-3.5 px-4">
                      <Sparkline
                        data={tech.sparkline}
                        color={tech.growth >= 0 ? '#10b981' : '#f59e0b'}
                        width={65}
                        height={20}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span
                        className={`flex items-center gap-0.5 ${
                          tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {tech.growth >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {formatGrowth(tech.growth)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {tech.mentions}
                    </td>
                    <td className="py-3.5 px-4">
                      <TrendBadge status={tech.status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                        <Bell className="w-3 h-3" />
                        <span>Enabled</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleWatchlist(tech.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
