import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: Request) {
  try {
    // Check if environment variables are set - use SUPABASE_KEY directly
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

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
    
    // Parse request body
    const characterData = await request.json();
    
    if (!characterData || !characterData.id) {
      return NextResponse.json({ error: 'Character ID is required' }, { status: 400 });
    }
    
    console.log('Server: Updating character with ID:', characterData.id);
    
    // Update character in database
    const { data, error } = await supabase
      .from('character_files')
      .update({
        agent_name: characterData.agent_name.toLowerCase(),
        display_name: characterData.display_name,
        content: characterData.content,
        version: characterData.version + 1, // Increment version
        is_active: characterData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', characterData.id)
      .select();
    
    if (error) {
      console.error('Server: Error updating character:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }
    
    console.log('Server: Character updated successfully:', data[0].id);
    return NextResponse.json(data[0]);
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
