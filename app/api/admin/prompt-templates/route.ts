import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

// Check if user is admin
async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; userId: string | null }> {
  const userId = await getUserIdFromRequest(request);

  if (!userId) {
    return { isAdmin: false, userId: null };
  }

  const supabaseAdmin = getFreshSupabaseAdminClient() as any;

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.role === 'admin';

  return { isAdmin, userId };
}

// GET /api/admin/prompt-templates - Get all prompt templates
export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAccess(request);

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');

    console.log('📋 Fetching prompt templates...', { category, isActive });

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    let query = supabaseAdmin
      .from('prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (isActive && isActive !== 'all') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      templates: data || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to fetch prompt templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prompt templates',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/prompt-templates - Create new prompt template
export async function POST(request: NextRequest) {
  try {
    const { isAdmin, userId } = await checkAdminAccess(request);

    if (!isAdmin || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      display_name,
      description,
      system_prompt,
      user_prompt_template,
      variables,
      category,
      tags,
      is_default
    } = body;

    if (!name || !display_name || !user_prompt_template) {
      return NextResponse.json(
        { error: 'Missing required fields: name, display_name, user_prompt_template' },
        { status: 400 }
      );
    }

    console.log('👤 Creating new prompt template...', { name, category });

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Check if name already exists
    const { data: existing } = await supabaseAdmin
      .from('prompt_templates')
      .select('name')
      .eq('name', name)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Template with this name already exists' },
        { status: 409 }
      );
    }

    // If is_default=true, unset other defaults in same category
    if (is_default && category) {
      await supabaseAdmin
        .from('prompt_templates')
        .update({ is_default: false })
        .eq('category', category)
        .eq('is_default', true);
    }

    // Create template
    const { data, error } = await supabaseAdmin
      .from('prompt_templates')
      .insert({
        name,
        display_name,
        description,
        system_prompt,
        user_prompt_template,
        variables: variables || [],
        category,
        tags: tags || [],
        is_default: is_default || false,
        is_active: true,
        created_by: userId,
        updated_by: userId
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt template created successfully',
      template: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to create prompt template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prompt template',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/prompt-templates - Update prompt template
export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, userId } = await checkAdminAccess(request);

    if (!isAdmin || !userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating prompt template...', { id });

    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // If setting is_default=true, unset others in same category
    if (updates.is_default && updates.category) {
      await supabaseAdmin
        .from('prompt_templates')
        .update({ is_default: false })
        .eq('category', updates.category)
        .eq('is_default', true)
        .neq('id', id);
    }

    // Update template
    const { data, error } = await supabaseAdmin
      .from('prompt_templates')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt template updated successfully',
      template: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to update prompt template:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prompt template',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
