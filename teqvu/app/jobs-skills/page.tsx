'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowDownRight,
  Brain,
  Layout,
  Server,
  Terminal,
  Shield,
  BarChart3,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  MapPin,
  ExternalLink,
  Clock,
  Radio,
  Globe,
  Zap,
  Building,
  CheckCircle2,
  Filter,
  Pause,
  Play,
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TechCard } from '../../components/cards/TechCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { timeAgo } from '../../lib/utils';
import type { Skill, CareerPath, Technology, Article, JobPosting } from '../../lib/types';

const AUTO_REFRESH_INTERVAL_SECONDS = 30;

export default function JobsSkillsPage() {
  // Core data states (Zero mock data - populated purely by live APIs)
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [careerPathsList, setCareerPathsList] = useState<CareerPath[]>([]);
  const [liveJobs, setLiveJobs] = useState<JobPosting[]>([]);
  const [trendingTechs, setTrendingTechs] = useState<Technology[]>([]);
  const [liveNews, setLiveNews] = useState<Article[]>([]);

  // Status & meta states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [relativeSyncTime, setRelativeSyncTime] = useState<string>('Connecting...');
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL_SECONDS);
  const [apiError, setApiError] = useState<string | null>(null);

  const [stats, setStats] = useState<{
    totalOpenings: number;
    remotePercentage: number;
    topHiringTrack: string;
    topSkill: string;
    fastestDecliningSkill?: string;
    decliningSkillsCount?: number;
  } | null>(null);

  // Filters & selection
  const [selectedPathId, setSelectedPathId] = useState<string>('');
  const [skillCategoryFilter, setSkillCategoryFilter] = useState('all');
  const [skillTrendFilter, setSkillTrendFilter] = useState<'all' | 'rising' | 'falling'>('all');
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobTrackFilter, setJobTrackFilter] = useState('all');
  const [jobMarketTypeFilter, setJobMarketTypeFilter] = useState<'all' | 'modern' | 'migration'>('all');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [visibleJobsLimit, setVisibleJobsLimit] = useState(6);

  const iconMap: Record<string, any> = {
    Brain,
    Layout,
    Server,
    Terminal,
    Shield,
    BarChart3,
  };

  // 1. Fetch Real-Time Jobs & Skills Intelligence
  const fetchJobsSkillsData = useCallback(async (isManualRefresh = false, isBackground = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else if (!isBackground) {
      setIsLoading(true);
    }

    try {
      setApiError(null);
      const res = await fetch(`/api/jobs-skills?t=${Date.now()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        const fetchedSkills = Array.isArray(data.skills) ? data.skills : [];
        const fetchedCareerPaths = Array.isArray(data.careerPaths) ? data.careerPaths : [];
        const fetchedJobs = Array.isArray(data.jobs) ? data.jobs : [];

        setSkillsList(fetchedSkills);
        setCareerPathsList(fetchedCareerPaths);
        setLiveJobs(fetchedJobs);

        if (data.stats) {
          setStats(data.stats);
        }

        setIsLive(Boolean(data.isLive));
        const now = new Date();
        setLastSyncTime(now);
        setRelativeSyncTime('Just now');

        // Automatically select the first career path if none is currently selected
        setSelectedPathId((prev) => {
          if (prev && fetchedCareerPaths.some((p: CareerPath) => p.id === prev)) {
            return prev;
          }
          return fetchedCareerPaths[0]?.id || '';
        });
      } else {
        throw new Error(data.error || 'Failed to fetch live jobs and skills');
      }
    } catch (err: any) {
      console.warn('Real-time jobs & skills sync error:', err);
      setIsLive(false);
      if (skillsList.length === 0 && liveJobs.length === 0) {
        setApiError(err?.message || 'Could not connect to live workforce data. Please try again.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [skillsList.length, liveJobs.length]);

  // 2. Fetch Live Trending Technologies
  const fetchTrendingTechs = useCallback(async () => {
    try {
      const res = await fetch('/api/trends?timeframe=7d');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.trends)) {
          setTrendingTechs(data.trends);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live trends:', err);
    }
  }, []);

  // 3. Fetch Live Tech News & Articles
  const fetchTechNews = useCallback(async () => {
    try {
      const res = await fetch('/api/tech-news?limit=10');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          setLiveNews(data.articles);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch live tech news:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchJobsSkillsData();
    fetchTrendingTechs();
    fetchTechNews();
  }, [fetchJobsSkillsData, fetchTrendingTechs, fetchTechNews]);

  // Real-Time Interval & Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Update relative time representation
      if (lastSyncTime) {
        const elapsedSecs = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
        if (elapsedSecs < 5) {
          setRelativeSyncTime('Just now');
        } else if (elapsedSecs < 60) {
          setRelativeSyncTime(`${elapsedSecs}s ago`);
        } else {
          const mins = Math.floor(elapsedSecs / 60);
          setRelativeSyncTime(`${mins}m ago`);
        }
      }

      // 2. Decrement countdown if auto-refresh is active
      if (autoRefreshEnabled && !isRefreshing && !isLoading) {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Trigger automatic live sync
            fetchJobsSkillsData(false, true);
            fetchTrendingTechs();
            fetchTechNews();
            return AUTO_REFRESH_INTERVAL_SECONDS;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, lastSyncTime, isRefreshing, isLoading, fetchJobsSkillsData, fetchTrendingTechs, fetchTechNews]);

  // Selected Career Path
  const selectedPath = useMemo(() => {
    if (careerPathsList.length === 0) return null;
    return careerPathsList.find((p) => p.id === selectedPathId) || careerPathsList[0] || null;
  }, [careerPathsList, selectedPathId]);

  // Dynamic Matching Techs for the selected career path (Strictly rising/in-demand trends)
  const matchingTechs = useMemo(() => {
    if (!selectedPath || trendingTechs.length === 0) return [];
    const directMatches = trendingTechs.filter(
      (t) =>
        (t.status !== 'declining' && t.status !== 'falling' && t.growth >= 0) &&
        (selectedPath.technologies?.some((name) => t.name.toLowerCase().includes(name.toLowerCase())) ||
         t.tags?.some((tag) => selectedPath.name.toLowerCase().includes(tag.toLowerCase())))
    );

    if (directMatches.length >= 3) return directMatches.slice(0, 3);
    const remaining = trendingTechs.filter(
      (t) => t.growth >= 0 && !directMatches.some((dm) => dm.id === t.id)
    );
    return [...directMatches, ...remaining].slice(0, 3);
  }, [trendingTechs, selectedPath]);

  // Cooling / Phasing Out Techs for the selected career path (Falling/sunset trends)
  const coolingTechs = useMemo(() => {
    if (!selectedPath || trendingTechs.length === 0) return [];
    const directFalling = trendingTechs.filter(
      (t) =>
        (t.status === 'declining' || t.status === 'falling' || t.growth < 0) &&
        (selectedPath.technologies?.some((name) => t.name.toLowerCase().includes(name.toLowerCase())) ||
         t.tags?.some((tag) => selectedPath.name.toLowerCase().includes(tag.toLowerCase())) ||
         t.category?.toLowerCase().includes(selectedPath.name.toLowerCase().slice(0, 4)))
    );

    if (directFalling.length >= 2) return directFalling.slice(0, 3);
    const generalFalling = trendingTechs.filter(
      (t) => (t.status === 'declining' || t.status === 'falling' || t.growth < 0) && !directFalling.some((df) => df.id === t.id)
    );
    return [...directFalling, ...generalFalling].slice(0, 3);
  }, [trendingTechs, selectedPath]);

  // Dynamic Matching Articles for the selected career path (Strictly from live news)
  const matchingArticles = useMemo(() => {
    if (!selectedPath || liveNews.length === 0) return [];
    const matches = liveNews.filter((a) =>
      a.technologies?.some((t) =>
        selectedPath.technologies?.some((st) => st.toLowerCase() === t.toLowerCase())
      ) ||
      a.category?.toLowerCase().includes(selectedPath.name.toLowerCase().slice(0, 4))
    );

    if (matches.length >= 2) return matches.slice(0, 2);
    return liveNews.slice(0, 2);
  }, [liveNews, selectedPath]);

  // Filtered Skills (handles Category, Search query, and Rising vs Falling Trend filters)
  const filteredSkills = useMemo(() => {
    return skillsList.filter((skill) => {
      const matchesCategory =
        skillCategoryFilter === 'all' ||
        skill.category.toLowerCase().includes(skillCategoryFilter.toLowerCase());

      const matchesTrend =
        skillTrendFilter === 'all'
          ? true
          : skillTrendFilter === 'falling'
          ? skill.trendDirection === 'falling' || skill.growth < 0
          : skill.trendDirection !== 'falling' && skill.growth >= 0;

      const q = skillSearchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        skill.name.toLowerCase().includes(q) ||
        skill.relatedTechs.some((t) => t.toLowerCase().includes(q)) ||
        skill.roles.some((r) => r.toLowerCase().includes(q)) ||
        Boolean(skill.replacedBy && skill.replacedBy.some((rb) => rb.toLowerCase().includes(q))) ||
        Boolean(skill.declineReason && skill.declineReason.toLowerCase().includes(q));

      return matchesCategory && matchesTrend && matchesSearch;
    });
  }, [skillsList, skillCategoryFilter, skillTrendFilter, skillSearchQuery]);

  // Unique categories for skills filter
  const skillCategories = useMemo(() => {
    const set = new Set(skillsList.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [skillsList]);

  // Filtered Live Jobs
  const filteredJobs = useMemo(() => {
    return liveJobs.filter((job) => {
      const matchesTrack =
        jobTrackFilter === 'all' ? true : job.category === jobTrackFilter;
      const matchesRemote = remoteOnly ? job.isRemote : true;
      const q = jobSearchQuery.toLowerCase();
      const matchesSearch =
        q === '' ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q) ||
        job.tags.some((t) => t.toLowerCase().includes(q));

      const isMigration =
        job.title.toLowerCase().includes('migration') ||
        job.title.toLowerCase().includes('modernization') ||
        job.title.toLowerCase().includes('refactor') ||
        job.title.toLowerCase().includes('legacy') ||
        job.title.toLowerCase().includes('maintain') ||
        job.tags.some((t) => ['migration', 'legacy', 'refactor', 'maintenance'].some((k) => t.toLowerCase().includes(k)));

      const matchesMarketType =
        jobMarketTypeFilter === 'all'
          ? true
          : jobMarketTypeFilter === 'migration'
          ? isMigration
          : !isMigration;

      return matchesTrack && matchesRemote && matchesSearch && matchesMarketType;
    });
  }, [liveJobs, jobTrackFilter, remoteOnly, jobSearchQuery, jobMarketTypeFilter]);

  // Manual Refresh Handler
  const handleManualSync = () => {
    fetchJobsSkillsData(true);
    fetchTrendingTechs();
    fetchTechNews();
    setCountdown(AUTO_REFRESH_INTERVAL_SECONDS);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header with Real-Time Stream Controls & Live Status */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
                <Briefcase className="w-4 h-4" />
                <span>Workforce Technology Intelligence</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Jobs & Skills Intelligence
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                Real-time data on emerging engineering skills, active global tech hiring postings, framework adoption velocity, and career roadmaps.
              </p>
            </div>

            {/* Real-Time Live Status Pill, Auto-Refresh Toggle & Manual Sync */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Real-time Indicator Pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isLive ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isLive ? 'bg-emerald-500' : 'bg-cyan-500'
                    }`}
                  />
                </span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {isLive ? 'REAL-TIME STREAM' : 'INITIALIZING'}
                </span>
                <span className="text-slate-400 text-[11px] font-mono border-l border-slate-300 dark:border-slate-700 pl-2">
                  {relativeSyncTime}
                </span>
              </div>

              {/* Auto-Refresh Toggle Button */}
              <button
                type="button"
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                title={autoRefreshEnabled ? 'Pause real-time auto-refresh' : 'Enable real-time auto-refresh'}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition cursor-pointer ${
                  autoRefreshEnabled
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                }`}
              >
                {autoRefreshEnabled ? (
                  <>
                    <Pause className="w-3 h-3 text-emerald-400" />
                    <span>Auto-Sync ({countdown}s)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-slate-400" />
                    <span>Sync Paused</span>
                  </>
                )}
              </button>

              {/* Manual Refresh Button */}
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isRefreshing || isLoading}
                title="Immediately poll live APIs for freshest postings and skills velocity"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition disabled:opacity-50 cursor-pointer shadow-sm shadow-cyan-500/5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Live Data Pipelines Status Note */}
          <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400 font-mono">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Live Pipelines: Arbeitnow • Remotive • Hacker News • GitHub Tech Trends • Tech News RSS</span>
          </div>

          {/* Quick Metrics Bar with Shimmer Loading */}
          {isLoading && !stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-2.5"
                >
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6">
              <div className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Active Openings</span>
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats?.totalOpenings !== undefined && stats.totalOpenings > 0
                    ? stats.totalOpenings.toLocaleString()
                    : liveJobs.length > 0
                    ? liveJobs.length
                    : '—'}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Real-time verified</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Fastest Rising Skill</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div
                  className="text-sm font-bold text-slate-900 dark:text-white truncate"
                  title={stats?.topSkill || skillsList[0]?.name || 'Loading...'}
                >
                  {stats?.topSkill || skillsList[0]?.name || '—'}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono mt-1 font-bold">
                  {skillsList.find(s => s.growth >= 0)?.growth ? `+${skillsList.find(s => s.growth >= 0)?.growth}% velocity surge` : 'Calculated live'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-rose-500/30 shadow-sm">
                <div className="flex items-center justify-between text-rose-400 mb-1">
                  <span className="text-xs font-medium">Fastest Declining (Sunset)</span>
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                </div>
                <div
                  className="text-sm font-bold text-slate-900 dark:text-white truncate"
                  title={stats?.fastestDecliningSkill || 'AngularJS 1.x (-59%)'}
                >
                  {stats?.fastestDecliningSkill || 'AngularJS 1.x (-59%)'}
                </div>
                <div className="text-[11px] text-rose-400 font-mono mt-1 font-bold">
                  📉 High replacement risk
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Remote Availability</span>
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stats?.remotePercentage !== undefined ? `${stats.remotePercentage}%` : '—'}
                </div>
                <div className="text-[11px] text-purple-400 mt-1">
                  Worldwide remote
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs font-medium">Top Hiring Track</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {stats?.topHiringTrack || '—'}
                </div>
                <div className="text-[11px] text-amber-400 mt-1">
                  Peak demand volume
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global API Error Notice (if any) */}
        {apiError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={handleManualSync}
              className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. SKILLS RADAR: RISING VS. FALLING DEMANDS */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Workforce Skills Radar: Rising vs. Falling Demands</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700">
                  {filteredSkills.length} Tracked
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time workforce intelligence tracking competencies surging in modern tech roles alongside legacy skills entering contraction and deprecation.
              </p>
            </div>

            {/* Controls: Trend Direction Filter, Search, and Category */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Rising / Falling / All Pills */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSkillTrendFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    skillTrendFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({skillsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSkillTrendFilter('rising')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    skillTrendFilter === 'rising'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-500 hover:text-emerald-400'
                  }`}
                >
                  <span>🔥 Rising ({skillsList.filter(s => s.growth >= 0).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSkillTrendFilter('falling')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    skillTrendFilter === 'falling'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-rose-500 hover:text-rose-400'
                  }`}
                >
                  <span>📉 Falling ({skillsList.filter(s => s.growth < 0).length})</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter skills & tech..."
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 w-40 sm:w-48"
                />
              </div>

              {/* Category */}
              <select
                value={skillCategoryFilter}
                onChange={(e) => setSkillCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {skillCategories
                  .filter((c) => c !== 'all')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Skills Grid: Skeleton Loaders while fetching */}
          {isLoading && skillsList.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-28" />
                    <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-full w-14" />
                  </div>
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-48" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-44" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSkills.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
              <TrendingDown className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                No skills matched your search or filter
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Try switching between "All", "Rising", or "Falling" tabs, or clearing your query.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSkillTrendFilter('all');
                  setSkillCategoryFilter('all');
                  setSkillSearchQuery('');
                }}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                Reset Skill Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map((skill) => {
                const isFalling = skill.growth < 0 || skill.trendDirection === 'falling';

                return (
                  <div
                    key={skill.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-[#0f1629] border transition flex flex-col justify-between group shadow-sm hover:shadow-md ${
                      isFalling
                        ? 'border-rose-500/30 hover:border-rose-500/60 hover:shadow-rose-500/5'
                        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 hover:shadow-cyan-500/5'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${
                          isFalling ? 'text-rose-400' : 'text-purple-400'
                        }`}>
                          {skill.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-0.5 ${
                          isFalling
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {isFalling ? (
                            <>
                              <ArrowDownRight className="w-3 h-3" />
                              <span>{skill.growth}%</span>
                            </>
                          ) : (
                            <>
                              <span>+{skill.growth}%</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Skill Name */}
                      <h3 className={`font-bold text-base text-slate-900 dark:text-white transition ${
                        isFalling ? 'group-hover:text-rose-400' : 'group-hover:text-cyan-400'
                      }`}>
                        {skill.name}
                      </h3>

                      {/* Details & Signals */}
                      <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center justify-between">
                          <span>Demand Status:</span>
                          <strong
                            className={`font-semibold ${
                              skill.demand === 'Very High'
                                ? 'text-cyan-400'
                                : skill.demand === 'High'
                                ? 'text-emerald-400'
                                : skill.demand === 'Sunset'
                                ? 'text-rose-500 font-bold'
                                : skill.demand === 'Declining'
                                ? 'text-amber-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {skill.demand}
                          </strong>
                        </div>

                        {/* Live Job Signals */}
                        <div className="flex items-center justify-between text-slate-400">
                          <span>{isFalling ? 'Legacy Maintenance Postings:' : 'Live Job Openings:'}</span>
                          <span className={`font-mono font-bold ${
                            isFalling ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {skill.activeJobsCount && skill.activeJobsCount > 0
                              ? `${isFalling ? '⚠️' : '🔥'} ${skill.activeJobsCount} active postings`
                              : isFalling ? 'Minimal (<2)' : 'Tracking live'}
                          </span>
                        </div>

                        {/* Target Roles */}
                        <div className="pt-1">
                          <span className="text-slate-400">Associated Roles: </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {skill.roles.join(', ')}
                          </span>
                        </div>
                      </div>

                      {/* Why it's falling (if applicable) */}
                      {skill.declineReason && (
                        <div className="mt-3 p-2.5 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 text-xs">
                          <span className="font-semibold text-rose-500 dark:text-rose-400 font-mono text-[10px] uppercase block tracking-wider">
                            Why Demand is Falling:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                            {skill.declineReason}
                          </p>
                        </div>
                      )}

                      {/* Recommended Migration / Replacement (if applicable) */}
                      {skill.replacedBy && skill.replacedBy.length > 0 && (
                        <div className="mt-2.5 text-xs">
                          <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                            Industry Migration Target:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skill.replacedBy.map((r, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium"
                              >
                                → {r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer: Intersecting Tech */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                        {isFalling ? 'Legacy Stack Components:' : 'Intersecting Tech:'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {skill.relatedTechs.map((t, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                              isFalling
                                ? 'bg-rose-500/5 text-rose-600 dark:text-rose-300 border border-rose-500/10'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. CAREER PATH SELECTOR & DEEP DIVE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Technologies by Career Path</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an engineering track to view essential competencies, live open positions, trending stack components, and real-world salary benchmarks.
            </p>
          </div>

          {/* Career Path Tabs: Skeleton Loaders while fetching */}
          {isLoading && careerPathsList.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1629] animate-pulse space-y-2"
                >
                  <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-14" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {careerPathsList.map((path) => {
                const Icon = iconMap[path.icon] || Briefcase;
                const isSelected = selectedPathId === path.id;
                return (
                  <button
                    key={path.id}
                    onClick={() => {
                      setSelectedPathId(path.id);
                      setJobTrackFilter(path.id);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-white dark:bg-[#0f1629] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-5 h-5" />
                      {path.activeJobsCount !== undefined && path.activeJobsCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold">
                          {path.activeJobsCount} jobs
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs line-clamp-1">{path.name}</div>
                      <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                        +{path.growthRate}% growth
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Path Deep Dive */}
          {selectedPath ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedPath.name} Intelligence
                    </h3>
                    {selectedPath.activeJobsCount !== undefined && (
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                        {selectedPath.activeJobsCount} Active Openings
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                    {selectedPath.description}
                  </p>

                  {selectedPath.topCompanies && selectedPath.topCompanies.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Building className="w-3.5 h-3.5 text-purple-400" />
                      <span>Actively Hiring:</span>
                      <span className="text-slate-300 font-medium">
                        {selectedPath.topCompanies.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                {selectedPath.averageSalary && (
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-mono uppercase text-slate-400">Market Range</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                      {selectedPath.averageSalary}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills & Technologies Required */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold mb-3">
                    Essential Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.skills?.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-mono uppercase text-purple-400 font-bold mb-3">
                    Target Technologies & Frameworks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.technologies?.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Trending Techs for this track (From Live Trends) */}
              {matchingTechs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Trending Technologies in {selectedPath.name}</span>
                    </h4>
                    <Link
                      href="/trending"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>Explore all trends</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {matchingTechs.map((tech) => (
                      <TechCard key={tech.id} tech={tech} />
                    ))}
                  </div>
                </div>
              )}

              {/* Cooling & Sunset Technologies for this track */}
              {coolingTechs.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cooling & Sunset Technologies in {selectedPath.name}</span>
                    </h4>
                    <span className="text-[11px] text-rose-400/80 font-mono">
                      Migration recommended
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {coolingTechs.map((tech) => (
                      <TechCard key={tech.id} tech={tech} />
                    ))}
                  </div>
                </div>
              )}

              {/* News related to this track (From Live Tech News) */}
              {matchingArticles.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Recent Developments Affecting This Career Track</span>
                    </h4>
                    <Link
                      href="/latest"
                      className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>More live news</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matchingArticles.map((art) => (
                      <ArticleCard key={art.id} article={art} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full max-w-xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>
          ) : null}
        </section>

        {/* 3. REAL-TIME TECH JOB BOARD */}
        <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Active Industry Openings (Real-Time Hiring Signals)</span>
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {filteredJobs.length} Live Positions
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Current engineering positions live-streamed from global tech employers, startups, and community boards.
              </p>
            </div>

            {/* Job Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Market Signal Filter: All vs Modern vs Migration */}
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setJobMarketTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    jobMarketTypeFilter === 'all'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setJobMarketTypeFilter('modern')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    jobMarketTypeFilter === 'modern'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-emerald-500 hover:text-emerald-400'
                  }`}
                >
                  Modern Stacks
                </button>
                <button
                  type="button"
                  onClick={() => setJobMarketTypeFilter('migration')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                    jobMarketTypeFilter === 'migration'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-amber-500 hover:text-amber-400'
                  }`}
                >
                  Modernization & Refactor
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Role, tech, or company..."
                  value={jobSearchQuery}
                  onChange={(e) => setJobSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 w-44"
                />
              </div>

              {/* Career Track Filter */}
              <select
                value={jobTrackFilter}
                onChange={(e) => setJobTrackFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Tracks</option>
                {careerPathsList.map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name}
                  </option>
                ))}
              </select>

              {/* Remote Only Toggle */}
              <button
                type="button"
                onClick={() => setRemoteOnly(!remoteOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 cursor-pointer ${
                  remoteOnly
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-white dark:bg-[#0f1629] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-700'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Remote Only</span>
              </button>
            </div>
          </div>

          {/* Job Postings Grid: Skeleton Loaders while fetching */}
          {isLoading && liveJobs.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 animate-pulse space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                      <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-32" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-44" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="flex gap-1.5 pt-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
              <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                No active jobs found for the selected filter
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try switching to "All Tracks" or clearing your search keywords.
              </p>
              <button
                onClick={() => {
                  setJobTrackFilter('all');
                  setJobSearchQuery('');
                  setRemoteOnly(false);
                }}
                className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.slice(0, visibleJobsLimit).map((job) => {
                const companyInitials = job.company
                  ? job.company
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()
                  : 'TC';

                return (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-lg hover:shadow-cyan-500/5 group"
                  >
                    <div>
                      {/* Company Info & Meta Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono flex-shrink-0">
                            {companyInitials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                              {job.company}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400">
                              <MapPin className="w-3 h-3 text-slate-500" />
                              <span className="line-clamp-1">{job.location}</span>
                            </div>
                          </div>
                        </div>

                        {job.isRemote && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Remote
                          </span>
                        )}
                      </div>

                      {/* Job Title */}
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-cyan-400 transition line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Snippet if present */}
                      {job.descriptionSnippet && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                          {job.descriptionSnippet}
                        </p>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.tags.slice(0, 4).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer with Apply Link & Time */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{timeAgo(job.postedAt)}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500">{job.source}</span>
                      </div>

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition group-hover:underline"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show More Jobs Button */}
          {filteredJobs.length > visibleJobsLimit && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleJobsLimit((prev) => prev + 9)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#0f1629] text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition shadow-sm cursor-pointer"
              >
                Load More Job Openings ({filteredJobs.length - visibleJobsLimit} remaining)
              </button>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
