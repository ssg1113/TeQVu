import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { compileNewsletterData, buildNewsletterHtml, NewsletterPayload } from './newsletterContent';
import { addDeliveryLog, markScheduleSent } from './newsletterScheduleStore';

export interface SendNewsletterOptions extends NewsletterPayload {
  isPreview?: boolean;
}

export interface MailerResult {
  success: boolean;
  mode: 'resend' | 'smtp' | 'ethereal_preview' | 'error';
  deliveredTo?: string;
  messageId?: string;
  previewUrl?: string;
  message?: string;
  error?: string;
}

export async function sendNewsletter(options: SendNewsletterOptions): Promise<MailerResult> {
  const { recipientEmail, categories, frequency, isAutomated, isPreview } = options;
  const targetEmail = recipientEmail ? recipientEmail.trim() : 'sgdesilva1113@gmail.com';

  try {
    // 1. Compile real data
    const contentData = await compileNewsletterData({
      recipientEmail: targetEmail,
      categories,
      frequency,
      isAutomated,
    });

    // 2. Build tailored HTML & text alternative
    const { html, subject, text } = buildNewsletterHtml({
      recipientEmail: targetEmail,
      categories,
      frequency,
      articles: contentData.articles,
      trends: contentData.trends,
      paper: contentData.paper,
      isAutomated,
    });

    let resendError: string | null = null;

    // 3. Dispatch via Resend API (Preferred & Configured in .env.local)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'TeQVu Intelligence <onboarding@resend.dev>';
        const resendResponse = await resend.emails.send({
          from: fromEmail,
          to: targetEmail,
          subject,
          html,
          text,
          headers: {
            'List-Unsubscribe': '<https://teqvu.live/newsletter>',
          },
        });

        if (resendResponse.error) {
          throw new Error(resendResponse.error.message);
        }

        const msgId = resendResponse.data?.id || `resend_${Date.now()}`;

        // Log successful delivery
        addDeliveryLog({
          email: targetEmail,
          frequency: isPreview ? 'sample' : (frequency as any),
          subject,
          status: 'delivered',
          mode: 'resend',
          messageId: msgId,
        });

        if (!isPreview && frequency !== 'disabled') {
          markScheduleSent(frequency);
        }

        return {
          success: true,
          mode: 'resend',
          deliveredTo: targetEmail,
          messageId: msgId,
          message: `Newsletter successfully dispatched to ${targetEmail}! If not in your primary inbox, please check your Spam or Promotions folder.`,
        };
      } catch (err: any) {
        console.warn('Resend send failed:', err.message);
        resendError = err.message || 'Resend API call failed';
      }
    }

    // 4. Dispatch via Custom SMTP (Fallback if SMTP environment variables are present)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 465,
          secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const info = await transporter.sendMail({
          from: `"TeQVu Intelligence" <${process.env.SMTP_USER}>`,
          to: targetEmail,
          subject,
          html,
          text,
        });

        addDeliveryLog({
          email: targetEmail,
          frequency: isPreview ? 'sample' : (frequency as any),
          subject,
          status: 'delivered',
          mode: 'smtp',
          messageId: info.messageId,
        });

        if (!isPreview && frequency !== 'disabled') {
          markScheduleSent(frequency);
        }

        return {
          success: true,
          mode: 'smtp',
          deliveredTo: targetEmail,
          messageId: info.messageId,
          message: `Newsletter successfully delivered via SMTP directly to ${targetEmail}!`,
        };
      } catch (smtpErr: any) {
        console.warn('SMTP send failed, falling back:', smtpErr);
      }
    }

    // If Resend failed with explicit error, report directly
    if (resendError) {
      addDeliveryLog({
        email: targetEmail,
        frequency: isPreview ? 'sample' : (frequency as any),
        subject,
        status: 'failed',
        mode: 'resend',
        error: resendError,
      });

      return {
        success: false,
        mode: 'error',
        error: `Resend Error: ${resendError}. (Note: Free-tier Resend accounts can only deliver to the account-registered email address).`,
      };
    }

    // 5. Simulated Ethereal Test Account (Safe Web Preview Fallback)
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: '"TeQVu Intelligence" <newsletter@teqvu.live>',
      to: targetEmail,
      subject,
      html,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;

    addDeliveryLog({
      email: targetEmail,
      frequency: isPreview ? 'sample' : (frequency as any),
      subject,
      status: 'simulated',
      mode: 'ethereal_preview',
      messageId: info.messageId,
    });

    return {
      success: true,
      mode: 'ethereal_preview',
      deliveredTo: targetEmail,
      messageId: info.messageId,
      previewUrl,
      message: `A simulated web preview was generated! No real email was sent because no live provider was active. Inspect in Web Mailbox.`,
    };
  } catch (error: any) {
    console.error('Error dispatching newsletter:', error);
    addDeliveryLog({
      email: targetEmail,
      frequency: isPreview ? 'sample' : (frequency as any),
      subject: 'TeQVu Digest Dispatch Failed',
      status: 'failed',
      mode: 'error',
      error: error.message,
    });

    return {
      success: false,
      mode: 'error',
      error: error.message || 'Failed to dispatch newsletter',
    };
  }
}
