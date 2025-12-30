import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('\n🔍 [TEST-DIRECT-QUERY] Starting...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const draftId = 'ebf7dcde-eeb0-46a0-997c-5d77f9f41128'; // The missing draft

  console.log('🔑 Creating NEW Supabase client...');
  console.log(`   URL: ${supabaseUrl?.substring(0, 40)}...`);
  console.log(`   Key: ${serviceRoleKey?.substring(0, 20)}...`);

  // Create FRESH admin client
  const freshAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('📊 Executing query...');

  // Query với fresh admin client
  const { data, error, count } = await freshAdmin
    .from('reviews')
    .select('id, video_title, status, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log(`✅ Query completed: ${data?.length || 0} reviews (count header: ${count})`);

  if (error) {
    console.error('❌ Error:', error);
  }

  // Check for the missing draft
  const hasDraft = data?.some(r => r.id === draftId);
  console.log(`🔍 Contains draft ${draftId.substring(0, 8)}...: ${hasDraft ? 'YES ✅' : 'NO ❌'}`);

  // Count by status
  const draftCount = data?.filter(r => r.status === 'draft').length || 0;
  const publishedCount = data?.filter(r => r.status === 'published').length || 0;
  console.log(`📊 Status breakdown: ${draftCount} draft, ${publishedCount} published`);

  // List first 5 reviews
  console.log('📋 First 5 reviews:');
  data?.slice(0, 5).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 50)}`);
  });

  return NextResponse.json({
    success: true,
    total: data?.length || 0,
    countHeader: count,
    draftCount,
    publishedCount,
    hasDraft,
    draftId,
    firstFew: data?.slice(0, 5).map(r => ({
      id: r.id,
      status: r.status,
      title: r.video_title?.substring(0, 60),
    })),
    error: error?.message,
  });
}
