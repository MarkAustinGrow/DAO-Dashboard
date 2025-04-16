import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
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
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const characterData = await request.json();
    
    if (!characterData || !characterData.name) {
      return NextResponse.json({ error: 'Invalid character data' }, { status: 400 });
    }
    
    console.log('Server: Saving character with name:', characterData.name);
    
    // Insert character into database
    const { data, error } = await supabase
      .from('character_files')
      .insert({
        agent_name: characterData.name.toLowerCase(),
        display_name: characterData.name,
        content: characterData,
        version: 1,
        is_active: true
      })
      .select();
    
    if (error) {
      console.error('Server: Error saving character:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message}`,
        details: error
      }, { status: 500 });
    }
    
    console.log('Server: Character saved successfully:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
