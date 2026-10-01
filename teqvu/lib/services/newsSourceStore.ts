import type { Source, Article } from '../types';

export interface SourceTelemetry {
  sourceId: string;
  sourceName: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  articlesCount: number;
  latencyMs: number;
  lastChecked: string;
  errorMessage?: string;
  isCustom?: boolean;
}

const DEFAULT_SOURCES: Source[] = [
  {
    id: 'reuters',
    name: 'Reuters Technology',
    url: 'https://news.google.com/rss/search?q=when:3d+source:Reuters+technology&hl=en-US&gl=US&ceid=US:en',
    type: 'Global Wire',
    category: 'Tech News',
    trustScore: 10,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '15 minutes',
  },
  {
    id: 'bbc',
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    type: 'Public Broadcaster',
    category: 'Tech News',
    trustScore: 10,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '15 minutes',
  },
  {
    id: 'googlenews',
    name: 'Google News Tech',
    url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGRqTVhZU0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en',
    type: 'Global Wire',
    category: 'Tech News',
    trustScore: 9,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '15 minutes',
  },
  {
    id: 'digitaltrends',
    name: 'Digital Trends',
    url: 'https://news.google.com/rss/search?q=when:7d+source:Digital+Trends&hl=en-US&gl=US&ceid=US:en',
    type: 'Tech News',
    category: 'Tech News',
    trustScore: 9,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '30 minutes',
  },
  {
    id: 'theverge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    type: 'Tech News',
    category: 'Emerging Tech',
    trustScore: 9,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '30 minutes',
  },
  {
    id: 'hackernews',
    name: 'Hacker News RSS',
    url: 'https://news.ycombinator.com/rss',
    type: 'Developer Community',
    category: 'Software Engineering',
    trustScore: 10,
    status: 'active',
    articlesCount: 0,
    lastChecked: new Date().toISOString(),
    collectionFrequency: '15 minutes',
  },
];

const STORE_KEY = 'news_sources_v2';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let _cachedSources: Source[] | null = null;
let _cachedArticles: { timestamp: number; articles: Article[] } | null = null;
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache for live telemetry

function getStoragePaths(): string[] {
  const paths: string[] = [];
  try {
    const path = require('path');
    paths.push(path.join(process.cwd(), 'data', 'news-sources.json'));
    paths.push(path.join('/tmp', 'news-sources.json'));
  } catch {
    // fallback
  }
  return paths;
}

async function loadFromFilesystem(): Promise<Source[] | null> {
  try {
    const fs = await import('fs');
    for (const filePath of getStoragePaths()) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

async function saveToFilesystem(sources: Source[]): Promise<void> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    for (const filePath of getStoragePaths()) {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(sources, null, 2), 'utf-8');
      } catch {
        // continue
      }
    }
  } catch {
    // ignore
  }
}

async function loadFromSupabase(): Promise<Source[] | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/app_kv_store?key=eq.${encodeURIComponent(STORE_KEY)}&select=value`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows && rows.length > 0) {
      const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      if (Array.isArray(val) && val.length > 0) return val;
    }
  } catch {
    // ignore
  }
  return null;
}

async function saveToSupabase(sources: Source[]): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/app_kv_store`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        key: STORE_KEY,
        value: JSON.stringify(sources),
        updated_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore
  }
}

export async function getSources(): Promise<Source[]> {
  if (_cachedSources && _cachedSources.length > 0) {
    return _cachedSources;
  }

  // Try filesystem first
  const fsSources = await loadFromFilesystem();
  if (fsSources) {
    _cachedSources = fsSources;
    return _cachedSources;
  }

  // Try Supabase KV
  const sbSources = await loadFromSupabase();
  if (sbSources) {
    _cachedSources = sbSources;
    await saveToFilesystem(sbSources);
    return _cachedSources;
  }

  // Default to verified initial sources
  _cachedSources = [...DEFAULT_SOURCES];
  await saveToFilesystem(_cachedSources);
  await saveToSupabase(_cachedSources);
  return _cachedSources;
}

