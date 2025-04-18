"use client"

import { useState, useEffect } from "react"
import { SimplifiedLyricsInput } from "./simplified-lyrics-input"
import { SimplifiedParameterTabs } from "./simplified-parameter-tabs"
import type { MusicType, Gender, ProportionalValue, MusicParams } from "./simplified-music-dashboard"

interface SimplifiedRemixMusicDashboardProps {
  initialParams: MusicParams
  songTitle: string
  songId?: string
}

export default function SimplifiedRemixMusicDashboard({ 
  initialParams, 
  songTitle, 
  songId 
}: SimplifiedRemixMusicDashboardProps) {
  const [musicParams, setMusicParams] = useState<MusicParams>(initialParams)
  const [isGenerating, setIsGenerating] = useState(false)

  // Update musicParams when initialParams change (when a new song is selected)
  useEffect(() => {
    setMusicParams(initialParams)
  }, [initialParams])

  const handleTypeChange = (type: MusicType) => {
    setMusicParams((prev) => ({ ...prev, type }))
  }

  const handleGenderChange = (gender: Gender) => {
    setMusicParams((prev) => ({ ...prev, gender }))
  }

  const handleDurationChange = (duration: number) => {
    setMusicParams((prev) => ({ ...prev, duration }))
  }

  const handleLyricsChange = (lyrics: string) => {
    setMusicParams((prev) => ({ ...prev, lyrics }))
  }

  const handleGenreChange = (genreProportions: ProportionalValue[]) => {
    setMusicParams((prev) => ({ ...prev, genreProportions }))
  }

  const handleMoodChange = (moodProportions: ProportionalValue[]) => {
    setMusicParams((prev) => ({ ...prev, moodProportions }))
  }

  const handleTimbreChange = (timbreProportions: ProportionalValue[]) => {
    setMusicParams((prev) => ({ ...prev, timbreProportions }))
  }

  const handleGenerate = async () => {
    if (!musicParams.lyrics) return

    setIsGenerating(true)

    try {
      // Format the data for API submission
      const requestData = {
        params: {
          // Include all music parameters
          type: musicParams.type,
          lyrics: musicParams.lyrics,
          gender: musicParams.gender || null,
          duration: musicParams.duration,
          genreProportions: musicParams.genreProportions,
          moodProportions: musicParams.moodProportions,
          timbreProportions: musicParams.timbreProportions,
        },
        // Include reference to original song
        originalSongTitle: songTitle,
        originalSongId: songId || null // Pass the original song ID if available
      }

      console.log("Remix data to submit:", requestData)

      // Call the create-remix API endpoint
      const response = await fetch('/api/create-remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create remix')
      }

      console.log("Remix created successfully:", result)
      
      // Show success message
      alert("Remix created successfully! Your new remix has been saved.")
    } catch (error: any) {
      console.error("Error generating remix:", error)
      alert(`Error creating remix: ${error.message || 'Please try again.'}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-[#2a0f4c] rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-[#00ffaa]">Lyrics Editor</h2>
        <p className="text-[#b388ff] mb-4">Edit lyrics for your remix (max 2000 characters)</p>
        <SimplifiedLyricsInput value={musicParams.lyrics} onChange={handleLyricsChange} />
      </div>

      <SimplifiedParameterTabs
        musicParams={musicParams}
        onTypeChange={handleTypeChange}
        onGenderChange={handleGenderChange}
        onDurationChange={handleDurationChange}
        onGenreChange={handleGenreChange}
        onMoodChange={handleMoodChange}
        onTimbreChange={handleTimbreChange}
      />

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !musicParams.lyrics}
        className={`w-full h-14 text-lg rounded-lg font-medium ${
          isGenerating || !musicParams.lyrics
            ? "bg-[#4a1f7c] text-[#b388ff]/50 cursor-not-allowed"
            : "bg-[#d600ff] hover:bg-[#e030ff] text-white shadow-lg shadow-[#d600ff]/20"
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Remix...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Generate Remix
          </span>
        )}
      </button>
    </div>
  )
}
