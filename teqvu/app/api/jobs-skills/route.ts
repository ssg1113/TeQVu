import { NextResponse } from 'next/server';
import type { Skill, CareerPath, JobPosting } from '../../../lib/types';

export const dynamic = 'force-dynamic';

// Helper to strip HTML tags and decode entities
function cleanText(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categorizeJob(title: string, tags: string[], description: string): string {
  const text = `${title} ${(tags || []).join(' ')} ${description || ''}`.toLowerCase();

  if (
    text.includes('machine learning') ||
    text.includes(' ai ') ||
    text.includes('llm') ||
    text.includes('deep learning') ||
    text.includes('pytorch') ||
    text.includes('nlp') ||
    text.includes('computer vision') ||
    text.includes('generative ai') ||
    text.includes('artificial intelligence')
  ) {
    return 'ai-ml-engineering';
  }

  if (
    text.includes('frontend') ||
    text.includes('front-end') ||
    text.includes('react') ||
    text.includes('vue') ||
    text.includes('angular') ||
    text.includes('ui/ux') ||
    text.includes('web developer') ||
    text.includes('next.js') ||
    text.includes('css') ||
    text.includes('tailwind')
  ) {
    return 'frontend-development';
  }

  if (
    text.includes('devops') ||
    text.includes('sre') ||
    text.includes('site reliability') ||
    text.includes('infrastructure') ||
    text.includes('platform engineer') ||
    text.includes('kubernetes') ||
    text.includes('cloud engineer') ||
    text.includes('terraform') ||
    text.includes('aws') ||
    text.includes('gcp') ||
    text.includes('azure')
  ) {
    return 'devops-cloud';
  }

  if (
    text.includes('security') ||
    text.includes('cyber') ||
    text.includes('infosec') ||
    text.includes('penetration') ||
    text.includes('soc analyst') ||
    text.includes('vulnerability') ||
    text.includes('cryptography')
  ) {
    return 'cybersecurity';
  }

  if (
    text.includes('data engineer') ||
    text.includes('data scientist') ||
    text.includes('data analyst') ||
    text.includes('analytics') ||
    text.includes('etl') ||
    text.includes('big data') ||
    text.includes('snowflake') ||
    text.includes('databricks') ||
    text.includes('spark')
  ) {
    return 'data-science';
  }

  return 'backend-development';
}

const CAREER_PATHS_DEFINITIONS: Omit<CareerPath, 'activeJobsCount' | 'topCompanies'>[] = [
  {
    id: 'ai-ml-engineering',
    name: 'AI/ML Engineering',
    description: 'Design, build, and deploy production machine learning models, LLM systems, fine-tuning pipelines, and agentic workflows.',
    icon: 'Brain',
    skills: ['Model Fine-Tuning', 'Agentic Workflows', 'Vector Databases', 'PyTorch', 'Prompt Evaluation'],
    technologies: ['PyTorch', 'Hugging Face', 'LangChain', 'vLLM', 'pgvector'],
    averageSalary: '$165,000 - $240,000',
    growthRate: 48,
  },
  {
    id: 'frontend-development',
    name: 'Frontend Development',
    description: 'Create high-performance, accessible, and reactive user interfaces using modern component systems and web standards.',
    icon: 'Layout',
    skills: ['React 19 & Server Components', 'TypeScript', 'Tailwind CSS', 'Performance Profiling', 'Web Vitals'],
    technologies: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Vite'],
    averageSalary: '$120,000 - $185,000',
    growthRate: 22,
  },
  {
    id: 'backend-development',
    name: 'Backend Development',
    description: 'Architect resilient APIs, microservices, distributed data pipelines, and real-time transaction processing systems.',
    icon: 'Server',
    skills: ['System Design', 'Concurrent Systems', 'Database Optimization', 'Message Queues', 'Security & Auth'],
    technologies: ['Node.js / NestJS', 'Go', 'Rust', 'PostgreSQL', 'Redis'],
    averageSalary: '$135,000 - $195,000',
    growthRate: 28,
  },
  {
    id: 'devops-cloud',
    name: 'DevOps & Platform Engineering',
    description: 'Build automated continuous integration pipelines, infrastructure as code, container orchestration, and observability platforms.',
    icon: 'Terminal',
    skills: ['Kubernetes Orchestration', 'Infrastructure as Code', 'eBPF Observability', 'CI/CD Pipelines', 'Cloud Security'],
    technologies: ['Kubernetes', 'Terraform', 'Docker', 'AWS / GCP', 'eBPF'],
    averageSalary: '$140,000 - $210,000',
    growthRate: 35,
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & Application Security',
    description: 'Protect enterprise infrastructure, analyze vulnerabilities, implement zero-trust architectures, and secure supply chains.',
    icon: 'Shield',
    skills: ['Threat Modeling', 'Zero Trust Architecture', 'Penetration Testing', 'Cryptography', 'Memory Safety Auditing'],
    technologies: ['Rust', 'eBPF', 'Wazuh', 'HashiCorp Vault', 'WireGuard'],
    averageSalary: '$145,000 - $220,000',
    growthRate: 40,
  },
  {
    id: 'data-science',
    name: 'Data Science & Analytics',
    description: 'Extract statistical insights, build predictive models, design experiment frameworks, and build data lakes.',
    icon: 'BarChart3',
    skills: ['Exploratory Data Analysis', 'Statistical Modeling', 'Feature Engineering', 'Data Warehousing', 'BI Visualization'],
    technologies: ['Python', 'DuckDB', 'Apache Spark', 'Polars', 'dbt'],
    averageSalary: '$130,000 - $190,000',
    growthRate: 26,
  },
];

const SKILL_DEFINITIONS = [
  {
    id: 'skill-1',
    name: 'Agentic Workflow Orchestration',
    category: 'AI/ML Engineering',
    keywords: ['agent', 'llm', 'rag', 'langchain', 'generative ai', 'openai', 'prompt', 'vllm', 'multi-agent'],
    roles: ['AI Engineer', 'Automation Architect', 'Full Stack AI Developer'],
    relatedTechs: ['LangChain', 'AutoGPT', 'LlamaIndex', 'Python'],
    baseGrowth: 110,
  },
  {
    id: 'skill-2',
    name: 'Rust Systems Programming',
    category: 'Systems & Backend',
    keywords: ['rust', 'wasm', 'webassembly', 'systems engineer', 'embedded', 'tokio'],
    roles: ['Systems Engineer', 'Security Engineer', 'Infrastructure Developer'],
    relatedTechs: ['Rust', 'WebAssembly', 'Linux Kernel', 'Tokio'],
    baseGrowth: 75,
  },
  {
    id: 'skill-3',
    name: 'Retrieval-Augmented Generation (RAG)',
    category: 'AI/ML Engineering',
    keywords: ['rag', 'vector', 'pgvector', 'pinecone', 'embeddings', 'qdrant', 'chroma', 'semantic search'],
    roles: ['Machine Learning Engineer', 'Data Scientist', 'Search Specialist'],
    relatedTechs: ['pgvector', 'Pinecone', 'Embeddings', 'OpenAI'],
    baseGrowth: 95,
  },
  {
    id: 'skill-4',
    name: 'Next.js App Router & Server Actions',
    category: 'Frontend & Full Stack',
    keywords: ['next.js', 'react', 'typescript', 'tailwind', 'frontend', 'server actions', 'app router'],
    roles: ['Frontend Engineer', 'Full Stack Developer', 'Web App Architect'],
    relatedTechs: ['Next.js', 'React 19', 'TypeScript', 'Tailwind CSS'],
    baseGrowth: 40,
  },
  {
    id: 'skill-5',
    name: 'Cloud-Native eBPF Observability',
    category: 'DevOps & Infrastructure',
    keywords: ['kubernetes', 'k8s', 'ebpf', 'cilium', 'prometheus', 'helm', 'docker', 'terraform', 'cloud'],
    roles: ['Site Reliability Engineer (SRE)', 'Platform Engineer', 'DevOps Specialist'],
    relatedTechs: ['eBPF', 'Cilium', 'Kubernetes', 'Prometheus'],
    baseGrowth: 55,
  },
  {
    id: 'skill-6',
    name: 'PostgreSQL Vector Search & Indexing',
    category: 'Databases & Data Engineering',
    keywords: ['postgresql', 'postgres', 'pgvector', 'database', 'sql', 'hnsw', 'ivfflat', 'indexing'],
    roles: ['Database Administrator', 'Data Engineer', 'Backend Engineer'],
    relatedTechs: ['pgvector', 'PostgreSQL', 'HNSW', 'IVFFlat'],
    baseGrowth: 80,
  },
  {
    id: 'skill-7',
    name: 'Python Deep Learning & Production AI',
    category: 'AI/ML Engineering',
    keywords: ['python', 'pytorch', 'deep learning', 'machine learning', 'tensorflow', 'model fine-tuning'],
    roles: ['MLOps Engineer', 'AI Research Scientist', 'Data Scientist'],
    relatedTechs: ['Python', 'PyTorch', 'Hugging Face', 'CUDA'],
    baseGrowth: 98,
  },
  {
    id: 'skill-8',
    name: 'Go & High-Concurrency Systems',
    category: 'Systems & Backend',
    keywords: ['golang', 'go ', 'microservices', 'grpc', 'distributed systems', 'concurrency'],
    roles: ['Distributed Systems Engineer', 'Cloud Architect', 'Go Backend Lead'],
    relatedTechs: ['Go', 'gRPC', 'Kafka', 'Docker'],
    baseGrowth: 65,
  },
];

// In-memory cache to keep responses fast and prevent memory overload
interface CachedData {
  timestamp: number;
  processedJobs: JobPosting[];
  liveSkills: Skill[];
  liveCareerPaths: CareerPath[];
  totalOpenings: number;
  remotePercentage: number;
  topHiringTrack: string;
  topSkill: string;
}

let inMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 45 * 1000; // 45 seconds real-time cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get('track') || 'all';
  const remoteOnly = searchParams.get('remote') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  try {
    const isCacheFresh = inMemoryCache && Date.now() - inMemoryCache.timestamp < CACHE_TTL_MS;

    let processedJobs = inMemoryCache?.processedJobs || [];
    let liveSkills = inMemoryCache?.liveSkills || [];
    let liveCareerPaths = inMemoryCache?.liveCareerPaths || [];
    let totalOpenings = inMemoryCache?.totalOpenings || 0;
    let remotePercentage = inMemoryCache?.remotePercentage || 0;
    let topHiringTrack = inMemoryCache?.topHiringTrack || 'AI/ML & Cloud Systems';
    let topSkill = inMemoryCache?.topSkill || 'Agentic Workflow Orchestration';

    if (!isCacheFresh) {
      // Fetch live jobs from Arbeitnow, Remotive & Hacker News in parallel
      const [arbeitnowRes, remotiveRes, hnRes] = await Promise.allSettled([
        fetch('https://www.arbeitnow.com/api/job-board-api', {
          headers: { 'User-Agent': 'TeQVu-Jobs-Intelligence/1.0' },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        }),
        fetch('https://remotive.com/api/remote-jobs?limit=30', {
          headers: { 'User-Agent': 'TeQVu-Jobs-Intelligence/1.0' },
          signal: AbortSignal.timeout(6000),
          cache: 'no-store',
        }),
        fetch('https://hacker-news.firebaseio.com/v0/jobstories.json', {
          signal: AbortSignal.timeout(4000),
          cache: 'no-store',
        }),
      ]);

      const rawJobs: any[] = [];

      // Parse Arbeitnow (take top 30 to conserve memory and speed)
      if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value.ok) {
        try {
          const anData = await arbeitnowRes.value.json();
          if (Array.isArray(anData.data)) {
            anData.data.slice(0, 30).forEach((j: any) => {
              rawJobs.push({
                id: `an-${j.slug || Math.random().toString(36).substring(2, 9)}`,
                title: cleanText(j.title || 'Software Engineer'),
                company: cleanText(j.company_name || 'Tech Company'),
                location: j.location || (j.remote ? 'Remote' : 'Worldwide'),
                isRemote: Boolean(j.remote),
                url: j.url || '#',
                tags: Array.isArray(j.tags) ? j.tags.map((t: string) => cleanText(t)).filter(Boolean) : [],
                salary: '',
                postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
                descriptionSnippet: cleanText(j.description || '').slice(0, 160),
                source: 'Arbeitnow Live',
              });
            });
          }
        } catch (err: any) {
          // Silent fallback on timeout/network
        }
      }

      // Parse Remotive
      if (remotiveRes.status === 'fulfilled' && remotiveRes.value.ok) {
        try {
          const remotiveData = await remotiveRes.value.json();
          if (Array.isArray(remotiveData.jobs)) {
            remotiveData.jobs.slice(0, 25).forEach((j: any) => {
              rawJobs.push({
                id: `remotive-${j.id || Math.random().toString(36).substring(2, 9)}`,
                title: cleanText(j.title || 'Engineer'),
                company: cleanText(j.company_name || 'Tech Company'),
                location: j.candidate_required_location || 'Remote (Worldwide)',
                isRemote: true,
                url: j.url || '#',
                tags: Array.isArray(j.tags) ? j.tags.map((t: string) => cleanText(t)).filter(Boolean) : [],
                salary: j.salary || '',
                postedAt: j.publication_date || new Date().toISOString(),
                descriptionSnippet: cleanText(j.description || '').slice(0, 160),
                source: 'Remotive Live',
              });
            });
          }
        } catch (err: any) {
          // Silent fallback on timeout/network
        }
      }

      // Parse Hacker News Job Stories
      if (hnRes.status === 'fulfilled' && hnRes.value.ok) {
        try {
          const hnIds: number[] = (await hnRes.value.json()).slice(0, 10);
          const hnDetails = await Promise.allSettled(
            hnIds.map(async (id) => {
              const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
                signal: AbortSignal.timeout(3000),
              });
              return r.ok ? await r.json() : null;
            })
          );

          hnDetails.forEach((result) => {
            if (result.status === 'fulfilled' && result.value && result.value.title) {
              const item = result.value;
              const fullTitle = cleanText(item.title);
              const parts = fullTitle.split(/ is hiring | hires | looking for /i);
              const company = parts.length > 1 ? parts[0].trim() : 'YC Startup';
              const role = parts.length > 1 ? parts[1].trim() : fullTitle;

              rawJobs.push({
                id: `hn-${item.id}`,
                title: role || fullTitle,
                company: company,
                location: 'Remote / US',
                isRemote: true,
                url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                tags: ['YC Startup', 'Software Engineering', 'Remote'],
                salary: '',
                postedAt: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
                descriptionSnippet: cleanText(item.text || '').slice(0, 160),
                source: 'Hacker News / YC',
              });
            }
          });
        } catch (err: any) {
          // Silent fallback on timeout/network
        }
      }

      // If we got raw jobs from live endpoints, process and update cache
      if (rawJobs.length > 0) {
        // Deduplicate jobs by title & company
        const seenMap = new Set<string>();
        const deduplicatedJobs = rawJobs.filter((j) => {
          const key = `${j.title.toLowerCase()}::${j.company.toLowerCase()}`;
          if (seenMap.has(key)) return false;
          seenMap.add(key);
          return true;
        });

        // Categorize jobs
        processedJobs = deduplicatedJobs.map((j) => {
          const category = categorizeJob(j.title, j.tags, j.descriptionSnippet);
          return {
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            isRemote: j.isRemote,
            url: j.url,
            tags: j.tags.length > 0 ? j.tags.slice(0, 5) : ['Tech', 'Engineering'],
            salary: j.salary || undefined,
            postedAt: j.postedAt,
            category,
            source: j.source,
            descriptionSnippet: j.descriptionSnippet ? j.descriptionSnippet + '...' : undefined,
          };
        });

        // Compute live skills demand & counts purely from real postings
        liveSkills = SKILL_DEFINITIONS.map((def) => {
          let matchCount = 0;
          processedJobs.forEach((j) => {
            const text = `${j.title} ${(j.tags || []).join(' ')} ${j.descriptionSnippet || ''}`.toLowerCase();
            if (def.keywords.some((kw) => text.includes(kw))) {
              matchCount++;
            }
          });

          const demand: 'Very High' | 'High' | 'Medium' | 'Low' =
            matchCount >= 20 ? 'Very High' : matchCount >= 8 ? 'High' : matchCount >= 2 ? 'Medium' : 'Low';
          const growth = Math.round(def.baseGrowth + Math.min(45, matchCount * 0.5));

          return {
            id: def.id,
            name: def.name,
            category: def.category,
            demand,
            growth,
            roles: def.roles,
            relatedTechs: def.relatedTechs,
            activeJobsCount: matchCount,
          };
        }).sort((a, b) => (b.activeJobsCount || 0) - (a.activeJobsCount || 0));

        // Compute career paths with real-time active job counts and dynamically extracted hiring companies
        liveCareerPaths = CAREER_PATHS_DEFINITIONS.map((cp) => {
          const pathJobs = processedJobs.filter((j) => j.category === cp.id);
          const companyCountMap: Record<string, number> = {};
          pathJobs.forEach((j) => {
            if (j.company && j.company !== 'Tech Company' && j.company !== 'YC Startup') {
              companyCountMap[j.company] = (companyCountMap[j.company] || 0) + 1;
            }
          });

          const topCompanies = Object.entries(companyCountMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name]) => name);

          return {
            ...cp,
            activeJobsCount: pathJobs.length,
            growthRate: Math.round(cp.growthRate + Math.min(25, pathJobs.length * 0.2)),
            topCompanies: topCompanies,
          };
        });

        totalOpenings = processedJobs.length;
        const remoteCount = processedJobs.filter((j) => j.isRemote).length;
        remotePercentage = totalOpenings > 0 ? Math.round((remoteCount / totalOpenings) * 100) : 0;

        const sortedTracks = [...liveCareerPaths].sort((a, b) => (b.activeJobsCount || 0) - (a.activeJobsCount || 0));
        topHiringTrack = sortedTracks[0]?.name || 'Full Stack & AI';
        topSkill = liveSkills[0]?.name || 'Agentic Workflow Orchestration';

        // Update in-memory cache
        inMemoryCache = {
          timestamp: Date.now(),
          processedJobs,
          liveSkills,
          liveCareerPaths,
          totalOpenings,
          remotePercentage,
          topHiringTrack,
          topSkill,
        };
      }
    }

    // Apply filtering for returned jobs list
    let filteredJobs = processedJobs;
    if (track !== 'all') {
      filteredJobs = filteredJobs.filter((j) => j.category === track);
    }
    if (remoteOnly) {
      filteredJobs = filteredJobs.filter((j) => j.isRemote);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isLive: totalOpenings > 0,
      source: 'Arbeitnow, Remotive & Hacker News Live Streams',
      stats: {
        totalOpenings,
        remotePercentage,
        topHiringTrack,
        topSkill,
      },
      skills: liveSkills,
      careerPaths: liveCareerPaths,
      jobs: filteredJobs.slice(0, limit),
    });
  } catch (error: any) {
    console.error('Error in jobs & skills API:', error);

    // If cache exists, use it
    if (inMemoryCache) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        isLive: true,
        source: 'TeQVu In-Memory Live Cache',
        stats: {
          totalOpenings: inMemoryCache.totalOpenings,
          remotePercentage: inMemoryCache.remotePercentage,
          topHiringTrack: inMemoryCache.topHiringTrack,
          topSkill: inMemoryCache.topSkill,
        },
        skills: inMemoryCache.liveSkills,
        careerPaths: inMemoryCache.liveCareerPaths,
        jobs: inMemoryCache.processedJobs.slice(0, limit),
      });
    }

    const emptyCareerPaths: CareerPath[] = CAREER_PATHS_DEFINITIONS.map((cp) => ({
      ...cp,
      activeJobsCount: 0,
      topCompanies: [],
    }));

    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      isLive: false,
      source: 'Offline / Network Retry',
      stats: {
        totalOpenings: 0,
        remotePercentage: 0,
        topHiringTrack: 'N/A',
        topSkill: 'N/A',
      },
      skills: [],
      careerPaths: emptyCareerPaths,
      jobs: [],
      error: error?.message || 'Failed to fetch real-time jobs',
    }, { status: 500 });
  }
}
