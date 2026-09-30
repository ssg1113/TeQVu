'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Briefcase,
  Flame,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Radio,
  Filter,
  Layers,
  Newspaper,
  Compass,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TechCard } from '../../components/cards/TechCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { ResearchCard } from '../../components/cards/ResearchCard';
import { Sparkline } from '../../components/ui/Sparkline';
import { useAppStore } from '../../lib/store/useAppStore';
import { formatGrowth } from '../../lib/utils';
import type { Technology, Article, ResearchPaper, Skill } from '../../lib/types';

const INTEREST_CATEGORIES = [
  'All',
  'AI/ML',
  'Cloud',
  'Cybersecurity',
  'Developer Tools',
  'Languages',
  'Systems',
  'Software Engineering',
];

export default function HomePage() {
  const { currentUser, watchlistIds, interests } = useAppStore();

  const [trendingTechs, setTrendingTechs] = useState<Technology[]>([]);
  const [allTechs, setAllTechs] = useState<Technology[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [forYouArticles, setForYouArticles] = useState<Article[]>([]);
  const [allNews, setAllNews] = useState<Article[]>([]);
  const [researchList, setResearchList] = useState<ResearchPaper[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState<string>('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendsRes, newsRes, researchRes, skillsRes] = await Promise.allSettled([
        fetch('/api/trends?timeframe=7d'),
        fetch('/api/tech-news?limit=25'),
        fetch('/api/research?limit=6'),
        fetch('/api/jobs-skills?limit=8'),
      ]);

      // 1. Process Real-Time Trends (GitHub API)
      if (trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
        const trendsData = await trendsRes.value.json();
        if (trendsData.success && Array.isArray(trendsData.technologies) && trendsData.technologies.length > 0) {
          setAllTechs(trendsData.technologies);
          setTrendingTechs(trendsData.technologies.slice(0, 4));
        }
      }

      // 2. Process Real-Time Tech News (Reuters, BBC, Digital Trends, Google News)
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const newsData = await newsRes.value.json();
        if (newsData.success && Array.isArray(newsData.articles) && newsData.articles.length > 0) {
          const freshNews: Article[] = newsData.articles;
          setAllNews(freshNews);
          // First 2 articles are the top Important Developments
          setBreakingNews(freshNews.slice(0, 2));

          // Recommended articles: filter by user interests or category
          const remaining = freshNews.slice(2);
          if (interests.length > 0) {
            const interestMatches = remaining.filter((a) =>
              interests.some(
                (int) =>
                  a.category.toLowerCase().includes(int.toLowerCase()) ||
                  a.technologies.some((t) => t.toLowerCase().includes(int.toLowerCase()))
              )
            );
            setForYouArticles(interestMatches.length >= 2 ? interestMatches.slice(0, 4) : remaining.slice(0, 4));
          } else {
            setForYouArticles(remaining.slice(0, 4));
          }
        }
      }

      // 3. Process Real-Time Research (arXiv API)
      if (researchRes.status === 'fulfilled' && researchRes.value.ok) {
        const researchData = await researchRes.value.json();
        if (researchData.success && Array.isArray(researchData.papers) && researchData.papers.length > 0) {
          setResearchList(researchData.papers.slice(0, 2));
        }
      }

      // 4. Process Real-Time Skills (Jobs-Skills API)
      if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
        const skillsData = await skillsRes.value.json();
        if (Array.isArray(skillsData.skills) && skillsData.skills.length > 0) {
          setSkillsList(skillsData.skills);
        }
      }
    } catch (err) {
      console.warn('Dashboard fetch error, falling back to cached state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [interests]);

  useEffect(() => {
    fetchDashboardData();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Handle dynamic category filtering for For-You section
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      const remaining = allNews.slice(2);
      setForYouArticles(remaining.slice(0, 4));
    } else {
      const filtered = allNews.filter(
        (a) =>
          a.category.toLowerCase().includes(cat.toLowerCase()) ||
          a.technologies.some((t) => t.toLowerCase().includes(cat.toLowerCase()))
      );
      setForYouArticles(filtered.length > 0 ? filtered.slice(0, 4) : allNews.slice(2, 6));
    }
  };

  // Watchlist: combine allTechs to resolve watched IDs
  const combinedTechMap = new Map<string, Technology>();
  allTechs.forEach((t) => combinedTechMap.set(t.id, t));
  const watchedTechs = watchlistIds
    .map((id) => combinedTechMap.get(id))
    .filter((t): t is Technology => Boolean(t));

  const skillsToWatch = skillsList.slice(0, 4);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Top Greeting Header with Real-Time Telemetry Bar */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Technology Intelligence Platform</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {greeting}, {currentUser.name ? currentUser.name.split(' ')[0] : 'there'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Here&apos;s your technology intelligence briefing across your stack.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
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
                Trends Radar
              </Link>
            </div>
          </div>

          {/* Action Strip */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Coverage: Reuters · BBC · Digital Trends · arXiv · GitHub
            </span>

            <button
              onClick={() => fetchDashboardData()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Refresh intelligence feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
              <span>{isLoading ? 'Updating feeds...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* 1. TRENDING NOW SECTION (Real-Time GitHub & Tech Trends) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Trending Now</h2>
              <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md">
                GitHub Velocity
              </span>
            </div>
            <Link
              href="/trending"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View All Trends</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading && trendingTechs.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {trendingTechs.map((tech) => (
                <TechCard key={tech.id} tech={tech} />
              ))}
            </div>
          )}
        </section>

        {/* 2-Column Layout: Main Feed & Sidebar Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Feed Column (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* IMPORTANT DEVELOPMENTS (Real-Time Reuters & BBC Tech Feeds) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Important Developments
                  </h2>
                </div>
                <Link
                  href="/latest"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Latest</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoading && breakingNews.length === 0 ? (
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                  <div className="h-48 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                </div>
              ) : (
                <div className="space-y-4">
                  {breakingNews.map((art) => (
                    <ArticleCard key={art.id} article={art} featured />
                  ))}
                </div>
              )}
            </section>

            {/* FOR YOU (Personalized & Interactive Category Feed) */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    For You: Recommended
                  </h2>
                  <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Personalized Feed
                  </span>
                </div>
                <Link
                  href="/for-you"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  View Personalized Feed →
                </Link>
              </div>

              {/* Dynamic Interest Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
                {INTEREST_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${selectedCategory === cat
                      ? 'bg-cyan-500 text-white shadow-sm font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {isLoading && forYouArticles.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                  <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forYouArticles.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              )}
            </section>

            {/* RESEARCH SPOTLIGHT (Real-Time arXiv Preprints) */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Research Spotlight
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold">
                    arXiv Preprints
                  </span>
                </div>
                <Link
                  href="/research"
                  className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  Research Hub →
                </Link>
              </div>

              {isLoading && researchList.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                  <div className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800/40 animate-pulse border border-slate-200/50 dark:border-slate-800/50" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {researchList.map((paper) => (
                    <ResearchCard key={paper.id} paper={paper} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Widgets Sidebar Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* TECHNOLOGY WATCHLIST (Powered by Real-Time Data) */}
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
                {watchedTechs.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-slate-400 mb-3">No technologies followed yet.</p>
                    <Link
                      href="/trending"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition"
                    >
                      Explore Live Trends
                    </Link>
                  </div>
                ) : (
                  watchedTechs.slice(0, 5).map((tech) => (
                    <div
                      key={tech.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
                    >
                      <div className="min-w-0 pr-2">
                        <Link
                          href={`/technologies/${tech.slug}`}
                          className="font-semibold text-xs text-slate-900 dark:text-white hover:text-cyan-400 truncate block"
                        >
                          {tech.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 truncate">{tech.category}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Sparkline
                          data={tech.sparkline}
                          color={tech.growth >= 0 ? '#10b981' : '#f59e0b'}
                          width={45}
                          height={16}
                        />
                        <span
                          className={`text-xs font-mono font-bold ${tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'
                            }`}
                        >
                          {formatGrowth(tech.growth)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* VERIFIED LIVE SOURCES WIDGET */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Live Verified Sources
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  All Active
                </span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Reuters Technology', trust: '10/10', type: 'Global Wire' },
                  { name: 'BBC Technology', trust: '10/10', type: 'Public Broadcaster' },
                  { name: 'Digital Trends', trust: '9/10', type: 'Industry Reviews' },
                  { name: 'Google News Tech', trust: '9/10', type: 'Global Aggregator' },
                  { name: 'arXiv Computer Science', trust: '10/10', type: 'Academic Lab' },
                  { name: 'GitHub Trending', trust: '9/10', type: 'Open-Source Code' },
                ].map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-slate-400">{s.type}</span>
                      <span className="text-cyan-500 font-semibold">{s.trust}</span>
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
                      {(skill.relatedTechs || []).slice(0, 3).map((t, idx) => (
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
                Tomorrow at 07:00 AM • Personalized for your tracked areas.
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
