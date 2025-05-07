import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    // Get the character ID from the query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }
    
    // Check if environment variables are set
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
    
    // Initialize Supabase client with admin privileges to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'X-Supabase-Auth-Override': 'service_role'
        }
      }
    });
    
    console.log('Server: Using service role key to bypass RLS policies');
    
    // Fetch the character by ID
    const { data, error } = await supabase
      .from('character_files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Server: Error fetching character:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }
    
    if (!data) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    console.log('Server: Successfully fetched character:', data.id);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
