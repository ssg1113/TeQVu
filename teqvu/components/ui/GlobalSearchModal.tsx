'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  Sparkles,
  BookOpen,
  Layers,
  ExternalLink,
  ArrowRight,
  Briefcase,
  Loader2,
  Radio,
  Clock,
  TrendingUp,
  Flame,
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';
import { timeAgo, formatGrowth } from '../../lib/utils';
import type { Technology, Article, ResearchPaper, Skill } from '../../lib/types';

// Module-level in-memory cache to ensure opening the modal is instant (0ms delay)
let cachedSearchData: {
  technologies: Technology[];
  articles: Article[];
  researchPapers: ResearchPaper[];
  skills: Skill[];
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes fresh cache

export function GlobalSearchModal() {
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'tech' | 'articles' | 'research' | 'skills'>('all');

  // Real-time data states initialized from cache if available
  const [techList, setTechList] = useState<Technology[]>(() => cachedSearchData?.technologies || []);
  const [articleList, setArticleList] = useState<Article[]>(() => cachedSearchData?.articles || []);
  const [researchList, setResearchList] = useState<ResearchPaper[]>(() => cachedSearchData?.researchPapers || []);
  const [skillList, setSkillList] = useState<Skill[]>(() => cachedSearchData?.skills || []);

  const [isLoading, setIsLoading] = useState<boolean>(!cachedSearchData);
  const [isLive, setIsLive] = useState<boolean>(Boolean(cachedSearchData));
  const [hasLoaded, setHasLoaded] = useState<boolean>(Boolean(cachedSearchData));

  // Fetch real data from live endpoints
  const fetchRealData = useCallback(async () => {
    // Only show loading indicator if we don't have cached data yet
    if (!cachedSearchData) {
      setIsLoading(true);
    }

    try {
      const [trendsRes, newsRes, researchRes, skillsRes] = await Promise.allSettled([
        fetch('/api/trends?timeframe=7d'),
        fetch('/api/tech-news?limit=50'),
        fetch('/api/research?limit=30'),
        fetch('/api/jobs-skills'),
      ]);

      let newTechs: Technology[] = techList;
      if (trendsRes.status === 'fulfilled' && trendsRes.value.ok) {
        const data = await trendsRes.value.json();
        if (Array.isArray(data.technologies)) {
          newTechs = data.technologies;
        }
      }

      let newArticles: Article[] = articleList;
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        const data = await newsRes.value.json();
        if (Array.isArray(data.articles)) {
          newArticles = data.articles;
        }
      }

      let newResearch: ResearchPaper[] = researchList;
      if (researchRes.status === 'fulfilled' && researchRes.value.ok) {
        const data = await researchRes.value.json();
        if (Array.isArray(data.papers)) {
          newResearch = data.papers;
        }
      }

      let newSkills: Skill[] = skillList;
      if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
        const data = await skillsRes.value.json();
        if (Array.isArray(data.skills)) {
          newSkills = data.skills;
        }
      }

      setTechList(newTechs);
      setArticleList(newArticles);
      setResearchList(newResearch);
      setSkillList(newSkills);
      setIsLive(true);
      setHasLoaded(true);

      cachedSearchData = {
        technologies: newTechs,
        articles: newArticles,
        researchPapers: newResearch,
        skills: newSkills,
        timestamp: Date.now(),
      };
    } catch (err) {
      console.warn('Live search data fetch failed:', err);
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [techList, articleList, researchList, skillList]);

  // Background prefetch on mount so data is ready BEFORE user clicks search bar
  useEffect(() => {
    if (!cachedSearchData) {
      fetchRealData();
    }
  }, [fetchRealData]);

  // When search modal opens, refresh if cache is stale
  useEffect(() => {
    if (isSearchOpen) {
      if (!cachedSearchData || Date.now() - cachedSearchData.timestamp > CACHE_TTL_MS) {
        fetchRealData();
      }
    }
  }, [isSearchOpen, fetchRealData]);

  // Keyboard shortcut (⌘K / Ctrl+K and Escape)
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

  // Filter real data based on search query
  const q = searchQuery.toLowerCase().trim();

  const filteredTech = useMemo(() => {
    return techList.filter((t) => {
      if (!q) return true;
      return (
        t.name?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.slug?.toLowerCase().includes(q)
      );
    });
  }, [techList, q]);

  const filteredArticles = useMemo(() => {
    return articleList.filter((a) => {
      if (!q) return true;
      return (
        a.title?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.source?.name?.toLowerCase().includes(q) ||
        a.technologies?.some((tech) => tech.toLowerCase().includes(q))
      );
    });
  }, [articleList, q]);

  const filteredResearch = useMemo(() => {
    return researchList.filter((r) => {
      if (!q) return true;
      return (
        r.title?.toLowerCase().includes(q) ||
        r.summary?.toLowerCase().includes(q) ||
        r.topics?.some((topic) => topic.toLowerCase().includes(q)) ||
        r.authors?.some((author) => author.toLowerCase().includes(q)) ||
        r.source?.toLowerCase().includes(q)
      );
    });
  }, [researchList, q]);

  const filteredSkills = useMemo(() => {
    return skillList.filter((s) => {
      if (!q) return true;
      return (
        s.name?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.roles?.some((role) => role.toLowerCase().includes(q)) ||
        s.relatedTechs?.some((rt) => rt.toLowerCase().includes(q))
      );
    });
  }, [skillList, q]);

  const totalResults =
    filteredTech.length + filteredArticles.length + filteredResearch.length + filteredSkills.length;

  if (!isSearchOpen) return null;

  const quickSuggestions = ['Rust', 'LLM Agents', 'Next.js', 'PyTorch', 'Kubernetes', 'DeepSeek'];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSearchOpen(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
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

          {isLoading && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 mr-2 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-mono">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </div>
          )}

          {isLive && !isLoading && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 mr-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE DATA</span>
            </div>
          )}

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 mr-2 transition"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd
            onClick={() => setSearchOpen(false)}
            className="cursor-pointer hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 transition"
          >
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'all', label: `All Results (${totalResults})` },
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
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Suggestion Chips if search query is empty */}
        {!searchQuery && (
          <div className="px-4 py-2 bg-slate-50/30 dark:bg-slate-900/20 border-b border-slate-100/60 dark:border-slate-800/40 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-400">
            <span className="flex-shrink-0 font-medium text-slate-500 dark:text-slate-400">Trending:</span>
            {quickSuggestions.map((item) => (
              <button
                key={item}
                onClick={() => setSearchQuery(item)}
                className="px-2 py-0.5 rounded-md bg-slate-200/50 dark:bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 border border-slate-200 dark:border-slate-700/60 transition whitespace-nowrap"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Search Results List */}
        <div className="p-4 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Loading Skeleton if no data yet */}
          {isLoading && !hasLoaded && (
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-12 bg-slate-100 dark:bg-slate-800/50 rounded-xl animate-pulse" />
              </div>
            </div>
          )}

          {/* Technologies Section */}
          {(activeTab === 'all' || activeTab === 'tech') && filteredTech.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real-Time Technologies</span>
                  <span className="text-slate-500 font-normal">({filteredTech.length})</span>
                </div>
                {activeTab === 'all' && filteredTech.length > 4 && (
                  <button
                    onClick={() => setActiveTab('tech')}
                    className="text-xs text-cyan-400 hover:underline capitalize font-normal flex items-center gap-1"
                  >
                    View all ({filteredTech.length})
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(activeTab === 'all' ? filteredTech.slice(0, 4) : filteredTech).map((tech) => (
                  <Link
                    key={tech.id}
                    href={`/technologies/${tech.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                  >
                    <div className="pr-3 flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition flex items-center gap-2 truncate">
                        <span className="truncate">{tech.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-normal flex-shrink-0">
                          {tech.category}
                        </span>
                        {tech.status === 'trending' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-normal flex-shrink-0 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5" /> Trending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {tech.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                      <span className="text-cyan-400 font-bold">{tech.trendScore} pts</span>
                      {tech.growth !== undefined && (
                        <span
                          className={`text-[11px] ${
                            tech.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatGrowth(tech.growth)}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-cyan-400 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Articles Section */}
          {(activeTab === 'all' || activeTab === 'articles') && filteredArticles.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Latest Developments & News</span>
                  <span className="text-slate-500 font-normal">({filteredArticles.length})</span>
                </div>
                {activeTab === 'all' && filteredArticles.length > 4 && (
                  <button
                    onClick={() => setActiveTab('articles')}
                    className="text-xs text-purple-400 hover:underline capitalize font-normal flex items-center gap-1"
                  >
                    View all ({filteredArticles.length})
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(activeTab === 'all' ? filteredArticles.slice(0, 4) : filteredArticles).map((art) => (
                  <a
                    key={art.id}
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                  >
                    <div className="pr-3 flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                        {art.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-2">
                        <span className="text-slate-300 font-medium">{art.source.name}</span>
                        <span>•</span>
                        <span>{art.category}</span>
                        {art.publishedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{timeAgo(art.publishedAt)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 flex-shrink-0 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Research Section */}
          {(activeTab === 'all' || activeTab === 'research') && filteredResearch.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Research Papers (arXiv Live)</span>
                  <span className="text-slate-500 font-normal">({filteredResearch.length})</span>
                </div>
                {activeTab === 'all' && filteredResearch.length > 3 && (
                  <button
                    onClick={() => setActiveTab('research')}
                    className="text-xs text-emerald-400 hover:underline capitalize font-normal flex items-center gap-1"
                  >
                    View all ({filteredResearch.length})
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(activeTab === 'all' ? filteredResearch.slice(0, 3) : filteredResearch).map((paper) => (
                  <a
                    key={paper.id}
                    href={paper.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                  >
                    <div className="pr-3 flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition line-clamp-1">
                        {paper.title}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-2">
                        <span>{paper.authors?.[0] || 'Author'} et al.</span>
                        <span>•</span>
                        <span className="text-emerald-400/90">{paper.source || 'arXiv'}</span>
                        {paper.publishedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">{paper.publishedAt.split('T')[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 flex-shrink-0 transition" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {(activeTab === 'all' || activeTab === 'skills') && filteredSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                  <span>In-Demand Skills & Roles</span>
                  <span className="text-slate-500 font-normal">({filteredSkills.length})</span>
                </div>
                {activeTab === 'all' && filteredSkills.length > 3 && (
                  <button
                    onClick={() => setActiveTab('skills')}
                    className="text-xs text-amber-400 hover:underline capitalize font-normal flex items-center gap-1"
                  >
                    View all ({filteredSkills.length})
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(activeTab === 'all' ? filteredSkills.slice(0, 3) : filteredSkills).map((skill) => (
                  <Link
                    key={skill.id}
                    href={`/jobs-skills`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50"
                  >
                    <div className="pr-3 flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition flex items-center gap-2 truncate">
                        <span className="truncate">{skill.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-normal flex-shrink-0">
                          {skill.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {skill.roles?.slice(0, 3).join(', ') || 'High tech job demand'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-medium text-[11px]">
                        {skill.demand}
                      </span>
                      {skill.growth !== undefined && (
                        <span
                          className={`text-[11px] ${
                            skill.growth >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatGrowth(skill.growth)}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-cyan-400 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {hasLoaded &&
            filteredTech.length === 0 &&
            filteredArticles.length === 0 &&
            filteredResearch.length === 0 &&
            filteredSkills.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-500 mb-3 opacity-40" />
                <p className="font-medium text-slate-300">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs mt-1 text-slate-500">
                  Try searching for technologies like &apos;Rust&apos;, &apos;Next.js&apos;, &apos;PyTorch&apos;, or &apos;LLM Agents&apos;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Clear search
                </button>
              </div>
            )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Feeds: GitHub Trending, Reuters, BBC, arXiv & Remote Jobs</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[9px]">ESC</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
