// Types for TeQVu platform

export type TrendStatus = 'emerging' | 'rising' | 'trending' | 'stable' | 'declining';

export type TechCategory =
  | 'Languages'
  | 'Frameworks'
  | 'Databases'
  | 'Cloud'
  | 'AI/ML'
  | 'Cybersecurity'
  | 'DevOps'
  | 'Developer Tools'
  | 'Mobile'
  | 'Blockchain'
  | 'Data Science'
  | 'IoT'
  | 'Quantum'
  | 'Robotics'
  | 'Systems';

export interface Technology {
  id: string;
  slug: string;
  name: string;
  category: TechCategory;
  description: string;
  trendScore: number;       // 0–100
  mentions: number;
  sources: number;
  growth: number;           // percentage e.g. +31
  status: TrendStatus;
  firstDetected: string;    // ISO date
  lastUpdated: string;
  sparkline: number[];      // 7 data points for mini chart
  tags: string[];
  relatedTechs: string[];   // technology IDs
  logo?: string;
  website?: string;
  github?: string;
  whyTrending?: string;
  followersCount: number;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url: string;
  imageUrl?: string;
  source: Source;
  publishedAt: string;
  category: string;
  technologies: string[];   // tech names
  readingTime: number;      // minutes
  isBookmarked?: boolean;
  clusterSize?: number;     // if part of story cluster
  clusterId?: string;
  aiSummary?: AISummary;
}

export interface AISummary {
  whatHappened: string;
  whyItMatters: string;
  whoShouldCare: string[];
  technologiesInvolved: string[];
  keyTakeaways: string[];
}

export interface Source {
  id: string;
  name: string;
  url: string;
  logoUrl?: string;
  type: 'RSS' | 'API' | 'Research' | 'Official Blog' | 'Developer Community' | 'Manual';
  category: string;
  trustScore: number;  // 1–10
  status: 'active' | 'inactive' | 'error';
  articlesCount: number;
  lastChecked: string;
  collectionFrequency: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publishedAt: string;
  summary: string;
  topics: string[];
  technologies: string[];
  source: string;
  sourceUrl: string;
  doi?: string;
  citations?: number;
  isBookmarked?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  demand: 'Very High' | 'High' | 'Medium' | 'Low';
  growth: number;
  relatedTechs: string[];
  roles: string[];
}

export interface CareerPath {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: string[];
  technologies: string[];
  averageSalary?: string;
  growthRate: number;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  icon: string;
  count: number;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  type: 'article' | 'research' | 'technology' | 'resource';
  itemId: string;
  collectionId?: string;
  savedAt: string;
  title: string;
  source?: string;
  url?: string;
  tags?: string[];
}

export interface NewsletterPreference {
  frequency: 'daily' | 'weekly' | 'monthly' | 'disabled';
  categories: string[];
  enableAlerts: boolean;
  alertCategories: string[];
  maxAlertsPerDay: number;
  quietHoursStart: string;  // HH:MM
  quietHoursEnd: string;
}

export interface TrendDataPoint {
  date: string;
  score: number;
  mentions: number;
}

export interface StoryCluster {
  id: string;
  title: string;
  summary: string;
  articleCount: number;
  sourceCount: number;
  publishedAt: string;
  technologies: string[];
  category: string;
  articles: Article[];
  primarySource: Source;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  occupation: 'Student' | 'Software Engineer' | 'Researcher' | 'Academic' | 'IT Professional' | 'Other';
  interests: string[];
  followedTechs: string[];
  role: 'user' | 'admin';
  joinedAt: string;
  newsletterPreference: NewsletterPreference;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  articlesCollected: number;
  sourcesCount: number;
  technologiesCount: number;
  emergingTrends: number;
  emailsSent: number;
  processingFailures: number;
}

export interface ProcessingJob {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  lastRun: string;
  nextRun: string;
  processedCount: number;
  errorCount: number;
  details?: string;
}
