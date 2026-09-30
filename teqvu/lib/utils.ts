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

export interface ExtractedSource {
  id: string;
  name: string;
  url: string;
  type: string;
}

export function extractSourceFromUrl(url: string, fallbackName?: string): ExtractedSource {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');

    // Domain mappings for known tech publishers
    if (host.includes('anthropic.com')) return { id: 'anthropic', name: 'Anthropic News', url: 'https://www.anthropic.com', type: 'Official Blog' };
    if (host.includes('openai.com')) return { id: 'openai', name: 'OpenAI Blog', url: 'https://openai.com', type: 'Official Blog' };
    if (host.includes('deepmind.google') || host.includes('deepmind.com')) return { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google', type: 'Official Blog' };
    if (host.includes('rust-lang.org')) return { id: 'rust-lang', name: 'Rust Official', url: 'https://www.rust-lang.org', type: 'Official Blog' };
    if (host.includes('kernel.org')) return { id: 'linux-kernel', name: 'Kernel.org', url: 'https://kernel.org', type: 'Official Documentation' };
    if (host.includes('github.blog') || host.includes('github.com')) return { id: 'github', name: 'GitHub', url: 'https://github.com', type: 'Developer Tools' };
    if (host.includes('vercel.com') || host.includes('nextjs.org')) return { id: 'vercel', name: 'Vercel / Next.js', url: 'https://nextjs.org', type: 'Official Blog' };
    if (host.includes('reuters.com')) return { id: 'reuters', name: 'Reuters Technology', url: 'https://www.reuters.com/technology/', type: 'Global Wire' };
    if (host.includes('bbc.co.uk') || host.includes('bbc.com')) return { id: 'bbc', name: 'BBC Technology', url: 'https://www.bbc.com/news/technology', type: 'Public Broadcaster' };
    if (host.includes('theverge.com')) return { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com', type: 'Tech News' };
    if (host.includes('techcrunch.com')) return { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com', type: 'Tech News' };
    if (host.includes('wired.com')) return { id: 'wired', name: 'Wired', url: 'https://www.wired.com', type: 'Tech News' };
    if (host.includes('arstechnica.com')) return { id: 'ars-technica', name: 'Ars Technica', url: 'https://arstechnica.com', type: 'Tech News' };
    if (host.includes('theregister.com')) return { id: 'the-register', name: 'The Register', url: 'https://www.theregister.com', type: 'Tech News' };
    if (host.includes('technologyreview.com')) return { id: 'mit-tech-review', name: 'MIT Technology Review', url: 'https://www.technologyreview.com', type: 'Research' };
    if (host.includes('nature.com')) return { id: 'nature', name: 'Nature', url: 'https://www.nature.com', type: 'Research' };
    if (host.includes('arxiv.org')) return { id: 'arxiv', name: 'arXiv', url: 'https://arxiv.org', type: 'Research' };
    if (host.includes('spectrum.ieee.org') || host.includes('ieee.org')) return { id: 'ieee', name: 'IEEE Spectrum', url: 'https://spectrum.ieee.org', type: 'Research' };
    if (host.includes('infoq.com')) return { id: 'infoq', name: 'InfoQ', url: 'https://www.infoq.com', type: 'Software Engineering' };
    if (host.includes('lwn.net')) return { id: 'lwn', name: 'LWN.net', url: 'https://lwn.net', type: 'Systems' };
    if (host.includes('phoronix.com')) return { id: 'phoronix', name: 'Phoronix', url: 'https://www.phoronix.com', type: 'Systems' };
    if (host.includes('bun.sh')) return { id: 'bun', name: 'Bun Blog', url: 'https://bun.sh', type: 'Official Blog' };
    if (host.includes('supabase.com')) return { id: 'supabase', name: 'Supabase', url: 'https://supabase.com', type: 'Official Blog' };
    if (host.includes('devblogs.microsoft.com') || host.includes('microsoft.com')) return { id: 'microsoft', name: 'Microsoft DevBlogs', url: 'https://devblogs.microsoft.com', type: 'Official Blog' };
    if (host.includes('pytorch.org')) return { id: 'pytorch', name: 'PyTorch Blog', url: 'https://pytorch.org', type: 'Official Blog' };
    if (host.includes('kubernetes.io')) return { id: 'kubernetes', name: 'Kubernetes', url: 'https://kubernetes.io', type: 'Official Blog' };
    if (host.includes('dev.to')) return { id: 'devto', name: 'Dev.to Community', url: 'https://dev.to', type: 'Developer Community' };
    if (host.includes('news.ycombinator.com')) return { id: 'hn', name: 'Hacker News', url: 'https://news.ycombinator.com', type: 'Developer Community' };
    if (host.includes('digitaltrends.com')) return { id: 'digitaltrends', name: 'Digital Trends', url: 'https://www.digitaltrends.com', type: 'Tech News' };
    if (host.includes('bloomberg.com')) return { id: 'bloomberg', name: 'Bloomberg Technology', url: 'https://www.bloomberg.com/technology', type: 'Financial News' };

    // Format host cleanly
    const parts = host.split('.');
    const cleanDomain = parts.length > 1 ? parts[parts.length - 2] : host;
    const formatted = cleanDomain.charAt(0).toUpperCase() + cleanDomain.slice(1);
    return {
      id: cleanDomain.toLowerCase(),
      name: fallbackName && fallbackName !== 'Hacker News Live' && fallbackName !== 'Dev.to Technical Feed' ? fallbackName : formatted,
      url: `${parsed.protocol}//${parsed.hostname}`,
      type: 'Technical Source',
    };
  } catch {
    return {
      id: 'source',
      name: fallbackName || 'Technical Source',
      url: url || '#',
      type: 'Technical Source',
    };
  }
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

/**
 * Play a sleek, synthesized notification sound using the Web Audio API
 */
export function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Gentle dual-frequency chime (587Hz -> 880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // Gracefully ignore audio autoplay policies
  }
}

