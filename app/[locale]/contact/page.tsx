"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/toast'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Turnstile } from '@/components/ui/Turnstile'
import { Mail, MapPin, MessageSquare, Send } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }).max(100),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }).max(255),
    subject: z.string().min(5, {
        message: "Subject must be at least 5 characters.",
    }).max(200),
    message: z.string().min(10, {
        message: "Message must be at least 10 characters.",
    }).max(5000),
    // Honeypot field - hidden from users, bots fill it
    company: z.string().max(0).optional(),
})

export default function ContactPage() {
    const t = useTranslations('Contact')
    const { showToast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [turnstileToken, setTurnstileToken] = useState<string>('')

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
            company: "", // Honeypot
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Check if Turnstile is configured and token is required
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
        if (siteKey && !turnstileToken) {
            showToast("Please complete the security verification.", "error")
            return
        }

        setIsSubmitting(true)
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...values,
                    'cf-turnstile-response': turnstileToken || undefined,
                }),
            })

            if (!response.ok) throw new Error('Failed to send message')

            showToast("Message sent successfully!", "success")
            form.reset()
            setTurnstileToken('')
        } catch (error) {
            showToast("Failed to send message. Please try again.", "error")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-background dark:bg-dark-bg flex flex-col">
            <Navbar />

            <main className="flex-1 container-custom py-12 md:py-24">
                {/* Hero Section */}
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                    <h1 className="text-4xl font-display font-bold text-text dark:text-dark-text tracking-tight">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-text-light dark:text-dark-text-muted">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start max-w-6xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8 lg:order-2">
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm space-y-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-text dark:text-dark-text">
                                    {t('contactInfo')}
                                </h3>

                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-text dark:text-dark-text mb-1">{t('emailLabel')}</h4>
                                            <a href="mailto:admin@pluragate.org" className="text-text-light dark:text-dark-text-muted hover:text-primary transition-colors block">
                                                admin@pluragate.org
                                            </a>
                                            <p className="text-xs text-text-light/70 dark:text-dark-text-muted/70 mt-1">
                                                {t('pluragateMember')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-text dark:text-dark-text mb-1">{t('supportLabel')}</h4>
                                            <p className="text-text-light dark:text-dark-text-muted">
                                                {t.rich('supportText', {
                                                    github: (chunks) => <a href="https://github.com/PluraGate" className="text-primary hover:underline hover:text-primary/80 dark:text-accent-light dark:hover:text-accent font-medium">{chunks}</a>
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-text dark:text-dark-text mb-1">{t('locationLabel')}</h4>
                                            <p className="text-text-light dark:text-dark-text-muted">
                                                {t('digitalOrg')}<br />
                                                {t('globalReach')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
                                <p className="text-sm text-text-light dark:text-dark-text-muted">
                                    {t('privacyNote')}
                                </p>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                                {t('operatingUnder')}
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:order-1">
                        <div className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.name')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('placeholders.name')} {...field} className="bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.email')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('placeholders.email')} {...field} className="bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.subject')}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t('placeholders.subject')} {...field} className="bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t('form.message')}</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder={t('placeholders.message')}
                                                        className="min-h-[150px] bg-gray-50 dark:bg-dark-bg border-gray-200 dark:border-dark-border resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Honeypot field - hidden from users, bots will fill it */}
                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden" aria-hidden="true" tabIndex={-1}>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Company name"
                                                        {...field}
                                                        tabIndex={-1}
                                                        autoComplete="off"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    {/* Turnstile CAPTCHA */}
                                    <div className="flex justify-center">
                                        <Turnstile
                                            onSuccess={(token: string) => setTurnstileToken(token)}
                                            onExpire={() => setTurnstileToken('')}
                                            onError={() => setTurnstileToken('')}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>{t('form.sending')}</>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                {t('form.send')}
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
