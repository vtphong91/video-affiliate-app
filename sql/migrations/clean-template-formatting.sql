-- ============================================
-- CLEAN TEMPLATE FORMATTING
-- Remove markdown syntax, emojis, and special characters
-- Replace with clean plain text format
-- ============================================

-- Update all system templates to use clean format
UPDATE prompt_templates
SET prompt_template = regexp_replace(
  prompt_template,
  E'[🔥📱✨✅⚠️💰🎯🛒💬👇📌😱😍🤩💯🔥⚡💪👍❤️🎉💝✨🌟💫⭐]',
  '',
  'g'
)
WHERE is_system = true;

-- Remove bullet points (•) and replace with dash (-)
UPDATE prompt_templates
SET prompt_template = replace(prompt_template, '•', '-')
WHERE is_system = true;

-- Remove markdown bold syntax (**text**)
UPDATE prompt_templates
SET prompt_template = regexp_replace(
  prompt_template,
  E'\\*\\*([^*]+)\\*\\*',
  E'\\1',
  'g'
)
WHERE is_system = true;

-- Replace section headers with UPPERCASE plain text
-- Example: "🔥 HOOK" → "HOOK"
-- Example: "✨ TOP ĐIỂM NỔI BẬT:" → "TOP ĐIỂM NỔI BẬT:"
UPDATE prompt_templates
SET prompt_template = regexp_replace(
  prompt_template,
  E'[🔥📱✨✅⚠️💰🎯🛒]\\s+\\[([A-ZẮẰẲẴẶẾỀỂỄỆÍÌỈĨỊỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴĐ\\s-]+)\\]',
  E'\\1',
  'g'
)
WHERE is_system = true;

-- Clean up multiple spaces
UPDATE prompt_templates
SET prompt_template = regexp_replace(
  prompt_template,
  E'\\s\\s+',
  ' ',
  'g'
)
WHERE is_system = true;

-- Update config to disable emojis
UPDATE prompt_templates
SET config = jsonb_set(
  COALESCE(config, '{}'::jsonb),
  '{emojiUsage}',
  '"none"'::jsonb
)
WHERE is_system = true;

-- Update constraints to enforce plain text
UPDATE prompt_templates
SET constraints = jsonb_set(
  COALESCE(constraints, '{}'::jsonb),
  '{dont_list}',
  (SELECT jsonb_agg(item) FROM (
    SELECT jsonb_array_elements_text(constraints->'dont_list') as item
    WHERE constraints ? 'dont_list'
    UNION ALL
    SELECT 'KHÔNG dùng emoji hoặc icon đặc biệt'
    UNION ALL
    SELECT 'KHÔNG dùng markdown syntax (**, ##, •)'
    UNION ALL
    SELECT 'KHÔNG dùng ký tự đặc biệt trang trí'
  ) t)
)
WHERE is_system = true
  AND constraints IS NOT NULL;

-- Show updated templates
SELECT
  name,
  length(prompt_template) as template_length,
  substring(prompt_template, 1, 200) as template_preview
FROM prompt_templates
WHERE is_system = true
ORDER BY name;
