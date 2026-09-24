'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Compass, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { articles } from '../../lib/mock-data/articles';
import { technologies } from '../../lib/mock-data/technologies';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { TechCard } from '../../components/cards/TechCard';
import { useAppStore } from '../../lib/store/useAppStore';

export default function ForYouPage() {
  const { interests, watchlistIds } = useAppStore();

  const recommended = articles.slice(0, 3);
  const aiArticles = articles.filter((a) => a.category === 'AI/ML' || a.technologies.includes('LLM Agents'));
  const webArticles = articles.filter((a) => a.category === 'Developer Tools' || a.category === 'Languages' || a.category === 'Frameworks');
  const emergingTechs = technologies.filter((t) => t.status === 'emerging').slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Algorithmic Curation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalized Feed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Curated specifically for your selected interests ({interests.length} topics) and followed technologies ({watchlistIds.length} watched).
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:border-cyan-500/50 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tune Recommendation Engine</span>
          </Link>
        </div>

        {/* 1. TOP RECOMMENDED */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Primary Recommendations
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((art) => (
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
            {aiArticles.slice(0, 2).map((art) => (
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
            {webArticles.slice(0, 2).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
