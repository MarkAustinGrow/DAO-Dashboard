# Building the Remix Page: A Comprehensive Guide

This document provides a detailed, step-by-step guide for building the Remix page in the Marvin Dashboard application. The Remix page allows users to create new songs based on existing templates by modifying parameters such as lyrics, genre, mood, and timbre.

## Table of Contents

1. [Overview and Requirements](#overview-and-requirements)
2. [Project Structure](#project-structure)
3. [Component Architecture](#component-architecture)
4. [Step 1: Setting Up the Basic Structure](#step-1-setting-up-the-basic-structure)
5. [Step 2: Implementing Data Fetching](#step-2-implementing-data-fetching)
6. [Step 3: Building the Parameter Editor](#step-3-building-the-parameter-editor)
7. [Step 4: Creating the Lyrics Editor](#step-4-creating-the-lyrics-editor)
8. [Step 5: Implementing Remix Generation](#step-5-implementing-remix-generation)
9. [Step 6: Adding Polish and Refinement](#step-6-adding-polish-and-refinement)
7. [Step 7: Testing and Optimization](#step-7-testing-and-optimization)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Deployment Considerations](#deployment-considerations)

## Overview and Requirements

The Remix page is a feature within the Marvin Dashboard that allows users to:

- Browse through existing songs in the database
- View and modify song parameters (genre, mood, timbre, etc.)
- Edit lyrics
- Generate new remixes based on these modifications

### Technical Requirements

- Next.js 15.x
- React 18.x
- TypeScript
- Tailwind CSS for styling
- Supabase for database access
- Minimal external dependencies to avoid build issues

### Design Principles

1. **Dependency Minimization**: Avoid external UI libraries that might cause build issues
2. **Component Isolation**: Create focused components with single responsibilities
3. **Type Safety**: Use proper TypeScript typing for all props and state
4. **Consistent Styling**: Use Tailwind CSS for styling to match the dashboard
5. **Error Handling**: Implement proper loading states and error handling

## Project Structure

```
app/
  remix/
    page.tsx                 # Main page component
    remix-dashboard.tsx      # Main remix dashboard component
components/
  remix/
    lyrics-editor.tsx        # Lyrics editing component
    parameter-editor/
      index.tsx              # Main parameter editor component
      basic-parameters.tsx   # Basic parameters tab
      genre-parameters.tsx   # Genre parameters tab
      mood-parameters.tsx    # Mood parameters tab
      timbre-parameters.tsx  # Timbre parameters tab
      summary.tsx            # Summary tab
    song-navigation.tsx      # Song navigation component
    types.ts                 # Type definitions
api/
  create-remix/
    route.ts                 # API endpoint for creating remixes
```

## Component Architecture

The Remix page consists of several key components that work together:

1. **RemixPage**: The main page component that handles layout and integration with the dashboard
2. **SongNavigation**: Handles browsing and selecting songs from the database
3. **ParameterEditor**: A tabbed interface for editing different parameter categories
4. **LyricsEditor**: A specialized editor for modifying song lyrics
5. **RemixDashboard**: Coordinates the overall remix creation process

## Step 1: Setting Up the Basic Structure

### 1.1 Create the Basic Page Component

First, create the basic page component that integrates with the dashboard layout:

```tsx
// app/remix/page.tsx
'use client';

import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";

export default function RemixPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8">
              {/* Remix content will go here */}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

### 1.2 Create the Types Module

Define the core types that will be used throughout the Remix feature:

```tsx
// components/remix/types.ts
export type MusicType = "vocal" | "bgm";
export type Gender = "Female" | "Male" | null;

export interface ProportionalValue {
  name: string;
  value: number;
}

export interface MusicParams {
  type: MusicType;
  lyrics: string;
  gender: Gender;
  duration: number;
  genreProportions: ProportionalValue[];
  moodProportions: ProportionalValue[];
  timbreProportions: ProportionalValue[];
}

export interface Song {
  id: string;
  title: string;
  params_used: string;
}
```

## Step 2: Implementing Data Fetching

### 2.1 Set Up Supabase Client

Create a function to initialize the Supabase client:

```tsx
// app/remix/page.tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useState, useEffect } from 'react';
import type { Song, MusicParams } from '@/components/remix/types';

export default function RemixPage() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [musicParams, setMusicParams] = useState<MusicParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  
  // Rest of the component...
}
```

### 2.2 Implement Data Fetching Logic

Add functions to fetch songs and their parameters:

```tsx
// Inside RemixPage component
useEffect(() => {
  async function initialize() {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get total count of songs
      const { count, error: countError } = await supabase
        .from('songs')
        .select('id', { count: 'exact', head: true });
        
      if (countError) {
        throw new Error(`Error getting song count: ${countError.message}`);
      }
      
      setTotalSongs(count || 0);
      
      // Get first song
      if (count && count > 0) {
        const { data, error } = await supabase
          .from('songs')
          .select('id, title, params_used')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          throw new Error(`Error fetching first song: ${error.message}`);
        }
        
        if (data && data.length > 0) {
          setCurrentSong(data[0]);
          
          // Parse params
          if (data[0].params_used) {
            const parsedParams = parseParams(data[0].params_used);
            setMusicParams(parsedParams);
          }
        }
      }
    } catch (err: any) {
      console.error('Error initializing remix page:', err);
      setError(err.message || 'An error occurred while loading songs');
    } finally {
      setIsLoading(false);
    }
  }
  
  initialize();
}, [supabase]);
```

### 2.3 Implement Song Navigation

Add functions to navigate between songs:

```tsx
// Inside RemixPage component
const loadSongByIndex = async (index: number) => {
  if (index < 0 || index >= totalSongs) return;
  
  setIsLoading(true);
  setError(null);
  
  try {
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, params_used')
      .order('created_at', { ascending: false })
      .range(index, index)
      .limit(1);
      
    if (error) {
      throw new Error(`Error fetching song: ${error.message}`);
    }
    
    if (data && data.length > 0) {
      setCurrentSong(data[0]);
      setCurrentSongIndex(index);
      
      // Parse params
      if (data[0].params_used) {
        const parsedParams = parseParams(data[0].params_used);
        setMusicParams(parsedParams);
      }
    }
  } catch (err: any) {
    console.error('Error loading song:', err);
    setError(err.message || 'An error occurred while loading the song');
  } finally {
    setIsLoading(false);
  }
};

const nextSong = () => {
  if (currentSongIndex < totalSongs - 1) {
    loadSongByIndex(currentSongIndex + 1);
  }
};

const prevSong = () => {
  if (currentSongIndex > 0) {
    loadSongByIndex(currentSongIndex - 1);
  }
};
```

## Step 3: Building the Parameter Editor

### 3.1 Create the Basic Parameters Tab

Create a component for editing basic parameters:

```tsx
// components/remix/parameter-editor/basic-parameters.tsx
import { useState } from 'react';
import type { MusicParams, MusicType, Gender } from '../types';

interface BasicParametersProps {
  params: MusicParams;
  onChange: (params: Partial<MusicParams>) => void;
}

export function BasicParameters({ params, onChange }: BasicParametersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="block text-[#00ffaa] font-medium">Music Type</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={params.type === "vocal"}
              onChange={() => onChange({ type: "vocal" })}
              className="w-4 h-4 text-[#00ffaa]"
            />
            <span className="text-white">Vocal</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={params.type === "bgm"}
              onChange={() => onChange({ type: "bgm" })}
              className="w-4 h-4 text-[#00ffaa]"
            />
            <span className="text-white">Background Music</span>
          </label>
        </div>
      </div>

      {params.type === "vocal" && (
        <div className="space-y-2">
          <label className="block text-[#00ffaa] font-medium">Gender</label>
          <select
            value={params.gender || "auto"}
            onChange={(e) => onChange({ gender: e.target.value === "auto" ? null : (e.target.value as Gender) })}
            className="w-full p-2 bg-[#3a1a5c] border border-[#4a1f7c] rounded text-white"
          >
            <option value="auto">Auto-detect</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="block text-[#00ffaa] font-medium">Duration: {params.duration} seconds</label>
          <span className="text-sm text-[#b388ff]">(30-240 seconds)</span>
        </div>
        <input
          type="range"
          min={30}
          max={240}
          step={1}
          value={params.duration}
          onChange={(e) => onChange({ duration: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
}
```

### 3.2 Create the Genre Parameters Tab

Create a component for editing genre parameters:

```tsx
// components/remix/parameter-editor/genre-parameters.tsx
import type { ProportionalValue } from '../types';

interface GenreParametersProps {
  genreProportions: ProportionalValue[];
  onChange: (proportions: ProportionalValue[]) => void;
}

export function GenreParameters({ genreProportions, onChange }: GenreParametersProps) {
  const handleGenreChange = (name: string, value: number) => {
    const newProportions = genreProportions.map(item => 
      item.name === name ? { ...item, value } : item
    );
    onChange(newProportions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#00ffaa]">Genre Proportions</h3>
      <p className="text-[#b388ff] mb-4">Set the proportion of each genre in your music</p>

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {genreProportions.map((genre) => (
          <div key={genre.name} className="space-y-1">
            <div className="flex justify-between">
              <label className="text-white">{genre.name}</label>
              <span className="text-[#b388ff]">{genre.value}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={genre.value}
              onChange={(e) => handleGenreChange(genre.name, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.3 Create Similar Components for Mood and Timbre

Follow the same pattern to create components for mood and timbre parameters.

### 3.4 Create the Parameter Editor Component

Create the main parameter editor component that combines all the tabs:

```tsx
// components/remix/parameter-editor/index.tsx
import { useState } from 'react';
import { BasicParameters } from './basic-parameters';
import { GenreParameters } from './genre-parameters';
import { MoodParameters } from './mood-parameters';
import { TimbreParameters } from './timbre-parameters';
import { Summary } from './summary';
import type { MusicParams } from '../types';

interface ParameterEditorProps {
  params: MusicParams;
  onChange: (params: Partial<MusicParams>) => void;
}

export function ParameterEditor({ params, onChange }: ParameterEditorProps) {
  const [activeTab, setActiveTab] = useState("basic");

  return (
    <div className="w-full bg-[#2a0f4c] rounded-lg overflow-hidden shadow-lg">
      {/* Tabs Navigation */}
      <div className="flex border-b border-[#4a1f7c]">
        {["basic", "genre", "mood", "timbre", "summary"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "bg-[#4a1f7c] text-[#00ffaa]"
                : "text-[#b388ff] hover:bg-[#3a1a5c]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "basic" && (
          <BasicParameters params={params} onChange={onChange} />
        )}
        {activeTab === "genre" && (
          <GenreParameters 
            genreProportions={params.genreProportions} 
            onChange={(proportions) => onChange({ genreProportions: proportions })} 
          />
        )}
        {activeTab === "mood" && (
          <MoodParameters 
            moodProportions={params.moodProportions} 
            onChange={(proportions) => onChange({ moodProportions: proportions })} 
          />
        )}
        {activeTab === "timbre" && (
          <TimbreParameters 
            timbreProportions={params.timbreProportions} 
            onChange={(proportions) => onChange({ timbreProportions: proportions })} 
          />
        )}
        {activeTab === "summary" && (
          <Summary params={params} />
        )}
      </div>
    </div>
  );
}
```

## Step 4: Creating the Lyrics Editor

### 4.1 Create the Lyrics Editor Component

Create a component for editing lyrics:

```tsx
// components/remix/lyrics-editor.tsx
import { useState } from 'react';

interface LyricsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LyricsEditor({ value, onChange }: LyricsEditorProps) {
  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter your lyrics here..."
        className="w-full h-40 p-3 bg-[#3a1a5c] border border-[#4a1f7c] rounded text-white placeholder:text-[#b388ff]/50 focus:outline-none focus:ring-2 focus:ring-[#00ffaa]/50"
      />
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-[#b388ff]">
          {value.length} / 2000 characters
        </span>
        {value.length > 2000 && (
          <span className="text-red-400">
            Character limit exceeded
          </span>
        )}
      </div>
    </div>
  );
}
```

## Step 5: Implementing Remix Generation

### 5.1 Create the API Route

Create an API route for generating remixes:

```tsx
// app/api/create-remix/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { params, originalSongTitle, originalSongId } = requestData;
    
    // Validate input
    if (!params || !params.lyrics) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Create a new song entry
    const { data, error } = await supabase
      .from('songs')
      .insert({
        title: `Remix of ${originalSongTitle || 'Unknown'}`,
        params_used: JSON.stringify(params),
        original_song_id: originalSongId,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating remix:', error);
      return NextResponse.json(
        { error: 'Failed to create remix' },
        { status: 500 }
      );
    }
    
    // In a real application, you would trigger a background job to generate the music
    // For this example, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: 'Remix created successfully',
      songId: data.id,
    });
  } catch (error: any) {
    console.error('Error in create-remix route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

### 5.2 Implement the Remix Dashboard Component

Create the main remix dashboard component:

```tsx
// components/remix/remix-dashboard.tsx
import { useState, useEffect } from 'react';
import { LyricsEditor } from './lyrics-editor';
import { ParameterEditor } from './parameter-editor';
import type { MusicParams } from './types';

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

  // Update musicParams when initialParams change (when a new song is selected)
  useEffect(() => {
    setMusicParams(initialParams);
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

      alert("Remix created successfully! Your new remix has been saved.");
    } catch (error: any) {
      console.error("Error generating remix:", error);
      alert(`Error creating remix: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
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
```

### 5.3 Update the Main Page Component

Update the main page component to include all the pieces:

```tsx
// app/remix/page.tsx (updated)
// ... existing imports and code

export default function RemixPage() {
  // ... existing state and functions

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8">
              <Card className="border-purple-500/30 bg-purple-900/20 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-green-500">Remix Studio</CardTitle>
                  <CardDescription className="text-purple-300">Create new songs based on existing templates</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Song Navigation */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {isLoading ? 'Loading...' : currentSong?.title || 'No songs available'}
                    </h2>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={prevSong}
                        disabled={isLoading || currentSongIndex === 0}
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <span className="text-sm text-purple-300">
                        {currentSongIndex + 1} / {totalSongs}
                      </span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={nextSong}
                        disabled={isLoading || currentSongIndex === totalSongs - 1}
                        className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg mb-6">
                      <p className="text-red-300">{error}</p>
                    </div>
                  )}
                  
                  {/* Loading State */}
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : currentSong && musicParams ? (
                    <div className="space-y-6">
                      {/* Notice about remix functionality */}
                      <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg">
                        <p className="text-purple-200 text-sm">
                          <strong>Note:</strong> You are creating a new remix based on "{currentSong.title}". 
                          Any changes you make here will not affect the original song. 
                          Click "Generate Remix" to save your changes as a new remix.
                        </p>
                      </div>
                      
                      {/* Remix Dashboard */}
                      <RemixDashboard 
                        key={currentSong.id} 
                        initialParams={musicParams} 
                        songTitle={currentSong.title}
                        songId={currentSong.id}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-purple-300">No songs available to remix.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
```

## Step 6: Adding Polish and Refinement

### 6.1 Improve Error Handling

Add more robust error handling throughout the application:

```tsx
// Example of improved error handling in the RemixDashboard component
const handleGenerate = async () => {
  if (!musicParams.lyrics) {
    alert("Please add lyrics before generating a remix.");
    return;
  }

  setIsGenerating(true);

  try {
    // API call code...
  } catch (error: any) {
    console.error("Error generating remix:", error);
    
    // More detailed error messages
    if (error.message.includes("network")) {
      alert("Network error. Please check your internet connection and try again.");
    } else if (error.message.includes("timeout")) {
      alert("The request timed out. Please try again later.");
    } else {
      alert(`Error creating remix: ${error.message || 'Please try again.'}`);
    }
  } finally {
    setIsGenerating(false);
  }
};
```

### 6.2 Add Loading States

Improve loading states throughout the application:

```tsx
// Example of improved loading state in the RemixPage component
{isLoading ? (
  <div className="flex flex-col items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
    <p className="text-purple-300">Loading song data...</p>
  </div>
) : /* rest of the code */}
```

### 6.3 Ad
