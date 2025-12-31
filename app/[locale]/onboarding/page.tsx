'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useTranslations } from 'next-intl'
import { User, Briefcase, BookOpen, MapPin, Globe, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'

export default function OnboardingPage() {
    const router = useRouter()
    const t = useTranslations('Onboarding')
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        affiliation: '',
        location: '',
        website: '',
        research_interests: [] as string[],
    })

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/login')
                return
            }
            setUser(user)

            // Get existing user data
            const { data: userData } = await supabase
                .from('users')
                .select('name, bio, affiliation, location, website, research_interests')
                .eq('id', user.id)
                .single()

            if (userData) {
                setFormData({
                    name: userData.name || '',
                    bio: userData.bio || '',
                    affiliation: userData.affiliation || '',
                    location: userData.location || '',
                    website: userData.website || '',
                    research_interests: userData.research_interests || [],
                })
            }
        }
        fetchUser()
    }, [router])

    const handleSave = async () => {
        if (!user) return
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase
            .from('users')
            .update({
                name: formData.name,
                bio: formData.bio,
                affiliation: formData.affiliation,
                location: formData.location,
                website: formData.website,
                research_interests: formData.research_interests,
            })
            .eq('id', user.id)

        setLoading(false)

        if (!error) {
            router.push('/feed')
        }
    }

    const steps = [
        { id: 1, title: t('step1Title'), icon: User },
        { id: 2, title: t('step2Title'), icon: Briefcase },
        { id: 3, title: t('step3Title'), icon: BookOpen },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
            <Navbar user={user} />

            <main className="flex-1 container-custom py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('setupWelcome')}</span>
                        </div>
                        <h1 className="text-3xl font-bold text-text dark:text-dark-text mb-2">
                            {t('title')}
                        </h1>
                        <p className="text-text-light dark:text-dark-text-muted">
                            {t('subtitle')}
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {steps.map((s, idx) => (
                            <div key={s.id} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= s.id
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 dark:bg-dark-border text-text-muted'
                                    }`}>
                                    {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`w-12 h-1 mx-2 rounded ${step > s.id ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                                    {t('step1Title')}
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('nameLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                        placeholder={t('namePlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        {t('bioLabel')}
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text resize-none"
                                        placeholder={t('bioPlaceholder')}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                                    {t('step2Title')}
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        <Briefcase className="w-4 h-4 inline mr-2" />
                                        {t('affiliationLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.affiliation}
                                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                        placeholder={t('affiliationPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        <MapPin className="w-4 h-4 inline mr-2" />
                                        {t('locationLabel')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                        placeholder={t('locationPlaceholder')}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text dark:text-dark-text mb-2">
                                        <Globe className="w-4 h-4 inline mr-2" />
                                        {t('websiteLabel')}
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg text-text dark:text-dark-text"
                                        placeholder="https://"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 text-center">
                                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-primary" />
                                </div>
                                <h2 className="text-xl font-semibold text-text dark:text-dark-text">
                                    {t('step3Title')}
                                </h2>
                                <p className="text-text-light dark:text-dark-text-muted">
                                    {t('step3Description')}
                                </p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <Button variant="outline" onClick={() => setStep(step - 1)}>
                                    {t('back')}
                                </Button>
                            ) : (
                                <div />
                            )}
                            {step < 3 ? (
                                <Button onClick={() => setStep(step + 1)} className="gap-2">
                                    {t('continue')}
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleSave} disabled={loading} className="gap-2">
                                    {loading ? t('saving') : t('finish')}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Skip Link */}
                    <p className="text-center mt-6 text-sm text-text-light dark:text-dark-text-muted">
                        <button onClick={() => router.push('/feed')} className="hover:text-primary transition-colors">
                            {t('skipForNow')}
                        </button>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}
