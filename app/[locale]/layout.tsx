// Force re-render
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Inter, Outfit, Cairo } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationsProvider } from '@/components/NotificationsProvider'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { SkipNavLink, SkipNavContent } from '@/components/accessibility'
import { InstallPWA } from '@/components/InstallPWA'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { Analytics } from '@vercel/analytics/react'
import { createClient } from '@/lib/supabase/server'
import '../globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-arabic' })

export const metadata = {
  title: 'SyriaHub',
  description: 'A minimalist research platform for collaborative knowledge sharing',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SyriaHub',
  },
  icons: {
    icon: [
      { url: '/icons/pluragate-logo.ico', sizes: '256x256', type: 'image/x-icon' },
      { url: '/icons/icon-192x192_Dark.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512_Dark.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152_Dark.png', sizes: '152x152', type: 'image/png' },
    ],
    shortcut: ['/icons/pluragate-logo.ico'],
  },
}

export const viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
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

  // Read CSP nonce from middleware for script tags
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || undefined;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* iOS Splash Screen Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512_Dark.png" />
        {/* Theme initialization - runs before React hydration to prevent flash */}
        {/* Using native script with suppressHydrationWarning to avoid nonce hydration mismatch */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('user_preferences'));var t=p?p.theme:'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${cairo.variable} ${locale === 'ar' ? 'font-arabic' : 'font-sans'} bg-background text-text`} suppressHydrationWarning>
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
                {/* Global FAB - Only for logged in users */}
                {user && <FloatingActionButton />}
                <InstallPWA />
                <OfflineIndicator />
                <Analytics />
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

