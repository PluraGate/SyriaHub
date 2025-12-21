'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface DraftData {
    title: string
    content: string
    tags: string
    contentType: 'article' | 'question' | 'trace'
    coverImage: string | null
    license: string
    lastSaved: number
}

interface UseAutosaveOptions {
    key: string
    debounceMs?: number
    enabled?: boolean
}

interface UseAutosaveResult {
    hasDraft: boolean
    draftData: DraftData | null
    lastSaved: Date | null
    restoreDraft: () => DraftData | null
    clearDraft: () => void
    saveDraft: (data: Omit<DraftData, 'lastSaved'>) => void
}

const AUTOSAVE_INTERVAL = 30000 // 30 seconds
const DRAFT_EXPIRY_HOURS = 72 // Keep drafts for 72 hours

export function useAutosave({
    key,
    debounceMs = 2000,
    enabled = true,
}: UseAutosaveOptions): UseAutosaveResult {
    const [hasDraft, setHasDraft] = useState(false)
    const [draftData, setDraftData] = useState<DraftData | null>(null)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const storageKey = `syrealize_draft_${key}`

    // Check for existing draft on mount
    useEffect(() => {
        if (!enabled) return

        try {
            const stored = localStorage.getItem(storageKey)
            if (stored) {
                const parsed: DraftData = JSON.parse(stored)
                const expiryTime = parsed.lastSaved + DRAFT_EXPIRY_HOURS * 60 * 60 * 1000

                if (Date.now() > expiryTime) {
                    // Draft expired, clean up
                    localStorage.removeItem(storageKey)
                    setHasDraft(false)
                    setDraftData(null)
                } else if (parsed.title || parsed.content) {
                    // Valid draft exists
                    setHasDraft(true)
                    setDraftData(parsed)
                    setLastSaved(new Date(parsed.lastSaved))
                }
            }
        } catch (error) {
            console.error('Error loading draft:', error)
            localStorage.removeItem(storageKey)
        }
    }, [storageKey, enabled])

    // Save draft function
    const saveDraft = useCallback(
        (data: Omit<DraftData, 'lastSaved'>) => {
            if (!enabled) return

            // Clear any pending saves
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }

            // Debounce the save
            saveTimeoutRef.current = setTimeout(() => {
                try {
                    // Don't save empty drafts
                    if (!data.title.trim() && !data.content.trim()) {
                        return
                    }

                    const draftWithTimestamp: DraftData = {
                        ...data,
                        lastSaved: Date.now(),
                    }

                    localStorage.setItem(storageKey, JSON.stringify(draftWithTimestamp))
                    setLastSaved(new Date(draftWithTimestamp.lastSaved))
                    setHasDraft(true)
                    setDraftData(draftWithTimestamp)
                } catch (error) {
                    console.error('Error saving draft:', error)
                }
            }, debounceMs)
        },
        [storageKey, debounceMs, enabled]
    )

    // Restore draft function
    const restoreDraft = useCallback((): DraftData | null => {
        if (!draftData) return null
        return draftData
    }, [draftData])

    // Clear draft function
    const clearDraft = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        localStorage.removeItem(storageKey)
        setHasDraft(false)
        setDraftData(null)
        setLastSaved(null)
    }, [storageKey])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    return {
        hasDraft,
        draftData,
        lastSaved,
        restoreDraft,
        clearDraft,
        saveDraft,
    }
}

// Utility to format time since last save
export function formatTimeSince(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

    if (seconds < 60) {
        return 'Just now'
    }

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) {
        return `${minutes}m ago`
    }

    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return `${hours}h ago`
    }

    const days = Math.floor(hours / 24)
    return `${days}d ago`
}
