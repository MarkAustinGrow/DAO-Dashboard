"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface FuturisticDialProps {
  value: number
  onChange: (value: number) => void
  inputValue: string
  onInputChange: (value: string) => void
  size?: number
}

export function FuturisticDial({ value, onChange, inputValue, onInputChange, size = 120 }: FuturisticDialProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dialRef = useRef<SVGSVGElement>(null)
  const startAngleRef = useRef(0)
  const startValueRef = useRef(0)
  
  // Generate a unique ID for this dial instance to avoid gradient ID conflicts
  const uniqueId = useRef(`dial-${Math.random().toString(36).substring(2, 9)}`);

  // Constants for the dial
  const strokeWidth = 8
  const radius = size / 2 - strokeWidth
  const centerX = size / 2
  const centerY = size / 2
  // Increase the center circle size
  const centerCircleRadius = radius * 0.4 // Increased from 0.3 to 0.4

  // Convert value (0-100) to angle (0-270 degrees)
  const valueToAngle = (val: number) => {
    // Ensure value is a valid number and clamp between 0-100
    const safeVal = isNaN(val) || val === null || val === undefined ? 0 : Math.max(0, Math.min(100, val));
    return (safeVal / 100) * 270 - 135;
  }

  // Convert angle to value
  const angleToValue = (angle: number) => {
    // Normalize angle to 0-270 range
    const normalizedAngle = angle + 135
    // Convert to value and clamp between 0-100
    return Math.max(0, Math.min(100, Math.round((normalizedAngle / 270) * 100)))
  }

  // Calculate coordinates for a point on the circle at a given angle
  const getPointOnCircle = (angle: number) => {
    // Ensure angle is a valid number
    const safeAngle = isNaN(angle) ? 0 : angle;
    
    const radians = (safeAngle * Math.PI) / 180
    const x = centerX + radius * Math.cos(radians);
    const y = centerY + radius * Math.sin(radians);
    
    // Ensure coordinates are valid numbers
    return {
      x: isNaN(x) ? centerX : x,
      y: isNaN(y) ? centerY : y,
    }
  }

  // Calculate the SVG arc path
  const getArcPath = (value: number) => {
    // Ensure value is a valid number and clamp between 0-100
    const safeValue = isNaN(value) || value === null || value === undefined ? 
                      0 : Math.max(0, Math.min(100, value));
    
    // If value is 0, return empty path
    if (safeValue === 0) return ""
    
    const startAngle = -135 // Start at -135 degrees (bottom left)
    const endAngle = valueToAngle(safeValue)

    const start = getPointOnCircle(startAngle)
    const end = getPointOnCircle(endAngle)

    // Determine if the arc should be drawn the long way around
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    // Ensure radius is a valid number
    const validRadius = isNaN(radius) ? 0 : radius;
    
    return `M ${start.x} ${start.y} A ${validRadius} ${validRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
  }

  // Simplified direct value setting function
  const setDialValue = (newValue: number) => {
    // Ensure value is between 0 and 100
    newValue = Math.max(0, Math.min(100, Math.round(newValue)));
    
    // Only update if the value has actually changed
    if (newValue !== value) {
      console.log(`Dial: Setting value from ${value}% to ${newValue}%`);
      onChange(newValue);
    }
  };
  
  // Handle mouse/touch events for dragging
  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent default browser behavior
    e.preventDefault();
    
    // Store the current value before we start dragging
    startValueRef.current = value;
    
    // Calculate the current angle based on pointer position
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    startAngleRef.current = Math.atan2(y, x) * (180 / Math.PI);
    
    // Set dragging state
    setIsDragging(true);

    // Capture pointer to track movement even outside the element
    if (dialRef.current) {
      try {
        dialRef.current.setPointerCapture(e.pointerId);
      } catch (err) {
        console.error("Error capturing pointer:", err);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate the current angle based on pointer position
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const currentAngle = Math.atan2(y, x) * (180 / Math.PI);

    // Calculate the angle difference
    let angleDiff = currentAngle - startAngleRef.current;

    // Handle angle wrapping
    if (angleDiff > 180) angleDiff -= 360;
    if (angleDiff < -180) angleDiff += 360;

    // Add a small threshold to reduce sensitivity to tiny movements
    if (Math.abs(angleDiff) < 2) return;

    // Calculate the new value based on the angle difference
    const angleRange = 270; // Total angle range of the dial
    const valueDiff = (angleDiff / angleRange) * 100;
    
    // Calculate new value
    const newValue = startValueRef.current + valueDiff;
    
    // Set the new value
    setDialValue(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    // Release pointer capture
    if (dialRef.current) {
      try {
        dialRef.current.releasePointerCapture(e.pointerId);
      } catch (err) {
        console.error("Error releasing pointer:", err);
      }
    }
    
    // End dragging state
    setIsDragging(false);
  };
  
  // Handle click on the dial (for direct value setting)
  const handleClick = (e: React.MouseEvent) => {
    // Don't process click if we were just dragging
    if (isDragging) return;
    
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    // Calculate angle from center to click point
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const clickAngle = Math.atan2(y, x) * (180 / Math.PI);
    
    // Convert angle to value
    const newValue = angleToValue(clickAngle);
    
    // Set the new value
    setDialValue(newValue);
  };

  // Clean up event listeners
  useEffect(() => {
    const handleWindowPointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("pointerup", handleWindowPointerUp)
    return () => {
      window.removeEventListener("pointerup", handleWindowPointerUp)
    }
  }, [])

  // Calculate the position of the handle
  const handleAngle = valueToAngle(value)
  const handlePosition = getPointOnCircle(handleAngle)

  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="relative">
        <svg
          ref={dialRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`cursor-pointer ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={handleClick}
        >
          {/* Background track */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#4a1f7c"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray="4 2"
            className="opacity-60"
          />

          {/* Value arc */}
          <path
            d={getArcPath(value)}
            fill="none"
            stroke={`url(#${uniqueId.current})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_3px_rgba(0,255,170,0.8)]"
          />

          {/* Gradient definition with unique ID */}
          <defs>
            <linearGradient id={uniqueId.current} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffaa" />
              <stop offset="100%" stopColor="#d600ff" />
            </linearGradient>
          </defs>

          {/* Center circle - increased size */}
          <circle
            cx={centerX}
            cy={centerY}
            r={centerCircleRadius}
            fill="#3a1a5c"
            stroke="#00ffaa"
            strokeWidth={2}
            className="filter drop-shadow-[0_0_5px_rgba(0,255,170,0.5)]"
          />

          {/* Handle */}
          <circle
            cx={isNaN(handlePosition.x) ? centerX : handlePosition.x}
            cy={isNaN(handlePosition.y) ? centerY : handlePosition.y}
            r={isNaN(strokeWidth) ? 4 : strokeWidth}
            fill="#ffffff"
            className="filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          />

          {/* Value text - adjusted font size */}
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#00ffaa"
            fontSize={isNaN(radius) ? 14 : radius * 0.25} // Slightly smaller font to fit in the circle
            fontWeight="bold"
            className="select-none"
          >
            {isNaN(value) ? 0 : value}%
          </text>
        </svg>

        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, rgba(0,255,170,${isNaN(value) ? 0 : value / 300}) 0%, rgba(30,30,46,0) 70%)`,
          }}
        />
      </div>

      {/* Number input with direct value setting */}
      <div className="flex items-center">
        <button 
          onClick={() => setDialValue(Math.max(0, value - 1))}
          className="w-6 h-6 flex items-center justify-center bg-[#3a1a5c] border border-[#4a1f7c] text-[#00ffaa] rounded-l-sm"
        >
          -
        </button>
        <Input
          type="number"
          min="0"
          max="100"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-12 h-7 text-sm text-center bg-[#3a1a5c] border-[#4a1f7c] text-[#00ffaa] rounded-none"
        />
        <button 
          onClick={() => setDialValue(Math.min(100, value + 1))}
          className="w-6 h-6 flex items-center justify-center bg-[#3a1a5c] border border-[#4a1f7c] text-[#00ffaa] rounded-r-sm"
        >
          +
        </button>
      </div>
    </div>
  )
}
