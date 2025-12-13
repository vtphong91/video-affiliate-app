-- Table to store custom metadata for AI providers
-- This stores provider-specific configuration that doesn't fit in the main settings table

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
  ('deepseek', 'https://api.deepseek.com', 'deepseek-chat', 'DEEPSEEK_API_KEY'),
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
