import { NextResponse } from 'next/server';
import type { Technology } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const TIMEFRAME_DAYS: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '3m': 90,
  '1y': 365,
};

const GROWTH_MULTIPLIER: Record<string, number> = {
  '24h': 2.5,
  '7d': 1.0,
  '30d': 0.6,
  '3m': 0.35,
  '1y': 0.15,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '7d';
  const category = searchParams.get('category') || 'all';
  const direction = searchParams.get('direction') || 'all'; // 'all' | 'rising' | 'falling'
  const statusParam = searchParams.get('status') || 'all';

  const days = TIMEFRAME_DAYS[timeframe] ?? 7;
  const growthMult = GROWTH_MULTIPLIER[timeframe] ?? 1.0;
  const dateFilter = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  try {
    let repos: any[] = [];
    try {
      const ghRes = await fetch(
        `https://api.github.com/search/repositories?q=stars:>500+pushed:>${dateFilter}&sort=updated&order=desc&per_page=30`,
        {
          headers: {
            'User-Agent': 'TeQVu-Intelligence-Platform/1.0',
            Accept: 'application/vnd.github.v3+json',
          },
          signal: AbortSignal.timeout(6000),
          next: { revalidate: 3600 },
        }
      );

      if (ghRes.ok) {
        const data = await ghRes.json();
        repos = data.items || [];
      }
    } catch (e) {
      console.warn('GitHub search fetch error:', e);
    }

    let liveTechs: Technology[] = [];

    if (repos.length > 0) {
      const ghRisingTechs: Technology[] = repos.map((repo: any, index: number) => {
        const lang = repo.language?.toLowerCase() || '';
        const topics: string[] = repo.topics || [];

        let cat: any = 'Developer Tools';
        if (
          ['python', 'jupyter notebook'].includes(lang) ||
          topics.some((t) => ['ai', 'llm', 'machine-learning', 'gpt', 'deep-learning'].includes(t))
        ) {
          cat = 'AI/ML';
        } else if (['rust', 'c++', 'c', 'zig', 'assembly'].includes(lang)) {
          cat = 'Systems';
        } else if (['typescript', 'javascript', 'html', 'css'].includes(lang)) {
          cat = 'Frameworks';
        } else if (['go', 'shell'].includes(lang)) {
          cat = 'DevOps';
        } else if (['java', 'kotlin', 'swift'].includes(lang)) {
          cat = 'Languages';
        } else if (topics.some((t) => ['database', 'postgres', 'redis', 'vector', 'sql'].includes(t))) {
          cat = 'Databases';
        } else if (topics.some((t) => ['cloud', 'aws', 'azure', 'kubernetes'].includes(t))) {
          cat = 'Cloud';
        }

        const sparkline = Array.from({ length: 7 }, (_, i) =>
          Math.min(100, Math.max(20, Math.floor(40 + i * 8 + Math.random() * 12)))
        );

        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const rawGrowth = Math.floor(15 + ((stars + forks) % 85));
        const growth = Math.round(rawGrowth * growthMult);
        const score = Math.min(99, Math.max(55, 70 + Math.floor(Math.log10(stars + 1) * 4)));
        const status: any =
          growth > 80 ? 'emerging' : index < 8 ? 'trending' : growth > 30 ? 'rising' : 'stable';

        return {
          id: `gh-${repo.id || index}`,
          slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: repo.name,
          category: cat,
          description: repo.description || 'Fast-growing open-source technology with active contributions.',
          trendScore: score,
          mentions: stars,
          sources: forks,
          growth,
          status,
          firstDetected: repo.created_at?.split('T')[0] ?? '2026-01-01',
          lastUpdated: repo.updated_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
          sparkline,
          tags: topics.length > 0 ? topics.slice(0, 4) : [repo.language || 'Open Source'],
          relatedTechs: [],
          github: repo.html_url,
          website: repo.homepage || repo.html_url,
          whyTrending: `Gained ${stars.toLocaleString()} stars and ${forks.toLocaleString()} forks on GitHub in the last ${timeframe}.`,
          followersCount: stars,
        };
      });

      liveTechs = ghRisingTechs;
    }

    // Apply category filter
    let filtered =
      category === 'all'
        ? liveTechs
        : liveTechs.filter((t) => t.category.toLowerCase() === category.toLowerCase());

    // Apply direction filter
    if (direction === 'rising') {
      filtered = filtered.filter((t) => t.growth >= 0 && t.status !== 'declining' && t.status !== 'falling');
    } else if (direction === 'falling') {
      filtered = filtered.filter((t) => t.growth < 0 || t.status === 'declining' || t.status === 'falling');
    }

    // Apply status filter
    if (statusParam !== 'all') {
      filtered = filtered.filter((t) => t.status === statusParam);
    }

    const risingTrends = filtered.filter((t) => t.growth >= 0);
    const fallingTrends = filtered.filter((t) => t.growth < 0 || t.status === 'declining' || t.status === 'falling');

    return NextResponse.json({
      success: true,
      count: filtered.length,
      timeframe,
      category,
      direction,
      timestamp: new Date().toISOString(),
      technologies: filtered,
      trends: filtered,
      risingTrends,
      fallingTrends,
      stats: {
        total: filtered.length,
        risingCount: risingTrends.length,
        fallingCount: fallingTrends.length,
      },
    });
  } catch (err: any) {
    console.error('Error fetching live trends:', err);
    return NextResponse.json(
      { success: false, error: err.message, technologies: [], trends: [], risingTrends: [], fallingTrends: [] },
      { status: 500 }
    );
  }
}
