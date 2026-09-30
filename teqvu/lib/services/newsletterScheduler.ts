import { getStoredSchedule, markScheduleSent } from './newsletterScheduleStore';
import { sendNewsletter } from './newsletterMailer';

/**
 * Format UTC time as HH:MM (24-hr) — use UTC to match Vercel cron which runs in UTC
 */
function getCurrentTimeStringUTC(): string {
  const now = new Date();
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if a timestamp is from the same UTC calendar day
 */
function isSameDayUTC(isoString?: string | null): boolean {
  if (!isoString) return false;
  const d = new Date(isoString);
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

  const now = new Date();
  const currentTime = getCurrentTimeStringUTC();
  const currentDayOfWeek = now.getUTCDay();
  const currentDayOfMonth = now.getUTCDate();

  const targetTime = schedule.deliveryTime || '09:00';

  // Compare hours and minutes with a generous 60-minute window
  // (cron fires every hour, so we use a 55-minute window to be safe)
  const diffMinutes = getMinutesDifference(currentTime, targetTime);
  const isTimeMatch = diffMinutes >= 0 && diffMinutes <= 55;

  let isDue = false;
  let cadenceNote = '';

  if (schedule.frequency === 'daily') {
    if (isTimeMatch && !isSameDayUTC(schedule.lastSentAt)) {
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
