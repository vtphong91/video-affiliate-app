import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Create schedules table and test schedule creation
export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Creating schedules table and testing...');
    
    // Step 1: Create schedules table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL DEFAULT 'default-user',
        review_id UUID NOT NULL,
        scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
        timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
        target_type TEXT NOT NULL DEFAULT 'page',
        target_id TEXT NOT NULL DEFAULT 'make-com-handled',
        target_name TEXT DEFAULT 'Make.com Auto',
        post_message TEXT NOT NULL DEFAULT 'Auto-generated from review',
        landing_page_url TEXT NOT NULL DEFAULT 'https://example.com/review/auto',
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
    
    // Step 2: Test inserting a schedule
    const testSchedule = {
      user_id: 'default-user',
      review_id: '123e4567-e89b-12d3-a456-426614174000', // Test UUID
      scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'make-com-handled',
      target_name: 'Make.com Auto',
      post_message: 'Test schedule from API',
      landing_page_url: 'https://example.com/test',
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    };
    
    const { data: insertedSchedule, error: insertError } = await supabaseAdmin
      .from('schedules')
      .insert(testSchedule)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting test schedule:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test schedule',
        details: insertError.message
      }, { status: 500 });
    }
    
    console.log('✅ Test schedule inserted successfully:', insertedSchedule.id);
    
    // Step 3: Test reading schedules
    const { data: schedules, error: readError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (readError) {
      console.error('Error reading schedules:', readError);
      return NextResponse.json({
        success: false,
        error: 'Failed to read schedules',
        details: readError.message
      }, { status: 500 });
    }
    
    console.log('✅ Schedules read successfully:', schedules.length, 'schedules found');
    
    // Clean up test schedule
    await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', insertedSchedule.id);
    
    console.log('✅ Test schedule cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Schedules table created and tested successfully',
      results: {
        tableCreated: true,
        testInsert: true,
        testRead: true,
        schedulesCount: schedules.length,
        testScheduleId: insertedSchedule.id
      }
    });
    
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
