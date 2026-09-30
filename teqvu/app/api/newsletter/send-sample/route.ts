import { NextResponse } from 'next/server';
import { sendNewsletter } from '../../../../lib/services/newsletterMailer';
import { initScheduler } from '../../../../lib/services/newsletterScheduler';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Ensure background scheduler is running
  initScheduler();

  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const email = body.email ? String(body.email).trim() : 'sgdesilva1113@gmail.com';
    const categories: string[] =
      Array.isArray(body.categories) && body.categories.length > 0
        ? body.categories
        : ['AI/ML', 'Cloud Computing', 'Cybersecurity', 'Software Engineering'];
    const frequency = body.frequency || 'daily';

    const result = await sendNewsletter({
      recipientEmail: email,
      categories,
      frequency,
      isPreview: true,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        mode: result.mode,
        deliveredTo: result.deliveredTo,
        messageId: result.messageId,
        previewUrl: result.previewUrl,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to dispatch sample email.',
        },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error('Error in send-sample route:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Internal server error dispatching newsletter sample.',
      },
      { status: 500 }
    );
  }
}
