import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
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
    
    // Parse the JSON from the request
    const data = await request.json();
    let transformedData = data;
    
    // Check if it's in the old format (has 'name' but missing required fields)
    if (
      data.name && 
      (!data.display_name || !data.agent_name || !data.content)
    ) {
      console.log('Detected old character format, transforming to new format', { 
        originalName: data.name 
      });
      // Transform to the new format
      transformedData = {
        display_name: data.name,
        agent_name: data.name.toLowerCase(),
        content: data,
        version: data.version || 1,
        is_active: data.is_active !== undefined ? data.is_active : true,
      };
    }
    
    // Log the transformed data for debugging
    console.log('Character data after transformation:', { 
      hasDisplayName: !!transformedData.display_name,
      hasAgentName: !!transformedData.agent_name,
      hasContent: !!transformedData.content
    });
    
    // Validate the character data (using the potentially transformed data)
    if (!transformedData.display_name || !transformedData.agent_name || !transformedData.content) {
      return NextResponse.json(
        { error: 'Invalid character data. Required fields: display_name, agent_name, content' },
        { status: 400 }
      );
    }
    
    // Prepare the character data for insertion
    const characterData = {
      display_name: transformedData.display_name,
      agent_name: transformedData.agent_name,
      content: transformedData.content,
      version: transformedData.version || 1,
      is_active: transformedData.is_active !== undefined ? transformedData.is_active : true,
    };
    
    // Insert the character into the database - using the correct table name
    const { data: insertedCharacter, error } = await supabase
      .from('character_files')  // Changed from 'characters' to 'character_files'
      .insert(characterData)
      .select()
      .single();
    
    if (error) {
      console.error('Server: Error saving character:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message || 'Unknown database error'}`,
        details: error
      }, { status: 500 });
    }
    
    console.log('Server: Character saved successfully:', insertedCharacter);
    return NextResponse.json(insertedCharacter, { status: 201 });
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
