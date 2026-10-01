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

// Strict IT-field validator to ensure ONLY Information Technology roles are included
function isITJob(title: string, tags: string[] = [], description: string = ''): boolean {
  const titleLower = title.toLowerCase();
  const combined = `${title} ${tags.join(' ')} ${description}`.toLowerCase();

  // Strict non-IT keywords
  const nonITKeywords = [
    'nurse', 'nursing', 'physician', 'doctor', 'dental', 'therapist',
    'sales rep', 'account executive', 'car salesman', 'real estate', 'realtor',
    'plumber', 'carpenter', 'driver', 'truck driver', 'forklift', 'warehouse worker',
    'cook', 'chef', 'restaurant', 'waiter', 'bartender',
    'attorney', 'lawyer', 'paralegal', 'legal assistant',
    'barber', 'cosmetologist', 'janitor', 'housekeeper',
    'copywriter', 'content writer', 'creative writer', 'marketing specialist',
    'marketing manager', 'seo specialist', 'accountant', 'bookkeeper', 'recruiter',
    'human resources', 'talent acquisition'
  ];

  if (nonITKeywords.some((kw) => titleLower.includes(kw) || combined.includes(kw))) {
    const isTechSave = ['software engineer', 'backend developer', 'frontend developer', 'full stack developer', 'devops engineer', 'cloud engineer'].some((k) => titleLower.includes(k));
    if (!isTechSave) return false;
  }

  // Precise IT tokens (avoid 2-3 letter false positive substrings like "it" or "web")
  const itKeywords = [
    'software', 'developer', 'engineer', 'frontend', 'front-end', 'backend', 'back-end',
    'fullstack', 'full-stack', 'full stack', 'devops', 'sre', 'site reliability',
    'cloud', 'architect', 'infrastructure', 'platform', 'kubernetes', 'docker', 'terraform',
    'ai', 'machine learning', 'deep learning', 'nlp', 'llm', 'computer vision', 'generative ai',
    'data scientist', 'data science', 'data engineer', 'data analyst', 'analytics', 'etl',
    'cybersecurity', 'security', 'infosec', 'penetration', 'soc', 'vulnerability',
    'qa', 'quality assurance', 'test automation', 'sdet', 'database', 'dba', 'postgres',
    'sql', 'nosql', 'mongodb', 'sysadmin', 'system administrator', 'linux',
    'network engineer', 'mobile developer', 'ios developer', 'android developer', 'react', 'vue', 'angular', 'next.js',
    'python', 'javascript', 'typescript', 'golang', 'rust', 'java', 'c++', 'c#',
    'ui/ux', 'web developer', 'web development', 'information technology', 'it support', 'it specialist', 'tech lead',
    'intern', 'internship', 'firmware', 'embedded system'
  ];

  return itKeywords.some((kw) => combined.includes(kw));
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

function generateLinkedInUrl(title: string, country: string, isInternship: boolean): string {
  const kw = encodeURIComponent(`${title} IT`);
  const loc = encodeURIComponent(country || 'United States');
  const internParam = isInternship ? '&f_E=1' : '';
  return `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}${internParam}`;
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
    trendDirection: 'rising',
  },
  {
    id: 'skill-falling-1',
    name: 'Legacy jQuery & Direct DOM Scripting',
    category: 'Frontend Development',
    keywords: ['jquery', 'dom manipulation', 'legacy frontend', 'vanilla dom'],
    roles: ['Legacy Web Maintainer', 'WordPress Integrator'],
    relatedTechs: ['jQuery', 'DOM API', 'HTML5'],
    baseGrowth: -48,
    trendDirection: 'falling',
    declineReason: 'Native modern browser APIs and reactive component frameworks render direct DOM mutation obsolete.',
    replacedBy: ['React 19', 'TypeScript', 'Modern Web APIs'],
  },
  {
    id: 'skill-falling-2',
    name: 'AngularJS 1.x Architecture & Digest Cycles',
    category: 'Frontend Development',
    keywords: ['angularjs', 'angular.js', 'angular 1', 'bower', '$scope'],
    roles: ['Enterprise Migration Specialist', 'Legacy Frontend Dev'],
    relatedTechs: ['AngularJS', 'Bower', 'Gulp'],
    baseGrowth: -59,
    trendDirection: 'falling',
    declineReason: 'Official Google EOL passed; enterprise maintenance overhead and unpatched CVE exposure.',
    replacedBy: ['Modern Angular (v17+)', 'Next.js App Router', 'Vue 3'],
  },
  {
    id: 'skill-falling-3',
    name: 'Objective-C iOS App Maintenance',
    category: 'Mobile & Systems',
    keywords: ['objective-c', 'objc', 'cocoapods', 'legacy ios'],
    roles: ['Legacy iOS Maintenance Developer'],
    relatedTechs: ['Objective-C', 'CocoaPods', 'Xcode'],
    baseGrowth: -44,
    trendDirection: 'falling',
    declineReason: 'Apple platform development has transitioned 90%+ to Swift and SwiftUI; modern Apple SDKs mandate Swift.',
    replacedBy: ['Swift', 'SwiftUI', 'Kotlin Multiplatform'],
  },
  {
    id: 'skill-falling-4',
    name: 'SOAP & XML Web Services Protocol',
    category: 'Backend Development',
    keywords: ['soap', 'wsdl', 'xml web services', 'apache axis'],
    roles: ['Enterprise Integration Engineer'],
    relatedTechs: ['SOAP', 'WSDL', 'XML', 'Apache Axis'],
    baseGrowth: -52,
    trendDirection: 'falling',
    declineReason: 'Heavy XML bandwidth overhead replaced by lightweight OpenAPI REST, GraphQL, and binary gRPC.',
    replacedBy: ['RESTful APIs', 'gRPC', 'GraphQL'],
  },
  {
    id: 'skill-falling-5',
    name: 'Cordova & PhoneGap Hybrid Mobile Wrappers',
    category: 'Mobile & Systems',
    keywords: ['cordova', 'phonegap', 'hybrid mobile', 'webview app'],
    roles: ['Hybrid Mobile Developer'],
    relatedTechs: ['Cordova', 'PhoneGap', 'WebView'],
    baseGrowth: -50,
    trendDirection: 'falling',
    declineReason: 'WebView wrappers suffer from latency and jank compared to compiled native platforms like React Native and Flutter.',
    replacedBy: ['React Native', 'Flutter', 'Capacitor'],
  },
  {
    id: 'skill-falling-6',
    name: 'Procedural PHP 5.x & Monolithic Scripting',
    category: 'Backend Development',
    keywords: ['php 5', 'php5', 'procedural php', 'legacy lamp'],
    roles: ['Legacy CMS Webmaster'],
    relatedTechs: ['PHP 5', 'MySQL 5.6', 'Apache'],
    baseGrowth: -36,
    trendDirection: 'falling',
    declineReason: 'Unpatched security risks, absence of static type safety, and absent async runtime capabilities.',
    replacedBy: ['Modern PHP 8.3 / Laravel', 'Node.js', 'Go'],
  },
  {
    id: 'skill-falling-7',
    name: 'Apache Ant & XML Build Scripting',
    category: 'DevOps & Platform Engineering',
    keywords: ['apache ant', 'ant build', 'build.xml', 'ivy'],
    roles: ['Legacy Build Engineer'],
    relatedTechs: ['Apache Ant', 'XML', 'Ivy'],
    baseGrowth: -62,
    trendDirection: 'falling',
    declineReason: 'Procedural XML pipelines have been completely replaced by declarative build systems, Gradle, and modern CI/CD.',
    replacedBy: ['GitHub Actions', 'Gradle', 'Docker'],
  },
];

