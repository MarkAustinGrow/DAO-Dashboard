'use client';

import { useState, useEffect } from 'react';
import type { MusicParams, ProportionalValue } from '../../components/remix/types';

interface RemixDashboardProps {
  initialParams: MusicParams;
  songTitle: string;
  songId?: string;
}

export default function SimplifiedRemixDashboard({ 
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

  // Handle lyrics change
  const handleLyricsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMusicParams(prev => ({ ...prev, lyrics: e.target.value }));
  };

  // Handle music type change
  const handleTypeChange = (type: "vocal" | "bgm") => {
    setMusicParams(prev => ({ ...prev, type }));
  };

  // Handle gender change
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const gender = e.target.value === "auto" ? null : e.target.value === "Female" ? "Female" : "Male";
    setMusicParams(prev => ({ ...prev, gender }));
  };

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMusicParams(prev => ({ ...prev, duration: parseInt(e.target.value) }));
  };

  // Handle proportion value change
  const handleProportionChange = (
    category: 'genreProportions' | 'moodProportions' | 'timbreProportions',
    name: string,
    newValue: number
  ) => {
    // Ensure value is between 0 and 100
    const value = Math.max(0, Math.min(100, newValue));
    
    setMusicParams(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.name === name ? { ...item, value } : item
      )
    }));
  };

  // Increment or decrement a proportion value
  const adjustProportionValue = (
    category: 'genreProportions' | 'moodProportions' | 'timbreProportions',
    name: string,
    amount: number
  ) => {
    const currentValue = musicParams[category].find(item => item.name === name)?.value || 0;
    handleProportionChange(category, name, currentValue + amount);
  };

  // Handle form submission
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

  // Render a proportion control with increment/decrement buttons
  const renderProportionControl = (
    item: ProportionalValue,
    category: 'genreProportions' | 'moodProportions' | 'timbreProportions'
  ) => (
    <div key={item.name} className="flex items-center mb-2">
      <div className="w-1/3 text-white">{item.name}:</div>
      <div className="flex items-center">
        <button 
          type="button" 
          onClick={() => adjustProportionValue(category, item.name, -5)}
          className="px-2 py-1 bg-purple-800 text-white rounded"
          disabled={item.value <= 0}
        >
          -
        </button>
        <span className="w-12 text-center text-white">{item.value}%</span>
        <button 
          type="button" 
          onClick={() => adjustProportionValue(category, item.name, 5)}
          className="px-2 py-1 bg-purple-800 text-white rounded"
          disabled={item.value >= 100}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg">
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}
      
      {/* Lyrics Editor */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2 text-white">Lyrics Editor</h2>
        <p className="text-gray-400 mb-4">Edit lyrics for your remix (max 2000 characters)</p>
        <textarea
          value={musicParams.lyrics}
          onChange={handleLyricsChange}
          placeholder="Enter your lyrics here..."
          className="w-full h-40 p-2 bg-gray-800 text-white border border-gray-700 rounded"
        />
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-gray-400">
            {musicParams.lyrics.length} / 2000 characters
          </span>
          {musicParams.lyrics.length > 2000 && (
            <span className="text-red-400">
              Character limit exceeded
            </span>
          )}
        </div>
      </div>
      
      {/* Basic Parameters */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Basic Parameters</h2>
        
        <div className="mb-4">
          <label className="block text-white mb-2">Music Type</label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={musicParams.type === "vocal"}
                onChange={() => handleTypeChange("vocal")}
                className="w-4 h-4"
              />
              <span className="text-white">Vocal</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={musicParams.type === "bgm"}
                onChange={() => handleTypeChange("bgm")}
                className="w-4 h-4"
              />
              <span className="text-white">Background Music</span>
            </label>
          </div>
        </div>

        {musicParams.type === "vocal" && (
          <div className="mb-4">
            <label className="block text-white mb-2">Gender</label>
            <select
              value={musicParams.gender || "auto"}
              onChange={handleGenderChange}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="auto">Auto-detect</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-white mb-2">Duration: {musicParams.duration} seconds</label>
          <input
            type="range"
            min={30}
            max={240}
            step={1}
            value={musicParams.duration}
            onChange={handleDurationChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>30s</span>
            <span>240s</span>
          </div>
        </div>
      </div>
      
      {/* Genre Parameters */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Genre Parameters</h2>
        <div className="max-h-60 overflow-y-auto">
          {musicParams.genreProportions.map(item => 
            renderProportionControl(item, 'genreProportions')
          )}
        </div>
      </div>
      
      {/* Mood Parameters */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Mood Parameters</h2>
        <div className="max-h-60 overflow-y-auto">
          {musicParams.moodProportions.map(item => 
            renderProportionControl(item, 'moodProportions')
          )}
        </div>
      </div>
      
      {/* Timbre Parameters */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4 text-white">Timbre Parameters</h2>
        <div className="max-h-60 overflow-y-auto">
          {musicParams.timbreProportions.map(item => 
            renderProportionControl(item, 'timbreProportions')
          )}
        </div>
      </div>
      
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !musicParams.lyrics}
        className={`w-full py-3 text-lg rounded-lg font-medium ${
          isGenerating || !musicParams.lyrics
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white"
        }`}
      >
        {isGenerating ? "Generating Remix..." : "Generate Remix"}
      </button>
    </div>
  );
}
