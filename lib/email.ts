import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { createServerClient } from './supabaseClient'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Email configuration constants
const EMAIL_CONFIG = {
  fromName: 'SyriaHub via PluraGate',
  fromEmail: process.env.RESEND_FROM_EMAIL || 'admin@pluragate.org',
  replyTo: process.env.SMTP_REPLY_TO || 'admin@pluragate.org',
}

// Invitation-specific email configuration (uses syriahub.org domain)
const INVITATION_EMAIL_CONFIG = {
  fromName: 'SyriaHub',
  fromEmail: process.env.INVITATION_FROM_EMAIL || 'invitations@syriahub.org',
  replyTo: process.env.INVITATION_REPLY_TO || 'invitations@syriahub.org',
}

// Initialize Resend client (if API key is available)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

// Create reusable nodemailer transporter (fallback)
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')

  // Secure is true for port 465, false for most others (which use STARTTLS)
  // Allow explicit override via SMTP_SECURE env var
  const secure = process.env.SMTP_SECURE !== undefined
    ? process.env.SMTP_SECURE === 'true'
    : port === 465

  const config = {
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // App password for Google Workspace or provider key
    },
    // Add timeouts to prevent hanging processes
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  }

  // Debug log (sanitized)
  console.log(`📧 Creating mail transporter for ${host}:${port} (secure: ${secure})`)

  return nodemailer.createTransport(config)
}

