'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'

export function CookieConsent() {
  const t = useTranslations('CookieConsent')
  const locale = useLocale()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let consent: string | null = null
    try {
      consent = localStorage.getItem('syriahub-cookie-consent')
    } catch { /* ignore localStorage errors */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!consent)
  }, [])

  const handleConsent = (type: 'all' | 'essential') => {
    try {
      localStorage.setItem('syriahub-cookie-consent', type)
    } catch { /* ignore localStorage errors */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg"
    >
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">{t('title')}</p>
          <p>
            {t('description')}{' '}
            <Link
              href={`/${locale}/about/privacy`}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {t('learnMore')}
            </Link>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleConsent('essential')}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {t('essentialOnly')}
          </button>
          <button
            onClick={() => handleConsent('all')}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('acceptAll')}
          </button>
        </div>
      </div>
    </div>
  )
}
