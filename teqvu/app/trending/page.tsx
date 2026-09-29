'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Flame,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Check,
  Sparkles,
  Layers,
  Filter,
  RefreshCw,
  ExternalLink,
  Clock,
  Loader2,
  Newspaper,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TrendBadge } from '../../components/ui/Badge';
import { Sparkline } from '../../components/ui/Sparkline';
import { formatGrowth, timeAgo } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import type { Technology, Article } from '../../lib/types';

type Timeframe = '24h' | '7d' | '30d' | '3m' | '1y';

const TIMEFRAMES: { id: Timeframe; label: string }[] = [
  { id: '24h', label: '24 Hours' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '3m', label: '3 Months' },
  { id: '1y', label: '1 Year' },
];

const CATEGORIES = [
  'all', 'AI/ML', 'Frameworks', 'Languages',
  'Databases', 'Cloud', 'DevOps', 'Developer Tools', 'Systems', 'Mobile',
];

const STATUS_FILTERS = [
  'all', 'emerging', 'rising', 'trending', 'stable', 'declining', 'falling',
];

const SOURCE_COLORS: Record<string, string> = {
  reuters: 'text-orange-400',
  bbc: 'text-red-400',
  digitaltrends: 'text-blue-400',
  googlenews: 'text-emerald-400',
};

