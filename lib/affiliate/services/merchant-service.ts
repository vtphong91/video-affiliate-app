/**
 * Merchant Service
 * Manage merchants for affiliate links
 */
// @ts-nocheck
import { supabaseAdmin } from '@/lib/db/supabase';
import type { Merchant } from '../types';

export interface CreateMerchantRequest {
  name: string;
  domain: string;
  platform: 'accesstrade' | 'isclix';
  campaign_id: string;
  deep_link_base?: string;
  logo_url?: string;
  description?: string;
  display_order?: number;
}

export interface UpdateMerchantRequest {
  name?: string;
  domain?: string;
  platform?: 'accesstrade' | 'isclix';
  campaign_id?: string;
  deep_link_base?: string;
  logo_url?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
}

export class MerchantService {
  /**
   * Get all merchants
   */
  async getAllMerchants(activeOnly: boolean = false): Promise<Merchant[]> {
    let query = supabaseAdmin
      .from('merchants')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Get merchants error:', error);
      throw new Error(`Failed to get merchants: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get merchant by ID
   */
  async getMerchantById(id: string): Promise<Merchant | null> {
    const { data, error } = await supabaseAdmin
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get merchant error:', error);
      return null;
    }

    return data;
  }

  /**
   * Get merchant by domain
   */
  async getMerchantByDomain(domain: string): Promise<Merchant | null> {
    const { data, error } = await supabaseAdmin
      .from('merchants')
      .select('*')
      .eq('domain', domain)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Create new merchant
   */
  async createMerchant(request: CreateMerchantRequest): Promise<Merchant> {
    // Validate domain is unique
    const existing = await this.getMerchantByDomain(request.domain);
    if (existing) {
      throw new Error(`Merchant with domain "${request.domain}" already exists`);
    }

    const { data, error } = await supabaseAdmin
      .from('merchants')
      .insert({
        name: request.name,
        domain: request.domain,
        platform: request.platform,
        campaign_id: request.campaign_id,
        deep_link_base: request.deep_link_base,
        logo_url: request.logo_url,
        description: request.description,
        display_order: request.display_order ?? 999,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Create merchant error:', error);
      throw new Error(`Failed to create merchant: ${error.message}`);
    }

    return data;
  }

  /**
   * Update merchant
   */
  async updateMerchant(id: string, updates: UpdateMerchantRequest): Promise<Merchant> {
    // Check if domain changed and is unique
    if (updates.domain) {
      const existing = await this.getMerchantByDomain(updates.domain);
      if (existing && existing.id !== id) {
        throw new Error(`Domain "${updates.domain}" is already used by another merchant`);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('merchants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update merchant error:', error);
      throw new Error(`Failed to update merchant: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete merchant
   */
  async deleteMerchant(id: string): Promise<void> {
    // Check if merchant has affiliate links
    const { count } = await supabaseAdmin
      .from('affiliate_links')
      .select('id', { count: 'exact', head: true })
      .eq('merchant_id', id);

    if (count && count > 0) {
      throw new Error(
        `Cannot delete merchant. It has ${count} affiliate link(s). Please delete links first or deactivate merchant instead.`
      );
    }

    const { error } = await supabaseAdmin
      .from('merchants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete merchant error:', error);
      throw new Error(`Failed to delete merchant: ${error.message}`);
    }
  }

  /**
   * Toggle merchant active status
   */
  async toggleActive(id: string): Promise<Merchant> {
    const merchant = await this.getMerchantById(id);
    if (!merchant) {
      throw new Error('Merchant not found');
    }

    return await this.updateMerchant(id, {
      is_active: !merchant.is_active
    });
  }

  /**
   * Reorder merchants
   */
  async reorderMerchants(merchantIds: string[]): Promise<void> {
    // Update display_order for each merchant
    const updates = merchantIds.map((id, index) =>
      supabaseAdmin
        .from('merchants')
        .update({ display_order: index })
        .eq('id', id)
    );

    await Promise.all(updates);
  }
}

// Export singleton instance
export const merchantService = new MerchantService();
