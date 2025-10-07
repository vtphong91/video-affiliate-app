import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

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
    await db.deleteReview(params.id);
    
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const review = await db.updateReview(params.id, updates);
    
    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}
