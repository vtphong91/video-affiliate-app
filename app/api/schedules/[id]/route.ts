import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema for updates
const updateScheduleSchema = z.object({
  scheduledFor: z.string().datetime().optional(),
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
    const schedule = await db.getSchedule(params.id);

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
    const body = await request.json();
    
    // Validate input
    const validatedData = updateScheduleSchema.parse(body);
    
    // Convert camelCase to snake_case for database
    const updateData: any = {};
    if (validatedData.scheduledFor) updateData.scheduled_for = validatedData.scheduledFor;
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
