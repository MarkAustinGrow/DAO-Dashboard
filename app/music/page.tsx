'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { SongVote } from "@/components/song-vote";
import { getOrCreateAnonymousId } from "@/lib/anonymousVoting";

interface Song {
  id: string;
  title: string;
  lyrics: string;
  audio_url: string;
  style: string;
  created_at: string;
  is_cover: boolean;
  duration: number;
  params_used: string;
  image_url: string | null;
  average_score: number | null;
  vote_count: number | null;
}

export default function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [rankings, setRankings] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingsLoading, setRankingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showLyrics, setShowLyrics] = useState<{ [key: string]: boolean }>({});

  const supabase = createClientComponentClient();

  // Fetch rankings
  const fetchRankings = useCallback(async () => {
    try {
      setRankingsLoading(true);
      const response = await fetch('/api/song-rankings');
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      
      const data = await response.json();
      setRankings(data);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Failed to load rankings');
    } finally {
      setRankingsLoading(false);
    }
  }, []);

  // Handle vote submission
  const handleVote = useCallback(async (songId: string, score: number) => {
    try {
      // Ensure we have an anonymous ID
      getOrCreateAnonymousId();
      
      const response = await fetch('/api/song-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId,
          score,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const result = await response.json();
      
      // Update the song in the local state
      setSongs(prev => prev.map(song => 
        song.id === songId 
          ? { ...song, average_score: result.averageScore, vote_count: result.voteCount }
          : song
      ));
      
      // Refresh rankings
      fetchRankings();
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote');
    }
  }, [fetchRankings]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setSongs(data || []);
        
        // Also fetch rankings
        fetchRankings();
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [supabase, fetchRankings]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
      const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;
      audio.pause();
    } else {
      if (currentlyPlaying) {
        const previousAudio = document.getElementById(`audio-${currentlyPlaying}`) as HTMLAudioElement;
        previousAudio.pause();
      }
      setCurrentlyPlaying(songId);
      const audio = document.getElementById(`audio-${songId}`) as HTMLAudioElement;
      audio.play();
    }
  };

  const toggleLyrics = (songId: string) => {
    setShowLyrics(prev => ({
      ...prev,
      [songId]: !prev[songId]
    }));
  };

  const content = (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <Card className="border-purple-500/30 bg-purple-900/20 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold text-green-500">Music Library</CardTitle>
          <CardDescription className="text-purple-300">Browse, listen, and vote on songs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="charts" className="mb-6">
            <TabsList className="bg-purple-900/30 w-full sm:w-auto">
              <TabsTrigger value="vote" className="uppercase font-bold text-sm w-1/2 sm:w-auto">Vote</TabsTrigger>
              <TabsTrigger value="charts" className="uppercase font-bold text-sm w-1/2 sm:w-auto">Charts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="vote">
              {loading && <div className="text-purple-300">Loading songs...</div>}
              {error && <div className="text-red-500">{error}</div>}
              {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {songs.map((song) => (
                    <Card 
                      key={song.id} 
                      className="group border-purple-500/30 bg-purple-950/50 overflow-hidden hover:border-purple-400/50"
                    >
                      {/* Title at the top for both mobile and desktop */}
                      <div className="p-3 pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h2 className="text-base sm:text-xl font-semibold text-white truncate max-w-[180px] sm:max-w-[300px]">{song.title}</h2>
                          </div>
                          {song.is_cover && (
                            <Badge variant="outline" className="border-purple-500 bg-purple-500/20 text-purple-300 text-xs ml-1 flex-shrink-0">
                              Cover
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Mobile layout */}
                      <div className="flex flex-row sm:hidden px-3">
                        {/* Image - smaller and square on mobile */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                          {song.image_url ? (
                            <Image
                              src={song.image_url}
                              alt={song.title}
                              fill
                              className="object-cover transition-all group-hover:scale-105 rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center rounded">
                              <span className="text-purple-300 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Buttons next to image */}
                        <div className="flex flex-col justify-center p-2 pl-3 flex-grow">
                          <div className="flex flex-row gap-2">
                            <button
                              onClick={() => handlePlay(song.id)}
                              className="bg-purple-800/50 hover:bg-purple-700/50 text-white px-2 py-1 text-sm rounded-lg transition-colors flex-1"
                            >
                              {currentlyPlaying === song.id ? 'Pause' : 'Play'}
                            </button>
                            <button
                              onClick={() => toggleLyrics(song.id)}
                              className="bg-purple-800/50 hover:bg-purple-700/50 text-white px-2 py-1 text-sm rounded-lg transition-colors flex-1"
                            >
                              {showLyrics[song.id] ? 'Hide' : 'Lyrics'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop layout - image only */}
                      <div className="hidden sm:block">
                        
                        {/* Image */}
                        <div className="relative aspect-video w-full">
                          {song.image_url ? (
                            <Image
                              src={song.image_url}
                              alt={song.title}
                              fill
                              className="object-cover transition-all group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-purple-900/50 flex items-center justify-center">
                              <span className="text-purple-300">No image available</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <CardContent className="p-3 sm:p-4">
                        {/* Desktop buttons - hidden on mobile */}
                        <div className="hidden sm:block">
                          
                          <div className="flex gap-2 mb-3">
                            <button
                              onClick={() => handlePlay(song.id)}
                              className="bg-purple-800/50 hover:bg-purple-700/50 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              {currentlyPlaying === song.id ? 'Pause' : 'Play'}
                            </button>
                            <button
                              onClick={() => toggleLyrics(song.id)}
                              className="bg-purple-800/50 hover:bg-purple-700/50 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              {showLyrics[song.id] ? 'Hide Lyrics' : 'Show Lyrics'}
                            </button>
                          </div>
                        </div>

                        {showLyrics[song.id] && (
                          <div className="mb-3">
                            <h3 className="text-white font-semibold mb-1 text-sm sm:text-base sm:mb-2">Lyrics:</h3>
                            <div className="max-h-40 sm:max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                              <p className="text-purple-300 whitespace-pre-line text-sm sm:text-base">{song.lyrics}</p>
                            </div>
                          </div>
                        )}

                        <audio
                          id={`audio-${song.id}`}
                          src={song.audio_url}
                          onEnded={() => setCurrentlyPlaying(null)}
                          className="hidden"
                        />
                        
                        {/* Voting Component */}
                        <div className="mt-2 sm:mt-4 border-t border-purple-800/30 pt-3 sm:pt-4">
                          <SongVote 
                            songId={song.id} 
                            onVote={(score) => handleVote(song.id, score)} 
                          />
                          
                          {song.average_score !== null && (
                            <div className="mt-2 sm:mt-3 text-center">
                              <span className="text-base sm:text-lg font-semibold text-green-500">
                                {song.average_score}/10
                              </span>
                              <span className="text-xs sm:text-sm text-purple-300 ml-2">
                                ({song.vote_count} {song.vote_count === 1 ? 'vote' : 'votes'})
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="charts">
              <div className="space-y-4">
                <div className="bg-purple-900/30 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-500 mb-4">Song Rankings</h3>
                  
                  {rankingsLoading ? (
                    <div className="text-purple-300">Loading rankings...</div>
                  ) : rankings.length === 0 ? (
                    <p className="text-purple-300">No votes yet. Be the first to vote!</p>
                  ) : (
                    <div className="space-y-3">
                      {rankings.map((song, index) => (
                        <div 
                          key={song.id}
                          onClick={() => handlePlay(song.id)}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-purple-900/50 transition-colors ${currentlyPlaying === song.id ? 'bg-purple-900/70 border border-green-500/30' : 'bg-purple-950/50'}`}
                        >
                          {/* Title at the top */}
                          <div className="mb-2 flex items-center">
                            <h4 className="text-white text-sm font-medium truncate">{song.title}</h4>
                            {currentlyPlaying === song.id && (
                              <span className="ml-2 text-green-500 text-xs animate-pulse">▶ Playing</span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center">
                            {/* Rank and image */}
                            <div className="flex items-center">
                              <span className="text-base font-bold text-purple-300 mr-2">#{index + 1}</span>
                              {song.image_url && (
                                <div className="relative w-8 h-8 rounded overflow-hidden">
                                  <Image
                                    src={song.image_url}
                                    alt={song.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Score */}
                            <div className="flex items-center">
                              <span className={`text-base font-semibold text-green-500 ${currentlyPlaying === song.id ? 'animate-pulse' : ''}`}>
                                {song.average_score}/10
                              </span>
                              <span className="text-xs text-purple-300 ml-1">
                                ({song.vote_count === 1 ? '1' : song.vote_count})
                              </span>
                            </div>
                          </div>
                          
                          <audio
                            id={`audio-${song.id}`}
                            src={song.audio_url}
                            onEnded={() => setCurrentlyPlaying(null)}
                            className="hidden"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-purple-900/30 p-4 rounded-lg sm:block hidden">
                  <h3 className="text-lg font-semibold text-green-500 mb-2">Privacy Information</h3>
                  <p className="text-purple-300">
                    All votes are anonymous and reset daily. Only you can see what you voted. 
                    We only track what the crowd loves, not who voted for what.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            {content}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
