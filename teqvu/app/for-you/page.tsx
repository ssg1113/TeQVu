'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Compass, CheckCircle2, SlidersHorizontal, RefreshCw, Radio, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { articles as initialArticles } from '../../lib/mock-data/articles';
import { technologies as initialTechs } from '../../lib/mock-data/technologies';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { TechCard } from '../../components/cards/TechCard';
import { useAppStore } from '../../lib/store/useAppStore';
import type { Article, Technology } from '../../lib/types';

export default function ForYouPage() {
  const { interests, watchlistIds } = useAppStore();
  const [articlesList, setArticlesList] = useState<Article[]>(initialArticles);
  const [techList, setTechList] = useState<Technology[]>(initialTechs);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  const fetchLiveData = useCallback(async () => {
    setLoading(true);
    try {
      const [newsRes, trendsRes] = await Promise.all([
        fetch('/api/news').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/trends').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (newsRes?.success && Array.isArray(newsRes.articles) && newsRes.articles.length > 0) {
        setArticlesList(newsRes.articles);
        setIsLive(true);
      }
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.warn('Could not fetch live algorithmic recommendations.', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    // Auto refresh every 1 hour
    const interval = setInterval(fetchLiveData, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const recommended = articlesList.slice(0, 3);
  const aiArticles = articlesList.filter(
    (a) =>
      a.category.toLowerCase().includes('ai') ||
      a.technologies.some((t) => t.toLowerCase().includes('ai') || t.toLowerCase().includes('llm'))
  );
  const webArticles = articlesList.filter(
    (a) =>
      a.category.toLowerCase().includes('developer') ||
      a.category.toLowerCase().includes('language') ||
      a.category.toLowerCase().includes('system') ||
      a.category.toLowerCase().includes('software')
  );
  const emergingTechs = techList.filter((t) => t.status === 'emerging' || t.growth > 80).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Algorithmic Curation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalized Feed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated dynamically from live feeds based on your interests ({interests.length} topics) and watchlist ({watchlistIds.length} tracked).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Feed Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>{isLive ? 'Live Ingestion Engine' : 'Cached Feed'}</span>
              <span className="text-slate-500">• {lastUpdated}</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={fetchLiveData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>Sync</span>
            </button>

            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-cyan-500/50 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Tune Engine</span>
            </Link>
          </div>
        </div>

        {/* 1. TOP RECOMMENDED */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Primary Recommendations (Live Stream)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(recommended.length > 0 ? recommended : articlesList.slice(0, 3)).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>

        {/* 2. BECAUSE YOU FOLLOW AI */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-purple-400 font-mono text-xs uppercase bg-purple-500/10 px-2 py-0.5 rounded">
                Topic Match
              </span>
              <span>Because You Follow Artificial Intelligence</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(aiArticles.length > 0 ? aiArticles : articlesList).slice(0, 2).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>

        {/* 3. EMERGING TOPICS YOU MAY LIKE */}
        <section className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Emerging Signals Adjacent to Your Stack
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Technologies with spiking velocity not yet in your watchlist.
              </p>
            </div>
            <Link
              href="/trending"
              className="text-xs font-semibold text-cyan-400 hover:underline"
            >
              Explore All Signals →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergingTechs.map((tech) => (
              <TechCard key={tech.id} tech={tech} />
            ))}
          </div>
        </section>

        {/* 4. BECAUSE YOU FOLLOW SYSTEMS & WEB DEV */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-cyan-400 font-mono text-xs uppercase bg-cyan-500/10 px-2 py-0.5 rounded">
                Domain Match
              </span>
              <span>Because You Follow Web & Systems Development</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(webArticles.length > 0 ? webArticles : articlesList).slice(0, 2).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
