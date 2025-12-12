-- Create AI Settings table for managing AI providers
-- This stores configuration and statistics for each AI provider

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

-- Create index for faster queries
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
  ('groq', 'Groq LLaMA 3.3 70B', 'free', 2, 0, 800, 999999, 128000),
  ('mistral', 'Mistral Large 2', 'cheap', 3, 2.0, 200, 0, 32000),
  ('openai', 'OpenAI GPT-4 Turbo', 'paid', 4, 10.0, 150, 0, 128000),
  ('claude', 'Anthropic Claude 3.5', 'paid', 5, 3.0, 180, 0, 200000)
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
