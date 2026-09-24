'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, Sparkles, BookOpen, Layers, ExternalLink, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';
import { technologies } from '../../lib/mock-data/technologies';
import { articles } from '../../lib/mock-data/articles';
import { researchPapers } from '../../lib/mock-data/research';
import { skills } from '../../lib/mock-data/skills';

export function GlobalSearchModal() {
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'articles' | 'research' | 'skills'>('all');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  if (!isSearchOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  const filteredTech = technologies.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  );

  const filteredArticles = articles.filter(
    (a) => !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
  );

  const filteredResearch = researchPapers.filter(
    (r) => !q || r.title.toLowerCase().includes(q) || r.summary.toLowerCase().includes(q) || r.topics.some((t) => t.toLowerCase().includes(q))
  );

  const filteredSkills = skills.filter(
    (s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.roles.some((r) => r.toLowerCase().includes(q))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-cyan-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technologies, articles, research papers, or skills... (e.g. Rust, LLMs, Agents)"
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'tech', label: `Technologies (${filteredTech.length})` },
            { id: 'articles', label: `Articles (${filteredArticles.length})` },
            { id: 'research', label: `Research (${filteredResearch.length})` },
            { id: 'skills', label: `Skills (${filteredSkills.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="p-4 overflow-y-auto space-y-5 text-sm">
          {/* Technologies Section */}
          {(activeTab === 'all' || activeTab === 'tech') && filteredTech.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Technologies
              </div>
              <div className="space-y-1.5">
                {filteredTech.slice(0, 4).map((tech) => (
                  <Link
                    key={tech.id}
                    href={`/technologies/${tech.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition flex items-center gap-2">
                        {tech.name}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-normal">
                          {tech.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tech.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-cyan-400 font-bold">{tech.trendScore} pts</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {(activeTab === 'all' || activeTab === 'articles') && filteredArticles.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Latest Developments & News
              </div>
              <div className="space-y-1.5">
                {filteredArticles.slice(0, 4).map((art) => (
                  <a
                    key={art.id}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div className="pr-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {art.source.name} • {art.category}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Research Section */}
          {(activeTab === 'all' || activeTab === 'research') && filteredResearch.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                Research Papers
              </div>
              <div className="space-y-1.5">
                {filteredResearch.slice(0, 3).map((paper) => (
                  <a
                    key={paper.id}
                    href={paper.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group"
                  >
                    <div className="pr-3">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                        {paper.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {paper.authors[0]} et al. • {paper.source}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {filteredTech.length === 0 && filteredArticles.length === 0 && filteredResearch.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-500 mb-3 opacity-40" />
              <p className="font-medium text-slate-300">No results found for &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-xs mt-1 text-slate-500">
                Try searching for technologies like &apos;Rust&apos;, &apos;Next.js&apos;, or &apos;LLM Agents&apos;.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
