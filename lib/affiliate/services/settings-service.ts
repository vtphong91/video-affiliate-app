/**
 * Affiliate Settings Service
 * Manage global affiliate API configuration
 */

import { supabaseAdmin } from '@/lib/db/supabase';
import { encrypt, decrypt, isEncrypted } from '@/lib/utils/encryption';
import type {
  AffiliateSettings,
  UpdateSettingsRequest,
  TestApiRequest,
  TestApiResponse,
  AccessTradeCreateLinkResponse
} from '../types';

export class AffiliateSettingsService {
  /**
   * Get current settings (with decrypted sensitive fields)
   */
  async getSettings(): Promise<AffiliateSettings | null> {
    const { data, error } = await supabaseAdmin
      .from('affiliate_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      console.error('Get settings error:', error);
      return null;
    }

    if (!data) return null;

    // Decrypt API token if it exists and is encrypted
    if (data.api_token && isEncrypted(data.api_token)) {
      try {
        data.api_token = decrypt(data.api_token);
      } catch (error) {
        console.error('Failed to decrypt API token:', error);
        // Keep encrypted token as-is if decryption fails
      }
    }

    // Decrypt publisher_id if it exists and is encrypted
    if (data.publisher_id && isEncrypted(data.publisher_id)) {
      try {
        data.publisher_id = decrypt(data.publisher_id);
      } catch (error) {
        console.error('Failed to decrypt publisher_id:', error);
        // Keep encrypted value as-is if decryption fails
      }
    }

    return data;
  }

  /**
   * Update settings (encrypts sensitive fields before saving)
   */
  async updateSettings(updates: UpdateSettingsRequest): Promise<AffiliateSettings> {
    // Remove undefined fields (keep existing values in database)
    const dataToSave: any = {};
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        dataToSave[key] = value;
      }
    });

    // Encrypt API token if provided
    if (dataToSave.api_token) {
      if (!isEncrypted(dataToSave.api_token)) {
        console.log('🔐 Encrypting API token...');
        dataToSave.api_token = encrypt(dataToSave.api_token);
      }
    }

    // Encrypt publisher_id if provided
    if (dataToSave.publisher_id) {
      if (!isEncrypted(dataToSave.publisher_id)) {
        console.log('🔐 Encrypting publisher_id...');
        dataToSave.publisher_id = encrypt(dataToSave.publisher_id);
      }
    }

    // Get existing settings
    const existing = await this.getSettings();

    if (!existing) {
      // Create new settings if not exists
      const { data, error } = await supabaseAdmin
        .from('affiliate_settings')
        .insert({
          ...dataToSave,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create settings: ${error.message}`);
      }

      // Decrypt before returning
      if (data.api_token && isEncrypted(data.api_token)) {
        data.api_token = decrypt(data.api_token);
      }
      if (data.publisher_id && isEncrypted(data.publisher_id)) {
        data.publisher_id = decrypt(data.publisher_id);
      }

      return data;
    }

    // Update existing settings
    const { data, error } = await supabaseAdmin
      .from('affiliate_settings')
      .update({
        ...dataToSave,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update settings: ${error.message}`);
    }

    // Decrypt before returning
    if (data.api_token && isEncrypted(data.api_token)) {
      data.api_token = decrypt(data.api_token);
    }
    if (data.publisher_id && isEncrypted(data.publisher_id)) {
      data.publisher_id = decrypt(data.publisher_id);
    }

    return data;
  }

  /**
   * Test AccessTrade API connection
   */
  async testApiConnection(request: TestApiRequest): Promise<TestApiResponse> {
    try {
      const { api_token, api_url } = request;

      if (!api_token) {
        return {
          success: false,
          message: 'API token is required'
        };
      }

      // Test API by getting campaigns list (read-only operation, no campaign_id needed)
      const response = await fetch(`${api_url}/offers_informations`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${api_token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: AccessTradeCreateLinkResponse = await response.json();

      // Check response status
      if (response.status === 401) {
        return {
          success: false,
          message: 'Token không hợp lệ - Xác thực thất bại',
          details: data
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: 'Truy cập bị từ chối - Kiểm tra quyền API',
          details: data
        };
      }

      // If we get 200 (successful authentication)
      if (response.status === 200) {
        return {
          success: true,
          message: 'Kết nối API thành công! Token hợp lệ.',
          details: {
            note: 'API token đã được xác thực thành công với AccessTrade.',
            response_status: response.status
          }
        };
      }

      // If we get successful response with data
      if (data.success || response.ok) {
        return {
          success: true,
          message: 'Kết nối API thành công!',
          details: data
        };
      }

      // Unknown error
      return {
        success: false,
        message: `Kiểm tra API thất bại: ${data.message || 'Lỗi không xác định'}`,
        details: data
      };

    } catch (error) {
      console.error('Test API error:', error);

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error - Cannot connect to API',
        details: error
      };
    }
  }

  /**
   * Save test result
   */
  async saveTestResult(testResult: TestApiResponse): Promise<void> {
    const settings = await this.getSettings();

    if (!settings) return;

    await supabaseAdmin
      .from('affiliate_settings')
      .update({
        last_tested_at: new Date().toISOString(),
        test_status: testResult.success ? 'success' : 'failed',
        test_message: testResult.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', settings.id);
  }

  /**
   * Get API token (decrypted if needed)
   */
  async getApiToken(): Promise<string | null> {
    const settings = await this.getSettings();
    return settings?.api_token || null;
  }

  /**
   * Check if API mode is enabled and configured
   */
  async isApiModeReady(): Promise<boolean> {
    const settings = await this.getSettings();

    if (!settings || !settings.is_active) {
      return false;
    }

    if (settings.link_mode !== 'api') {
      return false;
    }

    if (!settings.api_token) {
      return false;
    }

    // Check if last test was successful (optional)
    if (settings.test_status === 'failed') {
      console.warn('API mode configured but last test failed');
    }

    return true;
  }

  /**
   * Check if deeplink mode is enabled
   */
  async isDeeplinkModeReady(): Promise<boolean> {
    const settings = await this.getSettings();

    if (!settings || !settings.is_active) {
      return false;
    }

    if (!settings.publisher_id) {
      return false;
    }

    return true;
  }

  /**
   * Get link generation mode (with fallback logic)
   */
  async getLinkMode(): Promise<'api' | 'deeplink'> {
    const settings = await this.getSettings();

    if (!settings) {
      return 'deeplink'; // Default fallback
    }

    // If API mode configured and ready, use it
    if (settings.link_mode === 'api' && await this.isApiModeReady()) {
      return 'api';
    }

    // Otherwise use deeplink
    return 'deeplink';
  }
}

// Export singleton instance
export const affiliateSettingsService = new AffiliateSettingsService();
