"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ProportionalValue } from "./music-dashboard"
import { Search } from "lucide-react"
import { VerticalSlider } from "./vertical-slider"

interface ProportionalSlidersProps {
  values: ProportionalValue[]
  onChange: (values: ProportionalValue[]) => void
  maxTotal?: number
}

export function ProportionalSliders({ values, onChange, maxTotal = 100 }: ProportionalSlidersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTotal, setCurrentTotal] = useState(0)

  // Calculate the current total whenever values change
  useEffect(() => {
    const total = values.reduce((sum, item) => sum + item.value, 0)
    setCurrentTotal(total)
  }, [values])

  // Filter values based on search term
  const filteredValues = values.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle slider change for a specific item
  const handleSliderChange = (index: number, newValue: number) => {
    const updatedValues = [...values]

    // Calculate how much we're changing the value by
    const delta = newValue - updatedValues[index].value

    // If adding this would exceed maxTotal, adjust the value
    if (currentTotal + delta > maxTotal) {
      newValue = updatedValues[index].value + (maxTotal - currentTotal)
    }

    updatedValues[index] = { ...updatedValues[index], value: newValue }
    onChange(updatedValues)
  }

  // Handle direct input change for a specific item
  const handleInputChange = (index: number, newValue: string) => {
    const numValue = Number.parseInt(newValue) || 0
    handleSliderChange(index, Math.max(0, Math.min(100, numValue)))
  }

  // Reset all values to zero
  const handleResetAll = () => {
    const resetValues = values.map((item) => ({ ...item, value: 0 }))
    onChange(resetValues)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleResetAll} disabled={currentTotal === 0}>
          Reset All
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Total: {currentTotal}%</span>
        <span className="text-sm text-slate-400">
          {currentTotal < maxTotal ? `${maxTotal - currentTotal}% remaining` : "Maximum reached"}
        </span>
      </div>

      {filteredValues.length === 0 ? (
        <p className="text-center text-slate-400 py-4">No matching parameters found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[60vh] overflow-y-auto py-4 pr-2">
          {filteredValues.map((item, index) => {
            const originalIndex = values.findIndex((v) => v.name === item.name)
            return (
              <div key={item.name} className="flex flex-col items-center space-y-2">
                <div className="text-center w-full truncate text-sm font-medium" title={item.name}>
                  {item.name}
                </div>
                <div className="h-48 flex flex-col items-center justify-between">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.value}
                    onChange={(e) => handleInputChange(originalIndex, e.target.value)}
                    className="w-14 h-7 text-sm text-center mb-2"
                  />
                  <div className="relative h-36 flex items-center">
                    <VerticalSlider
                      value={[item.value]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleSliderChange(originalIndex, value[0])}
                    />
                    <div
                      className="absolute bottom-0 w-2 bg-gradient-to-t from-purple-600 to-pink-600 rounded-t-full"
                      style={{ height: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">0%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
