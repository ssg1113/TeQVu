import { getStoredSchedule, markScheduleSent } from './newsletterScheduleStore';
import { sendNewsletter } from './newsletterMailer';

/**
 * Format current time in user's timezone (or fallback to UTC)
 */
function getCurrentTimeInTimezone(tz?: string): { time: string; dayOfWeek: number; dayOfMonth: number; dateKey: string } {
  const now = new Date();
  try {
    if (tz) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(now);
      const hour = parts.find((p) => p.type === 'hour')?.value || '00';
      const minute = parts.find((p) => p.type === 'minute')?.value || '00';

      const dateParts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        weekday: 'short',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(now);

      const weekdayStr = dateParts.find((p) => p.type === 'weekday')?.value;
      const dayStr = dateParts.find((p) => p.type === 'day')?.value;
      const monthStr = dateParts.find((p) => p.type === 'month')?.value;
      const yearStr = dateParts.find((p) => p.type === 'year')?.value;
      const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

      return {
        time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
        dayOfWeek: weekdayStr && dayMap[weekdayStr] !== undefined ? dayMap[weekdayStr] : now.getUTCDay(),
        dayOfMonth: dayStr ? parseInt(dayStr, 10) : now.getUTCDate(),
        dateKey: `${yearStr}-${monthStr}-${dayStr}`,
      };
    }
  } catch (err) {
    console.warn(`[Scheduler] Invalid timezone "${tz}", falling back to UTC:`, err);
  }

  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return {
    time: `${hours}:${minutes}`,
    dayOfWeek: now.getUTCDay(),
    dayOfMonth: now.getUTCDate(),
    dateKey: `${year}-${month}-${day}`,
  };
}

/**
 * Check if a timestamp is from the same calendar day in the given timezone
 */
function isSameDayInTimezone(isoString?: string | null, dateKey?: string, tz?: string): boolean {
  if (!isoString) return false;
  const d = new Date(isoString);
  try {
    if (tz && dateKey) {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(d);
      const dayStr = parts.find((p) => p.type === 'day')?.value;
      const monthStr = parts.find((p) => p.type === 'month')?.value;
      const yearStr = parts.find((p) => p.type === 'year')?.value;
      const sentDateKey = `${yearStr}-${monthStr}-${dayStr}`;
      return sentDateKey === dateKey;
    }
  } catch {}

  const now = new Date();
  return (
    d.getUTCFullYear() === now.getUTCFullYear() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCDate() === now.getUTCDate()
  );
}

/**
 * Check if a timestamp is within the last N days
 */
function wasSentWithinDays(isoString?: string | null, days: number = 6): boolean {
  if (!isoString) return false;
  const d = new Date(isoString).getTime();
  const now = Date.now();
  return now - d < days * 86400000;
}

