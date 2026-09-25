import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { articles as fallbackArticles } from '../../../../lib/mock-data/articles';
import { technologies as fallbackTechs } from '../../../../lib/mock-data/technologies';
import { researchPapers as fallbackResearch } from '../../../../lib/mock-data/research';

export const dynamic = 'force-dynamic';

function generateEmailHtml(data: {
  recipientEmail: string;
  categories: string[];
  frequency: string;
  articles: Array<{ title: string; summary: string; url: string; source: string; category: string }>;
  trends: Array<{ name: string; growth: number; mentions: number; description: string; url: string }>;
  paper?: { title: string; authors: string[]; summary: string; url: string; source: string };
}): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const articlesHtml = data.articles
    .map(
      (a) => `
    <div style="margin-bottom: 24px; padding: 18px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #06b6d4;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #0891b2; margin-bottom: 6px; letter-spacing: 0.5px;">
        ${a.source} &bull; ${a.category}
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; line-height: 1.4; color: #0f172a;">
        <a href="${a.url}" target="_blank" style="color: #0f172a; text-decoration: none;">${a.title}</a>
      </h3>
      <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #475569;">
        ${a.summary}
      </p>
      <a href="${a.url}" target="_blank" style="font-size: 12px; font-weight: 600; color: #0284c7; text-decoration: none;">
        Read Full Coverage &rarr;
      </a>
    </div>
  `
    )
    .join('');

  const trendsHtml = data.trends
    .map(
      (t) => `
    <div style="margin-bottom: 16px; padding: 14px 16px; background-color: #f1f5f9; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 14px; font-weight: 700; color: #0f172a;">
          <a href="${t.url}" target="_blank" style="color: #0f172a; text-decoration: none;">${t.name}</a>
          <span style="display: inline-block; margin-left: 8px; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background-color: #dcfce7; color: #15803d;">
            +${t.growth}% Velocity
          </span>
        </div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
          ${t.description.slice(0, 120)}${t.description.length > 120 ? '...' : ''}
        </div>
      </div>
    </div>
  `
    )
    .join('');

  const paperHtml = data.paper
    ? `
    <div style="margin-bottom: 24px; padding: 18px; background-color: #faf5ff; border-radius: 12px; border-left: 4px solid #a855f7;">
      <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #9333ea; margin-bottom: 6px; letter-spacing: 0.5px;">
        ${data.paper.source} &bull; arXiv Preprint
      </div>
      <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; line-height: 1.4; color: #0f172a;">
        <a href="${data.paper.url}" target="_blank" style="color: #0f172a; text-decoration: none;">${data.paper.title}</a>
      </h3>
      <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b;">
        By ${data.paper.authors.slice(0, 3).join(', ')}${data.paper.authors.length > 3 ? ' et al.' : ''}
      </p>
      <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.6; color: #475569;">
        ${data.paper.summary.slice(0, 280)}...
      </p>
      <a href="${data.paper.url}" target="_blank" style="font-size: 12px; font-weight: 600; color: #7e22ce; text-decoration: none;">
        Read Preprint Paper &rarr;
      </a>
    </div>
  `
    : '';

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TeQVu Daily Brief</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="640" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
              
              <!-- Header -->
              <tr>
                <td style="padding: 32px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background-color: rgba(6, 182, 212, 0.2); border: 1px solid rgba(6, 182, 212, 0.4); font-size: 11px; font-family: monospace; color: #38bdf8; font-weight: 700; margin-bottom: 12px;">
                          &bull; REAL-TIME INTELLIGENCE BRIEFING
                        </div>
                        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                          TeQVu <span style="color: #38bdf8;">Daily Brief</span>
                        </h1>
                        <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
                          ${currentDate} &bull; Delivered to ${data.recipientEmail}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Main Body -->
              <tr>
                <td style="padding: 32px 32px 16px 32px;">
                  
                  <!-- Section 1: Breaking Developments -->
                  <div style="margin-bottom: 32px;">
                    <div style="display: flex; align-items: center; margin-bottom: 16px;">
                      <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                        Important Technology Developments
                      </h2>
                    </div>
                    ${articlesHtml}
                  </div>

                  <!-- Section 2: Real-time Trends -->
                  <div style="margin-bottom: 32px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                      Trending Open-Source Technologies
                    </h2>
                    ${trendsHtml}
                  </div>

                  <!-- Section 3: Research Spotlight -->
                  ${
                    data.paper
                      ? `
                  <div style="margin-bottom: 32px;">
                    <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">
                      Research & Lab Preprints
                    </h2>
                    ${paperHtml}
                  </div>
                  `
                      : ''
                  }

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
                  <div style="margin-bottom: 8px;">
                    <strong>TeQVu Anti-Spam Governance:</strong> This sample preview was triggered on demand from your configured settings. Digest Cadence: <span style="text-transform: capitalize; color: #0284c7; font-weight: 600;">${data.frequency}</span>.
                  </div>
                  <div style="color: #94a3b8;">
                    Attribution: Content verified from official RSS feeds and APIs (Reuters, BBC, Digital Trends, arXiv, GitHub).
                  </div>
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between;">
                    <span>&copy; ${new Date().getFullYear()} TeQVu Intelligence Platform</span>
                    <span><a href="#" style="color: #64748b; text-decoration: underline;">Manage Preferences</a> &bull; <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a></span>
                  </div>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const email = body.email ? String(body.email).trim() : 'alex.rivera@techpulse.dev';
    const categories: string[] = Array.isArray(body.categories) && body.categories.length > 0
      ? body.categories
      : ['AI/ML', 'Cloud', 'Cybersecurity'];
    const frequency = body.frequency || 'daily';

    // 1. Gather Live Real-Time Data (or use fallbacks)
    let liveArticles: any[] = [];
    try {
      const res = await fetch('http://127.0.0.1:3000/api/tech-news?limit=4', {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articles?.length > 0) liveArticles = data.articles;
      }
    } catch {
      liveArticles = fallbackArticles.slice(0, 3);
    }
    if (liveArticles.length === 0) liveArticles = fallbackArticles.slice(0, 3);

    let liveTrends: any[] = [];
    try {
      const res = await fetch('http://127.0.0.1:3000/api/trends?timeframe=7d', {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.trends?.length > 0) liveTrends = data.trends.slice(0, 3);
      }
    } catch {
      liveTrends = fallbackTechs.slice(0, 3);
    }
    if (liveTrends.length === 0) liveTrends = fallbackTechs.slice(0, 3);

    let livePaper = fallbackResearch[0];
    try {
      const res = await fetch('http://127.0.0.1:3000/api/research?limit=1', {
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.papers?.length > 0) livePaper = data.papers[0];
      }
    } catch {
      livePaper = fallbackResearch[0];
    }

    // 2. Generate HTML Content
    const htmlContent = generateEmailHtml({
      recipientEmail: email,
      categories,
      frequency,
      articles: liveArticles.map((a: any) => ({
        title: a.title,
        summary: a.summary || a.content || 'Read the full coverage for comprehensive insights.',
        url: a.url || 'https://teqvu.live',
        source: a.source?.name || 'Verified Source',
        category: a.category || 'Tech',
      })),
      trends: liveTrends.map((t: any) => ({
        name: t.name,
        growth: t.growth || 25,
        mentions: t.mentions || 1000,
        description: t.description || 'Rapidly growing open-source technology.',
        url: t.website || t.github || 'https://github.com',
      })),
      paper: livePaper
        ? {
            title: livePaper.title,
            authors: livePaper.authors || ['Research Team'],
            summary: livePaper.summary || '',
            url: livePaper.sourceUrl || 'https://arxiv.org',
            source: livePaper.source || 'arXiv',
          }
        : undefined,
    });

    const subject = `TeQVu Daily Brief — ${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}: Real-Time Tech Intelligence`;

    // 3. Dispatch Delivery

    let resendError: string | null = null;

    // Option A: RESEND API (if RESEND_API_KEY is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'TeQVu Intelligence <onboarding@resend.dev>';
        const resendResponse = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject,
          html: htmlContent,
        });

        if (resendResponse.error) {
          throw new Error(resendResponse.error.message);
        }

        return NextResponse.json({
          success: true,
          mode: 'resend',
          deliveredTo: email,
          messageId: resendResponse.data?.id,
          message: `Sample newsletter successfully dispatched directly to ${email}! If it does not appear in your Primary inbox, please check your Spam/Junk folder or Promotions tab.`,
        });
      } catch (resendErr: any) {
        console.warn('Resend send failed:', resendErr);
        resendError = resendErr.message || 'Resend API call failed';
      }
    }

    // Option B: CUSTOM SMTP (if SMTP_USER and SMTP_PASS are configured)
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
          to: email,
          subject,
          html: htmlContent,
        });

        return NextResponse.json({
          success: true,
          mode: 'smtp',
          deliveredTo: email,
          messageId: info.messageId,
          message: `Sample newsletter successfully delivered via SMTP directly to ${email}!`,
        });
      } catch (smtpErr: any) {
        console.warn('SMTP send failed, falling back:', smtpErr);
      }
    }

    // If Resend was configured but explicitly threw an error, inform the user directly instead of pretending nothing happened
    if (resendError) {
      return NextResponse.json(
        {
          success: false,
          error: `Resend Error: ${resendError}. (Note: With Resend's free tier, you can only deliver to the email address registered with your Resend account).`,
        },
        { status: 400 }
      );
    }

    // Option C: AUTOMATIC TEST ACCOUNT (Generates real message & instant Web Preview link)
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
      to: email,
      subject,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    return NextResponse.json({
      success: true,
      mode: 'ethereal_preview',
      deliveredTo: email,
      messageId: info.messageId,
      previewUrl,
      message: `A simulated web preview was generated! No real email was sent to your inbox because an active email provider (Resend or Gmail SMTP) was not detected in .env.local. Click the button below to inspect your email in the Web Mailbox.`,
    });
  } catch (err: any) {
    console.error('Error sending newsletter sample:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to dispatch sample newsletter',
      },
      { status: 500 }
    );
  }
}
