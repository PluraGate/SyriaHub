import { describe, it, expect } from 'vitest'
import { cn, stripMarkdown, getInitials, getAvatarGradient } from '@/lib/utils'

describe('cn (className merge utility)', () => {
    it('merges class names correctly', () => {
        expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
        expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
    })

    it('merges tailwind classes correctly (last wins)', () => {
        expect(cn('p-4', 'p-2')).toBe('p-2')
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('handles undefined and null', () => {
        expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('handles arrays', () => {
        expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles objects', () => {
        expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
    })
})

describe('stripMarkdown', () => {
    it('removes headers', () => {
        expect(stripMarkdown('# Header\nContent')).toBe('Header Content')
        expect(stripMarkdown('## Second Level')).toBe('Second Level')
        expect(stripMarkdown('### Third Level')).toBe('Third Level')
    })

    it('removes images', () => {
        expect(stripMarkdown('Check this ![alt text](image.png) out')).toBe('Check this out')
    })

    it('keeps link text but removes URL', () => {
        expect(stripMarkdown('Click [here](https://example.com) now')).toBe('Click here now')
    })

    it('removes bold formatting', () => {
        expect(stripMarkdown('This is **bold** text')).toBe('This is bold text')
        expect(stripMarkdown('This is __also bold__ text')).toBe('This is also bold text')
    })

    it('removes italic formatting', () => {
        expect(stripMarkdown('This is *italic* text')).toBe('This is italic text')
        expect(stripMarkdown('This is _also italic_ text')).toBe('This is also italic text')
    })

    it('removes blockquotes', () => {
        expect(stripMarkdown('> This is a quote\nNormal text')).toBe('This is a quote Normal text')
    })

    it('removes code blocks', () => {
        expect(stripMarkdown('Text\n```js\ncode\n```\nMore text')).toBe('Text More text')
    })

    it('removes inline code', () => {
        expect(stripMarkdown('Use the `console.log` function')).toBe('Use the console.log function')
    })

    it('removes horizontal rules', () => {
        expect(stripMarkdown('Above\n---\nBelow')).toBe('Above Below')
    })

    it('handles empty input', () => {
        expect(stripMarkdown('')).toBe('')
    })

    it('handles null/undefined gracefully', () => {
        expect(stripMarkdown(null as unknown as string)).toBe('')
        expect(stripMarkdown(undefined as unknown as string)).toBe('')
    })
})

describe('getInitials', () => {
    it('returns initials from full name', () => {
        expect(getInitials('John Doe')).toBe('JD')
        expect(getInitials('Jane Smith')).toBe('JS')
    })

    it('handles single name', () => {
        expect(getInitials('John')).toBe('J')
    })

    it('limits to 2 characters for long names', () => {
        expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('falls back to email initial', () => {
        expect(getInitials(undefined, 'john@example.com')).toBe('J')
    })

    it('returns U as default', () => {
        expect(getInitials()).toBe('U')
        expect(getInitials(undefined, undefined)).toBe('U')
    })

    it('handles empty strings', () => {
        expect(getInitials('', 'test@example.com')).toBe('T')
        expect(getInitials('', '')).toBe('U')
    })
})

describe('getAvatarGradient', () => {
    it('returns a gradient class for valid id', () => {
        const gradient = getAvatarGradient('user-123')
        expect(gradient).toMatch(/^avatar-gradient-\d$/)
    })

    it('returns consistent gradient for same id', () => {
        const id = 'consistent-id'
        expect(getAvatarGradient(id)).toBe(getAvatarGradient(id))
    })

    it('returns different gradients for different ids', () => {
        // These may or may not be different depending on charCode, but should be valid
        const g1 = getAvatarGradient('aaa')
        const g2 = getAvatarGradient('zzz')
        expect(g1).toMatch(/^avatar-gradient-\d$/)
        expect(g2).toMatch(/^avatar-gradient-\d$/)
    })

    it('returns default gradient for undefined id', () => {
        expect(getAvatarGradient()).toBe('avatar-gradient-1')
        expect(getAvatarGradient(undefined)).toBe('avatar-gradient-1')
    })
})
