import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple test API để debug database insert
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing database insert after schema fix...');
    
    const testData = {
      user_id: 'default-user-id',
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
    
    console.log('📤 Inserting test data:', testData);
    
    const { data, error } = await supabase
      .from('schedules')
      .insert(testData)
      .select()
      .single();
    
    if (error) {
      console.log('❌ Insert error:', error);
      return NextResponse.json({
        success: false,
        error: 'Insert failed',
        details: error.message,
        code: error.code,
        hint: error.hint
      }, { status: 500 });
    }
    
    console.log('✅ Insert successful:', data);
    
    // Clean up
    await supabase
      .from('schedules')
      .delete()
      .eq('id', data.id);
    
    return NextResponse.json({
      success: true,
      message: 'Database insert test successful',
      data: data
    });
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
