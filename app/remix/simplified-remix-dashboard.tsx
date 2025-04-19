'use client';

import { useState, useEffect } from 'react';
import type { MusicParams, ProportionalValue } from '../../components/remix/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
    <div key={item.name} className="flex items-center mb-3 bg-purple-950/50 p-2 rounded-lg">
      <div className="w-1/3 text-purple-300 font-medium">{item.name}:</div>
      <div className="flex items-center flex-grow">
        <button 
          type="button" 
          onClick={() => adjustProportionValue(category, item.name, -5)}
          className="px-3 py-1 bg-purple-800/70 hover:bg-purple-700/70 text-white rounded-l-lg transition-colors"
          disabled={item.value <= 0}
        >
          -
        </button>
        <span className="w-16 text-center text-white bg-purple-900/70 py-1">{item.value}%</span>
        <button 
          type="button" 
          onClick={() => adjustProportionValue(category, item.name, 5)}
          className="px-3 py-1 bg-purple-800/70 hover:bg-purple-700/70 text-white rounded-r-lg transition-colors"
          disabled={item.value >= 100}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <Card className="border-purple-500/30 bg-purple-900/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold text-green-500">Remix Editor</CardTitle>
        <CardDescription className="text-purple-300">Customize your remix parameters</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900/30 border border-green-500/30 p-4 rounded-lg mb-6">
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}
        
        {/* Lyrics Editor */}
        <Card className="border-purple-500/30 bg-purple-950/50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white">Lyrics Editor</CardTitle>
            <CardDescription className="text-purple-300">Edit lyrics for your remix (max 2000 characters)</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={musicParams.lyrics}
              onChange={handleLyricsChange}
              placeholder="Enter your lyrics here..."
              className="w-full h-40 p-3 bg-purple-900/50 text-white border border-purple-700/50 rounded-lg focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-purple-300">
                {musicParams.lyrics.length} / 2000 characters
              </span>
              {musicParams.lyrics.length > 2000 && (
                <span className="text-red-400">
                  Character limit exceeded
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Parameters Tabs */}
        <Tabs defaultValue="basic" className="mb-6">
          <TabsList className="bg-purple-900/30 w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="basic" className="uppercase font-bold text-sm">Basic</TabsTrigger>
            <TabsTrigger value="genre" className="uppercase font-bold text-sm">Genre</TabsTrigger>
            <TabsTrigger value="mood" className="uppercase font-bold text-sm">Mood</TabsTrigger>
            <TabsTrigger value="timbre" className="uppercase font-bold text-sm">Timbre</TabsTrigger>
          </TabsList>
          
          {/* Basic Parameters Tab */}
          <TabsContent value="basic">
            <Card className="border-purple-500/30 bg-purple-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Basic Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2 font-medium">Music Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={musicParams.type === "vocal"}
                          onChange={() => handleTypeChange("vocal")}
                          className="w-4 h-4 accent-green-500"
                        />
                        <span className="text-purple-300">Vocal</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={musicParams.type === "bgm"}
                          onChange={() => handleTypeChange("bgm")}
                          className="w-4 h-4 accent-green-500"
                        />
                        <span className="text-purple-300">Background Music</span>
                      </label>
                    </div>
                  </div>

                  {musicParams.type === "vocal" && (
                    <div>
                      <label className="block text-white mb-2 font-medium">Gender</label>
                      <select
                        value={musicParams.gender || "auto"}
                        onChange={handleGenderChange}
                        className="w-full p-2 bg-purple-900/50 border border-purple-700/50 rounded-lg text-purple-300 focus:border-green-500/50 focus:outline-none"
                      >
                        <option value="auto">Auto-detect</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-white mb-2 font-medium">Duration: {musicParams.duration} seconds</label>
                    <input
                      type="range"
                      min={30}
                      max={240}
                      step={1}
                      value={musicParams.duration}
                      onChange={handleDurationChange}
                      className="w-full accent-green-500"
                    />
                    <div className="flex justify-between text-sm text-purple-300">
                      <span>30s</span>
                      <span>240s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Genre Parameters Tab */}
          <TabsContent value="genre">
            <Card className="border-purple-500/30 bg-purple-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Genre Parameters</CardTitle>
                <CardDescription className="text-purple-300">Adjust the genre mix of your remix</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {musicParams.genreProportions.map(item => (
                    <div key={item.name}>
                      {renderProportionControl(item, 'genreProportions')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Mood Parameters Tab */}
          <TabsContent value="mood">
            <Card className="border-purple-500/30 bg-purple-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Mood Parameters</CardTitle>
                <CardDescription className="text-purple-300">Set the emotional tone of your remix</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {musicParams.moodProportions.map(item => (
                    <div key={item.name}>
                      {renderProportionControl(item, 'moodProportions')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Timbre Parameters Tab */}
          <TabsContent value="timbre">
            <Card className="border-purple-500/30 bg-purple-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-white">Timbre Parameters</CardTitle>
                <CardDescription className="text-purple-300">Adjust the sound quality characteristics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {musicParams.timbreProportions.map(item => (
                    <div key={item.name}>
                      {renderProportionControl(item, 'timbreProportions')}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !musicParams.lyrics}
          className={`w-full py-3 text-lg rounded-lg font-medium transition-colors ${
            isGenerating || !musicParams.lyrics
              ? "bg-purple-900/50 text-purple-500/50 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {isGenerating ? "Generating Remix..." : "Generate Remix"}
        </button>
      </CardContent>
    </Card>
  );
}
