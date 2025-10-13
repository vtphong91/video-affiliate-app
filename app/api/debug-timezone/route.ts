import { NextRequest, NextResponse } from 'next/server';
import { getCurrentTimestamp, createTimestampFromDatePicker, parseTimestampFromDatabase, calculateTimeRemaining } from '@/lib/utils/timezone-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const testDate = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    
    const results = {
      currentTimestamp: getCurrentTimestamp(),
      testTimestamp: createTimestampFromDatePicker(testDate, '15:00'),
      parsedTimestamp: parseTimestampFromDatabase(getCurrentTimestamp()),
      timeRemaining: calculateTimeRemaining(getCurrentTimestamp()),
      testTimeRemaining: calculateTimeRemaining(createTimestampFromDatePicker(testDate, '15:00')),
      serverTime: now.toISOString(),
      serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    return NextResponse.json({
      success: true,
      message: 'Timezone utilities test',
      data: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Timezone test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Timezone test failed',
      },
      { status: 500 }
    );
  }
}
