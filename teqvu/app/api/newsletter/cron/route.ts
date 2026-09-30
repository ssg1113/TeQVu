import { NextResponse } from 'next/server';
import { runDueSchedulesCheck } from '../../../../lib/services/newsletterScheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const outcome = await runDueSchedulesCheck();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...outcome,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
