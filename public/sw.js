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

    return new Response(
        `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Offline - SyriaHub</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #0f172a;
            color: #e2e8f0;
            text-align: center;
            padding: 20px;
          }
          .container { max-width: 400px; }
          h1 { font-size: 1.5rem; margin-bottom: 1rem; }
          p { color: #94a3b8; line-height: 1.6; }
          .icon { font-size: 3rem; margin-bottom: 1rem; }
          button {
            margin-top: 1.5rem;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📡</div>
          <h1>You're Offline</h1>
          <p>It looks like you've lost your internet connection. Some content may still be available from your cache.</p>
          <button onclick="location.reload()">Try Again</button>
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
