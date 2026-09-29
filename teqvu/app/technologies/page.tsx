'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Compass,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Radio,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { technologies as fallbackTechs } from '../../lib/mock-data/technologies';
import { TechCard } from '../../components/cards/TechCard';
import type { Technology } from '../../lib/types';

export default function TechnologiesPage() {
  const [techList, setTechList] = useState<Technology[]>(fallbackTechs);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'rising' | 'falling'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'growth' | 'decline' | 'mentions'>('score');
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const fetchLiveTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trends');
      if (res.ok) {
        const data = await res.json();
        if (data.technologies && Array.isArray(data.technologies) && data.technologies.length > 0) {
          setTechList(data.technologies);
          setIsLive(true);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Could not fetch live technologies, using cached index.', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTechs();
    const interval = setInterval(fetchLiveTechs, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveTechs]);

  const categories = [
    'All',
    'AI/ML',
    'Languages',
    'Frameworks',
    'Databases',
    'Cloud',
    'DevOps',
    'Developer Tools',
    'Systems',
    'Mobile',
  ];

  const statuses = ['All', 'emerging', 'rising', 'trending', 'stable', 'declining', 'falling'];

  const risingCount = techList.filter((t) => t.growth >= 0 && t.status !== 'declining' && t.status !== 'falling').length;
  const fallingCount = techList.filter((t) => t.growth < 0 || t.status === 'declining' || t.status === 'falling').length;

  const filteredTechs = techList
    .filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchStatus = selectedStatus === 'All' || t.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchDirection =
        directionFilter === 'all'
          ? true
          : directionFilter === 'rising'
          ? t.growth >= 0 && t.status !== 'declining' && t.status !== 'falling'
          : t.growth < 0 || t.status === 'declining' || t.status === 'falling';
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())) ||
        (t.replacedBy && t.replacedBy.some((r) => r.toLowerCase().includes(search.toLowerCase())));
      return matchCat && matchStatus && matchDirection && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'growth') return b.growth - a.growth;
      if (sortBy === 'decline') return a.growth - b.growth;
      if (sortBy === 'mentions') return b.mentions - a.mentions;
      return b.trendScore - a.trendScore;
    });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Compass className="w-4 h-4" />
              <span>Full-Spectrum Technology Taxonomy & Radar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Technology Explorer
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Explore tracked technologies across their entire lifecycle — from high-velocity breakthrough arrivals to declining legacy ecosystems facing sunset.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Feed Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>{isLive ? 'Live Ecosystem Stream' : 'Taxonomy Index'}</span>
              <span className="text-slate-500">• {lastUpdated}</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={fetchLiveTechs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* Direction Switcher & High-Level Metrics */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
              Filter Trajectory:
            </span>
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setDirectionFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  directionFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Techs ({techList.length})
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter('rising')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  directionFilter === 'rising'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-emerald-500 hover:text-emerald-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>🔥 Rising ({risingCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setDirectionFilter('falling')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  directionFilter === 'falling'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-rose-500 hover:text-rose-400'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>📉 Falling & Sunset ({fallingCount})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTechs.length}</span> technologies
            </div>
            {directionFilter === 'falling' && (
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                Deprecation Mode Active
              </span>
            )}
          </div>
        </div>

        {/* Informational Deprecation Alert if Falling Filter Active */}
        {directionFilter === 'falling' && (
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-400">Sunset & Deprecation Watchlist Active</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                The technologies displayed below have entered contraction phase, showing steep drops in developer mentions, official end-of-life status, or mass migration toward modern alternatives. Each card displays recommended modern replacement frameworks and migration guidance.
              </p>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search technologies, tags, or migration alternatives (e.g. Next.js, jQuery, Vite)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-slate-400">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="score">Trend Score</option>
                <option value="growth">Highest Growth Velocity (+%)</option>
                <option value="decline">Sharpest Decline / Sunset (-%)</option>
                <option value="mentions">Mentions Count</option>
              </select>
            </div>
          </div>

          {/* Status & Category filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 font-mono text-[11px]">Lifecycle:</span>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2 py-0.5 rounded-md text-[11px] capitalize font-mono transition cursor-pointer ${
                    selectedStatus === status
                      ? status === 'falling' || status === 'declining'
                        ? 'bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40'
                        : 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status === 'falling' ? '📉 Falling' : status === 'declining' ? '⚠️ Declining' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredTechs.length} technologies matching criteria</span>
            <span>Signals refreshed: Continuous</span>
          </div>

          {filteredTechs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
              <p className="text-slate-400 text-sm">No technologies match your current filter settings.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                  setDirectionFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-600 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTechs.map((tech) => (
                <TechCard key={tech.id} tech={tech} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
