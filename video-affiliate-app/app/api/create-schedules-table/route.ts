import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Create schedules table if it doesn't exist
export async function POST(request: NextRequest) {
  try {
    console.log('Creating schedules table...');
    
    // Check if schedules table exists
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'schedules');
    
    if (tablesError) {
      console.error('Error checking tables:', tablesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check tables',
        details: tablesError.message
      }, { status: 500 });
    }
    
    if (tables && tables.length > 0) {
      console.log('✅ Schedules table already exists');
      return NextResponse.json({
        success: true,
        message: 'Schedules table already exists'
      });
    }
    
    // Create schedules table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        review_id UUID NOT NULL,
        scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
        timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
        target_type TEXT NOT NULL CHECK (target_type IN ('page', 'group')),
        target_id TEXT NOT NULL,
        target_name TEXT,
        post_message TEXT NOT NULL,
        landing_page_url TEXT NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
        posted_at TIMESTAMP WITH TIME ZONE,
        facebook_post_id TEXT,
        facebook_post_url TEXT,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        max_retries INTEGER DEFAULT 3,
        next_retry_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.error('Error creating schedules table:', createError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create schedules table',
        details: createError.message
      }, { status: 500 });
    }
    
    console.log('✅ Schedules table created successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Schedules table created successfully'
    });
    
  } catch (error) {
    console.error('Create table error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedules table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
