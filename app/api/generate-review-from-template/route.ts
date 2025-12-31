import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth/helpers/auth-helpers';
import { db } from '@/lib/db/supabase';
import {
  transformTutorialToReview,
  isTutorialContent,
  isTutorialTemplate,
  type VideoData,
} from '@/lib/transformers/tutorial-to-review';
import { generateContentWithFallback } from '@/lib/ai/generate-with-fallback';
import { convertAiContentToHtml } from '@/lib/utils/markdown-to-html';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // 2 minutes for AI generation

// Validation schema - flexible config for different templates
const generateReviewSchema = z.object({
  template_id: z.string().min(1),
  videoData: z.object({
    videoTitle: z.string().min(1),
    videoDescription: z.string().optional(),
    channelName: z.string().optional(),
    platform: z.string().min(1),
    transcript: z.string().optional(),
  }),
  config: z.record(z.any()), // Flexible config based on template
});

// POST /api/generate-review-from-template
export async function POST(request: NextRequest) {
  try {
    console.log('📥 POST /api/generate-review-from-template - Starting...');

    // Authenticate
    const userId = await requireAuth(request);
    console.log('👤 Authenticated user ID:', userId);

    // Parse and validate request body
    const body = await request.json();
    console.log('📋 Request body:', JSON.stringify(body, null, 2));

    const validatedData = generateReviewSchema.parse(body);
    console.log('✅ Validation passed');

    const { template_id, config } = validatedData;
    const videoData = validatedData.videoData as {
      videoTitle: string;
      videoDescription?: string;
      channelName?: string;
      platform: string;
      transcript?: string;
    };

    // Fetch template from database
    console.log('🔍 Fetching template:', template_id);
    const template = await db.getTemplate(template_id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
          template_id,
        },
        { status: 404 }
      );
    }

    if (!template.is_active) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template is not active',
          template_id,
        },
        { status: 400 }
      );
    }

    console.log('✅ Template found:', template.name);

    // Detect template type
    const isTutorial = isTutorialTemplate(template);
    console.log('📝 Template type:', isTutorial ? 'Tutorial/How-to' : 'Product Review');

    // Build prompt using template's prompt_template
    const prompt = buildPromptFromTemplate(template, videoData, config);
    console.log('📝 Generated prompt (first 200 chars):', prompt.substring(0, 200));

    // Build system prompt based on template type
    let systemPrompt: string;
    let expectedStructure: string;

    if (isTutorial) {
      systemPrompt = `Bạn là chuyên gia tạo nội dung hướng dẫn (Tutorial/How-to) cho Facebook.
Tone: ${config.tone}.
Ngôn ngữ: ${config.language === 'vi' ? 'Tiếng Việt' : 'English'}.
Độ dài: ${config.length}.

QUAN TRỌNG: Trả về kết quả dưới dạng JSON với cấu trúc sau:`;

      expectedStructure = `{
  "tutorial_title": "Tiêu đề hướng dẫn",
  "goal_statement": "Mục tiêu của hướng dẫn này",
  "difficulty": "Dễ|Trung bình|Khó",
  "time_estimate": "30 phút",
  "materials_needed": [
    {
      "item_name": "Tên vật liệu/sản phẩm",
      "quantity": "Số lượng",
      "why_this_product": "Tại sao dùng sản phẩm này",
      "affiliate_link": "Link affiliate (nếu có)",
      "recommended_brands": ["Thương hiệu 1", "Thương hiệu 2"]
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "description": "Mô tả chi tiết",
      "timestamp": "02:30",
      "tips": ["Mẹo 1", "Mẹo 2"],
      "products_used": ["Tên sản phẩm được dùng trong bước này"]
    }
  ],
  "tips_and_tricks": ["Mẹo 1", "Mẹo 2"],
  "common_mistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "why_it_happens": "Tại sao xảy ra",
      "how_to_avoid": "Cách khắc phục"
    }
  ],
  "final_result": "Mô tả kết quả cuối cùng",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;
    } else {
      systemPrompt = `Bạn là chuyên gia phân tích review sản phẩm cho Facebook.
Tone: ${config.tone}.
Ngôn ngữ: ${config.language === 'vi' ? 'Tiếng Việt' : 'English'}.
Độ dài: ${config.length}.

QUAN TRỌNG: Trả về kết quả dưới dạng JSON với cấu trúc sau:`;

      expectedStructure = `{
  "summary": "Tóm tắt ngắn gọn",
  "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
  "cons": ["Nhược điểm 1", "Nhược điểm 2"],
  "keyPoints": [{"time": "00:00", "content": "Nội dung"}],
  "mainContent": "Nội dung chính chi tiết",
  "cta": "Lời kêu gọi hành động",
  "targetAudience": ["Đối tượng 1", "Đối tượng 2"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;
    }

    const fullPrompt = `${systemPrompt}\n${expectedStructure}\n\n${prompt}`;

    // Call AI with automatic fallback to other providers
    console.log('🤖 Calling AI to generate content (with multi-provider fallback)...');
    const aiContent = await generateContentWithFallback(fullPrompt, {
      temperature: 0.7,
      maxTokens: 8000,
      responseFormat: 'json',
    });
    console.log('✅ AI response received');

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(aiContent);
      console.log('✅ Parsed AI response:', Object.keys(aiResponse));
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      throw new Error('AI response is not valid JSON');
    }

    // Transform Tutorial to Review structure if needed
    let reviewContent;
    if (isTutorial && isTutorialContent(aiResponse)) {
      console.log('🔄 Transforming Tutorial content to Review structure...');
      const transformed = transformTutorialToReview(aiResponse, videoData as VideoData);
      reviewContent = {
        summary: transformed.summary,
        pros: transformed.pros,
        cons: transformed.cons,
        keyPoints: transformed.key_points,
        mainContent: transformed.custom_content,
        cta: transformed.cta,
        targetAudience: transformed.target_audience,
        seoKeywords: transformed.seo_keywords,
        affiliateLinks: transformed.affiliate_links,
      };
      console.log('✅ Transformation complete');
    } else {
      console.log('📝 Using Product Review structure as-is');
      reviewContent = aiResponse;
    }

    // Validate required fields
    const requiredFields = ['summary', 'pros', 'cons', 'mainContent', 'cta', 'targetAudience', 'seoKeywords'];
    const missingFields = requiredFields.filter(field => !reviewContent[field]);

    if (missingFields.length > 0) {
      console.warn('⚠️ Missing fields in response:', missingFields);
      // Fill with defaults
      if (!reviewContent.summary) reviewContent.summary = videoData.videoDescription || 'Tóm tắt video';
      if (!reviewContent.pros) reviewContent.pros = [];
      if (!reviewContent.cons) reviewContent.cons = [];
      if (!reviewContent.mainContent) reviewContent.mainContent = '';
      if (!reviewContent.cta) reviewContent.cta = 'Xem ngay để biết thêm chi tiết!';
      if (!reviewContent.targetAudience) reviewContent.targetAudience = [];
      if (!reviewContent.seoKeywords) reviewContent.seoKeywords = [];
    }

    // Convert mainContent from markdown to HTML for RichTextEditor
    const mainContentHtml = convertAiContentToHtml(reviewContent.mainContent || '');
    console.log('🎨 Converted mainContent to HTML:', mainContentHtml.substring(0, 200) + '...');

    // Return generated content
    return NextResponse.json({
      success: true,
      data: {
        summary: reviewContent.summary || '',
        pros: Array.isArray(reviewContent.pros) ? reviewContent.pros : [],
        cons: Array.isArray(reviewContent.cons) ? reviewContent.cons : [],
        keyPoints: Array.isArray(reviewContent.keyPoints) ? reviewContent.keyPoints : [],
        mainContent: mainContentHtml,
        cta: reviewContent.cta || '',
        targetAudience: Array.isArray(reviewContent.targetAudience) ? reviewContent.targetAudience : [],
        seoKeywords: Array.isArray(reviewContent.seoKeywords) ? reviewContent.seoKeywords : [],
        affiliateLinks: Array.isArray(reviewContent.affiliateLinks) ? reviewContent.affiliateLinks : [],
      },
      message: isTutorial ? 'Tutorial content generated and transformed successfully' : 'Review content generated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Error generating review from template:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate review',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Build AI prompt from template and video data
 * Uses template's prompt_template from database with variable substitution
 */
function buildPromptFromTemplate(
  template: any,
  videoData: {
    videoTitle: string;
    videoDescription?: string;
    channelName?: string;
    platform: string;
    transcript?: string;
  },
  config: Record<string, any>
): string {
  // Get prompt template from database
  let promptTemplate = template.prompt_template || '';

  // Replace variables with actual values
  const variables = {
    videoTitle: videoData.videoTitle,
    videoDescription: videoData.videoDescription || 'Không có mô tả',
    platform: videoData.platform,
    channelName: videoData.channelName || 'Không rõ',
    transcript: videoData.transcript ? videoData.transcript.substring(0, 2000) : 'Không có transcript',
    ...config, // Add all config values (tone, language, length, etc.)
  };

  // Replace all {{variableName}} with actual values
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    promptTemplate = promptTemplate.replace(regex, String(value));
  });

  return promptTemplate;
}
