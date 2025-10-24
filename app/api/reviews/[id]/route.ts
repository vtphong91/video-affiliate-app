import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { ActivityLogger } from '@/lib/utils/activity-logger';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await db.getReview(params.id);
    
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);

    console.log('🗑️ Deleting review:', params.id);

    // Get review details before deleting
    const review = await db.getReview(params.id);

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

    // Delete the review
    await db.deleteReview(params.id);

    console.log('✅ Review deleted successfully:', params.id);

    // Log activity
    if (userId) {
      await ActivityLogger.reviewDeleted(userId, reviewTitle, params.id);
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
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromRequest(request);
    const updates = await request.json();
    console.log('📝 Updating review:', params.id, 'with data:', updates);

    const review = await db.updateReview(params.id, updates);

    console.log('✅ Review updated successfully:', review.id);

    // Log activity
    if (userId) {
      await ActivityLogger.reviewUpdated(userId, review.video_title, review.id);
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
