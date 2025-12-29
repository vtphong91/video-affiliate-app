/**
 * Admin Single Merchant API
 * PATCH /api/admin/merchants/:id - Update merchant
 * DELETE /api/admin/merchants/:id - Delete merchant
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { checkPermission } from '@/lib/auth/middleware/rbac-middleware';
import { merchantService, type UpdateMerchantRequest } from '@/lib/affiliate/services/merchant-service';

export const dynamic = 'force-dynamic';

/**
 * PATCH - Update merchant
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permission
    const hasPermission = await checkPermission(userId, 'manage_settings');

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body: UpdateMerchantRequest = await request.json();

    // Update merchant
    const updated = await merchantService.updateMerchant(params.id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Merchant updated successfully'
    });

  } catch (error) {
    console.error('Update merchant error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update merchant'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete merchant
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permission
    const hasPermission = await checkPermission(userId, 'manage_settings');

    if (!hasPermission) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Delete merchant
    await merchantService.deleteMerchant(params.id);

    return NextResponse.json({
      success: true,
      message: 'Merchant deleted successfully'
    });

  } catch (error) {
    console.error('Delete merchant error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete merchant'
      },
      { status: 500 }
    );
  }
}
