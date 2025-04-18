"use client"

import { useState } from "react"
import { LyricsInput } from "../music-dashboard/components/lyrics-input"
import { ParameterTabs } from "../music-dashboard/components/parameter-tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Music } from "lucide-react"

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

// Initial data for parameters
export const GENRES = [
  "Folk",
  "Pop",
  "Rock",
  "Chinese Style",
  "Hip Hop/Rap",
  "R&B/Soul",
  "Punk",
  "Electronic",
  "Jazz",
  "Reggae",
  "DJ",
  "Pop Punk",
  "Disco",
  "Future Bass",
  "Pop Rap",
  "Trap Rap",
  "R&B Rap",
  "Chinoiserie Electronic",
  "GuFeng Music",
  "Pop Rock",
  "Jazz Pop",
  "Bossa Nova",
  "Contemporary R&B",
]

export const MOODS = [
  "Happy",
  "Dynamic/Energetic",
  "Sentimental/Melancholic/Lonely",
  "Inspirational/Hopeful",
  "Nostalgic/Memory",
  "Excited",
  "Sorrow/Sad",
  "Chill",
  "Romantic",
  "Miss",
  "Groovy/Funky",
  "Dreamy/Ethereal",
  "Calm/Relaxing",
]

export const TIMBRES = [
  "Warm",
  "Bright",
  "Husky",
  "Electrified voice",
  "Sweet_AUDIO_TIMBRE",
  "Cute_AUDIO_TIMBRE",
  "Loud and sonorous",
  "Powerful",
  "Sexy/Lazy",
]

export default function MusicDashboard() {
  const [musicParams, setMusicParams] = useState<MusicParams>({
    type: "vocal",
    lyrics: "",
    gender: null,
    duration: 120,
    genreProportions: GENRES.map((name) => ({ name, value: 0 })),
    moodProportions: MOODS.map((name) => ({ name, value: 0 })),
    timbreProportions: TIMBRES.map((name) => ({ name, value: 0 })),
  })

  const [isGenerating, setIsGenerating] = useState(false)

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
      const apiData = {
        type: musicParams.type,
        lyrics: musicParams.lyrics,
        gender: musicParams.gender || undefined,
        duration: musicParams.duration,
        // Convert proportions to API format - this would depend on how your API expects the data
        genre: formatProportionsForApi(musicParams.genreProportions),
        mood: formatProportionsForApi(musicParams.moodProportions),
        timbre: formatProportionsForApi(musicParams.timbreProportions),
      }

      console.log("API Data to submit:", apiData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      alert("Music generation request submitted successfully!")
    } catch (error) {
      console.error("Error generating music:", error)
      alert("Error generating music. Please try again.")
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
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-[#00ffaa]">The Push Collective</h1>
        <p className="text-[#b388ff] text-lg">Music Creation Studio</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none bg-[#2a0f4c] shadow-lg shadow-[#4a1f7c]/20">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Lyrics Editor</CardTitle>
            <CardDescription className="text-[#b388ff]">Write your lyrics (max 2000 characters)</CardDescription>
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
              Generating Music...
            </>
          ) : (
            <>
              <Music className="mr-2 h-6 w-6" />
              Generate Music
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
