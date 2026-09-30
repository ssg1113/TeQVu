import fs from 'fs';
import path from 'path';
import type { NewsletterSchedule, DeliveryLog } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SCHEDULE_FILE = path.join(DATA_DIR, 'newsletter-schedules.json');

interface StoredData {
  schedule: NewsletterSchedule;
  logs: DeliveryLog[];
}

const DEFAULT_SCHEDULE: NewsletterSchedule = {
  id: 'default',
  email: 'sgdesilva1113@gmail.com',
  frequency: 'daily',
  deliveryTime: '08:30',
  deliveryDayOfWeek: 1, // Monday
  deliveryDayOfMonth: 1,
  categories: ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Software Engineering', 'Languages'],
  enabled: true,
  lastSentAt: null,
  lastSentCadence: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function ensureDataFile(): StoredData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(SCHEDULE_FILE)) {
      const initial: StoredData = {
        schedule: DEFAULT_SCHEDULE,
        logs: [
          {
            id: `log_init_${Date.now()}`,
            timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
            email: 'sgdesilva1113@gmail.com',
            frequency: 'daily',
            subject: 'TeQVu Daily Brief: Real-Time Tech Intelligence',
            status: 'delivered',
            mode: 'resend',
            messageId: 'msg_init_sample',
          },
        ],
      };
      fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const content = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      schedule: { ...DEFAULT_SCHEDULE, ...parsed.schedule },
      logs: Array.isArray(parsed.logs) ? parsed.logs : [],
    };
  } catch (err) {
    console.error('Error reading schedule store file, using fallback memory:', err);
    return { schedule: DEFAULT_SCHEDULE, logs: [] };
  }
}

function writeDataFile(data: StoredData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving schedule store file:', err);
  }
}

export function getStoredSchedule(): NewsletterSchedule {
  const data = ensureDataFile();
  return data.schedule;
}

export function updateStoredSchedule(updates: Partial<NewsletterSchedule>): NewsletterSchedule {
  const data = ensureDataFile();
  data.schedule = {
    ...data.schedule,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDataFile(data);
  return data.schedule;
}

export function getDeliveryLogs(): DeliveryLog[] {
  const data = ensureDataFile();
  return data.logs.slice(-50).reverse(); // newest first
}

export function addDeliveryLog(log: Omit<DeliveryLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): DeliveryLog {
  const data = ensureDataFile();
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
  // Keep last 100 logs
  if (data.logs.length > 100) {
    data.logs = data.logs.slice(-100);
  }

  writeDataFile(data);
  return newLog;
}

export function markScheduleSent(frequency: 'daily' | 'weekly' | 'monthly'): void {
  const data = ensureDataFile();
  data.schedule.lastSentAt = new Date().toISOString();
  data.schedule.lastSentCadence = frequency;
  writeDataFile(data);
}
