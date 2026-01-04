/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SpatialEditor } from '@/components/spatial/SpatialEditor'

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
}))

// Mock next/dynamic
vi.mock('next/dynamic', () => ({
    default: (fn: any) => {
        // If it's a promise-returning function (like import(...)), we can just return a dummy component
        // But SpatialEditor uses dynamic(() => import(...))
        // We can render a simple placeholder
        const Component = (props: any) => {
            const { children, ...rest } = props
            return <div data-testid="dynamic-component" data-props={JSON.stringify(rest)}>{children}</div>
        }
        return Component
    }
}))

// Mock react-leaflet components via module mock if possible, 
// BUT they are imported dynamically in the component:
// const MapContainer = dynamic(...)
// So our 'next/dynamic' mock handles them!
// They will render as <div data-testid="dynamic-component">...</div>

// Mock fetch for governorates and nominatim
const mockFetch = vi.fn()
global.fetch = mockFetch

// Mock Leaflet imports inside the component (fixLeafletIcons)
vi.mock('leaflet', () => ({
    default: {
        Icon: {
            Default: {
                prototype: {},
                mergeOptions: vi.fn(),
            }
        }
    }
}))

describe('SpatialEditor Component', () => {
    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        mockFetch.mockReset()

        // Mock success response for governorates
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ features: [] })
        })
    })

    it('renders search input and drawing tools', async () => {
        render(<SpatialEditor onChange={mockOnChange} />)

        // It has mounted check, so wait for it
        expect(await screen.findByPlaceholderText('searchPlaceholder')).toBeInTheDocument()

        // Check buttons
        expect(screen.getByText('point')).toBeInTheDocument()
        expect(screen.getByText('radius')).toBeInTheDocument()
        expect(screen.getByText('region')).toBeInTheDocument()
    })

    it('handles search input', async () => {
        const user = userEvent.setup()
        render(<SpatialEditor onChange={mockOnChange} />)

        const input = await screen.findByPlaceholderText('searchPlaceholder')
        await user.type(input, 'Damascus')

        expect(input).toHaveValue('Damascus')

        // Fast-forward timers if using fake timers, or wait
        // The component uses setTimeout 400ms
    })

    it('toggles drawing modes', async () => {
        const user = userEvent.setup()
        render(<SpatialEditor onChange={mockOnChange} />)

        const pointBtn = await screen.findByText('point')

        await user.click(pointBtn)
        // Check if it's active? The button variant changes. 
        // We can check class or aria-pressed if implemented, but variant uses standard Shadcn classes.
        // It should display helper text "clickToPlace"
        expect(screen.getByText('clickToPlace')).toBeInTheDocument()

        await user.click(pointBtn) // Toggle off
        expect(screen.queryByText('clickToPlace')).not.toBeInTheDocument()
    })

    it('displays current geometry info', async () => {
        const geo: any = {
            type: 'Point',
            coordinates: [10, 20]
        }

        render(<SpatialEditor onChange={mockOnChange} geometry={geo} value="My Point" />)

        expect(await screen.findByText('My Point')).toBeInTheDocument()
        expect(screen.getByText('(point)')).toBeInTheDocument()
    })

    it('clears geometry', async () => {
        const user = userEvent.setup()
        const geo: any = {
            type: 'Point',
            coordinates: [10, 20]
        }

        render(<SpatialEditor onChange={mockOnChange} geometry={geo} value="My Point" />)

        const clearBtn = await screen.findByText('clear')
        await user.click(clearBtn)

        expect(mockOnChange).toHaveBeenCalledWith('', undefined)
    })
})