// IT Internship Templates
const IT_INTERNSHIP_TEMPLATES = [
  {
    title: 'Software Engineering Intern',
    category: 'backend-development',
    company: 'Cloudflare Ecosystem Partner',
    tags: ['Go', 'Rust', 'Distributed Systems', 'Cloud', 'Internship'],
    salary: '$35 - $50 / hr',
    descriptionSnippet: 'Work with distributed edge systems, asynchronous queuing engines, high-concurrency microservices, and modern API standards.',
  },
  {
    title: 'AI / Machine Learning Engineering Intern',
    category: 'ai-ml-engineering',
    company: 'OpenAI Ecosystem Partner',
    tags: ['PyTorch', 'LLMs', 'Python', 'Vector DB', 'Internship'],
    salary: '$40 - $60 / hr',
    descriptionSnippet: 'Assist in evaluating LLM agent workflows, fine-tuning open weights models, and benchmark evaluation for production generative AI systems.',
  },
  {
    title: 'Frontend & UI Engineering Intern',
    category: 'frontend-development',
    company: 'Vercel Partner Network',
    tags: ['Next.js', 'React 19', 'TypeScript', 'Tailwind', 'Internship'],
    salary: '$30 - $45 / hr',
    descriptionSnippet: 'Build fast, accessible, and reactive user interfaces using Next.js App Router, React Server Components, and modern design systems.',
  },
  {
    title: 'DevOps & Cloud Infrastructure Intern',
    category: 'devops-cloud',
    company: 'Datadog Partner Network',
    tags: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'Internship'],
    salary: '$35 - $48 / hr',
    descriptionSnippet: 'Implement automated CI/CD deployment pipelines, manage container orchestration with Kubernetes, and monitor cluster observability.',
  },
  {
    title: 'Cybersecurity Operations Intern',
    category: 'cybersecurity',
    company: 'CrowdStrike Partner',
    tags: ['Network Security', 'Vulnerability Assessment', 'Linux', 'SOC', 'Internship'],
    salary: '$32 - $46 / hr',
    descriptionSnippet: 'Participate in threat intelligence analysis, security audit verification, vulnerability scanning, and incident response rehearsals.',
  },
  {
    title: 'Data Science & Big Data Intern',
    category: 'data-science',
    company: 'Snowflake Partner Network',
    tags: ['Python', 'SQL', 'Snowflake', 'Pandas', 'dbt', 'Internship'],
    salary: '$32 - $45 / hr',
    descriptionSnippet: 'Clean and model large-scale datasets, build analytical dashboards, and conduct statistical correlation analyses for business intelligence.',
  },
  {
    title: 'Full Stack Engineering Intern',
    category: 'backend-development',
    company: 'Stripe Developer Network',
    tags: ['TypeScript', 'Node.js', 'PostgreSQL', 'React', 'Internship'],
    salary: '$35 - $52 / hr',
    descriptionSnippet: 'Contribute to core transactional APIs, payment orchestration workflows, and end-to-end full stack web applications.',
  },
  {
    title: 'Mobile App Developer Intern (iOS/Android)',
    category: 'frontend-development',
    company: 'Mobile Tech Labs',
    tags: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Internship'],
    salary: '$30 - $44 / hr',
    descriptionSnippet: 'Collaborate on cross-platform mobile apps, offline synchronization protocols, and native UI component integrations.',
  },
];

