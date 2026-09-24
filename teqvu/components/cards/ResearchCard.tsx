'use client';

import React from 'react';
import { BookOpen, Bookmark, ExternalLink, Quote, Calendar, Users } from 'lucide-react';
import type { ResearchPaper } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { useAppStore } from '../../lib/store/useAppStore';

interface ResearchCardProps {
  paper: ResearchPaper;
}

export function ResearchCard({ paper }: ResearchCardProps) {
  const { isBookmarked, toggleBookmark } = useAppStore();
  const bookmarked = isBookmarked(paper.id);

  return (
    <div className="flex flex-col justify-between p-5 bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all">
      <div>
        {/* Source & Actions */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <div className="flex items-center gap-1.5 font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{paper.source}</span>
          </div>

          <button
            onClick={() => toggleBookmark(paper.id)}
            aria-label="Bookmark paper"
            className={`p-1.5 rounded-lg border transition ${
              bookmarked
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-cyan-400 transition leading-snug">
          {paper.title}
        </h3>

        {/* Authors */}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="line-clamp-1">{paper.authors.join(', ')}</span>
        </div>

        {/* Summary */}
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {paper.summary}
        </p>

        {/* Topics */}
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {paper.topics.map((t, idx) => (
            <Badge key={idx} variant="outline" size="sm" className="text-[11px]">
              {t}
            </Badge>
          ))}
          {paper.technologies.map((t, idx) => (
            <Badge key={idx} variant="cyan" size="sm" className="text-[11px]">
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {paper.publishedAt}
          </span>
          {paper.citations !== undefined && (
            <span className="flex items-center gap-1 font-mono text-purple-400">
              <Quote className="w-3 h-3" />
              {paper.citations} citations
            </span>
          )}
        </div>

        <a
          href={paper.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
        >
          <span>View Paper</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
