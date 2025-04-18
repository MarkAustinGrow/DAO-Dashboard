"use client"

import { useState } from "react"
import { SimplifiedLyricsInput } from "./simplified-lyrics-input"
import { SimplifiedParameterTabs, MusicType, Gender, ProportionalValue, MusicParams } from "./simplified-parameter-tabs"

// Re-export the types for convenience
export type { MusicType, Gender, ProportionalValue, MusicParams }

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

export default function SimplifiedMusicDashboard() {
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
        <div className="bg-[#2a0f4c] rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-2 text-[#00ffaa]">Lyrics Editor</h2>
          <p className="text-[#b388ff] mb-4">Write your lyrics (max 2000 characters)</p>
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
              Generating Music...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Generate Music
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
