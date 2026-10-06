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
  deliveryTime: '08:00',
  deliveryDayOfWeek: 1,
  deliveryDayOfMonth: 1,
  categories: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Software Engineering', 'Languages'],
  enabled: true,
  timezone: 'UTC',
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

// ─── Supabase KV Persistence (for cross-invocation persistence) ───────────────

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
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      console.warn(`[ScheduleStore] loadFromSupabase HTTP ${res.status}`);
      return null;
    }
    const rows: Array<{ value: any }> = await res.json();
    if (!rows || rows.length === 0) return null;
    const parsed = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
    if (!parsed || !parsed.schedule) return null;
    return {
      schedule: { ...DEFAULT_SCHEDULE, ...parsed.schedule },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch (err: any) {
    console.warn('[ScheduleStore] loadFromSupabase error:', err.message);
    return null;
  }
}

async function saveToSupabase(data: StoredData): Promise<void> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_kv_store`, {
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
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn(`[ScheduleStore] saveToSupabase HTTP ${res.status}:`, errText);
    }
  } catch (err: any) {
    console.warn('[ScheduleStore] saveToSupabase error:', err.message);
  }
}

// ─── Local Filesystem Persistence (works locally & in /tmp on Vercel) ─────────

function getStoragePaths(): string[] {
  const paths: string[] = [];
  try {
    const path = require('path');
    if (!isVercel) {
      paths.push(path.join(process.cwd(), 'data', 'newsletter-schedules.json'));
    }
    paths.push(path.join('/tmp', 'newsletter-schedules.json'));
  } catch {
    // ignore
  }
  return paths;
}

async function loadFromFilesystem(): Promise<StoredData | null> {
  try {
    const fs = await import('fs');
    for (const filePath of getStoragePaths()) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed && parsed.schedule) {
          return {
            schedule: { ...DEFAULT_SCHEDULE, ...parsed.schedule },
            logs: Array.isArray(parsed.logs) ? parsed.logs : [],
          };
        }
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function saveToFilesystem(data: StoredData): Promise<void> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    for (const filePath of getStoragePaths()) {
      try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      } catch {
        // Continue to next path if one fails
      }
    }
  } catch (err) {
    console.error('[ScheduleStore] Error saving schedule to filesystem:', err);
  }
}

// ─── Public Load / Save ───────────────────────────────────────────────────────

async function loadData(): Promise<StoredData> {
  // 1. Return in-memory cache if already populated in this invocation
  if (_memCache) return _memCache;

  let loaded: StoredData | null = null;

  // In non-Vercel environments (like local dev), load immediately from local filesystem
  if (!isVercel) {
    loaded = await loadFromFilesystem();
  }

  // On Vercel, try Supabase KV first
  if (!loaded && isVercel && SUPABASE_URL && SUPABASE_KEY) {
    loaded = await loadFromSupabase();
  }

  // Fallback to filesystem (/tmp on Vercel)
  if (!loaded) {
    loaded = await loadFromFilesystem();
  }

  const data = loaded || { schedule: { ...DEFAULT_SCHEDULE }, logs: [] };
  setMemCache(data);
  return data;
}

async function saveData(data: StoredData): Promise<void> {
  setMemCache(data);
  const tasks: Promise<any>[] = [saveToFilesystem(data)];
  if (isVercel && SUPABASE_URL && SUPABASE_KEY) {
    tasks.push(saveToSupabase(data));
  }
  await Promise.allSettled(tasks);
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
