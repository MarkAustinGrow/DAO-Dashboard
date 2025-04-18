'use client';

import { useState } from 'react';
import type { MusicParams, MusicType, Gender } from '../types';

interface BasicParametersProps {
  params: MusicParams;
  onChange: (params: Partial<MusicParams>) => void;
}

export function BasicParameters({ params, onChange }: BasicParametersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-[#00ffaa] font-medium">Music Type</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={params.type === "vocal"}
              onChange={() => onChange({ type: "vocal" })}
              className="w-4 h-4 text-[#00ffaa]"
            />
            <span className="text-white">Vocal</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={params.type === "bgm"}
              onChange={() => onChange({ type: "bgm" })}
              className="w-4 h-4 text-[#00ffaa]"
            />
            <span className="text-white">Background Music</span>
          </label>
        </div>
      </div>

      {params.type === "vocal" && (
        <div className="space-y-2">
          <label className="block text-[#00ffaa] font-medium">Gender</label>
          <select
            value={params.gender || "auto"}
            onChange={(e) => onChange({ gender: e.target.value === "auto" ? null : (e.target.value as Gender) })}
            className="w-full p-2 bg-[#3a1a5c] border border-[#4a1f7c] rounded text-white"
          >
            <option value="auto">Auto-detect</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="block text-[#00ffaa] font-medium">Duration: {params.duration} seconds</label>
          <span className="text-sm text-[#b388ff]">(30-240 seconds)</span>
        </div>
        <input
          type="range"
          min={30}
          max={240}
          step={1}
          value={params.duration}
          onChange={(e) => onChange({ duration: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
