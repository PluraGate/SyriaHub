import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Outfit } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationsProvider } from '@/components/NotificationsProvider'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

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

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-text`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <NotificationsProvider>
              <AppErrorBoundary>
                {children}
              </AppErrorBoundary>
            </NotificationsProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
