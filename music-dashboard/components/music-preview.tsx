"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Play, Pause, Download } from "lucide-react"
import { useState } from "react"

interface MusicPreviewProps {
  isGenerating: boolean
  audioUrl: string | null
}

export function MusicPreview({ isGenerating, audioUrl }: MusicPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="text-slate-300">Generating your music...</p>
        <p className="text-sm text-slate-400">This may take a few moments</p>
      </div>
    )
  }

  if (!audioUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <div className="rounded-full bg-slate-800 p-4">
          <Play className="h-8 w-8 text-slate-400" />
        </div>
        <p className="text-slate-300">No music generated yet</p>
        <p className="text-sm text-slate-400">Configure your parameters and click Generate</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <img
          src={audioUrl || "/placeholder.svg"}
          alt="Audio waveform"
          className="w-full h-20 object-cover rounded-md"
        />

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 bg-purple-600 hover:bg-purple-700 border-0"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button variant="outline" size="icon" className="rounded-full">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Generated Music</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded-md">
            <span className="text-slate-400 block">Type:</span>
            <span>Vocal</span>
          </div>
          <div className="bg-slate-800 p-2 rounded-md">
            <span className="text-slate-400 block">Duration:</span>
            <span>2:00</span>
          </div>
          <div className="bg-slate-800 p-2 rounded-md">
            <span className="text-slate-400 block">Genre:</span>
            <span>Pop</span>
          </div>
          <div className="bg-slate-800 p-2 rounded-md">
            <span className="text-slate-400 block">Mood:</span>
            <span>Happy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
