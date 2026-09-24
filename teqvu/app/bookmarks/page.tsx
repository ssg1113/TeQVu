'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Folder, Layers, BookOpen, Trash2, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { articles } from '../../lib/mock-data/articles';
import { researchPapers } from '../../lib/mock-data/research';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { ResearchCard } from '../../components/cards/ResearchCard';
import { useAppStore } from '../../lib/store/useAppStore';

export default function BookmarksPage() {
  const { bookmarkedIds } = useAppStore();
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [collections, setCollections] = useState([
    { id: 'all', name: 'All Saved Items', count: bookmarkedIds.length },
    { id: 'ai-agents', name: 'AI & Autonomous Agents', count: 2 },
    { id: 'systems', name: 'Systems & Kernels', count: 1 },
    { id: 'thesis', name: 'Research for Thesis', count: 1 },
  ]);

  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const savedArticles = articles.filter((a) => bookmarkedIds.includes(a.id));
  const savedResearch = researchPapers.filter((r) => bookmarkedIds.includes(r.id));

  const handleAddCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newCol = {
      id: newFolderName.toLowerCase().replace(/\s+/g, '-'),
      name: newFolderName.trim(),
      count: 0,
    };
    setCollections([...collections, newCol]);
    setNewFolderName('');
    setIsCreating(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Bookmark className="w-4 h-4" />
            <span>Saved Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Bookmarks & Research Collections
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize bookmarked articles, papers, and architectural insights into personal dossiers.
          </p>
        </div>

        {/* Collections Shelf */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
              Collections
            </span>
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="text-xs text-cyan-500 hover:text-cyan-400 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Collection</span>
            </button>
          </div>

          {isCreating && (
            <form onSubmit={handleAddCollection} className="flex gap-2 animate-slide-up">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Collection name (e.g. Next.js 15 Migration, LLM Benchmarks)"
                className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500"
              >
                Create
              </button>
            </form>
          )}

          <div className="flex flex-wrap gap-2 text-xs">
            {collections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedFolder(col.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition ${
                  selectedFolder === col.id
                    ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span className="font-semibold">{col.name}</span>
                <span className="text-[10px] opacity-75 font-mono">({col.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Saved Articles Section */}
        {savedArticles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Saved Developments ({savedArticles.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedArticles.map((art) => (
                <ArticleCard key={art.id} article={art} />
              ))}
            </div>
          </section>
        )}

        {/* Saved Research Section */}
        {savedResearch.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Saved Research Papers ({savedResearch.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedResearch.map((paper) => (
                <ResearchCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {savedArticles.length === 0 && savedResearch.length === 0 && (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-slate-800">
            <Bookmark className="w-10 h-10 mx-auto text-slate-500 mb-3 opacity-30" />
            <p className="font-semibold text-slate-300">No bookmarks saved yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Click the bookmark icon on any article or research paper across the platform to save it here.
            </p>
            <div className="mt-4">
              <Link
                href="/latest"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500"
              >
                Browse Latest Feed
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
