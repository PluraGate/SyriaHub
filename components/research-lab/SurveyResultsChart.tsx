'use client'

import { useTranslations } from 'next-intl'

interface BarData {
    type: 'bar'
    options: Array<{ label: string; value: number; percentage: number }>
}

interface StatsData {
    type: 'stats'
    average: number
    min: number
    max: number
    distribution: Array<{ value: number; count: number }>
}

interface TextData {
    type: 'text'
    responses: unknown[]
}

type ChartData = BarData | StatsData | TextData

interface ProcessedResult {
    questionId: string
    questionText: string
    questionType: string
    responseCount: number
    data: ChartData | Record<string, unknown>
}

interface SurveyResultsChartProps {
    result: ProcessedResult
}

export function SurveyResultsChart({ result }: SurveyResultsChartProps) {
    const rawData = result.data as ChartData | undefined

    if (!rawData || !('type' in rawData)) {
        return null
    }

    if (rawData.type === 'bar') {
        return <BarChart data={rawData} />
    }

    if (rawData.type === 'stats') {
        return <StatsDisplay data={rawData} questionType={result.questionType} />
    }

    if (rawData.type === 'text') {
        return <TextResponses data={rawData} />
    }

    return null
}

function BarChart({ data }: { data: BarData }) {
    const maxValue = Math.max(...data.options.map(o => o.value), 1)

    return (
        <div className="space-y-3">
            {data.options.map((option, index) => (
                <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-text dark:text-dark-text">
                            {option.label}
                        </span>
                        <span className="text-sm font-medium text-text-light dark:text-dark-text-muted">
                            {option.value} ({option.percentage}%)
                        </span>
                    </div>
                    <div className="h-6 bg-gray-100 dark:bg-dark-bg rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                            style={{ width: `${(option.value / maxValue) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

function StatsDisplay({ data, questionType }: { data: StatsData; questionType: string }) {
    const t = useTranslations('Statistics')
    const isRating = questionType === 'rating'
    const maxValue = isRating ? 5 : 10

    return (
        <div className="space-y-4">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-primary">{data.average}</div>
                    <div className="text-sm text-text-light dark:text-dark-text-muted">{t('average')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-text dark:text-dark-text">{data.min}</div>
                    <div className="text-sm text-text-light dark:text-dark-text-muted">{t('minimum')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                    <div className="text-2xl font-bold text-text dark:text-dark-text">{data.max}</div>
                    <div className="text-sm text-text-light dark:text-dark-text-muted">{t('maximum')}</div>
                </div>
            </div>

            {/* Distribution */}
            {data.distribution && data.distribution.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-text dark:text-dark-text mb-2">{t('distribution')}</p>
                    <div className="flex items-end justify-between gap-1 h-24">
                        {data.distribution.map((item) => {
                            const maxCount = Math.max(...data.distribution.map(d => d.count), 1)
                            const height = (item.count / maxCount) * 100

                            return (
                                <div key={item.value} className="flex-1 flex flex-col items-center">
                                    <div className="w-full flex flex-col items-center">
                                        {item.count > 0 && (
                                            <span className="text-xs text-text-light dark:text-dark-text-muted mb-1">
                                                {item.count}
                                            </span>
                                        )}
                                        <div
                                            className="w-full bg-primary/80 rounded-t transition-all duration-500"
                                            style={{ height: `${Math.max(height, 4)}%`, minHeight: item.count > 0 ? '4px' : '2px' }}
                                        />
                                    </div>
                                    <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                        {isRating ? '★'.repeat(Math.max(0, item.value)) : item.value}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

function TextResponses({ data }: { data: TextData }) {
    const tSurveys = useTranslations('Surveys')
    if (!data.responses || data.responses.length === 0) {
        return (
            <p className="text-text-light dark:text-dark-text-muted italic">
                {tSurveys('noResponses')}
            </p>
        )
    }

    return (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {data.responses.map((response, index) => (
                <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border-l-4 border-primary/30 hover:border-primary/60 transition-colors"
                >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                        {index + 1}
                    </span>
                    <p className="text-sm text-text dark:text-dark-text leading-relaxed flex-1">
                        &quot;{String(response)}&quot;
                    </p>
                </div>
            ))}
            {data.responses.length >= 20 && (
                <p className="text-sm text-text-light dark:text-dark-text-muted italic text-center py-2 border-t border-gray-200 dark:border-dark-border">
                    Showing first 20 responses • View Individual Responses for more
                </p>
            )}
        </div>
    )
}
