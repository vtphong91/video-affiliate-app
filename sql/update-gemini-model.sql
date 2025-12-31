-- Update Gemini model to gemini-2.5-flash (stable, higher quota)
-- Run this in Supabase SQL Editor

UPDATE ai_providers
SET model_name = 'gemini-2.5-flash'
WHERE provider_name = 'gemini';

-- Verify update
SELECT provider_name, model_name, is_active, priority
FROM ai_providers
WHERE provider_name = 'gemini';
