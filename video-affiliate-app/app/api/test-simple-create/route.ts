import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple test API không có cleanup
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple schedules test...');
    
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
      scheduled_for: '2025-01-08T11:20:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'test-target',
      target_name: 'Test Target',
      post_message: 'Test message',
      landing_page_url: 'https://test.com',
      status: 'pending' as const,
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📤 Creating schedule...');
    const schedule = await db.createSchedule(scheduleData);
    console.log('✅ Schedule created:', schedule.id);
    
    return NextResponse.json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
