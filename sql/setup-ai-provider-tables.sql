-- ====================================================================
-- AI Provider Management - Complete Database Setup
-- ====================================================================
-- This script creates both tables in the correct order:
-- 1. ai_provider_settings (main table)
-- 2. ai_provider_metadata (references main table)
--
-- Run this entire script in Supabase SQL Editor
-- ====================================================================

-- ====================================================================
-- STEP 1: Create ai_provider_settings table
-- ====================================================================

CREATE TABLE IF NOT EXISTS ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider identification
  provider_name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('free', 'cheap', 'paid')),

  -- Configuration
  is_enabled BOOLEAN DEFAULT true,
  priority_order INTEGER NOT NULL DEFAULT 999,
  api_key_configured BOOLEAN DEFAULT false,

  -- Provider metadata
  cost_per_million_tokens DECIMAL(10, 4) DEFAULT 0,
  tokens_per_second INTEGER DEFAULT 0,
  free_tier_limit INTEGER DEFAULT 0,
  context_window INTEGER DEFAULT 0,

  -- Usage statistics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,

  -- Performance metrics
  avg_response_time_ms INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_ai_provider_priority ON ai_provider_settings(priority_order);
CREATE INDEX IF NOT EXISTS idx_ai_provider_enabled ON ai_provider_settings(is_enabled);

-- Insert default providers
INSERT INTO ai_provider_settings (
  provider_name,
  display_name,
  provider_type,
  priority_order,
  cost_per_million_tokens,
  tokens_per_second,
  free_tier_limit,
  context_window
) VALUES
  ('gemini', 'Google Gemini Flash', 'free', 1, 0, 250, 1500, 1000000),
  ('groq', 'Groq LLaMA 3.3 70B', 'free', 3, 0, 800, 999999, 128000),
  ('mistral', 'Mistral Large 2', 'cheap', 5, 2.0, 200, 0, 32000),
  ('openai', 'OpenAI GPT-4 Turbo', 'paid', 6, 10.0, 150, 0, 128000),
  ('claude', 'Anthropic Claude 3.5', 'paid', 7, 3.0, 180, 0, 200000)
ON CONFLICT (provider_name) DO NOTHING;

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ai_provider_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_provider_settings_updated_at
  BEFORE UPDATE ON ai_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_provider_settings_updated_at();

-- Create view for provider status
CREATE OR REPLACE VIEW ai_provider_status AS
SELECT
  provider_name,
  display_name,
  provider_type,
  is_enabled,
  api_key_configured,
  priority_order,
  total_requests,
  successful_requests,
  failed_requests,
  CASE
    WHEN total_requests > 0 THEN
      ROUND((successful_requests::DECIMAL / total_requests * 100), 2)
    ELSE 0
  END as success_rate_percent,
  avg_response_time_ms,
  total_tokens_used,
  total_cost,
  last_success_at,
  last_failure_at,
  last_error_message
FROM ai_provider_settings
ORDER BY priority_order;

COMMENT ON TABLE ai_provider_settings IS 'Stores configuration and statistics for AI providers';
COMMENT ON VIEW ai_provider_status IS 'Provides a summary view of AI provider status and performance';

-- ====================================================================
-- STEP 2: Create ai_provider_metadata table
-- ====================================================================

CREATE TABLE IF NOT EXISTS ai_provider_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(50) NOT NULL UNIQUE REFERENCES ai_provider_settings(provider_name) ON DELETE CASCADE,

  -- Custom configuration
  base_url TEXT,                    -- Custom API endpoint (e.g., https://api.deepseek.com)
  model_name VARCHAR(100),          -- Model identifier (e.g., deepseek-chat, llama-3.3-70b-versatile)
  api_key_env_var VARCHAR(100),     -- Environment variable name for API key (e.g., DEEPSEEK_API_KEY)

  -- Additional settings (JSON for flexibility)
  extra_config JSONB DEFAULT '{}'::jsonb,  -- Any additional provider-specific config

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_ai_provider_metadata_provider_name
ON ai_provider_metadata(provider_name);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_ai_provider_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_provider_metadata_updated_at
  BEFORE UPDATE ON ai_provider_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_provider_metadata_updated_at();

-- Insert metadata for existing providers
INSERT INTO ai_provider_metadata (provider_name, base_url, model_name, api_key_env_var) VALUES
  ('gemini', 'https://generativelanguage.googleapis.com', 'gemini-1.5-flash', 'GOOGLE_AI_API_KEY'),
  ('groq', 'https://api.groq.com', 'llama-3.3-70b-versatile', 'GROQ_API_KEY'),
  ('mistral', 'https://api.mistral.ai', 'mistral-large-latest', 'MISTRAL_API_KEY'),
  ('openai', 'https://api.openai.com', 'gpt-4-turbo-preview', 'OPENAI_API_KEY'),
  ('claude', 'https://api.anthropic.com', 'claude-3-5-sonnet-20241022', 'ANTHROPIC_API_KEY')
ON CONFLICT (provider_name) DO NOTHING;

COMMENT ON TABLE ai_provider_metadata IS 'Stores custom configuration and metadata for AI providers';
COMMENT ON COLUMN ai_provider_metadata.base_url IS 'Custom API endpoint URL for the provider';
COMMENT ON COLUMN ai_provider_metadata.model_name IS 'Specific model identifier to use';
COMMENT ON COLUMN ai_provider_metadata.api_key_env_var IS 'Environment variable name containing the API key';
COMMENT ON COLUMN ai_provider_metadata.extra_config IS 'Additional provider-specific configuration in JSON format';

-- ====================================================================
-- STEP 3: Add DeepSeek V3 provider (if not exists)
-- ====================================================================

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
  priority_order = EXCLUDED.priority_order,
  updated_at = NOW();

-- Update priority order for existing providers to make room for DeepSeek
UPDATE ai_provider_settings
SET priority_order = priority_order + 1, updated_at = NOW()
WHERE provider_name IN ('groq', 'mistral', 'openai', 'claude')
  AND priority_order >= 2
  AND provider_name != 'deepseek';

-- Insert DeepSeek metadata
INSERT INTO ai_provider_metadata (provider_name, base_url, model_name, api_key_env_var) VALUES
  ('deepseek', 'https://api.deepseek.com', 'deepseek-chat', 'DEEPSEEK_API_KEY')
ON CONFLICT (provider_name) DO UPDATE SET
  base_url = EXCLUDED.base_url,
  model_name = EXCLUDED.model_name,
  api_key_env_var = EXCLUDED.api_key_env_var,
  updated_at = NOW();

-- ====================================================================
-- Verification: Show all providers
-- ====================================================================

SELECT
  ps.provider_name,
  ps.display_name,
  ps.provider_type,
  ps.priority_order,
  ps.is_enabled,
  ps.api_key_configured,
  pm.base_url,
  pm.model_name,
  pm.api_key_env_var
FROM ai_provider_settings ps
LEFT JOIN ai_provider_metadata pm ON ps.provider_name = pm.provider_name
ORDER BY ps.priority_order;

-- ====================================================================
-- Setup Complete!
-- ====================================================================
-- You should see 6 providers:
-- 1. Gemini (free)
-- 2. DeepSeek (free)
-- 3. Groq (free)
-- 5. Mistral (cheap)
-- 6. OpenAI (paid)
-- 7. Claude (paid)
-- ====================================================================
