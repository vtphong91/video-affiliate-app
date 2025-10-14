import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Webhook Processing - Starting...');
    
    // Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);
    
    if (pendingSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending schedules to process',
        data: {
          pendingSchedules: [],
          webhookTests: []
        }
      });
    }
    
    // Test webhook processing for each schedule
    const cronService = new CronService();
    const webhookTests = [];
    
    for (const schedule of pendingSchedules) {
      try {
        console.log(`🔍 Testing webhook for schedule: ${schedule.id}`);
        
        // Build webhook payload
        const payload = cronService.buildWebhookPayload(schedule);
        console.log(`📤 Webhook payload built:`, payload);
        
        // Test webhook sending (without actually sending)
        const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
        const webhookSecret = process.env.MAKECOM_WEBHOOK_SECRET;
        
        webhookTests.push({
          scheduleId: schedule.id,
          videoTitle: schedule.video_title,
          scheduledFor: schedule.scheduled_for,
          webhookUrl: webhookUrl ? `${webhookUrl.substring(0, 30)}...` : 'Not set',
          webhookUrlValid: webhookUrl && webhookUrl.startsWith('https://hook.'),
          webhookSecretSet: !!webhookSecret,
          payloadSize: JSON.stringify(payload).length,
          payloadPreview: {
            scheduleId: payload.scheduleId,
            message: payload.message?.substring(0, 100) + '...',
            affiliateLinksText: payload.affiliateLinksText?.substring(0, 100) + '...',
            scheduledFor: payload.scheduledFor
          },
          canSend: !!(webhookUrl && webhookSecret && webhookUrl.startsWith('https://hook.'))
        });
        
      } catch (error) {
        console.error(`❌ Error testing webhook for schedule ${schedule.id}:`, error);
        webhookTests.push({
          scheduleId: schedule.id,
          videoTitle: schedule.video_title,
          error: error.message,
          canSend: false
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        pendingSchedulesCount: pendingSchedules.length,
        webhookTests,
        summary: {
          schedulesWithValidWebhook: webhookTests.filter(t => t.canSend).length,
          schedulesWithInvalidWebhook: webhookTests.filter(t => !t.canSend).length,
          webhookUrlSet: !!process.env.MAKECOM_WEBHOOK_URL,
          webhookSecretSet: !!process.env.MAKECOM_WEBHOOK_SECRET
        },
        recommendations: {
          issues: webhookTests.filter(t => !t.canSend).length > 0 ? [
            'Some schedules cannot send webhooks due to configuration issues',
            'Check MAKECOM_WEBHOOK_URL and MAKECOM_WEBHOOK_SECRET environment variables'
          ] : [
            'All schedules can send webhooks successfully',
            'Configuration appears correct'
          ],
          actions: [
            'Verify Make.com webhook URL is correct and accessible',
            'Check webhook secret matches Make.com configuration',
            'Test webhook manually in Make.com dashboard',
            'Check Make.com webhook logs for any errors'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug webhook processing:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
