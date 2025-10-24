import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import {
  replacePromptVariables,
  estimateTokens,
  validateTemplateVariables,
} from '@/lib/templates/template-helpers';
import type { TemplatePreviewRequest } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/templates/preview
 * Preview template with variables filled in
 *
 * Body:
 * {
 *   template_id: string,
 *   variables: Record<string, string>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: TemplatePreviewRequest = await request.json();

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

    console.log('👁️ Previewing template:', {
      template_id: body.template_id,
      variables: Object.keys(body.variables),
    });

    // Get template
    const template = await db.getTemplate(body.template_id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Validate variables
    const validation = validateTemplateVariables(template, body.variables);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required variables',
          missing_variables: validation.missingVariables,
          extra_variables: validation.extraVariables,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Replace variables
    const finalPrompt = replacePromptVariables(
      template.prompt_template,
      body.variables
    );

    // Estimate tokens
    const estimatedTokens = estimateTokens(finalPrompt);

    // Check if too long
    const isTooLong = estimatedTokens > 4000;
    const warning = isTooLong
      ? 'Prompt may be too long and could be truncated by AI provider'
      : null;

    return NextResponse.json({
      success: true,
      data: {
        final_prompt: finalPrompt,
        estimated_tokens: estimatedTokens,
        warning,
        template_info: {
          id: template.id,
          name: template.name,
          category: template.category,
          platform: template.platform,
          config: template.config,
        },
        variables_used: body.variables,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error previewing template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to preview template',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
