import Groq from 'groq-sdk';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt } from './prompts';

// Lazy initialization to avoid build-time errors when API key is not set
let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY || '',
    });
  }
  return groqInstance;
}

/**
 * Analyze video using Groq LLaMA 3.3 70B
 * ⚡ Super fast (300-800 tokens/sec)
 * 💰 FREE tier with generous rate limits
 * 🤖 Model: llama-3.3-70b-versatile
 */
export async function analyzeVideoWithGroq(videoInfo: VideoInfo): Promise<AIAnalysis> {
  console.log('🦙 Groq - Starting video analysis with LLaMA 3.3 70B');
  console.log('🦙 Groq - Video info:', {
    title: videoInfo.title,
    platform: videoInfo.platform,
    hasTranscript: !!videoInfo.transcript,
    transcriptLength: videoInfo.transcript?.length || 0,
  });

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured. Get your free key at: https://console.groq.com');
  }

  // Transcript is preferred but not required - can analyze from title/description
  if (!videoInfo.transcript && !videoInfo.title && !videoInfo.description) {
    throw new Error('Video must have at least title, description, or transcript for analysis');
  }

  try {
    const startTime = Date.now();

    const prompt = generateAnalysisPrompt(videoInfo);

    console.log('🦙 Groq - Prompt length:', prompt.length, 'characters');
    console.log('🦙 Groq - Sending request to LLaMA 3.3 70B...');

    // Use Groq's chat completions API with JSON mode
    const completion = await getGroqClient().chat.completions.create({
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
      model: 'llama-3.3-70b-versatile', // Latest model with 128K context
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 1,
      stream: false,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`🦙 Groq - API call completed in ${duration}ms`);
    console.log('🦙 Groq - Response usage:', completion.usage);

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }

    console.log('🦙 Groq - Response length:', responseText.length, 'characters');
    console.log('🦙 Groq - Response preview:', responseText.substring(0, 200));

    // Parse JSON response
    let parsedData: any;
    try {
      parsedData = JSON.parse(responseText);
      console.log('✅ Groq - JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ Groq - JSON parse failed:', parseError);
      console.error('🦙 Groq - Response text:', responseText);
      throw new Error(`Failed to parse Groq response as JSON: ${parseError}`);
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

    console.log('✅ Groq - Analysis completed successfully');
    console.log('🦙 Groq - Analysis stats:', {
      summaryLength: analysis.summary.length,
      prosCount: analysis.pros.length,
      consCount: analysis.cons.length,
      keyPointsCount: analysis.keyPoints.length,
      duration: `${duration}ms`,
      tokensUsed: completion.usage?.total_tokens || 0,
    });

    return analysis;
  } catch (error: any) {
    console.error('❌ Groq - Analysis failed:', error);

    // Enhance error message with context
    if (error.message?.includes('rate limit')) {
      throw new Error('Groq rate limit exceeded. Please try again in a few moments.');
    } else if (error.message?.includes('API key')) {
      throw new Error('Invalid Groq API key. Please check your configuration.');
    } else if (error.status === 503) {
      throw new Error('Groq service is temporarily unavailable. Trying fallback provider...');
    }

    throw error;
  }
}

/**
 * Analyze video using Groq Mixtral 8x7B (faster, cheaper alternative)
 * ⚡ Ultra fast
 * 💰 FREE tier
 * 🤖 Model: mixtral-8x7b-32768
 */
export async function analyzeVideoWithGroqMixtral(videoInfo: VideoInfo): Promise<AIAnalysis> {
  console.log('🦙 Groq - Starting video analysis with Mixtral 8x7B');

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  // Transcript is preferred but not required - can analyze from title/description
  if (!videoInfo.transcript && !videoInfo.title && !videoInfo.description) {
    throw new Error('Video must have at least title, description, or transcript for analysis');
  }

  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    const completion = await getGroqClient().chat.completions.create({
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
      model: 'mixtral-8x7b-32768', // Faster, cheaper model
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('Empty response from Groq API');
    }

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

    console.log('✅ Groq Mixtral - Analysis completed');
    return analysis;
  } catch (error) {
    console.error('❌ Groq Mixtral - Analysis failed:', error);
    throw error;
  }
}

/**
 * Generate content using Groq (for template generation)
 */
export async function generateContentWithGroq(prompt: string): Promise<string> {
  console.log('🦙 Groq - Generating content...');
  console.log('🦙 Groq - Prompt length:', prompt.length);

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  try {
    const completion = await getGroqClient().chat.completions.create({
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
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 8000,
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    console.log('✅ Groq - Content generated:', content.length, 'characters');
    return content;
  } catch (error) {
    console.error('❌ Groq - Content generation failed:', error);
    throw error;
  }
}
