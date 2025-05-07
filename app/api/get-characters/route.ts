import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
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
    
    // Initialize Supabase client with available key
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Log connection details
    console.log('Server: Supabase connection details:', {
      url: supabaseUrl,
      hasKey: !!supabaseKey,
    });
    
    // List all tables in the database using SQL
    console.log('Server: Attempting to list all tables in the database using SQL');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (tablesError) {
      console.error('Server: Error listing tables with SQL:', tablesError);
    } else {
      console.log('Server: Available tables from SQL query:', tables);
    }
    
    // Try to list tables using RPC (may not be available)
    console.log('Server: Attempting to list all tables using RPC');
    const { data: rpcTables, error: rpcTablesError } = await supabase
      .rpc('list_tables');
    
    if (rpcTablesError) {
      console.error('Server: Error listing tables with RPC:', rpcTablesError);
    } else {
      console.log('Server: Available tables from RPC:', rpcTables);
    }
    
    // Try with raw SQL query
    console.log('Server: Trying to query with raw SQL');
    const { data: sqlData, error: sqlError } = await supabase
      .rpc('execute_sql', {
        query: 'SELECT * FROM character_files ORDER BY updated_at DESC'
      });
    
    if (sqlError) {
      console.error('Server: Error with SQL query:', sqlError);
    } else {
      console.log('Server: SQL query results:', sqlData);
    }
    
    // Try different table name variations with the API
    console.log('Server: Querying table: character_files in schema: public');
    
    // First try with explicit schema
    let result = await supabase
      .from('public.character_files')
      .select('*')
      .order('updated_at', { ascending: false });
    
    // If that fails, try without schema
    if (result.error) {
      console.log('Server: First query failed, trying without schema prefix:', result.error);
      result = await supabase
        .from('character_files')
        .select('*')
        .order('updated_at', { ascending: false });
    }
    
    // If that fails too, try with "characters" table name
    if (result.error) {
      console.log('Server: Second query failed, trying with characters table name');
      result = await supabase
        .from('characters')
        .select('*')
        .order('updated_at', { ascending: false });
    }
    
    const { data, error } = result;
    
    if (error) {
      console.error('Server: Error fetching characters:', error);
      console.error('Server: Full error details:', JSON.stringify(error));
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
