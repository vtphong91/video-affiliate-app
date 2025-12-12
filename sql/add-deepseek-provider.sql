-- Add DeepSeek V3 provider to AI settings
-- Run this in Supabase SQL Editor after creating ai_provider_settings table

INSERT INTO ai_provider_settings (
  provider_name,
  display_name,
  provider_type,
  priority_order,
  cost_per_million_tokens,
  tokens_per_second,
  free_tier_limit,
  context_window
) VALUES (
  'deepseek',
  'DeepSeek V3 (685B)',
  'free',
  2,              -- Priority #2 (after Gemini, before Groq)
  0,              -- FREE
  500,            -- Fast response
  999999,         -- Generous free tier
  64000           -- 64K context window
)
ON CONFLICT (provider_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  provider_type = EXCLUDED.provider_type,
  priority_order = EXCLUDED.priority_order,
  cost_per_million_tokens = EXCLUDED.cost_per_million_tokens,
  tokens_per_second = EXCLUDED.tokens_per_second,
  free_tier_limit = EXCLUDED.free_tier_limit,
  context_window = EXCLUDED.context_window,
  updated_at = NOW();

-- Update priority order for existing providers to make room for DeepSeek
UPDATE ai_provider_settings
SET priority_order = priority_order + 1, updated_at = NOW()
WHERE provider_name IN ('groq', 'mistral', 'openai', 'claude')
  AND priority_order >= 2;

COMMENT ON COLUMN ai_provider_settings.priority_order IS 'Priority order: 1=Gemini, 2=DeepSeek, 3=Groq, 4=Mistral, 5=OpenAI, 6=Claude';
