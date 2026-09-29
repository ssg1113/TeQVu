'use client';

import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, ExternalLink, Globe, Clock } from 'lucide-react';
import type { StoryCluster } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { timeAgo } from '../../lib/utils';

interface StoryClusterCardProps {
  cluster: StoryCluster;
}

export function StoryClusterCard({ cluster }: StoryClusterCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-5 bg-white dark:bg-[#0f1629] border border-purple-500/20 dark:border-purple-500/20 rounded-2xl shadow-sm hover:shadow-md transition">
      {/* Cluster Pill */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono">
            <Layers className="w-3.5 h-3.5" />
            Story Cluster: {cluster.articleCount} articles · {cluster.sourceCount} sources
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">•</span>
          <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(cluster.publishedAt)}
          </span>
        </div>
        <Badge variant="outline" size="sm">
          {cluster.category}
        </Badge>
      </div>

      {/* Main Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
        <a
          href={cluster.articles[0]?.url || cluster.primarySource?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          {cluster.title}
        </a>
      </h3>

      {/* Summary */}
      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {cluster.summary}
      </p>

      {/* Tech tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {cluster.technologies.map((tech, idx) => (
          <Badge key={idx} variant="cyan" size="sm">
            {tech}
          </Badge>
        ))}
      </div>

      {/* Footer & Source Expansion */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Globe className="w-3.5 h-3.5 text-cyan-500" />
          <span>
            Primary:{' '}
            <a
              href={cluster.primarySource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-800 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition underline underline-offset-2"
            >
              {cluster.primarySource.name}
            </a>
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition"
        >
          <span>{expanded ? 'Collapse Sources' : `View All ${cluster.articles?.length || cluster.sourceCount} Outlets`}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Sources List */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5 animate-slide-up">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <span>Independent Outlets & Reporting:</span>
            <span>{cluster.articles.length} Cross-Verified Sources</span>
          </div>
          {cluster.articles.map((art) => (
            <div
              key={art.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 text-xs hover:border-purple-500/30 transition group"
            >
              <div className="flex-1 pr-3">
                <a
                  href={art.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-1"
                >
                  {art.title}
                </a>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{art.source.name}</span>
                  {art.source.type && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {art.source.type}
                    </span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-400">{timeAgo(art.publishedAt)}</span>
                </div>
              </div>
              <a
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition"
                title="Open Source Article"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
