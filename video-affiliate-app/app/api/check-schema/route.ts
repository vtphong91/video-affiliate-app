import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API để check database schema và test insert
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking database schema...');
    
    // Test 1: Check if schedules table exists and get its structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'schedules')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('❌ Error getting table info:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to get table info',
        details: tableError.message
      }, { status: 500 });
    }
    
    console.log('📊 Schedules table columns:', tableInfo);
    
    // Test 2: Try a simple insert to see what happens
    const testData = {
      user_id: 'test-user',
      review_id: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
      scheduled_for: '2025-01-08T11:20:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'test-target',
      target_name: 'Test Target',
      post_message: 'Test message',
      landing_page_url: 'https://test.com',
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📤 Testing insert with data:', testData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('schedules')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: insertError.message,
        code: insertError.code,
        hint: insertError.hint,
        tableInfo
      }, { status: 500 });
    }
    
    console.log('✅ Insert successful:', insertResult);
    
    // Clean up test data
    await supabase
      .from('schedules')
      .delete()
      .eq('id', insertResult.id);
    
    return NextResponse.json({
      success: true,
      message: 'Database schema check successful',
      tableInfo,
      testInsert: {
        success: true,
        insertedId: insertResult.id
      }
    });
    
  } catch (error) {
    console.error('❌ Schema check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Schema check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
