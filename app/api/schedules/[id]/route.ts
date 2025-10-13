import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// Validation schema for updates
const updateScheduleSchema = z.object({
  scheduled_for: z.string().optional(), // Remove .datetime() validation to be more flexible
  scheduledFor: z.string().optional(), // Keep for backward compatibility
  targetType: z.enum(['page', 'group']).optional(),
  targetId: z.string().min(1).optional(),
  targetName: z.string().optional(),
  postMessage: z.string().min(1).optional(),
  landingPageUrl: z.string().url().optional(),
  status: z.enum(['pending', 'processing', 'posted', 'failed', 'cancelled']).optional(),
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

    // Convert camelCase to snake_case for database
    const updateData: any = {};
    if (validatedData.scheduled_for) updateData.scheduled_for = validatedData.scheduled_for;
    if (validatedData.scheduledFor) updateData.scheduled_for = validatedData.scheduledFor; // Backward compatibility
    if (validatedData.targetType) updateData.target_type = validatedData.targetType;
    if (validatedData.targetId) updateData.target_id = validatedData.targetId;
    if (validatedData.targetName) updateData.target_name = validatedData.targetName;
    if (validatedData.postMessage) updateData.post_message = validatedData.postMessage;
    if (validatedData.landingPageUrl) updateData.landing_page_url = validatedData.landingPageUrl;
    if (validatedData.status) updateData.status = validatedData.status;

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
