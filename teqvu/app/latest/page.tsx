'use client';

import React, { useState } from 'react';
import { Search, Filter, Layers, ArrowUpDown } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { articles } from '../../lib/mock-data/articles';
import { storyClusters } from '../../lib/mock-data/sources';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { StoryClusterCard } from '../../components/cards/StoryClusterCard';

export default function LatestNewsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'discussed' | 'trending'>('newest');

  const categories = ['All', 'AI/ML', 'Languages', 'Developer Tools', 'Systems', 'Software Engineering'];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === 'All' || art.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !search ||
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.summary.toLowerCase().includes(search.toLowerCase()) ||
      art.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Layers className="w-4 h-4" />
            <span>Real-Time Ingestion Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Latest Technology Developments
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Aggregated and verified news, release notes, and technical articles from trusted global sources.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by title, technology, or topic..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-cyan-500" />
                <span className="text-slate-400">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value as any)}
                  className="bg-transparent font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="discussed">Most Discussed</option>
                  <option value="trending">Trending Velocity</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Story Clusters Showcase */}
        {selectedCategory === 'All' && !search && storyClusters.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold">
                Clustered Breaking Coverage (Multi-Source Verified)
              </h2>
            </div>
            <div className="space-y-4">
              {storyClusters.map((cluster) => (
                <StoryClusterCard key={cluster.id} cluster={cluster} />
              ))}
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing {filteredArticles.length} developments</span>
            <span>All stories parsed with structured AI summaries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-slate-800">
              <Search className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-40" />
              <p className="font-semibold text-slate-300">No articles found</p>
              <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
