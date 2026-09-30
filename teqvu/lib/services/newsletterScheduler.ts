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
function isSameDayInTimezone(isoString?: string | null, dateKey?: string): boolean {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  // Fallback to UTC day check if no dateKey
  if (!dateKey) {
    return (
      d.getUTCFullYear() === now.getUTCFullYear() &&
      d.getUTCMonth() === now.getUTCMonth() &&
      d.getUTCDate() === now.getUTCDate()
    );
  }
  const isoDateKey = d.toISOString().split('T')[0];
  return isoDateKey === dateKey;
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

/**
 * Evaluates active schedules and dispatches emails if the scheduled time has arrived.
 * Called by the Vercel cron job at /api/newsletter/cron (runs every hour in UTC).
 * Also callable manually from the schedule PUT endpoint.
 */
export async function runDueSchedulesCheck(): Promise<{
  checked: boolean;
  dispatched: boolean;
  reason?: string;
  schedule?: any;
}> {
  const schedule = await getStoredSchedule();

  if (!schedule || !schedule.enabled || schedule.frequency === 'disabled' || !schedule.email) {
    return { checked: true, dispatched: false, reason: 'Schedule disabled or unconfigured' };
  }

  const tzInfo = getCurrentTimeInTimezone(schedule.timezone);
  const currentTime = tzInfo.time;
  const currentDayOfWeek = tzInfo.dayOfWeek;
  const currentDayOfMonth = tzInfo.dayOfMonth;

  const targetTime = schedule.deliveryTime || '08:00';

  // Compare hours and minutes with a generous 60-minute window
  // (cron fires every hour, so we use a 55-minute window to be safe)
  const diffMinutes = getMinutesDifference(currentTime, targetTime);
  const isTimeMatch = diffMinutes >= 0 && diffMinutes <= 55;

  let isDue = false;
  let cadenceNote = '';

  if (schedule.frequency === 'daily') {
    if (isTimeMatch && !isSameDayInTimezone(schedule.lastSentAt, tzInfo.dateKey)) {
      isDue = true;
      cadenceNote = 'Daily scheduled delivery time reached';
    }
  } else if (schedule.frequency === 'weekly') {
    const targetDayOfWeek = schedule.deliveryDayOfWeek ?? 1;
    if (currentDayOfWeek === targetDayOfWeek && isTimeMatch && !wasSentWithinDays(schedule.lastSentAt, 6)) {
      isDue = true;
      cadenceNote = 'Weekly scheduled delivery day and time reached';
    }
  } else if (schedule.frequency === 'monthly') {
    const targetDayOfMonth = schedule.deliveryDayOfMonth ?? 1;
    if (currentDayOfMonth === targetDayOfMonth && isTimeMatch && !wasSentWithinDays(schedule.lastSentAt, 25)) {
      isDue = true;
      cadenceNote = 'Monthly scheduled delivery day and time reached';
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
    reason: `Not due (Current UTC: ${currentTime}, Target: ${targetTime}, Freq: ${schedule.frequency})`,
    schedule,
  };
}

/**
 * No-op on Vercel: the cron job in vercel.json handles scheduling.
 * On local dev this is also unnecessary since the cron won't fire.
 * Kept for backward compatibility; callers may still invoke it safely.
 */
export function initScheduler(): void {
  // Intentionally empty — scheduling is handled by the Vercel cron job.
  // setInterval does not survive serverless function termination.
}
