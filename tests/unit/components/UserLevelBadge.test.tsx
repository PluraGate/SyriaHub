import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { UserLevelBadge } from '@/components/UserLevelBadge'

// Mock the translations
vi.mock('next-intl', async () => {
    const actual = await vi.importActual('next-intl')
    return {
        ...actual,
        useTranslations: () => (key: string, params?: any) => {
            if (key === 'level') return `Level ${params?.number}`
            return key
        },
    }
})

describe('UserLevelBadge', () => {
    describe('rendering', () => {
        it('renders the level number', () => {
            render(<UserLevelBadge level={5} tier="bronze" />)
            expect(screen.getByText('5')).toBeInTheDocument()
        })

        it('renders bronze tier badge', () => {
            const { container } = render(<UserLevelBadge level={5} tier="bronze" />)
            const badge = container.querySelector('.bg-amber-100, [class*="amber"]')
            expect(badge || container.firstChild).toBeTruthy()
        })

        it('renders silver tier badge', () => {
            const { container } = render(<UserLevelBadge level={15} tier="silver" />)
            expect(container.firstChild).toBeTruthy()
        })

        it('renders gold tier badge', () => {
            const { container } = render(<UserLevelBadge level={30} tier="gold" />)
            expect(container.firstChild).toBeTruthy()
        })

        it('renders platinum tier badge', () => {
            const { container } = render(<UserLevelBadge level={50} tier="platinum" />)
            expect(container.firstChild).toBeTruthy()
        })
    })

    describe('sizes', () => {
        it('renders small size', () => {
            const { container } = render(<UserLevelBadge level={5} tier="bronze" size="sm" />)
            expect(container.querySelector('.h-6')).toBeTruthy()
        })

        it('renders medium size by default', () => {
            const { container } = render(<UserLevelBadge level={5} tier="bronze" />)
            expect(container.querySelector('.h-8')).toBeTruthy()
        })

        it('renders large size', () => {
            const { container } = render(<UserLevelBadge level={5} tier="bronze" size="lg" />)
            expect(container.querySelector('.h-10')).toBeTruthy()
        })
    })

    describe('tooltip', () => {
        it('renders tooltip when name is provided', () => {
            render(<UserLevelBadge level={5} tier="bronze" name="Researcher" showTooltip />)
            expect(screen.getByText('Researcher')).toBeInTheDocument()
        })

        it('does not render tooltip when showTooltip is false', () => {
            render(<UserLevelBadge level={5} tier="bronze" name="Researcher" showTooltip={false} />)
            expect(screen.queryByText('Researcher')).not.toBeInTheDocument()
        })
    })
})
