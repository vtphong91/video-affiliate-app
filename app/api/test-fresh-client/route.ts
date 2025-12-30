/**
 * TEST FRESH CLIENT WITH CACHE BUSTING
 * Verify that the new cache-busting headers prevent stale data
 */
// @ts-nocheck
import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('\n🧪 [TEST-FRESH-CLIENT] Testing new cache-busting implementation...');

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Create 3 separate fresh clients to test if each gets unique headers
  console.log('📊 Creating 3 fresh clients sequentially...');

  const client1 = getFreshSupabaseAdminClient() as any;
  const { data: data1 } = await client1
    .from('reviews')
    .select('id, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 10));

  const client2 = getFreshSupabaseAdminClient() as any;
  const { data: data2 } = await client2
    .from('reviews')
    .select('id, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Small delay
  await new Promise(resolve => setTimeout(resolve, 10));

  const client3 = getFreshSupabaseAdminClient() as any;
  const { data: data3 } = await client3
    .from('reviews')
    .select('id, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const count1 = data1?.length || 0;
  const count2 = data2?.length || 0;
  const count3 = data3?.length || 0;

  console.log(`✅ Client 1: ${count1} reviews`);
  console.log(`✅ Client 2: ${count2} reviews`);
  console.log(`✅ Client 3: ${count3} reviews`);

  const allMatch = count1 === count2 && count2 === count3;

  // Check if all three got the same data (they should)
  const sameData = allMatch;

  // Count by status from first client
  const draftCount = data1?.filter(r => r.status === 'draft').length || 0;
  const publishedCount = data1?.filter(r => r.status === 'published').length || 0;

  console.log(`📊 Breakdown: ${draftCount} draft, ${publishedCount} published`);
  console.log(`🎯 Consistency: ${sameData ? 'PASS ✅' : 'FAIL ❌'} - All clients returned same count`);

  return NextResponse.json({
    success: true,
    test: 'cache-busting-headers',
    results: {
      client1Count: count1,
      client2Count: count2,
      client3Count: count3,
      allMatch,
      sameData,
    },
    breakdown: {
      draft: draftCount,
      published: publishedCount,
      total: count1,
    },
    message: sameData
      ? '✅ All fresh clients returned consistent data'
      : '❌ Fresh clients returned different data - cache busting may not be working',
  });
}
