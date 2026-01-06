'use client'

import { useState, useEffect, useCallback } from 'react'
import {
    BarChart3,
    LineChart,
    PieChart,
    AreaChart,
    Database,
    Loader2,
    X,
    ChevronDown,
    Settings,
    RefreshCw,
    AlertCircle
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
import { useTranslations } from 'next-intl'

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export type ChartType = 'bar' | 'line' | 'pie' | 'area'

export interface ChartConfig {
    resourceId: string
    resourceTitle: string
    chartType: ChartType
    dataKey?: string
    nameKey?: string
    showLegend?: boolean
    title?: string
}

interface ChartData {
    name: string
    value: number
    [key: string]: string | number
}

interface Resource {
    id: string
    title: string
    metadata: {
        url?: string
        mime_type?: string
        resource_type?: string
        source_type?: string
    }
}

interface ChartBlockProps {
    config: ChartConfig
    linkedResources: Resource[]
    onChange: (config: ChartConfig) => void
    onRemove: () => void
    isEditing?: boolean
}

export function ChartBlock({
    config,
    linkedResources,
    onChange,
    onRemove,
    isEditing = true
}: ChartBlockProps) {
    const t = useTranslations('Editor')
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSettings, setShowSettings] = useState(false)
    const [availableKeys, setAvailableKeys] = useState<string[]>([])

    // Filter to only show dataset resources
    const datasetResources = linkedResources.filter(
        r => r.metadata?.resource_type === 'dataset' ||
            r.metadata?.mime_type?.includes('json') ||
            r.metadata?.mime_type?.includes('csv')
    )

    const CHART_TYPES: { id: ChartType; label: string; icon: typeof BarChart3 }[] = [
        { id: 'bar', label: t('chart.types.bar') || 'Bar', icon: BarChart3 },
        { id: 'line', label: t('chart.types.line') || 'Line', icon: LineChart },
        { id: 'pie', label: t('chart.types.pie') || 'Pie', icon: PieChart },
        { id: 'area', label: t('chart.types.area') || 'Area', icon: AreaChart },
    ]

    const loadResourceData = useCallback(async () => {
        if (!config.resourceId) return

        const resource = linkedResources.find(r => r.id === config.resourceId)
        if (!resource?.metadata?.url) {
            setError('Resource URL not found')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(resource.metadata.url)
            const text = await response.text()

            let data: ChartData[] = []

            // Try parsing as JSON first
            if (resource.metadata.mime_type?.includes('json') || resource.metadata.url?.endsWith('.json')) {
                const json = JSON.parse(text)

                // Handle different JSON structures
                if (json.results && Array.isArray(json.results)) {
                    // Poll/Survey export format
                    data = json.results.map((item: { option: string; votes: number; percentage: number }) => ({
                        name: item.option,
                        value: item.votes,
                        percentage: item.percentage
                    }))
                } else if (json.responses && Array.isArray(json.responses)) {
                    // Survey responses - aggregate by question
                    // For now, show response count over time or first question stats
                    data = [{ name: 'Responses', value: json.responses.length }]
                } else if (Array.isArray(json)) {
                    // Direct array of objects
                    data = json.slice(0, 20).map((item: Record<string, unknown>, index: number) => {
                        const keys = Object.keys(item)
                        const nameKey = config.nameKey || keys.find(k => typeof item[k] === 'string') || 'name'
                        const valueKey = config.dataKey || keys.find(k => typeof item[k] === 'number') || 'value'

                        return {
                            name: String(item[nameKey] || `Item ${index + 1}`),
                            value: Number(item[valueKey]) || 0,
                            ...item as Record<string, string | number>
                        }
                    })

                    // Extract available keys for settings
                    if (json.length > 0) {
                        setAvailableKeys(Object.keys(json[0]))
                    }
                } else {
                    throw new Error('Unsupported JSON structure')
                }
            } else if (resource.metadata.mime_type?.includes('csv') || resource.metadata.url?.endsWith('.csv')) {
                // Parse CSV
                const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'))
                if (lines.length < 2) {
                    throw new Error('CSV needs header and data rows')
                }

                const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
                setAvailableKeys(headers)

                const nameIndex = config.nameKey ? headers.indexOf(config.nameKey) : 0
                const valueIndex = config.dataKey ? headers.indexOf(config.dataKey) : 1

                data = lines.slice(1, 21).map((line, index) => {
                    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                    return {
                        name: values[nameIndex] || `Row ${index + 1}`,
                        value: parseFloat(values[valueIndex]) || 0
                    }
                })
            } else {
                throw new Error('Unsupported file format')
            }

            setChartData(data)
        } catch (err) {
            console.error('Error loading chart data:', err)
            setError(err instanceof Error ? err.message : 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }, [config.resourceId, config.nameKey, config.dataKey, linkedResources])

    useEffect(() => {
        if (config.resourceId) {
            loadResourceData()
        }
    }, [config.resourceId, loadResourceData])

    const renderChart = () => {
        if (chartData.length === 0) {
            return (
                <div className="h-full flex items-center justify-center text-text-light dark:text-dark-text-muted">
                    <Database className="w-8 h-8 mr-2 opacity-50" />
                    <span>{t('chart.noData') || 'No data to display'}</span>
                </div>
            )
        }

        switch (config.chartType) {
            case 'line':
                return (
                    <RechartsLine data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {config.showLegend && <Legend />}
                        <Line type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1' }} />
                    </RechartsLine>
                )
            case 'pie':
                return (
                    <RechartsPie data={chartData}>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        {config.showLegend && <Legend />}
                    </RechartsPie>
                )
            case 'area':
                return (
                    <RechartsArea data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {config.showLegend && <Legend />}
                        <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B98133" />
                    </RechartsArea>
                )
            case 'bar':
            default:
                return (
                    <RechartsBar data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        {config.showLegend && <Legend />}
                        <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]}>
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </RechartsBar>
                )
        }
    }

    // If no resource is selected, show the selector
    if (!config.resourceId) {
        return (
            <div className="border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl p-6">
                <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-text-muted mb-3" />
                    <h3 className="font-medium text-text dark:text-dark-text mb-2">
                        {t('chart.selectResource') || 'Select a Dataset'}
                    </h3>
                    <p className="text-sm text-text-light dark:text-dark-text-muted mb-4">
                        {t('chart.selectResourceDesc') || 'Choose a linked dataset resource to visualize'}
                    </p>

                    {datasetResources.length === 0 ? (
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            {t('chart.noDatasets') || 'No dataset resources linked. Link a dataset first in the Resources section above.'}
                        </p>
                    ) : (
                        <div className="space-y-2 max-w-md mx-auto">
                            {datasetResources.map(resource => (
                                <button
                                    key={resource.id}
                                    onClick={() => onChange({
                                        ...config,
                                        resourceId: resource.id,
                                        resourceTitle: resource.title
                                    })}
                                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                                >
                                    <Database className="w-5 h-5 text-emerald-500" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-text dark:text-dark-text truncate">
                                            {resource.title}
                                        </p>
                                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                                            {resource.metadata?.source_type === 'poll' ? 'Poll Results' :
                                                resource.metadata?.source_type === 'survey' ? 'Survey Results' : 'Dataset'}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {isEditing && (
                        <button
                            onClick={onRemove}
                            className="mt-4 text-sm text-text-light hover:text-error transition-colors"
                        >
                            {t('chart.removeBlock') || 'Remove Chart Block'}
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden bg-white dark:bg-dark-surface">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border flex items-center justify-between bg-gray-50 dark:bg-dark-bg">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-text dark:text-dark-text">
                        {config.title || config.resourceTitle}
                    </span>
                </div>

                {isEditing && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={loadResourceData}
                            className="p-1.5 text-text-light hover:text-text dark:hover:text-dark-text transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-1.5 text-text-light hover:text-text dark:hover:text-dark-text transition-colors"
                            title="Chart settings"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onRemove}
                            className="p-1.5 text-text-light hover:text-error transition-colors"
                            title="Remove chart"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Settings Panel */}
            {showSettings && isEditing && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <label className="block text-xs text-text-light dark:text-dark-text-muted mb-1">
                                {t('chart.chartType') || 'Chart Type'}
                            </label>
                            <div className="flex gap-1">
                                {CHART_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => onChange({ ...config, chartType: type.id })}
                                        className={`p-2 rounded-lg transition-colors ${config.chartType === type.id
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-text-light hover:border-primary'
                                            }`}
                                        title={type.label}
                                    >
                                        <type.icon className="w-4 h-4" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {availableKeys.length > 0 && (
                            <>
                                <div>
                                    <label className="block text-xs text-text-light dark:text-dark-text-muted mb-1">
                                        {t('chart.nameColumn') || 'Name Column'}
                                    </label>
                                    <select
                                        value={config.nameKey || ''}
                                        onChange={(e) => onChange({ ...config, nameKey: e.target.value })}
                                        className="select-input"
                                    >
                                        <option value="">Auto</option>
                                        {availableKeys.map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-text-light dark:text-dark-text-muted mb-1">
                                        {t('chart.valueColumn') || 'Value Column'}
                                    </label>
                                    <select
                                        value={config.dataKey || ''}
                                        onChange={(e) => onChange({ ...config, dataKey: e.target.value })}
                                        className="select-input"
                                    >
                                        <option value="">Auto</option>
                                        {availableKeys.map(key => (
                                            <option key={key} value={key}>{key}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs text-text-light dark:text-dark-text-muted mb-1">
                                {t('chart.chartTitle') || 'Chart Title'}
                            </label>
                            <input
                                type="text"
                                value={config.title || ''}
                                onChange={(e) => onChange({ ...config, title: e.target.value })}
                                placeholder={config.resourceTitle}
                                className="input input-sm w-40"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={config.showLegend || false}
                                onChange={(e) => onChange({ ...config, showLegend: e.target.checked })}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-text dark:text-dark-text">
                                {t('chart.showLegend') || 'Show Legend'}
                            </span>
                        </label>
                    </div>

                    <button
                        onClick={() => onChange({
                            ...config,
                            resourceId: '',
                            resourceTitle: ''
                        })}
                        className="text-sm text-text-light hover:text-primary transition-colors"
                    >
                        {t('chart.changeDataset') || 'Change Dataset'}
                    </button>
                </div>
            )}

            {/* Chart Area */}
            <div className="p-4">
                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="h-64 flex items-center justify-center text-error">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            {renderChart()}
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    )
}

// Read-only version for post display
export function ChartBlockDisplay({ config, resourceUrl }: { config: ChartConfig; resourceUrl?: string }) {
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!resourceUrl) {
            setError('Resource not found')
            setLoading(false)
            return
        }

        const loadData = async () => {
            try {
                const response = await fetch(resourceUrl)
                const text = await response.text()

                let data: ChartData[] = []

                if (resourceUrl.endsWith('.json')) {
                    const json = JSON.parse(text)
                    if (json.results && Array.isArray(json.results)) {
                        data = json.results.map((item: { option: string; votes: number }) => ({
                            name: item.option,
                            value: item.votes
                        }))
                    } else if (Array.isArray(json)) {
                        data = json.slice(0, 20).map((item: Record<string, unknown>, index: number) => ({
                            name: String(item[config.nameKey || 'name'] || `Item ${index + 1}`),
                            value: Number(item[config.dataKey || 'value']) || 0
                        }))
                    }
                }

                setChartData(data)
            } catch (err) {
                setError('Failed to load chart data')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [resourceUrl, config.nameKey, config.dataKey])

    const renderChart = () => {
        if (chartData.length === 0) return null

        const ChartComponent = {
            line: RechartsLine,
            pie: RechartsPie,
            area: RechartsArea,
            bar: RechartsBar
        }[config.chartType] || RechartsBar

        if (config.chartType === 'pie') {
            return (
                <RechartsPie data={chartData}>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    {config.showLegend && <Legend />}
                </RechartsPie>
            )
        }

        return (
            <RechartsBar data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {config.showLegend && <Legend />}
                <Bar dataKey="value" fill="#6366F1">
                    {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </RechartsBar>
        )
    }

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-dark-bg rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-dark-bg rounded-xl text-error">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>{error}</span>
            </div>
        )
    }

    return (
        <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden bg-white dark:bg-dark-surface my-4">
            {config.title && (
                <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm text-text dark:text-dark-text">
                            {config.title}
                        </span>
                    </div>
                </div>
            )}
            <div className="p-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    )
}
