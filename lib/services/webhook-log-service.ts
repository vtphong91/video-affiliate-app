import { supabase } from '@/lib/db/supabase';

export interface WebhookLog {
  id?: string;
  schedule_id: string;
  request_payload: any;
  response_status?: number;
  response_body?: string;
  error_message?: string;
  retry_attempt: number;
  created_at?: string;
}

/**
 * Webhook Log Service - Handles logging of webhook requests and responses
 */
export class WebhookLogService {
  
  /**
   * Create a new webhook log entry
   */
  async createWebhookLog(logData: Omit<WebhookLog, 'id' | 'created_at'>): Promise<WebhookLog> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .insert([logData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating webhook log:', error);
        throw new Error(`Failed to create webhook log: ${error.message}`);
      }

      console.log(`✅ Webhook log created for schedule ${logData.schedule_id}`);
      return data;
    } catch (error) {
      console.error('❌ Error in createWebhookLog:', error);
      throw error;
    }
  }

  /**
   * Update webhook log with response data
   */
  async updateWebhookLog(
    logId: string, 
    responseData: {
      response_status?: number;
      response_body?: string;
      error_message?: string;
    }
  ): Promise<WebhookLog> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .update(responseData)
        .eq('id', logId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating webhook log:', error);
        throw new Error(`Failed to update webhook log: ${error.message}`);
      }

      console.log(`✅ Webhook log updated: ${logId}`);
      return data;
    } catch (error) {
      console.error('❌ Error in updateWebhookLog:', error);
      throw error;
    }
  }

  /**
   * Get webhook logs for a specific schedule
   */
  async getWebhookLogs(scheduleId: string): Promise<WebhookLog[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting webhook logs:', error);
        throw new Error(`Failed to get webhook logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getWebhookLogs:', error);
      throw error;
    }
  }

  /**
   * Get failed webhook logs for debugging
   */
  async getFailedWebhookLogs(limit: number = 50): Promise<WebhookLog[]> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .not('error_message', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error getting failed webhook logs:', error);
        throw new Error(`Failed to get failed webhook logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('❌ Error in getFailedWebhookLogs:', error);
      throw error;
    }
  }
}

















