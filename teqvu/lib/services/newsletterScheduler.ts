import { getStoredSchedule } from './newsletterScheduleStore';
import { sendNewsletter } from './newsletterMailer';

let isSchedulerRunning = false;
let checkInterval: NodeJS.Timeout | null = null;

/**
 * Format local time as HH:MM (24-hr)
 */
function getCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Check if a timestamp is from the same calendar day (local)
 */
function isSameDay(isoString?: string | null): boolean {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
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

/**
 * Evaluates active schedules and dispatches emails if the scheduled time has arrived.
 */
export async function runDueSchedulesCheck(): Promise<{
  checked: boolean;
  dispatched: boolean;
  reason?: string;
  schedule?: any;
}> {
  const schedule = getStoredSchedule();

  if (!schedule || !schedule.enabled || schedule.frequency === 'disabled' || !schedule.email) {
    return { checked: true, dispatched: false, reason: 'Schedule disabled or unconfigured' };
  }

  const now = new Date();
  const currentTime = getCurrentTimeString();
  const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
  const currentDayOfMonth = now.getDate(); // 1 ... 31

  const targetTime = schedule.deliveryTime || '09:00';

  // Compare hours and minutes
  const isTimeMatch = currentTime === targetTime;

  let isDue = false;
  let cadenceNote = '';

  if (schedule.frequency === 'daily') {
    if (isTimeMatch && !isSameDay(schedule.lastSentAt)) {
      isDue = true;
      cadenceNote = 'Daily scheduled delivery time reached';
    }
  } else if (schedule.frequency === 'weekly') {
    const targetDayOfWeek = schedule.deliveryDayOfWeek ?? 1; // default Monday
    if (currentDayOfWeek === targetDayOfWeek && isTimeMatch && !wasSentWithinDays(schedule.lastSentAt, 6)) {
      isDue = true;
      cadenceNote = 'Weekly scheduled delivery day and time reached';
    }
  } else if (schedule.frequency === 'monthly') {
    const targetDayOfMonth = schedule.deliveryDayOfMonth ?? 1; // default 1st
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
    reason: `Not due (Current: ${currentTime}, Target: ${targetTime}, Freq: ${schedule.frequency})`,
    schedule,
  };
}

/**
 * Initializes autonomous background scheduler loop in Node.js server.
 */
export function initScheduler(): void {
  if (isSchedulerRunning) return;
  isSchedulerRunning = true;

  console.log('[Scheduler] Background Newsletter Scheduler initialized (30s polling cycle)');

  // Run initial check
  runDueSchedulesCheck().catch((err) => console.error('[Scheduler] Initial check error:', err));

  // Run recurring check every 30 seconds
  checkInterval = setInterval(() => {
    runDueSchedulesCheck().catch((err) => console.error('[Scheduler] Interval check error:', err));
  }, 30000);
}
