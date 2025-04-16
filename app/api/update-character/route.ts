import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(request: Request) {
  try {
    // Check if environment variables are set
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
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
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
