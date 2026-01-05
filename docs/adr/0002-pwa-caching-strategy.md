# ADR-0002: PWA Caching Strategy

## Status
Accepted

## Date
2024-12-15 (Documented 2026-01-04)

## Context
SyriaHub serves researchers who may work in areas with unreliable internet connectivity (conflict zones, field research). We needed a Progressive Web App (PWA) strategy that:

1. Allows offline access to previously viewed content
2. Prioritizes fresh data when online
3. Supports offline draft creation
4. Doesn't consume excessive storage on mobile devices

## Decision
We implemented a multi-tier caching strategy using a Service Worker with different policies per resource type:

| Resource Type | Strategy | Rationale |
|---------------|----------|-----------|
| Static assets (JS, CSS, images) | **Cache-First** | These rarely change; serve from cache for speed |
| API responses (posts, comments) | **Network-First** | Prefer fresh data, fallback to cache when offline |
| Translation files | **Stale-While-Revalidate** | Show cached immediately, update in background |
| User drafts | **IndexedDB** | Persist drafts locally until sync |

### Key Implementation Details
- Cache limit: ~50MB per origin
- Draft sync: Automatic when connection restored
- Offline indicator: Shows cached article count
- Cache invalidation: On service worker update

## Consequences

### Positive
- Researchers can access previously viewed content offline
- Drafts are never lost due to connectivity issues
- Fast repeat visits (cache-first for static assets)

### Negative
- Slightly more complex debugging (cache vs network)
- Users may see stale data momentarily (SWR pattern)
- Storage limits vary by browser/device

## References
- `/public/sw.js` - Service Worker implementation
- `/lib/offline-storage.ts` - IndexedDB wrapper
- `/components/OfflineIndicator.tsx` - UI component
