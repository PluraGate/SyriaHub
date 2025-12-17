import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AboutLayout } from '@/components/AboutLayout'
import { Target, Eye, Heart, Star } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    return {
        title: `${t('mission')} | Syrealize`,
        description: t('content.missionIntro')
    }
}

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'About' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isArabic = locale === 'ar'

    return (
        <AboutLayout user={user}>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold text-primary dark:text-secondary mb-6 flex items-center gap-3">
                    <Target className="w-7 h-7" />
                    {t('missionTitle')}
                </h2>

                {/* Introduction */}
                <p className="text-lg leading-relaxed">
                    {t('content.missionIntro')}
                </p>

                {/* Vision */}
                <div className="my-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 border border-primary/10 dark:border-secondary/10">
                    <div className="flex items-center gap-3 mb-4">
                        <Eye className="w-6 h-6 text-primary dark:text-secondary" />
                        <h3 className="text-xl font-semibold text-primary dark:text-secondary m-0">
                            {isArabic ? 'رؤيتنا' : 'Our Vision'}
                        </h3>
                    </div>
                    <p className="text-text dark:text-dark-text m-0">
                        {t('content.missionVision')}
                    </p>
                </div>

                {/* Why We Exist */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isArabic ? 'لماذا نحن موجودون' : 'Why We Exist'}
                </h3>
                <p>
                    {isArabic
                        ? 'في عالم تتزايد فيه المعلومات المضللة، نؤمن بأن المعرفة الموثوقة والموثقة يجب أن تكون متاحة للجميع. أُسست Syrealize لتوفير مساحة آمنة ومحترفة للباحثين والمهتمين لمشاركة أعمالهم والتعاون في بناء قاعدة معرفية موثوقة.'
                        : 'In a world of increasing misinformation, we believe that reliable, documented knowledge should be accessible to everyone. Syrealize was founded to provide a safe, professional space for researchers and knowledge seekers to share their work and collaborate in building a trustworthy knowledge base.'
                    }
                </p>

                {/* Core Values */}
                <h3 className="text-xl font-semibold text-text dark:text-dark-text mt-8 mb-4">
                    {isArabic ? 'قيمنا الجوهرية' : 'Our Core Values'}
                </h3>

                <div className="grid gap-4 md:grid-cols-2 not-prose">
                    <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold text-text dark:text-dark-text">
                                {isArabic ? 'النزاهة' : 'Integrity'}
                            </h4>
                        </div>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isArabic
                                ? 'نلتزم بأعلى معايير الأمانة والشفافية في جميع جوانب عملنا.'
                                : 'We uphold the highest standards of honesty and transparency in all aspects of our work.'
                            }
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                        <div className="flex items-center gap-2 mb-2">
                            <Heart className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold text-text dark:text-dark-text">
                                {isArabic ? 'التعاون' : 'Collaboration'}
                            </h4>
                        </div>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isArabic
                                ? 'نؤمن بأن المعرفة تنمو بالمشاركة وأن التعاون يولّد أفكاراً أعظم.'
                                : 'We believe knowledge grows through sharing and that collaboration creates greater ideas.'
                            }
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold text-text dark:text-dark-text">
                                {isArabic ? 'سهولة الوصول' : 'Accessibility'}
                            </h4>
                        </div>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isArabic
                                ? 'نسعى لجعل المعرفة متاحة للجميع بغض النظر عن خلفياتهم.'
                                : 'We strive to make knowledge accessible to all, regardless of background.'
                            }
                        </p>
                    </div>

                    <div className="p-4 rounded-lg border border-border dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-accent" />
                            <h4 className="font-semibold text-text dark:text-dark-text">
                                {isArabic ? 'التميز' : 'Excellence'}
                            </h4>
                        </div>
                        <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {isArabic
                                ? 'نسعى للتميز في كل ما نقدمه ونشجع مجتمعنا على تقديم أفضل ما لديهم.'
                                : 'We pursue excellence in everything we do and encourage our community to bring their best.'
                            }
                        </p>
                    </div>
                </div>
            </div>
        </AboutLayout>
    )
}
