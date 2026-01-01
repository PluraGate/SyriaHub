// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// SMTP Configuration from Supabase Secrets
const SMTP_HOST = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com'
const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
const SMTP_USER = Deno.env.get('SMTP_USER') || 'admin@pluragate.org'
const SMTP_PASS = Deno.env.get('SMTP_PASS')!
const FROM_NAME = Deno.env.get('FROM_NAME') || 'SyriaHub via PluraGate'

const corsHeaders = {
    // SECURITY: Restrict CORS to known origins instead of wildcard
    // In production, set ALLOWED_ORIGIN env variable to your domain
    'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, text } = await req.json()

        if (!to || !subject || !html) {
            throw new Error('Missing required fields: to, subject, html')
        }

        // Use Gmail SMTP via fetch to a nodemailer-compatible relay
        // Note: Supabase Edge Functions can't use raw SMTP, so we use Gmail API approach

        // For now, we'll use the Gmail API via OAuth or a third-party SMTP relay
        // Alternative: Use Supabase's built-in email or a webhook to your Next.js API

        // Sending via Gmail SMTP requires a relay service in Edge Functions
        // Recommended: Use Supabase Auth emails or call your Next.js API endpoint

        const response = await fetch(`${Deno.env.get('SITE_URL')}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            },
            body: JSON.stringify({
                to,
                subject,
                html,
                text,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to send email')
        }

        const data = await response.json()

        return new Response(
            JSON.stringify({ success: true, ...data }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Email Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
