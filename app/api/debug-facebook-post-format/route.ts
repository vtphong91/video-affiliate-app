import { NextRequest, NextResponse } from 'next/server';
import { formatFacebookPost } from '@/lib/apis/facebook';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Facebook Post Format API called');
    
    // Get a sample review
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        slug,
        video_title,
        video_url,
        video_thumbnail,
        channel_name,
        summary,
        pros,
        cons,
        key_points,
        target_audience,
        cta,
        seo_keywords
      `)
      .eq('status', 'published')
      .limit(1)
      .single();

    if (error || !review) {
      return NextResponse.json({
        success: false,
        error: 'No published review found',
        details: error
      }, { status: 404 });
    }

    // Generate landing page URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const landingPageUrl = `${baseUrl}/review/${review.slug}`;

    // Test formatFacebookPost function
    const postMessage = formatFacebookPost({
      title: review.video_title,
      summary: review.summary || 'Đánh giá chi tiết về sản phẩm',
      pros: review.pros || [],
      cons: review.cons || [],
      targetAudience: review.target_audience || [],
      keywords: review.seo_keywords || [],
      videoUrl: review.video_url,
      channelName: review.channel_name,
      landingUrl: landingPageUrl
    });

    return NextResponse.json({
      success: true,
      data: {
        review: {
          id: review.id,
          video_title: review.video_title,
          summary: review.summary,
          pros: review.pros,
          cons: review.cons,
          target_audience: review.target_audience,
          seo_keywords: review.seo_keywords,
          video_url: review.video_url,
          channel_name: review.channel_name
        },
        landingPageUrl,
        postMessage,
        messageLength: postMessage.length,
        hasEmoji: postMessage.includes('🔥'),
        hasPros: postMessage.includes('ƯU ĐIỂM'),
        hasCons: postMessage.includes('NHƯỢC ĐIỂM'),
        hasTargetAudience: postMessage.includes('PHÙ HỢP VỚI'),
        hasVideoLink: postMessage.includes('Xem video gốc'),
        hasCopyright: postMessage.includes('Bản quyền'),
        hasHashtags: postMessage.includes('#')
      }
    });

  } catch (error) {
    console.error('❌ Error in debug Facebook post format API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug Facebook post format',
      details: error
    }, { status: 500 });
  }
}