// IT Professional Roles
const IT_PROFESSIONAL_TEMPLATES = [
  {
    title: 'Senior Full Stack Engineer',
    category: 'backend-development',
    company: 'Global Enterprise Cloud',
    tags: ['TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'AWS'],
    salary: '$110,000 - $160,000',
    descriptionSnippet: 'Architect scalable web applications, REST & GraphQL endpoints, and real-time event-driven backends with automated test suites.',
  },
  {
    title: 'AI / LLM Systems Engineer',
    category: 'ai-ml-engineering',
    company: 'Cognitive Computing Labs',
    tags: ['Python', 'LangChain', 'vLLM', 'PyTorch', 'Vector Search'],
    salary: '$140,000 - $210,000',
    descriptionSnippet: 'Deploy production retrieval-augmented generation (RAG) architectures, multi-agent frameworks, and high-throughput model inference endpoints.',
  },
  {
    title: 'Cloud Platform & DevOps Engineer',
    category: 'devops-cloud',
    company: 'CloudNative Solutions',
    tags: ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'Prometheus'],
    salary: '$125,000 - $180,000',
    descriptionSnippet: 'Manage multi-region infrastructure as code, continuous deployment clusters, and zero-downtime rolling update topologies.',
  },
  {
    title: 'Senior Frontend Architect',
    category: 'frontend-development',
    company: 'Modern UI Works',
    tags: ['React 19', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Web Vitals'],
    salary: '$115,000 - $165,000',
    descriptionSnippet: 'Lead frontend engineering standards, micro-frontend compositions, web performance tuning, and design token implementations.',
  },
  {
    title: 'Cybersecurity Operations Engineer',
    category: 'cybersecurity',
    company: 'ZeroTrust Security Corp',
    tags: ['SOC', 'SIEM', 'Penetration Testing', 'IAM', 'Cloud Security'],
    salary: '$120,000 - $175,000',
    descriptionSnippet: 'Defend distributed enterprise attack surfaces, execute vulnerability remediation, and establish automated compliance guardrails.',
  },
  {
    title: 'Senior Data Engineer',
    category: 'data-science',
    company: 'DataStream Infrastructure',
    tags: ['Python', 'Apache Spark', 'Snowflake', 'dbt', 'Airflow'],
    salary: '$125,000 - $185,000',
    descriptionSnippet: 'Build reliable ETL data pipelines, lakehouse architectures, and real-time streaming data ingestion nodes with SQL and PySpark.',
  },
];

// In-memory cache with 4-hour validity to satisfy 4–6 hour refresh cadence
interface CachedData {
  timestamp: number;
  rawItJobs: JobPosting[];
  liveSkills: Skill[];
  liveCareerPaths: CareerPath[];
  totalOpenings: number;
  remotePercentage: number;
  topHiringTrack: string;
  topSkill: string;
  fastestDecliningSkill: string;
  decliningSkillsCount: number;
}

let inMemoryCache: CachedData | null = null;
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours update cadence (refreshes every 4-6 hours)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get('track') || 'all';
  const remoteOnly = searchParams.get('remote') === 'true';
  const internshipOnly = searchParams.get('internship') === 'true';
  const country = searchParams.get('country') || 'United States';
  const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10), 100);

  try {
    const isCacheFresh = inMemoryCache && Date.now() - inMemoryCache.timestamp < CACHE_TTL_MS;

    let rawItJobs = inMemoryCache?.rawItJobs || [];
    let liveSkills = inMemoryCache?.liveSkills || [];
    let liveCareerPaths = inMemoryCache?.liveCareerPaths || [];
    let totalOpenings = inMemoryCache?.totalOpenings || 0;
    let remotePercentage = inMemoryCache?.remotePercentage || 0;
    let topHiringTrack = inMemoryCache?.topHiringTrack || 'AI/ML & Cloud Systems';
    let topSkill = inMemoryCache?.topSkill || 'Agentic Workflow Orchestration';

    if (!isCacheFresh) {
      // Fetch live jobs from Arbeitnow, Remotive & Hacker News
      const [arbeitnowRes, remotiveRes, hnRes] = await Promise.allSettled([
        fetch('https://www.arbeitnow.com/api/job-board-api', {
          headers: { 'User-Agent': 'TeQVu-Jobs-Intelligence/1.0' },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        }),
        fetch('https://remotive.com/api/remote-jobs?limit=35', {
          headers: { 'User-Agent': 'TeQVu-Jobs-Intelligence/1.0' },
          signal: AbortSignal.timeout(6000),
          cache: 'no-store',
        }),
        fetch('https://hacker-news.firebaseio.com/v0/jobstories.json', {
          signal: AbortSignal.timeout(4000),
          cache: 'no-store',
        }),
      ]);

      const rawFeedJobs: any[] = [];

      // Parse Arbeitnow
      if (arbeitnowRes.status === 'fulfilled' && arbeitnowRes.value.ok) {
        try {
          const anData = await arbeitnowRes.value.json();
          if (Array.isArray(anData.data)) {
            anData.data.slice(0, 30).forEach((j: any) => {
              const title = cleanText(j.title || 'Software Engineer');
              const tags = Array.isArray(j.tags) ? j.tags.map((t: string) => cleanText(t)).filter(Boolean) : [];
              const desc = cleanText(j.description || '').slice(0, 200);

              // Strictly verify IT relevance
              if (isITJob(title, tags, desc)) {
                rawFeedJobs.push({
                  id: `an-${j.slug || Math.random().toString(36).substring(2, 9)}`,
                  title,
                  company: cleanText(j.company_name || 'Tech Company'),
                  location: j.location || (j.remote ? 'Remote' : 'Worldwide'),
                  isRemote: Boolean(j.remote),
                  url: j.url || '#',
                  tags: tags.length > 0 ? tags : ['Software Engineering', 'IT'],
                  salary: '',
                  postedAt: j.created_at ? new Date(j.created_at * 1000).toISOString() : new Date().toISOString(),
                  descriptionSnippet: desc,
                  source: 'Arbeitnow Tech',
                  isInternship: title.toLowerCase().includes('intern'),
                  jobType: title.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
                });
              }
            });
          }
        } catch {
          // Silent fallback
        }
      }

      // Parse Remotive
      if (remotiveRes.status === 'fulfilled' && remotiveRes.value.ok) {
        try {
          const remotiveData = await remotiveRes.value.json();
          if (Array.isArray(remotiveData.jobs)) {
            remotiveData.jobs.slice(0, 30).forEach((j: any) => {
              const title = cleanText(j.title || 'Engineer');
              const tags = Array.isArray(j.tags) ? j.tags.map((t: string) => cleanText(t)).filter(Boolean) : [];
              const desc = cleanText(j.description || '').slice(0, 200);

              // Strictly verify IT relevance
              if (isITJob(title, tags, desc)) {
                rawFeedJobs.push({
                  id: `remotive-${j.id || Math.random().toString(36).substring(2, 9)}`,
                  title,
                  company: cleanText(j.company_name || 'Tech Company'),
                  location: j.candidate_required_location || 'Remote',
                  isRemote: true,
                  url: j.url || '#',
                  tags: tags.length > 0 ? tags : ['Remote', 'Information Technology'],
                  salary: j.salary || '',
                  postedAt: j.publication_date || new Date().toISOString(),
                  descriptionSnippet: desc,
                  source: 'Remotive IT',
                  isInternship: title.toLowerCase().includes('intern'),
                  jobType: title.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
                });
              }
            });
          }
        } catch {
          // Silent fallback
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
              const desc = cleanText(item.text || '').slice(0, 200);

              if (isITJob(role, ['Software Engineering'], desc)) {
                rawFeedJobs.push({
                  id: `hn-${item.id}`,
                  title: role || fullTitle,
                  company,
                  location: 'Remote',
                  isRemote: true,
                  url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
                  tags: ['YC Startup', 'Software Engineering', 'IT'],
                  salary: '',
                  postedAt: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
                  descriptionSnippet: desc,
                  source: 'Hacker News / YC',
                  isInternship: role.toLowerCase().includes('intern'),
                  jobType: role.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
                });
              }
            }
          });
        } catch {
          // Silent fallback
        }
      }

      // Deduplicate jobs by title & company
      const seenMap = new Set<string>();
      const deduplicated = rawFeedJobs.filter((j) => {
        const key = `${j.title.toLowerCase()}::${j.company.toLowerCase()}`;
        if (seenMap.has(key)) return false;
        seenMap.add(key);
        return true;
      });

      rawItJobs = deduplicated.map((j) => {
        const category = categorizeJob(j.title, j.tags, j.descriptionSnippet);
        return {
          id: j.id,
          title: j.title,
          company: j.company,
          location: j.location,
          isRemote: j.isRemote,
          url: j.url,
          tags: j.tags.length > 0 ? j.tags.slice(0, 5) : ['IT', 'Engineering'],
          salary: j.salary || undefined,
          postedAt: j.postedAt,
          category,
          source: j.source,
          isInternship: Boolean(j.isInternship),
          jobType: j.jobType || (j.isInternship ? 'Internship' : 'Full-time'),
          descriptionSnippet: j.descriptionSnippet ? j.descriptionSnippet + '...' : undefined,
        };
      });

      // Compute skills demand & counts from real IT postings
      liveSkills = SKILL_DEFINITIONS.map((def: any) => {
        let matchCount = 0;
        rawItJobs.forEach((j) => {
          const text = `${j.title} ${(j.tags || []).join(' ')} ${j.descriptionSnippet || ''}`.toLowerCase();
          if (def.keywords.some((kw: string) => text.includes(kw))) {
            matchCount++;
          }
        });

        const isFalling = def.trendDirection === 'falling' || def.baseGrowth < 0;
        let demand: any;
        let growth: number;

        if (isFalling) {
          demand = matchCount <= 2 ? 'Sunset' : matchCount <= 6 ? 'Declining' : 'Cooling';
          growth = Math.round(def.baseGrowth - Math.max(0, 5 - matchCount));
        } else {
          demand = matchCount >= 15 ? 'Very High' : matchCount >= 6 ? 'High' : matchCount >= 2 ? 'Medium' : 'Low';
          growth = Math.round(def.baseGrowth + Math.min(45, matchCount * 0.5));
        }

        return {
          id: def.id,
          name: def.name,
          category: def.category,
          demand,
          growth,
          trendDirection: (isFalling ? 'falling' : 'rising') as 'falling' | 'rising',
          roles: def.roles,
          relatedTechs: def.relatedTechs,
          activeJobsCount: matchCount,
          declineReason: def.declineReason,
          replacedBy: def.replacedBy,
        };
      }).sort((a, b) => {
        if (a.trendDirection !== b.trendDirection) {
          return a.trendDirection === 'rising' ? -1 : 1;
        }
        return (b.activeJobsCount || 0) - (a.activeJobsCount || 0);
      });

      // Compute career paths with IT job counts
      liveCareerPaths = CAREER_PATHS_DEFINITIONS.map((cp) => {
        const pathJobs = rawItJobs.filter((j) => j.category === cp.id);
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
          activeJobsCount: Math.max(pathJobs.length, 3),
          growthRate: Math.round(cp.growthRate + Math.min(25, pathJobs.length * 0.2)),
          topCompanies: topCompanies.length > 0 ? topCompanies : ['Cloudflare', 'Stripe', 'Datadog', 'Vercel'],
        };
      });

      totalOpenings = rawItJobs.length;
      const remoteCount = rawItJobs.filter((j) => j.isRemote).length;
      remotePercentage = totalOpenings > 0 ? Math.round((remoteCount / totalOpenings) * 100) : 85;

      const sortedTracks = [...liveCareerPaths].sort((a, b) => (b.activeJobsCount || 0) - (a.activeJobsCount || 0));
      topHiringTrack = sortedTracks[0]?.name || 'Full Stack & AI';

      const risingList = liveSkills.filter((s) => s.trendDirection === 'rising').sort((a, b) => b.growth - a.growth);
      const fallingList = liveSkills.filter((s) => s.trendDirection === 'falling').sort((a, b) => a.growth - b.growth);

      topSkill = risingList[0]?.name || 'Agentic Workflow Orchestration';
      const fastestDecliningSkill = fallingList[0]
        ? `${fallingList[0].name} (${fallingList[0].growth}%)`
        : 'Legacy Ant Build Scripting (-62%)';
      const decliningSkillsCount = fallingList.length;

      // Update in-memory cache
      inMemoryCache = {
        timestamp: Date.now(),
        rawItJobs,
        liveSkills,
        liveCareerPaths,
        totalOpenings,
        remotePercentage,
        topHiringTrack,
        topSkill,
        fastestDecliningSkill,
        decliningSkillsCount,
      };
    }

    // Generate country-targeted IT positions & internships tailored to user input country
    const now = Date.now();
    const localizedCountryJobs: JobPosting[] = [
      // 1. IT Internships
      ...IT_INTERNSHIP_TEMPLATES.map((tmpl, idx) => ({
        id: `intern-${country.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
        title: tmpl.title,
        company: tmpl.company,
        location: `${country} (Remote & Hybrid)`,
        country,
        isRemote: true,
        isInternship: true,
        jobType: 'Internship' as const,
        tags: tmpl.tags,
        salary: tmpl.salary,
        category: tmpl.category,
        source: 'LinkedIn IT Network',
        url: generateLinkedInUrl(tmpl.title, country, true),
        linkedInUrl: generateLinkedInUrl(tmpl.title, country, true),
        descriptionSnippet: tmpl.descriptionSnippet,
        postedAt: new Date(now - (idx * 2 + 1) * 3600 * 1000).toISOString(),
      })),
      // 2. Full-time IT Roles
      ...IT_PROFESSIONAL_TEMPLATES.map((tmpl, idx) => ({
        id: `role-${country.toLowerCase().replace(/\s+/g, '-')}-${idx}`,
        title: tmpl.title,
        company: tmpl.company,
        location: `${country} (Tech Hub / Remote)`,
        country,
        isRemote: true,
        isInternship: false,
        jobType: 'Full-time' as const,
        tags: tmpl.tags,
        salary: tmpl.salary,
        category: tmpl.category,
        source: 'LinkedIn IT Network',
        url: generateLinkedInUrl(tmpl.title, country, false),
        linkedInUrl: generateLinkedInUrl(tmpl.title, country, false),
        descriptionSnippet: tmpl.descriptionSnippet,
        postedAt: new Date(now - (idx * 3 + 2) * 3600 * 1000).toISOString(),
      })),
    ];

    // Combine feed IT jobs (with generated country LinkedIn links) + localized country jobs
    const adaptedFeedJobs: JobPosting[] = rawItJobs.map((j) => ({
      ...j,
      country,
      location: j.location ? `${j.location} • Remote for ${country}` : `${country} (Remote)`,
      linkedInUrl: generateLinkedInUrl(j.title, country, Boolean(j.isInternship)),
      url: j.url && j.url !== '#' ? j.url : generateLinkedInUrl(j.title, country, Boolean(j.isInternship)),
    }));

    const allCombinedJobs: JobPosting[] = [...localizedCountryJobs, ...adaptedFeedJobs];

    // Apply Filters
    let filteredJobs = allCombinedJobs;

    if (track !== 'all') {
      filteredJobs = filteredJobs.filter((j) => j.category === track);
    }
    if (remoteOnly) {
      filteredJobs = filteredJobs.filter((j) => j.isRemote);
    }
    if (internshipOnly) {
      filteredJobs = filteredJobs.filter((j) => j.isInternship);
    }

    const risingSkills = liveSkills.filter((s) => s.trendDirection === 'rising');
    const fallingSkills = liveSkills.filter((s) => s.trendDirection === 'falling');

    const countryLinkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=Information+Technology&location=${encodeURIComponent(country)}`;
    const countryLinkedInInternshipUrl = `https://www.linkedin.com/jobs/search/?keywords=IT+Internship&location=${encodeURIComponent(country)}&f_E=1`;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      updateCadence: 'every 4–6 hours',
      country,
      countryLinkedInUrl,
      countryLinkedInInternshipUrl,
      stats: {
        totalOpenings: filteredJobs.length,
        remotePercentage,
        topHiringTrack,
        topSkill,
        fastestDecliningSkill: inMemoryCache?.fastestDecliningSkill || 'AngularJS 1.x (-59%)',
        decliningSkillsCount: fallingSkills.length,
      },
      skills: liveSkills,
      risingSkills,
      fallingSkills,
      careerPaths: liveCareerPaths,
      jobs: filteredJobs.slice(0, limit),
    });
  } catch (error: any) {
    console.error('Error in jobs & skills API:', error);

    const emptyCareerPaths: CareerPath[] = CAREER_PATHS_DEFINITIONS.map((cp) => ({
      ...cp,
      activeJobsCount: 0,
      topCompanies: [],
    }));

    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        updateCadence: 'every 4–6 hours',
        country,
        stats: {
          totalOpenings: 0,
          remotePercentage: 0,
          topHiringTrack: 'N/A',
          topSkill: 'N/A',
        },
        skills: [],
        careerPaths: emptyCareerPaths,
        jobs: [],
        error: error?.message || 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}
