import { NextResponse } from 'next/server';
import type { Technology, Article, ResearchPaper, Skill } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 600; // 10 minutes cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const category = (searchParams.get('category') || 'all').toLowerCase();
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);

  try {
    // 1. Fetch real technologies from GitHub API
    let techs: Technology[] = [];
    try {
      const ghDate = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const ghRes = await fetch(
        `https://api.github.com/search/repositories?q=stars:>500+pushed:>${ghDate}&sort=updated&order=desc&per_page=30`,
        {
          headers: {
            'User-Agent': 'TeQVu-Intelligence-Platform/1.0',
            Accept: 'application/vnd.github.v3+json',
          },
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 3600 },
        }
      );
      if (ghRes.ok) {
        const data = await ghRes.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          techs = data.items.map((repo: any, index: number) => {
            const stars = repo.stargazers_count || 0;
            const forks = repo.forks_count || 0;
            return {
              id: `gh-${repo.id || index}`,
              slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              name: repo.name,
              category: repo.language || 'Developer Tools',
              description: repo.description || 'Active open-source technology.',
              trendScore: Math.min(99, Math.max(55, 70 + Math.floor(Math.log10(stars + 1) * 4))),
              mentions: stars,
              sources: forks,
              growth: Math.floor(15 + ((stars + forks) % 85)),
              status: index < 5 ? 'trending' : 'rising',
              firstDetected: repo.created_at?.split('T')[0] ?? '2026-01-01',
              lastUpdated: repo.updated_at?.split('T')[0] ?? new Date().toISOString().split('T')[0],
              sparkline: [40, 52, 65, 70, 78, 85, 92],
              tags: repo.topics || [repo.language || 'Tech'],
              relatedTechs: [],
              github: repo.html_url,
              website: repo.homepage || repo.html_url,
              followersCount: stars,
            } as Technology;
          });
        }
      }
    } catch {
      // Empty array default
    }

    // 2. Fetch real tech news RSS feeds
    let articles: Article[] = [];
    try {
      const feedRes = await fetch(
        'https://news.google.com/rss/search?q=when:3d+technology&hl=en-US&gl=US&ceid=US:en',
        {
          headers: { 'User-Agent': 'TeQVu-Intelligence-Platform/1.0' },
          signal: AbortSignal.timeout(5000),
          next: { revalidate: 1800 },
        }
      );
      if (feedRes.ok) {
        const xml = await feedRes.text();
        const items = xml.split('<item>').slice(1);
        if (items.length > 0) {
          articles = items.map((item, idx) => {
            const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/i);
            const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/i);
            const pubDateMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
            const title = titleMatch ? titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1').trim() : 'Tech News Update';
            const url = linkMatch ? linkMatch[1].trim() : 'https://news.google.com';
            const pubDate = pubDateMatch ? new Date(pubDateMatch[1]).toISOString() : new Date().toISOString();

            return {
              id: `news-${idx}`,
              title,
              summary: title,
              url,
              category: 'Technology',
              source: {
                id: 'google-news',
                name: 'Google News Tech',
                url: 'https://news.google.com',
                type: 'Global Wire',
                category: 'Tech News',
                trustScore: 9,
                status: 'active',
                articlesCount: 50,
                lastChecked: new Date().toISOString(),
                collectionFrequency: '30 minutes',
              },
              publishedAt: pubDate,
              readingTime: 3,
              technologies: ['Tech'],
            } as Article;
          });
        }
      }
    } catch {
      // Empty array default
    }

    // 3. Filter results based on search query
    const filteredTech = techs.filter((t) => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    });

    const filteredArticles = articles.filter((a) => {
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });

    const filteredResearch: ResearchPaper[] = [];
    const filteredSkills: Skill[] = [];

    return NextResponse.json({
      success: true,
      query: q,
      timestamp: new Date().toISOString(),
      counts: {
        total: filteredTech.length + filteredArticles.length + filteredResearch.length + filteredSkills.length,
        technologies: filteredTech.length,
        articles: filteredArticles.length,
        research: filteredResearch.length,
        skills: filteredSkills.length,
      },
      results: {
        technologies: filteredTech.slice(0, limit),
        articles: filteredArticles.slice(0, limit),
        research: filteredResearch.slice(0, limit),
        skills: filteredSkills.slice(0, limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Search failed',
      },
      { status: 500 }
    );
  }
}
