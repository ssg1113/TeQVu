'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Briefcase,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TechCard } from '../../components/cards/TechCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { ResearchCard } from '../../components/cards/ResearchCard';
import { Sparkline } from '../../components/ui/Sparkline';
import { technologies } from '../../lib/mock-data/technologies';
import { articles } from '../../lib/mock-data/articles';
import { researchPapers } from '../../lib/mock-data/research';
import { skills } from '../../lib/mock-data/skills';
import { useAppStore } from '../../lib/store/useAppStore';
import { formatGrowth } from '../../lib/utils';

export default function HomePage() {
  const { currentUser, watchlistIds, interests } = useAppStore();

  const trendingNow = technologies.slice(0, 4);
  const importantDevelopments = articles.slice(0, 2);
  const forYouArticles = articles.slice(2, 6);
  const watchedTechs = technologies.filter((t) => watchlistIds.includes(t.id));
  const spotlightResearch = researchPapers.slice(0, 2);
  const skillsToWatch = skills.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Top Greeting Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technology Intelligence Feed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Good morning, {currentUser.name.split(' ')[0]}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here&apos;s what&apos;s happening in technology across your stack today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/onboarding"
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-cyan-500/50 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
            >
              Modify Interests ({interests.length})
            </Link>
            <Link
              href="/trending"
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20"
            >
              Live Trends
            </Link>
          </div>
        </div>

        {/* 1. TRENDING NOW SECTION */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trending Now</h2>
              <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">
                Fast Velocity
              </span>
            </div>
            <Link
              href="/trending"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendingNow.map((tech) => (
              <TechCard key={tech.id} tech={tech} />
            ))}
          </div>
        </section>

        {/* 2-Column Layout: Main Feed (Important + For You) & Sidebar Widgets (Watchlist + Skills) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* IMPORTANT DEVELOPMENTS */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Important Developments
                  </h2>
                </div>
                <Link
                  href="/latest"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Latest News →
                </Link>
              </div>

              <div className="space-y-4">
                {importantDevelopments.map((art) => (
                  <ArticleCard key={art.id} article={art} featured />
                ))}
              </div>
            </section>

            {/* FOR YOU (Personalized Feed) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    For You: Recommended
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Based on Your Interests
                  </span>
                </div>
                <Link
                  href="/for-you"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Personalized Feed →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forYouArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            </section>

            {/* RESEARCH SPOTLIGHT */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Research Spotlight
                  </h2>
                </div>
                <Link
                  href="/research"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Research Hub →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spotlightResearch.map((paper) => (
                  <ResearchCard key={paper.id} paper={paper} />
                ))}
              </div>
            </section>
          </div>

          {/* Widgets Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* TECHNOLOGY WATCHLIST */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Your Tech Watchlist
                  </h3>
                </div>
                <Link
                  href="/watchlist"
                  className="text-xs text-cyan-500 dark:text-cyan-400 hover:underline"
                >
                  Manage ({watchedTechs.length})
                </Link>
              </div>

              <div className="space-y-2.5">
                {watchedTechs.slice(0, 5).map((tech) => (
                  <div
                    key={tech.id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
                  >
                    <div>
                      <Link
                        href={`/technologies/${tech.slug}`}
                        className="font-semibold text-xs text-slate-900 dark:text-white hover:text-cyan-400"
                      >
                        {tech.name}
                      </Link>
                      <div className="text-[10px] text-slate-400">{tech.category}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Sparkline
                        data={tech.sparkline}
                        color={tech.growth >= 0 ? '#10b981' : '#f59e0b'}
                        width={45}
                        height={16}
                      />
                      <span
                        className={`text-xs font-mono font-bold ${
                          tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      >
                        {formatGrowth(tech.growth)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS TO WATCH */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Skills to Watch
                  </h3>
                </div>
                <Link
                  href="/jobs-skills"
                  className="text-xs text-cyan-500 dark:text-cyan-400 hover:underline"
                >
                  Insights →
                </Link>
              </div>

              <div className="space-y-3">
                {skillsToWatch.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>{skill.name}</span>
                      <span className="text-emerald-500 font-mono">+{skill.growth}%</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{skill.category}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skill.relatedTechs.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SMART NEWSLETTER CALLOUT */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/20">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 mb-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Next Scheduled Briefing</span>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">Daily Intelligence Digest</h4>
              <p className="text-xs text-slate-400 mt-1">
                Tomorrow at 07:00 AM • Personalized for your 5 tracked areas.
              </p>
              <Link
                href="/newsletter"
                className="mt-3 inline-block text-xs font-semibold text-cyan-400 hover:underline"
              >
                Change Frequency or Quiet Hours →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
