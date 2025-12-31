// Force re-render
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Outfit, Cairo } from 'next/font/google'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationsProvider } from '@/components/NotificationsProvider'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { SkipNavLink, SkipNavContent } from '@/components/accessibility'
import { InstallPWA } from '@/components/InstallPWA'
import { OfflineIndicator } from '@/components/OfflineIndicator'
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
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
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

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var prefs=JSON.parse(localStorage.getItem('user_preferences'));var theme=prefs?prefs.theme:'system';var isDark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})()`
          }}
        />
        {/* iOS Splash Screen Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/icons/icon-512x512.png" />
      </head>
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
                <InstallPWA />
                <OfflineIndicator />
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

