import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check if environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    
    // Explicitly use the service role key to bypass RLS
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    console.log('Server: Using service role key to bypass RLS policies');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Server: Missing environment variables', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      return NextResponse.json({ 
        error: 'Server configuration error: Missing environment variables' 
      }, { status: 500 });
    }
    
    // Initialize Supabase client with available key
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    // Log connection details
    console.log('Server: Supabase connection details:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      keyFirstChars: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'none',
    });
    
    // Simple direct query with service role key to bypass RLS
    console.log('Server: Querying character_files table with service role key');
    const { data, error } = await supabase
      .from('character_files')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Server: Error fetching characters:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }
    
    console.log('Server: Successfully fetched characters:', data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
