'use client'

import { ChartBlockDisplay, ChartConfig } from '@/components/ChartBlock'

interface PostChartsProps {
    chartBlocks: ChartConfig[]
    linkedResources: Array<{
        id: string
        metadata?: {
            url?: string
        }
    }>
}

export function PostCharts({ chartBlocks, linkedResources }: PostChartsProps) {
    if (!chartBlocks || chartBlocks.length === 0) {
        return null
    }

    return (
        <div className="space-y-4 my-8">
            {chartBlocks.map((chart, index) => {
                const resource = linkedResources.find(r => r.id === chart.resourceId)
                return (
                    <ChartBlockDisplay
                        key={`chart-${index}`}
                        config={chart}
                        resourceUrl={resource?.metadata?.url}
                    />
                )
            })}
        </div>
    )
}
