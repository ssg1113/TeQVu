'use client';

import React, { useState } from 'react';
import { Search, BookOpen, Filter, ExternalLink, Sparkles, GraduationCap } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { researchPapers } from '../../lib/mock-data/research';
import { ResearchCard } from '../../components/cards/ResearchCard';

export default function ResearchHubPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

  const topics = ['All', 'Transformers', 'Systems Security', 'RAG', 'Quantum Computing', 'Cryptography', 'AI Safety'];

  const filteredPapers = researchPapers.filter((paper) => {
    const matchTopic = selectedTopic === 'All' || paper.topics.some((t) => t.toLowerCase() === selectedTopic.toLowerCase()) || paper.technologies.some((t) => t.toLowerCase() === selectedTopic.toLowerCase());
    const matchSearch =
      !search ||
      paper.title.toLowerCase().includes(search.toLowerCase()) ||
      paper.summary.toLowerCase().includes(search.toLowerCase()) ||
      paper.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      paper.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchTopic && matchSearch;
  });

  const trendingResearch = researchPapers.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Academic & Industrial Lab Discovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Research Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access preprints, peer-reviewed publications, and technical whitepapers across computer science, AI, and systems.
          </p>
        </div>

        {/* Search & Topic Filter */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technologies, research topics, papers, or concepts... (e.g. FlashAttention, Surface Codes, Formal Verification)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
            {topics.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedTopic === t
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 1. TRENDING RESEARCH PAPERS */}
        {!search && selectedTopic === 'All' && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Trending Breakthrough Preprints
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingResearch.map((paper) => (
                <ResearchCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        )}

        {/* 2. ALL RESEARCH PAPERS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredPapers.length} research papers</span>
            <span>Attribution: arXiv, ACM, IEEE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>
        </section>

        {/* 3. ACADEMIC & OPEN SOURCE RESOURCES */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
            Academic Portals & Repositories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <a
              href="https://arxiv.org/corr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">arXiv Computer Science</span>
                <span className="text-slate-400 text-[11px]">CoRR preprints & daily e-prints</span>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </a>

            <a
              href="https://dl.acm.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">ACM Digital Library</span>
                <span className="text-slate-400 text-[11px]">Computing literature & proceedings</span>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </a>

            <a
              href="https://ieeexplore.ieee.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">IEEE Xplore</span>
                <span className="text-slate-400 text-[11px]">Systems, hardware & engineering</span>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400" />
            </a>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
