/**
 * Offline Storage Module
 * Provides IndexedDB-based storage for offline functionality:
 * - Draft queue for saving posts when offline
 * - Article cache for offline reading
 * - Background sync coordination
 */

const DB_NAME = 'syriahub-offline'
const DB_VERSION = 1

interface DraftPost {
    id: string
    title: string
    content: string
    tags: string[]
    createdAt: number
    updatedAt: number
    syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
    retryCount: number
}

interface CachedArticle {
    id: string
    title: string
    content: string
    author: {
        name: string
        avatar_url?: string
    }
    tags: string[]
    created_at: string
    cachedAt: number
}

let db: IDBDatabase | null = null

/**
 * Initialize IndexedDB
 */
export async function initOfflineStorage(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            console.warn('[Offline] IndexedDB not supported')
            resolve(false)
            return
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => {
            console.error('[Offline] Failed to open database:', request.error)
            reject(request.error)
        }

        request.onsuccess = () => {
            db = request.result
            console.log('[Offline] Database initialized')
            resolve(true)
        }

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result

            // Drafts store
            if (!database.objectStoreNames.contains('drafts')) {
                const draftsStore = database.createObjectStore('drafts', { keyPath: 'id' })
                draftsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
                draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
            }

            // Articles cache store
            if (!database.objectStoreNames.contains('articles')) {
                const articlesStore = database.createObjectStore('articles', { keyPath: 'id' })
                articlesStore.createIndex('cachedAt', 'cachedAt', { unique: false })
            }

            // Pending actions store (for future use)
            if (!database.objectStoreNames.contains('pending_actions')) {
                database.createObjectStore('pending_actions', { keyPath: 'id', autoIncrement: true })
            }
        }
    })
}

/**
 * Get database instance
 */
function getDB(): IDBDatabase {
    if (!db) {
        throw new Error('Database not initialized. Call initOfflineStorage() first.')
    }
    return db
}

// ==================== DRAFT MANAGEMENT ====================

/**
 * Save or update a draft
 */
export async function saveDraft(draft: Omit<DraftPost, 'syncStatus' | 'retryCount'>): Promise<string> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['drafts'], 'readwrite')
        const store = transaction.objectStore('drafts')

        const draftData: DraftPost = {
            ...draft,
            updatedAt: Date.now(),
            syncStatus: 'pending',
            retryCount: 0,
        }

        const request = store.put(draftData)

        request.onsuccess = () => {
            console.log('[Offline] Draft saved:', draft.id)
            resolve(draft.id)

            // Trigger background sync if available
            if ('serviceWorker' in navigator && 'sync' in (window as any).registration) {
                ; (navigator.serviceWorker.ready as Promise<ServiceWorkerRegistration>)
                    .then((reg) => (reg as any).sync.register('sync-drafts'))
                    .catch(console.error)
            }
        }

        request.onerror = () => {
            console.error('[Offline] Failed to save draft:', request.error)
            reject(request.error)
        }
    })
}

/**
 * Get a draft by ID
 */
export async function getDraft(id: string): Promise<DraftPost | null> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['drafts'], 'readonly')
        const store = transaction.objectStore('drafts')
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
}

/**
 * Get all drafts, optionally filtered by sync status
 */
export async function getAllDrafts(status?: DraftPost['syncStatus']): Promise<DraftPost[]> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['drafts'], 'readonly')
        const store = transaction.objectStore('drafts')

        let request: IDBRequest

        if (status) {
            const index = store.index('syncStatus')
            request = index.getAll(status)
        } else {
            request = store.getAll()
        }

        request.onsuccess = () => {
            const drafts = request.result as DraftPost[]
            // Sort by updated time, newest first
            drafts.sort((a, b) => b.updatedAt - a.updatedAt)
            resolve(drafts)
        }
        request.onerror = () => reject(request.error)
    })
}

/**
 * Delete a draft
 */
export async function deleteDraft(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['drafts'], 'readwrite')
        const store = transaction.objectStore('drafts')
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

/**
 * Update draft sync status
 */
