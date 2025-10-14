import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// Validation schema for updates - ONLY allow time changes
const updateScheduleSchema = z.object({
  scheduled_for: z.string().min(1, 'Thời gian đăng bài không được để trống'),
  scheduledFor: z.string().optional(), // Keep for backward compatibility
});

// GET /api/schedules/[id] - Get single schedule
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

    console.log('👤 Authenticated user ID:', userId);

    const schedule = await db.getSchedule(params.id);

    // Verify user owns this schedule
    if (schedule.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to schedule'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Schedule not found'
      },
      { status: 404 }
    );
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
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

    console.log('👤 Authenticated user ID:', userId);

    // Check if schedule exists and user owns it
    const existingSchedule = await db.getSchedule(params.id);
    if (existingSchedule.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to schedule'
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateScheduleSchema.parse(body);

    // Convert camelCase to snake_case for database - ONLY time fields
    const updateData: any = {};
    if (validatedData.scheduled_for) updateData.scheduled_for = validatedData.scheduled_for;
    if (validatedData.scheduledFor) updateData.scheduled_for = validatedData.scheduledFor; // Backward compatibility
    
    // Add time validation
    const scheduledTime = new Date(updateData.scheduled_for);
    const now = new Date();
    const maxFutureTime = new Date();
    maxFutureTime.setFullYear(maxFutureTime.getFullYear() + 1); // Max 1 year in future
    
    if (scheduledTime <= now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thời gian đăng bài phải trong tương lai'
        },
        { status: 400 }
      );
    }
    
    if (scheduledTime > maxFutureTime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thời gian đăng bài không được quá 1 năm trong tương lai'
        },
        { status: 400 }
      );
    }

    const schedule = await db.updateSchedule(params.id, updateData);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule updated successfully',
    });

  } catch (error) {
    console.error('Error updating schedule:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update schedule'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
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

    console.log('👤 Authenticated user ID:', userId);

    // Check if schedule exists and user owns it
    const existingSchedule = await db.getSchedule(params.id);
    if (!existingSchedule) {
      return NextResponse.json(
        {
          success: false,
          error: 'Schedule not found'
        },
        { status: 404 }
      );
    }

    if (existingSchedule.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized access to schedule'
        },
        { status: 403 }
      );
    }

    await db.deleteSchedule(params.id);

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete schedule'
      },
      { status: 500 }
    );
  }
}
