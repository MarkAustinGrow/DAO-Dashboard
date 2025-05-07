import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Check if environment variables are set - use SUPABASE_KEY directly
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
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
    
    // Log connection details
    console.log('Server: Supabase connection details:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
      keyFirstChars: supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'none',
    });
    
    // Log the exact key being used (first few characters)
    console.log('Server: Service role key starts with:', supabaseKey.substring(0, 20));
    
    // Try a simpler query without any filters or ordering
    console.log('Server: Querying character_files table with a simple query');
    const { data, error } = await supabase
      .from('character_files')
      .select('*');
      
    // Log the exact SQL query being executed (if available)
    console.log('Server: Query details:', {
      table: 'character_files',
      method: 'select',
      filters: 'none',
      error: error ? JSON.stringify(error) : 'none'
    });
    
    // If no data found, try different approaches
    if (!data || data.length === 0) {
      console.log('Server: No data found, trying alternative approaches');
      
      // 1. Try with a different table name case
      console.log('Server: Trying with different table name case: "Character_Files"');
      const { data: caseData, error: caseError } = await supabase
        .from('Character_Files')
        .select('*');
      
      if (caseError) {
        console.log('Server: Case-sensitive table name failed:', caseError.message);
      } else if (caseData && caseData.length > 0) {
        console.log('Server: Found data with case-sensitive table name!');
        return NextResponse.json(caseData);
      }
      
      // 1.5. Try with "characters" table name
      console.log('Server: Trying with "characters" table name');
      const { data: charactersData, error: charactersError } = await supabase
        .from('characters')
        .select('*');
      
      if (charactersError) {
        console.log('Server: "characters" table name failed:', charactersError.message);
      } else if (charactersData && charactersData.length > 0) {
        console.log('Server: Found data in "characters" table!');
        return NextResponse.json(charactersData);
      }
      
      // 2. Try with a specific ID from the data we know exists
      console.log('Server: Trying to query a specific character by ID');
      const { data: idData, error: idError } = await supabase
        .from('character_files')
        .select('*')
        .eq('id', 'a7b57067-4b19-41db-986e-dc47f8fd0f77'); // Yona's ID from the JSON
      
      if (idError) {
        console.log('Server: Query by ID failed:', idError.message);
      } else {
        console.log('Server: Query by ID result:', idData);
      }
      
      // 3. Try with a raw SQL query
      console.log('Server: Trying with raw SQL via rpc');
      try {
        const { data: sqlData, error: sqlError } = await supabase.rpc('run_sql', {
          query: 'SELECT * FROM character_files LIMIT 10'
        });
        
        if (sqlError) {
          console.log('Server: Raw SQL failed:', sqlError.message);
        } else {
          console.log('Server: Raw SQL result:', sqlData);
        }
      } catch (e) {
        console.log('Server: Raw SQL exception:', e);
      }
      
      // 4. List all tables to verify connection
      console.log('Server: Listing all tables');
      try {
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_schema, table_name')
          .eq('table_schema', 'public');
          
        if (tablesError) {
          console.error('Server: Error listing tables:', tablesError);
        } else {
          console.log('Server: Available tables:', tables);
        }
      } catch (e) {
        console.log('Server: List tables exception:', e);
      }
    }
    
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
