import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Test endpoint to check database connection and schedules table
export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if schedules table exists
    try {
      const schedules = await db.getSchedules();
      console.log('✅ Schedules table exists, found', schedules.length, 'schedules');
    } catch (error) {
      console.error('❌ Schedules table error:', error);
      return NextResponse.json({
        success: false,
        error: 'Schedules table not accessible',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 2: Check if reviews table exists
    try {
      const reviews = await db.getReviews({ limit: 1 });
      console.log('✅ Reviews table exists, found', reviews.length, 'reviews');
    } catch (error) {
      console.error('❌ Reviews table error:', error);
      return NextResponse.json({
        success: false,
        error: 'Reviews table not accessible',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Test 3: Try to create a test schedule
    try {
      const testSchedule = await db.createSchedule({
        user_id: 'test-user-id',
        review_id: '123e4567-e89b-12d3-a456-426614174000', // Test UUID
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: 'page',
        target_id: 'test-target-id',
        target_name: 'Test Target',
        post_message: 'Test message',
        landing_page_url: 'https://example.com/test',
        status: 'pending',
        retry_count: 0,
        max_retries: 3,
      });
      
      console.log('✅ Test schedule created:', testSchedule.id);
      
      // Clean up test schedule
      await db.deleteSchedule(testSchedule.id);
      console.log('✅ Test schedule cleaned up');
      
    } catch (error) {
      console.error('❌ Test schedule creation error:', error);
      return NextResponse.json({
        success: false,
        error: 'Test schedule creation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and tables are working correctly',
      tests: {
        schedulesTable: '✅ Working',
        reviewsTable: '✅ Working',
        scheduleCreation: '✅ Working'
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
