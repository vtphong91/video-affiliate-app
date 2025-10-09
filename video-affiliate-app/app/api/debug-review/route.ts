import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      );
    }

    // Lấy review từ database
    const review = await db.getReview(reviewId);
    
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Tạo analysis object từ database
    const analysis = {
      summary: review.summary,
      pros: review.pros,
      cons: review.cons,
      keyPoints: review.key_points,
      comparisonTable: review.comparison_table,
      targetAudience: review.target_audience,
      cta: review.cta,
      seoKeywords: review.seo_keywords,
    };

    // Tạo payload như sẽ gửi trong webhook
    const webhookPayload = {
      noi_dung_dang: `🔥 ${review.custom_title || review.video_title}\n\n📝 ${review.summary}\n\n✅ ƯU ĐIỂM:\n${review.pros.slice(0, 5).map(pro => `• ${pro}`).join('\n')}\n\n⚠️ NHƯỢC ĐIỂM CẦN LƯU Ý:\n${review.cons.slice(0, 3).map(con => `• ${con}`).join('\n')}\n\n👥 PHÙ HỢP VỚI:\n${review.target_audience.map(audience => `• ${audience}`).join('\n')}\n\n🎥 Xem video gốc:\n${review.video_url}\n\n📱 Xem phân tích chi tiết + so sánh:\nhttps://videoaffiliate.com/review/${review.slug}\n\n⚖️ Bản quyền video thuộc về ${review.channel_name || 'kênh gốc'}\nMọi quyền thuộc về kênh gốc. Đây chỉ là nội dung tham khảo.\n\n${review.seo_keywords.slice(0, 10).map(k => `#${k.replace(/\s+/g, '').replace(/[^\w\u00C0-\u1EF9]/g, '')}`).join(' ')}`,
      video_url: review.video_url,
      affiliate_links: review.affiliate_links,
      url_landing_page: `https://videoaffiliate.com/review/${review.slug}`,
      video_thumbnail: review.video_thumbnail,
      reviewId: review.id,
      timestamp: new Date().toISOString(),
      source: 'video-affiliate-app'
    };

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        title: review.custom_title || review.video_title,
        video_url: review.video_url,
        thumbnail: review.video_thumbnail,
        channel: review.channel_name,
        affiliate_links: review.affiliate_links,
        slug: review.slug
      },
      analysis,
      webhookPayload,
      message: 'Real review data extracted successfully'
    });

  } catch (error) {
    console.error('Error getting review data:', error);
    return NextResponse.json(
      { error: 'Failed to get review data' },
      { status: 500 }
    );
  }
}
