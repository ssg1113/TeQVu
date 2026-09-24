'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  TrendingUp,
  ArrowRight,
  Brain,
  Layout,
  Server,
  Terminal,
  Shield,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { skills, careerPaths } from '../../lib/mock-data/skills';
import { technologies } from '../../lib/mock-data/technologies';
import { articles } from '../../lib/mock-data/articles';
import { TechCard } from '../../components/cards/TechCard';
import { ArticleCard } from '../../components/cards/ArticleCard';

export default function JobsSkillsPage() {
  const [selectedPathId, setSelectedPathId] = useState(careerPaths[0].id);

  const selectedPath = careerPaths.find((p) => p.id === selectedPathId) || careerPaths[0];

  const iconMap: Record<string, any> = {
    Brain,
    Layout,
    Server,
    Terminal,
    Shield,
    BarChart3,
  };

  const matchingTechs = technologies.filter((t) =>
    selectedPath.technologies.some((name) => t.name.toLowerCase().includes(name.toLowerCase())) ||
    t.tags.some((tag) => selectedPath.name.toLowerCase().includes(tag.toLowerCase()))
  ).slice(0, 3);

  const matchingArticles = articles.filter((a) =>
    a.technologies.some((t) => selectedPath.technologies.some((st) => st.toLowerCase() === t.toLowerCase()))
  ).slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Workforce Technology Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Jobs & Skills Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Real data on emerging engineering skills, framework adoption trends, and career roadmaps across global tech companies.
          </p>
        </div>

        {/* 1. SKILLS GAINING DEMAND */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Skills Gaining Demand (Verified Velocity)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400">Industry Adoption Index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                      {skill.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      +{skill.growth}%
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {skill.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      Demand Level: <strong className="text-cyan-400">{skill.demand}</strong>
                    </div>
                    <div>
                      Target Roles: <span className="text-slate-300">{skill.roles.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="text-[10px] font-mono uppercase text-slate-400 mb-1.5">
                    Intersecting Tech:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.relatedTechs.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. CAREER PATH SELECTOR & DEEP DIVE */}
        <section className="space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Technologies by Career Path</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an engineering track to view essential skills, trending stack components, and salary benchmarks.
            </p>
          </div>

          {/* Career Path Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {careerPaths.map((path) => {
              const Icon = iconMap[path.icon] || Briefcase;
              const isSelected = selectedPathId === path.id;
              return (
                <button
                  key={path.id}
                  onClick={() => setSelectedPathId(path.id)}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-white dark:bg-[#0f1629] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-2" />
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

          {/* Selected Path Deep Dive */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedPath.name} Intelligence
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  {selectedPath.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase text-slate-400">Market Range</div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                  {selectedPath.averageSalary}
                </div>
              </div>
            </div>

            {/* Skills & Technologies Required */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold mb-3">
                  Essential Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.skills.map((skill, idx) => (
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
                  {selectedPath.technologies.map((tech, idx) => (
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

            {/* Trending Techs for this track */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                Trending Technologies in {selectedPath.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {matchingTechs.map((tech) => (
                  <TechCard key={tech.id} tech={tech} />
                ))}
              </div>
            </div>

            {/* News related to this track */}
            {matchingArticles.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                  Recent Developments Affecting This Career Track
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {matchingArticles.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
