// @ts-nocheck
import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple test endpoint to check raw review count
export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  // Test 1: COUNT query
  const { count, error: countError } = await supabaseAdmin
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Test 2: Fetch with select('*')
  const { data: allReviews, error: fetchError } = await supabaseAdmin
    .from('reviews')
    .select('*')
    .eq('user_id', userId);

  // Test 3: Fetch with select('id')
  const { data: idsOnly, error: idsError } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('user_id', userId);

  return NextResponse.json({
    userId,
    test1_count: count,
    test1_error: countError,
    test2_fetchAll: allReviews?.length,
    test2_error: fetchError,
    test3_idsOnly: idsOnly?.length,
    test3_error: idsError,
    comparison: {
      count_vs_fetchAll: count === allReviews?.length,
      count_vs_idsOnly: count === idsOnly?.length,
      fetchAll_vs_idsOnly: allReviews?.length === idsOnly?.length,
    },
    firstFewIds: idsOnly?.slice(0, 5).map(r => r.id),
  });
}
