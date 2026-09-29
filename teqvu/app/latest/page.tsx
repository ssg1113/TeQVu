'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Layers, ArrowUpDown, RefreshCw, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArticleCard } from '../../components/cards/ArticleCard';
import type { Article } from '../../lib/types';

export default function LatestNewsPage() {
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState<'newest' | 'discussed' | 'trending'>('newest');
  const [loading, setLoading] = useState(false);

  const fetchLiveNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticlesList(data.articles);
        }
      }
    } catch (err) {
      console.warn('Could not fetch tech news, using cached data.', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveNews();
    // Auto refresh every 1 hour
    const interval = setInterval(fetchLiveNews, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveNews]);

  const categories = ['All', 'AI/ML', 'Languages', 'Developer Tools', 'Systems', 'Software Engineering'];

  const filteredArticles = articlesList
    .filter((art) => {
      const matchesCategory =
        selectedCategory === 'All' || art.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        !search ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.summary.toLowerCase().includes(search.toLowerCase()) ||
        art.technologies.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (selectedSort === 'discussed') {
        return (b.discussCount || 0) - (a.discussCount || 0);
      }
      if (selectedSort === 'trending') {
        return (b.isBreaking ? 1 : 0) - (a.isBreaking ? 1 : 0);
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
              <Layers className="w-4 h-4" />
              <span>Global Tech Developments</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Latest Technology Developments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Aggregated tech releases, verified engineering notes, and breaking developer discussions.
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchLiveNews}
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
          </div>
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
                placeholder="Search live articles by title, technology, or topic..."
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

        {/* Articles Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredArticles.length} developments</span>
            <span>Sources: Hacker News · Dev.to</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>

          {filteredArticles.length === 0 && !loading && (
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

