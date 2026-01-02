import { describe, it, expect } from 'vitest'
import { getTierFromLevel, tierConfig } from '@/lib/gamification'

describe('getTierFromLevel', () => {
    describe('bronze tier (levels 1-10)', () => {
        it('returns bronze for level 1', () => {
            expect(getTierFromLevel(1)).toBe('bronze')
        })

        it('returns bronze for level 5', () => {
            expect(getTierFromLevel(5)).toBe('bronze')
        })

        it('returns bronze for level 10', () => {
            expect(getTierFromLevel(10)).toBe('bronze')
        })
    })

    describe('silver tier (levels 11-25)', () => {
        it('returns silver for level 11', () => {
            expect(getTierFromLevel(11)).toBe('silver')
        })

        it('returns silver for level 18', () => {
            expect(getTierFromLevel(18)).toBe('silver')
        })

        it('returns silver for level 25', () => {
            expect(getTierFromLevel(25)).toBe('silver')
        })
    })

    describe('gold tier (levels 26-40)', () => {
        it('returns gold for level 26', () => {
            expect(getTierFromLevel(26)).toBe('gold')
        })

        it('returns gold for level 33', () => {
            expect(getTierFromLevel(33)).toBe('gold')
        })

        it('returns gold for level 40', () => {
            expect(getTierFromLevel(40)).toBe('gold')
        })
    })

    describe('platinum tier (levels 41+)', () => {
        it('returns platinum for level 41', () => {
            expect(getTierFromLevel(41)).toBe('platinum')
        })

        it('returns platinum for level 50', () => {
            expect(getTierFromLevel(50)).toBe('platinum')
        })

        it('returns platinum for level 100', () => {
            expect(getTierFromLevel(100)).toBe('platinum')
        })
    })

    describe('edge cases', () => {
        it('returns bronze for level 0', () => {
            expect(getTierFromLevel(0)).toBe('bronze')
        })

        it('returns bronze for negative levels', () => {
            expect(getTierFromLevel(-1)).toBe('bronze')
        })
    })
})

describe('tierConfig', () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum'] as const

    tiers.forEach(tier => {
        describe(`${tier} tier`, () => {
            it('has bgColor property', () => {
                expect(tierConfig[tier].bgColor).toBeTruthy()
                expect(tierConfig[tier].bgColor).toContain('bg-')
            })

            it('has textColor property', () => {
                expect(tierConfig[tier].textColor).toBeTruthy()
                expect(tierConfig[tier].textColor).toContain('text-')
            })

            it('has borderColor property', () => {
                expect(tierConfig[tier].borderColor).toBeTruthy()
                expect(tierConfig[tier].borderColor).toContain('border-')
            })

            it('has gradient property', () => {
                expect(tierConfig[tier].gradient).toBeTruthy()
                expect(tierConfig[tier].gradient).toContain('from-')
            })

            it('includes dark mode variants', () => {
                expect(tierConfig[tier].bgColor).toContain('dark:')
                expect(tierConfig[tier].textColor).toContain('dark:')
                expect(tierConfig[tier].borderColor).toContain('dark:')
            })
        })
    })
})
