'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ExternalLink, Sparkles, GraduationCap, RefreshCw, Radio, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ResearchCard } from '../../components/cards/ResearchCard';
import type { ResearchPaper } from '../../lib/types';

export default function ResearchHubPage() {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isLive, setIsLive] = useState(true);

  const fetchLiveResearch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/research');
      if (res.ok) {
        const data = await res.json();
        if (data.papers && data.papers.length > 0) {
          setPapers(data.papers);
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setIsLive(true);
        }
      }
    } catch (err) {
      console.warn('Could not fetch live arXiv papers, using cached current feed.', err);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveResearch();
    // Auto refresh every 1 hour
    const interval = setInterval(fetchLiveResearch, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLiveResearch]);

  const topics = [
    'All',
    'AI & Machine Learning',
    'Deep Learning',
    'Software Engineering',
    'LLMs & NLP',
    'Cryptography & Security',
    'Distributed Systems',
    'Quantum Computing',
  ];

  const filteredPapers = papers.filter((paper) => {
    const matchTopic =
      selectedTopic === 'All' ||
      paper.topics.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase())) ||
      paper.technologies.some((t) => t.toLowerCase().includes(selectedTopic.toLowerCase()));
    const matchSearch =
      !search ||
      paper.title.toLowerCase().includes(search.toLowerCase()) ||
      paper.summary.toLowerCase().includes(search.toLowerCase()) ||
      paper.authors.some((a) => a.toLowerCase().includes(search.toLowerCase())) ||
      paper.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchTopic && matchSearch;
  });

  const trendingResearch = filteredPapers.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 font-semibold mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Academic & Industrial Lab Discovery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Research Hub
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live arXiv preprints, peer-reviewed publications, and breakthrough whitepapers updated regularly.
            </p>
          </div>

          {/* Live Feed Badge & Refresh Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>{isLive ? 'Live arXiv Feed' : 'Cached Feed'}</span>
              <span className="text-slate-500">• {lastUpdated}</span>
            </div>

            <button
              onClick={fetchLiveResearch}
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

        {/* Search & Topic Filter */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search live papers, authors, topics, or technologies... (e.g. LLM Agents, Transformers, Quantum, Diffusion)"
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
        {!search && selectedTopic === 'All' && trendingResearch.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Breakthrough Preprints
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
            <span>Showing {filteredPapers.length} live research publications</span>
            <span>Real-time Stream: arXiv Computer Science API</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>

          {filteredPapers.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400 bg-white dark:bg-[#0f1629] rounded-2xl border border-slate-200 dark:border-slate-800">
              <Search className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-40" />
              <p className="font-semibold text-slate-300">No matching research papers found</p>
              <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or category filter.</p>
            </div>
          )}
        </section>

        {/* 3. ACADEMIC & OPEN SOURCE RESOURCES */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-3">
            Direct Academic Ingestion Portals
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

