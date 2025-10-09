import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Debug API để test schedules creation với logging chi tiết
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug schedules creation...');
    
    const body = await request.json();
    console.log('📥 Request body:', body);
    
    // Test validation
    const createScheduleSchema = z.object({
      reviewId: z.string().min(1),
      scheduledFor: z.string().datetime(),
      targetType: z.enum(['page', 'group']),
      targetId: z.string().optional(),
      targetName: z.string().optional(),
      postMessage: z.string().optional(),
      landingPageUrl: z.string().optional(),
    });
    
    console.log('🔍 Validating input...');
    const validatedData = createScheduleSchema.parse(body);
    console.log('✅ Validation passed:', validatedData);
    
    // Test db.createSchedule
    console.log('📤 Testing db.createSchedule...');
    const userId = 'default-user-id';
    
    const scheduleData = {
      user_id: userId,
      review_id: validatedData.reviewId,
      scheduled_for: validatedData.scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: validatedData.targetType,
      target_id: validatedData.targetId || 'make-com-handled',
      target_name: validatedData.targetName || 'Make.com Auto',
      post_message: validatedData.postMessage || 'Auto-generated from review',
      landing_page_url: validatedData.landingPageUrl || 'https://example.com/review/auto',
      status: 'pending' as const,
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📋 Schedule data to insert:', scheduleData);
    
    const schedule = await db.createSchedule(scheduleData);
    console.log('✅ Schedule created successfully:', schedule.id);
    
    // Clean up
    await db.deleteSchedule(schedule.id);
    console.log('🗑️ Test schedule cleaned up');
    
    return NextResponse.json({
      success: true,
      message: 'Debug test successful',
      data: {
        validationPassed: true,
        scheduleCreated: true,
        scheduleId: schedule.id
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    
    if (error instanceof z.ZodError) {
      console.error('❌ Validation errors:', error.errors);
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
