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
    
    // Get songs ordered by average score
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, average_score, vote_count, image_url, audio_url')
      .not('average_score', 'is', null)
      .order('average_score', { ascending: false })
      .order('vote_count', { ascending: false });
    
    if (error) {
      console.error('Error fetching song rankings:', error);
      return NextResponse.json({ error: 'Failed to fetch rankings' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
