import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { songId, score, timestamp } = await request.json();
    
    // Validate input
    if (!songId || typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Server: Missing environment variables', { 
        hasUrl: !!supabaseUrl, 
        hasServiceKey: !!supabaseServiceKey 
      });
      return NextResponse.json({ 
        error: 'Server configuration error: Missing environment variables' 
      }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Store the vote
    const { error: voteError } = await supabase
      .from('song_votes')
      .insert({
        song_id: songId,
        score,
        timestamp: timestamp || new Date().toISOString()
      });
    
    if (voteError) {
      console.error('Error storing vote:', voteError);
      return NextResponse.json({ error: 'Failed to store vote' }, { status: 500 });
    }
    
    // Update song's average score and vote count
    const { data: voteData, error: countError } = await supabase
      .from('song_votes')
      .select('score')
      .eq('song_id', songId);
    
    if (countError) {
      console.error('Error counting votes:', countError);
      return NextResponse.json({ error: 'Failed to update song stats' }, { status: 500 });
    }
    
    const voteCount = voteData.length;
    const totalScore = voteData.reduce((sum, vote) => sum + vote.score, 0);
    const averageScore = voteCount > 0 ? parseFloat((totalScore / voteCount).toFixed(1)) : null;
    
    const { error: updateError } = await supabase
      .from('songs')
      .update({
        average_score: averageScore,
        vote_count: voteCount
      })
      .eq('id', songId);
    
    if (updateError) {
      console.error('Error updating song stats:', updateError);
      return NextResponse.json({ error: 'Failed to update song stats' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, averageScore, voteCount });
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
