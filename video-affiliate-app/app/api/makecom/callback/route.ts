import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Callback handler for Make.com webhook responses
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId, status, facebookPostId, facebookPostUrl, error } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'scheduleId is required' },
        { status: 400 }
      );
    }

    console.log(`📞 Received callback for schedule ${scheduleId}:`, { status, facebookPostId, facebookPostUrl, error });

    // Get the schedule
    const schedule = await db.getSchedule(scheduleId);
    
    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found' },
        { status: 404 }
      );
    }

    // Update schedule based on callback status
    const updateData: any = {};

    if (status === 'success') {
      updateData.status = 'posted';
      updateData.posted_at = new Date().toISOString();
      
      if (facebookPostId) {
        updateData.facebook_post_id = facebookPostId;
      }
      
      if (facebookPostUrl) {
        updateData.facebook_post_url = facebookPostUrl;
      }
      
      // Clear any error messages
      updateData.error_message = null;
      
    } else if (status === 'failed') {
      updateData.status = 'failed';
      updateData.error_message = error || 'Posting failed';
      
      // Schedule for retry if not exceeded max retries
      if (schedule.retry_count < schedule.max_retries) {
        const nextRetryAt = new Date();
        nextRetryAt.setMinutes(nextRetryAt.getMinutes() + 15); // Retry in 15 minutes
        
        updateData.retry_count = schedule.retry_count + 1;
        updateData.next_retry_at = nextRetryAt.toISOString();
      }
    }

    // Update the schedule
    const updatedSchedule = await db.updateSchedule(scheduleId, updateData);

    // Log the callback
    await db.createWebhookLog({
      schedule_id: scheduleId,
      request_payload: body,
      response_status: 200,
      response_received_at: new Date().toISOString(),
      retry_attempt: schedule.retry_count,
    });

    console.log(`✅ Schedule ${scheduleId} updated:`, updateData);

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule,
    });

  } catch (error) {
    console.error('❌ Callback error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Callback processing failed',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Make.com callback endpoint is healthy',
    timestamp: new Date().toISOString(),
  });
}
