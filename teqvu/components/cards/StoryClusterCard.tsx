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
        {cluster.title}
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
            Primary: <strong className="text-slate-800 dark:text-slate-200">{cluster.primarySource.name}</strong>
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 transition"
        >
          <span>{expanded ? 'Collapse Sources' : `View All ${cluster.sourceCount} Sources`}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Sources List */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2.5 animate-slide-up">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Independent Outlets & Reporting:
          </div>
          {cluster.articles.map((art) => (
            <div
              key={art.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/50 text-xs"
            >
              <div className="flex-1 pr-3">
                <span className="font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">
                  {art.title}
                </span>
                <span className="text-[11px] text-slate-400">{art.source.name} • {timeAgo(art.publishedAt)}</span>
              </div>
              <a
                href={art.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 transition"
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
