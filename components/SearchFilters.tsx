'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function SearchFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    const handleFilterChange = (name: string, value: string) => {
        router.push(`/search?${createQueryString(name, value)}`)
    }

    const currentType = searchParams.get('type') || ''
    const currentDate = searchParams.get('date') || ''

    return (
        <div className="space-y-6">
            {/* Type Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Type
                </h3>
                <div className="space-y-2">
                    {['', 'post', 'group', 'user'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="type"
                                value={type}
                                checked={currentType === type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="capitalize text-sm">
                                {type || 'All'}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Date Filter */}
            <div>
                <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Date
                </h3>
                <div className="space-y-2">
                    {[
                        { value: '', label: 'Any time' },
                        { value: 'today', label: 'Past 24 hours' },
                        { value: 'week', label: 'Past week' },
                        { value: 'month', label: 'Past month' },
                        { value: 'year', label: 'Past year' },
                    ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="date"
                                value={option.value}
                                checked={currentDate === option.value}
                                onChange={(e) => handleFilterChange('date', e.target.value)}
                                className="text-primary focus:ring-primary"
                            />
                            <span className="text-sm">
                                {option.label}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}
