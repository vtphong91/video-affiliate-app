-- ============================================================================
-- AFFILIATE SETTINGS MIGRATION
-- Create tables for affiliate API configuration
-- ============================================================================

-- ============================================================================
-- AFFILIATE_SETTINGS TABLE
-- Store AccessTrade API configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS affiliate_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- API Configuration
  api_token TEXT, -- AccessTrade API token (encrypted)
  api_url TEXT DEFAULT 'https://api.accesstrade.vn/v1',

  -- Link Generation Mode
  link_mode VARCHAR(20) DEFAULT 'api', -- 'api' or 'deeplink'

  -- Deeplink Configuration (backup mode)
  publisher_id VARCHAR(50), -- iSclix Publisher ID
  deeplink_base_url TEXT DEFAULT 'https://go.isclix.com/deep_link',

  -- Tracking Parameters
  utm_source VARCHAR(50) DEFAULT 'video-affiliate',
  utm_campaign VARCHAR(50) DEFAULT 'review',

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  test_status VARCHAR(20), -- 'success', 'failed', 'pending'
  test_message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_affiliate_settings_active ON affiliate_settings(is_active);

-- Insert default settings (single row - global config)
INSERT INTO affiliate_settings (
  link_mode,
  publisher_id,
  utm_source,
  utm_campaign
) VALUES (
  'api',
  '4790392958945222748', -- Default publisher ID from docs
  'video-affiliate',
  'review'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- MERCHANTS TABLE
-- Store merchant information
-- ============================================================================
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,

  -- Affiliate Platform Config
  platform VARCHAR(50) NOT NULL DEFAULT 'accesstrade', -- 'accesstrade', 'isclix'
  campaign_id VARCHAR(100) NOT NULL, -- AccessTrade campaign ID
  deep_link_base TEXT, -- Homepage URL for button clicks

  -- Display
  description TEXT,
  display_order INT DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_merchants_active ON merchants(is_active);
CREATE INDEX IF NOT EXISTS idx_merchants_platform ON merchants(platform);
CREATE INDEX IF NOT EXISTS idx_merchants_display_order ON merchants(display_order);

-- Seed sample merchants (update campaign_ids with real ones)
INSERT INTO merchants (name, domain, platform, campaign_id, deep_link_base, logo_url, display_order) VALUES
('Shopee', 'shopee.vn', 'accesstrade', '4751584435713464237', 'https://shopee.vn', 'https://cf.shopee.vn/file/vn-11134207-7qukw-lfi4vut6jcyh02', 1),
('Lazada', 'lazada.vn', 'accesstrade', '4348614231480407268', 'https://lazada.vn', 'https://laz-img-cdn.alicdn.com/images/ims-web/TB1T_0FapLM8KJjSZFBXXXJHVXa.png', 2),
('Tiki', 'tiki.vn', 'accesstrade', 'TIKI_CAMPAIGN_ID', 'https://tiki.vn', 'https://salt.tikicdn.com/ts/upload/e4/49/6c/270be9859abd5f5ec5071da65fab0a94.png', 3),
('TikTok Shop', 'tiktok.com', 'accesstrade', '4790392958945222748', 'https://vt.tiktok.com', 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png', 4)
ON CONFLICT (domain) DO UPDATE SET
  campaign_id = EXCLUDED.campaign_id,
  deep_link_base = EXCLUDED.deep_link_base,
  logo_url = EXCLUDED.logo_url,
  updated_at = NOW();

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE affiliate_settings IS 'Global affiliate API configuration (single row)';
COMMENT ON TABLE merchants IS 'Supported merchants for affiliate links';
COMMENT ON COLUMN affiliate_settings.link_mode IS 'Link generation mode: api (AccessTrade API) or deeplink (manual deeplink as backup)';
COMMENT ON COLUMN merchants.campaign_id IS 'AccessTrade campaign ID for merchant';
