import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { to, subject, html, text } = await req.json()

        if (!to || !subject || !html) {
            throw new Error('Missing required fields: to, subject, html')
        }

        // SMTP Configuration from Supabase Secrets
        const SMTP_HOSTNAME = Deno.env.get('SMTP_HOSTNAME') || 'smtp.gmail.com'
        const SMTP_PORT = parseInt(Deno.env.get('SMTP_PORT') || '465')
        const SMTP_USER = Deno.env.get('SMTP_USER')
        const SMTP_PASS = Deno.env.get('SMTP_PASS')
        const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:3000'

        if (!SMTP_USER || !SMTP_PASS) {
            throw new Error('SMTP credentials not configured in Supabase Secrets')
        }

        const client = new SmtpClient()

        await client.connectTLS({
            hostname: SMTP_HOSTNAME,
            port: SMTP_PORT,
            username: SMTP_USER,
            password: SMTP_PASS,
        })

        await client.send({
            from: `"SyriaHub" <${SMTP_USER}>`,
            to,
            subject,
            content: text || html.replace(/<[^>]*>/g, ''),
            html,
        })

        await client.close()

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Email Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
