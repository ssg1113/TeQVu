'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  TrendingUp,
  Check,
  Plus,
  Globe,
  Github,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Briefcase,
  ExternalLink,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { technologies } from '../../../lib/mock-data/technologies';
import { articles } from '../../../lib/mock-data/articles';
import { researchPapers } from '../../../lib/mock-data/research';
import { skills, careerPaths } from '../../../lib/mock-data/skills';
import { TrendBadge, Badge } from '../../../components/ui/Badge';
import { ArticleCard } from '../../../components/cards/ArticleCard';
import { ResearchCard } from '../../../components/cards/ResearchCard';
import { TechCard } from '../../../components/cards/TechCard';
import { formatGrowth } from '../../../lib/utils';
import { useAppStore } from '../../../lib/store/useAppStore';

export default function TechnologyDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { isWatching, toggleWatchlist } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'research' | 'skills' | 'resources'>('overview');

  const tech = technologies.find((t) => t.slug === slug) || technologies[0];
  const watching = isWatching(tech.id);

  const relatedTechs = technologies.filter((t) => tech.relatedTechs?.includes(t.id) || t.category === tech.category && t.id !== tech.id).slice(0, 3);
  const relatedArticles = articles.filter((a) => a.technologies.some((t) => t.toLowerCase() === tech.name.toLowerCase() || tech.tags.includes(t)));
  const relatedResearch = researchPapers.filter((r) => r.technologies.some((t) => t.toLowerCase() === tech.name.toLowerCase()) || r.topics.some((tp) => tech.tags.includes(tp)));
  const relatedSkills = skills.filter((s) => s.relatedTechs.some((t) => t.toLowerCase() === tech.name.toLowerCase()) || s.category.includes(tech.category));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Link */}
        <Link
          href="/technologies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Technologies Index</span>
        </Link>

        {/* Header Block */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-cyan-500/25">
                {tech.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-cyan-500 font-semibold">{tech.category}</span>
                  <TrendBadge status={tech.status} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {tech.name}
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {tech.website && (
                <a
                  href={tech.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              )}
              {tech.github && (
                <a
                  href={tech.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  title="GitHub Repository"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => toggleWatchlist(tech.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                  watching
                    ? 'bg-cyan-500 text-white shadow-cyan-500/30'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-cyan-500 dark:hover:bg-cyan-400 dark:hover:text-white'
                }`}
              >
                {watching ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{watching ? 'Following on Watchlist' : 'Add to Watchlist'}</span>
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {tech.description}
          </p>

          {/* Stats Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Trend Score</div>
              <div className="font-extrabold text-lg text-slate-900 dark:text-white font-mono mt-0.5">
                {tech.trendScore} / 100
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Mentions</div>
              <div className="font-extrabold text-lg text-slate-900 dark:text-white font-mono mt-0.5">
                {tech.mentions}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Independent Sources</div>
              <div className="font-extrabold text-lg text-slate-900 dark:text-white font-mono mt-0.5">
                {tech.sources}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Growth Rate</div>
              <div className="font-extrabold text-lg text-emerald-400 font-mono mt-0.5">
                {formatGrowth(tech.growth)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">First Detected</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono mt-1">
                {tech.firstDetected}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-400">Last Corroborated</div>
              <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono mt-1">
                {tech.lastUpdated}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Velocity' },
            { id: 'news', label: `Developments & News (${relatedArticles.length})` },
            { id: 'research', label: `Research Papers (${relatedResearch.length})` },
            { id: 'skills', label: 'Skills & Market Demand' },
            { id: 'resources', label: 'Resources & Docs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & WHY IT'S TRENDING */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Why It's Trending AI Box */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>AI Velocity Analysis: Why It&apos;s Trending</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                {tech.whyTrending ||
                  `${tech.name} has experienced increased attention due to growing adoption across developer communities, cloud infrastructure, and security-focused software development.`}
              </p>
            </div>

            {/* Simulated Large Trend Graph */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>30-Day Momentum & Mention Distribution</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400 font-bold">
                  Trend Velocity: High
                </span>
              </div>
              {/* Visual ASCII / SVG Bar Chart */}
              <div className="h-44 flex items-end gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                {[35, 42, 48, 55, 62, 58, 65, 72, 80, 85, 92, 88, 96].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-purple-500 group-hover:from-cyan-400 group-hover:to-purple-400 transition-all opacity-85 group-hover:opacity-100"
                      style={{ height: `${(val / 100) * 100}%` }}
                    />
                    <span className="text-[9px] font-mono text-slate-400">d{idx + 1}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 text-[11px] font-mono text-slate-400">
                <span>Multi-source signal corroboration verified</span>
                <span className="text-emerald-400 font-bold">Peak Mentions Surge</span>
              </div>
            </div>

            {/* Related Technologies */}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Related & Intersecting Technologies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedTechs.map((rt) => (
                  <TechCard key={rt.id} tech={rt} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEWS */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(relatedArticles.length > 0 ? relatedArticles : articles.slice(0, 4)).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}

        {/* TAB 3: RESEARCH */}
        {activeTab === 'research' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(relatedResearch.length > 0 ? relatedResearch : researchPapers.slice(0, 4)).map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}

        {/* TAB 4: SKILLS */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.slice(0, 4).map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold">+{s.growth}%</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{s.category}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    Target Roles: <strong className="text-slate-300">{s.roles.join(', ')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: RESOURCES */}
        {activeTab === 'resources' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white">Curated Technical Resources</h3>
            <div className="space-y-3 text-xs">
              <a
                href={tech.website || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition"
              >
                <span>Official Documentation & Architecture Specification</span>
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>
              <a
                href={tech.github || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition"
              >
                <span>Source Code Repository & Developer Issue Tracker</span>
                <ExternalLink className="w-4 h-4 text-cyan-400" />
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
