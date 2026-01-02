import { describe, it, expect } from 'vitest'
import { formatLocalizedDate, type CalendarSystem } from '@/lib/formatDate'

describe('formatLocalizedDate', () => {
    const testDate = new Date('2025-12-22T12:00:00Z')

    describe('format types', () => {
        it('formats date in short format (en)', () => {
            const result = formatLocalizedDate(testDate, 'en', 'short', 'gregorian')
            expect(result).toContain('Dec')
            expect(result).toContain('22')
        })

        it('formats date in medium format (en)', () => {
            const result = formatLocalizedDate(testDate, 'en', 'medium', 'gregorian')
            expect(result).toContain('Dec')
            expect(result).toContain('22')
            expect(result).toContain('2025')
        })

        it('formats date in long format (en)', () => {
            const result = formatLocalizedDate(testDate, 'en', 'long', 'gregorian')
            expect(result).toContain('December')
            expect(result).toContain('22')
            expect(result).toContain('2025')
        })

        it('formats relative date', () => {
            const recentDate = new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
            const result = formatLocalizedDate(recentDate, 'en', 'relative', 'gregorian')
            expect(result).toContain('minute')
        })

        it('formats distance date', () => {
            const oldDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) // ~30 days ago
            const result = formatLocalizedDate(oldDate, 'en', 'distance', 'gregorian')
            expect(result.toLowerCase()).toMatch(/month|day|ago/)
        })
    })

    describe('calendar systems', () => {
        it('uses Gregorian calendar when specified', () => {
            const result = formatLocalizedDate(testDate, 'en', 'medium', 'gregorian')
            expect(result).toContain('2025')
        })

        it('uses Hijri calendar when specified', () => {
            const result = formatLocalizedDate(testDate, 'ar', 'medium', 'hijri')
            // Hijri year should be different from Gregorian
            expect(result).not.toContain('2025')
        })
    })

    describe('locale handling', () => {
        it('formats in English locale', () => {
            const result = formatLocalizedDate(testDate, 'en', 'medium', 'gregorian')
            expect(result).toMatch(/Dec|December/)
        })

        it('formats in Arabic locale', () => {
            const result = formatLocalizedDate(testDate, 'ar', 'medium', 'gregorian')
            // Should contain Arabic numerals or month names
            expect(result).toBeTruthy()
            expect(result.length).toBeGreaterThan(0)
        })
    })

    describe('input types', () => {
        it('handles Date object', () => {
            const result = formatLocalizedDate(testDate, 'en', 'short', 'gregorian')
            expect(result).toBeTruthy()
        })

        it('handles ISO string', () => {
            const result = formatLocalizedDate('2025-12-22T12:00:00Z', 'en', 'short', 'gregorian')
            expect(result).toContain('Dec')
        })

        it('handles timestamp number', () => {
            const result = formatLocalizedDate(testDate.getTime(), 'en', 'short', 'gregorian')
            expect(result).toContain('Dec')
        })

        it('returns empty string for invalid date', () => {
            const result = formatLocalizedDate('invalid-date', 'en', 'short', 'gregorian')
            expect(result).toBe('')
        })
    })

    describe('default parameters', () => {
        it('uses default locale (en) if not specified', () => {
            const result = formatLocalizedDate(testDate)
            expect(result).toBeTruthy()
        })
    })
})
