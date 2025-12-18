import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn(),
    permanentRedirect: vi.fn(),
    notFound: vi.fn(),
}))

import React from 'react'

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => key,
    useLocale: () => 'en',
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock @/navigation
vi.mock('@/navigation', () => ({
    Link: ({ children, href, ...props }: any) => React.createElement('a', { href, ...props }, children),
    redirect: vi.fn(),
    usePathname: () => '',
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        prefetch: vi.fn(),
        back: vi.fn(),
    }),
}))

// Mock next-themes
vi.mock('next-themes', () => ({
    useTheme: () => ({
        theme: 'light',
        setTheme: vi.fn(),
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))
