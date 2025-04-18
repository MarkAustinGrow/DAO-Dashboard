"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ProportionalDials } from "./proportional-dials"
import type { MusicParams, MusicType, Gender, ProportionalValue } from "./music-dashboard"

interface ParameterTabsProps {
  musicParams: MusicParams
  onTypeChange: (type: MusicType) => void
  onGenderChange: (gender: Gender) => void
  onDurationChange: (duration: number) => void
  onGenreChange: (proportions: ProportionalValue[]) => void
  onMoodChange: (proportions: ProportionalValue[]) => void
  onTimbreChange: (proportions: ProportionalValue[]) => void
}

export function ParameterTabs({
  musicParams,
  onTypeChange,
  onGenderChange,
  onDurationChange,
  onGenreChange,
  onMoodChange,
  onTimbreChange,
}: ParameterTabsProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-[#2a0f4c] p-1">
        {["basic", "genre", "mood", "timbre", "summary"].map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="data-[state=active]:bg-[#4a1f7c] data-[state=active]:text-[#00ffaa] text-[#b388ff]"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Basic Parameters Tab */}
      <TabsContent value="basic">
        <Card className="border-none bg-[#2a0f4c]">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Basic Parameters</CardTitle>
            <CardDescription className="text-[#b388ff]">
              Configure the fundamental aspects of your music
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#00ffaa]">Music Type</Label>
              <RadioGroup
                value={musicParams.type}
                onValueChange={(value) => onTypeChange(value as MusicType)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vocal" id="vocal" className="border-[#00ffaa] text-[#00ffaa]" />
                  <Label htmlFor="vocal" className="text-white">
                    Vocal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bgm" id="bgm" className="border-[#00ffaa] text-[#00ffaa]" />
                  <Label htmlFor="bgm" className="text-white">
                    Background Music
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {musicParams.type === "vocal" && (
              <div className="space-y-2">
                <Label className="text-[#00ffaa]">Gender</Label>
                <Select
                  value={musicParams.gender || "auto"}
                  onValueChange={(value) => onGenderChange(value === "auto" ? null : (value as Gender))}
                >
                  <SelectTrigger className="bg-[#3a1a5c] border-[#4a1f7c] text-white">
                    <SelectValue placeholder="Auto-detect gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#3a1a5c] border-[#4a1f7c]">
                    <SelectItem value="auto" className="text-[#b388ff]">
                      Auto-detect
                    </SelectItem>
                    <SelectItem value="Female" className="text-[#b388ff]">
                      Female
                    </SelectItem>
                    <SelectItem value="Male" className="text-[#b388ff]">
                      Male
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-[#00ffaa]">Duration: {musicParams.duration} seconds</Label>
                <span className="text-sm text-[#b388ff]">(30-240 seconds)</span>
              </div>
              <Slider
                value={[musicParams.duration]}
                min={30}
                max={240}
                step={1}
                onValueChange={(value) => onDurationChange(value[0])}
                className="py-4"
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Genre Tab */}
      <TabsContent value="genre">
        <Card className="border-none bg-[#2a0f4c]">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Genre Proportions</CardTitle>
            <CardDescription className="text-[#b388ff]">Set the proportion of each genre in your music</CardDescription>
          </CardHeader>
          <CardContent>
            <ProportionalDials values={musicParams.genreProportions} onChange={onGenreChange} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Mood Tab */}
      <TabsContent value="mood">
        <Card className="border-none bg-[#2a0f4c]">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Mood Proportions</CardTitle>
            <CardDescription className="text-[#b388ff]">Set the proportion of each mood in your music</CardDescription>
          </CardHeader>
          <CardContent>
            <ProportionalDials values={musicParams.moodProportions} onChange={onMoodChange} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Timbre Tab */}
      <TabsContent value="timbre">
        <Card className="border-none bg-[#2a0f4c]">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Timbre Proportions</CardTitle>
            <CardDescription className="text-[#b388ff]">
              Set the proportion of each timbre in your music
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProportionalDials values={musicParams.timbreProportions} onChange={onTimbreChange} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Summary Tab */}
      <TabsContent value="summary">
        <Card className="border-none bg-[#2a0f4c]">
          <CardHeader>
            <CardTitle className="text-[#00ffaa]">Parameter Summary</CardTitle>
            <CardDescription className="text-[#b388ff]">Review your configured parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2 text-[#00ffaa]">Basic Parameters</h3>
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
                <h3 className="text-lg font-medium mb-2 text-[#00ffaa]">Selected Characteristics</h3>
                <div className="space-y-4">
                  <SummarySection title="Genre" proportions={musicParams.genreProportions.filter((p) => p.value > 0)} />
                  <SummarySection title="Mood" proportions={musicParams.moodProportions.filter((p) => p.value > 0)} />
                  <SummarySection
                    title="Timbre"
                    proportions={musicParams.timbreProportions.filter((p) => p.value > 0)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
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
              <div className="h-2 bg-[#00ffaa] rounded-full" style={{ width: `${Math.min(100, prop.value)}%` }} />
              <span className="text-sm text-[#b388ff]">{prop.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
