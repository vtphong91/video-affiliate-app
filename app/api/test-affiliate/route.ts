import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * Test API - Show formatted affiliate links from schedules
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting schedules with formatted affiliate links...');

    // Get recent schedules
    const { data: schedules, error } = await db.supabaseAdmin
      .from('schedules')
      .select('id, affiliate_links, post_message, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Failed to get schedules: ${error.message}`);
    }

    const formattedSchedules = schedules?.map(schedule => ({
      id: schedule.id,
      created_at: schedule.created_at,
      affiliate_links: schedule.affiliate_links,
      post_message_preview: schedule.post_message?.substring(0, 200) + '...',
    })) || [];

    console.log('✅ Retrieved schedules with affiliate links');

    return NextResponse.json({
      success: true,
      message: 'Schedules with formatted affiliate links',
      data: {
        schedules: formattedSchedules,
        count: formattedSchedules.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Test affiliate API failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Test affiliate API failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
