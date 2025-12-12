import OpenAI from 'openai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt } from './prompts';

// Lazy initialization to avoid build-time errors when API key is not set
let deepseekInstance: OpenAI | null = null;

function getDeepSeekClient(): OpenAI {
  if (!deepseekInstance) {
    deepseekInstance = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
    });
  }
  return deepseekInstance;
}

/**
 * Analyze video using DeepSeek V3
 * 💎 FREE tier with generous limits
 * 🤖 Model: deepseek-chat (V3 - 685B parameters)
 * 🎯 Excellent quality, understands Vietnamese well
 * ⚡ Fast response time
 */
export async function analyzeVideoWithDeepSeek(videoInfo: VideoInfo): Promise<AIAnalysis> {
  console.log('💎 DeepSeek - Starting video analysis with DeepSeek V3');
  console.log('💎 DeepSeek - Video info:', {
    title: videoInfo.title,
    platform: videoInfo.platform,
    hasTranscript: !!videoInfo.transcript,
    transcriptLength: videoInfo.transcript?.length || 0,
  });

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured. Get your free key at: https://platform.deepseek.com');
  }

  // Transcript is preferred but not required - can analyze from title/description
  if (!videoInfo.transcript && !videoInfo.title && !videoInfo.description) {
    throw new Error('Video must have at least title, description, or transcript for analysis');
  }

  try {
    const startTime = Date.now();

    const prompt = generateAnalysisPrompt(videoInfo);

    console.log('💎 DeepSeek - Prompt length:', prompt.length, 'characters');
    console.log('💎 DeepSeek - Sending request to DeepSeek V3...');

    // Use DeepSeek's chat API (OpenAI-compatible)
    const completion = await getDeepSeekClient().chat.completions.create({
      model: 'deepseek-chat', // DeepSeek V3 model
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes product review videos and returns structured JSON responses. Always respond with valid JSON matching the requested format. You understand Vietnamese language very well.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`💎 DeepSeek - API call completed in ${duration}ms`);
    console.log('💎 DeepSeek - Response usage:', completion.usage);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from DeepSeek API');
    }

    console.log('💎 DeepSeek - Response length:', responseText.length, 'characters');
    console.log('💎 DeepSeek - Response preview:', responseText.substring(0, 200));

    // Parse JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
      console.log('✅ DeepSeek - JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ DeepSeek - JSON parse failed:', parseError);
      console.error('💎 DeepSeek - Response text:', responseText);
      throw new Error(`Failed to parse DeepSeek response as JSON: ${parseError}`);
    }

    // Transform to AIAnalysis format
    const analysis: AIAnalysis = {
      summary: parsedData.summary || parsedData.product_summary || '',
      pros: Array.isArray(parsedData.pros) ? parsedData.pros : [],
      cons: Array.isArray(parsedData.cons) ? parsedData.cons : [],
      keyPoints: Array.isArray(parsedData.key_points)
        ? parsedData.key_points.map((kp: any) => ({
            time: kp.time || kp.timestamp || '0:00',
            content: kp.content || kp.text || String(kp),
          }))
        : [],
      comparisonTable: parsedData.comparison_table || parsedData.comparisonTable || { headers: [], rows: [] },
      targetAudience: Array.isArray(parsedData.target_audience)
        ? parsedData.target_audience
        : [],
      cta: parsedData.call_to_action || parsedData.cta || '',
      seoKeywords: Array.isArray(parsedData.seo_keywords) ? parsedData.seo_keywords : [],
    };

    console.log('✅ DeepSeek - Analysis completed successfully');
    console.log('💎 DeepSeek - Analysis stats:', {
      summaryLength: analysis.summary.length,
      prosCount: analysis.pros.length,
      consCount: analysis.cons.length,
      keyPointsCount: analysis.keyPoints.length,
      duration: `${duration}ms`,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

    return analysis;
  } catch (error: any) {
    console.error('❌ DeepSeek - Analysis failed:', error);

    // Enhance error message with context
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      throw new Error('DeepSeek rate limit exceeded. Please try again in a few moments.');
    } else if (error.message?.includes('API key') || error.message?.includes('401')) {
      throw new Error('Invalid DeepSeek API key. Please check your configuration.');
    } else if (error.status === 503 || error.message?.includes('503')) {
      throw new Error('DeepSeek service is temporarily unavailable. Trying fallback provider...');
    }

    throw error;
  }
}

/**
 * Generate content using DeepSeek (for template generation)
 */
export async function generateContentWithDeepSeek(prompt: string): Promise<string> {
  console.log('💎 DeepSeek - Generating content...');
  console.log('💎 DeepSeek - Prompt length:', prompt.length);

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('DEEPSEEK_API_KEY is not configured');
  }

  try {
    const completion = await getDeepSeekClient().chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content generation assistant. You understand Vietnamese language very well.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from DeepSeek API');
    }

    console.log('✅ DeepSeek - Content generated:', content.length, 'characters');
    return content;
  } catch (error) {
    console.error('❌ DeepSeek - Content generation failed:', error);
    throw error;
  }
}
