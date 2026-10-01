import { NextResponse } from 'next/server';
import type { Article } from '../../../lib/types';
import { fetchAllActiveArticles, getSources } from '../../../lib/services/newsSourceStore';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1 minute revalidation for real-time freshness

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

function categorizeArticle(title: string, description: string, defaultCategory: string): string {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of Object.entries(TECH_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return category;
  }
  return defaultCategory || 'Software Engineering';
}

function extractTechs(title: string, description: string, defaultCategory: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const known = [
    'GPT-4', 'GPT-4o', 'GPT-5', 'Gemini', 'Claude', 'LLaMA', 'Mistral', 'Nvidia', 'CUDA',
    'React', 'Next.js', 'TypeScript', 'Python', 'Rust', 'Go', 'Kubernetes', 'Docker',
    'AWS', 'Azure', 'Google Cloud', 'PostgreSQL', 'MongoDB', 'Redis', 'Supabase',
    'ChatGPT', 'OpenAI', 'DeepMind', 'Anthropic', 'WebAssembly', 'Linux',
    'GitHub', 'VS Code', 'iPhone', 'Android', 'Bitcoin', 'Ethereum',
  ];
  const matched = known.filter((t) => text.includes(t.toLowerCase())).slice(0, 4);
  return matched.length > 0 ? matched : [defaultCategory || 'Software Engineering'];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'All';
  const tech = searchParams.get('tech') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '30', 10), 100);

  try {
    const { articles: liveArticles, sourcesTelemetry } = await fetchAllActiveArticles();
    const sources = await getSources();

    // Enrich articles with categorization & tech detection
    let articles: Article[] = liveArticles.map((a) => {
      const cat = categorizeArticle(a.title, a.summary, a.category);
      const techs = extractTechs(a.title, a.summary, cat);
      return {
        ...a,
        category: cat,
        technologies: techs,
      };
    });

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
      sources: sources.filter((s) => s.status === 'active').map((s) => s.name),
      articles: articles.slice(0, limit),
      telemetry: {
        activeSourcesCount: sources.filter((s) => s.status === 'active').length,
        totalSourcesCount: sources.length,
        sourcesTelemetry,
      },
    });
  } catch (err: any) {
    console.error('[tech-news API Error]:', err);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        timestamp: new Date().toISOString(),
        sources: [],
        articles: [],
        error: err.message,
      },
      { status: 500 }
    );
  }
}
