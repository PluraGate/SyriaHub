'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/navigation'
import { Menu, X, Moon, Sun, PenSquare, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from './NotificationBell'
import { SearchBar } from './SearchBar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  user?: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
      name?: string
    }
  } | null
}

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link
    href={href}
    className="px-3 py-2 text-sm font-medium text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light transition-colors"
  >
    {children}
  </Link>
)

export function Navbar({ user }: NavbarProps) {
  const t = useTranslations('Navigation')
  const tCommon = useTranslations('Common')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hasResolvedTheme, setHasResolvedTheme] = useState(false)

  // Safe access to user name/avatar since the user object structure might vary
  // depending on whether it comes from auth.getUser() or a custom query
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userAvatar = user?.user_metadata?.avatar_url

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const savedTheme = window.localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark

    const frame = window.requestAnimationFrame(() => {
      setIsDarkMode(shouldUseDark)
      setHasResolvedTheme(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!hasResolvedTheme || typeof document === 'undefined') {
      return
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      window.localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      window.localStorage.setItem('theme', 'light')
    }
  }, [hasResolvedTheme, isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group focus-ring rounded-lg px-2 py-1 -ml-2"
            aria-label={tCommon('appTitle')}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display font-bold text-xl text-primary dark:text-dark-text group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
              {tCommon('appTitle')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-1">
              <NavLink href="/feed">{t('feed')}</NavLink>
              <NavLink href="/explore">{t('explore')}</NavLink>
              <NavLink href="/resources">{t('resources')}</NavLink>
              <NavLink href="/events">{t('events')}</NavLink>
            </div>

            <div className="h-6 w-px bg-gray-200 dark:bg-dark-border" />

            <div className="flex items-center gap-3">
              <SearchBar />

              <LanguageSwitcher />

              <button
                onClick={toggleDarkMode}
                className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-all focus-ring"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user ? (
                <>
                  <NotificationBell />

                  <Link href="/editor">
                    <Button size="sm" className="gap-2 font-medium shadow-sm">
                      <PenSquare className="w-4 h-4" />
                      Write
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 ml-2 focus-ring rounded-full">
                        <Avatar className="w-8 h-8 border border-gray-200 dark:border-dark-border transition-transform hover:scale-105">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{userName}</p>
                          <p className="text-xs leading-none text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/profile/${user.id}`} className="cursor-pointer w-full flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>{t('profile')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer w-full flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <form action="/auth/signout" method="post" className="w-full">
                          <button type="submit" className="w-full flex items-center text-red-600 dark:text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>{t('logout')}</span>
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="font-medium">
                      {t('login')}
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="font-medium">
                      {tCommon('primaryCta')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={toggleMenu}
              className="p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all focus-ring"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-dark-border animate-in slide-in-from-top-2 duration-200">
            <Link
              href="/feed"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('feed')}
            </Link>
            <Link
              href="/explore"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('explore')}
            </Link>
            <Link
              href="/resources"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('resources')}
            </Link>
            <Link
              href="/events"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('events')}
            </Link>

            <div className="border-t border-gray-100 dark:border-dark-border my-2 pt-2">
              {user ? (
                <>
                  <div className="px-4 py-2 flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-gray-200 dark:border-dark-border">
                      <AvatarImage src={userAvatar} alt={userName} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-text dark:text-dark-text">{userName}</p>
                      <p className="text-xs text-text-light dark:text-dark-text-muted truncate max-w-[200px]">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    href="/editor"
                    className="flex items-center gap-2 px-4 py-3 text-primary dark:text-accent-light font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PenSquare className="w-4 h-4" />
                    Write a Post
                  </Link>

                  <Link
                    href={`/profile/${user.id}`}
                    className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {t('profile')}
                  </Link>

                  <form action="/auth/signout" method="post">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-4 space-y-3">
                  <Link
                    href="/auth/login"
                    className="block w-full text-center py-2.5 text-text dark:text-dark-text border border-gray-200 dark:border-dark-border rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block w-full text-center py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {tCommon('primaryCta')}
                  </Link>
                </div>
              )}

              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-text-light dark:text-dark-text-muted">Theme</span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
