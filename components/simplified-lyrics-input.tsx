"use client"

import React from "react"

interface SimplifiedLyricsInputProps {
  value: string
  onChange: (value: string) => void
}

export function SimplifiedLyricsInput({ value, onChange }: SimplifiedLyricsInputProps) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your lyrics here..."
        className="w-full h-40 p-3 bg-[#3a1a5c] border border-[#4a1f7c] rounded text-white placeholder:text-[#b388ff]/50 focus:outline-none focus:ring-2 focus:ring-[#00ffaa]/50"
      />
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-[#b388ff]">
          {value.length} / 2000 characters
        </span>
        {value.length > 2000 && (
          <span className="text-red-400">
            Character limit exceeded
          </span>
        )}
      </div>
    </div>
  )
}
