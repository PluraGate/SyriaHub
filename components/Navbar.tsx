'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Moon, Sun, PenSquare } from 'lucide-react'

interface NavbarProps {
  user?: {
    id: string
    email?: string
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [hasResolvedTheme, setHasResolvedTheme] = useState(false)

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
    <nav className="sticky top-0 z-50 bg-background-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group focus-ring rounded-lg px-2 py-1 -ml-2"
            aria-label="Syrealize Home"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <span className="font-display font-bold text-xl text-primary dark:text-dark-text group-hover:text-accent dark:group-hover:text-accent-light transition-colors">
              Syrealize
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/feed"
              className="px-4 py-2 text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className="px-4 py-2 text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
            >
              Explore
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/editor"
                  className="flex items-center gap-2 px-4 py-2 text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
                >
                  <PenSquare className="w-4 h-4" />
                  Write
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  className="px-4 py-2 text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
                >
                  Profile
                </Link>
                <form action="/auth/signout" method="post" className="ml-2">
                  <button
                    type="submit"
                    className="px-4 py-2 text-text dark:text-dark-text hover:text-accent dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-text dark:text-dark-text hover:text-primary dark:hover:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition-all focus-ring font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary ml-2"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="ml-2 p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all focus-ring"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all focus-ring"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
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
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-dark-border">
            <Link
              href="/feed"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Feed
            </Link>
            <Link
              href="/explore"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            
            {user ? (
              <>
                <Link
                  href="/editor"
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenSquare className="w-4 h-4" />
                  Write
                </Link>
                <Link
                  href={`/profile/${user.id}`}
                  className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-3 text-accent dark:text-accent-light hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  >
                    Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-3 bg-primary text-white hover:bg-primary-dark rounded-lg transition-all font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
