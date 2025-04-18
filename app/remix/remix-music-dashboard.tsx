"use client"

import { useState, useEffect } from "react"
import { LyricsInput } from "../../music-dashboard/components/lyrics-input"
import { ParameterTabs } from "../../music-dashboard/components/parameter-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Loader2, Music } from "lucide-react"
import { 
  MusicType, 
  Gender, 
  ProportionalValue, 
  MusicParams, 
  GENRES, 
  MOODS, 
  TIMBRES 
} from "../../music-dashboard/components/music-dashboard"

interface RemixMusicDashboardProps {
  initialParams: MusicParams
  songTitle: string
  songId?: string
}

export default function RemixMusicDashboard({ initialParams, songTitle, songId }: RemixMusicDashboardProps) {
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

  // Helper function to format proportions for API
  const formatProportionsForApi = (proportions: ProportionalValue[]) => {
    // Filter out zero values and format as needed
    const nonZeroProps = proportions.filter((p) => p.value > 0)
    if (nonZeroProps.length === 0) return undefined

    // This is a placeholder - adjust based on how your API expects the data
    return nonZeroProps.map((p) => `${p.name}:${p.value}`).join(",")
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-none bg-[#2a0f4c] shadow-lg shadow-[#4a1f7c]/20">
        <CardHeader>
          <CardTitle className="text-[#00ffaa]">Lyrics Editor</CardTitle>
          <CardDescription className="text-[#b388ff]">
            Edit lyrics for your remix (max 2000 characters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LyricsInput value={musicParams.lyrics} onChange={handleLyricsChange} />
        </CardContent>
      </Card>

      <ParameterTabs
        musicParams={musicParams}
        onTypeChange={handleTypeChange}
        onGenderChange={handleGenderChange}
        onDurationChange={handleDurationChange}
        onGenreChange={handleGenreChange}
        onMoodChange={handleMoodChange}
        onTimbreChange={handleTimbreChange}
      />

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !musicParams.lyrics}
        className="w-full h-14 text-lg bg-[#d600ff] hover:bg-[#e030ff] text-white shadow-lg shadow-[#d600ff]/20 border-none"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Generating Remix...
          </>
        ) : (
          <>
            <Music className="mr-2 h-6 w-6" />
            Generate Remix
          </>
        )}
      </Button>
    </div>
  )
}
