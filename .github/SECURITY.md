# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.9.x   | :white_check_mark: |
| < 0.9   | :x:                |

## Reporting a Vulnerability

**Please do NOT open a public issue for security vulnerabilities.**

If you discover a security vulnerability in SyriaHub, please report it responsibly:

1. **Email:** [security@pluragate.org](mailto:security@pluragate.org)
2. **Subject line:** `[SECURITY] SyriaHub — <brief description>`
3. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Action                    | Timeframe       |
|---------------------------|-----------------|
| Acknowledgement           | Within 48 hours |
| Initial assessment        | Within 5 days   |
| Fix development & testing | Within 30 days  |
| Public disclosure          | After fix is deployed |

### What to Expect

- You will receive an acknowledgement within 48 hours confirming we received your report.
- We will work with you to understand and validate the issue.
- We will develop and test a fix before any public disclosure.
- We will credit you in the release notes (unless you prefer to remain anonymous).

### Scope

The following are in scope:

- **SyriaHub web application** (syriahub.org)
- **API endpoints** (`/api/*`)
- **Authentication and authorisation** flows
- **Data exposure** or privacy issues
- **Supabase RLS policy** bypasses
- **XSS, CSRF, SSRF, injection** vulnerabilities

The following are **out of scope**:

- Denial-of-service attacks
- Social engineering
- Issues in third-party dependencies (report upstream, then notify us)
- Issues requiring physical access to a user's device

### Safe Harbour

We will not pursue legal action against researchers who:

- Report vulnerabilities responsibly
- Do not access or modify other users' data
- Do not disrupt the platform's availability
- Follow this policy

## Security Measures

SyriaHub implements the following security controls:

- **Row Level Security (RLS)** on all Supabase tables
- **CSRF protection** via origin validation on all mutation endpoints
- **Rate limiting** on API endpoints
- **AI-powered content moderation** with manual review
- **Input sanitisation** on search and form inputs
- **Secure headers** via Next.js and Vercel configuration
- **Invite-only signup** to control access
- **Role-based access control (RBAC)** with admin, moderator, and researcher roles
