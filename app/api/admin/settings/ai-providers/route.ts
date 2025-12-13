import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Lấy danh sách tất cả AI providers từ database
export async function GET(request: NextRequest) {
  try {
    // Fetch providers with metadata joined
    const { data: providers, error } = await supabaseAdmin
      .from('ai_provider_settings')
      .select(`
        *,
        ai_provider_metadata (
          base_url,
          model_name,
          api_key_env_var
        )
      `)
      .order('priority_order', { ascending: true });

    if (error) throw error;

    // Flatten metadata into provider object
    const flattenedProviders = providers?.map(provider => {
      const metadata = Array.isArray(provider.ai_provider_metadata)
        ? provider.ai_provider_metadata[0]
        : provider.ai_provider_metadata;

      return {
        ...provider,
        base_url: metadata?.base_url || '',
        model_name: metadata?.model_name || '',
        api_key_env_var: metadata?.api_key_env_var || '',
        ai_provider_metadata: undefined // Remove nested object
      };
    });

    return NextResponse.json({
      success: true,
      providers: flattenedProviders || []
    });
  } catch (error: any) {
    console.error('Error fetching AI providers:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Thêm AI provider mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider_name,
      display_name,
      provider_type,
      api_key_env_var,
      base_url,
      model_name,
      cost_per_million_tokens,
      tokens_per_second,
      free_tier_limit,
      context_window,
      priority_order
    } = body;

    // Validation
    if (!provider_name || !display_name || !provider_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if provider already exists
    const { data: existing } = await supabaseAdmin
      .from('ai_provider_settings')
      .select('provider_name')
      .eq('provider_name', provider_name)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Provider with this name already exists' },
        { status: 409 }
      );
    }

    // Check if API key is configured in environment
    const api_key_configured = api_key_env_var && process.env[api_key_env_var] ? true : false;

    // Insert new provider
    const { data: newProvider, error } = await supabaseAdmin
      .from('ai_provider_settings')
      .insert({
        provider_name,
        display_name,
        provider_type,
        api_key_configured,
        priority_order: priority_order || 999,
        cost_per_million_tokens: cost_per_million_tokens || 0,
        tokens_per_second: tokens_per_second || 0,
        free_tier_limit: free_tier_limit || 0,
        context_window: context_window || 0,
        is_enabled: true
      })
      .select()
      .single();

    if (error) throw error;

    // Store custom metadata (base_url, model_name, api_key_env_var) separately
    if (base_url || model_name || api_key_env_var) {
      const { error: metadataError } = await supabaseAdmin
        .from('ai_provider_metadata')
        .insert({
          provider_name,
          base_url,
          model_name,
          api_key_env_var
        });

      if (metadataError) {
        console.error('Error saving metadata:', metadataError);
        // Don't fail the entire operation if metadata save fails
      }
    }

    return NextResponse.json({
      success: true,
      provider: newProvider,
      message: 'AI provider added successfully'
    });
  } catch (error: any) {
    console.error('Error adding AI provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật AI provider
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_name, updates, metadata } = body;

    if (!provider_name) {
      return NextResponse.json(
        { success: false, error: 'Provider name is required' },
        { status: 400 }
      );
    }

    // Update main provider settings
    const { data: updatedProvider, error } = await supabaseAdmin
      .from('ai_provider_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('provider_name', provider_name)
      .select()
      .single();

    if (error) throw error;

    // Update metadata if provided
    if (metadata) {
      const { error: metadataError } = await supabaseAdmin
        .from('ai_provider_metadata')
        .update({
          base_url: metadata.base_url,
          model_name: metadata.model_name,
          api_key_env_var: metadata.api_key_env_var,
          updated_at: new Date().toISOString()
        })
        .eq('provider_name', provider_name);

      if (metadataError) {
        console.error('Error updating metadata:', metadataError);
        // Don't fail the entire operation if metadata update fails
      }
    }

    return NextResponse.json({
      success: true,
      provider: updatedProvider,
      message: 'Provider updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating AI provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Xóa AI provider
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider_name = searchParams.get('provider_name');

    if (!provider_name) {
      return NextResponse.json(
        { success: false, error: 'Provider name is required' },
        { status: 400 }
      );
    }

    // Delete metadata first
    await supabaseAdmin
      .from('ai_provider_metadata')
      .delete()
      .eq('provider_name', provider_name);

    // Delete provider
    const { error } = await supabaseAdmin
      .from('ai_provider_settings')
      .delete()
      .eq('provider_name', provider_name);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting AI provider:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
