import { NextResponse } from 'next/server';
import { getReviewsByStatus } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('\n========================================');
  console.log('🧪 TEST SERVICE DIRECT - Draft Reviews');
  console.log('========================================\n');

  try {
    const draftReviews = await getReviewsByStatus(userId, 'draft');

    console.log('\n📊 Service function result:');
    console.log('   Draft count:', draftReviews.length);

    if (draftReviews.length > 0) {
      console.log('\n   Reviews:');
      draftReviews.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.video_title?.substring(0, 60)} (${r.status})`);
      });
    }

    return NextResponse.json({
      success: true,
      count: draftReviews.length,
      reviews: draftReviews.map(r => ({
        id: r.id,
        title: r.video_title,
        status: r.status,
        created_at: r.created_at
      }))
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
