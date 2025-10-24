import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { getRecommendedTemplate } from '@/lib/templates/template-helpers';
import type { TemplateRecommendationRequest } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/recommend
 * Get AI-powered template recommendation based on video content
 *
 * Body:
 * {
 *   video_title: string,
 *   video_description: string,
 *   platform: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: TemplateRecommendationRequest = await request.json();

    // Validation
    if (!body.video_title || !body.platform) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: video_title, platform',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('🤖 Getting template recommendation:', {
      title: body.video_title.substring(0, 50) + '...',
      platform: body.platform,
    });

    // Get all active templates
    const allTemplates = await db.getTemplates({
      isActive: true,
      limit: 100,
    });

    // Filter to only public templates (system + public user templates)
    const publicTemplates = allTemplates.filter(
      (t) => (t.is_system && t.is_public) || (!t.is_system && t.is_public)
    );

    if (publicTemplates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No templates available',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Get recommendation using helper function
    const recommendation = getRecommendedTemplate(
      body.video_title,
      body.video_description || '',
      body.platform,
      publicTemplates
    );

    if (!recommendation.recommended) {
      return NextResponse.json(
        {
          success: false,
          error: 'No suitable template found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        recommended_template: recommendation.recommended,
        confidence: recommendation.confidence,
        alternatives: recommendation.alternatives,
        reasoning: {
          detected_category: recommendation.recommended.category,
          platform: body.platform,
          match_score: recommendation.confidence,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error getting template recommendation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get recommendation',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
