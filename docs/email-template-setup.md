# Customizing Supabase Email Templates for SyriaHub

The verification email template is managed in the **Supabase Dashboard**, not in code. To apply SyriaHub/Pluragate branding:

## Steps to Customize

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**
4. Click on **Confirm signup** template
5. Replace the default content with the HTML below

## Branded Email Template (Copy & Paste)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - SyriaHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1117;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #161b22; border-radius: 16px; border: 1px solid #30363d; overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SyriaHub</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Research Platform by Pluragate</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #e6edf3; font-size: 24px; font-weight: 600; text-align: center;">
                Welcome to SyriaHub
              </h2>
              <p style="margin: 0 0 24px 0; color: #8b949e; font-size: 16px; line-height: 1.6; text-align: center;">
                Thank you for joining our research community. Please verify your email address to activate your account and start collaborating.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 8px 0; color: #8b949e; font-size: 14px; text-align: center;">
                If the button does not work, copy and paste the following link into your browser:
              </p>
              <p style="margin: 0; color: #58a6ff; font-size: 12px; word-break: break-all; text-align: center; background-color: #0d1117; padding: 12px; border-radius: 8px;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #30363d; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #8b949e; font-size: 12px;">
                This email was sent by SyriaHub, a product of Pluragate.
              </p>
              <p style="margin: 0; color: #6e7681; font-size: 11px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Copyright -->
        <p style="margin: 24px 0 0 0; color: #6e7681; font-size: 11px; text-align: center;">
          © {{ .SiteURL | split "/" | index 2 }} SyriaHub. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Subject Line
Set the subject to: `Verify your email - SyriaHub`

---

## Reset Password Template

**Subject:** `Reset your password - SyriaHub`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - SyriaHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1117;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #161b22; border-radius: 16px; border: 1px solid #30363d; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SyriaHub</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Research Platform by Pluragate</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #e6edf3; font-size: 24px; font-weight: 600; text-align: center;">
                Reset Your Password
              </h2>
              <p style="margin: 0 0 24px 0; color: #8b949e; font-size: 16px; line-height: 1.6; text-align: center;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 8px 0; color: #8b949e; font-size: 13px; text-align: center;">
                If the button does not work, copy and paste the following link into your browser:
              </p>
              <p style="margin: 0; color: #58a6ff; font-size: 12px; word-break: break-all; text-align: center; background-color: #0d1117; padding: 12px; border-radius: 8px;">
                {{ .ConfirmationURL }}
              </p>
              <p style="margin: 16px 0 0 0; color: #6e7681; font-size: 13px; text-align: center;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #30363d; text-align: center;">
              <p style="margin: 0; color: #6e7681; font-size: 11px;">
                © SyriaHub by Pluragate. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Magic Link Template

**Subject:** `Your login link - SyriaHub`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Magic Link - SyriaHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1117;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #161b22; border-radius: 16px; border: 1px solid #30363d; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SyriaHub</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Research Platform by Pluragate</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #e6edf3; font-size: 24px; font-weight: 600; text-align: center;">
                Your Login Link
              </h2>
              <p style="margin: 0 0 24px 0; color: #8b949e; font-size: 16px; line-height: 1.6; text-align: center;">
                Click the button below to securely sign in to your SyriaHub account. This link expires in 1 hour.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Sign In to SyriaHub
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 8px 0; color: #8b949e; font-size: 13px; text-align: center;">
                If the button does not work, copy and paste the following link into your browser:
              </p>
              <p style="margin: 0; color: #58a6ff; font-size: 12px; word-break: break-all; text-align: center; background-color: #0d1117; padding: 12px; border-radius: 8px;">
                {{ .ConfirmationURL }}
              </p>
              <p style="margin: 16px 0 0 0; color: #6e7681; font-size: 13px; text-align: center;">
                If you didn't request this link, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #30363d; text-align: center;">
              <p style="margin: 0; color: #6e7681; font-size: 11px;">
                © SyriaHub by Pluragate. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Change Email Template

**Subject:** `Confirm your new email - SyriaHub`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change - SyriaHub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1117; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1117;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #161b22; border-radius: 16px; border: 1px solid #30363d; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">SyriaHub</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Research Platform by Pluragate</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #e6edf3; font-size: 24px; font-weight: 600; text-align: center;">
                Confirm Email Change
              </h2>
              <p style="margin: 0 0 24px 0; color: #8b949e; font-size: 16px; line-height: 1.6; text-align: center;">
                Please confirm this is your new email address by clicking the button below.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 8px 0 24px 0;">
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #1e7a6e 0%, #0d4d44 100%); color: #ffffff; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 8px 0; color: #8b949e; font-size: 13px; text-align: center;">
                If the button does not work, copy and paste the following link into your browser:
              </p>
              <p style="margin: 0; color: #58a6ff; font-size: 12px; word-break: break-all; text-align: center; background-color: #0d1117; padding: 12px; border-radius: 8px;">
                {{ .ConfirmationURL }}
              </p>
              <p style="margin: 16px 0 0 0; color: #6e7681; font-size: 13px; text-align: center;">
                If you didn't request this change, please contact support immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; border-top: 1px solid #30363d; text-align: center;">
              <p style="margin: 0; color: #6e7681; font-size: 11px;">
                © SyriaHub by Pluragate. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Notes
- All templates use `{{ .ConfirmationURL }}` which Supabase replaces with the actual link
- Colors match SyriaHub's dark theme (`#0d1117`, `#161b22`, `#1e7a6e`)
- Includes Pluragate branding in header and footer
- Mobile-responsive design
- No images = better spam score

## DNS Records Checklist
- ✅ **SPF** - Already configured
- ✅ **DKIM** - Added to WordPress DNS  
- ✅ **DMARC** - Added to WordPress DNS

> **Note:** DNS changes can take up to 48 hours to propagate. Use [MXToolbox](https://mxtoolbox.com/dkim.aspx) to verify your DKIM record is live.
