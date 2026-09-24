'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Check,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { technologies } from '../../lib/mock-data/technologies';
import { TrendBadge } from '../../components/ui/Badge';
import { Sparkline } from '../../components/ui/Sparkline';
import { formatGrowth } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

export default function TrendingPage() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '3m' | '1y'>('7d');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { isWatching, toggleWatchlist } = useAppStore();

  const timeframes = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '3m', label: '3 Months' },
    { id: '1y', label: '1 Year' },
  ];

  const categories = ['all', 'AI/ML', 'Languages', 'Frameworks', 'Databases', 'Cloud', 'DevOps', 'Developer Tools'];

  const filteredTechs = technologies.filter((t) =>
    categoryFilter === 'all' ? true : t.category === categoryFilter
  );

  const topEmerging = technologies.filter((t) => t.status === 'emerging' || t.growth > 80).slice(0, 3);
  const fastestGrowing = [...technologies].sort((a, b) => b.growth - a.growth).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-500 font-semibold mb-1">
              <Flame className="w-4 h-4 text-purple-500" />
              <span>Global Trend Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technology Trends
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Discover technologies gaining momentum across the global technology ecosystem.
            </p>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  timeframe === tf.id
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* 1. TOP EMERGING HERO CARDS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono text-xs text-purple-400">
              Breakthrough Emerging Technologies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topEmerging.map((tech) => (
              <div
                key={tech.id}
                className="p-6 rounded-2xl bg-gradient-to-b from-purple-500/10 via-transparent to-transparent bg-white dark:bg-[#0f1629] border border-purple-500/30 dark:border-purple-500/30 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                      {tech.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      +{tech.growth}% mentions
                    </span>
                  </div>

                  <Link
                    href={`/technologies/${tech.slug}`}
                    className="text-xl font-bold text-slate-900 dark:text-white hover:text-cyan-400 transition"
                  >
                    {tech.name}
                  </Link>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {tech.description}
                  </p>

                  {/* Why this matters & Who should care */}
                  <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-purple-400 block text-[11px] uppercase font-mono">
                        Why This Matters:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-2">
                        {tech.whyTrending || 'Experiencing accelerating multi-source adoption across production frameworks.'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono">
                        Who Should Care:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {['Software Engineers', 'System Architects', 'Researchers'].map((role, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400">
                    {tech.sources} independent sources
                  </div>
                  <button
                    onClick={() => toggleWatchlist(tech.id)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition"
                  >
                    {isWatching(tech.id) ? 'Watching' : '+ Watch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. FASTEST GROWING PROGRESS BARS */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Fastest Growing Technologies ({timeframe.toUpperCase()})</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Normalized Velocity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fastestGrowing.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/technologies/${t.slug}`}
                    className="font-bold text-slate-900 dark:text-white hover:text-cyan-400"
                  >
                    {t.name}
                  </Link>
                  <span className="font-mono font-bold text-emerald-400">+{t.growth}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                    style={{ width: `${Math.min(100, t.growth)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Score: {t.trendScore}/100</span>
                  <span>{t.mentions} mentions</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. TREND TABLE */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Technology Trend Matrix</span>
            </h3>

            {/* Category filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Rank</th>
                    <th className="py-3.5 px-4 font-semibold">Technology</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Trend Score</th>
                    <th className="py-3.5 px-4 font-semibold">Mentions</th>
                    <th className="py-3.5 px-4 font-semibold">Sources</th>
                    <th className="py-3.5 px-4 font-semibold">Growth</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredTechs.map((tech, index) => {
                    const watching = isWatching(tech.id);
                    return (
                      <tr
                        key={tech.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/technologies/${tech.slug}`}
                            className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition"
                          >
                            {tech.name}
                          </Link>
                          <div className="text-[11px] text-slate-400 line-clamp-1">
                            {tech.description}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                          {tech.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {tech.trendScore}
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-cyan-500 rounded-full"
                                style={{ width: `${tech.trendScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {tech.mentions}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {tech.sources}
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
                        <td className="py-3.5 px-4">
                          <TrendBadge status={tech.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleWatchlist(tech.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                              watching
                                ? 'bg-cyan-500 text-white'
                                : 'border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {watching ? 'Watching' : 'Follow'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
