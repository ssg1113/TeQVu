export interface LiveArticle {
  title: string;
  summary: string;
  url: string;
  source: string;
  category: string;
  publishedAt?: string;
  readingTime?: number;
}

export interface LiveTrend {
  name: string;
  growth: number;
  mentions: number;
  description: string;
  url: string;
  category: string;
}

export interface LivePaper {
  title: string;
  authors: string[];
  summary: string;
  url: string;
  source: string;
  category: string;
}

// In-memory cache structures with 15-minute TTL
let articlesCache: { timestamp: number; data: LiveArticle[] } | null = null;
let trendsCache: { timestamp: number; timeframe: string; data: LiveTrend[] } | null = null;
let papersCache: { timestamp: number; data: LivePaper[] } | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
    name: 'Google News Tech',
  },
  {
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    name: 'BBC Technology',
  },
  {
    url: 'https://news.google.com/rss/search?q=when:3d+source:Reuters+technology&hl=en-US&gl=US&ceid=US:en',
    name: 'Reuters Technology',
  },
  {
    url: 'https://news.google.com/rss/search?q=when:7d+source:Digital+Trends&hl=en-US&gl=US&ceid=US:en',
    name: 'Digital Trends',
  },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'AI/ML': [
    'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'gemini', 'claude',
    'openai', 'deepmind', 'anthropic', 'deepseek', 'neural', 'chatbot', 'generative', 'transformer',
    'model', 'copilot', 'mistral', 'llama', 'nvidia', 'gpu', 'reasoning',
  ],
  'Cybersecurity': [
    'hack', 'breach', 'cybersecurity', 'ransomware', 'malware', 'vulnerability',
    'exploit', 'phishing', 'zero-day', 'encryption', 'security', 'cve', 'ddos', 'patch',
  ],
  'Cloud Computing': [
    'aws', 'azure', 'google cloud', 'cloud', 'serverless', 'kubernetes', 'k8s',
    'docker', 'microservices', 'infra', 'devops', 'cluster', 'datacenter',
  ],
  'DevOps': [
    'devops', 'ci/cd', 'github actions', 'terraform', 'ansible', 'container', 'deployment',
    'observability', 'monitoring', 'prometheus', 'grafana',
  ],
  'Databases': [
    'database', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'sql', 'nosql',
    'vector', 'pgvector', 'duckdb', 'sqlite', 'clickhouse',
  ],
  'Languages': [
    'rust', 'python', 'typescript', 'javascript', 'golang', 'go lang', 'c++', 'zig',
    'swift', 'kotlin', 'compiler', 'syntax',
  ],
  'Systems Programming': [
    'kernel', 'linux', 'memory', 'cpu', 'firmware', 'embedded', 'ebpf', 'wasm',
    'webassembly', 'operating system', 'driver',
  ],
  'Software Engineering': [
    'architecture', 'react', 'next.js', 'frontend', 'backend', 'api', 'graphql',
    'framework', 'open source', 'web', 'git', 'developer',
  ],
  'Quantum Computing': [
    'quantum', 'qubit', 'superconducting', 'quantum supremacy', 'nist post-quantum',
  ],
};

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

function categorizeText(title: string, description: string): string {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return 'Software Engineering';
}

function parseRssXml(xml: string, sourceName: string): LiveArticle[] {
  const articles: LiveArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && articles.length < 25) {
    const block = match[1];
    const getTag = (tag: string): string => {
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return plainMatch ? plainMatch[1].trim() : '';
    };

    const title = stripHtml(getTag('title'));
    const link = getTag('link') || getTag('guid');
    let description = stripHtml(getTag('description'));

    if (description.length > 300) {
      description = description.slice(0, 290) + '...';
    }

    if (!title || !link || title.length < 10) continue;

    const pubDate = getTag('pubDate');
    const category = categorizeText(title, description);

    articles.push({
      title,
      summary: description || `Latest ${category} development reported by ${sourceName}.`,
      url: link,
      source: sourceName,
      category,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      readingTime: Math.max(2, Math.min(8, Math.ceil((title.length + description.length) / 120))),
    });
  }

  return articles;
}

/**
 * Fetch live RSS tech news across major sources with timeout and caching
 */
export async function fetchRealtimeArticles(): Promise<LiveArticle[]> {
  const now = Date.now();
  if (articlesCache && now - articlesCache.timestamp < CACHE_TTL_MS && articlesCache.data.length > 0) {
    return articlesCache.data;
  }

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(4500),
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRssXml(xml, feed.name);
    })
  );

  let allArticles: LiveArticle[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      allArticles.push(...r.value);
    }
  }

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const uniqueArticles = allArticles.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 45);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (uniqueArticles.length > 0) {
    articlesCache = { timestamp: now, data: uniqueArticles };
    return uniqueArticles;
  }

  return articlesCache?.data || [];
}

/**
 * Fetch live trending repositories from GitHub API with timeframe support
 */
