-- ============================================
-- UPGRADE PROMPT TEMPLATES TO V2.0
-- Adds support for 10-element prompt engineering framework
-- ============================================

-- Add new columns for enhanced template features
ALTER TABLE prompt_templates
ADD COLUMN IF NOT EXISTS version VARCHAR(10) DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS role_instruction TEXT,
ADD COLUMN IF NOT EXISTS objective JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS example_input JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS example_output TEXT,
ADD COLUMN IF NOT EXISTS constraints JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ai_parameters JSONB DEFAULT '{
  "temperature": 0.7,
  "max_tokens": 2048,
  "top_p": 0.9,
  "frequency_penalty": 0.0,
  "presence_penalty": 0.0
}'::jsonb,
ADD COLUMN IF NOT EXISTS feedback_instructions TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add comment explaining the new structure
COMMENT ON COLUMN prompt_templates.version IS 'Template version: 1.0 (basic) or 2.0 (10-element framework)';
COMMENT ON COLUMN prompt_templates.role_instruction IS 'Element 2: AI role definition';
COMMENT ON COLUMN prompt_templates.objective IS 'Element 3: Primary goal, secondary goal, success metrics';
COMMENT ON COLUMN prompt_templates.example_input IS 'Element 6: Sample input data for AI to learn from';
COMMENT ON COLUMN prompt_templates.example_output IS 'Element 6: Sample output for AI to mimic';
COMMENT ON COLUMN prompt_templates.constraints IS 'Element 5: DO/DON''T lists, compliance rules';
COMMENT ON COLUMN prompt_templates.ai_parameters IS 'Element 9: Temperature, max_tokens, top_p, etc.';
COMMENT ON COLUMN prompt_templates.feedback_instructions IS 'Element 8: Post-generation feedback loop';
COMMENT ON COLUMN prompt_templates.additional_notes IS 'Element 10: Extra context, priorities, references';

-- Update config to include context fields
-- Element 1 (Context) and Element 4 (Requirements) already in config
-- Element 7 (Tone & Style) already in config

-- Create index for version filtering
CREATE INDEX IF NOT EXISTS idx_prompt_templates_version ON prompt_templates(version);

-- Verify the changes
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'prompt_templates'
  AND column_name IN (
    'version',
    'role_instruction',
    'objective',
    'example_input',
    'example_output',
    'constraints',
    'ai_parameters',
    'feedback_instructions',
    'additional_notes'
  )
ORDER BY ordinal_position;
