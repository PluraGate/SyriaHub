/**
 * Privacy-respecting browser fingerprinting utility
 * 
 * This generates a hash from browser characteristics to identify
 * unique browsers. All data is hashed locally - no raw fingerprint
 * data is ever transmitted.
 * 
 * Characteristics used:
 * - Screen resolution & color depth
 * - Timezone & language
 * - Canvas rendering (unique per browser/GPU)
 * - WebGL renderer info
 * - Platform info
 */

export async function generateBrowserFingerprint(): Promise<string> {
    const components: string[] = []

    // Screen characteristics
    components.push(`screen:${window.screen.width}x${window.screen.height}`)
    components.push(`depth:${window.screen.colorDepth}`)
    components.push(`ratio:${window.devicePixelRatio || 1}`)

    // Timezone
    components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

    // Language
    components.push(`lang:${navigator.language}`)

    // Platform
    components.push(`platform:${navigator.platform}`)

    // Hardware concurrency (CPU cores)
    components.push(`cores:${navigator.hardwareConcurrency || 0}`)

    // Canvas fingerprint
    const canvasHash = getCanvasFingerprint()
    components.push(`canvas:${canvasHash}`)

    // WebGL fingerprint
    const webglHash = getWebGLFingerprint()
    components.push(`webgl:${webglHash}`)

    // Combine all components and hash
    const fingerprint = components.join('|')
    return await hashString(fingerprint)
}

/**
 * Generate a canvas fingerprint by drawing hidden elements
 * Different browsers/GPUs render slightly differently
 */
function getCanvasFingerprint(): string {
    try {
        const canvas = document.createElement('canvas')
        canvas.width = 200
        canvas.height = 50
        const ctx = canvas.getContext('2d')

        if (!ctx) return 'no-canvas'

        // Draw text with specific font and effects
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillStyle = '#f60'
        ctx.fillRect(10, 1, 62, 20)

        ctx.fillStyle = '#069'
        ctx.fillText('SyriaHub', 2, 15)

        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
        ctx.fillText('Research', 4, 17)

        // Get data URL and hash it
        const dataUrl = canvas.toDataURL()
        return simpleHash(dataUrl)
    } catch {
        return 'canvas-error'
    }
}

/**
 * Get WebGL renderer information
 * This is unique per GPU/driver combination
 */
function getWebGLFingerprint(): string {
    try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

        if (!gl) return 'no-webgl'

        const webgl = gl as WebGLRenderingContext
        const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info')

        if (debugInfo) {
            const vendor = webgl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            const renderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
            return simpleHash(`${vendor}|${renderer}`)
        }

        // Fallback to basic info
        const vendor = webgl.getParameter(webgl.VENDOR)
        const renderer = webgl.getParameter(webgl.RENDERER)
        return simpleHash(`${vendor}|${renderer}`)
    } catch {
        return 'webgl-error'
    }
}

/**
 * Simple hash function for strings (djb2 algorithm)
 * Used for component-level hashing
 */
function simpleHash(str: string): string {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
}

/**
 * SHA-256 hash for the final fingerprint
 * This provides a secure, fixed-length output
 */
async function hashString(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)

    try {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
    } catch {
        // Fallback for environments without crypto.subtle
        return simpleHash(str).padEnd(32, '0')
    }
}
