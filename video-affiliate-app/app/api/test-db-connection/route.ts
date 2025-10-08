import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Test database connection
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Simple query
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, video_title')
      .limit(1);
    
    if (reviewsError) {
      console.log('❌ Reviews error:', reviewsError);
      return NextResponse.json({
        success: false,
        error: 'Reviews query failed',
        details: reviewsError.message
      }, { status: 500 });
    }
    
    console.log('✅ Reviews query successful:', reviews);
    
    // Test 2: Schedules table
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('id, status')
      .limit(1);
    
    if (schedulesError) {
      console.log('❌ Schedules error:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Schedules query failed',
        details: schedulesError.message
      }, { status: 500 });
    }
    
    console.log('✅ Schedules query successful:', schedules);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        reviews: reviews,
        schedules: schedules
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
