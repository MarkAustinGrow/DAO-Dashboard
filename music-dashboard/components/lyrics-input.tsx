"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Sparkles, Loader2, Check, X, RefreshCw, Wand2 } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface LyricsInputProps {
  value: string
  onChange: (value: string) => void
}

// Pre-defined suggestion options
const SUGGESTION_OPTIONS = [
  { label: "More emotional", value: "Make the lyrics more emotional and heartfelt" },
  { label: "Add imagery", value: "Add more vivid imagery and descriptive language" },
  { label: "More poetic", value: "Make the lyrics more poetic with metaphors and symbolism" },
  { label: "Modern style", value: "Update to a more modern, contemporary style" },
  { label: "Fix flow", value: "Improve the rhythm and flow of the lyrics" },
  { label: "Deeper meaning", value: "Add more depth and meaning to the lyrics" },
]

export function LyricsInput({ value, onChange }: LyricsInputProps) {
  const [isAiHelperOpen, setIsAiHelperOpen] = useState(false)
  const [userGuidance, setUserGuidance] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [improvedLyrics, setImprovedLyrics] = useState("")
  const [error, setError] = useState("")
  
  const maxLength = 2000
  const currentLength = value.length
  const isOverLimit = currentLength > maxLength

  // Function to add a suggestion to the guidance
  const addSuggestion = (suggestion: string) => {
    if (userGuidance) {
      setUserGuidance(prev => `${prev}. ${suggestion}`)
    } else {
      setUserGuidance(suggestion)
    }
  }

  // Function to generate improved lyrics
  const generateImprovedLyrics = async () => {
    if (!value.trim()) {
      setError("Please enter some lyrics first")
      return
    }

    setIsGenerating(true)
    setError("")

    try {
      console.log('Sending request to improve lyrics...');
      const response = await fetch('/api/improve-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentLyrics: value,
          userGuidance,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to improve lyrics');
      }

      if (!data.improvedLyrics) {
        throw new Error('No improved lyrics returned from the API');
      }

      setImprovedLyrics(data.improvedLyrics);
    } catch (err: any) {
      console.error('Error generating improved lyrics:', err);
      // Provide more detailed error message to the user
      setError(
        `Error: ${err.message || 'Failed to generate improved lyrics'}. Please try again or check the console for more details.`
      );
    } finally {
      setIsGenerating(false);
    }
  }

  // Function to accept the improved lyrics
  const acceptImprovedLyrics = () => {
    onChange(improvedLyrics)
    setImprovedLyrics("")
  }

  // Function to reject the improved lyrics
  const rejectImprovedLyrics = () => {
    setImprovedLyrics("")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-[#00ffaa] border-[#00ffaa] hover:text-[#00ffcc] hover:border-[#00ffcc] hover:bg-[#00ffaa]/10"
            onClick={() => setIsAiHelperOpen(!isAiHelperOpen)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Lyrics Helper
          </Button>
          <div className={`text-sm ${isOverLimit ? "text-[#ff5555]" : "text-[#b388ff]"}`}>
            {currentLength}/{maxLength} characters
          </div>
        </div>
        <Textarea
          placeholder="Write your lyrics here..."
          className="min-h-[150px] resize-none bg-[#3a1a5c] border-[#4a1f7c] text-white placeholder:text-[#b388ff]/70"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {isAiHelperOpen && (
        <Card className="bg-[#3a1a5c] border-[#00ffaa]/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[#00ffaa]">AI Lyrics Helper</CardTitle>
            <CardDescription className="text-[#b388ff]">
              Provide guidance on how you'd like to improve your lyrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Guidance input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Your guidance:</label>
              <Textarea
                placeholder="E.g., Make the chorus more catchy, add more emotion to the second verse..."
                className="resize-none bg-[#2a0f4c] border-[#4a1f7c] text-white placeholder:text-[#b388ff]/70"
                value={userGuidance}
                onChange={(e) => setUserGuidance(e.target.value)}
              />
            </div>
            
            {/* Quick suggestions */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Quick suggestions:</label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTION_OPTIONS.map((option) => (
                  <Badge
                    key={option.label}
                    className="bg-[#4a1f7c] hover:bg-[#5a2f8c] text-white cursor-pointer"
                    onClick={() => addSuggestion(option.value)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Generate button */}
            <Button
              className="w-full bg-[#00ffaa] hover:bg-[#00ffcc] text-[#2a0f4c]"
              onClick={generateImprovedLyrics}
              disabled={isGenerating || !value.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Improve Lyrics
                </>
              )}
            </Button>
            
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/30 rounded text-red-300 text-sm space-y-1">
                <p className="font-medium">Error occurred:</p>
                <p>{error}</p>
                <p className="text-xs mt-1">
                  Note: Make sure the OpenAI API key is correctly configured in the .env file.
                </p>
              </div>
            )}
            
            {/* Improved lyrics result */}
            {improvedLyrics && (
              <div className="space-y-3 mt-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-[#00ffaa] font-medium">Improved Lyrics:</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500/10"
                      onClick={acceptImprovedLyrics}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                      onClick={rejectImprovedLyrics}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-[#2a0f4c] rounded-md text-white whitespace-pre-line">
                  {improvedLyrics}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isOverLimit && (
        <p className="text-sm text-[#ff5555]">Your lyrics exceed the maximum length of 2000 characters.</p>
      )}
    </div>
  )
}
