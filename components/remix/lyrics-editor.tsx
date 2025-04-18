'use client';

import { useState } from 'react';

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LyricsEditor({ value, onChange }: LyricsEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Enter your lyrics here..."
        className={`w-full h-40 p-3 bg-[#3a1a5c] border rounded text-white placeholder:text-[#b388ff]/50 focus:outline-none transition-all duration-200 ${
          isFocused 
            ? "border-[#00ffaa] shadow-[0_0_10px_rgba(0,255,170,0.3)]" 
            : "border-[#4a1f7c]"
        }`}
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
  );
}
