"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { getUserVotes, saveUserVote } from "@/lib/anonymousVoting"

interface SongVoteProps {
  songId: string
  onVote: (score: number) => Promise<void>
}

export function SongVote({ songId, onVote }: SongVoteProps) {
  const [score, setScore] = useState<number>(5)
  const [userVote, setUserVote] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Load user's previous vote if any
  useEffect(() => {
    const votes = getUserVotes();
    if (votes[songId] !== undefined) {
      setUserVote(votes[songId]);
      setScore(votes[songId]);
    }
  }, [songId]);
  
  const handleVote = async () => {
    setIsSubmitting(true);
    try {
      await onVote(score);
      saveUserVote(songId, score);
      setUserVote(score);
    } catch (error) {
      console.error("Failed to submit vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-1 sm:space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm text-purple-300">Rate this song</span>
        {userVote !== null && (
          <span className="text-xs sm:text-sm text-purple-300">Your vote: {userVote}</span>
        )}
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <Slider
          value={[score]}
          min={0}
          max={10}
          step={1}
          onValueChange={(value) => setScore(value[0])}
          className="flex-1"
        />
        <span className="text-base sm:text-lg font-medium text-green-500 min-w-[1.5rem] sm:min-w-[2rem] text-center">{score}</span>
      </div>
      
      <Button 
        onClick={handleVote}
        disabled={isSubmitting || userVote === score}
        className="w-full bg-purple-800 hover:bg-purple-700 py-1 sm:py-2 text-sm sm:text-base"
      >
        {userVote === null ? "Submit Vote" : "Update Vote"}
      </Button>
      
      <p className="text-xs text-purple-400 text-center hidden sm:block">
        Private & resets daily. All votes are anonymous.
      </p>
      <p className="text-[10px] text-purple-400 text-center sm:hidden">
        Private & resets daily
      </p>
    </div>
  );
}
