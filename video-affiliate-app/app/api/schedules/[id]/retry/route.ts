import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// POST /api/schedules/[id]/retry - Retry failed schedule
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the schedule
    const schedule = await db.getSchedule(params.id);
    
    if (schedule.status !== 'failed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only failed schedules can be retried' 
        },
        { status: 400 }
      );
    }

    if (schedule.retry_count >= schedule.max_retries) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum retry attempts exceeded' 
        },
        { status: 400 }
      );
    }

    // Reset schedule for retry
    const updateData = {
      status: 'pending' as const,
      retry_count: schedule.retry_count + 1,
      error_message: null,
      next_retry_at: null,
    };

    const updatedSchedule = await db.updateSchedule(params.id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule queued for retry',
    });

  } catch (error) {
    console.error('Error retrying schedule:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retry schedule' 
      },
      { status: 500 }
    );
  }
}
