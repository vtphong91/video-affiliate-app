import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { generateReviewWithTemplate } from '@/lib/ai';
import { parseGeneratedContent } from '@/lib/ai/content-parser';
import { getVideoInfoFromUrl } from '@/lib/utils';
import { extractSmartSummary } from '@/lib/utils/content-helpers';
import type { CreateReviewWithTemplateRequest } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes timeout for AI generation

/**
 * POST /api/reviews/create-with-template
 * Create a review using a template
 *
 * Body:
 * {
 *   template_id: string,
 *   video_url: string,
 *   variables: Record<string, string>,
 *   category_id?: string,
 *   affiliate_links?: AffiliateLink[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body: CreateReviewWithTemplateRequest = await request.json();

    // Validation
    if (!body.template_id || !body.variables) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: template_id, variables',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('🎬 Creating review with template:', {
      template_id: body.template_id,
      hasVideoInfo: !!body.video_info,
      hasAIAnalysis: !!body.ai_analysis,
      userId,
    });

    // Step 1: Get video info (từ client đã phân tích)
    const videoInfo = body.video_info || await getVideoInfoFromUrl(body.video_url);

    if (!videoInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get video info',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Step 2: Get template
    console.log('2️⃣ Loading template...');
    const { data: template, error: templateError } = await supabaseAdmin
      .from('prompt_templates')
      .select('*')
      .eq('id', body.template_id)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 3: Generate content using template với AI analysis
    console.log('3️⃣ Generating review content with AI...');
    const generatedContent = await generateReviewWithTemplate(
      videoInfo,
      body.template_id,
      body.variables,
      body.ai_analysis // ✅ Truyền AI analysis vào
    );

    // Step 4: Create review in database using supabaseAdmin
    console.log('4️⃣ Creating review in database...');

    // Generate slug from video title
    const slug =
      videoInfo.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100) + '-' + Date.now();

    // Construct proper video URL
    let properVideoUrl = body.video_url;
    if (!properVideoUrl || !properVideoUrl.startsWith('http')) {
      // Fallback: construct URL from videoInfo
      if (videoInfo.platform === 'youtube') {
        properVideoUrl = `https://www.youtube.com/watch?v=${videoInfo.videoId}`;
      } else if (videoInfo.platform === 'tiktok') {
        properVideoUrl = `https://www.tiktok.com/video/${videoInfo.videoId}`;
      } else {
        properVideoUrl = videoInfo.videoId; // Last resort
      }
    }

    // Extract smart summary (don't cut in middle of sentence)
    const smartSummary = extractSmartSummary(generatedContent, 500);

    console.log('📝 Smart summary extracted:', {
      original_length: generatedContent.length,
      summary_length: smartSummary.length,
      ends_properly: smartSummary.endsWith('.') || smartSummary.endsWith('!') || smartSummary.endsWith('?'),
    });

    // ✅ NEW APPROACH: Use AI analysis from video analysis step (more reliable)
    console.log('📊 Using AI analysis from video analysis step...');
    let structuredData = {
      summary: smartSummary,
      pros: body.ai_analysis?.pros || [],
      cons: body.ai_analysis?.cons || [],
      target_audience: body.ai_analysis?.targetAudience || [],
      seo_keywords: body.ai_analysis?.seoKeywords || [],
      key_points: body.ai_analysis?.keyPoints || [],
      comparison_table: body.ai_analysis?.comparisonTable || { headers: [], rows: [] },
      cta: body.ai_analysis?.cta || '',
    };

    // Fallback: If AI analysis not provided, try parsing generated content
    if (!body.ai_analysis || (structuredData.pros.length === 0 && structuredData.cons.length === 0)) {
      console.log('⚠️ No AI analysis found, falling back to parsing generated content...');
      try {
        const parsedData = await parseGeneratedContent(generatedContent);
        structuredData = {
          summary: parsedData.summary || smartSummary,
          pros: parsedData.pros || [],
          cons: parsedData.cons || [],
          target_audience: parsedData.target_audience || [],
          seo_keywords: parsedData.seo_keywords || [],
          key_points: [],
          comparison_table: { headers: [], rows: [] },
          cta: parsedData.cta || '',
        };
        console.log('✅ Content parsing successful:', {
          has_pros: structuredData.pros.length > 0,
          has_cons: structuredData.cons.length > 0,
          has_keywords: structuredData.seo_keywords.length > 0,
        });
      } catch (parseError) {
        console.error('⚠️ Content parsing failed (non-critical):', parseError);
        // Keep empty structured data
      }
    } else {
      console.log('✅ Using AI analysis data:', {
        has_pros: structuredData.pros.length > 0,
        has_cons: structuredData.cons.length > 0,
        has_keywords: structuredData.seo_keywords.length > 0,
        has_key_points: structuredData.key_points.length > 0,
      });
    }

    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .insert({
        user_id: userId,
        category_id: body.category_id || null,
        slug,
        video_url: properVideoUrl,
        video_platform: videoInfo.platform,
        video_id: videoInfo.videoId,
        video_title: videoInfo.title,
        video_thumbnail: videoInfo.thumbnail,
        video_description: videoInfo.description,
        channel_name: videoInfo.channelName,
        channel_url: videoInfo.channelUrl,

        // ✅ Store full generated content (template mode)
        custom_content: generatedContent,

        // ✅ Use structured data from AI analysis (more reliable than parsing)
        summary: structuredData.summary,
        pros: structuredData.pros,
        cons: structuredData.cons,
        target_audience: structuredData.target_audience,
        seo_keywords: structuredData.seo_keywords,
        cta: structuredData.cta,
        key_points: structuredData.key_points,
        comparison_table: structuredData.comparison_table,

        // Affiliate links
        affiliate_links: body.affiliate_links || [],

        status: 'draft',
        views: 0,
        clicks: 0,
        conversions: 0,
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Error creating review:', reviewError);
      throw new Error(`Failed to create review: ${reviewError.message}`);
    }

    // Step 5: Track template usage
    console.log('5️⃣ Tracking template usage...');
    try {
      await db.createTemplateUsage({
        review_id: review.id,
        template_id: body.template_id,
        user_id: userId,
        variables_used: body.variables,
      });
    } catch (usageError) {
      console.error('⚠️ Failed to track template usage (non-critical):', usageError);
    }

    // Step 6: Log activity
    try {
      await db.createActivityLog({
        user_id: userId,
        type: 'review.create_with_template',
        title: 'Tạo review từ template',
        description: `Đã tạo review "${videoInfo.title}" sử dụng template "${template.name}"`,
        status: 'success',
        metadata: {
          review_id: review.id,
          template_id: body.template_id,
          template_name: template.name,
          video_url: body.video_url,
        },
      });
    } catch (logError) {
      console.error('⚠️ Failed to log activity (non-critical):', logError);
    }

    console.log('✅ Review created successfully:', review.id);

    return NextResponse.json({
      success: true,
      data: {
        review,
        template_used: {
          id: template.id,
          name: template.name,
          category: template.category,
          platform: template.platform,
        },
        video_info: videoInfo,
      },
      message: 'Review created successfully using template',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error creating review with template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create review',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
