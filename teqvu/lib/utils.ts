import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function formatGrowth(growth: number): string {
  return growth > 0 ? `+${growth}%` : `${growth}%`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    emerging: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400',
    rising:   'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30 dark:text-cyan-400',
    trending: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
    stable:   'text-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400',
    declining:'text-amber-500 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400',
    falling:  'text-rose-500 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400',
  };
  return map[status] || map['stable'];
}

export function getGrowthColor(growth: number): string {
  if (growth > 20) return 'text-emerald-500';
  if (growth > 0)  return 'text-emerald-400';
  if (growth < -10) return 'text-red-500';
  if (growth < 0)  return 'text-amber-500';
  return 'text-slate-400';
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export const INTEREST_OPTIONS = [
  { id: 'ai', label: 'Artificial Intelligence', icon: '🤖' },
  { id: 'ml', label: 'Machine Learning', icon: '🧠' },
  { id: 'web-dev', label: 'Web Development', icon: '🌐' },
  { id: 'software-eng', label: 'Software Engineering', icon: '⚙️' },
  { id: 'cybersecurity', label: 'Cybersecurity', icon: '🔒' },
  { id: 'cloud', label: 'Cloud Computing', icon: '☁️' },
  { id: 'devops', label: 'DevOps', icon: '🔄' },
  { id: 'data-science', label: 'Data Science', icon: '📊' },
  { id: 'mobile', label: 'Mobile Development', icon: '📱' },
  { id: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { id: 'databases', label: 'Databases', icon: '🗄️' },
  { id: 'open-source', label: 'Open Source', icon: '💻' },
  { id: 'uiux', label: 'UI/UX', icon: '🎨' },
  { id: 'gamedev', label: 'Game Development', icon: '🎮' },
  { id: 'iot', label: 'IoT', icon: '📡' },
  { id: 'robotics', label: 'Robotics', icon: '🤖' },
  { id: 'quantum', label: 'Quantum Computing', icon: '⚛️' },
];
