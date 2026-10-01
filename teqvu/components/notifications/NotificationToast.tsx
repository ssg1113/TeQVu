'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Flame,
  Zap,
  TrendingUp,
  X,
  ExternalLink,
  ArrowRight,
  Radio,
  Bookmark,
  Bell,
} from 'lucide-react';
import { useAppStore } from '../../lib/store/useAppStore';

export function NotificationToast() {
  const router = useRouter();
  const { activeToast, dismissToast, markAsRead } = useAppStore();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = 9000; // 9 seconds
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef<number>(duration);

  useEffect(() => {
    if (!activeToast) {
      setProgress(100);
      return;
    }

    let animationFrame: number;
    let lastTime = performance.now();

    const updateTimer = (currentTime: number) => {
      if (!isHovered) {
        const delta = currentTime - lastTime;
        remainingTimeRef.current -= delta;
        const pct = Math.max(0, (remainingTimeRef.current / duration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          dismissToast();
          return;
        }
      }
      lastTime = currentTime;
      animationFrame = requestAnimationFrame(updateTimer);
    };

    remainingTimeRef.current = duration;
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrame);
  }, [activeToast, isHovered, dismissToast]);

  if (!activeToast) return null;

  const handleAction = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.url && activeToast.url.startsWith('http')) {
      window.open(activeToast.url, '_blank', 'noopener,noreferrer');
    } else if (activeToast.link) {
      router.push(activeToast.link);
    } else if (activeToast.type === 'trend') {
      router.push('/trending');
    } else {
      router.push('/latest');
    }
  };

  const isTrend = activeToast.type === 'trend';
  const isBreaking = activeToast.type === 'breaking' || activeToast.type === 'update';

  return (
    <aside
      aria-label="Real-time technology signal alert"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2.5rem)] rounded-2xl bg-white/95 dark:bg-[#0c1427]/95 backdrop-blur-xl border border-slate-200 dark:border-cyan-500/30 shadow-2xl shadow-cyan-950/30 p-4 transition-all duration-300 animate-slide-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Progress Countdown Bar */}
      <div className="absolute top-0 left-4 right-4 h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ease-linear ${
            isTrend
              ? 'bg-gradient-to-r from-purple-500 to-cyan-400'
              : 'bg-gradient-to-r from-rose-500 to-amber-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="pt-2 flex items-start gap-3">
        {/* Pulsing Signal Icon */}
        <div
          className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isTrend
              ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {isTrend ? (
            <Zap className="w-5 h-5 animate-pulse" />
          ) : (
            <Flame className="w-5 h-5 animate-bounce" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  activeToast.importance === 'critical'
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-600 dark:text-rose-300 animate-pulse'
                    : isTrend
                    ? 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {activeToast.importance === 'critical'
                  ? 'CRITICAL TECH ALERT'
                  : isTrend ? 'Breakout Tech Trend' : 'Breaking Tech Signal'}
              </span>

              {activeToast.metric && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  {activeToast.metric}
                </span>
              )}
            </div>

            <button
              onClick={dismissToast}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {activeToast.title}
          </h4>

          <p className="mt-1 text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-relaxed">
            {activeToast.message}
          </p>

          {/* Action Row */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400">
              {activeToast.sourceName || 'Live Radar'} • Just now
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={dismissToast}
                className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
              >
                Dismiss
              </button>

              <button
                onClick={handleAction}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold text-white transition shadow-sm ${
                  isTrend
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/30'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                }`}
              >
                <span>View {isTrend ? 'Trend' : 'Update'}</span>
                {activeToast.url?.startsWith('http') ? (
                  <ExternalLink className="w-3 h-3" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
