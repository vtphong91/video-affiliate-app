import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedules Data API called');
    
    // Get latest schedule from database
    const { data: schedules, error } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        user_id,
        review_id,
        post_message,
        affiliate_links,
        video_title,
        video_url,
        video_thumbnail,
        channel_name,
        review_summary,
        review_pros,
        review_cons,
        review_target_audience,
        review_seo_keywords,
        scheduled_for,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching schedules:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error
      }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No schedules found'
      }, { status: 404 });
    }

    const schedule = schedules[0];
    console.log('📋 Latest schedule data:', schedule);

    // Analyze data structure
    const dataAnalysis = {
      scheduleId: schedule.id,
      hasPostMessage: !!schedule.post_message,
      postMessageLength: schedule.post_message?.length || 0,
      postMessagePreview: schedule.post_message?.substring(0, 200) + '...',
      hasAffiliateLinks: !!schedule.affiliate_links,
      affiliateLinksType: Array.isArray(schedule.affiliate_links) ? 'array' : typeof schedule.affiliate_links,
      affiliateLinksCount: Array.isArray(schedule.affiliate_links) ? schedule.affiliate_links.length : 0,
      hasVideoTitle: !!schedule.video_title,
      hasVideoUrl: !!schedule.video_url,
      hasVideoThumbnail: !!schedule.video_thumbnail,
      hasChannelName: !!schedule.channel_name,
      hasReviewSummary: !!schedule.review_summary,
      hasReviewPros: !!schedule.review_pros,
      hasReviewCons: !!schedule.review_cons,
      hasReviewTargetAudience: !!schedule.review_target_audience,
      hasReviewSeoKeywords: !!schedule.review_seo_keywords,
      reviewProsType: Array.isArray(schedule.review_pros) ? 'array' : typeof schedule.review_pros,
      reviewConsType: Array.isArray(schedule.review_cons) ? 'array' : typeof schedule.review_cons,
      reviewTargetAudienceType: Array.isArray(schedule.review_target_audience) ? 'array' : typeof schedule.review_target_audience,
      reviewSeoKeywordsType: Array.isArray(schedule.review_seo_keywords) ? 'array' : typeof schedule.review_seo_keywords,
    };

    console.log('📊 Data analysis:', dataAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        analysis: dataAnalysis
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug schedules data API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug schedules data',
      details: error
    }, { status: 500 });
  }
}
