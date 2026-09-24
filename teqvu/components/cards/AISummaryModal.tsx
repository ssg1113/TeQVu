'use client';

import React from 'react';
import { X, Sparkles, ExternalLink, CheckCircle2, Users, Layers, AlertCircle } from 'lucide-react';
import type { Article } from '../../lib/types';
import { Badge } from '../ui/Badge';

interface AISummaryModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AISummaryModal({ article, isOpen, onClose }: AISummaryModalProps) {
  if (!isOpen || !article) return null;

  const ai = article.aiSummary || {
    whatHappened: article.summary,
    whyItMatters: 'Signals a key development in production technology adoption and developer workflows.',
    whoShouldCare: ['Software Engineers', 'System Architects', 'IT Students'],
    technologiesInvolved: article.technologies,
    keyTakeaways: [article.title, 'Key production architectural improvements', 'Industry-wide benchmark changes'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-500 dark:text-cyan-400 font-mono">
                  30-Second Intelligence Brief
                </span>
                <span className="text-xs text-slate-400">• {article.source.name}</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 mt-0.5">
                {article.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* What happened */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
            <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-1.5 text-xs uppercase tracking-wider text-cyan-500 font-mono">
              <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              What Happened?
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {ai.whatHappened}
            </p>
          </div>

          {/* Why it matters */}
          <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <h4 className="flex items-center gap-2 font-semibold text-purple-600 dark:text-purple-400 mb-1.5 text-xs uppercase tracking-wider font-mono">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              Why It Matters
            </h4>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {ai.whyItMatters}
            </p>
          </div>

          {/* Who should care & Technologies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
              <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-2.5 text-xs uppercase tracking-wider font-mono">
                <Users className="w-4 h-4 text-emerald-500" />
                Who Should Care?
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {ai.whoShouldCare.map((target, idx) => (
                  <Badge key={idx} variant="emerald" size="sm">
                    {target}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/60">
              <h4 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100 mb-2.5 text-xs uppercase tracking-wider font-mono">
                <Layers className="w-4 h-4 text-cyan-500" />
                Technologies Involved
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {ai.technologiesInvolved.map((tech, idx) => (
                  <Badge key={idx} variant="cyan" size="sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Key takeaways */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2.5 text-xs uppercase tracking-wider text-slate-400 font-mono">
              Key Strategic Takeaways
            </h4>
            <ul className="space-y-2">
              {ai.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="text-xs text-slate-400">
            Source: <span className="font-medium text-slate-300">{article.source.name}</span>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-cyan-500/20 transition"
          >
            <span>Read Original Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
