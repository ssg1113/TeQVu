'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bookmark, Sparkles, ExternalLink, Clock, Layers } from 'lucide-react';
import type { Article } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { timeAgo } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import { AISummaryModal } from './AISummaryModal';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { isBookmarked, toggleBookmark } = useAppStore();
  const [showSummary, setShowSummary] = useState(false);
  const bookmarked = isBookmarked(article.id);

  return (
    <>
      <article
        className={`group relative flex flex-col justify-between bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 ${
          featured ? 'md:grid md:grid-cols-12 md:gap-6' : ''
        }`}
      >
        {/* Image */}
        {article.imageUrl && (
          <div
            className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800/40 ${
              featured ? 'md:col-span-5 h-56 md:h-full min-h-[220px]' : 'h-48 w-full'
            }`}
          >
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

            {/* Category tag */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                {article.category}
              </span>
              {article.clusterSize && article.clusterSize > 1 && (
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-lg bg-purple-500/80 backdrop-blur-md text-white border border-purple-300/20 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {article.clusterSize} sources
                </span>
              )}
            </div>

            {/* Bookmark button on image */}
            <button
              onClick={() => toggleBookmark(article.id)}
              aria-label="Bookmark article"
              className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${
                bookmarked
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40'
                  : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        )}

        {/* Content */}
        <div
          className={`flex-1 flex flex-col justify-between p-5 ${
            featured ? 'md:col-span-7' : ''
          }`}
        >
          <div>
            {/* Source & Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
              <div className="flex items-center gap-2">
                <a
                  href={article.source?.url || article.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-800 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
                >
                  {article.source?.name || 'Technical Source'}
                </a>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                {article.readingTime}m read
              </span>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
              <a
                href={article.url || article.source?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {article.title}
              </a>
            </h3>

            {/* Summary */}
            <p className="mt-2 text-xs md:text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {article.summary}
            </p>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3.5">
              {article.technologies.slice(0, 3).map((tech, idx) => (
                <Badge key={idx} variant="outline" size="sm" className="text-[11px]">
                  {tech}
                </Badge>
              ))}
              {article.technologies.length > 3 && (
                <span className="text-[11px] text-slate-400 self-center">
                  +{article.technologies.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setShowSummary(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200/50 dark:border-cyan-800/40 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>30s Summary</span>
            </button>

            <a
              href={article.url || article.source?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-cyan-400 transition"
            >
              <span>Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </article>

      {/* 30-Second AI Summary Modal */}
      <AISummaryModal
        article={article}
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </>
  );
}
