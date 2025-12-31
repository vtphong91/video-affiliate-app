import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt, SYSTEM_PROMPT } from './prompts';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

console.log('🔧 Gemini Module - Initializing...');
console.log('🔧 Gemini Module - API Key exists:', !!process.env.GOOGLE_AI_API_KEY);
console.log('🔧 Gemini Module - API Key length:', process.env.GOOGLE_AI_API_KEY?.length || 0);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
console.log('🔧 Gemini Module - GoogleGenerativeAI instance created');

/**
 * Get configured Gemini model from database
 * Falls back to gemini-1.5-flash if not configured
 */
async function getConfiguredGeminiModel(): Promise<string> {
  try {
    const supabase = getFreshSupabaseAdminClient() as any;
    const { data, error } = await supabase
      .from('ai_provider_metadata')
      .select('model_name')
      .eq('provider_name', 'gemini')
      .single();

    if (error || !data?.model_name) {
      console.warn('⚠️ Gemini - Could not fetch model from DB, using default: gemini-1.5-flash');
      return 'gemini-1.5-flash';
    }

    console.log(`✅ Gemini - Using configured model: ${data.model_name}`);
    return data.model_name;
  } catch (error) {
    console.error('❌ Gemini - Error fetching model config:', error);
    return 'gemini-1.5-flash'; // Fallback
  }
}

