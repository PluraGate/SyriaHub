'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SchemaItem } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface RegistrySelectProps {
    registryId: string
    value?: string | string[]
    onChange: (value: string | string[]) => void
    multiple?: boolean
    placeholder?: string
}

export function RegistrySelect({ registryId, value, onChange, multiple, placeholder }: RegistrySelectProps) {
    const [items, setItems] = useState<SchemaItem[]>([])
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function loadItems() {
            setLoading(true)
            const { data, error } = await supabase
                .from('schema_items')
                .select('*')
                .eq('registry_id', registryId)
                .order('sort_order', { ascending: true })

            if (!error && data) {
                setItems(data)
            }
            setLoading(false)
        }

        if (registryId) {
            loadItems()
        }
    }, [registryId, supabase])

    if (loading) return <div className="h-10 w-full animate-pulse bg-gray-100 rounded-md" />

    // MULTI-SELECT (using Popover + Command for better UX)
    if (multiple) {
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : [])

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-[2.5rem]"
                    >
                        <div className="flex flex-wrap gap-1">
                            {selectedValues.length > 0 ? (
                                selectedValues.map((val) => {
                                    const item = items.find((i) => i.item_key === val || i.id === val)
                                    return (
                                        <span key={val} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                                            {item?.display_name || val}
                                        </span>
                                    )
                                })
                            ) : (
                                <span className="text-muted-foreground">{placeholder || 'Select items...'}</span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                    <Command>
                        <CommandInput placeholder="Search items..." />
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.display_name} // Command searches by this
                                    onSelect={() => {
                                        const newVal = item.item_key
                                        const newValues = selectedValues.includes(newVal)
                                            ? selectedValues.filter((v) => v !== newVal)
                                            : [...selectedValues, newVal]
                                        onChange(newValues)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValues.includes(item.item_key) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.display_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    // SINGLE SELECT
    return (
        <Select value={value as string} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder={placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.item_key}>
                        {item.display_name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