/**
 * Send email using Resend (preferred) or fallback to nodemailer
 */
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const supabase = await createServerClient()

  try {
    // Only use Supabase Edge Functions if explicitly requested
    if (process.env.USE_EDGE_FUNCTIONS === 'true') {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html, text },
      })

      if (error) throw error

      // Log to database
      await supabase.from('email_logs').insert({
        recipient_email: to,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      return true
    }

    // Use Resend if API key is configured (better deliverability)
    if (resend) {
      console.log('📧 Sending email via Resend...')

      const { data, error } = await resend.emails.send({
        from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        replyTo: EMAIL_CONFIG.replyTo,
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@pluragate.org>',
        },
      })

      if (error) {
        console.error('❌ Resend error:', error.message)
        throw new Error(error.message)
      }

      console.log('✅ Email sent via Resend:', data?.id)

      // Log to database
      await supabase.from('email_logs').insert({
        recipient_email: to,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      return true
    }

    // Fallback to nodemailer (Gmail SMTP)
    console.log('📧 Sending email via nodemailer (SMTP fallback)...')
    const transporter = createTransporter()

    // Verify transporter connection before sending
    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error('❌ SMTP Connection Verification Failed:', verifyError.message)
      throw verifyError
    }

    await transporter.sendMail({
      from: `"${EMAIL_CONFIG.fromName}" <${process.env.SMTP_USER || EMAIL_CONFIG.fromEmail}>`,
      replyTo: EMAIL_CONFIG.replyTo,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      headers: {
        'List-Unsubscribe': '<mailto:unsubscribe@pluragate.org>',
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    // Log to database
    await supabase.from('email_logs').insert({
      recipient_email: to,
      subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return true
  } catch (error: any) {
    // Careful with logging to avoid triggering RangeError if the error object is circular or too large
    // Just log the message and code
    console.error(`❌ Email send error [${error.code || 'UNKNOWN'}]:`, error.message)

    // Log failure to database
    try {
      await supabase.from('email_logs').insert({
        recipient_email: to,
        subject,
        status: 'failed',
        error_message: error.message,
      })
    } catch (logError) {
      console.error('Failed to log email failure to database')
    }

    return false
  }
}

/**
 * Send invitation email using Resend with invitations@syriahub.org
 * Requires syriahub.org domain to be verified in Resend dashboard
 */
export async function sendInvitationEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const supabase = await createServerClient()

  try {
    // Use Resend as the primary sender for invitations
    if (resend) {
      console.log('📧 Sending invitation email via Resend (from invitations@syriahub.org)...')

      const { data, error } = await resend.emails.send({
        from: `${INVITATION_EMAIL_CONFIG.fromName} <${INVITATION_EMAIL_CONFIG.fromEmail}>`,
        to: [to],
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
        replyTo: INVITATION_EMAIL_CONFIG.replyTo,
      })

      if (error) {
        console.error('❌ Resend error:', error.message)
        throw new Error(error.message)
      }

      console.log('✅ Invitation email sent via Resend:', data?.id)

      // Log to database
      await supabase.from('email_logs').insert({
        recipient_email: to,
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })

      return true
    }

    // Fallback: If Resend is not configured, log error and fail
    console.error('❌ Resend API key not configured. Cannot send invitation email.')
    throw new Error('Email service not configured')

  } catch (error: any) {
    console.error(`❌ Invitation email send error [${error.code || 'UNKNOWN'}]:`, error.message)

    // Log failure to database
    try {
      await supabase.from('email_logs').insert({
        recipient_email: to,
        subject,
        status: 'failed',
        error_message: error.message,
      })
    } catch (logError) {
      console.error('Failed to log email failure to database')
    }

    return false
  }
}

// Email templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: 'Welcome to SyriaHub',
    html: wrapEmailLayout(`
      <h1 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}</h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for joining SyriaHub, the research platform for knowledge sharing and academic collaboration focused on Syria.</p>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin-top: 0; font-weight: 600; color: #1e293b;">Here's how to get started:</p>
        <ul style="margin-bottom: 0; padding-left: 20px; color: #475569;">
          <li style="margin-bottom: 12px;"><strong>Publish</strong> – Share your latest research findings</li>
          <li style="margin-bottom: 12px;"><strong>Discover</strong> – Explore peer-reviewed data and insights</li>
          <li style="margin-bottom: 12px;"><strong>Collaborate</strong> – Engage in high-level academic discussions</li>
          <li style="margin-bottom: 0;"><strong>Network</strong> – Join specialized research groups</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/feed" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Explore the Feed</a>
      </p>
    `),
  }),

  newComment: (userName: string, postTitle: string, commentPreview: string, postUrl: string) => ({
    subject: `New comment on "${postTitle}"`,
    html: wrapEmailLayout(`
      <p style="font-size: 16px; color: #475569;">Hi there,</p>
      <p style="font-size: 16px; color: #475569;"><strong>${userName}</strong> has contributed to the discussion on your post "<strong>${postTitle}</strong>":</p>
      
      <div style="background: #f1f5f9; border-left: 4px solid #1e7a6e; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 24px 0; font-style: italic; color: #334155;">
        "${commentPreview.substring(0, 200)}${commentPreview.length > 200 ? '...' : ''}"
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Contribution</a>
      </p>
    `),
  }),

  newFollower: (followerName: string, followerUrl: string) => ({
    subject: `${followerName} joined your research network`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); line-height: 72px; color: white; font-size: 32px; font-weight: 700; margin: 0 auto 20px;">
          ${followerName.charAt(0).toUpperCase()}
        </div>
        <h2 style="color: #1e293b; margin: 0 0 8px;">${followerName}</h2>
        <p style="color: #64748b; margin-bottom: 24px; font-size: 16px;">is now following your research</p>
        <a href="${followerUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Profile</a>
      </div>
    `),
  }),

  postPublished: (postTitle: string, postUrl: string) => ({
    subject: `Your post "${postTitle}" is now live`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h2 style="color: #1e7a6e; margin-bottom: 12px;">Your post is live</h2>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
          <strong>"${postTitle}"</strong> has been successfully published to SyriaHub.
        </p>
        <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Your Post</a>
      </div>
    `),
  }),

  inviteUser: (inviterName: string, inviteUrl: string) => ({
    subject: `You've been invited to join SyriaHub`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <h2 style="color: #1e7a6e; margin: 0 0 16px;">Invitation to SyriaHub</h2>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
          <strong>${inviterName}</strong> has invited you to join <strong>SyriaHub</strong>, a professional research platform for knowledge sharing and collaboration.
        </p>
        <div style="background: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 30px; text-align: left;">
          <p style="margin: 0 0 12px; font-weight: 600; color: #1e293b;">With your account you can:</p>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;">Access exclusive research and insights</li>
            <li style="margin-bottom: 8px;">Collaborate with other vetted researchers</li>
            <li style="margin-bottom: 8px;">Contribute to the collective knowledge base</li>
          </ul>
        </div>
        <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">Accept Invitation</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          This invitation link will expire in 7 days.
        </p>
      </div>
    `),
  }),

  // PluraGate Network Invitation - English
  pluraGateInviteEN: (inviteUrl: string, recipientName?: string) => ({
    subject: 'SyriaHub access confirmation',
    html: wrapPluraGateEmailLayout({
      lang: 'en',
      dir: 'ltr',
      title: 'SyriaHub access confirmation',
      bodyHtml: `
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          ${recipientName ? `Hello ${recipientName},` : 'Hello,'}
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
          You are invited to join <strong>SyriaHub</strong>, a platform for research, documentation, and collaborative knowledge focused on Syria.
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 16px;">
            SyriaHub is part of the <strong>PluraGate</strong> network, a shared infrastructure for independent knowledge initiatives.
          </p>
          <p style="font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0;">
             The network provides governance and technical continuity, allowing initiatives like SyriaHub to retain their specific scope and autonomy.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 32px;">
          This invitation carries no obligation. It is an opportunity to access the platform, view research data, or participate in discussions if you choose.
        </p>
      `,
      cta: {
        label: 'Access SyriaHub',
        url: inviteUrl
      }
    }),
  }),

  // PluraGate Network Invitation - Arabic
  pluraGateInviteAR: (inviteUrl: string, recipientName?: string) => ({
    subject: 'تأكيد الوصول إلى SyriaHub',
    html: wrapPluraGateEmailLayout({
      lang: 'ar',
      dir: 'rtl',
      title: 'تأكيد الوصول إلى SyriaHub',
      bodyHtml: `
        <p style="font-size: 16px; color: #374151; line-height: 2; margin-bottom: 24px;">
          ${recipientName ? `مرحباً ${recipientName}،` : 'مرحباً،'}
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 2; margin-bottom: 24px;">
          أنت مدعو للانضمام إلى <strong>SyriaHub</strong>، منصة للبحث والتوثيق والمعرفة التشاركية حول سوريا.
        </p>

        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="font-size: 16px; color: #374151; line-height: 2; margin: 0 0 16px;">
            يعد SyriaHub جزءاً من شبكة <strong>PluraGate</strong>، وهي بنية تحتية مشتركة لمبادرات المعرفة المستقلة.
          </p>
          <p style="font-size: 15px; color: #6b7280; line-height: 2; margin: 0;">
             توفر الشبكة الحوكمة والاستمرارية التقنية، مما يتيح لمبادرات مثل SyriaHub الحفاظ على نطاقها واستقلاليتها.
          </p>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 2; margin-bottom: 32px;">
          هذه الدعوة لا تحمل أي التزام. إنها فرصة للوصول إلى المنصة، أو الاطلاع على البيانات البحثية، أو المشاركة في النقاشات إذا رغبت في ذلك.
        </p>
      `,
      cta: {
        label: 'الدخول إلى SyriaHub',
        url: inviteUrl
      }
    }),
  }),

  contactFormSubmission: (name: string, email: string, subject: string, message: string) => ({
    subject: `[Contact Form] ${subject}`,
    html: wrapEmailLayout(`
      <div style="font-family: 'Segoe UI', sans-serif;">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.01em;">New Contact Submission</h2>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 32px;">You learned something new! A visitor has reached out via the contact form.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; width: 100px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">From</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Email</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 500; font-size: 15px;">
                <a href="mailto:${email}" style="color: #1e7a6e; text-decoration: none; border-bottom: 1px dotted #1e7a6e;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Subject</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600; font-size: 15px;">${subject}</td>
            </tr>
          </table>
        </div>

        <div>
          <h3 style="color: #0f172a; font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center;">
            <span style="display: inline-block; width: 4px; height: 18px; background: #1e7a6e; border-radius: 2px; margin-right: 12px;"></span>
            Message Content
          </h3>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #334155; line-height: 1.7; white-space: pre-wrap; font-size: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">${message}</div>
        </div>
        
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; text-align: center;">
          <a href="mailto:${email}?subject=Re: ${subject}" style="display: inline-block; padding: 12px 24px; background: #0f172a; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Reply to ${name.split(' ')[0]}</a>
        </div>
      </div>
    `),
  }),
}

/**
 * Modern, premium layout wrapper for emails
 */
function wrapEmailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #0f172a; border-radius: 16px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); }
        .header { background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .footer { padding: 32px 20px; text-align: center; color: #64748b; font-size: 13px; }
        .btn { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        @media screen and (max-width: 600px) {
          .content { padding: 30px 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc;">
      <div class="wrapper" style="background-color: #f8fafc;">
        <table class="main" align="center" style="background-color: #ffffff; margin: 0 auto; max-width: 600px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td class="header" style="background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 40px 20px; text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color: #ffffff !important; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-decoration: none; font-family: 'Segoe UI', sans-serif;">SyriaHub</a>
            </td>
          </tr>
          <tr>
            <td class="content" style="padding: 40px 30px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>
        </table>
        <div class="footer" style="text-align: center; color: #64748b; font-size: 13px; padding: 32px 20px;">
          <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} SyriaHub. All rights reserved.</p>
          <p style="margin: 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> • 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" style="color: #64748b; text-decoration: underline;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

interface PluraGateEmailConfig {
  lang: 'en' | 'ar'
  dir: 'ltr' | 'rtl'
  title: string
  bodyHtml: string
  cta: {
    label: string
    url: string
  }
}

/**
 * PluraGate Network email layout - clean, minimalist design
 * Structured configuration for consistency across languages
 */
function wrapPluraGateEmailLayout({ lang, dir, title, bodyHtml, cta }: PluraGateEmailConfig): string {
  const isRTL = dir === 'rtl'
  const textAlign = isRTL ? 'right' : 'left'
  const fontFamily = isRTL
    ? "'Segoe UI', Tahoma, Arial, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

  return `
    <!DOCTYPE html>
    <html lang="${lang}" dir="${dir}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          font-family: ${fontFamily}; 
          background-color: #f9fafb; 
          color: #1f2937;
          direction: ${dir};
        }
        .wrapper { 
          width: 100%; 
          table-layout: fixed; 
          background-color: #f9fafb; 
          padding: 40px 20px;
        }
        .main { 
          background-color: #ffffff; 
          margin: 0 auto; 
          width: 100%; 
          max-width: 600px; 
          border-spacing: 0; 
          color: #1f2937; 
          border-radius: 12px; 
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        .header { 
          background: #ffffff; 
          padding: 32px 40px 24px; 
          text-align: ${textAlign};
          border-bottom: 1px solid #e5e7eb;
        }
        .logo { 
          color: #1e7a6e; 
          font-size: 28px; 
          font-weight: 700; 
          text-decoration: none;
          letter-spacing: -0.025em;
        }
        .content { 
          padding: 32px 40px; 
          text-align: ${textAlign};
        }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%);
          color: #ffffff; 
          padding: 14px 32px; 
          border-radius: 8px; 
          text-decoration: none; 
          font-weight: 600;
          font-size: 16px;
        }
        .footer { 
          padding: 24px 40px; 
          text-align: center; 
          color: #9ca3af; 
          font-size: 12px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        @media screen and (max-width: 600px) {
          .content { padding: 24px 20px !important; }
          .header { padding: 24px 20px 20px !important; }
          .footer { padding: 20px !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main">
          <tr>
            <td class="header">
              <a href="https://pluragate.org" class="logo">PluraGate</a>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${bodyHtml}
              
              <!-- CTA Button - Table-based for email client compatibility -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto; text-align: center;">
                <tr>
                  <td style="border-radius: 8px; background-color: #1e7a6e;" bgcolor="#1e7a6e">
                    <a href="${cta.url}" target="_blank" style="display: inline-block; padding: 14px 36px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">${cta.label}</a>
                  </td>
                </tr>
              </table>
              
              <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 24px 0 0;">
                ${isRTL ? 'إذا لم يعمل الزر، انسخ والصق الرابط التالي في متصفحك:' : 'If the button does not work, copy and paste the following link into your browser:'}
              </p>
              <p style="font-size: 12px; color: #1e7a6e; word-break: break-all; text-align: center; background-color: #f3f4f6; padding: 12px; border-radius: 6px; margin-top: 8px;">
                ${cta.url}
              </p>
            </td>
          </tr>
        </table>
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} PluraGate Network</p>
          <p style="margin: 8px 0 0; color: #6b7280;">
            ${isRTL ? 'شبكة مبادرات المعرفة المستقلة' : 'A network of independent knowledge initiatives'}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
