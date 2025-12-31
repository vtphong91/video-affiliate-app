-- ====================================================================
-- Quick Setup: AI Provider Tables
-- ====================================================================
-- Tạo nhanh 2 bảng và insert dữ liệu mẫu cho AI providers
-- Copy toàn bộ script này vào Supabase SQL Editor và Run
-- ====================================================================

-- Bước 1: Xóa các bảng cũ nếu đã tồn tại (để chạy lại script)
DROP TABLE IF EXISTS ai_provider_metadata CASCADE;
DROP TABLE IF EXISTS ai_provider_settings CASCADE;
DROP VIEW IF EXISTS ai_provider_status CASCADE;

-- Bước 2: Tạo bảng ai_provider_settings (bảng chính)
CREATE TABLE ai_provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin provider
  provider_name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  provider_type VARCHAR(20) NOT NULL CHECK (provider_type IN ('free', 'cheap', 'paid')),

  -- Cấu hình
  is_enabled BOOLEAN DEFAULT true,
  priority_order INTEGER NOT NULL DEFAULT 999,
  api_key_configured BOOLEAN DEFAULT false,

  -- Metadata về chi phí và hiệu suất
  cost_per_million_tokens DECIMAL(10, 4) DEFAULT 0,
  tokens_per_second INTEGER DEFAULT 0,
  free_tier_limit INTEGER DEFAULT 0,
  context_window INTEGER DEFAULT 0,

  -- Thống kê sử dụng
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  total_tokens_used BIGINT DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,

  -- Metrics hiệu suất
  avg_response_time_ms INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bước 3: Tạo indexes cho truy vấn nhanh
CREATE INDEX idx_ai_provider_priority ON ai_provider_settings(priority_order);
CREATE INDEX idx_ai_provider_enabled ON ai_provider_settings(is_enabled);

-- Bước 4: Tạo bảng ai_provider_metadata (bảng metadata)
CREATE TABLE ai_provider_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name VARCHAR(50) NOT NULL UNIQUE REFERENCES ai_provider_settings(provider_name) ON DELETE CASCADE,

  -- Cấu hình tùy chỉnh
  base_url TEXT,                    -- API endpoint URL
  model_name VARCHAR(100),          -- Tên model cụ thể
  api_key_env_var VARCHAR(100),     -- Tên biến môi trường chứa API key

  -- Cấu hình bổ sung (JSON linh hoạt)
  extra_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bước 5: Tạo index cho metadata
CREATE INDEX idx_ai_provider_metadata_provider_name ON ai_provider_metadata(provider_name);

-- Bước 6: Insert dữ liệu mẫu cho 6 AI providers
INSERT INTO ai_provider_settings (
  provider_name,
  display_name,
  provider_type,
  priority_order,
  cost_per_million_tokens,
  tokens_per_second,
  free_tier_limit,
  context_window,
  is_enabled
) VALUES
  -- FREE PROVIDERS (Priority 1-3)
  ('gemini', 'Google Gemini Flash', 'free', 1, 0, 250, 1500, 1000000, true),
  ('deepseek', 'DeepSeek V3 (685B)', 'free', 2, 0, 500, 999999, 64000, true),
  ('groq', 'Groq LLaMA 3.3 70B', 'free', 3, 0, 800, 999999, 128000, true),

  -- CHEAP PROVIDER (Priority 5)
  ('mistral', 'Mistral Large 2', 'cheap', 5, 2.0, 200, 0, 32000, false),

  -- PAID PROVIDERS (Priority 6-7)
  ('openai', 'OpenAI GPT-4 Turbo', 'paid', 6, 10.0, 150, 0, 128000, false),
  ('claude', 'Anthropic Claude 3.5', 'paid', 7, 3.0, 180, 0, 200000, false);

-- Bước 7: Insert metadata cho từng provider
INSERT INTO ai_provider_metadata (provider_name, base_url, model_name, api_key_env_var) VALUES
  ('gemini', 'https://generativelanguage.googleapis.com', 'gemini-1.5-flash', 'GOOGLE_AI_API_KEY'),
  ('deepseek', 'https://api.deepseek.com', 'deepseek-chat', 'DEEPSEEK_API_KEY'),
  ('groq', 'https://api.groq.com', 'llama-3.3-70b-versatile', 'GROQ_API_KEY'),
  ('mistral', 'https://api.mistral.ai', 'mistral-large-latest', 'MISTRAL_API_KEY'),
  ('openai', 'https://api.openai.com', 'gpt-4-turbo-preview', 'OPENAI_API_KEY'),
  ('claude', 'https://api.anthropic.com', 'claude-3-5-sonnet-20241022', 'ANTHROPIC_API_KEY');

-- Bước 8: Tạo VIEW để tính toán success rate tự động
CREATE VIEW ai_provider_status AS
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

-- Bước 9: Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_ai_provider_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ai_provider_settings
  BEFORE UPDATE ON ai_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_provider_updated_at();

CREATE TRIGGER trigger_update_ai_provider_metadata
  BEFORE UPDATE ON ai_provider_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_provider_updated_at();

-- ====================================================================
-- VERIFICATION: Kiểm tra kết quả
-- ====================================================================

-- Xem tất cả providers với metadata
SELECT
  ps.provider_name,
  ps.display_name,
  ps.provider_type,
  ps.priority_order,
  ps.is_enabled,
  ps.cost_per_million_tokens,
  pm.base_url,
  pm.model_name,
  pm.api_key_env_var
FROM ai_provider_settings ps
LEFT JOIN ai_provider_metadata pm ON ps.provider_name = pm.provider_name
ORDER BY ps.priority_order;

-- ====================================================================
-- KẾT QUẢ MONG ĐỢI:
-- ====================================================================
-- Bạn sẽ thấy 6 providers:
-- 1. gemini       - Google Gemini Flash      (free, enabled)
-- 2. deepseek     - DeepSeek V3 (685B)       (free, enabled)
-- 3. groq         - Groq LLaMA 3.3 70B       (free, enabled)
-- 5. mistral      - Mistral Large 2          (cheap, disabled)
-- 6. openai       - OpenAI GPT-4 Turbo       (paid, disabled)
-- 7. claude       - Anthropic Claude 3.5     (paid, disabled)
-- ====================================================================