export async function addSource(input: {
  name: string;
  url: string;
  category?: string;
  type?: string;
  trustScore?: number;
  collectionFrequency?: string;
}): Promise<{ success: boolean; source?: Source; error?: string }> {
  try {
    const cleanUrl = input.url.trim();
    const cleanName = input.name.trim();

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return { success: false, error: 'URL must start with http:// or https://' };
    }

    if (!cleanName) {
      return { success: false, error: 'Source name is required.' };
    }

    const sources = await getSources();
    if (sources.some((s) => s.url.toLowerCase() === cleanUrl.toLowerCase())) {
      return { success: false, error: 'A source with this exact feed URL already exists.' };
    }

    // Validate the feed in real-time
    const validation = await validateFeedUrl(cleanUrl);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Failed to fetch or parse RSS/Atom feed from this URL.',
      };
    }

    const id = `custom_${Date.now()}_${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}`;
    const newSource: Source = {
      id,
      name: cleanName,
      url: cleanUrl,
      type: input.type || 'RSS',
      category: input.category || 'Tech News',
      trustScore: input.trustScore ?? 9,
      status: 'active',
      articlesCount: validation.articleCount,
      lastChecked: new Date().toISOString(),
      collectionFrequency: input.collectionFrequency || '15 minutes',
      isCustom: true,
      latencyMs: validation.latencyMs,
    };

    const updated = [newSource, ...sources];
    _cachedSources = updated;
    _cachedArticles = null; // Invalidate articles cache to include new source immediately

    await saveToFilesystem(updated);
    await saveToSupabase(updated);

    return { success: true, source: newSource };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to add source' };
  }
}

export async function toggleSourceStatus(id: string): Promise<{ success: boolean; status?: string }> {
  const sources = await getSources();
  const idx = sources.findIndex((s) => s.id === id);
  if (idx === -1) return { success: false };

  const current = sources[idx];
  const nextStatus = current.status === 'active' ? 'inactive' : 'active';
  sources[idx] = { ...current, status: nextStatus, lastChecked: new Date().toISOString() };

  _cachedSources = [...sources];
  _cachedArticles = null;

  await saveToFilesystem(sources);
  await saveToSupabase(sources);

  return { success: true, status: nextStatus };
}

export async function deleteSource(id: string): Promise<boolean> {
  const sources = await getSources();
  const updated = sources.filter((s) => s.id !== id);
  if (updated.length === sources.length) return false;

  _cachedSources = updated;
  _cachedArticles = null;

  await saveToFilesystem(updated);
  await saveToSupabase(updated);

  return true;
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

export function parseRssOrAtom(xml: string): any[] {
  const items: any[] = [];

  // 1. Try RSS 2.0 <item>
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const getTag = (tag: string): string => {
      const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return plainMatch ? plainMatch[1].trim() : '';
    };

    const title = stripHtml(getTag('title'));
    let link = getTag('link');
    if (!link) {
      const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
      link = hrefMatch ? hrefMatch[1] : getTag('guid');
    }

    const desc = stripHtml(getTag('description') || getTag('content:encoded')).slice(0, 500);
    const pubDate = getTag('pubDate') || getTag('dc:date');
    const enclosureMatch =
      block.match(/<enclosure[^>]+url="([^"]+)"/i) ||
      block.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ||
      block.match(/<media:content[^>]+url="([^"]+)"/i);

    if (title) {
      items.push({
        title,
        link: link || '#',
        description: desc || title,
        pubDate: pubDate || new Date().toISOString(),
        imageUrl: enclosureMatch?.[1],
      });
    }
  }

  // 2. If no items found, try Atom <entry>
  if (items.length === 0) {
    const entryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
    let entryMatch;
    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const block = entryMatch[1];
      const getTag = (tag: string): string => {
        const cdataMatch = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
        if (cdataMatch) return cdataMatch[1].trim();
        const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        return plainMatch ? plainMatch[1].trim() : '';
      };

      const title = stripHtml(getTag('title'));
      const linkMatch = block.match(/<link[^>]+href="([^"]+)"/i);
      const link = linkMatch ? linkMatch[1] : getTag('id');
      const desc = stripHtml(getTag('summary') || getTag('content')).slice(0, 500);
      const pubDate = getTag('published') || getTag('updated');

      if (title) {
        items.push({
          title,
          link: link || '#',
          description: desc || title,
          pubDate: pubDate || new Date().toISOString(),
          imageUrl: undefined,
        });
      }
    }
  }

  return items;
}

