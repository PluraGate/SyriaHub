'use client'
// Force rebuild for hydration fix

import { useState, useEffect } from 'react'
import { Link, usePathname } from '@/navigation'
import { useRouter } from 'next/navigation'
import { Menu, X, Moon, Sun, PenSquare, User, Settings, LogOut, ChevronDown, Bookmark, Shield, FlaskConical, BarChart3, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NotificationBell } from './NotificationBell'
import { SearchBar } from './SearchBar'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/contexts/PreferencesContext'
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
import { FeedbackButton } from "@/components/feedback"

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
  const pathname = usePathname()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, isDark } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional SSR hydration pattern
    setMounted(true)
  }, [])

  // Extract locale from pathname (first segment after /)
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] || 'en' : 'en'

  // Fetch avatar_url and role from users table
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const supabase = createClient()
        const { data } = await supabase
          .from('users')
          .select('avatar_url, role')
          .eq('id', user.id)
          .single()

        if (data) {
          if (data.avatar_url && !userAvatarUrl) {
            setUserAvatarUrl(data.avatar_url)
          }
          if (data.role) {
            setUserRole(data.role)
          }
        }
      }
    }
    fetchUserData()
  }, [user?.id, userAvatarUrl])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Safe access to user name/avatar since the user object structure might vary
  // depending on whether it comes from auth.getUser() or a custom query
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userAvatar = userAvatarUrl || user?.user_metadata?.avatar_url
  const isAdminOrModerator = userRole === 'admin' || userRole === 'moderator'

  // Toggle between light/dark/system - cycles: light -> dark -> system -> light
  const toggleDarkMode = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
      <div className="container-custom">
        <div className="flex items-end justify-between h-16 gap-6 pb-4" suppressHydrationWarning>
          {/* Logo - Updated to use Image component */}
          <Link
            href="/"
            className="flex items-end gap-1 group focus-ring rounded-lg px-2 py-1 -ms-2 shrink-0"
            aria-label={tCommon('appTitle')}
          >
            <Image
              src="/icons/Pluragate-logo.ico"
              alt="SyriaHub Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg shadow-sm group-hover:shadow-md transition-all object-cover mb-1"
            />
            <span className="font-display font-bold text-xl text-primary dark:text-dark-text group-hover:text-secondary dark:group-hover:text-secondary-light transition-colors leading-none mb-1">
              {tCommon('appTitle')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-end gap-2 lg:gap-4 flex-1 justify-end">
            {/* Nav links - only visible at lg+ to preserve space for action items */}
            <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
              <NavLink href="/feed">{t('feed')}</NavLink>
              <NavLink href="/explore">{t('explore')}</NavLink>
              <NavLink href="/resources">{t('resources')}</NavLink>
              <NavLink href="/events">{t('events')}</NavLink>
            </div>

            <div className="hidden xl:block h-6 w-px bg-gray-200 dark:bg-dark-border shrink-0 mb-1" />

            {/* Action items - never shrink */}
            <div className="flex items-center gap-1 lg:gap-2 shrink-0 translate-y-1">
              <SearchBar />

              <LanguageSwitcher />

              <button
                onClick={toggleDarkMode}
                className="p-2 text-text-light dark:text-dark-text-muted hover:text-primary dark:hover:text-accent-light hover:bg-gray-100 dark:hover:bg-dark-border rounded-full transition-all focus-ring"
                aria-label={mounted && isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {mounted && isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {user ? (
                <>
                  <NotificationBell />

                  <Link href="/research-lab" className="shrink-0">
                    <Button variant="outline" size="sm" className="gap-2 font-medium whitespace-nowrap">
                      <FlaskConical className="w-4 h-4" />
                      {t('researchLab')}
                    </Button>
                  </Link>

                  <Link href="/editor" className="shrink-0">
                    <Button size="sm" className="gap-2 font-medium shadow-sm">
                      <PenSquare className="w-4 h-4" />
                      {t('write')}
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 ms-2 focus-ring rounded-full shrink-0" suppressHydrationWarning>
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
                        <Link href="/saved" className="cursor-pointer w-full flex items-center">
                          <Bookmark className="mr-2 h-4 w-4" />
                          <span>{t('saved')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/analytics" className="cursor-pointer w-full flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{t('analytics')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/achievements" className="cursor-pointer w-full flex items-center">
                          <Trophy className="mr-2 h-4 w-4" />
                          <span>{t('achievements')}</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer w-full flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>{t('settings')}</span>
                        </Link>
                      </DropdownMenuItem>
                      {isAdminOrModerator && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer w-full flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              <span>{t('admin')}</span>
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-accent dark:text-accent-light">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('logout')}</span>
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
          <div className="md:hidden py-4 space-y-1 border-t border-gray-200 dark:border-dark-border animate-in slide-in-from-top-2 duration-200">
            {/* Content: Feed */}
            <Link
              href="/feed"
              className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('feed')}
            </Link>

            {/* Thinking Tools: Explore + Research Lab - subtle visual grouping */}
            <div className="mx-2 my-1 px-2 py-1 bg-gray-50/50 dark:bg-white/[0.02] rounded-lg">
              <Link
                href="/explore"
                className="block px-4 py-3 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('explore')}
              </Link>
              <Link
                href="/research-lab"
                className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <FlaskConical className="w-4 h-4" />
                {t('researchLab')}
              </Link>
            </div>

            {/* Content: Resources, Events */}
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

            {user ? (
              <>
                {/* Separator before Write */}
                <div className="border-t border-gray-200 dark:border-dark-border my-3" />

                {/* Write - Primary Action (accented) */}
                <Link
                  href="/editor"
                  className="flex items-center gap-2 mx-4 px-4 py-3 bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent-light font-semibold rounded-lg hover:bg-primary/20 dark:hover:bg-accent/20 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenSquare className="w-4 h-4" />
                  {t('write')}
                </Link>

                {/* Separator before User Section */}
                <div className="border-t border-gray-200 dark:border-dark-border my-3" />

                {/* User Info */}
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

                {/* User Account Items: Profile, Saved, Analytics, Achievements, Settings */}
                <Link
                  href={`/profile/${user.id}`}
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  {t('profile')}
                </Link>

                <Link
                  href="/saved"
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Bookmark className="w-4 h-4" />
                  {t('saved')}
                </Link>

                <Link
                  href="/analytics"
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BarChart3 className="w-4 h-4" />
                  {t('analytics')}
                </Link>

                <Link
                  href="/achievements"
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Trophy className="w-4 h-4" />
                  {t('achievements')}
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-3 text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  {t('settings')}
                </Link>

                {/* Separator before Admin/Sign Out */}
                <div className="border-t border-gray-200 dark:border-dark-border my-3" />

                {/* Admin Panel (de-emphasized with opacity) */}
                {isAdminOrModerator && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-3 text-text/70 dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-surface rounded-lg transition-all font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    {t('admin')}
                  </Link>
                )}

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-3 text-accent dark:text-accent-light hover:bg-accent/10 dark:hover:bg-accent/10 rounded-lg transition-all font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </button>

                {/* Theme Toggle */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-text-light dark:text-dark-text-muted">Theme</span>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all"
                  >
                    {mounted && isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-200 dark:border-dark-border mt-3 pt-3 p-4 space-y-3">
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

                {/* Theme Toggle for non-logged-in users */}
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-sm text-text-light dark:text-dark-text-muted">Theme</span>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-all"
                  >
                    {mounted && isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>



      {/* Global Floating Feedback Button */}
      <FeedbackButton />
    </nav>
  )
}
