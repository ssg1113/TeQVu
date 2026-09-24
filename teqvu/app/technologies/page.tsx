'use client';

import React, { useState } from 'react';
import { Search, Compass, Filter, ArrowUpDown } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { technologies } from '../../lib/mock-data/technologies';
import { TechCard } from '../../components/cards/TechCard';

export default function TechnologiesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'growth' | 'mentions'>('score');

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
  ];

  const statuses = ['All', 'emerging', 'rising', 'trending', 'stable'];

  const filteredTechs = technologies
    .filter((t) => {
      const matchCat = selectedCategory === 'All' || t.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchStatus = selectedStatus === 'All' || t.status === selectedStatus;
      const matchSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'growth') return b.growth - a.growth;
      if (sortBy === 'mentions') return b.mentions - a.mentions;
      return b.trendScore - a.trendScore;
    });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Compass className="w-4 h-4" />
            <span>Technology Index & Taxonomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Technology Explorer
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Explore 1,800+ tracked technologies, frameworks, runtimes, and protocols with verified velocity signals.
          </p>
        </div>

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
                placeholder="Search technologies by name, keyword, or tag (e.g. Next.js, Rust, Vector, Agents)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500" />
              <span className="text-slate-400">Rank By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-semibold focus:outline-none cursor-pointer"
              >
                <option value="score">Trend Score</option>
                <option value="growth">Growth Velocity (%)</option>
                <option value="mentions">Mentions Count</option>
              </select>
            </div>
          </div>

          {/* Status & Category filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-white'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-mono text-[11px]">Status:</span>
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2 py-0.5 rounded-md text-[11px] capitalize font-mono transition ${
                    selectedStatus === status
                      ? 'bg-purple-500/20 text-purple-400 font-bold border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredTechs.length} technologies</span>
            <span>Signals refreshed: Real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTechs.map((tech) => (
              <TechCard key={tech.id} tech={tech} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
