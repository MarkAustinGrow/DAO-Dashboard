'use client';

import { useState, useEffect } from 'react';
import { LyricsEditor } from '../../components/remix/lyrics-editor';
import { ParameterEditor } from '../../components/remix/parameter-editor';
import type { MusicParams } from '../../components/remix/types';

interface RemixDashboardProps {
  initialParams: MusicParams;
  songTitle: string;
  songId?: string;
}

export default function RemixDashboard({ 
  initialParams, 
  songTitle, 
  songId 
}: RemixDashboardProps) {
  const [musicParams, setMusicParams] = useState<MusicParams>(initialParams);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Update musicParams when initialParams change (when a new song is selected)
  useEffect(() => {
    setMusicParams(initialParams);
    setSuccessMessage(null);
  }, [initialParams]);

  const handleParamsChange = (params: Partial<MusicParams>) => {
    setMusicParams(prev => ({ ...prev, ...params }));
  };

  const handleLyricsChange = (lyrics: string) => {
    setMusicParams(prev => ({ ...prev, lyrics }));
  };

  const handleGenerate = async () => {
    if (!musicParams.lyrics) return;

    setIsGenerating(true);
    setSuccessMessage(null);

    try {
      // Format the data for API submission
      const requestData = {
        params: musicParams,
        originalSongTitle: songTitle,
        originalSongId: songId || null
      };

      // Call the create-remix API endpoint
      const response = await fetch('/api/create-remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create remix');
      }

      setSuccessMessage(`Remix created successfully! Your new remix "${result.title || 'Untitled'}" has been saved.`);
    } catch (error: any) {
      console.error("Error generating remix:", error);
      setSuccessMessage(null);
      alert(`Error creating remix: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {successMessage && (
        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}
      
      <div className="bg-[#2a0f4c] rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-[#00ffaa]">Lyrics Editor</h2>
        <p className="text-[#b388ff] mb-4">Edit lyrics for your remix (max 2000 characters)</p>
        <LyricsEditor value={musicParams.lyrics} onChange={handleLyricsChange} />
      </div>

      <ParameterEditor params={musicParams} onChange={handleParamsChange} />

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
  );
}
