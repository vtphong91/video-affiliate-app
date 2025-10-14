import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getCurrentTimestamp, createTimestampFromDatePicker } from '@/lib/utils/timezone-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Supabase Timezone Behavior API called');
    
    // Test 1: Get current time in different formats
    const now = new Date();
    const nowISO = now.toISOString();
    const nowGMT7 = getCurrentTimestamp();
    
    console.log('🕐 Time formats:', {
      local: now.toLocaleString(),
      iso: nowISO,
      gmt7: nowGMT7
    });
    
    // Test 2: Create a test timestamp using createTimestampFromDatePicker
    const testDate = new Date();
    testDate.setHours(14, 30, 0, 0); // 2:30 PM local time
    const testTime = '14:30';
    const testTimestamp = createTimestampFromDatePicker(testDate, testTime);
    
    console.log('🧪 Test timestamp:', {
      inputDate: testDate.toLocaleString(),
      inputTime: testTime,
      outputTimestamp: testTimestamp
    });
    
    // Test 3: Check database column type
    const { data: columnInfo, error: columnError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'schedules')
      .eq('column_name', 'scheduled_for');
    
    if (columnError) {
      console.error('❌ Error fetching column info:', columnError);
    }
    
    // Test 4: Get sample schedules to see actual format
    const { data: schedules, error: schedulesError } = await supabaseAdmin
      .from('schedules')
      .select('id, video_title, scheduled_for, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (schedulesError) {
      console.error('❌ Error fetching schedules:', schedulesError);
    }
    
    // Test 5: Test query with different time formats
    const { data: pendingWithUTC, error: utcError } = await supabaseAdmin
      .from('schedules')
      .select('id, scheduled_for')
      .eq('status', 'pending')
      .lte('scheduled_for', nowISO);
    
    const { data: pendingWithGMT7, error: gmt7Error } = await supabaseAdmin
      .from('schedules')
      .select('id, scheduled_for')
      .eq('status', 'pending')
      .lte('scheduled_for', nowGMT7);
    
    console.log('🔍 Query results:', {
      utcQuery: { count: pendingWithUTC?.length || 0, error: utcError?.message },
      gmt7Query: { count: pendingWithGMT7?.length || 0, error: gmt7Error?.message }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        timeFormats: {
          local: now.toLocaleString(),
          iso: nowISO,
          gmt7: nowGMT7
        },
        testTimestamp: {
          inputDate: testDate.toLocaleString(),
          inputTime: testTime,
          outputTimestamp: testTimestamp
        },
        columnInfo: columnInfo?.[0] || null,
        sampleSchedules: schedules?.map(s => ({
          id: s.id,
          video_title: s.video_title,
          scheduled_for: s.scheduled_for,
          status: s.status
        })) || [],
        queryResults: {
          utcQuery: { count: pendingWithUTC?.length || 0, error: utcError?.message },
          gmt7Query: { count: pendingWithGMT7?.length || 0, error: gmt7Error?.message }
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in test Supabase timezone behavior API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test Supabase timezone behavior',
      details: error
    }, { status: 500 });
  }
}


