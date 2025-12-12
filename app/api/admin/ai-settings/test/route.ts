import { NextRequest, NextResponse } from 'next/server';
import { analyzeVideo } from '@/lib/ai';
import type { VideoInfo } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for testing

/**
 * POST /api/admin/ai-settings/test
 * Test AI provider connection with a simple prompt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_name } = body;

    console.log(`🧪 Testing AI provider: ${provider_name}`);

    if (!provider_name) {
      return NextResponse.json({
        success: false,
        error: 'Provider name is required'
      }, { status: 400 });
    }

    // Create a simple test video info
    const testVideoInfo: VideoInfo = {
      platform: 'youtube',
      videoId: 'test-video-id',
      title: 'Test Product Review',
      thumbnail: 'https://i.ytimg.com/vi/test/maxresdefault.jpg',
      duration: '10:30',
      description: 'This is a test product that helps users solve problems.',
      channelName: 'Test Channel',
      transcript: `
        Hello everyone, today I'm reviewing this amazing test product.
        This product has three main benefits: it's fast, reliable, and affordable.
        The main pros are excellent quality and great customer support.
        However, there are some cons like limited availability and higher price point.
        Overall, I highly recommend this product for anyone looking for a quality solution.
        Target audience: professionals, students, and hobbyists.
      `.trim()
    };

    const startTime = Date.now();
    let testResult: any;
    let error: any = null;

    try {
      // Force use of specific provider
      testResult = await analyzeVideo(testVideoInfo, provider_name as any);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Test successful for ${provider_name} in ${duration}ms`);

      return NextResponse.json({
        success: true,
        data: {
          provider_name,
          status: 'success',
          response_time_ms: duration,
          test_result: {
            summary_length: testResult.summary?.length || 0,
            pros_count: testResult.pros?.length || 0,
            cons_count: testResult.cons?.length || 0,
            has_keywords: !!testResult.seoKeywords,
            has_cta: !!testResult.callToAction
          }
        },
        message: `✅ ${provider_name} is working correctly! Response time: ${duration}ms`
      });

    } catch (testError: any) {
      error = testError;
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error(`❌ Test failed for ${provider_name}:`, testError.message);

      return NextResponse.json({
        success: false,
        data: {
          provider_name,
          status: 'error',
          response_time_ms: duration,
          error_message: testError.message,
          error_type: testError.constructor.name
        },
        error: `❌ Test failed: ${testError.message}`
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Exception in test API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
