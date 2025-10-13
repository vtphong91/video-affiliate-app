import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/debug-schedules-affiliate - Debug schedules affiliate_links format
export async function GET() {
  try {
    console.log('🔍 Debugging schedules affiliate_links format...');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Get latest schedules with affiliate_links
    const { data: schedules, error } = await supabaseAdmin
      .from('schedules')
      .select('id, video_title, affiliate_links, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error
      });
    }
    
    console.log('✅ Schedules fetched:', schedules?.length || 0);
    
    // Debug each schedule's affiliate_links format
    const debugInfo = schedules?.map(schedule => ({
      id: schedule.id,
      video_title: schedule.video_title,
      affiliate_links: schedule.affiliate_links,
      affiliate_links_type: typeof schedule.affiliate_links,
      affiliate_links_length: Array.isArray(schedule.affiliate_links) ? schedule.affiliate_links.length : 'not array',
      affiliate_links_preview: typeof schedule.affiliate_links === 'string' 
        ? schedule.affiliate_links.substring(0, 100) + '...'
        : JSON.stringify(schedule.affiliate_links).substring(0, 100) + '...'
    }));
    
    return NextResponse.json({
      success: true,
      schedules: debugInfo,
      message: 'Schedules affiliate_links format debug completed'
    });
    
  } catch (error) {
    console.error('❌ Exception in debug schedules affiliate:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
