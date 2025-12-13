import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { WaitlistForm } from '@/components/WaitlistForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Ticket, Users, Clock, Sparkles } from 'lucide-react'

export const metadata = {
    title: 'Join the Waitlist | Syrealize',
    description: 'Request access to Syrealize, the invite-only research platform for Syrian researchers.',
}

export default async function WaitlistPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/feed')
    }

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={null} />

            <main className="flex-1 flex">
                {/* Left - Branding Panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary via-secondary-dark to-primary relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                        <Link href="/" className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">S</span>
                            </div>
                            <span className="font-bold text-2xl text-white">Syrealize</span>
                        </Link>

                        <h1 className="text-4xl font-bold text-white mb-4">
                            Request Early Access
                        </h1>
                        <p className="text-xl text-white/80 mb-12 max-w-md">
                            Syrealize is currently in private beta. Join the waitlist and we will notify you when a spot opens up.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Quick Review</h3>
                                    <p className="text-sm text-white/70">Applications typically reviewed within 24-48 hours</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Priority Access</h3>
                                    <p className="text-sm text-white/70">Researchers get priority in the queue</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Early Adopter Perks</h3>
                                    <p className="text-sm text-white/70">Shape the platform & get extra invites</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Form Panel */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="text-center mb-8 lg:hidden">
                            <Link href="/" className="inline-flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-xl">S</span>
                                </div>
                                <span className="font-bold text-2xl text-text dark:text-dark-text">Syrealize</span>
                            </Link>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <Ticket className="w-5 h-5 text-secondary-dark" />
                                </div>
                                <h2 className="text-2xl font-bold text-text dark:text-dark-text">
                                    Join the Waitlist
                                </h2>
                            </div>
                            <p className="text-text-light dark:text-dark-text-muted mb-8">
                                Tell us about yourself and we will be in touch!
                            </p>

                            <WaitlistForm />
                        </div>

                        {/* Already have code */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-text-light dark:text-dark-text-muted">
                                Already have an invite code?{' '}
                                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
