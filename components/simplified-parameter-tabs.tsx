"use client"

import React, { useState } from "react"

// Define the types we need
export type MusicType = "vocal" | "bgm"
export type Gender = "Female" | "Male" | null

export interface ProportionalValue {
  name: string
  value: number
}

export interface MusicParams {
  type: MusicType
  lyrics: string
  gender: Gender
  duration: number
  genreProportions: ProportionalValue[]
  moodProportions: ProportionalValue[]
  timbreProportions: ProportionalValue[]
}

interface SimplifiedParameterTabsProps {
  musicParams: MusicParams
  onTypeChange: (type: MusicType) => void
  onGenderChange: (gender: Gender) => void
  onDurationChange: (duration: number) => void
  onGenreChange: (proportions: ProportionalValue[]) => void
  onMoodChange: (proportions: ProportionalValue[]) => void
  onTimbreChange: (proportions: ProportionalValue[]) => void
}

export function SimplifiedParameterTabs({
  musicParams,
  onTypeChange,
  onGenderChange,
  onDurationChange,
  onGenreChange,
  onMoodChange,
  onTimbreChange,
}: SimplifiedParameterTabsProps) {
  const [activeTab, setActiveTab] = useState("basic")

  // Function to handle genre value changes
  const handleGenreChange = (name: string, value: number) => {
    const newProportions = musicParams.genreProportions.map(item => 
      item.name === name ? { ...item, value } : item
    )
    onGenreChange(newProportions)
  }

  // Function to handle mood value changes
  const handleMoodChange = (name: string, value: number) => {
    const newProportions = musicParams.moodProportions.map(item => 
      item.name === name ? { ...item, value } : item
    )
    onMoodChange(newProportions)
  }

  // Function to handle timbre value changes
  const handleTimbreChange = (name: string, value: number) => {
    const newProportions = musicParams.timbreProportions.map(item => 
      item.name === name ? { ...item, value } : item
    )
    onTimbreChange(newProportions)
  }

  return (
    <div className="w-full bg-[#2a0f4c] rounded-lg overflow-hidden shadow-lg">
      {/* Tabs Navigation */}
      <div className="flex border-b border-[#4a1f7c]">
        {["basic", "genre", "mood", "timbre", "summary"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "bg-[#4a1f7c] text-[#00ffaa]"
                : "text-[#b388ff] hover:bg-[#3a1a5c]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Basic Parameters Tab */}
      {activeTab === "basic" && (
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ffaa]">Basic Parameters</h3>
          <p className="text-[#b388ff] mb-4">Configure the fundamental aspects of your music</p>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[#00ffaa] font-medium">Music Type</label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={musicParams.type === "vocal"}
                    onChange={() => onTypeChange("vocal")}
                    className="w-4 h-4 text-[#00ffaa]"
                  />
                  <span className="text-white">Vocal</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={musicParams.type === "bgm"}
                    onChange={() => onTypeChange("bgm")}
                    className="w-4 h-4 text-[#00ffaa]"
                  />
                  <span className="text-white">Background Music</span>
                </label>
              </div>
            </div>

            {musicParams.type === "vocal" && (
              <div className="space-y-2">
                <label className="block text-[#00ffaa] font-medium">Gender</label>
                <select
                  value={musicParams.gender || "auto"}
                  onChange={(e) => onGenderChange(e.target.value === "auto" ? null : (e.target.value as Gender))}
                  className="w-full p-2 bg-[#3a1a5c] border border-[#4a1f7c] rounded text-white"
                >
                  <option value="auto" className="text-[#b388ff]">Auto-detect</option>
                  <option value="Female" className="text-[#b388ff]">Female</option>
                  <option value="Male" className="text-[#b388ff]">Male</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="block text-[#00ffaa] font-medium">Duration: {musicParams.duration} seconds</label>
                <span className="text-sm text-[#b388ff]">(30-240 seconds)</span>
              </div>
              <input
                type="range"
                min={30}
                max={240}
                step={1}
                value={musicParams.duration}
                onChange={(e) => onDurationChange(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Genre Tab */}
      {activeTab === "genre" && (
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ffaa]">Genre Proportions</h3>
          <p className="text-[#b388ff] mb-4">Set the proportion of each genre in your music</p>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {musicParams.genreProportions.map((genre) => (
              <div key={genre.name} className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-white">{genre.name}</label>
                  <span className="text-[#b388ff]">{genre.value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={genre.value}
                  onChange={(e) => handleGenreChange(genre.name, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood Tab */}
      {activeTab === "mood" && (
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ffaa]">Mood Proportions</h3>
          <p className="text-[#b388ff] mb-4">Set the proportion of each mood in your music</p>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {musicParams.moodProportions.map((mood) => (
              <div key={mood.name} className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-white">{mood.name}</label>
                  <span className="text-[#b388ff]">{mood.value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={mood.value}
                  onChange={(e) => handleMoodChange(mood.name, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timbre Tab */}
      {activeTab === "timbre" && (
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ffaa]">Timbre Proportions</h3>
          <p className="text-[#b388ff] mb-4">Set the proportion of each timbre in your music</p>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {musicParams.timbreProportions.map((timbre) => (
              <div key={timbre.name} className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-white">{timbre.name}</label>
                  <span className="text-[#b388ff]">{timbre.value}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={timbre.value}
                  onChange={(e) => handleTimbreChange(timbre.name, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-[#00ffaa]">Parameter Summary</h3>
          <p className="text-[#b388ff] mb-4">Review your configured parameters</p>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium mb-2 text-[#00ffaa]">Basic Parameters</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#3a1a5c] p-3 rounded-md">
                  <span className="text-[#b388ff] block text-sm">Type:</span>
                  <span className="font-medium text-white">
                    {musicParams.type === "vocal" ? "Vocal" : "Background Music"}
                  </span>
                </div>
                {musicParams.type === "vocal" && (
                  <div className="bg-[#3a1a5c] p-3 rounded-md">
                    <span className="text-[#b388ff] block text-sm">Gender:</span>
                    <span className="font-medium text-white">{musicParams.gender || "Auto-detect"}</span>
                  </div>
                )}
                <div className="bg-[#3a1a5c] p-3 rounded-md">
                  <span className="text-[#b388ff] block text-sm">Duration:</span>
                  <span className="font-medium text-white">{musicParams.duration} seconds</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium mb-2 text-[#00ffaa]">Selected Characteristics</h4>
              <div className="space-y-4">
                <SummarySection title="Genre" proportions={musicParams.genreProportions.filter((p) => p.value > 0)} />
                <SummarySection title="Mood" proportions={musicParams.moodProportions.filter((p) => p.value > 0)} />
                <SummarySection title="Timbre" proportions={musicParams.timbreProportions.filter((p) => p.value > 0)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SummarySectionProps {
  title: string
  proportions: ProportionalValue[]
}

function SummarySection({ title, proportions }: SummarySectionProps) {
  if (proportions.length === 0) {
    return (
      <div>
        <h4 className="font-medium text-white">{title}</h4>
        <p className="text-[#b388ff] text-sm">No {title.toLowerCase()} proportions set (will auto-detect)</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="font-medium text-white">{title}</h4>
      <div className="mt-2 space-y-2">
        {proportions.map((prop) => (
          <div key={prop.name} className="flex items-center">
            <div className="w-1/3 text-sm truncate text-white" title={prop.name}>
              {prop.name}
            </div>
            <div className="w-2/3 flex items-center gap-2">
              <div 
                className="h-2 bg-[#00ffaa] rounded-full" 
                style={{ width: `${Math.min(100, prop.value)}%` }} 
              />
              <span className="text-sm text-[#b388ff]">{prop.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
