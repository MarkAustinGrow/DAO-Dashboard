"use client"

import * as React from "react"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

// Simplified RadioGroup component that doesn't rely on @radix-ui
interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, defaultValue, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    
    const contextValue = React.useMemo(() => ({
      value: value !== undefined ? value : internalValue,
      onValueChange: (newValue: string) => {
        if (onValueChange) {
          onValueChange(newValue)
        } else {
          setInternalValue(newValue)
        }
      }
    }), [value, internalValue, onValueChange])

    return (
      <RadioGroupContext.Provider value={contextValue}>
        <div ref={ref} className={cn("grid gap-2", className)} {...props} />
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext)
    const checked = value === groupValue
    const itemId = id || `radio-${value}`

    return (
      <div className="flex items-center">
        <input
          type="radio"
          id={itemId}
          ref={ref}
          checked={checked}
          value={value}
          onChange={() => onValueChange?.(value)}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={itemId}
          className={cn(
            "relative flex h-4 w-4 cursor-pointer rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          {checked && (
            <div className="flex items-center justify-center">
              <Circle className="h-2.5 w-2.5 fill-current text-current" />
            </div>
          )}
        </label>
      </div>
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
