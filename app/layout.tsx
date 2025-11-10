import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/react'
import { ToastProvider } from '@/components/ui/toast'
import { DEFAULT_LOCALE, getAllDictionaries, isRtlLocale, I18nProvider } from '@/lib/i18n'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Syrealize - Research Platform',
  description: 'A minimalist, mobile-first research platform for collaborative knowledge sharing',
  keywords: ['research', 'collaboration', 'knowledge sharing', 'academic', 'writing'],
  authors: [{ name: 'Syrealize Team' }],
  openGraph: {
    title: 'Syrealize - Research Platform',
    description: 'A minimalist research platform for collaborative knowledge sharing',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = DEFAULT_LOCALE
  const dictionaries = getAllDictionaries(locale)
  const direction = isRtlLocale(locale) ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={direction} className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} antialiased min-h-screen flex flex-col`}>
        <I18nProvider locale={locale} dictionaries={dictionaries}>
          <ToastProvider>
            {children}
          </ToastProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
