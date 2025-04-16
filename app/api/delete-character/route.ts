import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
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
    
    // Get the character ID from the URL query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      );
    }
    
    // Delete the character from the database - using the correct table name
    const { error } = await supabase
      .from('character_files')  // Changed from 'characters' to 'character_files'
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Server: Error deleting character:', error);
      return NextResponse.json({ 
        error: `Database error: ${error.message || 'Unknown database error'}`,
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json(
      { message: 'Character deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Server: Unhandled error:', error);
    return NextResponse.json({ 
      error: `Unhandled error: ${error?.message || 'Unknown error'}`,
      stack: error?.stack
    }, { status: 500 });
  }
}
