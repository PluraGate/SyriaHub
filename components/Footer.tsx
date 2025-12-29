'use client'
// Force rebuild for translation keys update

import { Link, usePathname, useRouter } from '@/navigation'
import Image from 'next/image'
import { Github, Twitter, Mail } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  const t = useTranslations('Footer')
  const currentYear = new Date().getFullYear()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <footer className="bg-background-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="container-custom">
        {/* Main Footer Content - 3 columns max */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="md:pl-10 rtl:md:pr-10">
            <Link
              href="/"
              className="inline-flex items-end gap-1 rtl:gap-reverse group focus-ring rounded-lg p-1 -ms-1"
              aria-label="SyriaHub Home"
            >
              <Image
                src="/icons/icon-192x192.png"
                alt="SyriaHub Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg shadow-sm object-cover mb-1"
              />
              <span className="font-display font-bold text-xl text-primary dark:text-dark-text leading-none mb-1">
                SyriaHub
              </span>
            </Link>
            {/* Epistemic purpose signal */}
            <p className="mt-4 text-text-light dark:text-dark-text-muted max-w-sm leading-relaxed text-sm">
              {t('description')}
            </p>

            {/* Spatial Engine teaser - future-proof */}
            <p className="mt-4 text-text-muted dark:text-dark-text-muted/60 text-xs text-opacity-80">
              {t('spatialTeaser')}
            </p>
          </div>

          {/* Contribute (formerly Quick Links) */}
          <div>
            <h3 className="font-display font-semibold text-primary dark:text-dark-text mb-4">
              {t('contribute')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/feed"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('browseFeed')}
                </Link>
              </li>
              <li>
                <Link
                  href="/editor"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('writePost')}
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('howItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-display font-semibold text-primary dark:text-dark-text mb-4">
              {t('resources')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/governance"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('governance')}
                </Link>
              </li>
              <li>
                <Link
                  href="/about/privacy"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href="https://github.com/lAvArt/SyriaHub"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                      >
                        <span>{t('github')}</span>
                        <span className="text-[10px] text-text-muted/70 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">
                          ↗ {t('openSource')}
                        </span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('githubTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Icons - separated from legal line */}
        <div className="flex justify-center pb-4">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/lAvArt/SyriaHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-text-muted dark:text-dark-text-muted hover:text-[#333] dark:hover:text-white transition-colors focus-ring rounded-lg"
                    aria-label="GitHub"
                  >
                    <Github className="w-6 h-6" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('githubTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <a
              href="https://twitter.com/syrealize"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-text-muted dark:text-dark-text-muted hover:text-[#1DA1F2] transition-colors focus-ring rounded-lg"
              aria-label="Twitter"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a
              href="mailto:contact@syriahub.org"
              className="p-2.5 text-text-muted dark:text-dark-text-muted hover:text-primary transition-colors focus-ring rounded-lg"
              aria-label="Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Bottom Bar - Research Commons Statement & Legal */}
        <div className="py-4 border-t border-gray-200 dark:border-dark-border flex flex-col items-center gap-4">
          <div className="space-y-2">
            <p className="text-text-muted/70 dark:text-dark-text-muted/50 text-[11px] text-center italic">
              {t('researchCommonsStatement')}
            </p>
            <p className="text-text-muted dark:text-dark-text-muted/60 text-xs text-center">
              © {currentYear} SyriaHub · {t('licensingNote')}
            </p>
          </div>

          {/* Language Switcher Buttons */}
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-full border border-gray-100 dark:border-white/10">
            <button
              onClick={() => handleLocaleChange('en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${locale === 'en'
                  ? 'bg-white dark:bg-dark-surface text-primary dark:text-accent-light shadow-sm'
                  : 'text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                }`}
            >
              English
            </button>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${locale === 'ar'
                  ? 'bg-white dark:bg-dark-surface text-primary dark:text-accent-light shadow-sm'
                  : 'text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                }`}
            >
              العربية
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
