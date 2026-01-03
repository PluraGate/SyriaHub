/// <reference lib="webworker" />

const CACHE_VERSION = 'v1.0.0'
const STATIC_CACHE = `syriahub-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `syriahub-dynamic-${CACHE_VERSION}`
const OFFLINE_CACHE = `syriahub-offline-${CACHE_VERSION}`

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
]

// API routes that should use network-first strategy
const API_ROUTES = [
    '/api/',
    '/auth/',
]

// Routes that can be cached for offline reading
const CACHEABLE_ROUTES = [
    '/post/',
    '/profile/',
    '/feed',
    '/explore',
]

// Maximum age for cached responses (24 hours)
const MAX_CACHE_AGE = 24 * 60 * 60 * 1000

self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...')

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Pre-caching static assets')
                return cache.addAll(STATIC_ASSETS)
            })
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...')

    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) =>
                            key !== STATIC_CACHE &&
                            key !== DYNAMIC_CACHE &&
                            key !== OFFLINE_CACHE
                        )
                        .map((key) => {
                            console.log('[SW] Removing old cache:', key)
                            return caches.delete(key)
                        })
                )
            })
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return
    }

    // Skip cross-origin requests
    if (url.origin !== self.location.origin) {
        return
    }

    // API requests: Network first, fall back to cache
    if (API_ROUTES.some((route) => url.pathname.startsWith(route))) {
        event.respondWith(networkFirst(request))
        return
    }

    // Static assets: Cache first
    if (isStaticAsset(url.pathname)) {
        event.respondWith(cacheFirst(request))
        return
    }

    // Cacheable routes (posts, profiles): Stale-while-revalidate
    if (CACHEABLE_ROUTES.some((route) => url.pathname.startsWith(route))) {
        event.respondWith(staleWhileRevalidate(request))
        return
    }

    // Default: Network first with offline fallback
    event.respondWith(networkFirst(request))
})

// Cache-first strategy for static assets
async function cacheFirst(request) {
    const cached = await caches.match(request)
    if (cached) {
        return cached
    }

    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(STATIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        return offlineFallback()
    }
}

// Network-first strategy for API and dynamic content
async function networkFirst(request) {
    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch (error) {
        const cached = await caches.match(request)
        if (cached) {
            return cached
        }
        return offlineFallback()
    }
}

// Stale-while-revalidate for posts/profiles
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cached = await cache.match(request)

    const networkPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone())
            }
            return response
        })
        .catch(() => cached || offlineFallback())

    return cached || networkPromise
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
    return (
        pathname.startsWith('/_next/static/') ||
        pathname.startsWith('/icons/') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.woff2')
    )
}

// Offline fallback page
async function offlineFallback() {
    const cache = await caches.open(OFFLINE_CACHE)
    const offlinePage = await cache.match('/offline')
    if (offlinePage) {
        return offlinePage
    }

    // Fallback HTML following SyriaHub Design System
    return new Response(
        `<!DOCTYPE html>
    <html lang="en" class="dark">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Offline - SyriaHub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #10282A;
            --primary-light: #1A3A3D;
            --accent: #d91636;
            --accent-light: #E6385A;
            --dark-bg: #0F1419;
            --dark-surface: #1A1F26;
            --dark-border: #2A3139;
            --dark-text: #E1E8ED;
            --dark-text-muted: #8899A6;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: var(--dark-bg);
            color: var(--dark-text);
            text-align: center;
            padding: 24px;
            position: relative;
            overflow: hidden;
          }
          /* Ambient background glows */
          .glow-top {
            position: absolute;
            top: -10%;
            left: -10%;
            width: 40%;
            height: 40%;
            background: rgba(16, 40, 42, 0.3);
            border-radius: 50%;
            filter: blur(120px);
            pointer-events: none;
          }
          .glow-bottom {
            position: absolute;
            bottom: -10%;
            right: -10%;
            width: 40%;
            height: 40%;
            background: rgba(217, 22, 54, 0.1);
            border-radius: 50%;
            filter: blur(120px);
            pointer-events: none;
          }
          .container {
            max-width: 400px;
            position: relative;
            z-index: 10;
          }
          .icon-wrapper {
            position: relative;
            width: 112px;
            height: 112px;
            margin: 0 auto 40px;
          }
          .icon-glow {
            position: absolute;
            inset: 0;
            background: rgba(16, 40, 42, 0.4);
            border-radius: 50%;
            filter: blur(20px);
            animation: pulse 2s ease-in-out infinite;
          }
          .icon-circle {
            position: relative;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: var(--dark-surface);
            border: 1px solid var(--dark-border);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          }
          .icon-circle svg {
            width: 48px;
            height: 48px;
            color: var(--accent);
            animation: bounce 2s ease-in-out infinite;
          }
          h1 {
            font-family: 'Manrope', system-ui, sans-serif;
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 16px;
            letter-spacing: -0.025em;
            color: var(--dark-text);
          }
          p {
            color: var(--dark-text-muted);
            line-height: 1.75;
            font-size: 1.125rem;
            max-width: 320px;
            margin: 0 auto;
          }
          .button-group {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 40px;
          }
          button {
            padding: 16px 32px;
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 1rem;
            font-weight: 500;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: all 0.3s ease;
          }
          .btn-primary {
            background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(217, 22, 54, 0.3), 0 4px 6px -4px rgba(217, 22, 54, 0.2);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(217, 22, 54, 0.4), 0 8px 10px -6px rgba(217, 22, 54, 0.3);
          }
          .btn-outline {
            background: transparent;
            color: var(--dark-text);
            border: 1px solid var(--dark-border);
          }
          .btn-outline:hover {
            background: var(--dark-surface);
          }
          .platform-label {
            margin-top: 48px;
            font-size: 0.75rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(136, 153, 166, 0.4);
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @media (min-width: 640px) {
            .button-group {
              flex-direction: row;
              justify-content: center;
            }
            button { width: auto; }
          }
        </style>
      </head>
      <body>
        <div class="glow-top"></div>
        <div class="glow-bottom"></div>
        <div class="container">
          <div class="icon-wrapper">
            <div class="icon-glow"></div>
            <div class="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="1" x2="23" y1="1" y2="23"></line>
                <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                <line x1="12" x2="12.01" y1="20" y2="20"></line>
              </svg>
            </div>
          </div>
          <h1>You're Offline</h1>
          <p>Connection lost. Your reading continues with locally cached content.</p>
          <div class="button-group">
            <button class="btn-primary" onclick="location.reload()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
              Try Again
            </button>
            <button class="btn-outline" onclick="window.location.href='/'">
              Back to Home
            </button>
          </div>
          <div class="platform-label">SyriaHub</div>
        </div>
      </body>
    </html>`,
        {
            headers: { 'Content-Type': 'text/html' },
            status: 503,
            statusText: 'Service Unavailable',
        }
    )
}

// Background sync for pending submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-drafts') {
        event.waitUntil(syncDrafts())
    }
})

async function syncDrafts() {
    console.log('[SW] Syncing drafts...')
    // Get pending drafts from IndexedDB and submit them
    // This will be coordinated with the offlineStorage lib
}

// Push notifications (placeholder)
self.addEventListener('push', (event) => {
    const data = event.data?.json() || {}

    const options = {
        body: data.body || 'New activity on SyriaHub',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: data.tag || 'syriahub-notification',
        requireInteraction: data.requireInteraction || false,
        data: {
            url: data.url || '/',
        },
    }

    event.waitUntil(
        self.registration.showNotification(data.title || 'SyriaHub', options)
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()

    const url = event.notification.data?.url || '/'

    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clients) => {
            // Focus existing window if open
            for (const client of clients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus()
                }
            }
            // Otherwise open new window
            return self.clients.openWindow(url)
        })
    )
})

console.log('[SW] Service worker loaded')
