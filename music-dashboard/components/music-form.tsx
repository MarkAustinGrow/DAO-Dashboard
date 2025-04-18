"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Loader2, Music } from "lucide-react"
import type { MusicParams } from "./music-dashboard"

// Genre options
const GENRES = [
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

// Mood options
const MOODS = [
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

// Timbre options
const TIMBRES = [
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

interface MusicFormProps {
  params: MusicParams
  onChange: (params: Partial<MusicParams>) => void
  onGenerate: () => void
  isGenerating: boolean
}

export function MusicForm({ params, onChange, onGenerate, isGenerating }: MusicFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Music Type</Label>
        <RadioGroup
          value={params.type}
          onValueChange={(value) => onChange({ type: value as "vocal" | "bgm" })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vocal" id="vocal" />
            <Label htmlFor="vocal">Vocal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="bgm" id="bgm" />
            <Label htmlFor="bgm">Background Music</Label>
          </div>
        </RadioGroup>
      </div>

      {params.type === "vocal" && (
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={params.gender} onValueChange={(value) => onChange({ gender: value as "Female" | "Male" })}>
            <SelectTrigger>
              <SelectValue placeholder="Auto-detect gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Genre</Label>
        <Select value={params.genre} onValueChange={(value) => onChange({ genre: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Auto-detect genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Mood</Label>
        <Select value={params.mood} onValueChange={(value) => onChange({ mood: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Auto-detect mood" />
          </SelectTrigger>
          <SelectContent>
            {MOODS.map((mood) => (
              <SelectItem key={mood} value={mood}>
                {mood}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Timbre</Label>
        <Select value={params.timbre} onValueChange={(value) => onChange({ timbre: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Auto-detect timbre" />
          </SelectTrigger>
          <SelectContent>
            {TIMBRES.map((timbre) => (
              <SelectItem key={timbre} value={timbre}>
                {timbre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Duration: {params.duration} seconds</Label>
          <span className="text-sm text-slate-400">(30-240 seconds)</span>
        </div>
        <Slider
          value={[params.duration || 120]}
          min={30}
          max={240}
          step={1}
          onValueChange={(value) => onChange({ duration: value[0] })}
          className="py-4"
        />
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating || !params.lyrics}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Music className="mr-2 h-4 w-4" />
            Generate Music
          </>
        )}
      </Button>

      {!params.lyrics && <p className="text-sm text-red-400 text-center">Please add lyrics before generating music</p>}
    </div>
  )
}
