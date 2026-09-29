import { NextResponse } from 'next/server';
import type { Article } from '../../../lib/types';
import { extractSourceFromUrl } from '../../../lib/utils';
import { articles as verifiedArticles } from '../../../lib/mock-data/articles';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // Refresh every 30 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 60);

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
        const res = await fetch('https://dev.to/api/articles?top=1&per_page=10', {
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

    const liveArticles: Article[] = [];

    // Process Hacker News stories with authentic publisher extraction
    hnItems.forEach((item, idx) => {
      if (!item || !item.title) return;

      const title = item.title;
      const lower = title.toLowerCase();

      // Filter out non-technical general news/ask posts if unrelated to software/tech
      const isTech =
        item.url ||
        lower.includes('code') ||
        lower.includes('software') ||
        lower.includes('developer') ||
        lower.includes('programming') ||
        lower.includes('ai') ||
        lower.includes('model') ||
        lower.includes('release') ||
        lower.includes('linux') ||
        lower.includes('rust') ||
        lower.includes('python') ||
        lower.includes('database');

      if (!isTech) return;

      let cat = 'Software Engineering';
      if (
        lower.includes('ai') ||
        lower.includes('llm') ||
        lower.includes('gpt') ||
        lower.includes('model') ||
        lower.includes('claude') ||
        lower.includes('neural') ||
        lower.includes('deep learning')
      ) {
        cat = 'AI/ML';
      } else if (
        lower.includes('rust') ||
        lower.includes('python') ||
        lower.includes('typescript') ||
        lower.includes('go') ||
        lower.includes('c++') ||
        lower.includes('wasm') ||
        lower.includes('compiler')
      ) {
        cat = 'Languages';
      } else if (
        lower.includes('linux') ||
        lower.includes('kernel') ||
        lower.includes('gpu') ||
        lower.includes('cpu') ||
        lower.includes('system') ||
        lower.includes('database') ||
        lower.includes('postgres') ||
        lower.includes('sqlite')
      ) {
        cat = 'Systems';
      } else if (
        lower.includes('tool') ||
        lower.includes('ide') ||
        lower.includes('docker') ||
        lower.includes('git') ||
        lower.includes('cli') ||
        lower.includes('terminal') ||
        lower.includes('devops') ||
        lower.includes('kubernetes')
      ) {
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
        'Python',
        'Kubernetes',
      ].filter((t) => lower.includes(t.toLowerCase()));

      const timeAgo = item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString();
      const articleUrl = item.url || `https://news.ycombinator.com/item?id=${item.id}`;

      // Extract authentic publisher domain and source type
      const extractedSource = extractSourceFromUrl(
        articleUrl,
        item.by ? `${item.by} on Hacker News` : 'Hacker News'
      );

      liveArticles.push({
        id: `hn-${item.id || idx}`,
        title: item.title,
        summary: `Community discussion with ${item.score || 0} points and ${item.descendants || 0} comments on Hacker News.`,
        content: `Live tech development submitted by ${item.by || 'developer'}. Full technical notes and verified discussions available on the source publication.`,
        category: cat,
        url: articleUrl,
        source: {
          id: extractedSource.id,
          name: extractedSource.name,
          url: extractedSource.url,
          type: extractedSource.type,
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

    // Process Dev.to stories with authentic publisher extraction
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

        const devUrl = dev.canonical_url || dev.url || `https://dev.to`;
        const authorFallback = dev.user?.name ? `${dev.user.name} on Dev.to` : 'Dev.to Technical Feed';
        const extractedSource = extractSourceFromUrl(devUrl, authorFallback);

        liveArticles.push({
          id: `devto-${dev.id}`,
          title: dev.title,
          summary: dev.description || 'In-depth engineering article covering real-world architectural paradigms and code samples.',
          content: dev.description || '',
          category: cat,
          url: devUrl,
          imageUrl: dev.cover_image || dev.social_image || undefined,
          source: {
            id: extractedSource.id,
            name: extractedSource.name,
            url: extractedSource.url,
            type: extractedSource.type,
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

    // Merge verified benchmark articles with live ingested stories
    const combinedArticles = [...verifiedArticles];
    const seenUrls = new Set(verifiedArticles.map((a) => a.url.toLowerCase()));

    for (const art of liveArticles) {
      if (!seenUrls.has(art.url.toLowerCase())) {
        seenUrls.add(art.url.toLowerCase());
        combinedArticles.push(art);
      }
    }

    // Sort by publication time (newest first)
    combinedArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Filter by category if requested
    const filtered =
      category === 'All'
        ? combinedArticles
        : combinedArticles.filter((a) => a.category.toLowerCase().includes(category.toLowerCase()));

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
        articles: verifiedArticles.slice(0, limit),
      },
      { status: 200 }
    );
  }
}
