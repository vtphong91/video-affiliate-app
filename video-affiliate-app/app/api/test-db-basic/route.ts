import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple test API
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Simple database test...');
    
    // Test 1: Basic connection
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, video_title')
      .limit(3);
    
    if (reviewsError) {
      console.log('❌ Reviews query failed:', reviewsError);
      return NextResponse.json({
        success: false,
        error: 'Reviews query failed',
        details: reviewsError.message
      }, { status: 500 });
    }
    
    console.log('✅ Reviews query successful:', reviews);
    
    // Test 2: Check schedules table
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('*')
      .limit(1);
    
    if (schedulesError) {
      console.log('❌ Schedules query failed:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Schedules query failed',
        details: schedulesError.message,
        code: schedulesError.code,
        hint: schedulesError.hint,
        reviews: reviews
      }, { status: 500 });
    }
    
    console.log('✅ Schedules query successful:', schedules);
    
    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      data: {
        reviews: reviews,
        schedules: schedules
      }
    });
    
  } catch (error) {
    console.error('❌ Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