export async function analyzeVideoWithGemini(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  console.log('🤖 Gemini - FUNCTION CALLED - Starting analysis');
  console.log('🤖 Gemini - Video info received:', {
    title: videoInfo.title?.substring(0, 50),
    videoId: videoInfo.videoId,
    platform: videoInfo.platform,
    hasTranscript: !!videoInfo.transcript,
    transcriptLength: videoInfo.transcript?.length
  });

  try {
    console.log('🤖 Gemini - Entering try block');
    console.log('🤖 Gemini - Starting analysis for:', videoInfo.title);
    console.log('🤖 Gemini - Video ID:', videoInfo.videoId);
    console.log('🤖 Gemini - Has transcript:', !!videoInfo.transcript);

    const prompt = generateAnalysisPrompt(videoInfo);
    console.log('🤖 Gemini - Prompt length:', prompt.length);

    // Get configured model from database
    const modelName = await getConfiguredGeminiModel();
    console.log(`🤖 Gemini - Using model: ${modelName}`);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000, // Increased from 2000 to prevent truncated JSON
        responseMimeType: 'application/json', // Force JSON response
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;
    console.log('🤖 Gemini - Sending request to Gemini API...');

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    console.log('🤖 Gemini - Received response from Gemini');

    const text = response.text();
    console.log('🤖 Gemini - Response text length:', text?.length || 0);

    if (!text) {
      throw new Error('No content received from Gemini');
    }

    // Gemini might wrap JSON in markdown code blocks
    let jsonContent = text.trim();

    console.log('🤖 Gemini - Raw response preview:', jsonContent.substring(0, 200));

    // Try to extract JSON from markdown code blocks
    if (jsonContent.includes('```')) {
      // Try different markdown patterns
      const patterns = [
        /```json\s*([\s\S]*?)\s*```/,  // ```json ... ```
        /```\s*([\s\S]*?)\s*```/,       // ``` ... ```
      ];

      for (const pattern of patterns) {
        const match = jsonContent.match(pattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          console.log('🤖 Gemini - Extracted from markdown, preview:', jsonContent.substring(0, 200));
          break;
        }
      }
    }

    console.log('🤖 Gemini - Attempting to parse JSON...');
    let analysis: AIAnalysis;

    try {
      // Parse JSON first
      const parsedData = JSON.parse(jsonContent);
      console.log('✅ Gemini - JSON parsed successfully');
      console.log('🔍 Gemini - Parsed data fields:', Object.keys(parsedData));
      console.log('🔍 Gemini - targetAudience field:', {
        targetAudience: parsedData.targetAudience,
        target_audience: parsedData.target_audience,
        isArray: Array.isArray(parsedData.targetAudience || parsedData.target_audience),
        value: parsedData.targetAudience || parsedData.target_audience
      });
      console.log('🔍 Gemini - seoKeywords field:', {
        seoKeywords: parsedData.seoKeywords,
        seo_keywords: parsedData.seo_keywords,
        isArray: Array.isArray(parsedData.seoKeywords || parsedData.seo_keywords),
        value: parsedData.seoKeywords || parsedData.seo_keywords
      });

      // Transform to AIAnalysis format with field mapping (handle both camelCase and snake_case)
      analysis = {
        summary: parsedData.summary || parsedData.product_summary || '',
        pros: Array.isArray(parsedData.pros) ? parsedData.pros : [],
        cons: Array.isArray(parsedData.cons) ? parsedData.cons : [],
        keyPoints: Array.isArray(parsedData.keyPoints || parsedData.key_points)
          ? (parsedData.keyPoints || parsedData.key_points).map((kp: any) => ({
              time: kp.time || kp.timestamp || '0:00',
              content: kp.content || kp.text || String(kp),
            }))
          : [],
        comparisonTable: parsedData.comparisonTable || parsedData.comparison_table || { headers: [], rows: [] },
        targetAudience: Array.isArray(parsedData.targetAudience || parsedData.target_audience)
          ? (parsedData.targetAudience || parsedData.target_audience)
          : [],
        cta: parsedData.cta || parsedData.call_to_action || '',
        seoKeywords: Array.isArray(parsedData.seoKeywords || parsedData.seo_keywords)
          ? (parsedData.seoKeywords || parsedData.seo_keywords)
          : [],
      };

      console.log('🤖 Gemini - Analysis stats:', {
        summaryLength: analysis.summary.length,
        prosCount: analysis.pros.length,
        consCount: analysis.cons.length,
        keyPointsCount: analysis.keyPoints.length,
        targetAudienceCount: analysis.targetAudience.length,
        seoKeywordsCount: analysis.seoKeywords.length,
      });

      // ⚠️ CRITICAL VALIDATION: targetAudience and seoKeywords must not be empty
      if (analysis.targetAudience.length === 0) {
        console.error('❌ Gemini - targetAudience is EMPTY! This is a CRITICAL ERROR.');
        console.error('🔧 Gemini - Generating fallback targetAudience...');

        // Fallback: Generate targetAudience based on video info
        analysis.targetAudience = [
          'Người tiêu dùng quan tâm đến sản phẩm này, có nhu cầu mua sắm online và muốn tìm hiểu trước khi mua',
          'Gia đình hoặc cá nhân đang tìm kiếm giải pháp cho nhu cầu sử dụng hàng ngày, ưu tiên chất lượng và giá trị',
          'Khách hàng muốn tham khảo review chi tiết từ người dùng thực tế trước khi quyết định mua hàng'
        ];
        console.warn('⚠️ Gemini - Using fallback targetAudience. User should edit manually for better targeting.');
      }

      if (analysis.seoKeywords.length === 0) {
        console.error('❌ Gemini - seoKeywords is EMPTY! This is a CRITICAL ERROR.');
        console.error('🔧 Gemini - Generating fallback seoKeywords from video title...');

        // Fallback: Generate SEO keywords from video title
        const videoTitle = videoInfo.title;
        const cleanTitle = videoTitle.replace(/[^\w\s\u00C0-\u1EF9]/g, ' ').trim();

        analysis.seoKeywords = [
          cleanTitle,
          `review ${cleanTitle}`,
          `mua ${cleanTitle}`,
          `giá ${cleanTitle}`,
          `so sánh ${cleanTitle}`
        ];
        console.warn('⚠️ Gemini - Using fallback seoKeywords based on title. User should review and refine manually.');
      }

      // Final check: Ensure minimum items
      if (analysis.targetAudience.length < 3) {
        console.warn('⚠️ Gemini - targetAudience has less than 3 items. Padding with generic entries...');
        while (analysis.targetAudience.length < 3) {
          analysis.targetAudience.push('Khách hàng có nhu cầu sử dụng sản phẩm này');
        }
      }

      if (analysis.seoKeywords.length < 5) {
        console.warn('⚠️ Gemini - seoKeywords has less than 5 items. Padding with generic entries...');
        while (analysis.seoKeywords.length < 5) {
          analysis.seoKeywords.push(`sản phẩm ${videoInfo.platform}`);
        }
      }
    } catch (parseError) {
      console.error('❌ Gemini - JSON parse failed:', parseError);
      console.error('❌ Gemini - Failed content:', jsonContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    if (
      !analysis.summary ||
      !analysis.pros ||
      !analysis.cons ||
      !analysis.cta
    ) {
      throw new Error('Invalid analysis format from AI');
    }

    // Additional validation for targetAudience and seoKeywords
    if (!analysis.targetAudience || analysis.targetAudience.length === 0) {
      throw new Error('targetAudience is required but was not provided by AI');
    }

    if (!analysis.seoKeywords || analysis.seoKeywords.length === 0) {
      throw new Error('seoKeywords is required but was not provided by AI');
    }

    console.log('✅ Gemini - Analysis completed successfully');
    return analysis;
  } catch (error) {
    console.error('❌ Gemini - Error analyzing video:', error);
    if (error instanceof Error) {
      console.error('❌ Gemini - Error message:', error.message);
      console.error('❌ Gemini - Error stack:', error.stack);
    }
    throw error instanceof Error ? error : new Error('Failed to analyze video content');
  }
}

// Use Gemini 1.5 Pro for better quality (if available)
export async function analyzeVideoWithGeminiPro(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    // Get configured model from database
    const modelName = await getConfiguredGeminiModel();
    console.log(`🤖 Gemini Pro - Using model: ${modelName}`);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json', // Force JSON response
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini Pro');
    }

    let jsonContent = text.trim();

    // Try to extract JSON from markdown code blocks
    if (jsonContent.includes('```')) {
      const patterns = [
        /```json\s*([\s\S]*?)\s*```/,
        /```\s*([\s\S]*?)\s*```/,
      ];

      for (const pattern of patterns) {
        const match = jsonContent.match(pattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          break;
        }
      }
    }

    let analysis: AIAnalysis;
    try {
      // Parse JSON first
      const parsedData = JSON.parse(jsonContent);

      // Transform to AIAnalysis format with field mapping (handle both camelCase and snake_case)
      analysis = {
        summary: parsedData.summary || parsedData.product_summary || '',
        pros: Array.isArray(parsedData.pros) ? parsedData.pros : [],
        cons: Array.isArray(parsedData.cons) ? parsedData.cons : [],
        keyPoints: Array.isArray(parsedData.keyPoints || parsedData.key_points)
          ? (parsedData.keyPoints || parsedData.key_points).map((kp: any) => ({
              time: kp.time || kp.timestamp || '0:00',
              content: kp.content || kp.text || String(kp),
            }))
          : [],
        comparisonTable: parsedData.comparisonTable || parsedData.comparison_table || { headers: [], rows: [] },
        targetAudience: Array.isArray(parsedData.targetAudience || parsedData.target_audience)
          ? (parsedData.targetAudience || parsedData.target_audience)
          : [],
        cta: parsedData.cta || parsedData.call_to_action || '',
        seoKeywords: Array.isArray(parsedData.seoKeywords || parsedData.seo_keywords)
          ? (parsedData.seoKeywords || parsedData.seo_keywords)
          : [],
      };
    } catch (parseError) {
      console.error('❌ Gemini Pro - JSON parse failed:', parseError);
      console.error('❌ Gemini Pro - Failed content:', jsonContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    if (
      !analysis.summary ||
      !analysis.pros ||
      !analysis.cons ||
      !analysis.cta
    ) {
      throw new Error('Invalid analysis format from AI');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing video with Gemini Pro:', error);
    throw new Error('Failed to analyze video content');
  }
}

/**
 * Generate content with custom prompt using Gemini
 * Used for template-based review generation
 */
export async function generateContentWithGemini(prompt: string): Promise<string> {
  try {
    // Get configured model from database
    const modelName = await getConfiguredGeminiModel();
    console.log(`🤖 Gemini Generate - Using model: ${modelName}`);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content with Gemini');
  }
}
