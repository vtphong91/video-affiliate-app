import { NextResponse } from 'next/server';
import { getReviewsByStatus } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('\n========================================');
  console.log('🧪 TEST SERVICE LAYER - Draft Reviews');
  console.log('========================================\n');

  try {
    const draftReviews = await getReviewsByStatus(userId, 'draft');

    console.log('\n📊 Service function result:');
    console.log('   Draft count:', draftReviews.length);

    if (draftReviews.length > 0) {
      console.log('\n   Reviews:');
      draftReviews.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.video_title?.substring(0, 60)}`);
        console.log(`      ID: ${r.id}`);
        console.log(`      Status: ${r.status}`);
        console.log(`      Category ID: ${r.category_id || 'null'}`);
      });
    }

    // Check for missing reviews
    const missingIds = [
      'ad3a6ded-a03e-471c-8569-4de6b934be59',
      '2f048ab1-5c7e-4d8a-80c6-fca9552f5fa8'
    ];

    const returnedIds = new Set(draftReviews.map(r => r.id));
    const missing = missingIds.filter(id => !returnedIds.has(id));

    if (missing.length > 0) {
      console.log('\n❌ MISSING REVIEWS:');
      missing.forEach(id => console.log(`   - ${id}`));
    } else {
      console.log('\n✅ All expected reviews returned');
    }

    return NextResponse.json({
      success: true,
      count: draftReviews.length,
      reviews: draftReviews.map(r => ({
        id: r.id,
        title: r.video_title,
        status: r.status,
        category_id: r.category_id,
        created_at: r.created_at
      })),
      missing: missing
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