export async function validateFeedUrl(url: string): Promise<{
  valid: boolean;
  articleCount: number;
  sampleTitle?: string;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'TeQVu-Realtime-Intelligence/2.0 (Feed Validator; +https://teqvu.dev)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(8000),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return {
        valid: false,
        articleCount: 0,
        latencyMs,
        error: `Server responded with HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const xml = await res.text();
    const items = parseRssOrAtom(xml);

    if (items.length === 0) {
      return {
        valid: false,
        articleCount: 0,
        latencyMs,
        error: 'URL reachable but no valid RSS <item> or Atom <entry> elements could be parsed.',
      };
    }

    return {
      valid: true,
      articleCount: items.length,
      sampleTitle: items[0].title,
      latencyMs,
    };
  } catch (err: any) {
    return {
      valid: false,
      articleCount: 0,
      latencyMs: Date.now() - start,
      error: err.name === 'TimeoutError' ? 'Connection timed out after 8 seconds' : err.message,
    };
  }
}

export async function fetchArticlesFromSource(source: Source): Promise<{
  articles: Article[];
  latencyMs: number;
  error?: string;
}> {
  if (source.status === 'inactive') {
    return { articles: [], latencyMs: 0 };
  }

  const start = Date.now();
  try {
    const res = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TeQVu/2.0',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(7000),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      return { articles: [], latencyMs, error: `HTTP ${res.status}` };
    }

    const xml = await res.text();
    const items = parseRssOrAtom(xml);

    const articles: Article[] = items.map((item, idx) => {
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
      return {
        id: `${source.id}-${idx}-${pubDate.slice(0, 10)}`,
        title: item.title,
        summary: item.description || `Real-time intelligence from ${source.name}.`,
        content: item.description,
        url: item.link,
        imageUrl: item.imageUrl,
        category: source.category,
        source: {
          ...source,
          articlesCount: items.length,
          lastChecked: new Date().toISOString(),
        },
        publishedAt: pubDate,
        readingTime: Math.max(2, Math.min(8, Math.ceil(item.title.split(' ').length / 40))),
        technologies: [source.category],
        isBreaking: false,
      };
    });

    return { articles, latencyMs };
  } catch (err: any) {
    return { articles: [], latencyMs: Date.now() - start, error: err.message };
  }
}

export async function fetchAllActiveArticles(): Promise<{
  articles: Article[];
  sourcesTelemetry: SourceTelemetry[];
}> {
  const sources = await getSources();
  const activeSources = sources.filter((s) => s.status === 'active');

  const results = await Promise.all(
    activeSources.map(async (src) => {
      const { articles, latencyMs, error } = await fetchArticlesFromSource(src);
      const telemetry: SourceTelemetry = {
        sourceId: src.id,
        sourceName: src.name,
        url: src.url,
        status: error ? 'error' : src.status,
        articlesCount: articles.length,
        latencyMs,
        lastChecked: new Date().toISOString(),
        errorMessage: error,
        isCustom: src.isCustom,
      };
      return { src, articles, telemetry };
    })
  );

  const allArticles: Article[] = [];
  const telemetryList: SourceTelemetry[] = [];

  for (const res of results) {
    allArticles.push(...res.articles);
    telemetryList.push(res.telemetry);
  }

  // Deduplicate by title prefix
  const seen = new Set<string>();
  const uniqueArticles = allArticles.filter((a) => {
    const key = a.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  uniqueArticles.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  _cachedArticles = {
    timestamp: Date.now(),
    articles: uniqueArticles,
  };

  return {
    articles: uniqueArticles,
    sourcesTelemetry: telemetryList,
  };
}
