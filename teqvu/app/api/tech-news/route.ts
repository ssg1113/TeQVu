import { NextResponse } from 'next/server';
import type { Article } from '../../../lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=when:3d+source:Reuters+technology&hl=en-US&gl=US&ceid=US:en',
    name: 'Reuters Technology',
    id: 'reuters',
    trustScore: 10,
  },
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    name: 'BBC Technology',
    id: 'bbc',
    trustScore: 10,
  },
  {
    url: 'https://news.google.com/rss/search?q=when:7d+source:Digital+Trends&hl=en-US&gl=US&ceid=US:en',
    name: 'Digital Trends',
    id: 'digitaltrends',
    trustScore: 9,
  },
  {
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
    name: 'Google News Tech',
    id: 'googlenews',
    trustScore: 9,
  },
];

const TECH_KEYWORDS: Record<string, string[]> = {
  'AI/ML': [
    'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'gemini', 'claude',
    'openai', 'deepmind', 'neural', 'chatbot', 'generative', 'diffusion', 'transformer',
    'copilot', 'mistral', 'llama', 'nvidia ai', 'cuda', 'deep learning', 'large language model',
  ],
  'Cybersecurity': [
    'hack', 'breach', 'cybersecurity', 'ransomware', 'malware', 'vulnerability',
    'exploit', 'phishing', 'zero-day', 'encryption', 'ddos', 'security flaw',
  ],
  'Cloud': [
    'aws', 'azure', 'google cloud', 'cloud computing', 'serverless', 'kubernetes',
    'docker', 'microservices', 'saas', 'paas', 'iaas',
  ],
  'Quantum': [
    'quantum', 'qubit', 'quantum computing', 'quantum supremacy',
  ],
  'Blockchain': [
    'blockchain', 'crypto', 'bitcoin', 'ethereum', 'web3', 'nft', 'defi',
  ],
  'Mobile': [
    'android', 'iphone', 'apple watch', 'smartphone', 'mobile app', 'app store',
    'google play', 'swift', 'kotlin', 'ios 18',
  ],
  'Robotics': [
    'robot', 'robotics', 'automation', 'drone', 'autonomous vehicle', 'self-driving',
    'humanoid robot',
  ],
  'Developer Tools': [
    'github', 'vscode', 'ide', 'devops', 'ci/cd', 'rust', 'typescript',
    'javascript', 'python', 'react', 'open source', 'programming',
  ],
};

function categorizeArticle(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return 'Software Engineering';
}

function extractTechs(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const known = [
    'GPT-4', 'GPT-4o', 'Gemini', 'Claude', 'LLaMA', 'Mistral', 'Nvidia', 'CUDA',
    'React', 'Next.js', 'TypeScript', 'Python', 'Rust', 'Go', 'Kubernetes', 'Docker',
    'AWS', 'Azure', 'Google Cloud', 'PostgreSQL', 'MongoDB', 'Redis', 'Supabase',
    'ChatGPT', 'OpenAI', 'DeepMind', 'Anthropic', 'WebAssembly', 'Linux',
    'GitHub', 'VS Code', 'iPhone', 'Android', 'Bitcoin', 'Ethereum',
  ];
  return known.filter((t) => text.includes(t.toLowerCase())).slice(0, 4);
}

function stripHtml(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRSSXml(xml: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getTag = (tag: string): string => {
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return plainMatch ? plainMatch[1].trim() : '';
    };
    const enclosureMatch =
      block.match(/<enclosure[^>]+url="([^"]+)"/i) ||
      block.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ||
      block.match(/<media:content[^>]+url="([^"]+)"/i);

    const title = stripHtml(getTag('title'));
    const link = getTag('link') || getTag('guid');
    if (!title || !link) continue;

    items.push({
      title,
      link,
      description: stripHtml(getTag('description')).slice(0, 400),
      pubDate: getTag('pubDate'),
      imageUrl: enclosureMatch?.[1],
    });
  }
  return items;
}

async function fetchFeed(feed: (typeof RSS_FEEDS)[0]): Promise<Article[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = parseRSSXml(xml);

    return items.map((item, idx) => {
      const category = categorizeArticle(item.title, item.description);
      const techs = extractTechs(item.title, item.description);
      const pubDate = item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString();

      return {
        id: `${feed.id}-${idx}-${pubDate.slice(0, 10)}`,
        title: item.title,
        summary: item.description || `Technology news from ${feed.name}.`,
        content: item.description,
        url: item.link,
        imageUrl: item.imageUrl,
        category,
        source: {
          id: feed.id,
          name: feed.name,
          url: item.link,
          type: 'RSS' as const,
          category,
          trustScore: feed.trustScore,
          status: 'active' as const,
          articlesCount: items.length,
          lastChecked: new Date().toISOString(),
          collectionFrequency: '30 minutes',
        },
        publishedAt: pubDate,
        readingTime: Math.max(2, Math.min(10, Math.ceil((item.description.split(' ').length + item.title.split(' ').length) / 200))),
        technologies: techs.length > 0 ? techs : [category],
        isBreaking: false,
      } satisfies Article;
    });
  } catch (err) {
    console.warn(`Failed to fetch ${feed.name}:`, err);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const tech = searchParams.get('tech') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 60);

  try {
    const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
    let articles = results.flat();

    // Deduplicate by title prefix
    const seen = new Set<string>();
    articles = articles.filter((a) => {
      const key = a.title.toLowerCase().slice(0, 55);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort newest first
    articles.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    if (category !== 'All') {
      articles = articles.filter((a) =>
        a.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (tech) {
      const q = tech.toLowerCase();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.technologies.some((t) => t.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: articles.length,
      timestamp: new Date().toISOString(),
      sources: RSS_FEEDS.map((f) => f.name),
      articles: articles.slice(0, limit),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, articles: [] },
      { status: 500 }
    );
  }
}

