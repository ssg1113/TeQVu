'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Check, MessageSquare, Globe, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Technology } from '../../lib/types';
import { TrendBadge } from '../ui/Badge';
import { Sparkline } from '../ui/Sparkline';
import { formatGrowth } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

interface TechCardProps {
  tech: Technology;
  compact?: boolean;
}

export function TechCard({ tech, compact = false }: TechCardProps) {
  const { isWatching, toggleWatchlist } = useAppStore();
  const watching = isWatching(tech.id);

  const sparkColor =
    tech.status === 'emerging'
      ? '#a855f7'
      : tech.status === 'trending'
      ? '#10b981'
      : tech.status === 'declining'
      ? '#f59e0b'
      : '#06b6d4';

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-xl hover:border-cyan-500/40 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-500">
            {tech.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Link
              href={`/technologies/${tech.slug}`}
              className="text-sm font-semibold text-slate-900 dark:text-white hover:text-cyan-500 dark:hover:text-cyan-400 transition"
            >
              {tech.name}
            </Link>
            <div className="text-[11px] text-slate-400">{tech.category}</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <Sparkline data={tech.sparkline} color={sparkColor} width={60} height={20} />
          </div>
          <span
            className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${
              tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'
            }`}
          >
            {tech.growth >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {formatGrowth(tech.growth)}
          </span>
          <button
            onClick={() => toggleWatchlist(tech.id)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              watching
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {watching ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col justify-between p-5 bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition-all duration-300">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {tech.category}
              </span>
              <TrendBadge status={tech.status} />
            </div>
            <Link
              href={`/technologies/${tech.slug}`}
              className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition"
            >
              {tech.name}
            </Link>
          </div>

          <button
            onClick={() => toggleWatchlist(tech.id)}
            aria-label="Toggle watchlist"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
              watching
                ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/30'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-cyan-500 hover:text-cyan-500 dark:hover:text-cyan-400'
            }`}
          >
            {watching ? (
              <>
                <Check className="w-3 h-3" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {tech.description}
        </p>

        {/* Sparkline & Score */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              Trend Velocity
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                {tech.trendScore}
              </span>
              <span
                className={`text-xs font-semibold flex items-center font-mono ${
                  tech.growth >= 0 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {tech.growth >= 0 ? '+' : ''}
                {tech.growth}%
              </span>
            </div>
          </div>
          <Sparkline data={tech.sparkline} color={sparkColor} width={90} height={30} />
        </div>
      </div>

      {/* Metrics Footer */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
            {tech.mentions} mentions
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Globe className="w-3.5 h-3.5 text-purple-500" />
            {tech.sources} sources
          </span>
        </div>

        <Link
          href={`/technologies/${tech.slug}`}
          className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-0.5"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
