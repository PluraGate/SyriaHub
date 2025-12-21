/**
 * Server-side Cloudflare Turnstile verification
 * 
 * Use this utility in server actions to verify CAPTCHA tokens
 */

interface TurnstileVerifyResponse {
    success: boolean
    'error-codes'?: string[]
    challenge_ts?: string
    hostname?: string
}

/**
 * Verify a Turnstile token with Cloudflare's siteverify API
 * @param token - The token received from the Turnstile widget
 * @returns true if verification passed, false otherwise
 */
export async function verifyTurnstileToken(token: string | null): Promise<boolean> {
    // If no secret key configured, skip verification (development mode)
    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
        console.warn('Turnstile: TURNSTILE_SECRET_KEY not set, skipping verification')
        return true
    }

    // If no token provided, fail verification
    if (!token) {
        return false
    }

    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
            }),
        })

        const data: TurnstileVerifyResponse = await response.json()

        if (!data.success) {
            console.warn('Turnstile verification failed:', data['error-codes'])
        }

        return data.success
    } catch (error) {
        console.error('Turnstile verification error:', error)
        return false
    }
}
