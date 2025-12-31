import { NextRequest, NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/ai-settings
 * Get all AI provider settings and statistics
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching AI provider settings...');

    // Get fresh admin client with cache-busting
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Get all provider settings with metadata (query table instead of view)
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

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch AI provider settings',
        details: error.message
      }, { status: 500 });
    }

    // Enrich providers with calculated fields and flattened metadata
    const providersWithStatus = providers?.map(provider => {
      // Extract metadata (could be array or object)
      const metadata = Array.isArray(provider.ai_provider_metadata)
        ? provider.ai_provider_metadata[0]
        : provider.ai_provider_metadata;

      // Calculate success rate (same logic as VIEW)
      const success_rate_percent = provider.total_requests > 0
        ? Math.round((provider.successful_requests / provider.total_requests) * 100 * 100) / 100
        : 0;

      return {
        ...provider,
        // Calculated fields
        success_rate_percent,
        api_key_configured: checkApiKeyConfigured(provider.provider_name),
        can_enable: checkApiKeyConfigured(provider.provider_name),
        // Flatten metadata
        base_url: metadata?.base_url || '',
        model_name: metadata?.model_name || '',
        api_key_env_var: metadata?.api_key_env_var || '',
        // Remove nested object
        ai_provider_metadata: undefined
      };
    }) || [];

    console.log(`✅ Fetched ${providersWithStatus.length} AI providers`);

    return NextResponse.json({
      success: true,
      data: {
        providers: providersWithStatus,
        summary: {
          total: providersWithStatus.length,
          enabled: providersWithStatus.filter(p => p.is_enabled).length,
          configured: providersWithStatus.filter(p => p.api_key_configured).length,
          free: providersWithStatus.filter(p => p.provider_type === 'free').length,
          cheap: providersWithStatus.filter(p => p.provider_type === 'cheap').length,
          paid: providersWithStatus.filter(p => p.provider_type === 'paid').length,
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Exception in AI settings API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/ai-settings
 * Update AI provider settings
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_name, updates } = body;

    console.log('🔧 Updating AI provider settings:', { provider_name, updates });

    if (!provider_name) {
      return NextResponse.json({
        success: false,
        error: 'Provider name is required'
      }, { status: 400 });
    }

    // Get fresh admin client
    const supabaseAdmin = getFreshSupabaseAdminClient() as any;

    // Update provider settings
    const { data, error } = await supabaseAdmin
      .from('ai_provider_settings')
      .update(updates)
      .eq('provider_name', provider_name)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update provider settings',
        details: error.message
      }, { status: 500 });
    }

    console.log('✅ Provider settings updated:', data);

    return NextResponse.json({
      success: true,
      data: data,
      message: 'Provider settings updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Exception in update AI settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * Helper function to check if API key is configured
 */
function checkApiKeyConfigured(providerName: string): boolean {
  const keyMap: Record<string, string> = {
    'gemini': 'GOOGLE_AI_API_KEY',
    'deepseek': 'DEEPSEEK_API_KEY',
    'groq': 'GROQ_API_KEY',
    'mistral': 'MISTRAL_API_KEY',
    'openai': 'OPENAI_API_KEY',
    'claude': 'ANTHROPIC_API_KEY'
  };

  const envKey = keyMap[providerName];
  if (!envKey) return false;

  const value = process.env[envKey];
  return !!value && value.length > 10 && !value.includes('your_') && !value.includes('_here');
}
