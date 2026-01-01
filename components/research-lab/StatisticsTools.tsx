'use client'

import { useState, useCallback } from 'react'
import {
    BarChart3,
    LineChart,
    PieChart,
    AreaChart,
    Upload,
    FileSpreadsheet,
    Calculator,
    Save,
    Download,
    Trash2,
    Plus,
    X,
    ClipboardList,
    Vote,
    Loader2
} from 'lucide-react'
import {
    LineChart as RechartsLine,
    Line,
    BarChart as RechartsBar,
    Bar,
    PieChart as RechartsPie,
    Pie,
    AreaChart as RechartsArea,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface Survey {
    id: string
    title: string
    response_count: number
    status: string
    created_at: string
}

interface Poll {
    id: string
    question: string
    options: Array<{ id: string; text: string; vote_count: number }>
    total_votes: number
    is_active: boolean
    created_at: string
}

interface StatisticsToolsProps {
    userId?: string
    savedAnalyses: any[]
    availableDatasets: any[]
    userSurveys?: Survey[]
    userPolls?: Poll[]
}


const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']


// Sample demo data
const DEMO_DATA = [
    { name: 'Jan', value: 400, secondary: 240 },
    { name: 'Feb', value: 300, secondary: 139 },
    { name: 'Mar', value: 200, secondary: 980 },
    { name: 'Apr', value: 278, secondary: 390 },
    { name: 'May', value: 189, secondary: 480 },
    { name: 'Jun', value: 239, secondary: 380 },
]

export function StatisticsTools({ userId, savedAnalyses, availableDatasets, userSurveys = [], userPolls = [] }: StatisticsToolsProps) {
    const t = useTranslations('ResearchLab.statisticsPage')
    const [activeTab, setActiveTab] = useState<'charts' | 'calculator' | 'import'>('charts')
    const [chartType, setChartType] = useState('bar')
    const [chartData, setChartData] = useState(DEMO_DATA)
    const [showSecondary, setShowSecondary] = useState(false)
    const [loadingSurvey, setLoadingSurvey] = useState<string | null>(null)
    const [loadingPoll, setLoadingPoll] = useState<string | null>(null)
    const { showToast } = useToast()

    // Chart types with localized labels
    const CHART_TYPES = [
        { id: 'bar', label: t('chartTypes.bar'), icon: BarChart3 },
        { id: 'line', label: t('chartTypes.line'), icon: LineChart },
        { id: 'pie', label: t('chartTypes.pie'), icon: PieChart },
        { id: 'area', label: t('chartTypes.area'), icon: AreaChart },
    ]


    // Statistics calculator state
    const [calculatorData, setCalculatorData] = useState('')
    const [statistics, setStatistics] = useState<{
        mean?: number
        median?: number
        mode?: number[]
        stdDev?: number
        min?: number
        max?: number
        sum?: number
        count?: number
    } | null>(null)

    const calculateStatistics = useCallback(() => {
        const numbers = calculatorData
            .split(/[,\s\n]+/)
            .map(n => parseFloat(n.trim()))
            .filter(n => !isNaN(n))

        if (numbers.length === 0) {
            showToast('Please enter valid numbers', 'error')
            return
        }

        const sorted = [...numbers].sort((a, b) => a - b)
        const sum = numbers.reduce((a, b) => a + b, 0)
        const mean = sum / numbers.length

        // Median
        const mid = Math.floor(sorted.length / 2)
        const median = sorted.length % 2 !== 0
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2

        // Mode
        const frequency: Record<number, number> = {}
        let maxFreq = 0
        numbers.forEach(n => {
            frequency[n] = (frequency[n] || 0) + 1
            maxFreq = Math.max(maxFreq, frequency[n])
        })
        const mode = Object.entries(frequency)
            .filter(([_, freq]) => freq === maxFreq)
            .map(([num, _]) => parseFloat(num))

        // Standard deviation
        const squareDiffs = numbers.map(n => Math.pow(n - mean, 2))
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / numbers.length
        const stdDev = Math.sqrt(avgSquareDiff)

        setStatistics({
            mean: Math.round(mean * 1000) / 1000,
            median: Math.round(median * 1000) / 1000,
            mode: mode.length < numbers.length ? mode : undefined,
            stdDev: Math.round(stdDev * 1000) / 1000,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            sum: Math.round(sum * 1000) / 1000,
            count: numbers.length
        })

        // Also update chart data
        setChartData(numbers.slice(0, 10).map((n, i) => ({
            name: `#${i + 1}`,
            value: n,
            secondary: 0
        })))
    }, [calculatorData, showToast])

    const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string

            if (file.name.endsWith('.csv')) {
                // Parse CSV
                const lines = text.trim().split('\n')
                if (lines.length < 2) {
                    showToast('CSV file needs at least a header and one data row', 'error')
                    return
                }

                const headers = lines[0].split(',').map(h => h.trim())
                const data = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim())
                    const obj: any = { name: values[0] }
                    headers.slice(1).forEach((header, i) => {
                        const num = parseFloat(values[i + 1])
                        if (!isNaN(num)) obj[header.toLowerCase()] = num
                    })
                    return obj
                })

                setChartData(data.slice(0, 20))
                showToast('CSV imported successfully!', 'success')
            } else if (file.name.endsWith('.json')) {
                try {
                    const json = JSON.parse(text)
                    if (Array.isArray(json)) {
                        setChartData(json.slice(0, 20))
                        showToast('JSON imported successfully!', 'success')
                    } else {
                        showToast('JSON must be an array of objects', 'error')
                    }
                } catch {
                    showToast('Invalid JSON file', 'error')
                }
            }
        }
        reader.readAsText(file)
    }, [showToast])

    const handleImportSurvey = useCallback(async (surveyId: string) => {
        setLoadingSurvey(surveyId)
        const supabase = createClient()

        try {
            // Fetch survey questions and responses
            const { data: questions } = await supabase
                .from('survey_questions')
                .select('id, question_text, question_type, options')
                .eq('survey_id', surveyId)
                .order('order_index', { ascending: true })

            const { data: responses } = await supabase
                .from('survey_responses')
                .select('answers')
                .eq('survey_id', surveyId)

            if (!questions || !responses || responses.length === 0) {
                showToast('No data found', 'error')
                return
            }

            // Transform to chart data - aggregate choice questions
            const importedData: Array<{ name: string; value: number; secondary: number }> = []

            questions.forEach(q => {
                if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
                    const options = (q.options as Array<{ id: string; text: string }>) || []
                    const counts: Record<string, number> = {}
                    options.forEach(opt => { counts[opt.id] = 0 })

                    responses.forEach(r => {
                        const answer = r.answers[q.id]
                        if (Array.isArray(answer)) {
                            answer.forEach(id => { if (counts[id] !== undefined) counts[id]++ })
                        } else if (typeof answer === 'string' && counts[answer] !== undefined) {
                            counts[answer]++
                        }
                    })

                    options.forEach(opt => {
                        importedData.push({
                            name: opt.text.length > 20 ? opt.text.slice(0, 20) + '...' : opt.text,
                            value: counts[opt.id] || 0,
                            secondary: 0
                        })
                    })
                }
            })

            if (importedData.length === 0) {
                showToast('No visualizable data found', 'error')
                return
            }

            setChartData(importedData.slice(0, 20))
            setActiveTab('charts')
            showToast('Survey data imported!', 'success')
        } catch (error) {
            showToast('Failed to import survey data', 'error')
        } finally {
            setLoadingSurvey(null)
        }
    }, [showToast])

    const handleImportPoll = useCallback((poll: Poll) => {
        setLoadingPoll(poll.id)

        try {
            // Transform poll options to chart data
            const importedData = poll.options.map(opt => ({
                name: opt.text.length > 20 ? opt.text.slice(0, 20) + '...' : opt.text,
                value: opt.vote_count,
                secondary: 0
            }))

            setChartData(importedData)
            setActiveTab('charts')
            showToast('Poll data imported!', 'success')
        } catch (error) {
            showToast('Failed to import poll data', 'error')
        } finally {
            setLoadingPoll(null)
        }
    }, [showToast])

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 20, right: 30, left: 20, bottom: 5 }
        }

        switch (chartType) {
            case 'line':
                return (
                    <RechartsLine {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} />
                        {showSecondary && <Line type="monotone" dataKey="secondary" stroke={COLORS[1]} strokeWidth={2} dot={{ r: 4 }} />}
                    </RechartsLine>
                )
            case 'pie':
                return (
                    <RechartsPie {...commonProps}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            label={({ name, percent }: { name?: string | number; percent?: number }) => percent !== undefined ? `${name}: ${(percent * 100).toFixed(0)}%` : String(name)}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </RechartsPie>
                )
            case 'area':
                return (
                    <RechartsArea {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill={`${COLORS[0]}33`} />
                        {showSecondary && <Area type="monotone" dataKey="secondary" stroke={COLORS[1]} fill={`${COLORS[1]}33`} />}
                    </RechartsArea>
                )
            default: // bar
                return (
                    <RechartsBar {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                        {showSecondary && <Bar dataKey="secondary" fill={COLORS[1]} radius={[4, 4, 0, 0]} />}
                    </RechartsBar>
                )
        }
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-display font-bold text-text dark:text-dark-text mb-1">
                    {t('title')}
                </h1>
                <p className="text-text-light dark:text-dark-text-muted">
                    {t('subtitle')}
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-dark-border">
                {[
                    { id: 'charts', label: t('tabs.chartBuilder'), icon: BarChart3 },
                    { id: 'calculator', label: t('tabs.calculator'), icon: Calculator },
                    { id: 'import', label: t('tabs.importData'), icon: Upload },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors
                            ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-light dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                            }
                        `}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Chart Builder Tab */}
            {activeTab === 'charts' && (
                <div className="grid lg:grid-cols-[1fr_300px] gap-6">
                    {/* Chart Area */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                {renderChart()}
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                            <h3 className="font-medium text-text dark:text-dark-text mb-3">
                                {t('chartType')}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {CHART_TYPES.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setChartType(type.id)}
                                        className={`
                                            flex items-center gap-2 p-3 rounded-lg text-sm transition-colors
                                            ${chartType === type.id
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-dark-bg text-text-light dark:text-dark-text-muted hover:bg-gray-200 dark:hover:bg-dark-border'
                                            }
                                        `}
                                    >
                                        <type.icon className="w-4 h-4" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-4">
                            <h3 className="font-medium text-text dark:text-dark-text mb-3">
                                {t('options')}
                            </h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showSecondary}
                                    onChange={(e) => setShowSecondary(e.target.checked)}
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-text dark:text-dark-text">
                                    {t('showSecondary')}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Calculator Tab */}
            {activeTab === 'calculator' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-3">
                            {t('enterNumbers')}
                        </h3>
                        <p className="text-sm text-text-light dark:text-dark-text-muted mb-3">
                            {t('enterNumbersDesc')}
                        </p>
                        <textarea
                            value={calculatorData}
                            onChange={(e) => setCalculatorData(e.target.value)}
                            placeholder={t('enterNumbersPlaceholder')}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-text dark:text-dark-text placeholder-text-light dark:placeholder-dark-text-muted focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <button
                            onClick={calculateStatistics}
                            className="btn btn-primary w-full mt-4"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {t('calculateStatistics')}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-4">
                            {t('results')}
                        </h3>
                        {statistics ? (
                            <div className="grid grid-cols-2 gap-4">
                                <StatBox label={t('stats.count')} value={statistics.count} />
                                <StatBox label={t('stats.sum')} value={statistics.sum} />
                                <StatBox label={t('stats.mean')} value={statistics.mean} />
                                <StatBox label={t('stats.median')} value={statistics.median} />
                                <StatBox label={t('stats.stdDev')} value={statistics.stdDev} />
                                <StatBox label={t('stats.min')} value={statistics.min} />
                                <StatBox label={t('stats.max')} value={statistics.max} />
                                <StatBox label={t('stats.mode')} value={statistics.mode?.join(', ') || 'N/A'} />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-text-light dark:text-dark-text-muted">
                                {t('noResultsYet')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Import from File */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <Upload className="w-5 h-5 text-gray-500" />
                            {t('importFromFile')}
                        </h3>
                        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors">
                            <Upload className="w-10 h-10 text-gray-400 mb-3" />
                            <span className="text-sm text-text dark:text-dark-text font-medium">
                                {t('dropFileHere')}
                            </span>
                            <span className="text-xs text-text-light dark:text-dark-text-muted mt-1">
                                {t('orClickToBrowse')}
                            </span>
                            <input
                                type="file"
                                accept=".csv,.json"
                                onChange={handleFileImport}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {/* Import from Resources */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                            {t('importFromResources')}
                        </h3>
                        {availableDatasets.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availableDatasets.map((dataset: any) => (
                                    <button
                                        key={dataset.id}
                                        className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary transition-colors"
                                    >
                                        <FileSpreadsheet className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm text-text dark:text-dark-text truncate">
                                            {dataset.title}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-light dark:text-dark-text-muted">
                                {t('noDatasets')}
                            </div>
                        )}
                    </div>

                    {/* Import from Surveys */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-primary" />
                            {t('importFromSurveys')}
                        </h3>
                        {userSurveys.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {userSurveys.map((survey) => (
                                    <button
                                        key={survey.id}
                                        onClick={() => handleImportSurvey(survey.id)}
                                        disabled={loadingSurvey === survey.id || survey.response_count === 0}
                                        className={`w-full flex items-center justify-between gap-3 p-3 text-left border rounded-lg transition-colors ${survey.response_count === 0
                                            ? 'border-gray-100 dark:border-dark-border opacity-50 cursor-not-allowed'
                                            : 'border-gray-200 dark:border-dark-border hover:border-primary'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {loadingSurvey === survey.id ? (
                                                <Loader2 className="w-5 h-5 text-primary animate-spin flex-shrink-0" />
                                            ) : (
                                                <ClipboardList className="w-5 h-5 text-primary flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <span className="text-sm text-text dark:text-dark-text truncate block">
                                                    {survey.title}
                                                </span>
                                                <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                    {survey.response_count} {t('responses')}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${survey.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {survey.status === 'active' ? t('active') : t('closed')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-light dark:text-dark-text-muted">
                                {userId ? t('noSurveys') : t('loginToSeeSurveys')}
                            </div>
                        )}
                    </div>

                    {/* Import from Polls */}
                    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
                        <h3 className="font-medium text-text dark:text-dark-text mb-4 flex items-center gap-2">
                            <Vote className="w-5 h-5 text-amber-500" />
                            {t('importFromPolls')}
                        </h3>
                        {userPolls.length > 0 ? (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {userPolls.map((poll) => (
                                    <button
                                        key={poll.id}
                                        onClick={() => handleImportPoll(poll)}
                                        disabled={loadingPoll === poll.id || poll.total_votes === 0}
                                        className={`w-full flex items-center justify-between gap-3 p-3 text-left border rounded-lg transition-colors ${poll.total_votes === 0
                                            ? 'border-gray-100 dark:border-dark-border opacity-50 cursor-not-allowed'
                                            : 'border-gray-200 dark:border-dark-border hover:border-primary'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {loadingPoll === poll.id ? (
                                                <Loader2 className="w-5 h-5 text-amber-500 animate-spin flex-shrink-0" />
                                            ) : (
                                                <Vote className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <span className="text-sm text-text dark:text-dark-text truncate block">
                                                    {poll.question}
                                                </span>
                                                <span className="text-xs text-text-light dark:text-dark-text-muted">
                                                    {poll.total_votes} {t('votes')} • {poll.options.length} {t('optionsCount')}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${poll.is_active
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                            {poll.is_active ? t('active') : t('closed')}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-text-light dark:text-dark-text-muted">
                                {userId ? t('noPolls') : t('loginToSeePolls')}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function StatBox({ label, value }: { label: string; value: any }) {
    return (
        <div className="bg-gray-50 dark:bg-dark-bg rounded-lg p-3">
            <div className="text-xs text-text-light dark:text-dark-text-muted mb-1">
                {label}
            </div>
            <div className="text-lg font-semibold text-text dark:text-dark-text">
                {value ?? '-'}
            </div>
        </div>
    )
}
