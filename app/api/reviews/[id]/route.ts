import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/supabase';
import { ActivityLogger } from '@/lib/utils/activity-logger';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { affiliateLinksSyncService } from '@/lib/affiliate/services/sync-service';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await db.getReview(id);
    
    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    
    return NextResponse.json(
      { error: 'Review not found' },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);

    console.log('🗑️ Deleting review:', id);

    // Get review details before deleting
    const review = await db.getReview(id);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found'
        },
        { status: 404 }
      );
    }

    const reviewTitle = review.video_title || 'Unknown';

    // Delete synced affiliate links first
    await affiliateLinksSyncService.deleteSyncedLinks(id);

    // Delete the review
    await db.deleteReview(id);

    console.log('✅ Review deleted successfully:', id);

    // Log activity
    if (userId) {
      await ActivityLogger.reviewDeleted(userId, reviewTitle, id);
    }

    // ✅ INVALIDATE CACHE: Force Next.js to regenerate cached routes
    try {
      revalidatePath('/dashboard/reviews');
      revalidatePath('/api/reviews');
      console.log('✅ [CACHE] Invalidated cache for /dashboard/reviews and /api/reviews');
    } catch (cacheError) {
      console.error('⚠️ [CACHE] Failed to invalidate cache:', cacheError);
    }

    // Return success with cache-control headers
    return NextResponse.json(
      {
        success: true,
        message: 'Review deleted successfully',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('❌ Error deleting review:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getUserIdFromRequest(request);
    const updates = await request.json();
    console.log('📝 [UPDATE] Review ID:', id);
    console.log('📝 [UPDATE] Updates:', JSON.stringify(updates, null, 2));

    const review = await db.updateReview(id, updates);

    if (!review) {
      console.error('❌ [UPDATE] Review not found or update failed');
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found or update failed',
        },
        { status: 404 }
      );
    }

    console.log('✅ [UPDATE] Review updated successfully!');
    console.log('✅ [UPDATE] New status:', review.status);
    console.log('✅ [UPDATE] Review data:', JSON.stringify({
      id: review.id,
      status: review.status,
      custom_title: review.custom_title?.substring(0, 50)
    }, null, 2));

    // Log activity
    if (userId) {
      await ActivityLogger.reviewUpdated(userId, review.video_title, review.id);
    }

    // Sync affiliate links if they were updated
    if (updates.affiliate_links && userId) {
      console.log('🔄 Re-syncing affiliate links after update...');
      const syncResult = await affiliateLinksSyncService.updateSyncedLinks(
        id,
        userId,
        updates.affiliate_links
      );

      if (syncResult.success) {
        console.log(`✅ Re-synced ${syncResult.synced} affiliate links`);
      } else {
        console.warn('⚠️ Some links failed to re-sync:', syncResult.errors);
      }
    }

    // ✅ INVALIDATE CACHE: Force Next.js to regenerate cached routes
    // This ensures the reviews list page shows updated data immediately
    try {
      revalidatePath('/dashboard/reviews');
      revalidatePath('/api/reviews');
      console.log('✅ [CACHE] Invalidated cache for /dashboard/reviews and /api/reviews');
    } catch (cacheError) {
      console.error('⚠️ [CACHE] Failed to invalidate cache:', cacheError);
      // Don't fail the request if cache invalidation fails
    }

    return NextResponse.json({
      success: true,
      review,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating review:', error);

    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update review',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
