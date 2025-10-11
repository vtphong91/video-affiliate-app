import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export async function POST(request: NextRequest) {
  try {
    // Get cron secret from headers
    const cronSecret = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret');
    
    // Verify cron secret
    if (cronSecret !== process.env.CRON_SECRET) {
      console.error('❌ Invalid cron secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Processing schedules...');
    
    // Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);

    if (pendingSchedules.length === 0) {
      return NextResponse.json({ 
        message: 'No pending schedules to process',
        processed: 0
      });
    }

    // Process schedules using CronService
    const summary = await CronService.processSchedules(pendingSchedules);
    
    console.log('✅ Schedule processing completed:', summary);

    return NextResponse.json({
      message: 'Schedules processed successfully',
      processed: summary.processed,
      success: summary.success,
      failed: summary.failed,
      details: summary.details
    });

  } catch (error) {
    console.error('❌ Error processing schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}