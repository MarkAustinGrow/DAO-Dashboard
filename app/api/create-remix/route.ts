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
    const title = `Remix of ${originalSongTitle || 'Unknown'}`;
    
    const { data, error } = await supabase
      .from('songs')
      .insert({
        title,
        params_used: JSON.stringify(params),
        original_song_id: originalSongId,
        status: 'pending',
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
      songId: data.id,
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
