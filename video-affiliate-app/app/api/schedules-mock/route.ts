import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Simple validation schema
const createScheduleSchema = z.object({
  reviewId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  targetType: z.enum(['page', 'group']),
  targetId: z.string().optional(),
  targetName: z.string().optional(),
  postMessage: z.string().optional(),
  landingPageUrl: z.string().optional(),
});

// Mock schedule creation (for testing without database)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📤 Received schedule data:', body);
    
    // Validate input
    const validatedData = createScheduleSchema.parse(body);
    console.log('✅ Validation passed:', validatedData);
    
    // Create mock schedule
    const mockSchedule = {
      id: 'mock-schedule-' + Date.now(),
      user_id: 'default-user-id',
      review_id: validatedData.reviewId,
      scheduled_for: validatedData.scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: validatedData.targetType,
      target_id: validatedData.targetId || 'make-com-handled',
      target_name: validatedData.targetName || 'Make.com Auto',
      post_message: validatedData.postMessage || 'Auto-generated from review',
      landing_page_url: validatedData.landingPageUrl || 'https://example.com/review/auto',
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    console.log('✅ Mock schedule created:', mockSchedule.id);
    
    return NextResponse.json({
      success: true,
      data: mockSchedule,
      message: 'Mock schedule created successfully (database not available)',
    });

  } catch (error) {
    console.error('Error creating mock schedule:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.errors);
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
        error: 'Failed to create mock schedule',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
