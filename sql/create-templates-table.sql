-- Create Templates Table
-- This table stores AI prompt templates for generating different types of content

CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'product-review', 'tutorial', 'comparison', etc.
  description TEXT,
  prompt_template TEXT NOT NULL, -- Template với {{variables}} để substitute
  variables JSONB NOT NULL DEFAULT '{}'::jsonb, -- Define what variables this template needs
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);

-- Add RLS (Row Level Security) policies if needed
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active templates
CREATE POLICY "Anyone can view active templates"
  ON templates
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can manage templates (admin only in practice)
CREATE POLICY "Authenticated users can manage templates"
  ON templates
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'templates'
ORDER BY ordinal_position;
