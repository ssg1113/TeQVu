'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshCw,
  ExternalLink,
  Clock,
  Loader2,
  Radio,
  Newspaper,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { technologies as fallbackTechs } from '../../lib/mock-data/technologies';
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
  'Databases', 'Cloud', 'DevOps', 'Developer Tools', 'Systems',
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
  const [allTechs, setAllTechs] = useState<Technology[]>(fallbackTechs);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [liveNews, setLiveNews] = useState<Article[]>([]);
  const { isWatching, toggleWatchlist } = useAppStore();

  const fetchTrends = useCallback(async (tf: Timeframe) => {
    setLoadingTechs(true);
    try {
      const res = await fetch(`/api/trends?timeframe=${tf}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.trends) && data.trends.length > 0) {
        setAllTechs(data.trends);
        setIsLive(true);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        const multipliers: Record<Timeframe, number> = {
          '24h': 2.5, '7d': 1, '30d': 0.6, '3m': 0.35, '1y': 0.15,
        };
        const m = multipliers[tf] ?? 1;
        setAllTechs(fallbackTechs.map((t) => ({ ...t, growth: Math.round(t.growth * m) })));
        setIsLive(false);
      }
    } catch {
      setIsLive(false);
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

  const filteredTechs =
    categoryFilter === 'all'
      ? allTechs
      : allTechs.filter((t) => t.category.toLowerCase() === categoryFilter.toLowerCase());

  const topEmerging = allTechs
    .filter((t) => t.status === 'emerging' || t.growth > 60)
    .slice(0, 3);

  const fastestGrowing = [...allTechs].sort((a, b) => b.growth - a.growth).slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{isLive ? 'Live Ecosystem Feeds' : 'Updating Feeds'}</span>
              {lastUpdated && <span className="text-slate-500 text-[10px]">({lastUpdated})</span>}
            </div>
            <button
              onClick={() => { fetchTrends(timeframe); fetchNews(); }}
              disabled={loadingTechs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition disabled:opacity-50"
            >
              {loadingTechs ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Sync</span>
            </button>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => handleTimeframeChange(tf.id)}
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
        </div>

        {/* Emerging Cards */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider font-mono">
              Breakthrough Emerging Technologies
            </h2>
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
                    <button onClick={() => toggleWatchlist(tech.id)} className="px-3 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-white transition">
                      {isWatching(tech.id) ? 'Watching' : '+ Watch'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fastest Growing */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Fastest Growing — {timeframe.toUpperCase()} window</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Normalized Velocity</span>
          </div>
          {loadingTechs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {fastestGrowing.map((t) => (
                <div key={t.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <Link href={`/technologies/${t.slug}`} className="font-bold text-slate-900 dark:text-white hover:text-cyan-400 truncate">{t.name}</Link>
                    <span className="font-mono font-bold text-emerald-400 ml-1 flex-shrink-0">+{t.growth}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700" style={{ width: `${Math.min(100, t.growth)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Score: {t.trendScore}/100</span>
                    <span>{t.mentions.toLocaleString()} mentions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Trend Matrix Table */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Technology Trend Matrix</span>
              <span className="text-xs font-mono text-slate-400 font-normal">({filteredTechs.length} technologies)</span>
            </h3>
            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    categoryFilter === cat
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
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
              <div className="py-16 text-center">
                <p className="text-slate-400 text-sm">No technologies found for this filter.</p>
                <button onClick={() => setCategoryFilter('all')} className="mt-3 text-xs text-cyan-400 hover:underline">Clear filter</button>
              </div>
            ) : (
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
                      <th className="py-3.5 px-4 font-semibold">Growth ({timeframe})</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredTechs.map((tech, index) => {
                      const watching = isWatching(tech.id);
                      return (
                        <tr key={tech.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition group">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{index + 1}</td>
                          <td className="py-3.5 px-4">
                            <Link href={`/technologies/${tech.slug}`} className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-400 transition">{tech.name}</Link>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{tech.description}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{tech.category}</td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white">{tech.trendScore}</span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${tech.trendScore}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{tech.mentions.toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{tech.sources}</td>
                          <td className="py-3.5 px-4 font-mono font-bold">
                            <span className={`flex items-center gap-0.5 ${tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {tech.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {formatGrowth(tech.growth)}
                            </span>
                          </td>
                          <td className="py-3.5 px-4"><TrendBadge status={tech.status} /></td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => toggleWatchlist(tech.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                watching ? 'bg-cyan-500 text-white' : 'border border-slate-200 dark:border-slate-800 text-slate-400 hover:border-cyan-500 hover:text-cyan-400'
                              }`}
                            >
                              {watching ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              {watching ? 'Watching' : 'Follow'}
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
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Live Tech News</h3>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono">
                <Radio className="w-3 h-3 animate-pulse" />
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
