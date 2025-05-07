import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Server: Missing environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return NextResponse.json({ 
        error: 'Server configuration error: Missing environment variables' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all songs with scores
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, average_score, vote_count, image_url, audio_url')
      .not('average_score', 'is', null);
      
    if (error) {
      console.error('Error fetching song rankings:', error);
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
    }
    
    // Calculate weighted scores using a Bayesian average
    // This gives more weight to songs with more votes
    const minVotes = 5; // Minimum votes required for full weight
    const globalAverage = data.reduce((sum: number, song: any) => sum + (song.average_score || 0), 0) / data.length || 5;
    
    const rankedData = data.map((song: any) => {
      // Calculate weighted score using Bayesian average
      // Formula: (v / (v + m)) * R + (m / (v + m)) * C
      // Where:
      // v = number of votes for the song
      // m = minimum votes required
      // R = average rating of the song
      // C = average rating across all songs
      const votes = song.vote_count || 0;
      const rating = song.average_score || 0;
      const weightedScore = (votes / (votes + minVotes)) * rating + (minVotes / (votes + minVotes)) * globalAverage;
      
      return {
        ...song,
        weighted_score: parseFloat(weightedScore.toFixed(2))
      };
    });
    
    // Sort by weighted score
    rankedData.sort((a: any, b: any) => b.weighted_score - a.weighted_score);
    
    // Return the ranked data
    return NextResponse.json(rankedData || []);
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
