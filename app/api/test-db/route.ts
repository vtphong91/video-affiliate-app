import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple test endpoint to check database query
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test endpoint called - checking database...');

    // Test 1: Get all pending schedules
    console.log('📋 Test 1: Getting all pending schedules...');
    const { data: allPendingSchedules, error: pendingError } = await db.supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (pendingError) {
      console.error('❌ Error fetching pending schedules:', pendingError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: pendingError.message
      }, { status: 500 });
    }

    console.log(`📋 Found ${allPendingSchedules?.length || 0} pending schedules`);

    // Test 2: Get schedules using getPendingSchedules method
    console.log('📋 Test 2: Using getPendingSchedules method...');
    const dueSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${dueSchedules.length} due schedules`);

    // Test 3: Check current time
    const now = new Date();
    const gmt7Offset = 7 * 60 * 60 * 1000;
    const currentGMT7 = new Date(now.getTime() + gmt7Offset);

    const result = {
      success: true,
      message: 'Database test completed',
      data: {
        currentTime: {
          utc: now.toISOString(),
          gmt7: currentGMT7.toISOString(),
          gmt7Formatted: currentGMT7.toLocaleString('en-US', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        },
        allPendingSchedules: {
          count: allPendingSchedules?.length || 0,
          schedules: (allPendingSchedules || []).map(schedule => ({
            id: schedule.id.substring(0, 8) + '...',
            scheduled_for: schedule.scheduled_for,
            status: schedule.status,
            timezone: schedule.timezone
          }))
        },
        dueSchedules: {
          count: dueSchedules.length,
          schedules: dueSchedules.map(schedule => ({
            id: schedule.id.substring(0, 8) + '...',
            scheduled_for: schedule.scheduled_for,
            status: schedule.status,
            timezone: schedule.timezone
          }))
        },
        comparison: {
          allPendingCount: allPendingSchedules?.length || 0,
          dueSchedulesCount: dueSchedules.length,
          difference: (allPendingSchedules?.length || 0) - dueSchedules.length
        }
      }
    };

    console.log('✅ Test completed:', {
      allPending: allPendingSchedules?.length || 0,
      dueSchedules: dueSchedules.length,
      difference: (allPendingSchedules?.length || 0) - dueSchedules.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        message: 'Failed to test database'
      },
      { status: 500 }
    );
  }
}
