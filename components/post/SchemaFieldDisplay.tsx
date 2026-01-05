'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Database, Map, Tag } from 'lucide-react'

export interface SchemaFieldValue {
    value: any
    field: {
        display_name: string
        field_key: string
    }
    version: {
        field_type: string
        registry_id?: string
    }
}

interface SchemaFieldDisplayProps {
    fields: SchemaFieldValue[]
}

export function SchemaFieldDisplay({ fields }: SchemaFieldDisplayProps) {
    const [registryItems, setRegistryItems] = useState<Record<string, string>>({}) // `${registry_id}:${item_key}` -> display_name
    const supabase = createClient()

    // Fetch registry item names for any registry_ref fields
    useEffect(() => {
        const registryFields = fields.filter(f =>
            (f.version.field_type === 'registry_ref' || f.version.field_type === 'registry_ref_multi') &&
            f.version.registry_id &&
            f.value
        )

        if (registryFields.length === 0) return

        async function fetchItems() {
            // Collect all item keys with their registry IDs for accurate lookups
            const keysByRegistry: Record<string, string[]> = {}
            registryFields.forEach(f => {
                const registryId = f.version.registry_id
                if (!registryId) return
                if (!keysByRegistry[registryId]) keysByRegistry[registryId] = []
                if (Array.isArray(f.value)) {
                    keysByRegistry[registryId].push(...f.value)
                } else {
                    keysByRegistry[registryId].push(f.value)
                }
            })

            const allKeys = Object.values(keysByRegistry).flat()
            if (allKeys.length === 0) return

            // Query with registry_id to avoid ambiguous matches
            const registryIds = Object.keys(keysByRegistry)
            const { data } = await supabase
                .from('schema_items')
                .select('item_key, display_name, registry_id')
                .in('item_key', allKeys)
                .in('registry_id', registryIds)

            if (data) {
                const map: Record<string, string> = {}
                data.forEach(item => {
                    // Create composite key to handle same item_key in different registries
                    map[`${item.registry_id}:${item.item_key}`] = item.display_name
                })
                setRegistryItems(prev => ({ ...prev, ...map }))
            }
        }

        fetchItems()
    }, [fields, supabase])

    if (!fields || fields.length === 0) return null

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-200 dark:border-dark-border p-6 font-sans">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-text-light dark:text-dark-text-muted mb-4 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Research Metadata
            </h3>
            <div className="space-y-4">
                {fields.map((field, idx) => (
                    <div key={idx} className="group">
                        <h4 className="text-xs font-medium text-text-light dark:text-dark-text-muted mb-1">
                            {field.field.display_name}
                        </h4>
                        <div className="text-sm text-text dark:text-dark-text font-medium">
                            <FieldValueDisplay
                                field={field}
                                registryItems={registryItems}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function FieldValueDisplay({ field, registryItems }: { field: SchemaFieldValue, registryItems: Record<string, string> }) {
    const { value } = field
    const { field_type } = field.version

    if (value === null || value === undefined) return <span className="text-gray-400 italic">N/A</span>

    if (field_type === 'registry_ref') {
        const registryKey = field.version.registry_id ? `${field.version.registry_id}:${value}` : value
        return <span>{registryItems[registryKey] || value}</span>
    }

    if (field_type === 'registry_ref_multi') {
        const vals = Array.isArray(value) ? value : [value]
        return (
            <div className="flex flex-wrap gap-2">
                {vals.map((v: string) => (
                    <span key={v} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary/10 text-secondary-dark dark:text-secondary-light">
                        {registryItems[field.version.registry_id ? `${field.version.registry_id}:${v}` : v] || v}
                    </span>
                ))}
            </div>
        )
    }

    if (field_type === 'boolean') {
        return <span>{value ? 'Yes' : 'No'}</span>
    }

    if (field_type === 'url') {
        return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate block">
                {value}
            </a>
        )
    }

    if (field_type === 'multiselect') {
        const vals = Array.isArray(value) ? value : [value]
        return (
            <div className="flex flex-wrap gap-2">
                {vals.map((v: string) => (
                    <span key={v} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-secondary/10 text-secondary-dark dark:text-secondary-light">
                        {v}
                    </span>
                ))}
            </div>
        )
    }

    if (field_type === 'rich_text') {
        // Simple render for now, maybe strip html or render safely?
        // Assuming value is plain text or simple markdown from textarea
        return <p className="whitespace-pre-wrap">{value}</p>
    }

    // Default string/number
    return <span>{String(value)}</span>
}
