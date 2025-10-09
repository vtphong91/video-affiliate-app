-- Migration: Add Categories Table
-- Run this SQL in Supabase SQL Editor

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Optional: emoji or icon name
  color TEXT DEFAULT '#3b82f6', -- Hex color for UI
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add category_id to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS idx_reviews_category_id ON reviews(category_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Xe máy', 'xe-may', 'Reviews về xe máy, xe ga, xe số', '🏍️', '#ef4444'),
  ('Điện gia dụng', 'dien-gia-dung', 'Đồ điện tử, điện máy gia đình', '🔌', '#3b82f6'),
  ('Công nghệ', 'cong-nghe', 'Điện thoại, laptop, máy tính bảng', '💻', '#8b5cf6'),
  ('Thời trang', 'thoi-trang', 'Quần áo, giày dép, phụ kiện', '👗', '#ec4899'),
  ('Làm đẹp', 'lam-dep', 'Mỹ phẩm, skincare, makeup', '💄', '#f59e0b'),
  ('Nhà cửa', 'nha-cua', 'Nội thất, đồ dùng gia đình', '🏠', '#10b981'),
  ('Thể thao', 'the-thao', 'Dụng cụ thể thao, fitness', '⚽', '#06b6d4'),
  ('Sức khỏe', 'suc-khoe', 'Thực phẩm chức năng, sức khỏe', '💊', '#14b8a6')
ON CONFLICT (slug) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
