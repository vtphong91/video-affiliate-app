import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple database connection test
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test 1: Basic connection
    const { data: testData, error: testError } = await supabase
      .from('reviews')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: testError.message,
        code: testError.code
      }, { status: 500 });
    }
    
    console.log('✅ Database connection successful');
    
    // Test 2: Check if schedules table exists
    let schedulesTableExists = false;
    try {
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('id')
        .limit(1);
      
      if (!schedulesError) {
        schedulesTableExists = true;
        console.log('✅ Schedules table exists');
      } else {
        console.log('⚠️ Schedules table does not exist:', schedulesError.message);
      }
    } catch (error) {
      console.log('⚠️ Schedules table check failed:', error);
    }
    
    // Test 3: Get basic stats
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('id, status');
    
    const reviewsCount = reviewsData?.length || 0;
    const reviewsByStatus = reviewsData?.reduce((acc, review) => {
      const status = review.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        reviewsCount,
        reviewsByStatus,
        schedulesTableExists
      },
      connection: {
        status: 'connected',
        timestamp: new Date().toISOString()
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