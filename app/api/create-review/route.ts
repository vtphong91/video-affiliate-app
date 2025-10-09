import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { generateSlug } from '@/lib/utils';
import type { CreateReviewRequest, CreateReviewResponse } from '@/types';
import { randomUUID } from 'crypto';

// Set to false để lưu vào database thật
const SKIP_DATABASE = false;

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { videoUrl, videoInfo, analysis, affiliateLinks = [], customTitle, customContent, categoryId, status } = body;

    if (!videoUrl || !videoInfo || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(customTitle || videoInfo.title);
    const timestamp = Date.now().toString().slice(-6);
    const slug = baseSlug + '-' + timestamp;

    // Generate proper UUID for user_id (in production, get from auth)
    const userId = randomUUID();

    // Prepare data for database
    const reviewData: any = {
      user_id: userId,
      category_id: categoryId || null,
      slug,
      video_url: videoUrl,
      video_platform: videoInfo.platform,
      video_id: videoInfo.videoId,
      video_title: videoInfo.title,
      video_thumbnail: videoInfo.thumbnail,
      video_description: videoInfo.description || '',
      channel_name: videoInfo.channelName || '',
      channel_url: videoInfo.channelUrl || '',
      summary: analysis.summary,
      pros: analysis.pros,
      cons: analysis.cons,
      key_points: analysis.keyPoints,
      comparison_table: analysis.comparisonTable,
      target_audience: analysis.targetAudience,
      cta: analysis.cta,
      seo_keywords: analysis.seoKeywords,
      custom_title: customTitle,
      custom_content: customContent,
      affiliate_links: affiliateLinks,
      views: 0,
      clicks: 0,
      conversions: 0,
      status: status || 'draft',
    };

    let review;
    
    if (SKIP_DATABASE) {
      console.log('⚠️ SKIP_DATABASE mode: Review not saved to database');
      review = {
        id: randomUUID(),
        ...reviewData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      // Save to database
      console.log('💾 Saving review to database...');
      review = await db.createReview(reviewData);
      console.log('✅ Review saved successfully:', review.id);
    }

    const response: CreateReviewResponse = {
      success: true,
      review,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error creating review:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create review';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
