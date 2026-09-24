import React from 'react';
import { cn } from '../../lib/utils';
import type { TrendStatus } from '../../lib/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'cyan' | 'purple' | 'emerald' | 'amber' | 'blue';
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', className, size = 'sm' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    outline: 'border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-300',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200/60 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/60 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-full font-medium',
    md: 'text-sm px-2.5 py-1 rounded-md font-medium',
  };

  return (
    <span className={cn('inline-flex items-center gap-1', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  );
}

export function TrendBadge({ status }: { status: TrendStatus }) {
  const config: Record<TrendStatus, { label: string; variant: BadgeProps['variant']; icon: string }> = {
    emerging: { label: 'Emerging', variant: 'purple', icon: '✨' },
    rising: { label: 'Rising', variant: 'cyan', icon: '↗' },
    trending: { label: 'Trending', variant: 'emerald', icon: '🔥' },
    stable: { label: 'Stable', variant: 'blue', icon: '●' },
    declining: { label: 'Declining', variant: 'amber', icon: '↘' },
  };

  const current = config[status] || config.stable;

  return (
    <Badge variant={current.variant} className="capitalize tracking-wide font-mono text-[11px]">
      <span>{current.icon}</span>
      <span>{current.label}</span>
    </Badge>
  );
}
