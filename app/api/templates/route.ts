import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import type { CreateTemplateRequest } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates
 * List templates with filters
 *
 * Query params:
 * - category?: string
 * - platform?: string
 * - content_type?: string
 * - is_system?: boolean
 * - limit?: number
 * - offset?: number
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const contentType = searchParams.get('content_type') || undefined;
    const isSystemParam = searchParams.get('is_system');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const userId = await getUserIdFromRequest(request);

    // Parse is_system parameter
    let isSystem: boolean | undefined;
    if (isSystemParam !== null) {
      isSystem = isSystemParam === 'true';
    }

    console.log('📋 Fetching templates with filters:', {
      category,
      platform,
      contentType,
      isSystem,
      limit,
      offset,
      userId,
    });

    // Get templates
    // If user is authenticated, get system templates + their own templates
    // If not authenticated, only get public system templates
    const templates = await db.getTemplates({
      category,
      platform,
      contentType,
      isSystem,
      limit,
      offset,
    });

    // Filter based on user authentication
    const filteredTemplates = templates.filter((t) => {
      // System public templates are visible to everyone
      if (t.is_system && t.is_public) return true;

      // User's own templates are visible to them
      if (userId && t.user_id === userId) return true;

      // Public user templates visible to everyone
      if (!t.is_system && t.is_public) return true;

      return false;
    });

    return NextResponse.json({
      success: true,
      data: filteredTemplates,
      count: filteredTemplates.length,
      filters: {
        category,
        platform,
        contentType,
        isSystem,
        limit,
        offset,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new custom template
 *
 * Body: CreateTemplateRequest
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

    const body: CreateTemplateRequest = await request.json();

    // Validation
    if (!body.name || !body.category || !body.platform || !body.content_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, category, platform, content_type',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    if (!body.config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: config',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    console.log('📝 Creating template with 10-element framework:', {
      name: body.name,
      category: body.category,
      platform: body.platform,
      version: body.version || '2.0',
      userId,
    });

    // Create template with all 10 elements
    const template = await db.createTemplate({
      user_id: userId,
      name: body.name,
      description: body.description,
      category: body.category,
      platform: body.platform,
      content_type: body.content_type,
      version: body.version || '2.0', // v2.0 = 10-element framework

      // Configuration (Elements 1, 4, 7)
      config: body.config,

      // Template content (auto-generated or custom)
      prompt_template: body.prompt_template || 'Auto-generated from 10-element framework',
      variables: body.variables || {},

      // Element 2: Role Instruction
      role_instruction: body.role_instruction,

      // Element 3: Objective
      objective: body.objective,

      // Element 5: Constraints
      constraints: body.constraints,

      // Element 6: Examples
      example_input: body.example_input,
      example_output: body.example_output,

      // Element 8: Feedback Loop
      feedback_instructions: body.feedback_instructions,

      // Element 9: AI Parameters
      ai_parameters: body.ai_parameters,

      // Element 10: Additional Notes
      additional_notes: body.additional_notes,

      // Flags
      is_system: false, // User templates are never system templates
      is_public: body.is_public || false,
      is_active: true,
      usage_count: 0,
    });

    // Log activity
    try {
      await db.createActivityLog({
        user_id: userId,
        type: 'template.create',
        title: 'Tạo template mới',
        description: `Đã tạo template: ${body.name}`,
        status: 'success',
        metadata: {
          template_id: template.id,
          template_name: body.name,
          category: body.category,
          platform: body.platform,
        },
      });
    } catch (logError) {
      console.error('⚠️ Failed to log activity (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      data: template,
      message: 'Template created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error creating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
