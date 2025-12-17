'use client'

import { Link } from '@/navigation'
import { Github, Twitter, Mail } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rtl:gap-reverse group focus-ring rounded-lg p-1 -ms-1"
              aria-label="Syrealize Home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">S</span>
              </div>
              <span className="font-display font-bold text-xl text-primary dark:text-dark-text">
                Syrealize
              </span>
            </Link>
            <p className="mt-4 text-text-light dark:text-dark-text-muted max-w-md leading-relaxed">
              {t('description')}
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
                  href="/auth/signup"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('getStarted')}
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
                <a
                  href="https://github.com/lAvArt/SyriaHub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('github')}
                </a>
              </li>
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
                  href="/about/privacy"
                  className="text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded px-1 -ms-1"
                >
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-dark-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-light dark:text-dark-text-muted text-sm">
            {t('copyright', { year: currentYear })}
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/lAvArt/SyriaHub"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded-lg"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/syrealize"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded-lg"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:contact@syrealize.com"
              className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors focus-ring rounded-lg"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
