import { Mistral } from '@mistralai/mistralai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt } from './prompts';

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

/**
 * Analyze video using Mistral Large 2
 * 💰 Cheap pricing (~$2/1M input tokens)
 * 🤖 Model: mistral-large-latest
 * 🎯 Good quality, cost-effective
 */
export async function analyzeVideoWithMistral(videoInfo: VideoInfo): Promise<AIAnalysis> {
  console.log('🌫️ Mistral - Starting video analysis with Mistral Large 2');
  console.log('🌫️ Mistral - Video info:', {
    title: videoInfo.title,
    platform: videoInfo.platform,
    hasTranscript: !!videoInfo.transcript,
    transcriptLength: videoInfo.transcript?.length || 0,
  });

  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured. Get your key at: https://console.mistral.ai');
  }

  if (!videoInfo.transcript) {
    throw new Error('Transcript is required for Mistral analysis');
  }

  try {
    const startTime = Date.now();

    const prompt = generateAnalysisPrompt(videoInfo);

    console.log('🌫️ Mistral - Prompt length:', prompt.length, 'characters');
    console.log('🌫️ Mistral - Sending request to Mistral Large...');

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes product review videos and returns structured JSON responses. Always respond with valid JSON matching the requested format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 8000,
      responseFormat: {
        type: 'json_object'
      }
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`🌫️ Mistral - API call completed in ${duration}ms`);
    console.log('🌫️ Mistral - Response usage:', chatResponse.usage);

    const responseContent = chatResponse.choices?.[0]?.message?.content;

    if (!responseContent) {
      throw new Error('Empty response from Mistral API');
    }

    // Handle both string and ContentChunk[] types
    const responseText = typeof responseContent === 'string'
      ? responseContent
      : JSON.stringify(responseContent);

    console.log('🌫️ Mistral - Response length:', responseText.length, 'characters');
    console.log('🌫️ Mistral - Response preview:', responseText.substring(0, 200));

    // Parse JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
      console.log('✅ Mistral - JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Mistral - JSON parse failed:', parseError);
      console.error('🌫️ Mistral - Response text:', responseText);
      throw new Error(`Failed to parse Mistral response as JSON: ${parseError}`);
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

    console.log('✅ Mistral - Analysis completed successfully');
    console.log('🌫️ Mistral - Analysis stats:', {
      summaryLength: analysis.summary.length,
      prosCount: analysis.pros.length,
      consCount: analysis.cons.length,
      keyPointsCount: analysis.keyPoints.length,
      duration: `${duration}ms`,
      tokensUsed: chatResponse.usage?.totalTokens || 0,
    });

    return analysis;
  } catch (error: any) {
    console.error('❌ Mistral - Analysis failed:', error);

    // Enhance error message with context
    if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      throw new Error('Mistral rate limit exceeded. Please try again in a few moments.');
    } else if (error.message?.includes('API key') || error.message?.includes('401')) {
      throw new Error('Invalid Mistral API key. Please check your configuration.');
    } else if (error.message?.includes('503') || error.message?.includes('overloaded')) {
      throw new Error('Mistral service is temporarily unavailable. Trying fallback provider...');
    }

    throw error;
  }
}

/**
 * Analyze video using Mistral Small (faster, cheaper alternative)
 * 💰 Very cheap
 * 🤖 Model: mistral-small-latest
 * ⚡ Fast inference
 */
export async function analyzeVideoWithMistralSmall(videoInfo: VideoInfo): Promise<AIAnalysis> {
  console.log('🌫️ Mistral - Starting video analysis with Mistral Small');

  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  if (!videoInfo.transcript) {
    throw new Error('Transcript is required for Mistral analysis');
  }

  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that analyzes product review videos and returns structured JSON responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 8000,
      responseFormat: {
        type: 'json_object'
      }
    });

    const responseContent = chatResponse.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response from Mistral API');
    }

    // Handle both string and ContentChunk[] types
    const responseText = typeof responseContent === 'string'
      ? responseContent
      : JSON.stringify(responseContent);

    const parsedData = JSON.parse(responseText);

    const analysis: AIAnalysis = {
      summary: parsedData.summary || '',
      pros: Array.isArray(parsedData.pros) ? parsedData.pros : [],
      cons: Array.isArray(parsedData.cons) ? parsedData.cons : [],
      keyPoints: Array.isArray(parsedData.key_points)
        ? parsedData.key_points.map((kp: any) => ({
            time: kp.time || '0:00',
            content: kp.content || String(kp),
          }))
        : [],
      comparisonTable: parsedData.comparison_table || parsedData.comparisonTable || { headers: [], rows: [] },
      targetAudience: Array.isArray(parsedData.target_audience) ? parsedData.target_audience : [],
      cta: parsedData.call_to_action || parsedData.cta || '',
      seoKeywords: Array.isArray(parsedData.seo_keywords) ? parsedData.seo_keywords : [],
    };

    console.log('✅ Mistral Small - Analysis completed');
    return analysis;
  } catch (error) {
    console.error('❌ Mistral Small - Analysis failed:', error);
    throw error;
  }
}

/**
 * Generate content using Mistral (for template generation)
 */
export async function generateContentWithMistral(prompt: string): Promise<string> {
  console.log('🌫️ Mistral - Generating content...');
  console.log('🌫️ Mistral - Prompt length:', prompt.length);

  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  try {
    const chatResponse = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful content generation assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      maxTokens: 8000,
    });

    const responseContent = chatResponse.choices?.[0]?.message?.content;

    if (!responseContent) {
      throw new Error('Empty response from Mistral API');
    }

    // Handle both string and ContentChunk[] types
    const content = typeof responseContent === 'string'
      ? responseContent
      : JSON.stringify(responseContent);

    console.log('✅ Mistral - Content generated:', content.length, 'characters');
    return content;
  } catch (error) {
    console.error('❌ Mistral - Content generation failed:', error);
    throw error;
  }
}