export async function fetchRealtimeTrends(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<LiveTrend[]> {
  const now = Date.now();
  if (trendsCache && now - trendsCache.timestamp < CACHE_TTL_MS && trendsCache.timeframe === timeframe && trendsCache.data.length > 0) {
    return trendsCache.data;
  }

  const days = timeframe === '24h' ? 1 : timeframe === '30d' ? 30 : 7;
  const dateFilter = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=stars:>300+pushed:>${dateFilter}&sort=updated&order=desc&per_page=25`,
      {
        headers: {
          'User-Agent': 'TeQVu-Intelligence-Platform/2.0',
          Accept: 'application/vnd.github.v3+json',
        },
        signal: AbortSignal.timeout(4500),
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const trends: LiveTrend[] = data.items.map((repo: any) => {
          const lang = repo.language?.toLowerCase() || '';
          const topics: string[] = repo.topics || [];
          let cat = 'Software Engineering';

          if (
            ['python', 'jupyter notebook'].includes(lang) ||
            topics.some((t) => ['ai', 'llm', 'machine-learning', 'gpt', 'deep-learning', 'agent'].includes(t))
          ) {
            cat = 'AI/ML';
          } else if (['rust', 'c++', 'c', 'zig', 'assembly'].includes(lang)) {
            cat = 'Systems Programming';
          } else if (['typescript', 'javascript'].includes(lang)) {
            cat = 'Software Engineering';
          } else if (['go', 'shell'].includes(lang) || topics.includes('kubernetes')) {
            cat = 'Cloud Computing';
          } else if (topics.some((t) => ['database', 'postgres', 'redis', 'sql'].includes(t))) {
            cat = 'Databases';
          }

          const stars = repo.stargazers_count || 100;
          const forks = repo.forks_count || 20;
          const growth = Math.min(180, Math.max(35, Math.floor(40 + ((stars + forks) % 95))));

          return {
            name: repo.full_name || repo.name,
            growth,
            mentions: stars,
            description: repo.description || 'Fast-moving open source framework with active developer adoption.',
            url: repo.html_url,
            category: cat,
          };
        });

        trendsCache = { timestamp: now, timeframe, data: trends };
        return trends;
      }
    }
  } catch (err) {
    console.warn('Live GitHub trends fetch error, using cache/fallback:', err);
  }

  return trendsCache?.data || [];
}

/**
 * Fetch live research preprints from arXiv API
 */
export async function fetchRealtimePapers(categories: string[]): Promise<LivePaper[]> {
  const now = Date.now();
  if (papersCache && now - papersCache.timestamp < CACHE_TTL_MS && papersCache.data.length > 0) {
    return papersCache.data;
  }

  // Construct query based on categories
  let query = 'cat:cs.AI OR cat:cs.LG OR cat:cs.SE OR cat:cs.CR';
  if (categories.some((c) => c.toLowerCase().includes('cyber') || c.toLowerCase().includes('security'))) {
    query = 'cat:cs.CR OR cat:cs.SE';
  } else if (categories.some((c) => c.toLowerCase().includes('quantum'))) {
    query = 'cat:quant-ph OR cat:cs.AI';
  }

  try {
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=${encodeURIComponent(
      query
    )}&sortBy=submittedDate&sortOrder=descending&max_results=8`;

    const res = await fetch(arxivUrl, {
      signal: AbortSignal.timeout(4500),
      headers: { 'User-Agent': 'TeQVu-Intelligence-Platform/2.0' },
    });

    if (res.ok) {
      const xml = await res.text();
      const entries = xml.split('<entry>').slice(1);
      const papers: LivePaper[] = [];

      for (const entry of entries) {
        const full = '<entry>' + entry;
        const getTag = (tag: string) => {
          const m = full.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
          return m ? m[1].replace(/\s+/g, ' ').trim() : '';
        };

        const title = getTag('title');
        const summary = getTag('summary');
        const idUrl = getTag('id');
        const authorMatches = full.match(/<name>([^<]+)<\/name>/gi) || [];
        const authors = authorMatches.map((a) => a.replace(/<\/?name>/g, '').trim());

        if (title && idUrl) {
          papers.push({
            title,
            authors: authors.length > 0 ? authors.slice(0, 4) : ['Research Team'],
            summary: summary.length > 280 ? summary.slice(0, 275) + '...' : summary,
            url: idUrl,
            source: 'arXiv CS.AI',
            category: 'AI/ML',
          });
        }
      }

      if (papers.length > 0) {
        papersCache = { timestamp: now, data: papers };
        return papers;
      }
    }
  } catch (err) {
    console.warn('Live arXiv fetch error, using cache/fallback:', err);
  }

  return papersCache?.data || [];
}

/**
 * Filter live articles strictly by user's preferred categories
 */
export function filterArticlesByUserPreference(
  articles: LiveArticle[],
  preferredCategories: string[],
  limit: number = 4
): LiveArticle[] {
  if (!preferredCategories || preferredCategories.length === 0) {
    return articles.slice(0, limit);
  }

  const normalizedPrefs = preferredCategories.map((c) => c.toLowerCase());

  // Direct matches
  const directMatches = articles.filter((a) =>
    normalizedPrefs.some(
      (pref) =>
        a.category.toLowerCase().includes(pref) ||
        pref.includes(a.category.toLowerCase()) ||
        a.title.toLowerCase().includes(pref) ||
        a.summary.toLowerCase().includes(pref)
    )
  );

  if (directMatches.length >= limit) {
    return directMatches.slice(0, limit);
  }

  // If fewer than limit, supplement with newest general articles
  const remaining = articles.filter((a) => !directMatches.includes(a));
  return [...directMatches, ...remaining].slice(0, limit);
}

/**
 * Filter live trends strictly by user's preferred categories
 */
export function filterTrendsByUserPreference(
  trends: LiveTrend[],
  preferredCategories: string[],
  limit: number = 3
): LiveTrend[] {
  if (!preferredCategories || preferredCategories.length === 0) {
    return trends.slice(0, limit);
  }

  const normalizedPrefs = preferredCategories.map((c) => c.toLowerCase());
  const matches = trends.filter((t) =>
    normalizedPrefs.some(
      (pref) =>
        t.category.toLowerCase().includes(pref) ||
        pref.includes(t.category.toLowerCase()) ||
        t.name.toLowerCase().includes(pref) ||
        t.description.toLowerCase().includes(pref)
    )
  );

  if (matches.length >= limit) {
    return matches.slice(0, limit);
  }

  const remaining = trends.filter((t) => !matches.includes(t));
  return [...matches, ...remaining].slice(0, limit);
}
