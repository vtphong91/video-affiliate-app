import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// Manual cron job trigger với timezone fix
export async function POST(request: NextRequest) {
  try {
    console.log('🕐 Manual cron job trigger with timezone fix...');
    
    const now = new Date();
    const nowISO = now.toISOString();
    console.log('🕐 Current time (UTC):', nowISO);
    console.log('🕐 Current time (Local GMT+7):', now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    // Get pending schedules that are due
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
      .lte('scheduled_for', nowISO);
    
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
    
    // Log each schedule's time info
    schedules.forEach(schedule => {
      const scheduledFor = new Date(schedule.scheduled_for);
      const scheduledForLocal = scheduledFor.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const isDue = scheduledFor <= now;
      const timeDiff = scheduledFor.getTime() - now.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      console.log(`📅 Schedule ${schedule.id}:`);
      console.log(`  Raw: ${schedule.scheduled_for}`);
      console.log(`  Parsed: ${scheduledFor.toISOString()}`);
      console.log(`  Local: ${scheduledForLocal}`);
      console.log(`  Is due: ${isDue}`);
      console.log(`  Minutes until due: ${minutesDiff}`);
    });
    
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
      
      // Send to Make.com webhook
      const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
      
      if (!webhookUrl) {
        console.log('❌ Make.com webhook URL not configured');
        
        // Update schedule status to failed
        await supabase
          .from('schedules')
          .update({ 
            status: 'failed',
            error_message: 'Webhook URL not configured',
            updated_at: new Date().toISOString()
          })
          .eq('id', schedule.id);
        
        results.push({
          scheduleId: schedule.id,
          reviewId: review.id,
          reviewTitle: review.video_title,
          status: 'failed',
          error: 'Webhook URL not configured'
        });
        continue;
      }
      
      try {
        console.log('📤 Sending to Make.com webhook...');
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Video-Affiliate-App/1.0',
          },
          body: JSON.stringify(webhookPayload),
        });
        
        const responseText = await webhookResponse.text();
        
        if (webhookResponse.ok) {
          console.log('✅ Successfully sent to Make.com');
          console.log('📋 Response:', responseText);
          
          // Update schedule status to posted
          await supabase
            .from('schedules')
            .update({ 
              status: 'posted',
              posted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', schedule.id);
          
          results.push({
            scheduleId: schedule.id,
            reviewId: review.id,
            reviewTitle: review.video_title,
            status: 'posted',
            webhookResponse: 'success',
            response: responseText
          });
        } else {
          console.log('❌ Make.com webhook failed:', webhookResponse.status);
          console.log('📋 Error response:', responseText);
          
          // Update schedule status to failed
          await supabase
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
            webhookResponse: `failed: ${webhookResponse.status}`,
            response: responseText
          });
        }
      } catch (webhookError) {
        console.log('❌ Webhook error:', webhookError);
        
        // Update schedule status to failed
        await supabase
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
      message: 'Manual cron job completed with timezone fix',
      data: results
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to run manual cron job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
