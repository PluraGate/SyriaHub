import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Outfit, Cairo } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationsProvider } from '@/components/NotificationsProvider'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { SkipNavLink, SkipNavContent } from '@/components/accessibility'
import { createClient } from '@/lib/supabase/server'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-arabic' })

export const metadata = {
  title: 'Syrealize',
  description: 'A minimalist research platform for collaborative knowledge sharing',
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure that the incoming `locale` is valid
  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }

  // Get user for preferences
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${cairo.variable} ${locale === 'ar' ? 'font-arabic' : 'font-sans'} bg-background text-text overflow-x-hidden`} suppressHydrationWarning>
        <SkipNavLink />
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <PreferencesProvider userId={user?.id}>
              <NotificationsProvider>
                <AppErrorBoundary>
                  <SkipNavContent>
                    {children}
                  </SkipNavContent>
                </AppErrorBoundary>
              </NotificationsProvider>
            </PreferencesProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}

