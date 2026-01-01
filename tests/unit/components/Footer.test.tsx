import { describe, it, expect } from 'vitest'
import { render, screen } from '../../utils/test-utils'
import { Footer } from '@/components/Footer'

describe('Footer', () => {
    it('renders the brand name correctly', () => {
        render(<Footer />)
        expect(screen.getByText('SyriaHub')).toBeInTheDocument()
    })

    it('renders the navigation links', () => {
        render(<Footer />)
        expect(screen.getByRole('link', { name: /SyriaHub Home/i })).toBeInTheDocument()
    })
})
