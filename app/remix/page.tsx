'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Music } from "lucide-react";
import { MusicParams, MusicType, Gender, ProportionalValue, GENRES, MOODS, TIMBRES } from "@/music-dashboard/components/music-dashboard";
import RemixMusicDashboard from "./remix-music-dashboard";

interface Song {
  id: string;
  title: string;
  params_used: string;
}

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
  
  // Parse params function with more aggressive extraction
  const parseParams = (paramsJson: string): MusicParams => {
    try {
      // Handle null or undefined
      if (!paramsJson) {
        console.warn('Empty params_used data');
        return defaultMusicParamsWithRandomValues();
      }
      
      // Parse JSON if it's a string
      const params = typeof paramsJson === 'string' ? JSON.parse(paramsJson) : paramsJson;
      
      // Handle empty object
      if (!params || Object.keys(params).length === 0) {
        console.warn('Empty params object');
        return defaultMusicParamsWithRandomValues();
      }
      
      // Extract original analysis with fallbacks
      const analysis = params.original_analysis || {};
      
      // Extract lyrics from any available text field
      const lyrics = extractLyrics(params);
      
      // Determine gender with fallbacks
      let gender: Gender = determineGender(params);
      
      // Determine duration with fallbacks
      let duration = determineDuration(params);
      
      // Extract genres from any available source
      const genres = extractGenres(params);
      
      // Extract moods from any available source
      const moods = extractMoods(params);
      
      // Determine music type
      const type = determineType(params);
      
      // Map to music dashboard parameters
      return {
        type: type,
        lyrics: lyrics,
        gender: gender,
        duration: duration,
        genreProportions: mapGenres(genres),
        moodProportions: mapMoods(moods),
        timbreProportions: extractTimbre(params),
      };
    } catch (error) {
      console.error('Error parsing params:', error);
      return defaultMusicParamsWithRandomValues();
    }
  };
  
  // Helper functions for parameter extraction
  const extractLyrics = (params: any): string => {
    // Try multiple sources for lyrics
    if (params.prompt && typeof params.prompt === 'string' && params.prompt.length > 0) {
      return params.prompt;
    }
    
    if (params.original_analysis?.summary && typeof params.original_analysis.summary === 'string') {
      return params.original_analysis.summary;
    }
    
    if (params.lyrics && typeof params.lyrics === 'string') {
      return params.lyrics;
    }
    
    // Check for any string property that might contain lyrics
    for (const key in params) {
      if (typeof params[key] === 'string' && params[key].length > 20) {
        return params[key];
      }
    }
    
    return "";
  };
  
  const determineGender = (params: any): Gender => {
    // Check for explicit gender field
    if (params.voice_gender) {
      const gender = String(params.voice_gender).toLowerCase();
      if (gender.includes('female') || gender.includes('f')) return 'Female';
      if (gender.includes('male') || gender.includes('m')) return 'Male';
    }
    
    // Check for gender in other fields
    if (params.voice && typeof params.voice === 'string') {
      const voice = params.voice.toLowerCase();
      if (voice.includes('female') || voice.includes('f')) return 'Female';
      if (voice.includes('male') || voice.includes('m')) return 'Male';
    }
    
    // Check in prompt
    if (params.prompt && typeof params.prompt === 'string') {
      const prompt = params.prompt.toLowerCase();
      if (prompt.includes('female voice') || prompt.includes('woman')) return 'Female';
      if (prompt.includes('male voice') || prompt.includes('man')) return 'Male';
    }
    
    // Default to null
    return null;
  };
  
  const determineDuration = (params: any): number => {
    // Check for BPM in various locations
    if (params.original_analysis?.bpm) {
      const bpm = parseInt(params.original_analysis.bpm);
      if (!isNaN(bpm) && bpm > 0) return bpm;
    }
    
    if (params.bpm) {
      const bpm = parseInt(params.bpm);
      if (!isNaN(bpm) && bpm > 0) return bpm;
    }
    
    // Check for duration field
    if (params.duration) {
      const duration = parseInt(params.duration);
      if (!isNaN(duration) && duration > 0) return duration;
    }
    
    // Default to 120
    return 120;
  };
  
  const determineType = (params: any): MusicType => {
    // Check for instrumental flag
    if (params.make_instrumental === true) return 'bgm';
    
    // Check for type field
    if (params.type) {
      const type = String(params.type).toLowerCase();
      if (type.includes('bgm') || type.includes('instrumental')) return 'bgm';
      if (type.includes('vocal')) return 'vocal';
    }
    
    // Check for instrumental in other fields
    if (params.instrumental === true) return 'bgm';
    
    // Check mv field for hints
    if (params.mv && typeof params.mv === 'string') {
      const mv = params.mv.toLowerCase();
      if (mv.includes('instrumental')) return 'bgm';
    }
    
    // Default to vocal
    return 'vocal';
  };
  
  const extractGenres = (params: any): Array<any> => {
    // Check for genres in original_analysis
    if (params.original_analysis?.genres && Array.isArray(params.original_analysis.genres)) {
      return params.original_analysis.genres;
    }
    
    // Check for genres at root level
    if (params.genres && Array.isArray(params.genres)) {
      return params.genres;
    }
    
    // Check for genre as a string
    if (params.genre && typeof params.genre === 'string') {
      return [{ name: params.genre, weight: 80 }];
    }
    
    // Check for mv field which often contains genre info
    if (params.mv && typeof params.mv === 'string') {
      const genreMap: {[key: string]: number} = {
        'sonic': 70,
        'pop': 80,
        'rock': 75,
        'jazz': 65,
        'classical': 60,
        'electronic': 85,
        'ambient': 50,
        'folk': 55,
        'country': 45,
        'hip hop': 90,
        'rap': 85,
        'r&b': 75,
        'soul': 70,
        'funk': 65,
        'blues': 60,
        'reggae': 55,
        'metal': 80,
        'punk': 75,
        'indie': 70
      };
      
      const mv = params.mv.toLowerCase();
      for (const genre in genreMap) {
        if (mv.includes(genre)) {
          return [{ name: genre, weight: genreMap[genre] }];
        }
      }
      
      // If no specific genre found but mv exists, use it as a genre
      return [{ name: mv, weight: 60 }];
    }
    
    // If prompt contains genre keywords
    if (params.prompt && typeof params.prompt === 'string') {
      const prompt = params.prompt.toLowerCase();
      const genreKeywords: {[key: string]: number} = {
        'pop': 80,
        'rock': 75,
        'jazz': 65,
        'classical': 60,
        'electronic': 85,
        'ambient': 50,
        'folk': 55,
        'country': 45,
        'hip hop': 90,
        'rap': 85,
        'r&b': 75,
        'soul': 70,
        'funk': 65,
        'blues': 60,
        'reggae': 55,
        'metal': 80,
        'punk': 75,
        'indie': 70
      };
      
      const foundGenres = [];
      for (const genre in genreKeywords) {
        if (prompt.includes(genre)) {
          foundGenres.push({ name: genre, weight: genreKeywords[genre] });
        }
      }
      
      if (foundGenres.length > 0) {
        return foundGenres;
      }
    }
    
    // Return empty array as last resort
    return [];
  };
  
  const extractMoods = (params: any): Array<any> => {
    // Check for moods in original_analysis
    if (params.original_analysis?.music_moods && Array.isArray(params.original_analysis.music_moods)) {
      return params.original_analysis.music_moods;
    }
    
    if (params.original_analysis?.moods && Array.isArray(params.original_analysis.moods)) {
      return params.original_analysis.moods;
    }
    
    // Check for moods at root level
    if (params.music_moods && Array.isArray(params.music_moods)) {
      return params.music_moods;
    }
    
    if (params.moods && Array.isArray(params.moods)) {
      return params.moods;
    }
    
    // Check for mood as a string
    if (params.mood && typeof params.mood === 'string') {
      return [{ name: params.mood, weight: 80 }];
    }
    
    // Check for mv field which might contain mood info
    if (params.mv && typeof params.mv === 'string') {
      const moodMap: {[key: string]: number} = {
        'happy': 80,
        'sad': 75,
        'energetic': 85,
        'calm': 60,
        'relaxed': 55,
        'intense': 80,
        'angry': 75,
        'peaceful': 50,
        'romantic': 65,
        'nostalgic': 60,
        'dreamy': 55,
        'dark': 70,
        'uplifting': 75,
        'melancholic': 65,
        'hopeful': 70,
        'dramatic': 75,
        'playful': 65,
        'mysterious': 60,
        'triumphant': 70
      };
      
      const mv = params.mv.toLowerCase();
      for (const mood in moodMap) {
        if (mv.includes(mood)) {
          return [{ name: mood, weight: moodMap[mood] }];
        }
      }
    }
    
    // If prompt contains mood keywords
    if (params.prompt && typeof params.prompt === 'string') {
      const prompt = params.prompt.toLowerCase();
      const moodKeywords: {[key: string]: number} = {
        'happy': 80,
        'sad': 75,
        'energetic': 85,
        'calm': 60,
        'relaxed': 55,
        'intense': 80,
        'angry': 75,
        'peaceful': 50,
        'romantic': 65,
        'nostalgic': 60,
        'dreamy': 55,
        'dark': 70,
        'uplifting': 75,
        'melancholic': 65,
        'hopeful': 70,
        'dramatic': 75,
        'playful': 65,
        'mysterious': 60,
        'triumphant': 70
      };
      
      const foundMoods = [];
      for (const mood in moodKeywords) {
        if (prompt.includes(mood)) {
          foundMoods.push({ name: mood, weight: moodKeywords[mood] });
        }
      }
      
      if (foundMoods.length > 0) {
        return foundMoods;
      }
    }
    
    // Return empty array as last resort
    return [];
  };
  
  // Default music params with consistent values to avoid hydration errors
  const defaultMusicParamsWithRandomValues = (): MusicParams => {
    // Use consistent values based on the name's length to avoid hydration errors
    // while still providing varied visualization
    const genreProportions = GENRES.map((name, index) => ({ 
      name, 
      value: (index * 7) % 80 // Deterministic pattern based on index
    }));
    
    // Use consistent values for moods
    const moodProportions = MOODS.map((name, index) => ({ 
      name, 
      value: (index * 5 + 10) % 80 // Different pattern for variety
    }));
    
    // Use consistent values for timbres
    const timbreProportions = TIMBRES.map((name, index) => ({ 
      name, 
      value: (index * 9 + 5) % 80 // Another pattern for variety
    }));
    
    return {
      type: "vocal",
      lyrics: "",
      gender: null,
      duration: 120,
      genreProportions,
      moodProportions,
      timbreProportions,
    };
  };
  
  // Enhanced mapping functions with more aggressive matching
  const mapGenres = (genres: Array<any>): ProportionalValue[] => {
    // If no genres provided, return deterministic values based on index
    if (!Array.isArray(genres) || genres.length === 0) {
      return GENRES.map((name, index) => ({ 
        name, 
        value: (index * 7) % 70 + 10 // Deterministic pattern between 10-80
      }));
    }
    
    return GENRES.map((name, index) => {
      try {
        // Find matching genre with fallbacks and error handling
        const found = genres.find(g => {
          if (!g) return false;
          
          // Handle string-only genre
          if (typeof g === 'string') {
            return g === name || 
                  g.toLowerCase().includes(name.toLowerCase()) || 
                  name.toLowerCase().includes(g.toLowerCase());
          }
          
          // Handle object with name property
          if (typeof g === 'object') {
            if (!g.name) return false;
            
            return g.name === name || 
                  g.name.toLowerCase().includes(name.toLowerCase()) || 
                  name.toLowerCase().includes(g.name.toLowerCase());
          }
          
          return false;
        });
        
        // Handle weight with validation
        let value = 0;
        if (found) {
          if (typeof found === 'string') {
            // Use deterministic value based on string length and index
            value = 50 + (found.length * 3 + index) % 30;
          } else if (found.weight !== undefined) {
            const weight = Number(found.weight);
            value = !isNaN(weight) ? Math.round(weight) : 50 + (index * 5) % 30;
          } else {
            // Use deterministic value based on index
            value = 50 + (index * 5) % 30;
          }
        } else {
          // For genres not found, use a small deterministic value
          value = (index * 3) % 30;
        }
        
        return { name, value };
      } catch (error) {
        console.error(`Error mapping genre ${name}:`, error);
        // Deterministic fallback
        return { name, value: (index * 3) % 30 };
      }
    });
  };
  
  const mapMoods = (moods: Array<any>): ProportionalValue[] => {
    // If no moods provided, return deterministic values based on index
    if (!Array.isArray(moods) || moods.length === 0) {
      return MOODS.map((name, index) => ({ 
        name, 
        value: (index * 5 + 10) % 70 + 10 // Deterministic pattern between 10-80
      }));
    }
    
    return MOODS.map((name, index) => {
      try {
        // Find matching mood with fallbacks and error handling
        const found = moods.find(m => {
          if (!m) return false;
          
          // Handle string-only mood
          if (typeof m === 'string') {
            return m === name || 
                  m.toLowerCase().includes(name.toLowerCase()) || 
                  name.toLowerCase().includes(m.toLowerCase());
          }
          
          // Handle object with name property
          if (typeof m === 'object') {
            if (!m.name) return false;
            
            return m.name === name || 
                  m.name.toLowerCase().includes(name.toLowerCase()) || 
                  name.toLowerCase().includes(m.name.toLowerCase());
          }
          
          return false;
        });
        
        // Handle weight with validation
        let value = 0;
        if (found) {
          if (typeof found === 'string') {
            // Use deterministic value based on string length and index
            value = 50 + (found.length * 2 + index) % 30;
          } else if (found.weight !== undefined) {
            const weight = Number(found.weight);
            value = !isNaN(weight) ? Math.round(weight) : 50 + (index * 4) % 30;
          } else {
            // Use deterministic value based on index
            value = 50 + (index * 4) % 30;
          }
        } else {
          // For moods not found, use a small deterministic value
          value = (index * 4) % 30;
        }
        
        return { name, value };
      } catch (error) {
        console.error(`Error mapping mood ${name}:`, error);
        // Deterministic fallback
        return { name, value: (index * 4) % 30 };
      }
    });
  };
  
  const extractTimbre = (params: any): ProportionalValue[] => {
    // Create a scoring system for timbre based on various inputs
    const timbreScores: {[key: string]: number} = {};
    
    // Initialize all timbres with deterministic small values
    TIMBRES.forEach((name, index) => {
      timbreScores[name] = (index * 3) % 20; // Deterministic value between 0-19
    });
    
    try {
      // Check multiple sources for timbre information
      
      // 1. Check vocals description
      if (params.original_analysis?.vocals) {
        const vocals = String(params.original_analysis.vocals).toLowerCase();
        TIMBRES.forEach(name => {
          if (vocals.includes(name.toLowerCase())) {
            timbreScores[name] += 50;
          }
        });
      }
      
      // 2. Check style description
      if (params.style) {
        const style = String(params.style).toLowerCase();
        TIMBRES.forEach(name => {
          if (style.includes(name.toLowerCase())) {
            timbreScores[name] += 40;
          }
        });
      }
      
      // 3. Check summary
      if (params.original_analysis?.summary) {
        const summary = String(params.original_analysis.summary).toLowerCase();
        TIMBRES.forEach(name => {
          if (summary.includes(name.toLowerCase())) {
            timbreScores[name] += 30;
          }
        });
      }
      
      // 4. Check prompt
      if (params.prompt) {
        const prompt = String(params.prompt).toLowerCase();
        TIMBRES.forEach(name => {
          if (prompt.includes(name.toLowerCase())) {
            timbreScores[name] += 20;
          }
        });
      }
      
      // 5. Check mv field
      if (params.mv) {
        const mv = String(params.mv).toLowerCase();
        TIMBRES.forEach(name => {
          if (mv.includes(name.toLowerCase())) {
            timbreScores[name] += 35;
          }
        });
        
        // Special case for "sonic" which often appears in mv
        if (mv.includes('sonic')) {
          // Boost certain timbres for sonic
          timbreScores['Bright'] += 40;
          timbreScores['Clear'] += 35;
          timbreScores['Airy'] += 30;
        }
      }
      
      // 6. Check any other string fields
      for (const key in params) {
        if (typeof params[key] === 'string' && key !== 'prompt' && key !== 'style' && key !== 'mv') {
          const value = String(params[key]).toLowerCase();
          TIMBRES.forEach(name => {
            if (value.includes(name.toLowerCase())) {
              timbreScores[name] += 15;
            }
          });
        }
      }
      
      // Convert scores to proportional values
      return TIMBRES.map(name => {
        // Cap at 100
        const value = Math.min(100, timbreScores[name]);
        return { name, value };
      });
    } catch (error) {
      console.error('Error extracting timbre:', error);
      // Return deterministic values as fallback
      return TIMBRES.map((name, index) => ({ 
        name, 
        value: (index * 9 + 5) % 70 + 10 // Deterministic pattern between 10-80
      }));
    }
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
                      
                      {/* Remix Music Dashboard with Parameters */}
                      <RemixMusicDashboard 
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
