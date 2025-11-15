import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { WebhookLogService } from '@/lib/services/webhook-log-service';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/schedules/[id]/logs - Get webhook logs for a schedule
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    // Verify user owns this schedule
    const schedule = await db.getSchedule(params.id);
    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schedule not found'
        },
        { status: 404 }
      );
    }

    if (schedule.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to schedule'
        },
        { status: 403 }
      );
    }

    // Get webhook logs
    const webhookLogService = new WebhookLogService();
    const logs = await webhookLogService.getWebhookLogs(params.id);

    // Transform logs to simpler format for frontend
    const simplifiedLogs = logs.map(log => ({
      id: log.id,
      status: log.error_message ? 'failed' : 'success',
      error_message: log.error_message,
      response_status: log.response_status,
      retry_attempt: log.retry_attempt,
      created_at: log.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: simplifiedLogs,
    });

  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch webhook logs'
      },
      { status: 500 }
    );
  }
}
