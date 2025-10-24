import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates/system
 * List all active system templates
 *
 * Query params:
 * - category?: string
 * - platform?: string
 * - content_type?: string
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const contentType = searchParams.get('content_type') || undefined;

    console.log('📋 Fetching system templates:', {
      category,
      platform,
      contentType,
    });

    // Get only system templates that are public and active
    const templates = await db.getTemplates({
      category,
      platform,
      contentType,
      isSystem: true,
      isActive: true,
      limit: 100,
    });

    // Filter to only public system templates
    const systemTemplates = templates.filter((t) => t.is_system && t.is_public);

    // Group by category for better organization
    const groupedByCategory: Record<string, any[]> = {};
    systemTemplates.forEach((t) => {
      if (!groupedByCategory[t.category]) {
        groupedByCategory[t.category] = [];
      }
      groupedByCategory[t.category].push(t);
    });

    // Also group by platform
    const groupedByPlatform: Record<string, any[]> = {};
    systemTemplates.forEach((t) => {
      if (!groupedByPlatform[t.platform]) {
        groupedByPlatform[t.platform] = [];
      }
      groupedByPlatform[t.platform].push(t);
    });

    return NextResponse.json({
      success: true,
      data: systemTemplates,
      count: systemTemplates.length,
      grouped: {
        by_category: groupedByCategory,
        by_platform: groupedByPlatform,
      },
      filters: {
        category,
        platform,
        contentType,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching system templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch system templates',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
