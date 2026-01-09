'use client'

import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface NumberInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    onChange?: (value: number) => void
    min?: number
    max?: number
    step?: number
    className?: string
}

export function NumberInput({
    value,
    onChange,
    min = 0,
    max,
    step = 1,
    className,
    disabled,
    ...props
}: NumberInputProps) {
    const [internalValue, setInternalValue] = React.useState<string>(
        value?.toString() ?? ""
    )

    React.useEffect(() => {
        setInternalValue(value?.toString() ?? "")
    }, [value])

    const handleCreate = () => {
        const currentValue = parseFloat(internalValue) || 0
        const newValue = currentValue + step
        if (max !== undefined && newValue > max) return
        updateValue(newValue)
    }

    const handleDecrement = () => {
        const currentValue = parseFloat(internalValue) || 0
        const newValue = currentValue - step
        if (min !== undefined && newValue < min) return
        updateValue(newValue)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInternalValue(newValue)

        // Only trigger onChange if it's a valid number
        const numericValue = parseFloat(newValue)
        if (!isNaN(numericValue)) {
            if (onChange) onChange(numericValue)
        }
    }

    const handleBlur = () => {
        let numericValue = parseFloat(internalValue)
        if (isNaN(numericValue)) {
            numericValue = min || 0
        }

        if (max !== undefined && numericValue > max) numericValue = max
        if (min !== undefined && numericValue < min) numericValue = min

        updateValue(numericValue)
    }

    const updateValue = (newValue: number) => {
        // Round to avoid floating point errors with steps like 0.1
        const roundedValue = Math.round(newValue * 100) / 100
        setInternalValue(roundedValue.toString())
        if (onChange) onChange(roundedValue)
    }

    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 bg-transparent"
                onClick={handleDecrement}
                disabled={disabled || (min !== undefined && (parseFloat(internalValue) || 0) <= min)}
            >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
            </Button>
            <Input
                type="number"
                value={internalValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="h-9 w-20 text-center font-medium no-spinner"
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                {...props}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 bg-transparent"
                onClick={handleCreate}
                disabled={disabled || (max !== undefined && (parseFloat(internalValue) || 0) >= max)}
            >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase</span>
            </Button>
        </div>
    )
}
