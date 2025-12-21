// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: "https://2a355fdc50a885253aa1409f16f024d5@o4510574500839424.ingest.de.sentry.io/4510574502608976",

    // Conservative sampling to avoid noise and cost (10% of transactions)
    tracesSampleRate: 0.1,

    // Session Replay (only capture errors, very low sample rate)
    replaysSessionSampleRate: 0.01, // 1% of sessions
    replaysOnErrorSampleRate: 0.5,  // 50% of sessions with errors

    // PII discipline: Don't send personally identifiable information
    sendDefaultPii: false,

    // Environment tag
    environment: process.env.NODE_ENV,

    // Add integrations for session replay
    integrations: [
        Sentry.replayIntegration({
            // Mask all text content for privacy
            maskAllText: true,
            // Block all media for privacy
            blockAllMedia: true,
        }),
    ],

    // Scrub sensitive data from breadcrumbs
    beforeBreadcrumb(breadcrumb) {
        // Don't log fetch bodies (may contain user content)
        if (breadcrumb.category === 'fetch' && breadcrumb.data) {
            delete breadcrumb.data.body;
        }
        return breadcrumb;
    },

    // Filter out noisy errors
    ignoreErrors: [
        // Browser extensions
        /chrome-extension/,
        /moz-extension/,
        // Network errors users can't control
        'Network request failed',
        'Failed to fetch',
        'Load failed',
        // Cancelled requests
        'AbortError',
        'The operation was aborted',
    ],
});
