"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ProportionalValue } from "./music-dashboard"
import { Search } from "lucide-react"
import { FuturisticDial } from "./futuristic-dial"

interface ProportionalDialsProps {
  values: ProportionalValue[]
  onChange: (values: ProportionalValue[]) => void
  maxTotal?: number
}

export function ProportionalDials({ values, onChange, maxTotal = 300 }: ProportionalDialsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTotal, setCurrentTotal] = useState(0)

  // Calculate the current total whenever values change
  useEffect(() => {
    // Calculate the total of all values
    const total = values.reduce((sum, item) => {
      // Ensure we're adding a valid number
      const value = isNaN(item.value) ? 0 : item.value;
      return sum + value;
    }, 0);
    
    // Only update the total if it's different to avoid unnecessary re-renders
    if (total !== currentTotal) {
      console.log(`Total calculated: ${total}%`);
      setCurrentTotal(total);
    }
    
    // We'll handle scaling in a separate effect to avoid infinite loops
  }, [values, currentTotal]);
  
  // We're keeping track of isScalingRef but not using it for auto-scaling anymore
  const isScalingRef = useRef(false);
  
  // We've removed the auto-scaling effect to allow values to exceed 100% total

  // Filter values based on search term
  const filteredValues = values.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Handle dial change for a specific item
  const handleDialChange = (index: number, newValue: number) => {
    // Ensure index is valid
    if (index < 0 || index >= values.length) {
      console.error(`Invalid index: ${index}`);
      return;
    }
    
    // Ensure newValue is a valid number
    if (isNaN(newValue)) {
      console.error(`Invalid value: ${newValue}`);
      return;
    }
    
    // Skip if we're already scaling to avoid conflicts
    if (isScalingRef.current) {
      console.log("Skipping dial change during scaling operation");
      return;
    }
    
    // Create a deep copy of the values array to avoid reference issues
    const updatedValues = values.map(item => ({ ...item }));
    const oldValue = updatedValues[index].value;
    
    // If no change, return early
    if (newValue === oldValue) return;
    
    // Ensure value is between 0 and 100
    newValue = Math.max(0, Math.min(100, newValue));
    
    // Log the change for debugging
    console.log(`Changing ${updatedValues[index].name} from ${oldValue} to ${newValue}`);
    
    // Update the value
    updatedValues[index] = { ...updatedValues[index], value: newValue };
    
    // Use a timeout to ensure React has time to process state updates
    setTimeout(() => {
      onChange(updatedValues);
    }, 0);
  }

  // Handle direct input change for a specific item
  const handleInputChange = (index: number, newValue: string) => {
    // Parse the input value, defaulting to 0 if invalid
    const numValue = parseInt(newValue);
    
    // Only proceed if we have a valid number or empty string
    if (!isNaN(numValue) || newValue === '') {
      handleDialChange(index, numValue || 0);
    }
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
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#b388ff]" />
          <Input
            type="text"
            placeholder="Search parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#3a1a5c] border-[#4a1f7c] text-white placeholder:text-[#b388ff]/70"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          disabled={currentTotal === 0}
          className="border-[#00ffaa] text-[#00ffaa] hover:bg-[#00ffaa]/10"
        >
          Reset All
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-white">
          Total: <span className="text-[#00ffaa]">{currentTotal}%</span>
        </span>
        <span className="text-sm text-[#b388ff]">
          Each dial can be set independently from 0-100%
        </span>
      </div>

      {filteredValues.length === 0 ? (
        <p className="text-center text-[#b388ff] py-4">No matching parameters found</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 max-h-[60vh] overflow-y-auto py-4 pr-2">
          {filteredValues.map((item, filteredIndex) => {
            // Find the original index in the values array by name only
            // Store the name in a variable for clarity
            const itemName = item.name;
            
            // First try to find by exact name match
            const originalIndex = values.findIndex(v => v.name === itemName);
            
            // If not found (shouldn't happen), skip this item
            if (originalIndex === -1) {
              console.error(`Could not find original index for item: ${itemName}, skipping`);
              return null;
            }
            
            // Get the current value from the values array to ensure consistency
            const currentValue = values[originalIndex].value;
            
            return (
              <div
                key={`${item.name}-${originalIndex}`}
                className="flex flex-col items-center space-y-3 bg-[#3a1a5c]/50 p-4 rounded-lg border border-[#4a1f7c]"
              >
                <div className="text-center w-full truncate text-sm font-medium text-white" title={item.name}>
                  {item.name}
                </div>
                <FuturisticDial
                  value={currentValue}
                  onChange={(value) => handleDialChange(originalIndex, value)}
                  inputValue={currentValue.toString()}
                  onInputChange={(value) => handleInputChange(originalIndex, value)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