export async function updateDraftStatus(
    id: string,
    status: DraftPost['syncStatus'],
    incrementRetry = false
): Promise<void> {
    const draft = await getDraft(id)
    if (!draft) return

    draft.syncStatus = status
    if (incrementRetry) {
        draft.retryCount += 1
    }

    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['drafts'], 'readwrite')
        const store = transaction.objectStore('drafts')
        const request = store.put(draft)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

// ==================== ARTICLE CACHE ====================

/**
 * Cache an article for offline reading
 */
export async function cacheArticle(article: Omit<CachedArticle, 'cachedAt'>): Promise<void> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['articles'], 'readwrite')
        const store = transaction.objectStore('articles')

        const cachedArticle: CachedArticle = {
            ...article,
            cachedAt: Date.now(),
        }

        const request = store.put(cachedArticle)

        request.onsuccess = () => {
            console.log('[Offline] Article cached:', article.id)
            resolve()
        }
        request.onerror = () => reject(request.error)
    })
}

/**
 * Get a cached article
 */
export async function getCachedArticle(id: string): Promise<CachedArticle | null> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['articles'], 'readonly')
        const store = transaction.objectStore('articles')
        const request = store.get(id)

        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
}

/**
 * Get all cached articles
 */
export async function getAllCachedArticles(): Promise<CachedArticle[]> {
    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['articles'], 'readonly')
        const store = transaction.objectStore('articles')
        const request = store.getAll()

        request.onsuccess = () => {
            const articles = request.result as CachedArticle[]
            // Sort by cached time, newest first
            articles.sort((a, b) => b.cachedAt - a.cachedAt)
            resolve(articles)
        }
        request.onerror = () => reject(request.error)
    })
}

/**
 * Clean up old cached articles (older than 7 days)
 */
export async function cleanupArticleCache(maxAgeDays = 7): Promise<number> {
    const maxAge = maxAgeDays * 24 * 60 * 60 * 1000
    const cutoffTime = Date.now() - maxAge
    let deletedCount = 0

    return new Promise((resolve, reject) => {
        const database = getDB()
        const transaction = database.transaction(['articles'], 'readwrite')
        const store = transaction.objectStore('articles')
        const index = store.index('cachedAt')
        const range = IDBKeyRange.upperBound(cutoffTime)
        const cursorRequest = index.openCursor(range)

        cursorRequest.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result
            if (cursor) {
                cursor.delete()
                deletedCount++
                cursor.continue()
            }
        }

        transaction.oncomplete = () => {
            console.log('[Offline] Cleaned up', deletedCount, 'old articles')
            resolve(deletedCount)
        }
        transaction.onerror = () => reject(transaction.error)
    })
}

// ==================== SYNC MANAGEMENT ====================

/**
 * Get count of pending items
 */
export async function getPendingCount(): Promise<number> {
    const drafts = await getAllDrafts('pending')
    return drafts.length
}

/**
 * Check if we're online
 */
export function isOnline(): boolean {
    return navigator.onLine
}

/**
 * Register online/offline listeners
 */
export function registerConnectivityListeners(
    onOnline?: () => void,
    onOffline?: () => void
): () => void {
    const handleOnline = () => {
        console.log('[Offline] Connection restored')
        onOnline?.()
    }

    const handleOffline = () => {
        console.log('[Offline] Connection lost')
        onOffline?.()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Return cleanup function
    return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
    }
}

/**
 * Sync pending drafts when online
 */
export async function syncPendingDrafts(
    submitFn: (draft: DraftPost) => Promise<boolean>
): Promise<{ synced: number; failed: number }> {
    const pendingDrafts = await getAllDrafts('pending')
    let synced = 0
    let failed = 0

    for (const draft of pendingDrafts) {
        if (draft.retryCount >= 3) {
            await updateDraftStatus(draft.id, 'failed')
            failed++
            continue
        }

        await updateDraftStatus(draft.id, 'syncing')

        try {
            const success = await submitFn(draft)
            if (success) {
                await deleteDraft(draft.id)
                synced++
            } else {
                await updateDraftStatus(draft.id, 'pending', true)
                failed++
            }
        } catch (error) {
            console.error('[Offline] Sync failed for draft:', draft.id, error)
            await updateDraftStatus(draft.id, 'pending', true)
            failed++
        }
    }

    return { synced, failed }
}
