import { NextResponse } from 'next/server';
import type { Article } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Refresh every 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 40);

  try {
    // 1. Fetch top & new stories IDs from Hacker News API
    const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      next: { revalidate: 1800 },
    });

    const storyIds: number[] = hnRes.ok ? (await hnRes.json()).slice(0, 15) : [];

    // Fetch individual story details in parallel
    const hnPromises = storyIds.map(async (id) => {
      try {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemRes.ok) return null;
        return await itemRes.json();
      } catch {
        return null;
      }
    });

    // 2. Fetch top tech articles from Dev.to API
    const devtoPromise = (async () => {
      try {
        const res = await fetch('https://dev.to/api/articles?top=1&per_page=12', {
          next: { revalidate: 1800 },
          headers: { 'User-Agent': 'TeQVu-Intelligence-Platform/1.0' },
        });
        if (!res.ok) return [];
        return await res.json();
      } catch {
        return [];
      }
    })();

    const [hnItems, devtoItems] = await Promise.all([Promise.all(hnPromises), devtoPromise]);

    const articles: Article[] = [];

    // Process Hacker News stories
    hnItems.forEach((item, idx) => {
      if (!item || !item.title) return;

      const title = item.title;
      const lower = title.toLowerCase();

      let cat = 'Software Engineering';
      if (lower.includes('ai') || lower.includes('llm') || lower.includes('gpt') || lower.includes('model') || lower.includes('claude') || lower.includes('neural')) {
        cat = 'AI/ML';
      } else if (lower.includes('rust') || lower.includes('python') || lower.includes('typescript') || lower.includes('go') || lower.includes('c++') || lower.includes('wasm')) {
        cat = 'Languages';
      } else if (lower.includes('linux') || lower.includes('kernel') || lower.includes('gpu') || lower.includes('cpu') || lower.includes('system') || lower.includes('database') || lower.includes('postgres')) {
        cat = 'Systems';
      } else if (lower.includes('tool') || lower.includes('ide') || lower.includes('docker') || lower.includes('git') || lower.includes('cli') || lower.includes('terminal')) {
        cat = 'Developer Tools';
      }

      const techMatches = [
        'LLM Agents',
        'Rust',
        'Next.js',
        'PostgreSQL',
        'Linux',
        'Docker',
        'PyTorch',
        'WebAssembly',
        'CUDA',
        'React',
        'TypeScript',
        'eBPF',
      ].filter((t) => lower.includes(t.toLowerCase()));

      const timeAgo = item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString();
      const articleUrl = item.url || `https://news.ycombinator.com/item?id=${item.id}`;

      articles.push({
        id: `hn-${item.id || idx}`,
        title: item.title,
        summary: `Community discussion with ${item.score || 0} points and ${item.descendants || 0} comments on Hacker News.`,
        content: `Live tech development submitted by ${item.by || 'developer'}. Full discussions and insights available on the source link.`,
        category: cat,
        url: articleUrl,
        source: {
          id: 'hn',
          name: 'Hacker News Live',
          url: articleUrl,
          type: 'Developer Community',
          category: cat,
          trustScore: 9,
          status: 'active',
          articlesCount: 15,
          lastChecked: new Date().toISOString(),
          collectionFrequency: '30 minutes',
        },
        publishedAt: timeAgo,
        readingTime: Math.max(3, Math.min(10, Math.floor((item.title.length + 20) / 15))),
        technologies: techMatches.length > 0 ? techMatches : [cat],
        discussCount: item.descendants || 0,
        isBreaking: (item.score || 0) > 150,
      });
    });

    // Process Dev.to stories
    if (Array.isArray(devtoItems)) {
      devtoItems.forEach((dev) => {
        if (!dev || !dev.title) return;

        const tagList = Array.isArray(dev.tag_list) ? dev.tag_list : [];
        let cat = 'Developer Tools';
        if (tagList.some((t: string) => ['ai', 'machinelearning', 'deeplearning', 'openai'].includes(t.toLowerCase()))) {
          cat = 'AI/ML';
        } else if (tagList.some((t: string) => ['javascript', 'typescript', 'python', 'rust', 'golang'].includes(t.toLowerCase()))) {
          cat = 'Languages';
        } else if (tagList.some((t: string) => ['devops', 'cloud', 'aws', 'docker', 'kubernetes'].includes(t.toLowerCase()))) {
          cat = 'Systems';
        }

        const devUrl = dev.url || `https://dev.to`;

        articles.push({
          id: `devto-${dev.id}`,
          title: dev.title,
          summary: dev.description || 'In-depth engineering article covering real-world architectural paradigms and code samples.',
          content: dev.description || '',
          category: cat,
          url: devUrl,
          source: {
            id: 'devto',
            name: 'Dev.to Technical Feed',
            url: devUrl,
            type: 'Developer Community',
            category: cat,
            trustScore: 8,
            status: 'active',
            articlesCount: 12,
            lastChecked: new Date().toISOString(),
            collectionFrequency: '30 minutes',
          },
          publishedAt: dev.published_at || new Date().toISOString(),
          readingTime: dev.reading_time_minutes || 5,
          technologies: tagList.slice(0, 3).map((t: string) => t.toUpperCase()),
          discussCount: dev.comments_count || 0,
          isBreaking: (dev.public_reactions_count || 0) > 50,
        });
      });
    }

    // Sort by publication time (newest first)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Filter by category if requested
    const filtered = category === 'All' ? articles : articles.filter((a) => a.category.toLowerCase().includes(category.toLowerCase()));

    return NextResponse.json({
      success: true,
      count: filtered.length,
      timestamp: new Date().toISOString(),
      articles: filtered.slice(0, limit),
    });
  } catch (err: any) {
    console.error('Error fetching live news:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch live tech news',
        articles: [],
      },
      { status: 500 }
    );
  }
}
