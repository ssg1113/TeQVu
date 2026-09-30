import { NextResponse } from 'next/server';
import {
  getStoredSchedule,
  updateStoredSchedule,
  getDeliveryLogs,
} from '../../../../lib/services/newsletterScheduleStore';
import { initScheduler } from '../../../../lib/services/newsletterScheduler';
import { sendNewsletter } from '../../../../lib/services/newsletterMailer';

export const dynamic = 'force-dynamic';

export async function GET() {
  initScheduler();
  try {
    const schedule = getStoredSchedule();
    const logs = getDeliveryLogs();

    return NextResponse.json({
      success: true,
      schedule,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  initScheduler();
  try {
    const body = await request.json();

    const updates: any = {};
    if (typeof body.email === 'string') updates.email = body.email.trim();
    if (['daily', 'weekly', 'monthly', 'disabled'].includes(body.frequency)) {
      updates.frequency = body.frequency;
    }
    if (typeof body.deliveryTime === 'string') updates.deliveryTime = body.deliveryTime.trim();
    if (typeof body.deliveryDayOfWeek === 'number') updates.deliveryDayOfWeek = body.deliveryDayOfWeek;
    if (typeof body.deliveryDayOfMonth === 'number') updates.deliveryDayOfMonth = body.deliveryDayOfMonth;
    if (Array.isArray(body.categories)) updates.categories = body.categories;
    if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;

    const updatedSchedule = updateStoredSchedule(updates);

    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      message: 'Delivery schedule successfully saved and active.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT triggers manual dispatch of the configured schedule on demand
export async function PUT(request: Request) {
  initScheduler();
  try {
    const schedule = getStoredSchedule();

    if (!schedule.email) {
      return NextResponse.json(
        { success: false, error: 'No recipient email configured in schedule.' },
        { status: 400 }
      );
    }

    const result = await sendNewsletter({
      recipientEmail: schedule.email,
      categories: schedule.categories || ['AI/ML', 'Cloud Computing', 'Cybersecurity'],
      frequency: schedule.frequency === 'disabled' ? 'daily' : schedule.frequency,
      isAutomated: false,
    });

    const logs = getDeliveryLogs();

    return NextResponse.json({
      success: result.success,
      result,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
