'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SidebarProvider } from "../../components/ui/sidebar";
import DashboardSidebar from "../../components/dashboard-sidebar";
import DashboardHeader from "../../components/dashboard-header";
import { GENRES, MOODS, TIMBRES } from "../../components/remix/types";
import type { MusicParams, Song, ProportionalValue } from "../../components/remix/types";
import SimplifiedRemixDashboard from "./simplified-remix-dashboard";

export default function SimplifiedRemixPage() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [musicParams, setMusicParams] = useState<MusicParams | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();
  
  // Initial load - get first song and total count
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
  
  // Load a specific song by index
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
  
  // Navigation functions
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
  
  // Parse params function
  const parseParams = (paramsJson: string): MusicParams => {
    try {
      // Handle null or undefined
      if (!paramsJson) {
        console.warn('Empty params_used data');
        return defaultMusicParams();
      }
      
      // Parse JSON if it's a string
      const params = typeof paramsJson === 'string' ? JSON.parse(paramsJson) : paramsJson;
      
      // Handle empty object
      if (!params || Object.keys(params).length === 0) {
        console.warn('Empty params object');
        return defaultMusicParams();
      }
      
      // Extract lyrics
      const lyrics = params.lyrics || params.prompt || "";
      
      // Determine gender
      let gender: "Female" | "Male" | null = null;
      if (params.gender) {
        if (typeof params.gender === 'string') {
          gender = params.gender.toLowerCase() === 'female' ? 'Female' : 
                  params.gender.toLowerCase() === 'male' ? 'Male' : null;
        }
      }
      
      // Determine music type
      const type = params.type === 'bgm' ? 'bgm' : 'vocal';
      
      // Determine duration
      const duration = params.duration && !isNaN(parseInt(params.duration)) ? 
                      parseInt(params.duration) : 120;
      
      // Map genre proportions
      const genreProportions = mapProportions(params.genreProportions || [], GENRES);
      
      // Map mood proportions
      const moodProportions = mapProportions(params.moodProportions || [], MOODS);
      
      // Map timbre proportions
      const timbreProportions = mapProportions(params.timbreProportions || [], TIMBRES);
      
      return {
        type,
        lyrics,
        gender,
        duration,
        genreProportions,
        moodProportions,
        timbreProportions
      };
    } catch (error) {
      console.error('Error parsing params:', error);
      return defaultMusicParams();
    }
  };
  
  // Helper function to map proportions
  const mapProportions = (proportions: any[], defaultNames: string[]): ProportionalValue[] => {
    // If proportions is an array, try to use it
    if (Array.isArray(proportions) && proportions.length > 0) {
      // Check if the array items have name and value properties
      if (proportions[0].name && proportions[0].value !== undefined) {
        return defaultNames.map(name => {
          const found = proportions.find(p => p.name === name);
          return {
            name,
            value: found ? found.value : Math.floor(Math.random() * 50)
          };
        });
      }
    }
    
    // Default: return random values
    return defaultNames.map(name => ({
      name,
      value: Math.floor(Math.random() * 50) + 25
    }));
  };
  
  // Default music params
  const defaultMusicParams = (): MusicParams => {
    return {
      type: "vocal",
      lyrics: "",
      gender: null,
      duration: 120,
      genreProportions: GENRES.map(name => ({ name, value: Math.floor(Math.random() * 50) + 25 })),
      moodProportions: MOODS.map(name => ({ name, value: Math.floor(Math.random() * 50) + 25 })),
      timbreProportions: TIMBRES.map(name => ({ name, value: Math.floor(Math.random() * 50) + 25 }))
    };
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="flex-1 space-y-4 p-4 md:p-8">
              <div className="bg-gray-900 rounded-lg shadow-md">
                <div className="p-4 border-b border-gray-800">
                  <h1 className="text-xl font-bold text-white">Remix Studio</h1>
                  <p className="text-gray-400">Create new songs based on existing templates</p>
                </div>
                <div className="p-4">
                  {/* Song Navigation - Simplified */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={prevSong}
                      disabled={isLoading || currentSongIndex === 0}
                      className="px-4 py-2 bg-purple-800 text-white rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    <div className="text-center">
                      <h2 className="text-lg font-bold text-white">
                        {isLoading ? 'Loading...' : currentSong?.title || 'No songs available'}
                      </h2>
                      <span className="text-sm text-gray-400">
                        Song {currentSongIndex + 1} of {totalSongs}
                      </span>
                    </div>
                    
                    <button
                      onClick={nextSong}
                      disabled={isLoading || currentSongIndex === totalSongs - 1}
                      className="px-4 py-2 bg-purple-800 text-white rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-900/30 border border-red-500/30 p-4 rounded-lg mb-6">
                      <p className="text-red-300">{error}</p>
                    </div>
                  )}
                  
                  {/* Loading State - Simplified */}
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-white">Loading song data...</p>
                    </div>
                  ) : currentSong && musicParams ? (
                    <div className="space-y-6">
                      {/* Notice about remix functionality */}
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-gray-300 text-sm">
                          <strong>Note:</strong> You are creating a new remix based on "{currentSong.title}". 
                          Any changes you make here will not affect the original song. 
                          Click "Generate Remix" to save your changes as a new remix.
                        </p>
                      </div>
                      
                      {/* Simplified Remix Dashboard */}
                      <SimplifiedRemixDashboard 
                        key={currentSong.id} 
                        initialParams={musicParams} 
                        songTitle={currentSong.title}
                        songId={currentSong.id}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No songs available to remix.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
