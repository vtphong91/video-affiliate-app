import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/debug-update-schedule
 * Debug API để test chức năng update schedule
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Debug update schedule functionality...');

    const body = await request.json();
    const { scheduleId, newTime } = body;

    if (!scheduleId || !newTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule ID and new time are required' 
      }, { status: 400 });
    }

    // Step 1: Get authenticated user ID
    console.log('🔍 Step 1: Getting user ID...');
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required' 
      }, { status: 401 });
    }
    console.log('✅ User ID:', userId);

    // Step 2: Get the schedule
    console.log('🔍 Step 2: Getting schedule...');
    const { data: schedule, error: fetchError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError || !schedule) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule not found',
        details: fetchError
      }, { status: 404 });
    }
    console.log('✅ Schedule found:', { id: schedule.id, user_id: schedule.user_id, scheduled_for: schedule.scheduled_for });

    // Step 3: Check ownership
    console.log('🔍 Step 3: Checking ownership...');
    if (schedule.user_id !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized access to schedule',
        details: { scheduleUserId: schedule.user_id, requestUserId: userId }
      }, { status: 403 });
    }
    console.log('✅ Ownership verified');

    // Step 4: Validate time
    console.log('🔍 Step 4: Validating time...');
    const scheduledTime = new Date(newTime);
    const now = new Date();
    const maxFutureTime = new Date();
    maxFutureTime.setFullYear(maxFutureTime.getFullYear() + 1);

    console.log('Time validation:', {
      scheduledTime: scheduledTime.toISOString(),
      now: now.toISOString(),
      maxFutureTime: maxFutureTime.toISOString(),
      isFuture: scheduledTime > now,
      isWithinLimit: scheduledTime <= maxFutureTime
    });

    if (scheduledTime <= now) {
      return NextResponse.json({ 
        success: false, 
        error: 'Thời gian đăng bài phải trong tương lai' 
      }, { status: 400 });
    }

    if (scheduledTime > maxFutureTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Thời gian đăng bài không được quá 1 năm trong tương lai' 
      }, { status: 400 });
    }
    console.log('✅ Time validation passed');

    // Step 5: Update schedule
    console.log('🔍 Step 5: Updating schedule...');
    const { data: updatedSchedule, error: updateError } = await supabaseAdmin
      .from('schedules')
      .update({ scheduled_for: newTime })
      .eq('id', scheduleId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Update failed', 
        details: updateError 
      }, { status: 500 });
    }
    console.log('✅ Schedule updated successfully');

    return NextResponse.json({
      success: true,
      debug: {
        steps: [
          '✅ User authentication',
          '✅ Schedule retrieval',
          '✅ Ownership verification',
          '✅ Time validation',
          '✅ Database update'
        ],
        originalTime: schedule.scheduled_for,
        newTime: updatedSchedule.scheduled_for,
        updateSuccessful: true
      },
      message: 'Schedule successfully updated'
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
