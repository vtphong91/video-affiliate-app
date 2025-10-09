import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API manual trigger để test webhook
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Manual trigger for webhook testing...');
    
    // Get pending schedules that are due
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug,
          summary,
          video_url,
          affiliate_links
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString()); // Only schedules that are due
    
    if (error) {
      console.error('❌ Error fetching pending schedules:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    console.log(`📊 Found ${schedules.length} pending schedules`);
    
    if (schedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending schedules found',
        processed: 0,
      });
    }
    
    const results = [];
    
    for (const schedule of schedules) {
      try {
        console.log(`📤 Processing schedule ${schedule.id}...`);
        
        // Update status to processing
        await supabase
          .from('schedules')
          .update({ status: 'processing' })
          .eq('id', schedule.id);
        
        // Build webhook payload with real data
        const review = schedule.reviews;
        const webhookPayload = {
          noi_dung_dang: schedule.post_message,
          video_url: review.video_url,
          affiliate_links: review.affiliate_links,
          url_landing_page: schedule.landing_page_url,
          video_thumbnail: review.video_thumbnail,
          reviewId: review.id,
          scheduleId: schedule.id,
          timestamp: new Date().toISOString(),
          source: 'video-affiliate-app',
        };
        
        console.log('📤 Webhook payload:', webhookPayload);
        
        // Send webhook to Make.com
        const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
        if (!webhookUrl) {
          throw new Error('MAKECOM_WEBHOOK_URL not configured');
        }
        
        console.log('📤 Sending to Make.com webhook:', webhookUrl);
        
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VideoAffiliateApp-Manual/1.0',
          },
          body: JSON.stringify(webhookPayload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Webhook failed: ${response.status} ${errorText}`);
        }
        
        // Mark as posted
        await supabase
          .from('schedules')
          .update({ 
            status: 'posted',
            posted_at: new Date().toISOString(),
          })
          .eq('id', schedule.id);
        
        results.push({
          scheduleId: schedule.id,
          reviewTitle: review.video_title,
          status: 'success',
          message: 'Webhook sent successfully',
        });
        
        console.log(`✅ Schedule ${schedule.id} processed successfully`);
        
      } catch (error) {
        console.error(`❌ Error processing schedule ${schedule.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Mark as failed
        await supabase
          .from('schedules')
          .update({ 
            status: 'failed',
            error_message: errorMessage,
          })
          .eq('id', schedule.id);
        
        results.push({
          scheduleId: schedule.id,
          status: 'failed',
          message: errorMessage,
        });
      }
    }
    
    console.log(`🎯 Manual trigger completed - processed ${schedules.length} schedules`);
    
    return NextResponse.json({
      success: true,
      message: `Processed ${schedules.length} schedules`,
      processed: schedules.length,
      results,
    });
    
  } catch (error) {
    console.error('❌ Manual trigger error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual trigger failed',
    }, { status: 500 });
  }
}
