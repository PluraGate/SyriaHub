'use client'

import { Link } from '@/navigation'
import { Github, Twitter, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Footer() {
  const t = useTranslations('Footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="container-custom">
        {/* Main Footer Content - 3 columns max */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand Section */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rtl:gap-reverse group focus-ring rounded-lg p-1 -ms-1"
              aria-label="SyriaHub Home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">S</span>
              </div>
              <span className="font-display font-bold text-xl text-primary dark:text-dark-text">
                SyriaHub
              </span>
            </Link>
            {/* Epistemic purpose signal */}
            <p className="mt-4 text-text-light dark:text-dark-text-muted max-w-sm leading-relaxed text-sm">
              {t('description')}
            </p>

            {/* Spatial Engine teaser - future-proof */}
            <p className="mt-4 text-text-muted dark:text-dark-text-muted/60 text-xs italic">
              {t('spatialTeaser')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-primary dark:text-dark-text mb-4">
              {t('quickLinks')}
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
                        className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                      >
                        {t('github')}
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
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href="https://github.com/lAvArt/SyriaHub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 text-text-muted/50 dark:text-dark-text-muted/40 hover:text-[#333] dark:hover:text-white transition-colors focus-ring rounded-lg"
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
            <a
              href="https://twitter.com/syrealize"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-text-muted/50 dark:text-dark-text-muted/40 hover:text-[#1DA1F2] transition-colors focus-ring rounded-lg"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@syriahub.org"
              className="p-2.5 text-text-muted/50 dark:text-dark-text-muted/40 hover:text-primary transition-colors focus-ring rounded-lg"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom Bar - Research Commons Statement & Legal */}
        <div className="py-4 border-t border-gray-200 dark:border-dark-border space-y-2">
          <p className="text-text-muted/70 dark:text-dark-text-muted/50 text-[11px] text-center italic">
            {t('researchCommonsStatement')}
          </p>
          <p className="text-text-muted dark:text-dark-text-muted/60 text-xs text-center">
            © {currentYear} SyriaHub · {t('licensingNote')}
          </p>
        </div>
      </div>
    </footer>
  )
}
