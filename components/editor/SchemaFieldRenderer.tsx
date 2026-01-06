'use client'

import { useState, useEffect } from 'react'
import { SchemaFieldVersion } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RegistrySelect } from './RegistrySelect'
import { cn } from '@/lib/utils'

interface SchemaFieldRendererProps {
    fields: SchemaFieldVersion[]
    values: Record<string, any>
    onChange: (fieldId: string, value: any) => void
    errors?: Record<string, string>
}

export function SchemaFieldRenderer({ fields, values, onChange, errors }: SchemaFieldRendererProps) {
    if (fields.length === 0) return null

    return (
        <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-dark-border">
            <h3 className="text-sm font-semibold text-text-light dark:text-dark-text-muted uppercase tracking-wider">
                Additional Details
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
                {fields.map((field) => {
                    return (
                        <div key={field.id} className={cn(
                            "space-y-2",
                            // Full width for certain types
                            ['rich_text', 'json', 'multiselect', 'registry_ref_multi', 'geo_polygon'].includes(field.field_type) ? "md:col-span-2" : ""
                        )}>
                            <div className="flex items-center gap-2">
                                <Label className="text-sm font-medium text-text dark:text-dark-text">
                                    {field.display_name}
                                </Label>
                                {field.is_required && (
                                    <span className="text-accent text-xs">*</span>
                                )}
                            </div>

                            {field.description && (
                                <p className="text-xs text-text-light dark:text-dark-text-muted">
                                    {field.description}
                                </p>
                            )}

                            <FieldInput
                                field={field}
                                value={values[field.field_id]}
                                onChange={(val) => onChange(field.field_id, val)}
                            />

                            {errors?.[field.field_id] && (
                                <p className="text-sm text-accent">
                                    {errors[field.field_id]}
                                </p>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function FieldInput({ field, value, onChange }: { field: SchemaFieldVersion, value: any, onChange: (val: any) => void }) {
    switch (field.field_type) {
        case 'text':
        case 'url':
        case 'file': // simplified for now
            return (
                <Input
                    type={field.field_type === 'url' ? 'url' : 'text'}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.display_name}
                />
            )

        case 'number':
            return (
                <Input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            )

        case 'boolean':
            return (
                <div className="flex items-center gap-2">
                    <Switch
                        checked={!!value}
                        onCheckedChange={onChange}
                    />
                    <span className="text-sm text-text-light">
                        {value ? 'Yes' : 'No'}
                    </span>
                </div>
            )

        case 'date':
        case 'datetime':
            return (
                <Input
                    type={field.field_type === 'datetime' ? 'datetime-local' : 'date'}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            )

        case 'rich_text':
            return (
                <Textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="min-h-[100px]"
                />
            )

        case 'registry_ref':
        case 'registry_ref_multi':
            if (!field.registry_id) return <p className="text-xs text-red-500">Missing registry configuration</p>
            return (
                <RegistrySelect
                    registryId={field.registry_id}
                    value={value}
                    onChange={onChange}
                    multiple={field.field_type === 'registry_ref_multi'}
                />
            )

        case 'select':
            const selectOptions = (field.constraints as any)?.options || []
            return (
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="select-input"
                >
                    <option value="">Select an option...</option>
                    {selectOptions.map((opt: any) => {
                        const optionValue = typeof opt === 'string' ? opt : opt.value
                        const optionLabel = typeof opt === 'string' ? opt : opt.label
                        return (
                            <option key={optionValue} value={optionValue}>{optionLabel}</option>
                        )
                    })}
                </select>
            )

        case 'multiselect':
            const multiOptions = (field.constraints as any)?.options || []
            const selectedValues = Array.isArray(value) ? value : []
            return (
                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {multiOptions.map((opt: any) => {
                            const optionValue = typeof opt === 'string' ? opt : opt.value
                            const optionLabel = typeof opt === 'string' ? opt : opt.label
                            const isSelected = selectedValues.includes(optionValue)
                            return (
                                <button
                                    key={optionValue}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            onChange(selectedValues.filter((v: string) => v !== optionValue))
                                        } else {
                                            onChange([...selectedValues, optionValue])
                                        }
                                    }}
                                    className={cn(
                                        "px-3 py-1.5 rounded-full text-sm border transition-colors",
                                        isSelected
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-text dark:text-dark-text hover:border-primary"
                                    )}
                                >
                                    {optionLabel}
                                </button>
                            )
                        })}
                    </div>
                    {selectedValues.length > 0 && (
                        <p className="text-xs text-text-light dark:text-dark-text-muted">
                            {selectedValues.length} selected
                        </p>
                    )}
                </div>
            )

        case 'geo_point':
            const pointValue = value || { lat: '', lng: '' }
            return (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-text-light dark:text-dark-text-muted mb-1 block">Latitude</label>
                        <Input
                            type="number"
                            step="any"
                            placeholder="e.g. 33.5138"
                            value={pointValue.lat || ''}
                            onChange={(e) => onChange({ ...pointValue, lat: parseFloat(e.target.value) || '' })}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-text-light dark:text-dark-text-muted mb-1 block">Longitude</label>
                        <Input
                            type="number"
                            step="any"
                            placeholder="e.g. 36.2765"
                            value={pointValue.lng || ''}
                            onChange={(e) => onChange({ ...pointValue, lng: parseFloat(e.target.value) || '' })}
                        />
                    </div>
                </div>
            )

        case 'geo_polygon':
            const polygonValue = typeof value === 'string' ? value : JSON.stringify(value || [], null, 2)
            return (
                <div className="space-y-2">
                    <Textarea
                        value={polygonValue}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value)
                                onChange(parsed)
                            } catch {
                                // Keep as string while user is typing
                                onChange(e.target.value)
                            }
                        }}
                        placeholder='[[lat, lng], [lat, lng], ...]'
                        className="min-h-[80px] font-mono text-sm"
                    />
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        Enter coordinates as JSON array: [[lat1, lng1], [lat2, lng2], ...]
                    </p>
                </div>
            )

        case 'json':
            const jsonValue = typeof value === 'string' ? value : JSON.stringify(value || {}, null, 2)
            return (
                <div className="space-y-2">
                    <Textarea
                        value={jsonValue}
                        onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value)
                                onChange(parsed)
                            } catch {
                                // Keep as string while user is typing
                                onChange(e.target.value)
                            }
                        }}
                        placeholder='{"key": "value"}'
                        className="min-h-[120px] font-mono text-sm"
                    />
                    <p className="text-xs text-text-light dark:text-dark-text-muted">
                        Enter valid JSON data
                    </p>
                </div>
            )

        default:
            return (
                <div className="p-2 border border-dashed rounded text-xs text-gray-500">
                    Unsupported field type: {field.field_type}
                </div>
            )
    }
}
