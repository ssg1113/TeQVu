// Types for TeQVu platform

export type TrendStatus = 'emerging' | 'rising' | 'trending' | 'stable' | 'declining' | 'falling';

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
  growth: number;           // percentage e.g. +31 or -38
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
  declineReason?: string;   // Explanation of why this tech is falling
  replacedBy?: string[];    // Modern technologies superseding this one
  migrationGuidance?: string;
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
  discussCount?: number;
  isBreaking?: boolean;
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
  type:
    | 'RSS'
    | 'API'
    | 'Research'
    | 'Official Blog'
    | 'Developer Community'
    | 'Manual'
    | 'Official Documentation'
    | 'Official Project'
    | 'University Press'
    | 'Tech News'
    | 'Systems'
    | 'Open Source'
    | 'Global Wire'
    | 'Developer Tools'
    | string;
  category: string;
  trustScore: number;  // 1–10
  status: 'active' | 'inactive' | 'error';
  articlesCount: number;
  lastChecked: string;
  collectionFrequency: string;
  isCustom?: boolean;
  latencyMs?: number;
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
  demand: 'Very High' | 'High' | 'Medium' | 'Low' | 'Declining' | 'Cooling' | 'Sunset';
  growth: number; // Positive (rising) or Negative (falling e.g. -45)
  trendDirection?: 'rising' | 'falling';
  relatedTechs: string[];
  roles: string[];
  activeJobsCount?: number;
  declineReason?: string;
  replacedBy?: string[];
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
  activeJobsCount?: number;
  topCompanies?: string[];
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  isRemote: boolean;
  url: string;
  tags: string[];
  salary?: string;
  postedAt: string;
  category: string;
  source: string;
  country?: string;
  isInternship?: boolean;
  jobType?: 'Full-time' | 'Internship' | 'Contract' | 'Part-time';
  linkedInUrl?: string;
  descriptionSnippet?: string;
  marketType?: 'emerging' | 'standard' | 'legacy-migration';
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
  deliveryTime?: string;    // HH:MM in 24-hr format (e.g. "09:00")
  deliveryDayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
  deliveryDayOfMonth?: number; // 1-31 (for monthly)
  scheduledEmail?: string;
  scheduleEnabled?: boolean;
  timezone?: string;        // IANA timezone identifier (e.g. "Asia/Colombo", "America/New_York")
}

export interface NewsletterSchedule {
  id: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'disabled';
  deliveryTime: string;      // "HH:MM" (e.g. "09:00")
  deliveryDayOfWeek: number; // 0-6 (default 1 for Monday)
  deliveryDayOfMonth: number; // 1-31 (default 1)
  categories: string[];
  enabled: boolean;
  timezone?: string;
  lastSentAt?: string | null;
  lastSentCadence?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryLog {
  id: string;
  timestamp: string;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'sample';
  subject: string;
  status: 'delivered' | 'suppressed' | 'failed' | 'simulated';
  mode: string;
  messageId?: string;
  error?: string;
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

export type Occupation =
  | 'Student'
  | 'Software Engineer'
  | 'Researcher'
  | 'Academic'
  | 'IT Professional'
  | 'Platform Administrator'
  | 'Other'
  | '';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  occupation: Occupation;
  country?: string;
  interests: string[];
  followedTechs: string[];
  role: 'user' | 'admin';
  joinedAt: string;
  newsletterPreference: NewsletterPreference;
  hasPassword?: boolean;
  authProviders?: ('google' | 'github' | 'email')[];
  passwordUpdatedAt?: string;
  twoFactorEnabled?: boolean;
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

export type NotificationType = 'trend' | 'update' | 'breaking' | 'watchlist' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: string;
  timestamp: string;      // ISO string
  url?: string;           // External URL
  link?: string;          // Internal route e.g. /trending or /latest
  isRead: boolean;
  importance: 'critical' | 'high' | 'normal';
  metric?: string;        // e.g. "+145% Surge" or "Reuters Breaking"
  sourceName?: string;
  relatedTech?: string;
}

