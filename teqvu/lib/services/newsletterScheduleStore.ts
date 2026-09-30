/**
 * newsletterScheduleStore.ts
 *
 * Hybrid persistent store for newsletter schedules and delivery logs.
 *
 * Strategy:
 *  - Uses an in-memory cache (works in all environments instantly).
 *  - On non-Vercel (local dev): also persists to local filesystem under data/.
 *  - On Vercel: persists to Supabase KV via a simple key/value JSON column.
 *    Falls back to in-memory when Supabase is unavailable.
 *
 * This ensures the profile page schedule settings survive across Vercel
 * serverless function invocations (which reset /tmp between calls).
 */

import type { NewsletterSchedule, DeliveryLog } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StoredData {
  schedule: NewsletterSchedule;
  logs: DeliveryLog[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const isVercel = Boolean(
  process.env.VERCEL ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  process.env.AWS_LAMBDA_FUNCTION_NAME
);

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const STORE_KEY = 'newsletter_schedule_v1';

const DEFAULT_SCHEDULE: NewsletterSchedule = {
  id: 'default',
  email: 'sgdesilva1113@gmail.com',
  frequency: 'daily',
  deliveryTime: '08:30',
  deliveryDayOfWeek: 1,
  deliveryDayOfMonth: 1,
  categories: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Software Engineering', 'Languages'],
  enabled: true,
  lastSentAt: null,
  lastSentCadence: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// ─── In-Memory Cache (survives within a single serverless invocation) ─────────

let _memCache: StoredData | null = null;

function getMemCache(): StoredData {
  if (!_memCache) {
    _memCache = {
      schedule: { ...DEFAULT_SCHEDULE },
      logs: [],
    };
  }
  return _memCache;
}

function setMemCache(data: StoredData): void {
  _memCache = data;
}

// ─── Supabase KV Persistence (for Vercel cross-invocation persistence) ────────

async function loadFromSupabase(): Promise<StoredData | null> {
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
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return null;
    const rows: Array<{ value: any }> = await res.json();
    if (!rows || rows.length === 0) return null;
    const parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    return {
      schedule: { ...DEFAULT_SCHEDULE, ...parsed.schedule },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch {
    return null;
  }
}

async function saveToSupabase(data: StoredData): Promise<void> {
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
        value: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Supabase unavailable – in-memory cache is still valid for this invocation
  }
}

// ─── Local Filesystem Persistence (for local dev, non-Vercel) ─────────────────

async function loadFromFilesystem(): Promise<StoredData | null> {
  if (isVercel) return null;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    const scheduleFile = path.join(dataDir, 'newsletter-schedules.json');
    if (!fs.existsSync(scheduleFile)) return null;
    const content = fs.readFileSync(scheduleFile, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      schedule: { ...DEFAULT_SCHEDULE, ...parsed.schedule },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch {
    return null;
  }
}

async function saveToFilesystem(data: StoredData): Promise<void> {
  if (isVercel) return;
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const scheduleFile = path.join(dataDir, 'newsletter-schedules.json');
    fs.writeFileSync(scheduleFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving schedule to filesystem:', err);
  }
}

// ─── Public Load / Save ───────────────────────────────────────────────────────

async function loadData(): Promise<StoredData> {
  // 1. Return in-memory cache if already populated in this invocation
  if (_memCache) return _memCache;

  // 2. Try persistent storage
  let loaded: StoredData | null = null;
  if (isVercel) {
    loaded = await loadFromSupabase();
  } else {
    loaded = await loadFromFilesystem();
  }

  const data = loaded || { schedule: { ...DEFAULT_SCHEDULE }, logs: [] };
  setMemCache(data);
  return data;
}

async function saveData(data: StoredData): Promise<void> {
  setMemCache(data);
  if (isVercel) {
    await saveToSupabase(data);
  } else {
    await saveToFilesystem(data);
  }
}

// ─── Public API (async) ───────────────────────────────────────────────────────

export async function getStoredSchedule(): Promise<NewsletterSchedule> {
  const data = await loadData();
  return data.schedule;
}

export async function updateStoredSchedule(updates: Partial<NewsletterSchedule>): Promise<NewsletterSchedule> {
  const data = await loadData();
  data.schedule = {
    ...data.schedule,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await saveData(data);
  return data.schedule;
}

export async function getDeliveryLogs(): Promise<DeliveryLog[]> {
  const data = await loadData();
  return data.logs.slice(-50).reverse(); // newest first
}

export async function addDeliveryLog(
  log: Omit<DeliveryLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): Promise<DeliveryLog> {
  const data = await loadData();
  const newLog: DeliveryLog = {
    id: log.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: log.timestamp || new Date().toISOString(),
    email: log.email,
    frequency: log.frequency,
    subject: log.subject,
    status: log.status,
    mode: log.mode,
    messageId: log.messageId,
    error: log.error,
  };

  data.logs.push(newLog);
  if (data.logs.length > 100) {
    data.logs = data.logs.slice(-100);
  }

  await saveData(data);
  return newLog;
}

export async function markScheduleSent(frequency: 'daily' | 'weekly' | 'monthly'): Promise<void> {
  const data = await loadData();
  data.schedule.lastSentAt = new Date().toISOString();
  data.schedule.lastSentCadence = frequency;
  await saveData(data);
}