function getMinutesDifference(current: string, target: string): number {
  const [cH, cM] = current.split(':').map(Number);
  const [tH, tM] = target.split(':').map(Number);
  return (cH * 60 + cM) - (tH * 60 + tM);
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Evaluates active schedules and dispatches emails if the scheduled time has arrived.
 * Called automatically by the background worker, by client heartbeats, and by cron jobs.
 */
export async function runDueSchedulesCheck(): Promise<{
  checked: boolean;
  dispatched: boolean;
  reason?: string;
  schedule?: any;
}> {
  // Ensure the live background scheduler engine is ticking
  initScheduler();

  const schedule = await getStoredSchedule();

  if (!schedule || !schedule.enabled || schedule.frequency === 'disabled' || !schedule.email) {
    return { checked: true, dispatched: false, reason: 'Schedule disabled or unconfigured' };
  }

  const tzInfo = getCurrentTimeInTimezone(schedule.timezone);
  const currentTime = tzInfo.time;
  const currentDayOfWeek = tzInfo.dayOfWeek;
  const currentDayOfMonth = tzInfo.dayOfMonth;

  const targetTime = schedule.deliveryTime || '08:00';
  const diffMinutes = getMinutesDifference(currentTime, targetTime);
  const hasPassedTargetTime = diffMinutes >= 0;

  let isDue = false;
  let cadenceNote = '';

  if (schedule.frequency === 'daily') {
    const alreadySentToday = isSameDayInTimezone(schedule.lastSentAt, tzInfo.dateKey, schedule.timezone);
    if (!alreadySentToday && hasPassedTargetTime) {
      isDue = true;
      cadenceNote = `Daily automated briefing due (Target: ${targetTime}, Current: ${currentTime} in ${schedule.timezone || 'UTC'})`;
    }
  } else if (schedule.frequency === 'weekly') {
    const targetDayOfWeek = schedule.deliveryDayOfWeek ?? 1;
    const isTargetDay = currentDayOfWeek === targetDayOfWeek;
    const sentRecently = wasSentWithinDays(schedule.lastSentAt, 6);
    if (isTargetDay && hasPassedTargetTime && !sentRecently) {
      isDue = true;
      cadenceNote = `Weekly automated briefing due on ${DAY_NAMES[targetDayOfWeek] || 'scheduled day'}`;
    }
  } else if (schedule.frequency === 'monthly') {
    const targetDayOfMonth = schedule.deliveryDayOfMonth ?? 1;
    const isTargetDay = currentDayOfMonth === targetDayOfMonth;
    const sentRecently = wasSentWithinDays(schedule.lastSentAt, 25);
    if (isTargetDay && hasPassedTargetTime && !sentRecently) {
      isDue = true;
      cadenceNote = `Monthly automated briefing due on day ${targetDayOfMonth}`;
    }
  }

  if (isDue) {
    console.log(`[Scheduler] Dispatching automated ${schedule.frequency} briefing to ${schedule.email}: ${cadenceNote}`);
    try {
      await sendNewsletter({
        recipientEmail: schedule.email,
        categories: schedule.categories || ['AI/ML', 'Cloud Computing', 'Cybersecurity'],
        frequency: schedule.frequency,
        isAutomated: true,
      });

      await markScheduleSent(schedule.frequency as 'daily' | 'weekly' | 'monthly');

      return {
        checked: true,
        dispatched: true,
        reason: cadenceNote,
        schedule,
      };
    } catch (err: any) {
      console.error('[Scheduler] Error in automated dispatch:', err);
      return {
        checked: true,
        dispatched: false,
        reason: `Dispatch failed: ${err.message}`,
        schedule,
      };
    }
  }

  return {
    checked: true,
    dispatched: false,
    reason: `Schedule active but not due yet (Current: ${currentTime}, Target: ${targetTime}, Cadence: ${schedule.frequency}, Timezone: ${schedule.timezone || 'UTC'})`,
    schedule,
  };
}

let _schedulerInterval: NodeJS.Timeout | null = null;
let _isInitializing = false;

/**
 * Initializes continuous background scheduling worker in Node.js runtime.
 * Evaluates active delivery schedules continuously every 60 seconds.
 */
export function initScheduler(): void {
  if (typeof process === 'undefined') return;
  if (_schedulerInterval || _isInitializing) return;

  _isInitializing = true;

  // Run initial check after 2 seconds
  setTimeout(() => {
    runDueSchedulesCheck().catch((err) =>
      console.warn('[Scheduler] Startup check note:', err?.message)
    );
  }, 2000);

  // Run continuous heartbeat check every 60 seconds
  _schedulerInterval = setInterval(() => {
    runDueSchedulesCheck().catch((err) =>
      console.warn('[Scheduler] Interval check note:', err?.message)
    );
  }, 60 * 1000);

  if (_schedulerInterval && typeof _schedulerInterval.unref === 'function') {
    _schedulerInterval.unref();
  }

  _isInitializing = false;
  console.log('[Scheduler] Live background auto-dispatch engine running.');
}
