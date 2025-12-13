import nodemailer from 'nodemailer'

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
    try {
        const transporter = createTransporter()

        await transporter.sendMail({
            from: `"Syrealize" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
        })

        return true
    } catch (error) {
        console.error('Email send error:', error)
        return false
    }
}

// Email templates
export const emailTemplates = {
    welcome: (userName: string) => ({
        subject: 'Welcome to Syrealize! 🎉',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 30px 0; }
          .logo { font-size: 28px; font-weight: 700; color: #6366f1; }
          .content { background: #f8fafc; border-radius: 12px; padding: 30px; margin: 20px 0; }
          .button { display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; color: #64748b; font-size: 14px; padding: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Syrealize</div>
          </div>
          <div class="content">
            <h1>Welcome, ${userName}! 👋</h1>
            <p>Thank you for joining Syrealize, the research platform for knowledge sharing.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>📝 Share your research and ideas</li>
              <li>🔍 Discover posts from the community</li>
              <li>💬 Engage in discussions</li>
              <li>👥 Join groups with shared interests</li>
            </ul>
            <p style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/feed" class="button">Explore the Feed</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Syrealize. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    newComment: (userName: string, postTitle: string, commentPreview: string, postUrl: string) => ({
        subject: `New comment on "${postTitle}"`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #e2e8f0; }
          .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
          .content { padding: 30px 0; }
          .comment-box { background: #f8fafc; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; color: #64748b; font-size: 12px; padding: 20px 0; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Syrealize</div>
          </div>
          <div class="content">
            <p>Hi there,</p>
            <p><strong>${userName}</strong> commented on your post "<strong>${postTitle}</strong>":</p>
            <div class="comment-box">
              "${commentPreview.substring(0, 200)}${commentPreview.length > 200 ? '...' : ''}"
            </div>
            <p>
              <a href="${postUrl}" class="button">View Comment</a>
            </p>
          </div>
          <div class="footer">
            <p>You're receiving this because you're subscribed to comment notifications.</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/settings/notifications">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    newFollower: (followerName: string, followerUrl: string) => ({
        subject: `${followerName} started following you`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; background: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
          .avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
          .avatar span { color: white; font-size: 28px; font-weight: 600; }
          h2 { text-align: center; margin: 0 0 8px; }
          .subtitle { text-align: center; color: #64748b; margin-bottom: 24px; }
          .button { display: block; text-align: center; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
          .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="logo">Syrealize</div>
            </div>
            <div class="avatar">
              <span>${followerName.charAt(0).toUpperCase()}</span>
            </div>
            <h2>${followerName}</h2>
            <p class="subtitle">started following you</p>
            <a href="${followerUrl}" class="button">View Profile</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Syrealize</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    postPublished: (postTitle: string, postUrl: string) => ({
        subject: `Your post "${postTitle}" is now live!`,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a2e; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { font-size: 24px; font-weight: 700; color: #6366f1; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .content { background: #f0fdf4; border-radius: 12px; padding: 30px; margin: 20px 0; text-align: center; }
          h2 { color: #16a34a; margin: 0 0 12px; }
          .button { display: inline-block; padding: 14px 28px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
          .share-buttons { margin-top: 24px; }
          .share-buttons a { margin: 0 8px; color: #6366f1; text-decoration: none; }
          .footer { text-align: center; color: #64748b; font-size: 12px; padding: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Syrealize</div>
          </div>
          <div class="content">
            <div class="success-icon">🎉</div>
            <h2>Your post is live!</h2>
            <p><strong>"${postTitle}"</strong> has been published successfully.</p>
            <a href="${postUrl}" class="button">View Your Post</a>
            <div class="share-buttons">
              <p style="color: #64748b; font-size: 14px; margin-bottom: 8px;">Share it with the world:</p>
              <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postTitle)}">Twitter</a>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}">LinkedIn</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Syrealize. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
}