export default function TrendingPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [trendDirectionFilter, setTrendDirectionFilter] = useState<'all' | 'rising' | 'falling'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [velocityMode, setVelocityMode] = useState<'rising' | 'falling'>('rising');
  const [sortColumn, setSortColumn] = useState<'rank' | 'score' | 'mentions' | 'growth'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [allTechs, setAllTechs] = useState<Technology[]>([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [liveNews, setLiveNews] = useState<Article[]>([]);
  const { isWatching, toggleWatchlist } = useAppStore();

  const fetchTrends = useCallback(async (tf: Timeframe) => {
    setLoadingTechs(true);
    try {
      const res = await fetch(`/api/trends?timeframe=${tf}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.trends) && data.trends.length > 0) {
        setAllTechs(data.trends);
      }
    } catch {
      // ignore
    } finally {
      setLoadingTechs(false);
    }
  }, []);

  const fetchNews = useCallback(async () => {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/tech-news?limit=6');
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        setLiveNews(data.articles);
      }
    } catch {
      setLiveNews([]);
    } finally {
      setLoadingNews(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends('7d');
    fetchNews();
  }, [fetchTrends, fetchNews]);

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    fetchTrends(tf);
  };

  const handleSort = (col: 'rank' | 'score' | 'mentions' | 'growth') => {
    if (sortColumn === col) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortColumn(col);
      setSortOrder(col === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredTechs = allTechs
    .filter((t) => {
      const matchCat =
        categoryFilter === 'all' || t.category.toLowerCase() === categoryFilter.toLowerCase();
      
      const matchDirection =
        trendDirectionFilter === 'all'
          ? true
          : trendDirectionFilter === 'falling'
          ? t.growth < 0 || t.status === 'declining' || t.status === 'falling'
          : t.growth >= 0 && t.status !== 'declining' && t.status !== 'falling';

      const matchStatus =
        statusFilter === 'all' || t.status.toLowerCase() === statusFilter.toLowerCase();

      return matchCat && matchDirection && matchStatus;
    })
    .sort((a, b) => {
      const factor = sortOrder === 'desc' ? -1 : 1;
      if (sortColumn === 'score') return (a.trendScore - b.trendScore) * factor;
      if (sortColumn === 'mentions') return (a.mentions - b.mentions) * factor;
      if (sortColumn === 'growth') return (a.growth - b.growth) * factor;
      return 0;
    });

  const topEmerging = allTechs
    .filter((t) => (t.status === 'emerging' || t.growth > 50) && t.growth > 0)
    .slice(0, 3);

  const topFalling = allTechs
    .filter((t) => t.status === 'declining' || t.status === 'falling' || t.growth < 0)
    .sort((a, b) => a.growth - b.growth)
    .slice(0, 3);

  const fastestGrowing = [...allTechs].filter((t) => t.growth > 0).sort((a, b) => b.growth - a.growth).slice(0, 4);
  const sharpestDeclines = [...allTechs].filter((t) => t.growth < 0).sort((a, b) => a.growth - b.growth).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-500 font-semibold mb-1">
              <Flame className="w-4 h-4 text-purple-500" />
              <span>Global Trend Engine • Dual-Vector Velocity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technology Trends Radar
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Monitor both rising technologies gaining multi-source momentum AND cooling technologies facing industry sunset.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Sync */}
            <button
              onClick={() => { fetchTrends(timeframe); fetchNews(); }}
              disabled={loadingTechs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition disabled:opacity-50 cursor-pointer"
            >
              {loadingTechs ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Sync</span>
            </button>

            {/* Timeframe Buttons */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => handleTimeframeChange(tf.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
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
        </div>

        {/* Global Trend Direction Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Signal Direction:
            </span>
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setTrendDirectionFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  trendDirectionFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Trends ({allTechs.length})
              </button>
              <button
                type="button"
                onClick={() => setTrendDirectionFilter('rising')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  trendDirectionFilter === 'rising'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-500 hover:text-emerald-400'
                }`}
              >
                <span>🔥 Rising ({allTechs.filter(t => t.growth >= 0 && t.status !== 'declining' && t.status !== 'falling').length})</span>
              </button>
              <button
                type="button"
                onClick={() => setTrendDirectionFilter('falling')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  trendDirectionFilter === 'falling'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-rose-500 hover:text-rose-400'
                }`}
              >
                <span>📉 Falling / Sunset ({allTechs.filter(t => t.growth < 0 || t.status === 'declining' || t.status === 'falling').length})</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Showing <span className="text-slate-900 dark:text-white font-bold">{filteredTechs.length}</span> technologies matching current filters
          </div>
        </div>

        {/* SECTION A: Emerging Technologies (Shown if all or rising) */}
        {trendDirectionFilter !== 'falling' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
                  Breakthrough Emerging Technologies (High Velocity)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">Expanding adoption</span>
            </div>
            {loadingTechs ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topEmerging.map((tech) => (
                  <div key={tech.id} className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-purple-500/30 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">{tech.category}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">+{tech.growth}% ({timeframe})</span>
                      </div>
                      <Link href={`/technologies/${tech.slug}`} className="text-xl font-bold text-slate-900 dark:text-white hover:text-cyan-400 transition">
                        {tech.name}
                      </Link>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{tech.description}</p>
                      <div className="mt-4 p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-2">
                        <div>
                          <span className="font-bold text-purple-400 block text-[11px] uppercase font-mono">Why This Matters:</span>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-2">
                            {tech.whyTrending || 'Experiencing accelerating multi-source adoption across production frameworks.'}
                          </p>
                        </div>
                        <div>
                          <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono">Who Should Care:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {['Software Engineers', 'System Architects', 'Researchers'].map((role, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">{role}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs font-mono text-slate-400">{tech.sources} sources</div>
                      <button onClick={() => toggleWatchlist(tech.id)} className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition cursor-pointer">
                        {isWatching(tech.id) ? 'Watching' : '+ Watch'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION B: Cooling & Sunset Technologies (Shown if all or falling) */}
        {trendDirectionFilter !== 'rising' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h2 className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">
                  Cooling & Sunset Technologies (Deprecation Radar)
                </h2>
              </div>
              <span className="text-[11px] font-mono text-rose-400">Contraction phase</span>
            </div>
            {loadingTechs ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topFalling.map((tech) => (
                  <div key={tech.id} className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-rose-500/30 shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">{tech.category}</span>
                        <span className="text-xs font-mono font-bold text-rose-400 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          {tech.growth}% ({timeframe})
                        </span>
                      </div>
                      <Link href={`/technologies/${tech.slug}`} className="text-xl font-bold text-slate-900 dark:text-white hover:text-rose-400 transition">
                        {tech.name}
                      </Link>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{tech.description}</p>
                      
                      {/* Decline Reason */}
                      <div className="mt-4 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-2">
                        <div>
                          <span className="font-bold text-rose-400 block text-[11px] uppercase font-mono">Why It's Cooling Down:</span>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-2">
                            {tech.declineReason || tech.whyTrending || 'Losing market share to modern alternatives and framework deprecation.'}
                          </p>
                        </div>
                        {tech.replacedBy && tech.replacedBy.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-400 block text-[10px] uppercase font-mono">What Replaces It:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {tech.replacedBy.map((item, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                                  → {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-xs font-mono text-slate-400"><TrendBadge status={tech.status} /></div>
                      <button onClick={() => toggleWatchlist(tech.id)} className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition cursor-pointer">
                        {isWatching(tech.id) ? 'Watching' : '+ Monitor'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION C: Velocity Shifts (Fastest Growing vs Sharpest Declines) */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-2">
              {velocityMode === 'rising' ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-400" />
              )}
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {velocityMode === 'rising'
                  ? `Fastest Growing Technologies — ${timeframe.toUpperCase()}`
                  : `Sharpest Contractions & Declines — ${timeframe.toUpperCase()}`}
              </h3>
            </div>

            {/* Velocity Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setVelocityMode('rising')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  velocityMode === 'rising'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Fastest Growing</span>
              </button>
              <button
                type="button"
                onClick={() => setVelocityMode('falling')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  velocityMode === 'falling'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Sharpest Declines</span>
              </button>
            </div>
          </div>

          {loadingTechs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
            </div>
          ) : velocityMode === 'rising' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {fastestGrowing.map((t) => (
                <div key={t.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Link href={`/technologies/${t.slug}`} className="font-bold text-slate-900 dark:text-white hover:text-cyan-400 truncate">{t.name}</Link>
                    <span className="font-mono font-bold text-emerald-400 ml-1 flex-shrink-0">+{t.growth}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min(100, Math.max(10, t.growth))}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Score: {t.trendScore}/100</span>
                    <span>{t.mentions.toLocaleString()} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sharpestDeclines.map((t) => (
                <div key={t.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Link href={`/technologies/${t.slug}`} className="font-bold text-slate-900 dark:text-white hover:text-rose-400 truncate">{t.name}</Link>
                    <span className="font-mono font-bold text-rose-400 ml-1 flex-shrink-0">{t.growth}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-700" style={{ width: `${Math.min(100, Math.max(10, Math.abs(t.growth)))}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Score: {t.trendScore}/100</span>
                    <span className="text-rose-400/90 font-semibold">{t.status.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trend Matrix Table */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Technology Trend Matrix</span>
                <span className="text-xs font-mono text-slate-400 font-normal">({filteredTechs.length} technologies)</span>
              </h3>
              
              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
                <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Domains' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Lifecycle Status Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px] mr-1 flex-shrink-0">Lifecycle:</span>
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] capitalize whitespace-nowrap transition cursor-pointer ${
                    statusFilter === st
                      ? st === 'falling' || st === 'declining'
                        ? 'bg-rose-500 text-white font-bold shadow-sm'
                        : 'bg-cyan-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all'
                    ? 'All Stages'
                    : st === 'falling'
                    ? '📉 Falling'
                    : st === 'declining'
                    ? '⚠️ Declining'
                    : st === 'rising'
                    ? '🔥 Rising'
                    : st}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
            {loadingTechs ? (
              <div className="p-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
              </div>
            ) : filteredTechs.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-slate-400 text-sm">No technologies found matching current matrix filters.</p>
                <button
                  onClick={() => { setCategoryFilter('all'); setStatusFilter('all'); setTrendDirectionFilter('all'); }}
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600 transition cursor-pointer"
                >
                  Reset Matrix Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th
                        onClick={() => handleSort('rank')}
                        className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition select-none"
                      >
                        Rank {sortColumn === 'rank' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-3.5 px-4 font-semibold">Technology</th>
                      <th className="py-3.5 px-4 font-semibold">Category</th>
                      <th
                        onClick={() => handleSort('score')}
                        className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition select-none"
                      >
                        Trend Score {sortColumn === 'score' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th
                        onClick={() => handleSort('mentions')}
                        className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition select-none"
                      >
                        Mentions {sortColumn === 'mentions' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-3.5 px-4 font-semibold">Sources</th>
                      <th
                        onClick={() => handleSort('growth')}
                        className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white transition select-none"
                      >
                        Growth ({timeframe}) {sortColumn === 'growth' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                      </th>
                      <th className="py-3.5 px-4 font-semibold">Lifecycle Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredTechs.map((tech, index) => {
                      const watching = isWatching(tech.id);
                      const isNegative = tech.growth < 0 || tech.status === 'declining' || tech.status === 'falling';
                      return (
                        <tr key={tech.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition group">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{index + 1}</td>
                          <td className="py-3.5 px-4">
                            <Link href={`/technologies/${tech.slug}`} className={`font-bold transition ${isNegative ? 'text-slate-900 dark:text-white group-hover:text-rose-400' : 'text-slate-900 dark:text-white group-hover:text-cyan-400'}`}>
                              {tech.name}
                            </Link>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{tech.description}</div>
                            {tech.replacedBy && tech.replacedBy.length > 0 && (
                              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                                Replaced by: {tech.replacedBy.join(', ')}
                              </div>
                            )}
                            {tech.declineReason && (
                              <div className="text-[10px] text-rose-400/90 font-mono mt-0.5 line-clamp-1">
                                ⚠ {tech.declineReason}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{tech.category}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{tech.trendScore}</span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isNegative ? 'bg-rose-500' : 'bg-cyan-500'}`}
                                  style={{ width: `${tech.trendScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{tech.mentions.toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{tech.sources}</td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className={`flex items-center gap-0.5 ${tech.growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {tech.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {formatGrowth(tech.growth)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4"><TrendBadge status={tech.status} /></td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => toggleWatchlist(tech.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                watching
                                  ? isNegative
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-cyan-500 text-white'
                                  : isNegative
                                  ? 'border border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                                  : 'border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-cyan-500 hover:text-cyan-400'
                              }`}
                            >
                              {watching ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              {watching ? 'Watching' : isNegative ? 'Monitor' : 'Follow'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Live News */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Newspaper className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Industry Coverage</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                Reuters · BBC · Digital Trends · Google News
              </div>
            </div>
            <button onClick={fetchNews} disabled={loadingNews} className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition">
              {loadingNews ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Refresh
            </button>
          </div>
          {loadingNews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
            </div>
          ) : liveNews.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
              <p className="text-slate-400 text-sm">Could not load live news. Check your connection.</p>
              <button onClick={fetchNews} className="mt-2 text-xs text-cyan-400 hover:underline">Retry</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveNews.map((article) => (
                <a key={article.id} href={article.url} target="_blank" rel="noopener noreferrer"
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-bold font-mono ${SOURCE_COLORS[article.source.id] ?? 'text-cyan-400'}`}>{article.source.name}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />{timeAgo(article.publishedAt)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition line-clamp-2 leading-snug">{article.title}</h4>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{article.summary}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60">
                    <div className="flex flex-wrap gap-1">
                      {article.technologies.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">{t}</span>
                      ))}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
