import nodemailer from 'nodemailer'
import { createServerClient } from './supabaseClient'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Create reusable transporter (Gmail SMTP for testing)
const createTransporter = () => {
  const config = {
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD, // App password for Gmail
    },
  }

  return nodemailer.createTransport(config)
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  const supabase = await createServerClient()

  try {
    // In production, we call the Supabase Edge Function
    if (process.env.NODE_ENV === 'production' || process.env.USE_EDGE_FUNCTIONS === 'true') {
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

    // Local/Dev Fallback
    const transporter = createTransporter()
    await transporter.sendMail({
      from: `"SyriaHub" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    // Log to database even in dev
    await supabase.from('email_logs').insert({
      recipient_email: to,
      subject,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    return true
  } catch (error: any) {
    console.error('Email send error:', error)

    // Log failure
    await supabase.from('email_logs').insert({
      recipient_email: to,
      subject,
      status: 'failed',
      error_message: error.message,
    })

    return false
  }
}

// Email templates
export const emailTemplates = {
  welcome: (userName: string) => ({
    subject: 'Welcome to SyriaHub! 🎉',
    html: wrapEmailLayout(`
      <h1 style="color: #1e293b; margin-top: 0;">Welcome, ${userName}! 👋</h1>
      <p style="font-size: 16px; color: #475569; line-height: 1.6;">Thank you for joining SyriaHub, the next-generation research platform for knowledge sharing and academic collaboration.</p>
      
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <p style="margin-top: 0; font-weight: 600; color: #1e293b;">Here's how to get started:</p>
        <ul style="margin-bottom: 0; padding-left: 20px; color: #475569;">
          <li style="margin-bottom: 12px;"><strong>📝 Publish</strong>: Share your latest research findings</li>
          <li style="margin-bottom: 12px;"><strong>🔍 Discover</strong>: Explore peer-reviewed data and insights</li>
          <li style="margin-bottom: 12px;"><strong>💬 Collaborate</strong>: Engage in high-level academic discussions</li>
          <li style="margin-bottom: 0;"><strong>👥 Network</strong>: Join specialized research groups</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/feed" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">Explore the Feed</a>
      </p>
    `),
  }),

  newComment: (userName: string, postTitle: string, commentPreview: string, postUrl: string) => ({
    subject: `New comment on "${postTitle}"`,
    html: wrapEmailLayout(`
      <p style="font-size: 16px; color: #475569;">Hi there,</p>
      <p style="font-size: 16px; color: #475569;"><strong>${userName}</strong> has contributed to the discussion on your post "<strong>${postTitle}</strong>":</p>
      
      <div style="background: #f1f5f9; border-left: 4px solid #6366f1; padding: 20px; border-radius: 4px 12px 12px 4px; margin: 24px 0; font-style: italic; color: #334155;">
        "${commentPreview.substring(0, 200)}${commentPreview.length > 200 ? '...' : ''}"
      </div>

      <p style="text-align: center; margin-top: 32px;">
        <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Contribution</a>
      </p>
    `),
  }),

  newFollower: (followerName: string, followerUrl: string) => ({
    subject: `${followerName} joined your research network`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); line-height: 72px; color: white; font-size: 32px; font-weight: 700; margin: 0 auto 20px;">
          ${followerName.charAt(0).toUpperCase()}
        </div>
        <h2 style="color: #1e293b; margin: 0 0 8px;">${followerName}</h2>
        <p style="color: #64748b; margin-bottom: 24px; font-size: 16px;">is now following your research</p>
        <a href="${followerUrl}" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 12px; font-weight: 600;">View Profile</a>
      </div>
    `),
  }),

  postPublished: (postTitle: string, postUrl: string) => ({
    subject: `Your post "${postTitle}" is now live!`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
        <h2 style="color: #6366f1; margin-bottom: 12px;">Your post is live!</h2>
        <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">
          <strong>"${postTitle}"</strong> has been successfully published to SyriaHub.
        </p>
        <a href="${postUrl}" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">View Your Post</a>
      </div>
    `),
  }),

  inviteUser: (inviterName: string, inviteUrl: string) => ({
    subject: `You've been invited to join SyriaHub`,
    html: wrapEmailLayout(`
      <div style="text-align: center;">
        <h2 style="color: #6366f1; margin: 0 0 16px;">Exclusive Invitation</h2>
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
        <a href="${inviteUrl}" style="display: inline-block; padding: 14px 32px; background: #6366f1; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2);">Accept Invitation</a>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          This invitation link will expire in 7 days.
        </p>
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
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; }
        .logo { color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-decoration: none; }
        .content { padding: 40px 30px; }
        .footer { padding: 20px; text-align: center; color: #64748b; font-size: 13px; }
        .btn { display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; }
        @media screen and (max-width: 600px) {
          .content { padding: 30px 20px !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main">
          <tr>
            <td class="header">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}" class="logo">SyriaHub</a>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>
        </table>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SyriaHub. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> • 
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/support" style="color: #64748b; text-decoration: underline;">Support</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
