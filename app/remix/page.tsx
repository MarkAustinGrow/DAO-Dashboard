'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SidebarProvider } from "../../components/ui/sidebar";
import DashboardSidebar from "../../components/dashboard-sidebar";
import DashboardHeader from "../../components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ChevronLeft, ChevronRight, Music } from "lucide-react";
import { GENRES, MOODS, TIMBRES } from "../../components/remix/types";
import type { MusicParams, Song, ProportionalValue } from "../../components/remix/types";
import RemixDashboard from "./remix-dashboard";

export default function RemixPage() {
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
