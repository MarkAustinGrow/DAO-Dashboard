import { NextRequest, NextResponse } from 'next/server';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { params, originalSongTitle, originalSongId } = await request.json();
    
    console.log('Creating remix with params:', {
      paramsSize: JSON.stringify(params).length,
      originalSongTitle,
      originalSongHasId: !!originalSongId
    });
    
    // Validate input
    if (!params) {
      return NextResponse.json(
        { error: 'Remix parameters are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabase = createClientComponentClient();
    
    // Generate a URL for the remix
    // This is a placeholder - you might want to implement a more sophisticated URL generation
    const url = `https://www.marvin-music.com/remix/${uuidv4()}`;
    
    // Prepare the analysis JSON
    const analysis = {
      // Include original parameters
      ...params,
      
      // Add metadata
      remix_info: {
        created_at: new Date().toISOString(),
        original_song_title: originalSongTitle || 'Unknown',
        original_song_id: originalSongId || null,
        is_remix: true
      },
      
      // Format the proportions data if needed
      genre_proportions: formatProportions(params.genreProportions),
      mood_proportions: formatProportions(params.moodProportions),
      timbre_proportions: formatProportions(params.timbreProportions),
      
      // Include lyrics
      lyrics: params.lyrics,
      
      // Include other parameters
      type: params.type,
      gender: params.gender,
      duration: params.duration,
      
      // Add a timestamp
      timestamp: new Date().toISOString()
    };
    
    // Insert the new record into the influence_music table
    const { data, error } = await supabase
      .from('influence_music')
      .insert([
        {
          song_id: null, // As specified, this should be NULL
          url: url,
          analysis: analysis
        }
      ])
      .select();
    
    if (error) {
      console.error('Error creating remix:', error);
      return NextResponse.json(
        { error: `Failed to create remix: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('Remix created successfully:', data);
    
    return NextResponse.json({
      success: true,
      message: 'Remix created successfully',
      data: data
    });
  } catch (error: any) {
    console.error('Error in create-remix API:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}

// Helper function to format proportions data
function formatProportions(proportions: Array<{name: string, value: number}> = []) {
  if (!Array.isArray(proportions)) return [];
  
  return proportions.map(item => ({
    name: item.name,
    weight: item.value
  }));
}
