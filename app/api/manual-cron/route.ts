import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

// Manual cron trigger endpoint for external cron services
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';

    // Support both Authorization header and x-cron-secret header
    const authToken = authHeader?.replace('Bearer ', '') || cronSecret;
    
    if (authToken !== expectedSecret) {
      console.error('❌ Invalid cron secret for manual trigger');
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid cron secret'
        }, 
        { status: 401 }
      );
    }

    console.log('🔄 Manual cron trigger called - processing schedules...');
    
    // Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);

    if (pendingSchedules.length === 0) {
      return NextResponse.json({ 
        success: true,
        message: 'No pending schedules to process',
        processed: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Process schedules using CronService
    const summary = await CronService.processSchedules(pendingSchedules);
    
    console.log('✅ Manual cron processing completed:', summary);

    return NextResponse.json({
      success: true,
      message: 'Schedules processed successfully',
      processed: summary.processed,
      posted: summary.posted,
      failed: summary.failed,
      postedWithoutWebhook: summary.postedWithoutWebhook,
      duration: summary.duration,
      timestamp: summary.timestamp,
      results: summary.results
    });

  } catch (error) {
    console.error('❌ Error in manual cron trigger:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Manual cron failed',
        message: 'Failed to process schedules'
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid cron secret'
        }, 
        { status: 401 }
      );
    }

    // Return status info
    const pendingSchedules = await db.getPendingSchedules();
    const failedSchedules = await db.getFailedSchedulesForRetry();
    
    return NextResponse.json({
      success: true,
      message: 'Manual cron endpoint is working',
      pendingCount: pendingSchedules.length,
      failedCount: failedSchedules.length,
      webhookConfigured: !!process.env.MAKECOM_WEBHOOK_URL,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in manual cron GET:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Manual cron check failed'
      },
      { status: 500 }
    );
  }
}