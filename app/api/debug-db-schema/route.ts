import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking Database Schema for affiliate_links...');
    
    // 1. Check schedules table structure
    const { data: schedulesInfo, error: schedulesError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'schedules')
      .eq('column_name', 'affiliate_links');
    
    if (schedulesError) {
      console.log('❌ Error checking schedules schema:', schedulesError);
    } else {
      console.log('📋 Schedules affiliate_links column info:', schedulesInfo);
    }
    
    // 2. Check reviews table structure for comparison
    const { data: reviewsInfo, error: reviewsError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'reviews')
      .eq('column_name', 'affiliate_links');
    
    if (reviewsError) {
      console.log('❌ Error checking reviews schema:', reviewsError);
    } else {
      console.log('📋 Reviews affiliate_links column info:', reviewsInfo);
    }
    
    // 3. Get a sample review with affiliate_links
    const { data: sampleReview, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, affiliate_links')
      .not('affiliate_links', 'is', null)
      .limit(1)
      .single();
    
    if (reviewError) {
      console.log('❌ Error getting sample review:', reviewError);
    } else {
      console.log('📋 Sample review affiliate_links:', sampleReview);
    }
    
    // 4. Get the latest schedule to check current state
    const { data: latestSchedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select('id, video_title, affiliate_links, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (scheduleError) {
      console.log('❌ Error getting latest schedule:', scheduleError);
    } else {
      console.log('📋 Latest schedule affiliate_links:', latestSchedule);
    }
    
    // 5. Test direct insert with sample data
    const testAffiliateLinks = [
      {
        platform: 'Test Platform',
        url: 'https://test.com',
        price: '100.000'
      }
    ];
    
    console.log('🔧 Testing direct insert with sample data...');
    
    try {
      const { data: testInsert, error: testError } = await supabaseAdmin
        .from('schedules')
        .insert({
          user_id: 'test-user',
          review_id: sampleReview?.id || 'test-review',
          scheduled_for: new Date().toISOString(),
          timezone: 'Asia/Ho_Chi_Minh',
          target_type: 'page',
          target_id: 'test-target',
          target_name: 'Test Target',
          post_message: 'Test message',
          landing_page_url: 'https://test.com',
          affiliate_links: testAffiliateLinks, // Test with array
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
          video_title: 'Test Video',
          video_url: 'https://test.com/video',
          video_thumbnail: 'https://test.com/thumb.jpg',
          channel_name: 'Test Channel'
        })
        .select()
        .single();
      
      if (testError) {
        console.log('❌ Test insert failed:', testError);
      } else {
        console.log('✅ Test insert successful:', testInsert);
        
        // Clean up test data
        await supabaseAdmin
          .from('schedules')
          .delete()
          .eq('id', testInsert.id);
        
        console.log('🧹 Test data cleaned up');
      }
    } catch (testException) {
      console.log('❌ Test insert exception:', testException);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        schedulesSchema: schedulesInfo,
        reviewsSchema: reviewsInfo,
        sampleReview,
        latestSchedule,
        testAffiliateLinks,
        analysis: {
          schedulesColumnType: schedulesInfo?.[0]?.data_type,
          reviewsColumnType: reviewsInfo?.[0]?.data_type,
          sampleReviewHasLinks: sampleReview?.affiliate_links && Array.isArray(sampleReview.affiliate_links),
          latestScheduleHasLinks: latestSchedule?.affiliate_links && Array.isArray(latestSchedule.affiliate_links),
          schemaMatch: schedulesInfo?.[0]?.data_type === reviewsInfo?.[0]?.data_type
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
