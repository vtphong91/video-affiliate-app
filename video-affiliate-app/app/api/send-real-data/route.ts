import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API để gửi real data tới Make.com
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Sending real data to Make.com...');
    
    // Get processing schedules
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
      .eq('status', 'processing');
    
    if (schedulesError) {
      console.log('❌ Error fetching schedules:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: schedulesError.message
      }, { status: 500 });
    }
    
    if (!schedules || schedules.length === 0) {
      console.log('📊 No processing schedules found');
      return NextResponse.json({
        success: true,
        message: 'No processing schedules found',
        data: []
      });
    }
    
    console.log(`📊 Found ${schedules.length} processing schedules`);
    
    const results = [];
    
    for (const schedule of schedules) {
      console.log(`📋 Sending schedule ${schedule.id} to Make.com`);
      
      if (!schedule.reviews) {
        console.log('❌ No review data found for schedule');
        continue;
      }
      
      const review = schedule.reviews;
      
      // Generate real post message
      const landingUrl = `https://yourdomain.com/review/${review.slug}`;
      const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
      
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
      
      console.log('📤 Sending to Make.com:', {
        noi_dung_dang: webhookPayload.noi_dung_dang.substring(0, 100) + '...',
        video_url: webhookPayload.video_url,
        url_landing_page: webhookPayload.url_landing_page,
        reviewId: webhookPayload.reviewId
      });
      
      // Send to Make.com webhook
      const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
      const webhookSecret = process.env.MAKECOM_WEBHOOK_SECRET;
      
      if (!webhookUrl) {
        console.log('❌ Make.com webhook URL not configured');
        continue;
      }
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': webhookSecret || '',
          },
          body: JSON.stringify(webhookPayload),
        });
        
        if (webhookResponse.ok) {
          console.log('✅ Successfully sent to Make.com');
          
          // Update schedule status to posted
          const { error: updateError } = await supabase
            .from('schedules')
            .update({ 
              status: 'posted',
              posted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id);
          
          if (updateError) {
            console.log('❌ Error updating schedule status:', updateError);
          }
          
          results.push({
            scheduleId: schedule.id,
            reviewId: review.id,
            reviewTitle: review.video_title,
            status: 'posted',
            webhookResponse: 'success'
          });
        } else {
          console.log('❌ Make.com webhook failed:', webhookResponse.status);
          
          // Update schedule status to failed
          const { error: updateError } = await supabase
            .from('schedules')
            .update({ 
              status: 'failed',
              error_message: `Webhook failed: ${webhookResponse.status}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id);
          
          results.push({
            scheduleId: schedule.id,
            reviewId: review.id,
            reviewTitle: review.video_title,
            status: 'failed',
            webhookResponse: `failed: ${webhookResponse.status}`
          });
        }
      } catch (webhookError) {
        console.log('❌ Webhook error:', webhookError);
        
        // Update schedule status to failed
        const { error: updateError } = await supabase
          .from('schedules')
          .update({ 
            status: 'failed',
            error_message: `Webhook error: ${webhookError}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);
        
        results.push({
          scheduleId: schedule.id,
          reviewId: review.id,
          reviewTitle: review.video_title,
          status: 'failed',
          webhookResponse: `error: ${webhookError}`
        });
      }
    }
    
    console.log('✅ Processed schedules:', results.length);
    
    return NextResponse.json({
      success: true,
      message: 'Real data sent to Make.com successfully',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send real data to Make.com',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
