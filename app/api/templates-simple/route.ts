import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/templates-simple
 * Simple endpoint to get templates from new templates table
 * No complex filters, just category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    console.log('📋 Fetching templates (simple):', { category });

    // Build query step by step to avoid TypeScript inference issues
    let query: any = supabaseAdmin.from('templates').select('*').eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('created_at', { ascending: false });

    const { data: templates, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      throw error;
    }

    console.log(`✅ Found ${templates?.length || 0} templates`);

    return NextResponse.json({
      success: true,
      data: templates || [],
      count: templates?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch templates',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
