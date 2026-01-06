'use client'
// Force rebuild for translation keys update

import { Link, usePathname, useRouter } from '@/navigation'
import Image from 'next/image'
import { Github, Mail, Linkedin, Youtube, Rss } from 'lucide-react'
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
    <footer className="bg-background-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto" suppressHydrationWarning>
      <div className="container-custom" suppressHydrationWarning>
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
                src="/icons/Pluragate-logo.ico"
                alt="SyriaHub Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg shadow-sm object-cover mb-1"
              />
              <span className="font-display font-bold text-xl text-primary dark:text-dark-text leading-none mb-1">
                SyriaHub
              </span>
            </Link>
            {/* Epistemic purpose signal - made smaller/lighter as it's established elsewhere */}
            <p className="mt-4 text-text-muted/80 dark:text-dark-text-muted/70 max-w-sm leading-relaxed text-xs">
              {t('description')}
            </p>

            {/* Spatial Engine teaser - future-proof */}
            <p className="mt-3 text-text-muted/60 dark:text-dark-text-muted/40 text-[11px]">
              {t('spatialTeaser')}
            </p>
          </div>

          {/* Contribute - Primary action section */}
          <div>
            <h3 className="font-display font-semibold text-primary dark:text-dark-text mb-4">
              {t('contribute')}
            </h3>
            <ul className="space-y-3">
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
                  href="/insights"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('browseInsights')}
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

          {/* Resources - Including How It Works (conceptually adjacent to About) */}
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
                  href="/how-it-works"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('howItWorks')}
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
                        href="https://github.com/PluraGate"
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

        {/* Social Icons - De-emphasized with "Updates" label to clarify broadcast-only intent */}
        <div className="flex flex-col items-center gap-2 pb-4">
          <span className="text-[10px] text-text-muted/50 dark:text-dark-text-muted/40 uppercase tracking-wider">
            {t('updates') || 'Updates'}
          </span>
          <div className="flex items-center gap-1">
            {/* GitHub */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/PluraGate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-text-muted/40 dark:text-dark-text-muted/30 hover:text-[#333] dark:hover:text-white transition-colors focus-ring rounded-lg"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('githubTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Email */}
            <a
              href="mailto:admin@pluragate.org"
              className="p-2 text-text-muted/40 dark:text-dark-text-muted/30 hover:text-primary transition-colors focus-ring rounded-lg"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/syria-hub-pluragate-network-2a31863a2/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-muted/40 dark:text-dark-text-muted/30 hover:text-[#0A66C2] transition-colors focus-ring rounded-lg"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>

            {/* RSS/Atom */}
            <a
              href="https://dashboard.rss.com/podcasts/syriahub-updates/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-muted/40 dark:text-dark-text-muted/30 hover:text-[#FFA500] transition-colors focus-ring rounded-lg"
              aria-label="RSS Insights"
            >
              <Rss className="w-5 h-5" />
            </a>

            {/* Mastodon */}
            <a
              href="https://mastodon.social/@Syriahub"
              target="_blank"
              rel="noopener noreferrer me"
              className="p-2 text-text-muted/40 dark:text-dark-text-muted/30 hover:text-[#6364FF] transition-colors focus-ring rounded-lg"
              aria-label="Mastodon"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.668 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom Bar - Research Commons Statement & Legal */}
        <div className="py-4 border-t border-gray-200 dark:border-dark-border flex flex-col items-center gap-4" suppressHydrationWarning>
          <div className="space-y-2">
            <p className="text-text-muted/60 dark:text-dark-text-muted/40 text-[10px] text-center italic">
              {t('researchCommonsStatement')}
            </p>
            <p className="text-text-muted/80 dark:text-dark-text-muted/50 text-[11px] text-center" suppressHydrationWarning>
              © {currentYear} SyriaHub · {t('licensingNote')}
            </p>
            <p className="text-text-muted/40 dark:text-dark-text-muted/30 text-[10px] text-center">
              {t('platformStage')} · {t('platformVersion')}
            </p>
          </div>

          {/* Language Switcher Buttons - Improved contrast for accessibility */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 p-1 rounded-full border border-gray-200 dark:border-white/15">
            <button
              onClick={() => handleLocaleChange('en')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${locale === 'en'
                ? 'bg-white dark:bg-dark-surface text-primary dark:text-accent-light shadow-sm border border-gray-200 dark:border-white/20'
                : 'text-text dark:text-dark-text-muted hover:text-primary dark:hover:text-dark-text'
                }`}
            >
              English
            </button>
            <button
              onClick={() => handleLocaleChange('ar')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${locale === 'ar'
                ? 'bg-white dark:bg-dark-surface text-primary dark:text-accent-light shadow-sm border border-gray-200 dark:border-white/20'
                : 'text-text dark:text-dark-text-muted hover:text-primary dark:hover:text-dark-text'
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
