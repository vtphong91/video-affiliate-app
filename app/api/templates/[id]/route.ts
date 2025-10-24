import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import type { UpdateTemplateRequest } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates/[id]
 * Get template by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const userId = await getUserIdFromRequest(request);

    console.log('🔍 Fetching template:', { id, userId });

    const template = await db.getTemplate(id);

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

    // Check access permissions
    const canAccess =
      (template.is_system && template.is_public) || // System public template
      (userId && template.user_id === userId) || // Own template
      (!template.is_system && template.is_public); // Public user template

    if (!canAccess) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch template',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/templates/[id]
 * Update template (own templates only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Check if template exists and user owns it
    const template = await db.getTemplate(id);

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

    // Cannot modify system templates
    if (template.is_system) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot modify system templates',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Must own the template
    if (template.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const body: UpdateTemplateRequest = await request.json();

    console.log('📝 Updating template:', { id, userId });

    // Update template
    const updatedTemplate = await db.updateTemplate(id, body);

    // Log activity
    try {
      await db.createActivityLog({
        user_id: userId,
        type: 'template.update',
        title: 'Cập nhật template',
        description: `Đã cập nhật template: ${template.name}`,
        status: 'success',
        metadata: {
          template_id: id,
          template_name: template.name,
          changes: Object.keys(body),
        },
      });
    } catch (logError) {
      console.error('⚠️ Failed to log activity (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'Template updated successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error updating template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update template',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/templates/[id]
 * Delete template (soft delete, own templates only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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

    // Check if template exists and user owns it
    const template = await db.getTemplate(id);

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

    // Cannot delete system templates
    if (template.is_system) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete system templates',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    // Must own the template
    if (template.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    console.log('🗑️ Deleting template (soft):', { id, userId });

    // Soft delete
    await db.deleteTemplate(id);

    // Log activity
    try {
      await db.createActivityLog({
        user_id: userId,
        type: 'template.delete',
        title: 'Xóa template',
        description: `Đã xóa template: ${template.name}`,
        status: 'success',
        metadata: {
          template_id: id,
          template_name: template.name,
        },
      });
    } catch (logError) {
      console.error('⚠️ Failed to log activity (non-critical):', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete template',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
