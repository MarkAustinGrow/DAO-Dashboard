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
    
    // Create a new remix entry in the influence_music table
    const title = `Remix of ${originalSongTitle || 'Unknown'}`;
    
    // Create a placeholder URL or use a default one
    const url = `https://www.marvin-music.com/remix/${crypto.randomUUID()}`;
    
    // Add title to the params object
    params.title = title;
    
    const { data, error } = await supabase
      .from('influence_music')
      .insert({
        url: url,
        analysis: params, // Store the params directly in the analysis field
        song_id: null, // Set song_id to NULL as specified
        created_at: new Date().toISOString()
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
      remixId: data.id,
      title
    });
  } catch (error: any) {
    console.error('Error in create-remix route:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
