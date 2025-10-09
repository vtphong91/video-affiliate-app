import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Test API để trigger schedule với real data
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing schedule trigger with real data...');
    
    // Get pending schedules
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_url,
          video_thumbnail,
          channel_name,
          slug,
          summary,
          pros,
          cons,
          target_audience,
          seo_keywords,
          custom_title,
          affiliate_links
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());
    
    if (schedulesError) {
      console.log('❌ Error fetching schedules:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: schedulesError.message
      }, { status: 500 });
    }
    
    if (!schedules || schedules.length === 0) {
      console.log('📊 No pending schedules found');
      return NextResponse.json({
        success: true,
        message: 'No pending schedules found',
        data: []
      });
    }
    
    console.log(`📊 Found ${schedules.length} pending schedules`);
    
    const results = [];
    
    for (const schedule of schedules) {
      console.log(`📋 Processing schedule ${schedule.id} for review ${schedule.review_id}`);
      
      if (!schedule.reviews) {
        console.log('❌ No review data found for schedule');
        continue;
      }
      
      const review = schedule.reviews;
      
      // Generate real post message
      const landingUrl = `https://yourdomain.com/review/${review.slug}`;
      const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
      
      console.log('📝 Generated real post message:', realPostMessage.substring(0, 100) + '...');
      
      // Prepare webhook payload with real data
      const webhookPayload = {
        noi_dung_dang: realPostMessage,
        video_url: review.video_url,
        affiliate_links: review.affiliate_links,
        url_landing_page: landingUrl,
        video_thumbnail: review.video_thumbnail,
        reviewId: review.id,
        timestamp: new Date().toISOString(),
        source: 'video-affiliate-app',
      };
      
      console.log('📤 Webhook payload:', {
        noi_dung_dang: webhookPayload.noi_dung_dang.substring(0, 100) + '...',
        video_url: webhookPayload.video_url,
        url_landing_page: webhookPayload.url_landing_page,
        reviewId: webhookPayload.reviewId
      });
      
      // Update schedule status to processing
      const { error: updateError } = await supabase
        .from('schedules')
        .update({ 
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', schedule.id);
      
      if (updateError) {
        console.log('❌ Error updating schedule status:', updateError);
        continue;
      }
      
      results.push({
        scheduleId: schedule.id,
        reviewId: review.id,
        reviewTitle: review.video_title,
        postMessage: realPostMessage.substring(0, 200) + '...',
        landingUrl: landingUrl,
        status: 'processing'
      });
    }
    
    console.log('✅ Processed schedules:', results.length);
    
    return NextResponse.json({
      success: true,
      message: 'Schedules processed successfully',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process schedules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
