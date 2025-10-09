import { NextRequest, NextResponse } from 'next/server';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

/**
 * Cron API Endpoint - Process scheduled posts
 * 
 * This endpoint is called by cron jobs to process scheduled posts
 * and send them to Make.com webhook.
 * 
 * Security: Requires x-cron-secret header
 * Frequency: Every 5 minutes in production, 30 seconds in development
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      console.log('❌ Unauthorized cron request:', { 
        provided: cronSecret, 
        expected: expectedSecret,
        timestamp 
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          timestamp,
          message: 'Invalid cron secret'
        },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started - processing scheduled posts...', { timestamp });

    // Initialize cron service
    const cronService = new CronService();
    
    // Process all schedules
    const summary = await cronService.processAllSchedules();

    const duration = Date.now() - startTime;
    console.log('✅ Cron job completed:', { 
      ...summary, 
      duration: `${duration}ms` 
    });

    return NextResponse.json({
      success: summary.success,
      message: summary.processed === 0 
        ? 'No schedules to process' 
        : `Processed ${summary.processed} schedules`,
      ...summary,
      duration: `${duration}ms`,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Cron job failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Cron job failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual trigger (development/testing)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          timestamp,
          message: 'Invalid cron secret'
        },
        { status: 401 }
      );
    }

    console.log('🕐 Manual cron trigger started...', { timestamp });

    // Initialize cron service
    const cronService = new CronService();
    
    // Process all schedules
    const summary = await cronService.processAllSchedules();

    const duration = Date.now() - startTime;
    console.log('✅ Manual cron trigger completed:', { 
      ...summary, 
      duration: `${duration}ms` 
    });

    return NextResponse.json({
      success: summary.success,
      message: `Manual trigger completed - Processed ${summary.processed} schedules`,
      ...summary,
      duration: `${duration}ms`,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('❌ Manual cron trigger failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Manual cron trigger failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}
