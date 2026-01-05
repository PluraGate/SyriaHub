import { describe, it, expect } from 'vitest'
import {
    sanitizeForSlug,
    generateShortTitle,
    extractHashFromUUID,
    formatDateForSlug,
    sanitizeDiscipline,
    generateResourceSlug,
    isValidSlug,
    parseSlug,
    isValidResourceType
} from './slug-generator'

describe('slug-generator', () => {
    describe('sanitizeForSlug', () => {
        it('converts to lowercase', () => {
            expect(sanitizeForSlug('HELLO WORLD')).toBe('hello-world')
        })

        it('removes special characters', () => {
            expect(sanitizeForSlug('Hello! World? @2024')).toBe('hello-world-2024')
        })

        it('replaces spaces with dashes', () => {
            expect(sanitizeForSlug('hello world test')).toBe('hello-world-test')
        })

        it('collapses multiple dashes', () => {
            expect(sanitizeForSlug('hello---world')).toBe('hello-world')
        })

        it('trims leading and trailing dashes', () => {
            expect(sanitizeForSlug('---hello---')).toBe('hello')
        })

        it('respects max length', () => {
            const result = sanitizeForSlug('this is a very long title that should be truncated', 20)
            expect(result.length).toBeLessThanOrEqual(20)
        })

        it('handles Arabic text', () => {
            expect(sanitizeForSlug('مرحبا بالعالم')).toBe('مرحبا-بالعالم')
        })

        it('handles empty input', () => {
            expect(sanitizeForSlug('')).toBe('')
            expect(sanitizeForSlug(null as any)).toBe('')
        })

        it('removes diacritics', () => {
            expect(sanitizeForSlug('café résumé')).toBe('cafe-resume')
        })
    })

    describe('generateShortTitle', () => {
        it('removes common stop words', () => {
            const result = generateShortTitle('The Analysis of the Syrian Population')
            expect(result).not.toContain('the')
            expect(result).not.toContain('of')
        })

        it('removes version indicators', () => {
            const result = generateShortTitle('Report Draft v2 Final Copy')
            expect(result).not.toContain('draft')
            expect(result).not.toContain('v2')
            expect(result).not.toContain('final')
            expect(result).not.toContain('copy')
        })

        it('limits to 6 meaningful words', () => {
            const result = generateShortTitle('one two three four five six seven eight nine ten')
            const wordCount = result.split('-').length
            expect(wordCount).toBeLessThanOrEqual(6)
        })

        it('handles empty input', () => {
            expect(generateShortTitle('')).toBe('')
        })
    })

    describe('extractHashFromUUID', () => {
        it('extracts last 6 characters', () => {
            const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
            expect(extractHashFromUUID(uuid)).toBe('567890')
        })

        it('removes dashes before extracting', () => {
            const uuid = '12345678-1234-1234-1234-123456789abc'
            expect(extractHashFromUUID(uuid)).toBe('789abc')
        })

        it('returns lowercase', () => {
            const uuid = '12345678-1234-1234-1234-123456789ABC'
            expect(extractHashFromUUID(uuid)).toBe('789abc')
        })

        it('throws on invalid UUID', () => {
            expect(() => extractHashFromUUID('')).toThrow()
            expect(() => extractHashFromUUID('short')).toThrow()
        })
    })

    describe('formatDateForSlug', () => {
        it('formats date as YYYYMMDD', () => {
            const date = new Date('2026-01-05')
            expect(formatDateForSlug(date)).toBe('20260105')
        })

        it('pads single digit months and days', () => {
            const date = new Date('2026-03-09')
            expect(formatDateForSlug(date)).toBe('20260309')
        })

        it('uses current date by default', () => {
            const result = formatDateForSlug()
            expect(result).toMatch(/^\d{8}$/)
        })
    })

    describe('sanitizeDiscipline', () => {
        it('maps common variations to canonical forms', () => {
            expect(sanitizeDiscipline('Cultural Heritage')).toBe('heritage')
            expect(sanitizeDiscipline('human rights')).toBe('rights')
            expect(sanitizeDiscipline('Legal Studies')).toBe('law')
        })

        it('passes through unknown disciplines', () => {
            expect(sanitizeDiscipline('Archaeology')).toBe('archaeology')
        })

        it('returns "general" for empty input', () => {
            expect(sanitizeDiscipline('')).toBe('general')
        })
    })

    describe('isValidResourceType', () => {
        it('validates known types', () => {
            expect(isValidResourceType('dataset')).toBe(true)
            expect(isValidResourceType('paper')).toBe(true)
            expect(isValidResourceType('tool')).toBe(true)
            expect(isValidResourceType('media')).toBe(true)
            expect(isValidResourceType('template')).toBe(true)
        })

        it('rejects unknown types', () => {
            expect(isValidResourceType('unknown')).toBe(false)
            expect(isValidResourceType('')).toBe(false)
        })
    })

    describe('generateResourceSlug', () => {
        const baseInput = {
            resourceType: 'dataset',
            discipline: 'Heritage',
            shortTitle: 'Damascus Population Survey',
            date: new Date('2026-01-05'),
            uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
        }

        it('generates correct slug format', () => {
            const result = generateResourceSlug(baseInput)
            expect(result.slug).toBe('dataset-heritage-damascus-population-survey-20260105-567890')
        })

        it('returns sanitized short title', () => {
            const result = generateResourceSlug(baseInput)
            expect(result.shortTitle).toBe('damascus-population-survey')
        })

        it('returns correct hash', () => {
            const result = generateResourceSlug(baseInput)
            expect(result.hash).toBe('567890')
        })

        it('returns correct date string', () => {
            const result = generateResourceSlug(baseInput)
            expect(result.dateString).toBe('20260105')
        })

        it('handles invalid resource type', () => {
            const result = generateResourceSlug({ ...baseInput, resourceType: 'invalid' })
            expect(result.slug).toContain('resource-')
        })

        it('maps discipline variations', () => {
            const result = generateResourceSlug({ ...baseInput, discipline: 'Cultural Heritage' })
            expect(result.slug).toContain('-heritage-')
        })
    })

    describe('isValidSlug', () => {
        it('validates correct slugs', () => {
            expect(isValidSlug('dataset-heritage-population-survey-20260105-567890')).toBe(true)
            expect(isValidSlug('paper-law-constitutional-analysis-20260101-abc123')).toBe(true)
        })

        it('rejects invalid slugs', () => {
            expect(isValidSlug('')).toBe(false)
            expect(isValidSlug('invalid')).toBe(false)
            expect(isValidSlug('missing-parts')).toBe(false)
            expect(isValidSlug('dataset-heritage-title-2026010-567890')).toBe(false) // Wrong date format
        })
    })

    describe('parseSlug', () => {
        it('parses valid slugs', () => {
            const result = parseSlug('dataset-heritage-population-survey-20260105-567890')
            expect(result).toEqual({
                type: 'dataset',
                discipline: 'heritage',
                shortTitle: 'population-survey',
                date: '20260105',
                hash: '567890'
            })
        })

        it('returns null for invalid slugs', () => {
            expect(parseSlug('invalid')).toBeNull()
        })
    })
})
