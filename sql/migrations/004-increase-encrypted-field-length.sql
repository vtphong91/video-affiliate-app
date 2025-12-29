-- Migration: Increase length of encrypted fields in affiliate_settings
-- Date: 2025-12-27
-- Description: AES-256-GCM encrypted data is longer than original plaintext
--              Need to increase column size to accommodate encrypted values

-- Increase api_token length (encrypted tokens are ~200+ chars)
ALTER TABLE affiliate_settings
  ALTER COLUMN api_token TYPE VARCHAR(500);

-- Increase publisher_id length (encrypted IDs are ~200+ chars)
ALTER TABLE affiliate_settings
  ALTER COLUMN publisher_id TYPE VARCHAR(500);

-- Add comments
COMMENT ON COLUMN affiliate_settings.api_token IS 'AccessTrade API token (AES-256-GCM encrypted)';
COMMENT ON COLUMN affiliate_settings.publisher_id IS 'Publisher ID for deeplink (AES-256-GCM encrypted)';
