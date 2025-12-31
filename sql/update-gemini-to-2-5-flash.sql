-- ====================================================================
-- Update Gemini Model to Latest Version (gemini-2.5-flash)
-- ====================================================================
-- Script này cập nhật model Gemini từ 1.5 lên 2.5-flash (mới nhất)
-- Gemini 2.5 Flash có nhiều cải tiến:
-- - RPM cao hơn: 5/minute → Unlimited
-- - TPM cao hơn: 250K → 1M tokens/minute
-- - Context window lớn hơn
-- - Hiệu suất tốt hơn
-- ====================================================================

-- Bước 1: Cập nhật model_name trong ai_provider_metadata
UPDATE ai_provider_metadata
SET
  model_name = 'gemini-2.5-flash',  -- Từ gemini-1.5-flash → gemini-2.5-flash
  updated_at = NOW()
WHERE provider_name = 'gemini';

-- Bước 2: Verify kết quả
SELECT
  provider_name,
  model_name,
  base_url,
  api_key_env_var,
  updated_at
FROM ai_provider_metadata
WHERE provider_name = 'gemini';

-- ====================================================================
-- KẾT QUẢ MONG ĐỢI:
-- ====================================================================
-- provider_name | model_name          | base_url                               | api_key_env_var
-- --------------+---------------------+----------------------------------------+------------------
-- gemini        | gemini-2.5-flash    | https://generativelanguage.googleapis.com | GOOGLE_AI_API_KEY
-- ====================================================================

-- NOTE: Các model Gemini khả dụng (theo screenshot):
-- ✅ gemini-2.5-flash (RECOMMENDED - Free tier, 2.19K/250K TPM, unlimited RPM)
-- ✅ gemini-2.5-flash-lite (Free tier, 0/250K TPM)
-- ✅ gemini-3-flash (Test-out, 0/250K TPM)
-- ❌ gemini-1.5-flash (Deprecated - nên upgrade lên 2.5)
--
-- Để thay đổi model khác, chạy:
-- UPDATE ai_provider_metadata SET model_name = 'gemini-3-flash' WHERE provider_name = 'gemini';
-- ====================================================================
