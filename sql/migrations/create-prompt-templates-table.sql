-- ============================================
-- PROMPT TEMPLATES SYSTEM
-- Migration: Create prompt_templates table
-- ============================================

-- Table: prompt_templates
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE, -- NULL = system template

  -- Metadata
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'tech' | 'beauty' | 'food' | 'travel' | 'general'
  platform VARCHAR(50), -- 'blog' | 'facebook' | 'instagram' | 'tiktok'
  content_type VARCHAR(50), -- 'review' | 'comparison' | 'tutorial' | 'unboxing' | 'listicle'

  -- Configuration (JSONB for flexible config)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Template content
  prompt_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}'::jsonb, -- Record<string, string>
  example_output TEXT,

  -- Flags
  is_system BOOLEAN DEFAULT FALSE, -- System template cannot be deleted/modified by users
  is_public BOOLEAN DEFAULT FALSE, -- Can other users use this template
  is_active BOOLEAN DEFAULT TRUE, -- Soft delete support

  -- Stats
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_category CHECK (category IN ('tech', 'beauty', 'food', 'travel', 'general')),
  CONSTRAINT valid_platform CHECK (platform IN ('blog', 'facebook', 'instagram', 'tiktok')),
  CONSTRAINT valid_content_type CHECK (content_type IN ('review', 'comparison', 'tutorial', 'unboxing', 'listicle'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_platform ON prompt_templates(platform);
CREATE INDEX IF NOT EXISTS idx_templates_content_type ON prompt_templates(content_type);
CREATE INDEX IF NOT EXISTS idx_templates_user ON prompt_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_system ON prompt_templates(is_system, is_public);
CREATE INDEX IF NOT EXISTS idx_templates_active ON prompt_templates(is_active);

-- Table: review_template_usage (tracking)
CREATE TABLE IF NOT EXISTS review_template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  variables_used JSONB DEFAULT '{}'::jsonb, -- Variables filled in
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_usage_review ON review_template_usage(review_id);
CREATE INDEX IF NOT EXISTS idx_usage_template ON review_template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_usage_user ON review_template_usage(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_template_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view system public templates
CREATE POLICY "view_system_templates"
  ON prompt_templates FOR SELECT
  USING (is_system = TRUE AND is_public = TRUE AND is_active = TRUE);

-- Policy: Users can view their own templates
CREATE POLICY "view_own_templates"
  ON prompt_templates FOR SELECT
  USING (auth.uid() = user_id AND is_active = TRUE);

-- Policy: Users can create their own templates (not system)
CREATE POLICY "create_own_templates"
  ON prompt_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Policy: Users can update their own templates (not system)
CREATE POLICY "update_own_templates"
  ON prompt_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

-- Policy: Users can delete (soft) their own templates (not system)
CREATE POLICY "delete_own_templates"
  ON prompt_templates FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- Policy: Admins can view all templates
CREATE POLICY "admin_view_all_templates"
  ON prompt_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Policy: Users can view their own usage history
CREATE POLICY "view_own_usage"
  ON review_template_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create usage records
CREATE POLICY "create_usage"
  ON review_template_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update updated_at on template modification
CREATE OR REPLACE FUNCTION update_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_template_timestamp
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_updated_at();

-- Trigger: Increment usage_count when template is used
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE prompt_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_usage
  AFTER INSERT ON review_template_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_template_usage();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE prompt_templates IS 'Stores AI prompt templates for generating reviews';
COMMENT ON TABLE review_template_usage IS 'Tracks which templates were used for which reviews';
COMMENT ON COLUMN prompt_templates.config IS 'JSON configuration: tone, length, language, structure, emojiUsage, etc.';
COMMENT ON COLUMN prompt_templates.variables IS 'JSON object defining template variables like {{product_name}}, {{price}}';
COMMENT ON COLUMN prompt_templates.is_system IS 'System templates are read-only and provided by the app';
COMMENT ON COLUMN prompt_templates.is_public IS 'Public templates can be used by other users';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('prompt_templates', 'review_template_usage');

-- Check policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('prompt_templates', 'review_template_usage');

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('prompt_templates', 'review_template_usage');
