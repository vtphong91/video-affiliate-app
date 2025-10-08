import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET schedules with real data
export async function GET(request: NextRequest) {
  try {
    console.log('📥 Fetching schedules with real data...');
    
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.log('❌ Error fetching schedules:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error.message
      }, { status: 500 });
    }
    
    console.log(`✅ Found ${schedules?.length || 0} schedules`);
    
    return NextResponse.json({
      success: true,
      data: {
        schedules: schedules || [],
        pagination: {
          page: 1,
          limit: schedules?.length || 0,
          total: schedules?.length || 0,
          totalPages: 1,
        },
      },
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch schedules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
